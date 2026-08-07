#!/usr/bin/env python3
"""
check-links.py — the smallest thing that would have caught the bug that shipped.

For several weeks every process page on this site was live but orphaned: the
homepage nav pointed only at its own anchors, so six pages were reachable only
by typing the URL. Nothing was broken, so nothing looked broken.

This checks three things:
  1. every relative href resolves to a file that exists
  2. every page is reachable from index.html by following links
  3. sitemap.xml and the actual pages agree, in both directions

Run:  python tools/check-links.py
Exit: 0 if clean, 1 if not — so it can gate a commit later.
"""

import glob
import io
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

SKIP = ("http://", "https://", "mailto:", "#", "//", "tel:", "data:")


def main() -> int:
    pages = sorted(glob.glob("*.html"))
    if not pages:
        print("no html pages found — wrong directory?")
        return 1

    links = defaultdict(set)
    broken = []

    for page in pages:
        html = io.open(page, encoding="utf-8").read()
        for href in re.findall(r'href="([^"]+)"', html):
            if href.startswith(SKIP):
                continue
            target = href.split("#")[0]
            if not target or target == "./":
                target = "index.html"
            links[page].add(target)
            if not os.path.exists(target):
                broken.append((page, href))

    # Reachability: walk the link graph outward from the homepage.
    seen, queue = {"index.html"}, ["index.html"]
    while queue:
        for target in links.get(queue.pop(), ()):
            if target.endswith(".html") and target not in seen:
                seen.add(target)
                queue.append(target)
    orphans = [p for p in pages if p not in seen]

    # Sitemap agreement, both directions.
    missing_from_sitemap, dead_in_sitemap = [], []
    if os.path.exists("sitemap.xml"):
        sitemap = io.open("sitemap.xml", encoding="utf-8").read()
        listed = {x or "index.html" for x in re.findall(r"<loc>https?://[^/]+/(?:portfolio/)?([^<]*)</loc>", sitemap)}
        dead_in_sitemap = sorted(x for x in listed if not os.path.exists(x))
        missing_from_sitemap = sorted(set(pages) - listed)

    print(f"pages checked            {len(pages)}")
    print(f"broken links             {len(broken)}")
    for page, href in broken:
        print(f"    {page} -> {href}")
    print(f"orphaned pages           {len(orphans)}")
    for page in orphans:
        print(f"    {page} (live, but nothing links to it)")
    print(f"in sitemap, not on disk  {len(dead_in_sitemap)}  {dead_in_sitemap or ''}")
    print(f"on disk, not in sitemap  {len(missing_from_sitemap)}  {missing_from_sitemap or ''}")

    failed = bool(broken or orphans or dead_in_sitemap or missing_from_sitemap)
    print("\nFAIL" if failed else "\nclean")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
