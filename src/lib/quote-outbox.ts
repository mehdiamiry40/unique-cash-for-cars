import { randomUUID } from "node:crypto";

import {
  claimDueQuotes,
  claimQuoteByLeadId,
  deadLetterExpiredFinalLeases,
  markQuoteAccepted,
  markQuoteFailure,
  MAX_QUOTE_DELIVERY_ATTEMPTS,
  purgeExpiredQuoteLeads,
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

type OutboxDependencies = Readonly<{
  now: () => Date;
  random: () => number;
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

function report(
  level: "info" | "error",
  event: Readonly<Record<string, string | number | boolean | undefined>>,
) {
  const line = JSON.stringify({ event: "quote_outbox", ...event });
  if (level === "error") console.error(line);
  else console.info(line);
}

async function processClaimedQuote(
  quote: ClaimedQuote,
  dependencies: OutboxDependencies,
): Promise<QuoteProcessingOutcome> {
  const email = buildQuoteEmail(quote.lead);
  const result = await deliverQuote({
    settings: settingsForProvider(quote.provider),
    lead: quote.lead,
    email,
    idempotencyKey: `quote/${quote.lead.leadId}`,
  });

  if (result.ok) {
    const finalized = await markQuoteAccepted(quote, {
      httpStatus: result.status,
      providerReceiptId: result.providerReceiptId,
    });
    report(finalized ? "info" : "error", {
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
  const finalized = await markQuoteFailure(quote, {
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

  report(outcome === "retry_scheduled" ? "info" : "error", {
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
  const dependencies: OutboxDependencies = {
    now: dependencyOverrides.now ?? (() => new Date()),
    random: dependencyOverrides.random ?? Math.random,
  };
  const leaseToken = randomUUID();
  const quote = await claimQuoteByLeadId(leadId, leaseToken);
  if (!quote) return "not_claimed" as const;
  return processClaimedQuote(quote, dependencies);
}

export async function processDueQuoteLeads(
  limit = 10,
  dependencyOverrides: Partial<OutboxDependencies> = {},
) {
  const dependencies: OutboxDependencies = {
    now: dependencyOverrides.now ?? (() => new Date()),
    random: dependencyOverrides.random ?? Math.random,
  };
  const expiredFinalLeases = await deadLetterExpiredFinalLeases();
  const leaseToken = randomUUID();
  const quotes = await claimDueQuotes(limit, leaseToken);
  const counts = {
    claimed: quotes.length,
    accepted: 0,
    retryScheduled: 0,
    deadLettered: expiredFinalLeases,
    finalizeConflicts: 0,
    errors: 0,
  };

  for (const quote of quotes) {
    try {
      const outcome = await processClaimedQuote(quote, dependencies);
      if (outcome === "accepted") counts.accepted += 1;
      else if (outcome === "retry_scheduled") counts.retryScheduled += 1;
      else if (outcome === "dead_lettered") counts.deadLettered += 1;
      else if (outcome === "finalize_conflict") counts.finalizeConflicts += 1;
    } catch {
      counts.errors += 1;
      report("error", {
        outcome: "worker_error",
        provider: quote.provider,
        reference: reference(quote.lead.leadId),
        attempt: quote.attempts,
      });
      // Keep the processing lease intact. If the process dies or storage is
      // unavailable, a later worker reclaims the row after the lease expires.
    }
  }

  const purged = await purgeExpiredQuoteLeads();
  return { ...counts, purged };
}
