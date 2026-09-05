import { neon } from "@neondatabase/serverless";

export const QUOTE_OBSERVABILITY_DB_TIMEOUT_MS = 1_500;

// Both the HTTP request and the PostgreSQL statement have a deadline. A timed
// out write may have committed; callers must use leases/CAS and retry safely.
export async function boundedQuoteQuery(
  statement: string,
  parameters: unknown[] = [],
  timeoutMs = QUOTE_OBSERVABILITY_DB_TIMEOUT_MS,
): Promise<Record<string, unknown>[]> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("Quote monitoring is not configured.");
  const sql = neon(connectionString);
  const result = await quoteOperationWithTimeout(timeoutMs, (signal) =>
    sql.transaction(
      (tx) => [
        tx.query("SELECT set_config('statement_timeout', $1, true)", [
          String(Math.max(100, timeoutMs - 100)),
        ]),
        tx.query(statement, parameters),
      ],
      { fetchOptions: { signal } },
    ),
  );
  return result[1] as Record<string, unknown>[];
}

export async function quoteOperationWithTimeout<T>(
  timeoutMs: number,
  operation: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error("Quote monitoring timed out.");
      error.name = "TimeoutError";
      controller.abort(error);
      reject(error);
    }, Math.max(1, timeoutMs));
  });
  try {
    return await Promise.race([operation(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
