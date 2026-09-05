import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { postgresFixture } from "./helpers/postgres-fixture.mjs";

// Execute the actual top-level migration runner with only the external driver
// and file URL bound to the isolated fixture. DDL, locking and ledger behavior
// are not reimplemented by this test.
async function runMigrationScript(neon) {
  const scriptUrl = new URL("../scripts/migrate-db.mjs", import.meta.url);
  const key = `migrationFixture_${randomUUID().replaceAll("-", "")}`;
  let source = await readFile(scriptUrl, "utf8");
  assert.ok(source.includes('import { neon } from "@neondatabase/serverless";'));
  source = source
    .replace('import { neon } from "@neondatabase/serverless";', `const { neon, report } = globalThis[${JSON.stringify(key)}];`)
    .replaceAll("import.meta.url", JSON.stringify(scriptUrl.href))
    .replaceAll("console.log(", "report(");
  const reports = [];
  globalThis[key] = { neon, report: (line) => reports.push(line) };
  try {
    await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
    return reports;
  } finally {
    delete globalThis[key];
  }
}

test("actual migration runner applies, replays and serializes concurrent runs in isolated PostgreSQL", async (t) => {
  const fixture = await postgresFixture([]);
  t.after(fixture.close);
  const previousUnpooled = process.env.DATABASE_URL_UNPOOLED;
  process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
  t.after(() => {
    if (previousUnpooled === undefined) delete process.env.DATABASE_URL_UNPOOLED;
    else process.env.DATABASE_URL_UNPOOLED = previousUnpooled;
  });
  const { pool } = fixture;

  await t.test("fresh concurrent runners create each repository migration exactly once", async () => {
    const reports = await Promise.all(Array.from({ length: 4 }, () => runMigrationScript(fixture.neon)));
    const rows = (await pool.query("SELECT migration_id FROM app_migrations ORDER BY migration_id")).rows;
    assert.ok(rows.some((row) => row.migration_id === "001_quote_outbox"));
    assert.ok(rows.some((row) => row.migration_id.startsWith("002_")));
    assert.equal(new Set(rows.map((row) => row.migration_id)).size, rows.length);
    for (const report of reports) assert.equal(report.length, rows.length);
    assert.ok((await pool.query("SELECT to_regclass('quote_leads') AS table_name")).rows[0].table_name);
    assert.ok((await pool.query("SELECT to_regclass('quote_worker_health') AS table_name")).rows[0].table_name);
  });

  await t.test("replay keeps migration timestamps and previously stored records unchanged", async () => {
    await pool.query(`INSERT INTO quote_leads (
      lead_id, payload_sha256, name, phone, suburb, vehicle, expected_price,
      vehicle_condition, received_at, purge_after
    ) VALUES ($1, $2, 'Migration Fixture', '0400 000 000', 'Example', 'Example car',
      'Not sure', 'Runs', now(), now() + interval '12 months')`, [randomUUID(), "a".repeat(64)]);
    const before = (await pool.query("SELECT migration_id, applied_at FROM app_migrations ORDER BY migration_id")).rows;
    await runMigrationScript(fixture.neon);
    const after = (await pool.query("SELECT migration_id, applied_at FROM app_migrations ORDER BY migration_id")).rows;
    assert.deepEqual(after, before);
    assert.equal((await pool.query("SELECT count(*)::int AS total FROM quote_leads")).rows[0].total, 1);
  });
});
