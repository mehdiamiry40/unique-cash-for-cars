import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/lib/quote-rate-limit.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "quote-rate-limit.ts",
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.deepEqual(
  errors.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")),
  [],
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`;
const { createFixedWindowLimiter } = await import(moduleUrl);

test("the limiter uses constant-size state for a hot key", () => {
  let now = 1_000;
  const limiter = createFixedWindowLimiter({
    maxKeys: 10,
    maxRequests: 2,
    now: () => now,
    windowMs: 60_000,
  });

  assert.equal(limiter.check("client-a").limited, false);
  assert.equal(limiter.check("client-a").limited, false);
  for (let attempt = 0; attempt < 1_000; attempt += 1) {
    assert.equal(limiter.check("client-a").limited, true);
  }

  now += 60_000;
  assert.equal(limiter.check("client-a").limited, false);
});

test("a rotating-key spray cannot evict and reset an active quota", () => {
  const limiter = createFixedWindowLimiter({
    maxKeys: 3,
    maxRequests: 2,
    now: () => 1_000,
    windowMs: 60_000,
  });

  assert.equal(limiter.check("client-a").limited, false);
  assert.equal(limiter.check("client-a").limited, false);
  assert.equal(limiter.check("client-b").limited, false);
  assert.equal(limiter.check("client-c").limited, false);
  assert.equal(limiter.check("rotating-client").limited, true);
  assert.equal(limiter.check("client-a").limited, true);
});

test("expired keys are removed and capacity becomes available", () => {
  let now = 1_000;
  const limiter = createFixedWindowLimiter({
    maxKeys: 1,
    maxRequests: 2,
    now: () => now,
    windowMs: 10_000,
  });

  assert.equal(limiter.check("client-a").limited, false);
  assert.equal(limiter.check("client-b").limited, true);
  now += 10_000;
  assert.equal(limiter.check("client-b").limited, false);
});
