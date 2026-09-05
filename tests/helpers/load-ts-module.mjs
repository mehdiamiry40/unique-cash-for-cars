import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

// Execute the actual TypeScript module and its local dependencies. Explicit
// adapters replace external boundaries; production endpoints are never used.
export function loadTypeScriptModule(file, replacements = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
      reportDiagnostics: true,
    });
    assert.deepEqual(
      (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error),
      [],
    );
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const externalRequire = createRequire(filename);
    const require = (specifier) => {
      if (Object.hasOwn(replacements, specifier)) return replacements[specifier];
      if (specifier.startsWith(".")) {
        return load(path.resolve(path.dirname(filename), `${specifier}.ts`));
      }
      return externalRequire(specifier);
    };
    new Function("exports", "require", "module", compiled.outputText)(loadedModule.exports, require, loadedModule);
    return loadedModule.exports;
  }
  return load(file);
}
