#!/usr/bin/env python3
"""
Pull live job listings from public job feeds into data/jobs.json.

Run daily by .github/workflows/jobs.yml. No API key, no scraping, no paid tier:
every source below publishes a JSON API or an RSS feed for exactly this use.
Each listing keeps its source name and links straight back to the original —
which is both the honest thing and, for Remote OK, a condition of their terms.

  python tools/fetch-jobs.py              # fetch, filter, write data/jobs.json
  python tools/fetch-jobs.py --dry-run    # print what it would write
  python tools/fetch-jobs.py --source remoteok

Every field, not just AI. The first version filtered to AI/ML because that is
what I was looking for, which made the page useless to everyone else who lands
on it. Now it keeps everything the feeds carry and tags each listing with a
field, so a designer, a marketer or an accountant can filter to their own work
instead of being told there is nothing for them.

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
MAX_JOBS = 1200          # keeps the committed JSON well under 1 MB so the page loads fast
MAX_AGE_DAYS = 45       # older than this and the listing is usually gone

# ---------------------------------------------------------------- taxonomy
# One field per listing, decided by the first rule that matches the title, then
# the source's own tags. Order matters: "Marketing Data Analyst" is a data role
# before it is a marketing one, so the more specific rule sits higher.
FIELD_RULES = [
    ("ai-ml",       r"\b(machine learning|deep learning|artificial intelligence|\bml\b|\bai\b|"
                    r"\bllm\b|\bnlp\b|computer vision|mlops|generative|foundation model|"
                    r"reinforcement learning|prompt engineer|research scien|applied scien)\b"),
    ("data",        r"\b(data scien|data engineer|data analyst|analytics|business intelligence|"
                    r"\bbi\b|etl|warehouse|database|\bsql\b)\b"),
    ("security",    r"\b(security|cyber|infosec|penetration test|appsec|soc analyst|compliance engineer)\b"),
    ("devops",      r"\b(devops|sre|site reliability|infrastructure|platform engineer|cloud engineer|"
                    r"kubernetes|systems engineer|network engineer)\b"),
    ("software",    r"\b(software|developer|engineer|programmer|full.?stack|front.?end|back.?end|"
                    r"mobile|ios|android|web dev|\bqa\b|test engineer|architect)\b"),
    ("design",      r"\b(design|\bux\b|\bui\b|creative|graphic|brand|illustrat|motion|art director)\b"),
    ("product",     r"\b(product manager|product owner|product lead|program manager|project manager|"
                    r"scrum|business analyst)\b"),
    ("marketing",   r"\b(marketing|\bseo\b|content|copywrit|social media|growth|brand manager|"
                    r"communications|\bpr\b|editor|writer)\b"),
    ("sales",       r"\b(sales|account executive|business development|partnerships|revenue|"
                    r"customer success|account manager)\b"),
    ("support",     r"\b(support|customer service|help desk|service desk|community manager|moderator)\b"),
    ("finance",     r"\b(financ|account(ant|ing)|bookkeep|payroll|audit|tax|treasury|controller|"
                    r"underwrit|actuar)\b"),
    ("people",      r"\b(recruit|talent|human resources|\bhr\b|people operations|"
                    r"compensation|benefits|training)\b"),
    ("operations",  r"\b(operations|logistics|supply chain|procurement|facilities|"
                    r"administrat|executive assistant|virtual assistant|coordinator)\b"),
    ("healthcare",  r"\b(nurse|clinical|medical|health|pharmac|physician|therapist|"
                    r"dental|patient|biotech|life scien)\b"),
    ("education",   r"\b(teacher|tutor|instructor|curriculum|academic|lecturer|"
                    r"education|professor|trainer)\b"),
    ("legal",       r"\b(legal|lawyer|attorney|paralegal|counsel|contract manager|regulatory)\b"),
    ("research",    r"\b(research|scientist|\bphd\b|laboratory|\br&d\b)\b"),
]

# Rows that are not really a job. Boards carry these and they waste a click.
JUNK = re.compile(
    r"^(no current openings|express your interest|general application|"
    r"don'?t see your role|open application|talent (pool|network)|"
    r"future opportunit|join our talent|speculative)", re.I)

TAG_RULES = [
    ("llm",       r"\b(llm|large language model|gpt|transformer|prompt)\b"),
    ("nlp",       r"\b(nlp|natural language)\b"),
    ("vision",    r"\b(computer vision|image|visual|perception|multimodal)\b"),
    ("mlops",     r"\b(mlops|inference|deployment|serving)\b"),
    ("remote",    r"\b(remote|anywhere|work from home|distributed)\b"),
    ("robotics",  r"\b(robot|autonomous|self-driving|adas)\b"),
    ("agents",    r"\b(agent|agentic|tool.?call|orchestrat)\b"),
]

# What KIND of opportunity this is, which is the facet a visitor actually thinks
# in: "I want a PhD place" is a different question from "I want a job". Order
# matters — a "PhD Research Intern" is an internship first.
TYPE_RULES = [
    ("internship",  r"\b(intern|internship|co-?op|summer (programme|program|school)|placement|trainee)\b"),
    ("phd",         r"\b(phd|ph\.d|doctoral|doctorate|studentship|graduate school)\b"),
    ("scholarship", r"\b(scholarship|fellowship|bursary|stipend award|grant|funded (place|position)|"
                    r"fully funded|tuition)\b"),
    ("research",    r"\b(postdoc|post-?doctoral|research (fellow|associate|assistant|scientist|engineer)|"
                    r"scientist|laboratory|\br&d\b)\b"),
]

LEVEL_RULES = [
    ("internship", r"\b(intern|internship|co-?op|placement|trainee)\b"),
    ("new-grad",   r"\b(new ?grad|graduate|entry.?level|junior|university grad|campus|associate)\b"),
    ("senior",     r"\b(senior|staff|principal|lead|director|head of|manager|vp|chief)\b"),
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
    # Bare /api is the newest 100 of any kind; the tag endpoints reach further
    # back within a speciality. Use both so the mix is broad and current.
    out, data = [], []
    raw = get("https://remoteok.com/api")
    if raw:
        data += json.loads(raw)
    for tag in ("machine-learning", "data-science", "design", "marketing",
                "customer-support", "finance", "sales", "devops", "writing"):
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
    urls = [f"https://remotive.com/api/remote-jobs?category={c}"
            for c in ("software-dev", "data", "design", "marketing", "sales", "product",
                      "customer-support", "devops", "finance-legal", "hr", "qa",
                      "writing", "business", "all-others")]
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
    urls = ["https://jobicy.com/api/v2/remote-jobs?count=100"]
    urls += [f"https://jobicy.com/api/v2/remote-jobs?count=100&industry={i}"
             for i in ("data-science", "engineering", "design-multimedia", "marketing",
                       "business", "supporting", "hr", "copywriting", "seller",
                       "management", "administration", "accounting-finance")]
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
    for offset in range(0, 600, 20):
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
    for feed in ("remote-programming-jobs", "remote-devops-sysadmin-jobs",
                 "remote-design-jobs", "remote-customer-support-jobs",
                 "remote-marketing-jobs", "remote-product-jobs",
                 "remote-management-and-finance-jobs", "all-other-remote-jobs"):
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



def from_jobrxiv():
    """
    jobRxiv — a science job board with ~3,200 live research positions: PhD
    places, postdocs, research fellows and lab scientists. It runs WordPress
    and exposes the standard wp/v2 REST API, so this is a documented endpoint
    rather than anything scraped.

    Regions come back as taxonomy IDs, so the term list is fetched once and
    used as a lookup instead of leaving every listing without a country.
    """
    regions = {}
    raw = get("https://jobrxiv.org/wp-json/wp/v2/job_listing_region?per_page=100")
    if raw:
        for t in json.loads(raw):
            regions[t["id"]] = t["name"]

    out = []
    for page in range(1, 7):        # 6 x 100; the whole board is far larger
        raw = get(f"https://jobrxiv.org/wp-json/wp/v2/job-listings?per_page=100&page={page}")
        if not raw:
            break
        rows = json.loads(raw)
        if not rows:
            break
        for j in rows:
            meta = j.get("meta") or {}
            if meta.get("_filled"):          # the board marks closed roles
                continue
            locs = [regions.get(r) for r in (j.get("job_listing_region") or [])]
            out.append(dict(
                title=clean((j.get("title") or {}).get("rendered")),
                company=clean(meta.get("_company_name")),
                location=", ".join([l for l in locs if l]) or "",
                url=j.get("link"), posted=iso(j.get("date")),
                raw_tags=["research", "academic"],
                salary_min=None, salary_max=None,
                source="jobRxiv", source_url="https://jobrxiv.org",
                blurb=clean((j.get("excerpt") or {}).get("rendered"), 260)))
    return out


def from_nature():
    """Nature Careers RSS — academic and industry research posts. Its feed
    ignores the country parameter and returns the same 20 items either way, so
    it is fetched once rather than pretending pagination exists."""
    out = []
    raw = get("https://www.nature.com/naturecareers/jobsrss/")
    if not raw:
        return out
    for item in re.findall(r"<item>(.*?)</item>", raw, re.S):
        def tag(name):
            m = re.search(rf"<{name}[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</{name}>", item, re.S)
            return clean(m.group(1)) if m else ""
        title = tag("title")
        # Nature formats titles as "Employer: Role".
        company, _, role = title.partition(":")
        out.append(dict(
            title=clean(role or title), company=clean(company) if role else "",
            location="", url=tag("link"), posted=iso(tag("pubDate")),
            raw_tags=["research", "academic"],
            salary_min=None, salary_max=None,
            source="Nature Careers", source_url="https://www.nature.com/naturecareers",
            blurb=tag("description")[:260]))
    return out


SOURCES = {
    "remoteok": from_remoteok, "remotive": from_remotive, "jobicy": from_jobicy,
    "himalayas": from_himalayas, "weworkremotely": from_weworkremotely, "simplify": from_simplify,
    "jobrxiv": from_jobrxiv, "nature": from_nature,
}

# ================================================================ pipeline
def keep(j):
    """
    Was: an AI/ML-only gate. Now the only thing dropped is a row that is not a
    job — "NO CURRENT OPENINGS", "Express your interest", talent-pool pages.
    Filtering by field is the visitor's decision, not mine, so it happens in the
    browser against the `field` tag rather than here.
    """
    title = (j.get("title") or "").strip()
    return bool(title) and not JUNK.search(title)


def enrich(j):
    tags_text = " ".join(j.get("raw_tags") or [])
    title = j["title"]
    # Title first, then the source's tags. A title is written by the employer;
    # board tags are frequently wrong — one board filed a pharmacy job under AI.
    j["field"] = (next((n for n, pat in FIELD_RULES if re.search(pat, title, re.I)), None)
                  or next((n for n, pat in FIELD_RULES if re.search(pat, tags_text, re.I)), "other"))
    hay = f"{title} {tags_text} {j.get('blurb','')}"
    j["tags"] = [n for n, pat in TAG_RULES if re.search(pat, hay, re.I)]
    j["level"] = next((n for n, pat in LEVEL_RULES if re.search(pat, title, re.I)), "mid")
    # A hand-verified programme carries its own type; everything else is read
    # off the title, defaulting to a plain job.
    j["type"] = j.get("type") or next(
        (n for n, pat in TYPE_RULES if re.search(pat, title, re.I)), "job")
    sp = (j.get("sponsorship") or "").strip()
    j["sponsorship"] = sp if sp and sp != "Other" else None
    # blurb exists only to inform the tagging above; shipping it would roughly
    # double the JSON the browser downloads and nothing renders it.
    j.pop("raw_tags", None)
    j.pop("blurb", None)
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
    kept = [j for j in all_jobs if j.get("url") and keep(j)]
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
    picked = take_feeds + take_verified

    # Then give each type a floor, so volume cannot bury the rare categories.
    # Sorting purely by date published 896 ordinary jobs, 3 PhD places and 2
    # scholarships — and the rare ones are exactly what somebody opens this page
    # for. Taking every scarce row instead swung it the other way: internships
    # are not scarce (SimplifyJobs alone carries 1,256), so they filled all 1,200
    # slots and the board had no ordinary jobs left at all. Hence quotas, not
    # "keep everything unusual".
    QUOTA = {"phd": 200, "scholarship": 200, "research": 250, "internship": 350}

    ranked = by_date(feeds) + by_useful(verified)
    fresh, seen_urls = [], set()

    def add(j):
        if j["url"] in seen_urls:
            return False
        seen_urls.add(j["url"])
        fresh.append(j)
        return True

    for t, cap in QUOTA.items():
        taken = 0
        for j in ranked:
            if taken >= cap:
                break
            if j["type"] == t and add(j):
                taken += 1

    for j in picked:                       # plain jobs fill whatever is left
        if len(fresh) >= MAX_JOBS:
            break
        add(j)
    fresh = by_date(fresh)

    log(f"\n  {len(all_jobs)} fetched → {len(kept)} real listings → {len(deduped)} after dedupe")
    log(f"  {len(feeds)} from feeds within {MAX_AGE_DAYS} days + "
        f"{len(verified)} confirmed-active → {len(fresh)} published")
    log(f"  types : {dict(Counter(j['type'] for j in fresh))}")
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
            "We Work Remotely, SimplifyJobs / Pitt CSC, jobRxiv and Nature Careers. Every card links to the original "
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
