import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  SCRIPT_HASH_PLACEHOLDER,
  extractInlineScriptSources,
  hashInlineScript,
} from "../src/lib/csp.ts";
import { resolveGoogleMeasurement } from "../src/lib/google-measurement.ts";

const SKIP_DIRECTORIES = new Set(["cache", "diagnostics", "trace", "node_modules"]);
const PATCHABLE = /\.(?:json|js|mjs|cjs)$/;
const MAX_PATCH_BYTES = 32_000_000;

function walk(directory, files = []) {
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

function isHomepageHtml(file) {
  const normalized = file.replaceAll("\\", "/");
  // Adapter builds use route-cache/.../$/index.html. The cache key is
  // `$` plus the normalized path; a template literal's `$$` is one `$`.
  return (
    normalized.endsWith("/server/app/index.html") ||
    normalized.endsWith("/$/index.html")
  );
}

/**
 * Vercel sets NEXT_ADAPTER_PATH, and Next then writes prerendered HTML under
 * `.next/server/route-cache/...` instead of `.next/server/app/<route>.html`.
 * Both layouts are hashed here.
 */
export function collectInlineScriptHashes(distDir) {
  const serverDir = join(distDir, "server");
  const htmlFiles = walk(serverDir).filter((file) => file.endsWith(".html"));
  if (htmlFiles.length < 10) {
    throw new Error(
      `CSP hash pass found ${htmlFiles.length} prerendered HTML files under ${serverDir}`,
    );
  }

  const hashes = new Set();
  let homeFile = null;
  let homeScripts = 0;
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const sources = extractInlineScriptSources(html);
    if (isHomepageHtml(file)) {
      homeFile = file;
      homeScripts = sources.length;
    }
    for (const source of sources) hashes.add(hashInlineScript(source));
  }

  if (!homeFile) {
    const sample = htmlFiles
      .slice(0, 8)
      .map((file) => file.replaceAll("\\", "/"))
      .join("\n");
    throw new Error(
      `CSP hash pass could not find the homepage HTML under ${serverDir}. Sample:\n${sample}`,
    );
  }
  if (homeScripts < 3) {
    throw new Error(
      `CSP hash pass expected the homepage inline scripts, found ${homeScripts} in ${homeFile}`,
    );
  }

  hashes.add(hashInlineScript(resolveGoogleMeasurement().inlineScript));
  if (hashes.size < 3) {
    throw new Error(`CSP hash collection only found ${hashes.size} inline scripts`);
  }

  return { hashes, htmlFiles, homeFile, homeScripts };
}

function replacePlaceholder(value, placeholder, replacement) {
  if (typeof value === "string") {
    return value.includes(placeholder) ? value.replaceAll(placeholder, replacement) : value;
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      value[index] = replacePlaceholder(value[index], placeholder, replacement);
    }
    return value;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      value[key] = replacePlaceholder(value[key], placeholder, replacement);
    }
  }
  return value;
}

function contentSecurityPolicies(value, found = []) {
  if (typeof value === "string") {
    if (value.includes("script-src") || value.includes("sha256-AAAAAAAAAAAA")) found.push(value);
    return found;
  }
  if (Array.isArray(value)) {
    for (const entry of value) contentSecurityPolicies(entry, found);
    return found;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) contentSecurityPolicies(entry, found);
  }
  return found;
}

export function deploymentOutputConfigs(projectRoot, distDir) {
  const outputDir = resolveDistDir(projectRoot, distDir);
  const candidates = [
    // Next 16's Vercel adapter writes the Build Output here. The builder
    // reads it after `npm run build` returns.
    join(outputDir, "output/config.json"),
    join(projectRoot, ".vercel/output/config.json"),
    "/vercel/output/config.json",
  ];
  return candidates.filter((file, index) => existsSync(file) && candidates.indexOf(file) === index);
}

function patchBuildFiles(distDir, placeholder, hashList) {
  let patchedFiles = 0;
  for (const file of walk(distDir)) {
    if (!PATCHABLE.test(file)) continue;
    const info = statSync(file);
    if (info.size > MAX_PATCH_BYTES) continue;
    const text = readFileSync(file, "utf8");
    if (!text.includes(placeholder)) continue;
    writeFileSync(file, text.replaceAll(placeholder, hashList));
    patchedFiles += 1;
  }
  return patchedFiles;
}

function resolveDistDir(projectRoot, distDir) {
  if (distDir) return distDir;
  if (process.env.NEXT_DIST_DIR) return join(projectRoot, process.env.NEXT_DIST_DIR);
  return join(projectRoot, ".next");
}

function policyFromManifest(distDir) {
  const manifestPath = join(distDir, "routes-manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`CSP hash pass could not read ${manifestPath}`);
  }
  const manifest = readFileSync(manifestPath, "utf8");
  const policy = manifest.match(
    /"key":\s*"Content-Security-Policy",\s*"value":\s*"((?:\\.|[^"\\])*)"/,
  )?.[1];
  if (!policy) {
    throw new Error(`Content-Security-Policy is missing from ${manifestPath}`);
  }
  return { manifestPath, manifest, policy: policy.replaceAll('\\"', '"') };
}

/**
 * Replace the inline-script placeholder in the build that is about to be
 * published. `routing` is the object Next hands to the deployment adapter;
 * Vercel serialises that object into the Build Output, so patching
 * routes-manifest.json after onBuildComplete does not change production.
 */
export function publishInlineScriptCsp({ projectRoot, distDir, routing }) {
  const outputDir = resolveDistDir(projectRoot, distDir);
  const { hashes } = collectInlineScriptHashes(outputDir);
  const hashList = [...hashes].sort().join(" ");
  let patchedFiles = 0;

  if (routing) {
    const before = JSON.stringify(routing);
    if (!before.includes("script-src")) {
      throw new Error("Deployment routing has no script-src policy to publish");
    }
    if (before.includes(SCRIPT_HASH_PLACEHOLDER)) {
      replacePlaceholder(routing, SCRIPT_HASH_PLACEHOLDER, hashList);
      patchedFiles += 1;
    }
  }

  patchedFiles += patchBuildFiles(outputDir, SCRIPT_HASH_PLACEHOLDER, hashList);

  const { policy } = policyFromManifest(outputDir);
  if (policy.includes(SCRIPT_HASH_PLACEHOLDER)) {
    throw new Error(
      "CSP placeholder is still in routes-manifest.json after the hash pass",
    );
  }
  assertHashesInPolicy(policy, hashes, join(outputDir, "routes-manifest.json"));

  if (routing) {
    const policies = contentSecurityPolicies(routing);
    if (policies.length === 0) {
      throw new Error("Deployment routing lost its script-src policy during the hash pass");
    }
    for (const published of policies) {
      if (published.includes(SCRIPT_HASH_PLACEHOLDER)) {
        throw new Error("CSP placeholder is still in the deployment routing");
      }
      assertHashesInPolicy(published, hashes, "deployment routing");
    }
  }

  return {
    hashCount: hashes.size,
    patchedFiles,
    policyLength: policy.length,
  };
}

function replaceSitePolicies(value, policy) {
  if (typeof value === "string") {
    if (value.includes("default-src 'self'") && value.includes("script-src")) return policy;
    return value;
  }
  if (Array.isArray(value)) return value.map((entry) => replaceSitePolicies(entry, policy));
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      value[key] = replaceSitePolicies(value[key], policy);
    }
  }
  return value;
}

/**
 * The Vercel adapter serialises routing headers into `.next/output/config.json`.
 * A hash whose base64 contains `/` was missing from that file even though the
 * routing object and routes-manifest had it. Rewrite the site policy from the
 * manifest, which is what the builder reads after this process returns.
 */
function repairDeploymentOutputs(outputs, policy) {
  for (const output of outputs) {
    const data = JSON.parse(readFileSync(output, "utf8"));
    replaceSitePolicies(data, policy);
    writeFileSync(output, JSON.stringify(data));
  }
}

function assertHashesInPolicy(policy, hashes, label) {
  for (const hash of hashes) {
    if (!policy.includes(hash)) {
      throw new Error(`${label} is missing inline script hash ${hash}`);
    }
  }
}

/**
 * Fail the build if a published artifact still contains the placeholder or is
 * missing an inline-script hash. Deployment config is rewritten from the
 * routes manifest first: that file is what Vercel reads after the build.
 */
export function assertPublishedCsp({
  projectRoot,
  distDir,
  routing,
  requireDeploymentOutput = false,
}) {
  const outputDir = resolveDistDir(projectRoot, distDir);
  const { hashes } = collectInlineScriptHashes(outputDir);
  const { manifestPath, manifest, policy } = policyFromManifest(outputDir);

  if (manifest.includes(SCRIPT_HASH_PLACEHOLDER) || policy.includes(SCRIPT_HASH_PLACEHOLDER)) {
    throw new Error(
      `CSP placeholder ${SCRIPT_HASH_PLACEHOLDER} is still in ${manifestPath}. ` +
        "Refusing to publish a policy that blocks the site's inline scripts.",
    );
  }
  assertHashesInPolicy(policy, hashes, manifestPath);

  if (routing) {
    const serialised = JSON.stringify(routing);
    if (serialised.includes(SCRIPT_HASH_PLACEHOLDER)) {
      throw new Error("CSP placeholder is still in the deployment routing");
    }
    for (const published of contentSecurityPolicies(routing)) {
      assertHashesInPolicy(published, hashes, "deployment routing");
    }
  }

  const outputs = deploymentOutputConfigs(projectRoot, outputDir);
  if (requireDeploymentOutput && outputs.length === 0) {
    throw new Error(
      "Vercel adapter did not write a deployment config. Looked for " +
        [
          join(outputDir, "output/config.json"),
          join(projectRoot, ".vercel/output/config.json"),
          "/vercel/output/config.json",
        ].join(", ") +
        ".",
    );
  }
  repairDeploymentOutputs(outputs, policy);
  for (const output of outputs) {
    const text = readFileSync(output, "utf8");
    if (text.includes(SCRIPT_HASH_PLACEHOLDER)) {
      throw new Error(
        `CSP placeholder is still in ${output}. The deployment would block inline scripts.`,
      );
    }
    const policies = contentSecurityPolicies(JSON.parse(text));
    if (policies.length === 0) {
      throw new Error(`Content-Security-Policy is missing from ${output}`);
    }
    for (const published of policies) {
      assertHashesInPolicy(published, hashes, output);
    }
  }

  return { hashCount: hashes.size, outputs };
}

export function scheduleInlineScriptCsp(projectRoot) {
  process.on("exit", (code) => {
    if (code !== 0) return;
    // Set inside `next build` after the config loads, and still set when the
    // process exits. `next dev` and `next start` must not fail shutdown.
    if (process.env.NEXT_PHASE !== "phase-production-build") return;
    try {
      const distDir = resolveDistDir(projectRoot);
      const manifestPath = join(distDir, "routes-manifest.json");
      if (existsSync(manifestPath) && readFileSync(manifestPath, "utf8").includes(SCRIPT_HASH_PLACEHOLDER)) {
        publishInlineScriptCsp({ projectRoot, distDir });
      }
      const result = assertPublishedCsp({ projectRoot, distDir });
      process.stdout.write(
        `CSP: published ${result.hashCount} inline script hashes; placeholder is absent\n`,
      );
    } catch (error) {
      process.stderr.write(
        `CSP hash pass failed:\n${error instanceof Error ? error.stack : String(error)}\n`,
      );
      process.exitCode = 1;
    }
  });
}

function assertFromCli() {
  const projectRoot = process.cwd();
  const result = assertPublishedCsp({
    projectRoot,
    requireDeploymentOutput: Boolean(process.env.NEXT_ADAPTER_PATH),
  });
  process.stdout.write(
    `CSP check: ${result.hashCount} inline script hashes are in the published policy\n`,
  );
}

if (process.argv.includes("--check")) {
  try {
    assertFromCli();
  } catch (error) {
    process.stderr.write(
      `CSP hash pass failed:\n${error instanceof Error ? error.stack : String(error)}\n`,
    );
    process.exit(1);
  }
}
