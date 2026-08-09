#!/usr/bin/env python3
"""
Pull live AI/ML roles from public job feeds into data/jobs.json.

Run daily by .github/workflows/jobs.yml. No API key, no scraping, no paid tier:
every source below publishes a JSON API or an RSS feed for exactly this use.
Each listing keeps its source name and links straight back to the original —
which is both the honest thing and, for Remote OK, a condition of their terms.

  python tools/fetch-jobs.py              # fetch, filter, write data/jobs.json
  python tools/fetch-jobs.py --dry-run    # print what it would write
  python tools/fetch-jobs.py --source remoteok

What it does NOT do: host applications, judge fit, or promise a listing is
still open. It is a daily mirror of other people's boards, and a board can
carry a role that was filled an hour ago.
"""

import argparse
import html
import json
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "jobs.json"

UA = "Mozilla/5.0 (compatible; farhanbashir-jobs/1.0; +https://farhanbashir.netlify.app)"
TIMEOUT = 40
MAX_JOBS = 500          # keeps the committed JSON under ~1 MB so the page loads fast
MAX_AGE_DAYS = 45       # older than this and the listing is usually gone

# ---------------------------------------------------------------- relevance
# The whole point is AI/ML roles. Feeds tagged "machine-learning" still return
# pharmacy technicians and payroll specialists, because their own tagging is
# loose — a board I looked at listed "Pharmacy Technician Refill Calls" under
# an AI track. So relevance is decided here, on the title first.
STRONG = re.compile(
    r"\b(machine learning|deep learning|artificial intelligence|"
    r"data scien(ce|tist)|research scien(ce|tist)|applied scien(ce|tist)|"
    r"\bml\b|\bai\b|\bllm\b|\bnlp\b|computer vision|mlops|"
    r"generative ai|foundation model|reinforcement learning|"
    r"prompt engineer|ai engineer|ml engineer|research engineer)\b", re.I)

WEAK = re.compile(r"\b(python|pytorch|tensorflow|data engineer|analytics|neural|model)\b", re.I)

# Titles that match STRONG by accident. "Tax Consultant - LLM" is a law degree.
EXCLUDE = re.compile(
    r"\b(tax consultant|pharmacy|nurse|dental|insurance agent|"
    r"customer service|sales representative|account executive|"
    r"recruiter|paralegal|medical science liaison|barista|driver)\b", re.I)

TAG_RULES = [
    ("llm",       r"\b(llm|large language model|gpt|transformer|prompt)\b"),
    ("nlp",       r"\b(nlp|natural language)\b"),
    ("vision",    r"\b(computer vision|image|visual|perception|multimodal)\b"),
    ("mlops",     r"\b(mlops|inference|deployment|serving|infrastructure|platform)\b"),
    ("research",  r"\b(research|scientist|phd|publication)\b"),
    ("data",      r"\b(data scien|data engineer|analytics|etl|warehouse)\b"),
    ("robotics",  r"\b(robot|autonomous|self-driving|adas)\b"),
    ("agents",    r"\b(agent|agentic|tool.?call|orchestrat)\b"),
]

LEVEL_RULES = [
    ("internship", r"\b(intern|internship|co-?op)\b"),
    ("new-grad",   r"\b(new ?grad|graduate|entry.?level|junior|university grad|campus)\b"),
    ("senior",     r"\b(senior|staff|principal|lead|director|head of|manager)\b"),
]


def log(*a):
    print(*a, file=sys.stderr)


def get(url, tries=3):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept": "application/json, application/xml, text/xml, */*"})
    last = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            return None if e.code in (403, 404, 410) else None
        except Exception as e:
            last = e
            if i < tries - 1:
                time.sleep(2 * (i + 1))
    log(f"    unreachable after {tries} tries: {type(last).__name__}")
    return None


def iso(value):
    """Every feed dates differently: epoch ints, epoch strings, ISO, RFC 822."""
    if value in (None, ""):
        return None
    if isinstance(value, (int, float)) or (isinstance(value, str) and value.isdigit()):
        try:
            return datetime.fromtimestamp(int(value), timezone.utc).date().isoformat()
        except (ValueError, OSError, OverflowError):
            return None
    s = str(value).strip()
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d",
                "%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z"):
        try:
            return datetime.strptime(s.split("+")[0].strip() if "%z" not in fmt else s, fmt).date().isoformat()
        except ValueError:
            continue
    m = re.match(r"(\d{4}-\d{2}-\d{2})", s)
    return m.group(1) if m else None


def clean(s, limit=None):
    if not s:
        return ""
    s = html.unescape(re.sub(r"<[^>]+>", " ", str(s)))
    s = re.sub(r"\s+", " ", s).strip()
    return s[:limit] if limit else s


# ================================================================ adapters
def from_remoteok():
    # The bare /api endpoint returns the newest 100 jobs of any kind — of which
    # zero were AI on the day I checked. Ask for the tags instead of fetching
    # everything and filtering afterwards.
    out, data = [], []
    for tag in ("machine-learning", "ai", "data-science", "nlp", "deep-learning"):
        raw = get(f"https://remoteok.com/api?tag={tag}")
        if raw:
            data += json.loads(raw)
    for j in data:
        if "position" not in j:      # first element is the legal/attribution notice
            continue
        out.append(dict(
            title=clean(j.get("position")), company=clean(j.get("company")),
            location=clean(j.get("location")) or "Remote",
            url=j.get("url") or j.get("apply_url"),
            posted=iso(j.get("epoch") or j.get("date")),
            raw_tags=[str(t) for t in (j.get("tags") or [])],
            salary_min=j.get("salary_min") or None, salary_max=j.get("salary_max") or None,
            source="Remote OK", source_url="https://remoteok.com",
            blurb=clean(j.get("description"), 260)))
    return out


def from_remotive():
    out = []
    # search= and category= return different slices, so use both.
    urls = [f"https://remotive.com/api/remote-jobs?search={t}&limit=100"
            for t in ("machine+learning", "data+scientist", "ai+engineer", "nlp", "computer+vision")]
    urls.append("https://remotive.com/api/remote-jobs?category=data")
    for u in urls:
        raw = get(u)
        if not raw:
            continue
        for j in json.loads(raw).get("jobs", []):
            out.append(dict(
                title=clean(j.get("title")), company=clean(j.get("company_name")),
                location=clean(j.get("candidate_required_location")) or "Remote",
                url=j.get("url"), posted=iso(j.get("publication_date")),
                raw_tags=[str(t) for t in (j.get("tags") or [])],
                salary_min=None, salary_max=None,
                source="Remotive", source_url="https://remotive.com",
                blurb=clean(j.get("description"), 260)))
    return out


def from_jobicy():
    out = []
    urls = [f"https://jobicy.com/api/v2/remote-jobs?count=100&tag={t}"
            for t in ("machine-learning", "data-science", "artificial-intelligence")]
    urls.append("https://jobicy.com/api/v2/remote-jobs?count=100&industry=data-science")
    for u in urls:
        raw = get(u)
        if not raw:
            continue
        for j in json.loads(raw).get("jobs", []):
            out.append(dict(
                title=clean(j.get("jobTitle")), company=clean(j.get("companyName")),
                location=clean(j.get("jobGeo")) or "Remote",
                url=j.get("url"), posted=iso(j.get("pubDate")),
                raw_tags=[str(t) for t in (j.get("jobIndustry") or [])] + [str(j.get("jobLevel") or "")],
                salary_min=None, salary_max=None,
                source="Jobicy", source_url="https://jobicy.com",
                blurb=clean(j.get("jobExcerpt"), 260)))
    return out


def from_himalayas():
    # The API caps a page at 20 regardless of the limit you ask for, so page
    # through with offset. Asking for 200 silently returned 20.
    out, rows = [], []
    for offset in range(0, 400, 20):
        raw = get(f"https://himalayas.app/jobs/api?limit=20&offset={offset}")
        if not raw:
            break
        page = json.loads(raw).get("jobs", [])
        if not page:
            break
        rows += page
    for j in rows:
        loc = j.get("locationRestrictions") or []
        out.append(dict(
            title=clean(j.get("title")), company=clean(j.get("companyName")),
            location=", ".join(loc) if isinstance(loc, list) and loc else "Remote",
            url=j.get("applicationLink"), posted=iso(j.get("pubDate")),
            raw_tags=[str(t) for t in (j.get("categories") or [])] + [str(s) for s in (j.get("seniority") or [])],
            salary_min=j.get("minSalary"), salary_max=j.get("maxSalary"),
            source="Himalayas", source_url="https://himalayas.app",
            blurb=clean(j.get("excerpt"), 260)))
    return out


def from_weworkremotely():
    out = []
    for feed in ("remote-programming-jobs", "remote-devops-sysadmin-jobs"):
        raw = get(f"https://weworkremotely.com/categories/{feed}.rss")
        if not raw:
            continue
        for item in re.findall(r"<item>(.*?)</item>", raw, re.S):
            def tag(name):
                m = re.search(rf"<{name}[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</{name}>", item, re.S)
                return clean(m.group(1)) if m else ""
            title = tag("title")
            company, _, role = title.partition(":")
            out.append(dict(
                title=clean(role or title), company=clean(company) if role else "",
                location=tag("region") or "Remote", url=tag("link"),
                posted=iso(tag("pubDate")), raw_tags=[tag("category")],
                salary_min=None, salary_max=None,
                source="We Work Remotely", source_url="https://weworkremotely.com",
                blurb=tag("description")[:260]))
    return out


def from_simplify():
    """
    SimplifyJobs / Pitt CSC internship list — the only source here that publishes
    a visa-sponsorship field, which for a non-US applicant is the single most
    decisive line in a posting. Most rows say "Other", meaning unstated, and the
    page has to say so rather than implying silence means yes.
    """
    out = []
    for repo in ("Summer2026-Internships", "New-Grad-Positions"):
        raw = get(f"https://raw.githubusercontent.com/SimplifyJobs/{repo}/dev/.github/scripts/listings.json")
        if not raw:
            continue
        for j in json.loads(raw):
            if not (j.get("active") and j.get("is_visible")):
                continue
            locs = j.get("locations") or []
            out.append(dict(
                title=clean(j.get("title")), company=clean(j.get("company_name")),
                location=", ".join(locs[:3]) if isinstance(locs, list) and locs else "",
                url=j.get("url"), posted=iso(j.get("date_posted")),
                raw_tags=[str(j.get("category") or "")] + [str(t) for t in (j.get("terms") or [])],
                salary_min=None, salary_max=None,
                sponsorship=j.get("sponsorship"),
                # This source states outright whether a listing is still open, so
                # its rows are exempt from the age cutoff below. Without that the
                # entire summer internship cycle vanished: those postings are
                # dated December but stay open for months, and a 45-day rule
                # deleted every single one — including all 33 rows carrying a
                # visa-sponsorship answer, the most useful field in the dataset.
                verified_active=True,
                source="SimplifyJobs / Pitt CSC",
                source_url=f"https://github.com/SimplifyJobs/{repo}",
                blurb=""))
    return out


SOURCES = {
    "remoteok": from_remoteok, "remotive": from_remotive, "jobicy": from_jobicy,
    "himalayas": from_himalayas, "weworkremotely": from_weworkremotely, "simplify": from_simplify,
}

# ================================================================ pipeline
def relevant(j):
    title = j["title"] or ""
    if EXCLUDE.search(title):
        return False
    if STRONG.search(title):
        return True
    # A weak title can still qualify on an explicit tag from the source.
    tags = " ".join(j.get("raw_tags") or [])
    return bool(STRONG.search(tags) and WEAK.search(title))


def enrich(j):
    hay = f"{j['title']} {' '.join(j.get('raw_tags') or [])} {j.get('blurb','')}"
    j["tags"] = [name for name, pat in TAG_RULES if re.search(pat, hay, re.I)]
    j["level"] = next((name for name, pat in LEVEL_RULES if re.search(pat, j["title"], re.I)), "mid")
    sp = (j.get("sponsorship") or "").strip()
    j["sponsorship"] = sp if sp and sp != "Other" else None
    j.pop("raw_tags", None)
    return j


def key(j):
    """Same role syndicated to three boards should appear once."""
    t = re.sub(r"[^a-z0-9]", "", (j["title"] or "").lower())
    c = re.sub(r"[^a-z0-9]", "", (j["company"] or "").lower())
    return (c, t[:48])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--source", choices=sorted(SOURCES))
    args = ap.parse_args()

    chosen = {args.source: SOURCES[args.source]} if args.source else SOURCES
    all_jobs, per_source, failed = [], {}, []

    for name, fn in chosen.items():
        log(f"  {name} …")
        try:
            got = fn()
        except Exception as e:
            log(f"    FAILED: {type(e).__name__}: {e}")
            failed.append(name)
            continue
        if not got:
            failed.append(name)
        per_source[name] = len(got)
        log(f"    {len(got)} listings")
        all_jobs += got

    # filter → dedupe → age → sort
    kept = [j for j in all_jobs if j.get("url") and j.get("title") and relevant(j)]
    seen, deduped = set(), []
    for j in kept:
        k = key(j)
        if k in seen:
            continue
        seen.add(k)
        deduped.append(enrich(j))

    # Two pools, so neither can crowd the other out. Sorting the combined set by
    # date alone filled every slot with this week's feed listings and left no
    # room for the internship cycle, which is what a student actually wants.
    cutoff = (datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)).date().isoformat()
    verified = [j for j in deduped if j.get("verified_active")]
    # Partition, don't filter twice. Building `feeds` from all of `deduped` put
    # every confirmed-active row in both pools, and one source then took 496 of
    # the 500 slots.
    feeds = [j for j in deduped
             if not j.get("verified_active") and (not j.get("posted") or j["posted"] >= cutoff)]
    for j in deduped:
        j.pop("verified_active", None)

    by_date = lambda xs: sorted(xs, key=lambda j: j.get("posted") or "", reverse=True)
    # Within the confirmed-active pool, a listing that actually answers the visa
    # question outranks one that stays silent — for a non-US applicant that line
    # decides whether the rest of the posting matters. Sorting by date alone
    # buried all 33 of them below the cut, because they are older postings that
    # are still open.
    by_useful = lambda xs: sorted(
        xs, key=lambda j: (j.get("sponsorship") is not None, j.get("posted") or ""), reverse=True)

    # Reserve half the slots for the live feeds so one big source cannot swamp
    # them, but hand back whatever they don't use — the remote boards carry far
    # fewer genuinely-AI roles than the internship list does, and capping both
    # at half published 306 of a possible 500 for no reason.
    take_feeds = by_date(feeds)[: MAX_JOBS // 2]
    take_verified = by_useful(verified)[: MAX_JOBS - len(take_feeds)]
    fresh = by_date(take_feeds + take_verified)

    log(f"\n  {len(all_jobs)} fetched → {len(kept)} AI-relevant → {len(deduped)} after dedupe")
    log(f"  {len(feeds)} from feeds within {MAX_AGE_DAYS} days + "
        f"{len(verified)} confirmed-active → {len(fresh)} published")
    log(f"  levels: {dict(Counter(j['level'] for j in fresh))}")
    log(f"  with stated sponsorship: {sum(1 for j in fresh if j['sponsorship'])}")

    doc = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "checked": datetime.now(timezone.utc).date().isoformat(),
        "count": len(fresh),
        "fetched": len(all_jobs),
        "perSource": per_source,
        "failedSources": failed,
        "maxAgeDays": MAX_AGE_DAYS,
        "attribution": (
            "Listings are mirrored daily from Remote OK, Remotive, Jobicy, Himalayas, "
            "We Work Remotely and SimplifyJobs / Pitt CSC. Every card links to the original "
            "posting on its source site. This site does not host applications, does not "
            "represent employers, and cannot confirm a role is still open."
        ),
        "jobs": fresh,
    }

    if args.dry_run:
        for j in fresh[:15]:
            log(f"  {j['posted']}  {j['level']:<11} {j['company'][:20]:<20} {j['title'][:52]}")
        log(f"\n  (dry run — {OUT} not written)")
        return 0

    OUT.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    log(f"\n  wrote {OUT.relative_to(ROOT)} — {len(fresh)} jobs, {OUT.stat().st_size // 1024} KB")

    # Every source failing means the network or every API died at once; that is a
    # real failure. One source failing is normal and must not block the update.
    if len(failed) == len(chosen):
        log("  ERROR: every source failed")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
