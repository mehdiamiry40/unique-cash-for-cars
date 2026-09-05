import { readFile, readdir } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required to run migrations.");
}

const directory = new URL("../db/migrations/", import.meta.url);
const names = (await readdir(directory))
  .filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name))
  .sort();
if (names.length === 0) throw new Error("No repository migrations found.");

// Source SQL is repository-owned. The ledger guard executes under the same
// transaction advisory lock as the DDL, so concurrent runners cannot reapply it.
const migrations = await Promise.all(names.map(async (name) => {
  const id = name.slice(0, -4);
  const source = await readFile(new URL(name, directory), "utf8");
  const tag = "$ucfc_migration$";
  if (source.includes(tag)) throw new Error(`Reserved SQL delimiter in ${name}.`);
  return { id, statement: `DO ${tag}
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM app_migrations WHERE migration_id = '${id}') THEN
        ${source}
        INSERT INTO app_migrations (migration_id) VALUES ('${id}');
      END IF;
    END;
    ${tag};` };
}));

const sql = neon(connectionString);
await sql.transaction((tx) => [
  tx`SELECT pg_advisory_xact_lock(836274910552011::bigint)`,
  tx`CREATE TABLE IF NOT EXISTS app_migrations (
    migration_id text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`,
  ...migrations.map(({ statement }) => tx.query(statement)),
]);

const rows = await sql`SELECT migration_id FROM app_migrations`;
for (const { id } of migrations) {
  if (!rows.some((row) => row.migration_id === id)) {
    throw new Error(`Migration ${id} was not recorded.`);
  }
  console.log(`Migration ${id} is applied.`);
}
