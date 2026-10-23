import { fileURLToPath, pathToFileURL } from "node:url";

import { assertPublishedCsp, publishInlineScriptCsp } from "./publish-csp.mjs";

const adapterFile = fileURLToPath(new URL("./csp-adapter.mjs", import.meta.url));

async function loadDelegatedAdapter() {
  const adapterPath = process.env.NEXT_ADAPTER_PATH;
  if (!adapterPath || adapterPath === adapterFile) return null;
  const loaded = await import(pathToFileURL(adapterPath).href);
  return loaded.default ?? loaded;
}

export const name = "Unique CSP";

export async function modifyConfig(config, context) {
  const delegated = await loadDelegatedAdapter();
  if (typeof delegated?.modifyConfig === "function") {
    config = await delegated.modifyConfig(config, context);
  }
  // Vercel's modifyConfig may point adapterPath back at itself. This file has
  // to stay the adapter so the hash pass runs before that output is sealed.
  config.adapterPath = adapterFile;
  return config;
}

export async function onBuildComplete(payload) {
  const projectDir = payload.projectDir;
  const published = publishInlineScriptCsp({
    projectRoot: projectDir,
    distDir: payload.distDir,
    routing: payload.routing,
  });
  console.log(
    `CSP: published ${published.hashCount} inline script hashes into the build routing ` +
      `(${published.patchedFiles} file(s), policy ${published.policyLength} bytes)`,
  );

  const delegated = await loadDelegatedAdapter();
  if (typeof delegated?.onBuildComplete === "function") {
    await delegated.onBuildComplete(payload);
  } else if (process.env.NEXT_ADAPTER_PATH) {
    throw new Error(
      `CSP adapter could not call onBuildComplete on NEXT_ADAPTER_PATH (${process.env.NEXT_ADAPTER_PATH})`,
    );
  }

  assertPublishedCsp({
    projectRoot: projectDir,
    distDir: payload.distDir,
    routing: payload.routing,
    requireDeploymentOutput: Boolean(process.env.NEXT_ADAPTER_PATH),
  });
}

const uniqueCspAdapter = { name, modifyConfig, onBuildComplete };
export default uniqueCspAdapter;
