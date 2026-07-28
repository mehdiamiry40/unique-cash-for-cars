#!/usr/bin/env python3
"""Create a self-contained static snapshot of the public WordPress site.

The generated HTML is loaded by Next.js route handlers. Public CSS, JavaScript,
fonts, and images are copied under their original paths so the rendered output
uses the same markup and visual assets as WordPress.
"""

from __future__ import annotations

import concurrent.futures
import json
import mimetypes
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ORIGIN = "https://uniquecashforcars.com.au"
PROJECT = Path(__file__).resolve().parents[1]
PUBLIC = PROJECT / "public"
OUTPUT = PROJECT / "app" / "mirror-pages.json"
USER_AGENT = "Mozilla/5.0 (compatible; UniqueCashNextMirror/1.0)"

SITEMAPS = (
    f"{ORIGIN}/page-sitemap.xml",
    f"{ORIGIN}/post-sitemap.xml",
)

ASSET_PATH = re.compile(r"^/(?:wp-content|wp-includes)/", re.I)
ABSOLUTE_SAME_ORIGIN = re.compile(
    r"https?://(?:www\.)?uniquecashforcars\.com\.au(?P<path>/[^\"'<>\s)]*)",
    re.I,
)
PROTOCOL_RELATIVE_SAME_ORIGIN = re.compile(
    r"//(?:www\.)?uniquecashforcars\.com\.au(?P<path>/[^\"'<>\s)]*)",
    re.I,
)
ROOT_ASSET = re.compile(
    r"(?:[\"'(=:\s]|&quot;)(?P<path>/(?:wp-content|wp-includes)/[^\"'<>\s),]+)",
    re.I,
)


def fetch(url: str, *, attempts: int = 3) -> tuple[bytes, str]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    last: Exception | None = None
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                return response.read(), response.headers.get_content_type()
        except Exception as exc:  # noqa: BLE001 - retry public network reads
            last = exc
            time.sleep(0.4 * (attempt + 1))
    raise RuntimeError(f"Failed to fetch {url}: {last}")


def sitemap_urls() -> list[str]:
    urls: list[str] = []
    namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    for sitemap in SITEMAPS:
        body, _ = fetch(sitemap)
        root = ET.fromstring(body)
        for node in root.findall("s:url/s:loc", namespace):
            if node.text:
                urls.append(node.text.strip())
    if ORIGIN + "/" not in urls:
        urls.insert(0, ORIGIN + "/")
    return list(dict.fromkeys(urls))


def normalized_page_path(url: str) -> str:
    path = urllib.parse.urlsplit(url).path or "/"
    if path != "/" and not path.endswith("/"):
        path += "/"
    return path


def clean_asset_path(raw: str) -> str | None:
    raw = raw.replace("&amp;", "&").replace("&#038;", "&")
    parts = urllib.parse.urlsplit(raw)
    path = urllib.parse.unquote(parts.path)
    if not ASSET_PATH.match(path):
        return None
    if ".." in Path(path).parts:
        return None
    return path


def discover_assets(text: str) -> set[str]:
    assets: set[str] = set()
    for pattern in (ABSOLUTE_SAME_ORIGIN, PROTOCOL_RELATIVE_SAME_ORIGIN, ROOT_ASSET):
        for match in pattern.finditer(text):
            path = clean_asset_path(match.group("path"))
            if path:
                assets.add(path)
    return assets


def rewrite_html(html: str) -> str:
    html = html.replace(
        "</body>",
        '<script defer src="/mirror-enhancements.js"></script></body>',
    )
    return html


def download_asset(path: str) -> tuple[str, str | None]:
    destination = PUBLIC / path.lstrip("/")
    if destination.exists() and destination.stat().st_size > 0:
        try:
            if destination.suffix.lower() == ".css":
                return path, destination.read_text(encoding="utf-8", errors="replace")
        except OSError:
            pass
        return path, None

    url = ORIGIN + urllib.parse.quote(path, safe="/:%@+~")
    try:
        body, content_type = fetch(url)
    except RuntimeError as exc:
        return path, f"__ERROR__ {exc}"

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(body)

    is_text = (
        content_type.startswith("text/")
        or destination.suffix.lower() in {".css", ".js", ".json", ".xml"}
    )
    if not is_text:
        return path, None

    text = body.decode("utf-8", errors="replace")
    if destination.suffix.lower() in {".css", ".js"}:
        text = re.sub(
            r"https?://(?:www\.)?uniquecashforcars\.com\.au",
            "",
            text,
            flags=re.I,
        )
        destination.write_text(text, encoding="utf-8")
    return path, text


def mirror() -> None:
    pages: dict[str, str] = {}
    assets: set[str] = set()

    urls = sitemap_urls()
    print(f"Mirroring {len(urls)} pages")
    for url in urls:
        body, _ = fetch(url)
        html = body.decode("utf-8", errors="replace")
        assets.update(discover_assets(html))
        pages[normalized_page_path(url)] = rewrite_html(html)

    processed: set[str] = set()
    pending = set(assets)
    failures: list[str] = []
    while pending:
        batch = sorted(pending - processed)
        if not batch:
            break
        print(f"Downloading {len(batch)} assets")
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(download_asset, batch))
        for path, text in results:
            processed.add(path)
            if text and text.startswith("__ERROR__"):
                failures.append(f"{path}: {text}")
                continue
            if text:
                pending.update(discover_assets(text))

    OUTPUT.write_text(
        json.dumps(pages, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT.relative_to(PROJECT)} ({OUTPUT.stat().st_size:,} bytes)")
    print(f"Saved {len(processed) - len(failures)} assets")
    if failures:
        print("Asset failures:")
        for failure in failures:
            print(f"  {failure}")


if __name__ == "__main__":
    mimetypes.init()
    mirror()
