import type { QuoteDeliveryResult } from "./quote-delivery";

export const MAX_RETRY_DELAY_SECONDS = 60 * 60;

export type QuoteRetryDecision = Readonly<{
  retry: boolean;
  delaySeconds: number;
  consumeAttempt: boolean;
}>;

function retryableHttpStatus(status: number | undefined) {
  return status === 408 || status === 429 || (status !== undefined && status >= 500);
}

export function quoteRetryDecision(
  result: Extract<QuoteDeliveryResult, { ok: false }>,
  attempt: number,
  maxAttempts: number,
  random = Math.random,
): QuoteRetryDecision {
  if (result.provider === "configuration") {
    return {
      retry: true,
      delaySeconds: Math.min(
        MAX_RETRY_DELAY_SECONDS,
        Math.max(300, result.retryAfterSeconds ?? 0),
      ),
      consumeAttempt: false,
    };
  }

  const retryable =
    result.provider === "resend"
      ? result.reason === "timeout" ||
        result.reason === "fetch_error" ||
        (result.reason === "http_error" && retryableHttpStatus(result.status))
      : result.reason === "http_error" && result.status === 429;

  if (!retryable || attempt >= maxAttempts) {
    return { retry: false, delaySeconds: 0, consumeAttempt: true };
  }

  const exponent = Math.max(0, Math.min(10, attempt - 1));
  const ceiling = Math.min(MAX_RETRY_DELAY_SECONDS, 60 * 2 ** exponent);
  const jitter = Math.max(1, Math.ceil(Math.max(0, Math.min(1, random())) * ceiling));
  const retryAfter = Math.max(0, result.retryAfterSeconds ?? 0);

  return {
    retry: true,
    delaySeconds: Math.min(MAX_RETRY_DELAY_SECONDS, Math.max(jitter, retryAfter)),
    consumeAttempt: true,
  };
}
