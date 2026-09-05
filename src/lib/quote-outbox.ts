import { randomUUID } from "node:crypto";

import {
  claimDueQuotes,
  claimQuoteByLeadId,
  deadLetterExpiredFinalLeases,
  markQuoteAccepted,
  markQuoteFailure,
  MAX_QUOTE_DELIVERY_ATTEMPTS,
  QUOTE_DATABASE_TIMEOUT_MS,
  purgeExpiredQuoteLeads,
  quoteOutboxHealth,
  type ClaimedQuote,
} from "./quote-lead-store";
import {
  deliverQuote,
  type QuoteDeliveryProvider,
  type QuoteDeliverySettings,
} from "./quote-delivery";
import { buildQuoteEmail } from "./quote-email";
import { quoteRetryDecision } from "./quote-outbox-policy";

export type QuoteProcessingOutcome =
  | "accepted"
  | "retry_scheduled"
  | "dead_lettered"
  | "not_claimed"
  | "finalize_conflict";

export const QUOTE_WORKER_BUDGET_MS = 45_000;
const PROVIDER_TIMEOUT_MS = 10_000;
const MAINTENANCE_BUDGET_MS = 2 * QUOTE_DATABASE_TIMEOUT_MS;
const ITEM_BUDGET_MS = PROVIDER_TIMEOUT_MS + 2 * QUOTE_DATABASE_TIMEOUT_MS;

type OutboxEvent = Readonly<Record<string, string | number | boolean | undefined>>;
type OutboxDependencies = Readonly<{
  now: () => Date;
  random: () => number;
  claimDueQuotes: typeof claimDueQuotes;
  claimQuoteByLeadId: typeof claimQuoteByLeadId;
  deadLetterExpiredFinalLeases: typeof deadLetterExpiredFinalLeases;
  markQuoteAccepted: typeof markQuoteAccepted;
  markQuoteFailure: typeof markQuoteFailure;
  deliverQuote: typeof deliverQuote;
  purgeExpiredQuoteLeads: typeof purgeExpiredQuoteLeads;
  quoteOutboxHealth: typeof quoteOutboxHealth;
  report: (level: "info" | "error", event: OutboxEvent) => void;
}>;

function reference(leadId: string) {
  return leadId.split("-", 1)[0].slice(0, 8).toUpperCase();
}

function settingsForProvider(provider: QuoteDeliveryProvider): QuoteDeliverySettings {
  if (provider === "webhook") {
    return { webhookUrl: process.env.QUOTE_WEBHOOK_URL };
  }

  return {
    resendApiKey: process.env.RESEND_API_KEY,
    toEmail: process.env.QUOTE_TO_EMAIL,
    fromEmail: process.env.QUOTE_FROM_EMAIL,
  };
}

function report(level: "info" | "error", event: OutboxEvent) {
  const line = JSON.stringify({ event: "quote_outbox", ...event });
  if (level === "error") console.error(line);
  else console.info(line);
}

function dependencies(overrides: Partial<OutboxDependencies>): OutboxDependencies {
  return {
    now: () => new Date(),
    random: Math.random,
    claimDueQuotes,
    claimQuoteByLeadId,
    deadLetterExpiredFinalLeases,
    markQuoteAccepted,
    markQuoteFailure,
    deliverQuote,
    purgeExpiredQuoteLeads,
    quoteOutboxHealth,
    report,
    ...overrides,
  };
}

async function processClaimedQuote(
  quote: ClaimedQuote,
  dependencies: OutboxDependencies,
): Promise<QuoteProcessingOutcome> {
  const email = buildQuoteEmail(quote.lead);
  const result = await dependencies.deliverQuote({
    settings: settingsForProvider(quote.provider),
    lead: quote.lead,
    email,
    idempotencyKey: `quote/${quote.lead.leadId}`,
    timeoutMs: PROVIDER_TIMEOUT_MS,
  });

  if (result.ok) {
    const finalized = await dependencies.markQuoteAccepted(quote, {
      httpStatus: result.status,
      providerReceiptId: result.providerReceiptId,
    });
    dependencies.report(finalized ? "info" : "error", {
      outcome: finalized ? "accepted" : "finalize_conflict",
      provider: quote.provider,
      reference: reference(quote.lead.leadId),
      attempt: quote.attempts,
    });
    return finalized ? "accepted" : "finalize_conflict";
  }

  const decision = quoteRetryDecision(
    result,
    quote.attempts,
    MAX_QUOTE_DELIVERY_ATTEMPTS,
    dependencies.random,
  );
  const retryAt = new Date(
    dependencies.now().getTime() + decision.delaySeconds * 1_000,
  );
  const finalized = await dependencies.markQuoteFailure(quote, {
    retry: decision.retry,
    retryAt,
    reason: result.reason,
    httpStatus: result.status,
    consumeAttempt: decision.consumeAttempt,
  });
  const outcome = finalized
    ? decision.retry
      ? "retry_scheduled"
      : "dead_lettered"
    : "finalize_conflict";

  dependencies.report(outcome === "retry_scheduled" ? "info" : "error", {
    outcome,
    provider: quote.provider,
    reference: reference(quote.lead.leadId),
    attempt: quote.attempts,
    reason: result.reason,
    status: result.status,
    retryInSeconds: decision.retry ? decision.delaySeconds : undefined,
  });
  return outcome;
}

export async function processQuoteLeadNow(
  leadId: string,
  dependencyOverrides: Partial<OutboxDependencies> = {},
) {
  const deps = dependencies(dependencyOverrides);
  const quote = await deps.claimQuoteByLeadId(leadId, randomUUID());
  if (!quote) return "not_claimed" as const;
  try {
    return await processClaimedQuote(quote, deps);
  } catch {
    deps.report("error", {
      outcome: "immediate_worker_error",
      provider: quote.provider,
      reference: reference(leadId),
      attempt: quote.attempts,
    });
    // Keep the lease: the provider may have accepted before persistence failed.
    throw new Error("Immediate quote worker failed.");
  }
}

export async function processDueQuoteLeads(
  limit = 10,
  dependencyOverrides: Partial<OutboxDependencies> = {},
  options: Readonly<{ deadlineMs?: number }> = {},
) {
  const deps = dependencies(dependencyOverrides);
  const startedAt = deps.now().getTime();
  const callerDeadline = options.deadlineMs ?? startedAt + QUOTE_WORKER_BUDGET_MS;
  const deadline = Math.min(
    Number.isFinite(callerDeadline) ? callerDeadline : startedAt,
    startedAt + QUOTE_WORKER_BUDGET_MS,
  );
  const remaining = () => deadline - deps.now().getTime();
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.min(25, Math.floor(limit))) : 0;
  const counts = {
    claimed: 0,
    accepted: 0,
    retryScheduled: 0,
    deadLettered: 0,
    finalizeConflicts: 0,
    errors: 0,
    deadlineReached: false,
  };

  if (remaining() >= QUOTE_DATABASE_TIMEOUT_MS + MAINTENANCE_BUDGET_MS) {
    try {
      const expired = await deps.deadLetterExpiredFinalLeases();
      counts.deadLettered = expired.length;
      for (const failure of expired) {
        deps.report("error", {
          outcome: "dead_lettered",
          provider: failure.provider,
          reference: reference(failure.leadId),
          attempt: failure.attempts,
          reason: failure.reason,
        });
      }
    } catch {
      counts.errors += 1;
      deps.report("error", { outcome: "worker_error", phase: "expired_leases" });
    }
  }

  while (counts.claimed < safeLimit) {
    // A claim consumes an attempt. Claim only the next item, and only when its
    // entire claim/send/finalize budget plus maintenance fits the deadline.
    if (remaining() < ITEM_BUDGET_MS + MAINTENANCE_BUDGET_MS) {
      counts.deadlineReached = true;
      break;
    }
    let quote: ClaimedQuote | undefined;
    try {
      [quote] = await deps.claimDueQuotes(1, randomUUID());
    } catch {
      counts.errors += 1;
      deps.report("error", { outcome: "worker_error", phase: "claim" });
      break;
    }
    if (!quote) break;
    counts.claimed += 1;
    try {
      const outcome = await processClaimedQuote(quote, deps);
      if (outcome === "accepted") counts.accepted += 1;
      else if (outcome === "retry_scheduled") counts.retryScheduled += 1;
      else if (outcome === "dead_lettered") counts.deadLettered += 1;
      else if (outcome === "finalize_conflict") counts.finalizeConflicts += 1;
    } catch {
      counts.errors += 1;
      deps.report("error", {
        outcome: "worker_error",
        phase: "delivery_or_finalize",
        provider: quote.provider,
        reference: reference(quote.lead.leadId),
        attempt: quote.attempts,
      });
      // Preserve lease ownership after an uncertain send/finalization. Recovery
      // checks provider replay safety before another claim is allowed.
    }
  }

  let purged = 0;
  let health: Awaited<ReturnType<typeof quoteOutboxHealth>> | null = null;
  if (remaining() >= MAINTENANCE_BUDGET_MS) {
    try {
      purged = await deps.purgeExpiredQuoteLeads();
    } catch {
      counts.errors += 1;
      deps.report("error", { outcome: "worker_error", phase: "purge" });
    }
  }
  if (remaining() >= QUOTE_DATABASE_TIMEOUT_MS) {
    try {
      health = await deps.quoteOutboxHealth();
    } catch {
      counts.errors += 1;
      deps.report("error", { outcome: "worker_error", phase: "health" });
    }
  }
  return { ...counts, purged, health, durationMs: Math.max(0, deps.now().getTime() - startedAt) };
}
