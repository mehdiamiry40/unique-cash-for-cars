import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const migrationId = "001_quote_outbox";
const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() ?? process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "DATABASE_URL_UNPOOLED or DATABASE_URL is required to run migrations.",
  );
}

const sql = neon(connectionString);
const source = await readFile(
  new URL("../db/migrations/001_quote_outbox.sql", import.meta.url),
  "utf8",
);
const statements = source
  .split(/^\s*-- migrate:split\s*$/m)
  .map((statement) => statement.trim())
  .filter(Boolean);

await sql.transaction((tx) => [
  tx`SELECT pg_advisory_xact_lock(836274910552011::bigint)`,
  ...statements.map((statement) => tx.query(statement)),
  tx`
    INSERT INTO app_migrations (migration_id)
    VALUES (${migrationId})
    ON CONFLICT (migration_id) DO NOTHING
  `,
]);

const rows = await sql`
  SELECT applied_at::text AS applied_at
  FROM app_migrations
  WHERE migration_id = ${migrationId}
`;

if (rows.length !== 1) {
  throw new Error(`Migration ${migrationId} was not recorded.`);
}

console.log(`Migration ${migrationId} is applied.`);
