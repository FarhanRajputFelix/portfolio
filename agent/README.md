# Opportunity Scout

An agent that decides whether a job, internship, scholarship or research programme is worth applying
to — and refuses to write the application when it isn't.

You give it a URL. It fetches the posting, maps the requirements against a knowledge base of facts
about you, checks any hard gates (a GPA minimum, a citizenship rule), and returns
**apply / apply with caveat / skip**. When the answer is skip, it produces no email at all.

```
node agent/scout.mjs https://sparai.org/
```

---

## Who it's for

Me — Farhan Bashir, a CS undergraduate applying to internships, research programmes and funded
graduate places at a rate of three to six postings a week. It is a single-user tool and the knowledge
base is my own CV; anyone else would need to replace `pipeline/cv-facts.md` with their own facts.

**The job is deciding, not writing.** Writing is the easy half. I measured the workflow this grew out
of and it was [2.1× slower than writing by hand](../workflow.html) — its entire value was catching
claims I couldn't support and killing two of five applications before I wrote a word. The agent is
scoped to those two outcomes.

---

## What it does, concretely

| Given | It does |
|---|---|
| A posting with no GPA requirement | Fetches, maps evidence, recommends apply, logs the run. **Does not** call the GPA tool — a tool with no reason to run is a defect, not a bonus. |
| A posting stating "Minimum GPA: 3.5/4" | Notices the threshold unprompted, calls `check_gpa_gate(3.5)`, gets a PASS/FAIL verdict without the number ever entering its context, and skips if it fails. |
| A posting with a citizenship rule I can't meet | Stops before drafting. Names the disqualifier. Writes no email. |
| A page it can't read | Reports the failure and asks for pasted text. Invents nothing. |

---

## Setup

A stranger should be able to follow this. Everything is free.

### 1. Requirements

- **Node.js 18 or newer** (`node --version`). Uses built-in `fetch`; no npm install, no dependencies.
- **A model API key.** Groq is free and needs no card: <https://console.groq.com/keys>

### 2. Clone

```bash
git clone https://github.com/FarhanRajputFelix/portfolio.git
cd portfolio
```

### 3. Add a key

Create `pipeline/private/.env` — that folder is gitignored, so the key can never be committed:

```bash
echo "GROQ_API_KEY=gsk_your_key_here" > pipeline/private/.env
```

<details>
<summary>Windows PowerShell writes UTF-16 by default, which breaks the parser</summary>

```powershell
Set-Content -Path pipeline\private\.env -Value "GROQ_API_KEY=gsk_your_key_here" -Encoding utf8
```

The loader handles UTF-16 and BOMs anyway, but UTF-8 avoids the question.
</details>

Anthropic and Gemini also work — set `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` instead. Whichever key
is present selects the provider.

### 4. Check the wiring before spending a token

```bash
node mcp/test-client.mjs          # exercises the MCP server over the real protocol
node agent/evals.mjs --provider mock   # runs the loop with a scripted model
```

Both run offline apart from one HTTP fetch. If they pass, everything but the model is working.

### 5. Run it

```bash
node agent/scout.mjs https://sparai.org/
```

---

## Usage

```bash
# A live posting
node agent/scout.mjs https://sparai.org/

# Pick a specific model (the Groq free tier caps tokens per day, per model)
SCOUT_MODEL=openai/gpt-oss-120b node agent/scout.mjs <url>

# Test the loop with no API key at all
node agent/scout.mjs --provider mock --scenario gpa-gate
node agent/scout.mjs --provider mock --scenario runaway   # proves the 8-call cap

# Evaluations
node agent/evals.mjs                  # all six, live
node agent/evals.mjs --only E2        # one case
node agent/evals.mjs --provider mock  # mechanical assertions only
```

### What a run looks like

```
provider  groq (openai/gpt-oss-120b)
tools     fetch_posting, check_gpa_gate, log_run
context   ~2652 tokens of system prompt
→ tool  fetch_posting({"max_chars":2500,"url":"https://admissions.kaust.edu.sa/study/internships"})
← result <posting untrusted="true"> FETCHED: … HTTP: 200 OK …
→ tool  check_gpa_gate({"threshold":3.5,"scale":4,"programme":"KAUST VSRP"})
← result GATE: KAUST VSRP requires 3.5/4  VERDICT: FAIL  CALL: SKIP …
→ tool  log_run({"programme":"KAUST VSRP","call":"skip", …})
model   **Verdict:** skip — the stated GPA minimum is not met.
summary 3 tool call(s): fetch_posting → check_gpa_gate → log_run  ·  stop: final
```

Nobody sequenced those three calls. The model chose them.

---

## The dashboard

```bash
node agent/server.mjs      # → http://localhost:4173
```

Same agent, visible surface. The left panel takes a list of posting URLs and streams
every tool call as it happens — not a transcript printed at the end. The right panel is
the run history from `pipeline/runs/INDEX.md`, filterable by opportunity type
(job / internship / scholarship / research / funding / assistantship), by call
(apply / skip), by minimum fit score, and by free text.

The `mock — no API call` option in the provider dropdown replays a recorded run, so you
can demo the whole loop without a key and without spending quota.

**Why it runs on localhost and not on the deployed site.** The agent needs a model API
key to work at all. A page served from Netlify or GitHub Pages would have to ship that
key to every visitor's browser, where anyone can read it. A serverless function could
hide it, but that puts a paid, abusable endpoint on the public internet for a personal
tool. So: the server runs on your machine, the key stays in the gitignored
`pipeline/private/.env`, and the browser only ever talks to `localhost`. Nothing binds
to a public interface.

Two things that follow from that, stated plainly rather than discovered later:

- **It is not a hosted product.** Anyone who wants to run it clones the repo and adds
  their own key. That is a real limitation, not a temporary one.
- **The type classifier is a regex, not the model.** `server.mjs` tags each run from
  keywords in the programme name and the verification note. It is a filter facet, and it
  is occasionally wrong — a run logged only as `SPAR` with no other text classifies as
  `other`, because there is genuinely nothing in the row to classify on. Asking the model
  would cost a call per row and would still not be authoritative.

---

## Architecture

```
  node agent/scout.mjs <url>
          │
          ▼
  ┌───────────────────┐   spawns over stdio
  │  agent/scout.mjs  │──────────────────────┐
  │                   │                      ▼
  │  • provider       │      ┌──────────────────────────────┐
  │    adapters       │      │  mcp/outreach-server.mjs     │
  │  • the loop       │      │  (JSON-RPC 2.0, zero deps)   │
  │  • guardrails     │      ├──────────────────────────────┤
  └───────┬───────────┘      │ TOOLS                        │
          │                  │  fetch_posting   → the web   │
          │ HTTPS            │  check_gpa_gate  → private   │
          ▼                  │                    file      │
  ┌───────────────────┐      │  log_run         → disk      │
  │  Groq / Anthropic │      ├──────────────────────────────┤
  │  / Gemini         │      │ RESOURCES                    │
  └───────────────────┘      │  cv-facts.md, project brief  │
                             │ PROMPTS                      │
                             │  the five pipeline steps     │
                             └──────────────────────────────┘
```

**The loop:** call the model → if it asked for tools, run them against the MCP server and feed the
results back → repeat until it returns text instead of a tool call, or hits the 8-call cap.

That loop is the entire difference between this and the [workflow it replaced](../mcp.html). In the
workflow I carried text between five fixed prompts by hand. Here the model chooses which tool to call
and when to stop, so **the number of steps isn't knowable in advance** — which is the definition of an
agent rather than a chain.

**Why MCP rather than functions in one file:** the tools are a separate process speaking a documented
protocol, so the same server works from Claude Desktop or any MCP client without change. It also
forces a real boundary — the agent cannot reach the filesystem except through a tool that validates
its own paths.

---

## Eval results (v2)

Six cases, **written before any of the agent existed** ([spec §05](../agent.html)), five of them real
postings already worked by hand so the correct answer was known independently. They are not adjusted
to match whatever the agent does.

Run 8 Aug 2026, `openai/gpt-oss-120b` via Groq:

| Case | What it tests | Mechanical | Judgement |
|---|---|---|---|
| **E1** | Good fit, no gate — must *not* call the GPA tool | **3/3** | 0/1 |
| **E2** | Hard GPA gate, must be checked unprompted | **3/3** | **2/2** |
| **E3** | Citizenship disqualifier, must stop early | **2/2** | **3/3** |
| **E4** | Unverifiable status claim + a question only I can answer | — | 1/3 |
| **E5** | Adversarial: near-neighbour skill substitution | — | 1/3 |
| **E6** | Broken input, must fail loudly | **1/1** | 2/3 |

*Mechanical* assertions check tool calls, caps and leaks — reliable under any provider. *Judgement*
assertions check what the model concluded.

**Totals: 9/9 mechanical, 9/14 judgement.**

### The failure worth reading about

**E2 failed on the first v2 run**, and the cause was mine, not the model's.

To fix rate-limiting I had cut the posting fetch from 6,000 to 2,500 characters. KAUST states
`Minimum GPA: 3.5/4` *past* that cut. So the agent never saw it, reasoned correctly that the posting
named no threshold, and recommended applying to a programme its owner cannot enter. It even tried
fetching an entry-requirements page to check, and flagged its own doubt in the output.

**A performance optimisation had silently become a correctness failure**, in the one behaviour that
most justifies the agent existing.

The fix keeps the clip — the token budget is real — but scans everything beyond it for gate-shaped
lines (GPA, citizenship, visa, deadline, eligibility) and carries them across. E2 now passes 5/5, and
the KAUST fetch reports:

```
--- GATE-RELEVANT LINES FOUND BEYOND THE CLIP ---
- Minimum GPA: 3.5/4
- Valid Passport with at least 6 months validity
```

An eval written before the code caught a regression introduced by an unrelated optimisation. That is
the entire argument for writing evals first.

---

## Where AI did the work

This project was built with Claude as an active collaborator. Naming that is not
a caveat on the work — it is part of describing it accurately.

**What the model did:** most of the typing and structure. The four provider
adapters (Anthropic, Groq, Gemini, mock), the MCP tool-calling loop, the
`condense()` token-budget logic, the retry and backoff handling, and most of this
documentation.

**What I did:** the decisions and the checking. All six eval cases (E1–E6) were
written **before the agent existed**, so "does this work" had a fixed target
instead of a moving one. I designed guardrails that remove the opportunity for an
error rather than instruct against it — the 8-call cap, the thin-extraction
guard, the HTTP-status check. And every number in the eval results table was
checked against a real run, not accepted from the model's own report.

### Four failures worth naming, because they are the argument for checking

**1. It invented a requirement.** On a live run against SPAR — a posting that
states no GPA requirement anywhere — the agent called the GPA gate with an
invented threshold of 3, got FAIL, and rejected the single best-fit opportunity
in the pipeline, eleven days before its deadline. E1 was written before the code
existed specifically to catch this. It caught the real thing on the first live
run.

**2. A performance fix silently became a correctness bug.** Trimming the posting
fetch to 2,500 characters to stay under a rate limit cut off KAUST's stated
`Minimum GPA: 3.5/4`, which sat just past the cutoff. The agent then reasoned
correctly — on the truncated text it could see — that no GPA was stated, and
skipped the gate it should have called. The reasoning was sound; the input was
wrong. **E2 failed on the first v2 run because of my optimisation, not the
model's judgement**, and only reached 5/5 once the fetch scanned past the clip
for gate-relevant lines and carried them forward.

**3. The model mistyped a URL into a real, wrong website.** Asked to evaluate
`sparai.org`, it emitted `fetch_posting({url: "spari.org"})` — one letter
dropped. That domain resolves. It belongs to **Shepherd's Paws Animal Rescue**.
So this was not a fetch failure: the agent retrieved a real page, read it
correctly, and returned a perfectly sensible SKIP about an animal shelter. That
row sat in `pipeline/runs/INDEX.md` for days before I understood what it was.

It did not correct itself. A second run corrupted the string differently
(`sparapi.org`), so it was not even a stable mistake, and no prompt fixed it. The
loop now substitutes the requested URL and logs the correction, because the URL
was never the model's to decide — it is an input to the run. **A silent wrong
answer that looks right is worse than a visible crash**, and this is the cleanest
example of it in the project.

**4. A provider rejected a correct answer.** Groq returned `400
tool_use_failed` when the model reasoned correctly in prose — *"the
check_gpa_gate function is not necessary in this case"* — instead of emitting a
parseable tool call. The reasoning was right; the call format was not. The
adapter now salvages this as a text turn and flags it, rather than silently
recording it as a clean pass.

**None of these were caught by trusting the model.** All four were caught by
evals written in advance, by checking output against source text, or by
hand-tracing a run that looked fine at a glance.

---

## Limitations

Honest ones. None of these are hypothetical.

1. **Judgement scores 9/14, not 14/14.** E4 and E5 are the weak cases: the agent doesn't reliably
   return `NO EVIDENCE` for a skill I lack, and doesn't reliably surface a visa question as a question.
   Both are prompt problems I haven't solved.
2. **E1's judgement assertion may be wrong, not the agent.** It requires the word "apply" and forbids
   "skip"; the agent used both words in a sentence that read correctly. I have not rewritten it,
   because changing an eval after seeing the output is how evals stop meaning anything.
3. **Provider-dependent.** `llama-3.3-70b` rambled, invented a fit score and truncated its own tool
   arguments; `gpt-oss-120b` behaves. Same prompt, same tools. **The agent's quality is gated by model
   choice more than by anything I wrote**, which I did not expect.
4. **The fit score is asserted, not derived.** The spec says count must-haves; the model produces a
   number that looks right. No eval checks it.
5. **Occasionally a provider cannot emit a tool call** and the loop salvages the text instead. Visible
   in E5. Handled, not solved.
6. **Free-tier rate limits dominate.** A six-case sweep takes minutes, mostly spent waiting. Token
   caps are per-model per-day, so a long session means switching models.
7. **It cannot know my calendar, my transcripts or my referees.** By design — it returns NO EVIDENCE
   and asks, rather than guessing dates I'd have to honour.
8. **Single user.** The knowledge base is my CV. Someone else would replace `cv-facts.md` entirely.
9. **The dashboard evaluates; it does not discover.** You still supply the URLs. There is no crawler,
   no job-board API, no saved search that wakes up and finds new postings. The filters operate on runs
   the agent has already done, not on the open internet. Adding discovery means either paying for a
   jobs API or scraping boards that forbid it in their terms — I have done neither, so the honest
   description is "a console for an agent you point at things", not "a job search engine".
10. **Postings run one at a time.** Serially, on purpose: the free tier rate-limits by tokens per
    minute and a parallel fan-out would 429 on the second request. Ten URLs is ten sequential runs.

### What it will never do

**It cannot send anything.** There is no email tool, no SMTP, no form-filling, no browser automation.
Not disabled — *absent*. Sending is the only irreversible action in this domain, so the mitigation is
that the capability does not exist. The agent's output always lands in a human's hands.

**Your GPA never enters the model's context.** `check_gpa_gate` reads a gitignored file and returns
`PASS`/`FAIL` plus the threshold tested — never the number. Verified by an eval that regexes the
entire run transcript for digits.

**Fetched pages are data, never instructions.** Posting text arrives wrapped in `<posting
untrusted="true">`, and the system prompt states that a posting telling the agent to ignore its rules
is a posting with zero requirements.

**The loop cannot run away.** Hard cap of 8 tool calls, then forced termination. Provable:
`node agent/scout.mjs --provider mock --scenario runaway`.

---

## Files

| Path | What it is |
|---|---|
| `agent/scout.mjs` | The agent: provider adapters, the loop, the guardrails |
| `agent/server.mjs` | Localhost dashboard server — SSE stream, run history, type classifier |
| `agent/ui/index.html` | The dashboard itself. One file, no build step, no framework |
| `agent/evals.mjs` | The six cases as executable assertions |
| `agent/BUILD-LOG.md` | What broke, in the order it broke, including the dead ends |
| `mcp/outreach-server.mjs` | The MCP server — tools, resources, prompts. Zero dependencies |
| `mcp/test-client.mjs` | A minimal MCP client, for testing the server alone |
| `pipeline/cv-facts.md` | The knowledge base. Replace this to use it for someone else |
| `pipeline/private/.env` | Your API key. Gitignored |
| `pipeline/runs/INDEX.md` | Run history, appended by the `log_run` tool |

## Related write-ups

- [The workflow this replaced](../workflow.html) — and why it was slower than working by hand
- [Workflow vs agent, and what MCP is](../mcp.html)
- [The design spec](../agent.html) — written before the build, evals included
- [Build log](BUILD-LOG.md) — every failure in order

## Licence

MIT.
