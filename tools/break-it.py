#!/usr/bin/env python3
"""
break-it.py — try to break the live site on purpose.

Week 9 asks for real edge cases, not the happy path. This checks the things
that actually fail in the wild:

  1. every external link, including demos, repos and credential verifications
  2. the contact form with empty, garbage, oversized and injected input
  3. double-submit, the way an impatient person clicks
  4. 404 handling
  5. SEO and social-share metadata on every page
  6. payload weight and time to first byte

Run:  python tools/break-it.py
It only reads and posts to the site's own form; nothing destructive.
"""

import concurrent.futures as cf
import glob
import io
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SITE = "https://farhanbashir.netlify.app"
UA = "break-it/1.0 (portfolio self-test)"
CTX = ssl.create_default_context()

results = {"fail": [], "warn": [], "ok": 0}


def record(level, msg):
    if level == "ok":
        results["ok"] += 1
    else:
        results[level].append(msg)
    mark = {"ok": "  ok  ", "warn": " WARN ", "fail": " FAIL "}[level]
    print(f"[{mark}] {msg}")


def fetch(url, method="GET", data=None, timeout=25):
    req = urllib.request.Request(url, method=method, data=data)
    req.add_header("User-Agent", UA)
    if data:
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            body = r.read()
            return r.status, body, time.time() - t0
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:2000], 0.0
    except Exception as e:
        return None, str(e).encode()[:300], 0.0


# ---------------------------------------------------------------- 1. links
def check_external_links():
    print("\n=== 1. EVERY EXTERNAL LINK (demos, repos, credentials) ===")
    urls = set()
    for f in glob.glob("*.html"):
        html = io.open(f, encoding="utf-8").read()
        for u in re.findall(r'href="(https?://[^"]+)"', html):
            if "fonts.g" in u or "schema.org" in u:
                continue
            urls.add(u.replace("&amp;", "&"))

    def one(u):
        status, _, _ = fetch(u, timeout=25)
        return u, status

    with cf.ThreadPoolExecutor(max_workers=8) as ex:
        for u, status in ex.map(one, sorted(urls)):
            short = u if len(u) < 78 else u[:75] + "..."
            if status is None:
                record("fail", f"unreachable: {short}")
            elif status >= 400:
                record("fail", f"HTTP {status}: {short}")
            else:
                record("ok", f"HTTP {status}: {short}")


# ---------------------------------------------------------------- 2. form
def check_form_abuse():
    print("\n=== 2. THE CONTACT FORM, ABUSED ===")
    cases = [
        ("completely empty", {"form-name": "contact"}),
        ("no form-name at all", {"name": "x", "message": "y"}),
        ("garbage email", {"form-name": "contact", "name": "x",
                           "email": "not-an-email", "message": "garbage email test"}),
        ("empty required fields", {"form-name": "contact", "name": "",
                                   "email": "", "message": ""}),
        ("10k character message", {"form-name": "contact", "name": "Long",
                                   "email": "a@b.com", "message": "A" * 10000}),
        ("html/script injection", {"form-name": "contact",
                                   "name": "<script>alert(1)</script>",
                                   "email": "x@y.com",
                                   "message": "<img src=x onerror=alert(1)>"}),
        ("unicode and emoji", {"form-name": "contact", "name": "فرحان 🚀",
                               "email": "u@n.com", "message": "اردو text 日本語 🎉"}),
        ("honeypot filled (a bot)", {"form-name": "contact", "bot-field": "bot",
                                     "name": "Bot", "email": "b@b.com",
                                     "message": "should be silently dropped"}),
    ]
    for label, fields in cases:
        data = urllib.parse.urlencode(fields).encode()
        status, _, _ = fetch(SITE + "/", method="POST", data=data)
        if label == "no form-name at all":
            (record("ok", f'"{label}" -> HTTP {status} (rejected, as it should be)')
             if status == 404 else record("warn", f'"{label}" -> HTTP {status}, expected 404'))
        elif status in (200, 302, 303):
            record("ok", f'"{label}" -> HTTP {status} accepted')
        else:
            record("warn", f'"{label}" -> HTTP {status}')

    print("\n--- double submit, 5 in a row as fast as possible ---")
    data = urllib.parse.urlencode(
        {"form-name": "contact", "name": "Rapid", "email": "r@r.com",
         "message": "double-submit test"}).encode()
    codes = [fetch(SITE + "/", method="POST", data=data)[0] for _ in range(5)]
    record("ok" if all(c in (200, 302, 303) for c in codes) else "warn",
           f"five rapid submits -> {codes}")


# ---------------------------------------------------------------- 3. 404
def check_404():
    print("\n=== 3. 404 HANDLING ===")
    for path in ["/definitely-not-real.html", "/admin", "/../etc/passwd", "/index.html/extra"]:
        status, body, _ = fetch(SITE + path)
        if status == 404:
            record("ok", f"{path} -> 404")
        elif status == 200:
            record("warn", f"{path} -> 200, should probably be 404")
        else:
            record("ok", f"{path} -> {status}")


# ---------------------------------------------------------------- 4. meta
def check_meta():
    print("\n=== 4. SEO AND SOCIAL-SHARE METADATA ===")
    needed = {
        "<title>": "page title",
        'name="description"': "meta description",
        'property="og:title"': "Open Graph title",
        'property="og:description"': "Open Graph description",
        'property="og:image"': "Open Graph image (social preview)",
        'property="og:url"': "Open Graph url",
        'name="twitter:card"': "Twitter card",
    }
    for f in sorted(glob.glob("*.html")):
        html = io.open(f, encoding="utf-8").read()
        missing = [label for probe, label in needed.items() if probe not in html]
        if missing:
            record("fail", f"{f}: missing {', '.join(missing)}")
        else:
            record("ok", f"{f}: all metadata present")

    for extra in ["robots.txt", "sitemap.xml"]:
        status, _, _ = fetch(f"{SITE}/{extra}")
        (record("ok", f"{extra} served") if status == 200
         else record("fail", f"{extra} -> HTTP {status}"))


# ---------------------------------------------------------------- 5. speed
def check_speed():
    print("\n=== 5. WEIGHT AND SPEED ===")
    status, body, elapsed = fetch(SITE + "/")
    if status != 200:
        record("fail", f"homepage -> HTTP {status}")
        return
    record("ok", f"homepage HTML {len(body)/1024:.0f} KB, first byte {elapsed*1000:.0f} ms")

    html = body.decode("utf-8", "replace")
    assets = set(re.findall(r'(?:src|href)="((?:css|js|assets|vendor)/[^"]+)"', html))
    total = len(body)
    heavy = []
    for a in sorted(assets):
        st, b, _ = fetch(f"{SITE}/{a}")
        if st == 200:
            total += len(b)
            if len(b) > 150_000:
                heavy.append((a, len(b)))
    record("ok", f"initial payload (HTML + {len(assets)} render-blocking assets): {total/1024:.0f} KB")
    for a, size in heavy:
        record("warn", f"heavy asset: {a} at {size/1024:.0f} KB")
    if total > 2_000_000:
        record("warn", f"payload over 2 MB — slow on a mid-range phone")


if __name__ == "__main__":
    print(f"Breaking {SITE}\n" + "=" * 62)
    check_external_links()
    check_form_abuse()
    check_404()
    check_meta()
    check_speed()
    print("\n" + "=" * 62)
    print(f"passed: {results['ok']}   warnings: {len(results['warn'])}   failures: {len(results['fail'])}")
    if results["fail"]:
        print("\nFAILURES:")
        for m in results["fail"]:
            print("  -", m)
    if results["warn"]:
        print("\nWARNINGS:")
        for m in results["warn"]:
            print("  -", m)
    sys.exit(1 if results["fail"] else 0)
