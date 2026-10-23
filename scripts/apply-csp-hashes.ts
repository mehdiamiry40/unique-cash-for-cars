import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  SCRIPT_HASH_PLACEHOLDER,
  extractInlineScriptSources,
  hashInlineScript,
} from "../src/lib/csp";
import { resolveGoogleMeasurement } from "../src/lib/google-measurement";

const SKIP_DIRECTORIES = new Set(["cache", "diagnostics", "trace"]);

function walk(directory: string, files: string[] = []) {
  if (!existsSync(directory)) return files;
  for (const entry of readdirSync(directory)) {
    if (SKIP_DIRECTORIES.has(entry)) continue;
    const path = join(directory, entry);
    const info = statSync(path);
    if (info.isDirectory()) {
      walk(path, files);
      continue;
    }
    files.push(path);
  }
  return files;
}

export type CspHashPassResult =
  | { status: "not-ready" }
  | { status: "already" }
  | { status: "patched"; hashCount: number; patchedFiles: number; policyLength: number };

/**
 * Fill the inline-script hash placeholder in the build output.
 *
 * `headers()` in next.config runs before pages are prerendered, so the hashes
 * are not knowable there. This pass reads the finished HTML and rewrites the
 * header value Next persists in the build output. It stays synchronous so it
 * can run from a process exit hook.
 */
export function applyInlineScriptCsp(projectRoot: string): CspHashPassResult {
  const manifestPath = join(projectRoot, ".next/routes-manifest.json");
  const homePath = join(projectRoot, ".next/server/app/index.html");
  if (!existsSync(manifestPath) || !existsSync(homePath)) {
    return { status: "not-ready" };
  }

  const manifest = readFileSync(manifestPath, "utf8");
  if (!manifest.includes(SCRIPT_HASH_PLACEHOLDER)) {
    if (manifest.includes("'sha256-")) return { status: "already" };
    return { status: "not-ready" };
  }

  const hashes = new Set<string>();
  const htmlFiles = walk(join(projectRoot, ".next/server")).filter((file) =>
    file.endsWith(".html"),
  );
  if (htmlFiles.length < 10) {
    throw new Error(`Expected the prerendered HTML to be present, found ${htmlFiles.length} files`);
  }

  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    for (const source of extractInlineScriptSources(html)) {
      hashes.add(hashInlineScript(source));
    }
  }

  hashes.add(hashInlineScript(resolveGoogleMeasurement().inlineScript));

  if (hashes.size < 3) {
    throw new Error(`CSP hash collection only found ${hashes.size} inline scripts`);
  }

  const hashList = [...hashes].sort().join(" ");
  let patchedFiles = 0;

  for (const file of walk(join(projectRoot, ".next"))) {
    if (!file.endsWith(".json") && !file.endsWith(".js")) continue;
    const info = statSync(file);
    if (info.size > 5_000_000) continue;
    const text = readFileSync(file, "utf8");
    if (!text.includes(SCRIPT_HASH_PLACEHOLDER)) continue;
    writeFileSync(file, text.replaceAll(SCRIPT_HASH_PLACEHOLDER, hashList));
    patchedFiles += 1;
  }

  if (patchedFiles === 0) {
    throw new Error("CSP hash placeholder was not written into any build file");
  }

  const policyLength = readFileSync(manifestPath, "utf8").match(
    /"key": "Content-Security-Policy",\s*"value": "([^"]*)"/,
  )?.[1]?.length;

  return {
    status: "patched",
    hashCount: hashes.size,
    patchedFiles,
    policyLength: policyLength ?? hashList.length,
  };
}

export function scheduleInlineScriptCsp(projectRoot: string) {
  // `exit` runs after Next has finished writing the prerender and the route
  // manifest. beforeExit is too early: Next still rewrites that manifest.
  process.on("exit", (code) => {
    if (code !== 0) return;
    try {
      const result = applyInlineScriptCsp(projectRoot);
      if (result.status !== "patched") return;
      process.stdout.write(
        `CSP: allowed ${result.hashCount} inline script hashes in ${result.patchedFiles} build file(s) ` +
          `(policy ${result.policyLength} bytes)\n`,
      );
    } catch (error) {
      process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    }
  });
}
