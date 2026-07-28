#!/usr/bin/env node
/**
 * Downloads the images from the live WordPress site into public/img.
 *
 * Run this once, locally, before the first build:
 *   node scripts/fetch-assets.mjs
 *
 * Then commit public/img. The site references these by path, so the build
 * will succeed without them but pages will show broken images.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "img");
const BASE = "https://uniquecashforcars.com.au/wp-content/uploads";

/**
 * Source path on WordPress → filename to save under public/img.
 *
 * The hero banner is stored on WordPress as `.png` but its bytes are JPEG.
 * It is saved here with the extension that matches the bytes, because it is
 * served straight from public/ as the og:image and this site sends
 * X-Content-Type-Options: nosniff.
 */
const ASSETS = [
  "2020/12/logo.jpg",
  ["2022/01/Best-Cash-for-Cars-Gold-Coast.png", "Best-Cash-for-Cars-Gold-Coast.jpg"],
  "2022/09/old-car-gold-coast.jpg",
  "2022/09/unwanted-car-gold-coast.jpg",
  "2022/09/car-abandoned.jpg",
  "2022/09/car-front-damaged.jpg",
  "2022/09/used-car-gold-coast.jpg",
  "2022/09/accident-damaged-car.jpg",
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });

  let ok = 0;
  let failed = 0;

  for (const entry of ASSETS) {
    const [asset, override] = Array.isArray(entry) ? entry : [entry, null];
    const name = override ?? asset.split("/").pop();
    const dest = join(OUT, name);

    if (await exists(dest)) {
      console.log(`skip   ${name} (already present)`);
      ok++;
      continue;
    }

    try {
      const res = await fetch(`${BASE}/${asset}`, {
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      console.log(`ok     ${name} (${(buf.length / 1024).toFixed(0)} KB)`);
      ok++;
    } catch (err) {
      console.error(`FAILED ${name} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${ok} downloaded, ${failed} failed → public/img`);

  if (failed) {
    console.error(
      "\nSome assets are missing. If the WordPress site is already down, pull them\n" +
        "from your hosting file manager under wp-content/uploads and drop them in\n" +
        "public/img with the same filenames.",
    );
    process.exitCode = 1;
  }
}

main();
