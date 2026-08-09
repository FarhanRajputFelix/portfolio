#!/usr/bin/env python3
"""
Point the whole site at one base URL.

The site's identity URL appears 112 times across 25 files — canonical links,
Open Graph and Twitter tags, JSON-LD, the sitemap and the docs. Editing those
by hand is how you end up with a canonical tag pointing at a page that 404s,
which is exactly what happened: every page advertised farhanbashir.netlify.app
while the current build only existed on GitHub Pages, so half the canonical
tags pointed at missing pages.

So the base URL is one command, not an editing session:

    python tools/set-base-url.py --to https://farhanrajputfelix.github.io/portfolio
    python tools/set-base-url.py --to https://farhan.is-a.dev
    python tools/set-base-url.py --to https://farhan.is-a.dev --dry-run

Trailing slashes are normalised away so the two forms cannot drift apart.
"""

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Every base this site has ever advertised. Listing the old ones explicitly
# means a re-run cannot leave a stale mix behind.
KNOWN_BASES = [
    "https://farhanbashir.netlify.app",
    "https://farhanrajputfelix.github.io/portfolio",
    "https://farhanrajputfelix.github.io",
]

PATTERNS = ["*.html", "*.xml", "*.json", "*.toml", "*.md"]
SKIP_DIRS = {".git", "node_modules", "data"}   # data/ holds third-party job URLs


def targets():
    for pat in PATTERNS:
        for p in ROOT.rglob(pat):
            if any(part in SKIP_DIRS for part in p.relative_to(ROOT).parts[:-1]):
                continue
            if p.name == "freshness.json":
                continue
            yield p


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--to", required=True, help="new base URL, no trailing slash")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    new = args.to.rstrip("/")
    if not new.startswith("https://"):
        print("base URL must start with https://")
        return 1

    # Longest first: without this, replacing the bare github.io base would
    # corrupt the /portfolio variant into a double path.
    bases = sorted((b for b in KNOWN_BASES if b != new), key=len, reverse=True)
    if not bases:
        print("nothing to change — that is already the only known base")
        return 0

    changed, total = [], 0
    for p in targets():
        try:
            text = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        original = text
        hits = 0
        for old in bases:
            n = text.count(old)
            if n:
                text = text.replace(old, new)
                hits += n
        if text != original:
            total += hits
            changed.append((p.relative_to(ROOT).as_posix(), hits))
            if not args.dry_run:
                p.write_text(text, encoding="utf-8", newline="")

    for name, n in sorted(changed):
        print(f"  {n:>3}  {name}")
    verb = "would rewrite" if args.dry_run else "rewrote"
    print(f"\n{verb} {total} reference(s) across {len(changed)} file(s) -> {new}")

    # A CNAME file is what makes GitHub Pages answer on a custom domain. It must
    # hold the bare host, and must not exist for a *.github.io URL or Pages will
    # keep redirecting to a domain that no longer applies.
    host = re.sub(r"^https://", "", new).split("/")[0]
    cname = ROOT / "CNAME"
    if host.endswith("github.io"):
        if cname.exists() and not args.dry_run:
            cname.unlink()
            print("removed CNAME (serving from github.io directly)")
    else:
        if not args.dry_run:
            cname.write_text(host + "\n", encoding="utf-8", newline="")
        print(f"CNAME -> {host}")

    if not args.dry_run and total:
        print("\nNow run: python tools/check-links.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
