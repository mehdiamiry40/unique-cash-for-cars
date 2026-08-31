import type { QuoteEmailLead } from "./quote-email";

export type QuoteDeliveryProvider = "webhook" | "resend";

export type QuoteDeliverySettings = Readonly<{
  webhookUrl?: string;
  resendApiKey?: string;
  toEmail?: string;
  fromEmail?: string;
}>;

export type QuoteDeliveryFailureReason =
  | "missing_configuration"
  | "ambiguous_configuration"
  | "incomplete_resend_configuration"
  | "invalid_idempotency_key"
  | "http_error"
  | "timeout"
  | "fetch_error";

export type QuoteDeliveryEvent = Readonly<{
  event: "quote_delivery";
  provider: QuoteDeliveryProvider | "configuration";
  outcome: "success" | "failure";
  durationMs: number;
  reference: string;
  reason?: QuoteDeliveryFailureReason;
  status?: number;
}>;

type ResolvedDelivery =
  | Readonly<{ ok: true; provider: "webhook"; webhookUrl: string }>
  | Readonly<{
      ok: true;
      provider: "resend";
      resendApiKey: string;
      toEmail: string;
      fromEmail: string;
    }>
  | Readonly<{
      ok: false;
      provider: "configuration";
      reason:
        | "missing_configuration"
        | "ambiguous_configuration"
        | "incomplete_resend_configuration";
    }>;

export type QuoteDeliveryResult =
  | Readonly<{
      ok: true;
      provider: QuoteDeliveryProvider;
      status: number;
      providerReceiptId?: string;
    }>
  | Readonly<{
      ok: false;
      provider: QuoteDeliveryProvider | "configuration";
      reason: QuoteDeliveryFailureReason;
      status?: number;
      retryAfterSeconds?: number;
    }>;

type QuoteDeliveryDependencies = Readonly<{
  fetch: typeof globalThis.fetch;
  now: () => number;
  report: (event: QuoteDeliveryEvent) => void;
  timeoutSignal: (milliseconds: number) => AbortSignal;
}>;

const DEFAULT_FROM_EMAIL = "Unique Cash for Cars <onboarding@resend.dev>";
const DEFAULT_TIMEOUT_MS = 10_000;

function setting(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function resolveQuoteDelivery(
  settings: QuoteDeliverySettings,
): ResolvedDelivery {
  const webhookUrl = setting(settings.webhookUrl);
  const resendApiKey = setting(settings.resendApiKey);
  const toEmail = setting(settings.toEmail);
  const fromEmail = setting(settings.fromEmail) ?? DEFAULT_FROM_EMAIL;
  const hasAnyResendSetting = Boolean(resendApiKey || toEmail);

  if (webhookUrl && hasAnyResendSetting) {
    return {
      ok: false,
      provider: "configuration",
      reason: "ambiguous_configuration",
    };
  }

  if (webhookUrl) {
    return { ok: true, provider: "webhook", webhookUrl };
  }

  if (resendApiKey && toEmail) {
    return {
      ok: true,
      provider: "resend",
      resendApiKey,
      toEmail,
      fromEmail,
    };
  }

  if (hasAnyResendSetting) {
    return {
      ok: false,
      provider: "configuration",
      reason: "incomplete_resend_configuration",
    };
  }

  return {
    ok: false,
    provider: "configuration",
    reason: "missing_configuration",
  };
}

function defaultReport(event: QuoteDeliveryEvent) {
  const line = JSON.stringify(event);
  if (event.outcome === "failure") {
    console.error(line);
  } else {
    console.info(line);
  }
}

function failureReason(error: unknown): "timeout" | "fetch_error" {
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  ) {
    return "timeout";
  }

  return "fetch_error";
}

function leadReference(leadId: string) {
  return leadId.split("-", 1)[0].slice(0, 8).toUpperCase();
}

function validIdempotencyKey(value: string) {
  return /^[A-Za-z0-9_./:-]{1,128}$/.test(value);
}

function retryAfterSeconds(response: Response) {
  const value = response.headers.get("retry-after")?.trim();
  if (!value || !/^\d+$/.test(value)) return undefined;
  const seconds = Number(value);
  return Number.isSafeInteger(seconds) && seconds > 0
    ? Math.min(3_600, seconds)
    : undefined;
}

async function resendReceiptId(response: Response) {
  try {
    const value: unknown = await response.json();
    if (!value || typeof value !== "object" || !("id" in value)) return undefined;
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" && /^[A-Za-z0-9_-]{1,255}$/.test(id)
      ? id
      : undefined;
  } catch {
    return undefined;
  }
}

export async function deliverQuote(
  input: Readonly<{
    settings: QuoteDeliverySettings;
    lead: QuoteEmailLead;
    email: Readonly<{ subject: string; text: string }>;
    idempotencyKey: string;
    timeoutMs?: number;
  }>,
  dependencyOverrides: Partial<QuoteDeliveryDependencies> = {},
): Promise<QuoteDeliveryResult> {
  const dependencies: QuoteDeliveryDependencies = {
    fetch: dependencyOverrides.fetch ?? globalThis.fetch,
    now: dependencyOverrides.now ?? Date.now,
    report: dependencyOverrides.report ?? defaultReport,
    timeoutSignal:
      dependencyOverrides.timeoutSignal ??
      ((milliseconds) => AbortSignal.timeout(milliseconds)),
  };
  const startedAt = dependencies.now();
  const reference = leadReference(input.lead.leadId);
  const resolved = resolveQuoteDelivery(input.settings);

  if (!resolved.ok) {
    const event: QuoteDeliveryEvent = {
      event: "quote_delivery",
      provider: "configuration",
      outcome: "failure",
      durationMs: Math.max(0, dependencies.now() - startedAt),
      reference,
      reason: resolved.reason,
    };
    dependencies.report(event);
    return resolved;
  }

  if (!validIdempotencyKey(input.idempotencyKey)) {
    const result = {
      ok: false,
      provider: resolved.provider,
      reason: "invalid_idempotency_key",
    } as const;
    dependencies.report({
      event: "quote_delivery",
      provider: resolved.provider,
      outcome: "failure",
      durationMs: Math.max(0, dependencies.now() - startedAt),
      reference,
      reason: result.reason,
    });
    return result;
  }

  try {
    const response =
      resolved.provider === "webhook"
        ? await dependencies.fetch(resolved.webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": input.idempotencyKey,
              "X-Quote-Lead-Id": input.lead.leadId,
            },
            body: JSON.stringify(input.lead),
            signal: dependencies.timeoutSignal(
              input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
            ),
          })
        : await dependencies.fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resolved.resendApiKey}`,
              "Content-Type": "application/json",
              "Idempotency-Key": input.idempotencyKey,
            },
            body: JSON.stringify({
              from: resolved.fromEmail,
              to: [resolved.toEmail],
              subject: input.email.subject,
              text: input.email.text,
            }),
            signal: dependencies.timeoutSignal(
              input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
            ),
          });

    if (!response.ok) {
      const event: QuoteDeliveryEvent = {
        event: "quote_delivery",
        provider: resolved.provider,
        outcome: "failure",
        durationMs: Math.max(0, dependencies.now() - startedAt),
        reference,
        reason: "http_error",
        status: response.status,
      };
      dependencies.report(event);
      return {
        ok: false,
        provider: resolved.provider,
        reason: "http_error",
        status: response.status,
        retryAfterSeconds: retryAfterSeconds(response),
      };
    }

    const providerReceiptId =
      resolved.provider === "resend"
        ? await resendReceiptId(response)
        : undefined;

    dependencies.report({
      event: "quote_delivery",
      provider: resolved.provider,
      outcome: "success",
      durationMs: Math.max(0, dependencies.now() - startedAt),
      reference,
    });
    return {
      ok: true,
      provider: resolved.provider,
      status: response.status,
      ...(providerReceiptId ? { providerReceiptId } : {}),
    };
  } catch (error) {
    const reason = failureReason(error);
    dependencies.report({
      event: "quote_delivery",
      provider: resolved.provider,
      outcome: "failure",
      durationMs: Math.max(0, dependencies.now() - startedAt),
      reference,
      reason,
    });
    return { ok: false, provider: resolved.provider, reason };
  }
}
