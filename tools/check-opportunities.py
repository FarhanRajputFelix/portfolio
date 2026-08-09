#!/usr/bin/env python3
"""
Re-check every source URL in data/opportunities.json.

Run daily by .github/workflows/opportunities.yml. It answers one question
honestly and refuses to answer a harder one it cannot:

  CAN answer  — is this URL still reachable, and has the page changed since
                the last check? Both are mechanical facts.
  CANNOT      — is the deadline on it still correct? That needs a human or a
                model reading the page. A green check here means "the link
                works", never "the facts below it are current".

Writes data/freshness.json. Exits 1 if any source is unreachable, so a broken
link shows as a failed run instead of sitting quietly on the page.

  python tools/check-opportunities.py          # check, write freshness.json
  python tools/check-opportunities.py --quiet  # CI mode, less noise
"""

import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "opportunities.json"
OUT = ROOT / "data" / "freshness.json"

UA = "Mozilla/5.0 (compatible; portfolio-link-check/1.0; +https://farhanbashir.netlify.app)"
TIMEOUT = 25

QUIET = "--quiet" in sys.argv


def log(*a):
    if not QUIET:
        print(*a)


def fingerprint(html: str) -> str:
    """
    Hash the visible text, not the raw bytes.

    Raw HTML changes on every request for pages carrying a CSRF token, a
    build ID or a rotating banner, which would report "changed" daily and
    train anyone reading it to ignore the signal entirely.
    """
    text = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html)
    text = re.sub(r"(?s)<!--.*?-->", " ", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = re.sub(r"&[a-zA-Z#0-9]+;", " ", text)
    text = re.sub(r"\s+", " ", text).strip().lower()
    return hashlib.sha256(text.encode("utf-8", "replace")).hexdigest()[:16]


def fetch(url: str, attempts: int = 3):
    """
    Fetch with retries on transport errors only.

    The first version of this had no retry, and a run of 21 sequential requests
    reported three sites as BROKEN that were serving 200 when checked a second
    later. A daily check that cries wolf gets ignored within a week, which is
    worse than not having one — so a transport failure has to happen `attempts`
    times in a row before it counts.

    An HTTP status is not retried: a 404 is an answer, not a failure to get one.
    """
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en",
    })
    last = None
    for i in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                body = r.read(600_000).decode("utf-8", "replace")
                return r.status, fingerprint(body), None
        except urllib.error.HTTPError as e:
            return e.code, None, f"HTTP {e.code}"
        except Exception as e:  # DNS, TLS, timeout, reset, redirect loop
            last = type(e).__name__
            if i < attempts - 1:
                time.sleep(2 * (i + 1))
    return None, None, f"{last} after {attempts} attempts"


def main() -> int:
    doc = json.loads(DATA.read_text(encoding="utf-8"))
    previous = {}
    if OUT.exists():
        try:
            previous = {s["url"]: s for s in json.loads(OUT.read_text(encoding="utf-8"))["sources"]}
        except Exception:
            previous = {}

    # One entry per distinct URL: the landing page plus every evidence source.
    urls = {}
    for o in doc["opportunities"]:
        urls.setdefault(o["url"], set()).add(o["id"])
        for e in o.get("evidence", []):
            urls.setdefault(e["source"], set()).add(o["id"])
    for s in doc.get("jobSources", []):
        urls.setdefault(s["url"], set()).add("job-source")

    today = date.today().isoformat()
    results, broken, changed = [], [], []

    log(f"checking {len(urls)} source URLs\n")
    for url, ids in sorted(urls.items()):
        status, fp, err = fetch(url)
        prev = previous.get(url, {})
        prev_fp = prev.get("fingerprint")

        ok = status is not None and 200 <= status < 400
        if not ok:
            broken.append((url, err or status))
            mark = "BROKEN "
        elif prev_fp and fp != prev_fp:
            changed.append(url)
            mark = "CHANGED"
        else:
            mark = "ok     "

        log(f"  {mark} {status or '---'}  {url[:82]}")
        results.append({
            "url": url,
            "usedBy": sorted(ids),
            "status": status,
            "ok": ok,
            "error": err,
            "fingerprint": fp,
            # firstSeen survives across runs so "unchanged since" means something.
            "firstSeen": prev.get("firstSeen", today) if fp == prev_fp else today,
            "lastChecked": today,
            "changedSinceLastCheck": bool(prev_fp and fp and fp != prev_fp),
        })

    OUT.write_text(json.dumps({
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "checked": today,
        "total": len(results),
        "broken": len(broken),
        "changed": len(changed),
        "note": "A reachable link is not a current deadline. This checks that pages resolve "
                "and flags when their visible text changes; it does not read the page.",
        "sources": results,
    }, indent=2) + "\n", encoding="utf-8")

    log(f"\n  {len(results) - len(broken)}/{len(results)} reachable")
    if changed:
        log(f"  {len(changed)} page(s) changed since the last check — re-read these:")
        for u in changed:
            log(f"     {u}")
    if broken:
        log(f"\n  {len(broken)} BROKEN:")
        for u, why in broken:
            log(f"     {why}  {u}")
        return 1

    log("\n  all sources reachable")
    return 0


if __name__ == "__main__":
    sys.exit(main())
