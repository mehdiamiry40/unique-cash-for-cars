import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";

export function isolatedDatabaseUrl() {
  const raw = process.env.QUOTE_TEST_DATABASE_URL;
  if (!raw) throw new Error("Set QUOTE_TEST_DATABASE_URL to a disposable localhost database named quote_outbox_test. DATABASE_URL is never used.");
  const url = new URL(raw);
  assert.ok(["postgres:", "postgresql:"].includes(url.protocol), "PostgreSQL URL required");
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(url.hostname), "Integration tests refuse remote databases");
  assert.equal(url.pathname, "/quote_outbox_test", "Integration tests require the dedicated quote_outbox_test database");
  assert.equal(url.search, "", "Integration tests refuse connection overrides");
  assert.equal(url.hash, "", "Integration tests refuse connection fragments");
  return raw;
}

export async function postgresFixture(migrations = ["001_quote_outbox.sql"]) {
  const connectionString = isolatedDatabaseUrl();
  const schema = `quote_test_${randomUUID().replaceAll("-", "")}`;
  const admin = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 3_000 });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const pool = new pg.Pool({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 3_000,
    options: `-c search_path=${schema} -c statement_timeout=5000 -c lock_timeout=4000`,
  });
  const queries = [];
  // Runtime source receives only this sentinel; the adapter owns the separately
  // validated localhost connection and never forwards a production credential.
  const sentinel = "postgres://fixture.invalid/quote_outbox_test";
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = sentinel;
  const neon = (receivedConnection) => {
    assert.equal(receivedConnection, sentinel, "Unexpected application database configuration in test");
    const describe = (text, values = []) => ({ text, values });
    const tagged = (strings, values) => describe(
      strings.reduce((text, part, index) => text + part + (index < values.length ? `$${index + 1}` : ""), ""),
      values,
    );
    const sql = async (strings, ...values) => {
      const query = tagged(strings, values);
      return (await pool.query(query.text, query.values)).rows;
    };
    sql.query = async (text, values = []) => (await pool.query(text, values)).rows;
    sql.transaction = async (callback) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const tx = (strings, ...values) => tagged(strings, values);
        tx.query = describe;
        const statements = typeof callback === "function" ? callback(tx) : callback;
        const results = [];
        for (const statement of statements) {
          queries.push(statement.text);
          results.push((await client.query(statement.text, statement.values)).rows);
        }
        await client.query("COMMIT");
        return results;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    };
    return sql;
  };
  const close = async () => {
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
    await pool.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  };
  try {
    for (const migration of migrations) {
      assert.match(migration, /^\d{3}_[a-z_]+\.sql$/);
      const source = readFileSync(new URL(`../../db/migrations/${migration}`, import.meta.url), "utf8");
      for (const statement of source.split(/--\s*migrate:split\s*/).map((item) => item.trim()).filter(Boolean)) {
        await pool.query(statement);
      }
    }
  } catch (error) {
    await close();
    throw error;
  }
  return { pool, neon, close, queries, schema };
}
