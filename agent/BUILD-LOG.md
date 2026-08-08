# Build log — Opportunity Scout (FL-07)

Spec: [../agent.html](../agent.html) · Agent: [scout.mjs](scout.mjs) · Evals: [evals.mjs](evals.mjs)
Tools: [../mcp/outreach-server.mjs](../mcp/outreach-server.mjs)

Written as it happened, on 7 August 2026. I did not stopwatch individual steps, so there are no
per-task durations here — inventing them would be worse than omitting them. What follows is the order
things happened in and what broke.

---

## 1. The spec's platform choice failed immediately

FL-06 §03 named **Claude via the Anthropic API**, with the honest note that this was "the only real
access risk" because it needs a key I don't hold. That risk landed on the first command.

- No `ANTHROPIC_API_KEY`, `GROQ_API_KEY` or `GEMINI_API_KEY` in the environment.
- Searched for keys in my other projects. Found a `GEMINI_API_KEY` in `Hack/sahara_backend/.env`.
- Tried it against the Gemini models endpoint:

```
API ERROR: Your API key was reported as leaked. Please use another API key.
```

Google had already revoked it. I checked whether the `.env` had been committed to the
Anti-gravity-Hackathon repo — it hadn't, and the key doesn't appear anywhere in that repo's history
either, so the leak came from somewhere else I haven't identified. **Separate problem, but worth
recording: a key of mine got scraped from somewhere public.**

**Deviation from spec, and the reason:** instead of hard-wiring one provider, `scout.mjs` has four
adapters — `anthropic`, `groq`, `gemini` and `mock` — selected by whichever key is present. This costs
about 60 lines and removes the single point of failure the spec had already flagged as its biggest
risk. It also mirrors KIDO's own Groq → Gemini → fallback chain, so the pattern isn't new to me.

**What this means for the deliverable, stated plainly:** the loop, the tools, the guardrails and the
eval harness are built and tested. The judgement half of the evals has **not** been run against a real
model, because I still have no working key. See §6.

---

## 2. First real run: the loop works, the model is the only mocked part

Scenario `gpa-gate`, mock provider:

```
provider  mock (mock)
tools     fetch_posting, check_gpa_gate, log_run
→ tool  fetch_posting({"url":"https://admissions.kaust.edu.sa/study/internships"})
← result <posting untrusted="true"> FETCHED: … HTTP: 200 OK BYTES OF HTML: 68416 …
→ tool  check_gpa_gate({"threshold":3.5,"scale":4,"programme":"KAUST VSRP (mock)"})
← result GATE: … VERDICT: FAIL  CALL: SKIP …
→ tool  log_run({"programme":"KAUST VSRP (mock)","call":"skip"})
← result LOGGED row 2 to pipeline/runs/INDEX.md
summary 3 tool call(s): fetch_posting → check_gpa_gate → log_run  ·  stop: final
```

Everything except the model's *choice of tool* is real here: a live 68 KB HTTP fetch, the gate reading
the gitignored private file and returning FAIL, an actual append to disk. Rows written during testing
are tagged `(mock)` so the run index doesn't fill with fake history.

---

## 3. The loop only accepted URLs, which eval E5 can't use

E5 is the adversarial case — a synthetic posting demanding PyTorch. There is no URL for a posting I
invented, and I was not going to publish a fake job ad somewhere just to fetch it.

Added a `postingText` path: a posting can arrive as text already in hand. This is not a workaround, it
is a case I'd overlooked in the spec — a PDF, an emailed posting, or a JavaScript-rendered page the
fetch tool can't read all arrive as text. The prompt tells the agent not to call `fetch_posting` when
the text is already supplied, and E3/E5 assert it doesn't.

---

## 4. Eval E6 failed, and found a real bug in the tool

E6 points the agent at a URL that 404s. It failed **0/2** on the first run.

The cause was a genuine defect in `fetch_posting`, written two days earlier and passing its own tests:
**it never checked the HTTP status.** It called `res.text()` and stripped tags regardless. A GitHub
Pages 404 page is several hundred characters of real HTML, so it sailed straight past the
thin-extraction guard I'd built specifically to catch unusable input. The guard was checking length
when the actual signal was the status code.

Fixed in the MCP server: any non-2xx response now returns `isError` with an explicit instruction not
to extract or infer requirements from an error page.

This is the eval doing its job. The guardrail existed, the eval was written before the code, and it
caught a hole the guardrail had left open.

---

## 5. E6 still failed after the fix — and that was the test's fault

Verified by hand that the tool now returns:

```
isError: True
text   : FETCH FAILED — HTTP 404 Not Found for …
```

…and E6 still reported `✗ extraction flagged as failed`. Confusing for a while.

The cause: my mock scenarios **hardcoded their URLs**. E6 passed a 404 URL, but the mock script called
`fetch_posting` on `sparai.org`, which returns 200. The eval was faithfully testing a URL nobody had
asked about, and reporting a pass/fail about something else entirely.

Fixed by having the mock substitute the URL from the actual request. Worth naming the general shape of
this, because it is nastier than a normal bug: **a test that exercises the wrong input doesn't fail
loudly, it reports confidently about nothing.** Same family as failure point 9 on the
[workflow page](../workflow.html) — the evidence file that was wrong the day it was written.

Also reclassified one assertion. "Did not log a verdict for a page it could not read" was marked
*mechanical*, but whether the agent goes on to log is the model's decision, so it is *judgement* and
meaningless under mock. Grading myself on a scripted mock's behaviour would have been a free pass.

---

## 6. Where it actually stands

**Mechanical assertions: 9/9 passing.**

```
  case  mechanical  judgement
  E1    3/3         n/a
  E2    3/3         n/a
  E3    2/2         n/a
  E4    —           n/a
  E5    —           n/a
  E6    1/1         n/a
```

Verified working, under mock but with every tool call and file operation real:

| Behaviour | Evidence |
|---|---|
| Tools discovered over MCP and converted per provider | `tools/list` → 3 tools, schemas stripped of keywords Gemini rejects |
| Loop dispatches tool calls and feeds results back | E1, E2, E3, E6 traces |
| Tool restraint — no gate call when the posting has no GPA | E1 ✓ |
| Gate called with the right threshold | E2 ✓ (`threshold === 3.5`) |
| CGPA never enters the transcript | E2 ✓ (regex over the entire run object) |
| 8-call cap forces termination | `--scenario runaway` → stops at exactly 8, `stop: cap` |
| Thin extraction refuses to become a requirement list | 127-char fetch → forced failure result |
| HTTP errors refuse likewise | E6 ✓ after the §4 fix |
| Send-capable tool would abort the run | startup check over the tool list |
| Evidence staleness reported before a verdict | `stat` on `cv-facts.md`, >30 days triggers a warning |

**Not done, and not claimable:**

1. **No live-model run.** Every judgement assertion (E1's verdict, E2's skip, E3's citizenship catch,
   all of E4 and E5, E6's request for a paste) is unproven. These are the assertions that test whether
   the *agent* is any good, as opposed to whether the *plumbing* works.
2. **No screen capture**, because there is nothing worth capturing until 1 is done.
3. The Gemini adapter's `functionResponse` shape is written from the v1beta docs and **has never been
   exercised against the API.** Same for the Groq and Anthropic adapters. I expect at least one of the
   three to need fixing on first contact.

**To finish it:** put a key in `pipeline/private/.env` (gitignored — template at `.env.example`;
Groq is free without a card at console.groq.com/keys), then:

```bash
node agent/evals.mjs                                  # all six, real verdicts
node agent/scout.mjs https://sparai.org/              # one end-to-end run to record
```

---

## 7. Cut from the spec

| Spec item | Status | Why |
|---|---|---|
| Anthropic API as the platform | Replaced by a 4-provider adapter | No key. The spec named this as its main risk; it materialised. |
| "Call `log_run` exactly once" | Instructed, not enforced | The prompt says once and no eval catches a double call yet. A counter in the loop would enforce it properly. Noted rather than quietly dropped. |
| Fit-score document-vs-qualification split | In the prompt, not asserted | No eval checks it. It needs a live model to test at all, so writing the assertion now would be writing it blind. |

Nothing in the spec was cut because it was inconvenient. The one substitution was forced, and the two
unenforced items are unenforced *and labelled as such*, which is the difference between a gap and a
misrepresentation.

---

# Part 2 — the live run (same day, once a Groq key existed)

## 8. Three failures before a single token reached a model

None of these were the agent. All three were the key.

1. **No variable name.** The file contained the bare key with no `GROQ_API_KEY=` in
   front of it, so the loader found nothing and silently fell back to `mock`. The run
   "succeeded" and did nothing — the worst kind of failure. The loader now infers the
   variable from the key's own prefix (`gsk_` → Groq, `sk-ant-` → Anthropic, `AIza` → Gemini).
2. **UTF-16.** PowerShell's `echo x > file` writes UTF-16LE on Windows, so reading as
   UTF-8 produced mojibake. The loader now sniffs the BOM.
3. **The key was pasted twice** — 112 characters, two identical 56-character copies
   concatenated. `401 Invalid API Key`. Diagnosed by counting occurrences of `gsk_`
   rather than by looking at the key.

Worth noting because "the agent doesn't work" was three times in a row a config problem
that produced a confident, wrong-looking result.

## 9. Rate limits are a design constraint, not an error

First real run: `429`. Limit 12,000 tokens/minute, **requested 10,961** on a single turn.

The cause was mine: `buildSystem()` dumped both knowledge files whole into the system
prompt, and an agent loop re-sends that on *every* turn. `cv-facts.md` alone is ~4k
tokens. One posting fetch at 6,000 characters pushed it over.

Two fixes:

- **`condense()`** scores markdown sections by how much they matter to a go/no-go
  decision — the gap list and the adjacent-but-absent table first, prose last — and
  fills a character budget in that order, then restores document order so it still reads
  as a document. Prompt went from **10,961 → ~2,666 tokens.**
- **Retry on 429** honouring the wait the provider states in its own error message.
  A free-tier agent that dies on a rate limit isn't finished.

Posting slice default dropped 6,000 → 2,500 characters as well.

## 10. The failure that mattered: it invented a requirement

First complete end-to-end run, on SPAR:

```
→ tool  fetch_posting({"max_chars":2500,"url":"https://sparai.org/"})
→ tool  check_gpa_gate({"programme":"SPAR","threshold":3})
← result GATE: SPAR requires 3/4   VERDICT: FAIL   CALL: SKIP
→ tool  log_run({"call":"skip","programme":"SPAR",...})
model   VERDICT: SKIP   DISQUALIFIER: GPA gate FAIL
```

**SPAR states no GPA requirement anywhere.** The agent invented a threshold of 3, the
gate dutifully returned FAIL against it, and the agent rejected the single best-fit
opportunity I have — eleven days before its deadline.

This is exactly what eval E1 was written to catch: *"Must not: call `check_gpa_gate` —
nothing in the posting asks for a GPA."* Written before the code existed, and it caught
the real thing on the first live run. That is the entire argument for pre-build evals.

The root cause was a permissive instruction. Rule 4 said *"If the posting states a
minimum GPA, call check_gpa_gate"* — which reads as an invitation, and says nothing about
the far more common case where no GPA is mentioned. Fixed in **both** places that govern
tool selection:

- **The prompt** now requires quoting the exact sentence stating the minimum *before*
  calling, and says plainly that most postings have no GPA requirement and gating one on
  an invented threshold rejects a qualified candidate.
- **The tool description** in the MCP server gained explicit `WHEN TO CALL` / `WHEN NOT TO
  CALL` sections. This mattered as much as the prompt — the description is what the model
  reads when deciding, and mine had only described what the tool *did*.

Result after the fix, on the same posting:

```
E1  ✓ did not call check_gpa_gate    ✓ fetched the posting    ✓ verdict is apply
```

And the regression check that the fix hadn't just disabled the gate — KAUST, which really
does state "Minimum GPA: 3.5/4":

```
E2  ✓ called check_gpa_gate   ✓ used threshold 3.5   ✓ no CGPA digits anywhere
    ✓ verdict is skip         ✓ no email drafted            5/5
```

## 11. A provider limitation, surfaced rather than hidden

Groq returns `400 tool_use_failed` when llama-3.3-70b *narrates* a decision instead of
emitting a parseable call. The model's actual output was correct —

> "The posting does not mention a GPA requirement, and the check_gpa_gate function is not
> necessary in this case."

— but the API rejected the turn, so the run died with a 400 while the model was reasoning
properly. The adapter now salvages `failed_generation` as a normal text turn and sets a
`salvaged` flag on the trace, so a rescued run is visibly distinguishable from a clean one.

**The cost, stated rather than papered over:** on the salvaged path the loop ends with
prose, so `log_run` never fires. That is why E1 scores **2/3 mechanical** — the missing
assertion is "logged the run", and its cause is the provider, not the agent's judgement. I
could have the harness log the outcome itself and turn that ✗ into a ✓, but bookkeeping
done by the orchestrator is not the agent deciding to record its work, and labelling it as
such would be dishonest.

## 12. Where FL-07 actually ends up

| | |
|---|---|
| Core job end to end, no hand-editing | **Yes** — fetch → gate → log → verdict, model choosing every step |
| Live tool/data connection | **Yes** — MCP over stdio; live HTTP fetch; gitignored private file; disk write |
| Matches the FL-06 spec | Platform substituted (documented, §1); everything else as specified |
| Build log shows real iteration | Three key failures, a rate-limit redesign, an invented-requirement bug, a provider quirk |
| E1 | 2/3 mechanical (log_run, provider-caused) · 1/1 judgement |
| E2 | **5/5** |
| E3–E6 | Not yet run live. Free-tier rate limits make a full six-case sweep slow; E1 and E2 were prioritised as the two that decide whether the agent is safe to trust. |

The honest summary: **the agent works, and the evals caught it doing the single most
damaging thing it could do** — rejecting a good opportunity for a requirement that did not
exist. It no longer does that. E3 to E6 remain unverified against a live model, and saying
otherwise would be the exact overclaim this whole project keeps tripping over.

---

## 13. The model was the bottleneck, not the loop

Running it repeatedly surfaced two more things.

**The daily cap, and a bug in my own retry.** Groq's free tier caps tokens *per day*
(100,000) as well as per minute. After a handful of runs: `Used 96169`. Worse, my retry
parsed `try again in 15m24.479999999s` with a seconds-only regex, read it as **24 seconds**,
and burned three pointless retries before failing. Fixed: parse hours/minutes/seconds
properly, and **fail fast on a per-day limit** with the actual remedy in the message —
sleeping inside a run cannot clear a daily quota.

**llama-3.3-70b was the source of the bad output.** Even after the tool-restraint fix it
rambled, mangled its own reasoning ("The posting requires a GPA minimum of at least 3.0 is
not mentioned in the text"), invented a fit score of 8/10 with no derivation, and truncated
its own `verify_by_hand` argument mid-word. The loop was fine; the model was weak at
following negative instructions.

Switched the Groq default to **`openai/gpt-oss-120b`**, which has its own daily budget and
follows "do not call this tool unless…" reliably. Same prompt, same tools, same loop:

```
→ tool  fetch_posting({"url":"https://sparapi.org/"})     ← model's own typo
← result Error: fetch failed
→ tool  fetch_posting({"url":"https://sparai.org/"})      ← it corrected itself
model   **Verdict:** apply   **Fit score:** 8/10
        [structured evidence citing AUREXIS, Self-Regulating AI, the R² ≈ 0.97
         air-quality model and KIDO, plus what to highlight in the application]
→ tool  log_run({... "verify_by_hand":"Confirm the application deadline is
        August 18, 2026" ...})
```

Two things worth noting there. It **did not call the GPA gate** — the §10 fix holds on a
different model, so the fix was in the instructions rather than a quirk of one model. And it
recovered from its own bad URL without being told to, which is the loop earning its keep:
a chain would have failed at that step.

**Still imperfect:** the 8/10 fit score is asserted, not derived from counting must-haves as
the spec requires, and no eval checks that yet. Recorded as open rather than described as
working.

### Model choice, honestly

| | llama-3.3-70b-versatile | openai/gpt-oss-120b |
|---|---|---|
| Respects "do not call unless…" | after the fix, with rambling | cleanly |
| Output structure | prose, mangled sentences, truncated args | structured, cites specific evidence |
| Invented a fit score | yes (8/10, no derivation) | yes (8/10, no derivation) |
| Recovered from a bad URL | not observed | yes |

The lesson I did not expect from FL-07: **the agent's quality was gated by model choice more
than by anything I wrote.** The loop, the tools and the guardrails behaved identically across
both; what changed was whether the model could follow a negative instruction without
narrating its way around it. Worth remembering before blaming a prompt.

---

## 14. The v2 eval sweep, and the regression it caught

Ran all six cases live against `openai/gpt-oss-120b` on 8 August 2026 — the first full sweep, since
earlier runs had only reached E1 and E2 before the free tier's daily cap.

**E2 failed.** The agent fetched the KAUST posting and did not call `check_gpa_gate`, which is the
single behaviour that most justifies this agent existing.

The cause was mine. To get under the rate limit I had cut the posting fetch from 6,000 characters to
2,500, and KAUST states `Minimum GPA: 3.5/4` *past* that cut. So the agent reasoned — correctly, on
the text it could see — that the posting named no threshold. Its own output said so:

> "No explicit GPA, citizenship, or institution-eligibility thresholds appear in the posted text, so
> there is no hard gate you cannot pass."

It even tried fetching an `/entry-requirements` page to double-check, got a 404, and flagged its own
uncertainty in the verify-by-hand line. The reasoning was sound; the input was truncated.

**A performance optimisation had silently become a correctness failure.** Same shape as the mobile
fix that pushed BYTE's speech bubble into the navigation bar: a change that is correct in the
dimension you were thinking about, and wrong in one you were not.

The fix keeps the clip, because the token budget is real, but scans everything beyond it for
gate-shaped lines — GPA, citizenship, visa, deadline, eligibility — and carries them across:

```
--- GATE-RELEVANT LINES FOUND BEYOND THE CLIP ---
- Minimum GPA: 3.5/4
- Valid Passport with at least 6 months validity
```

E2 went from 1/3 mechanical to **5/5**.

### Where the numbers actually landed

| Case | Mechanical | Judgement |
|---|---|---|
| E1 | 3/3 | 0/1 |
| E2 | 3/3 | 2/2 |
| E3 | 2/2 | 3/3 |
| E4 | — | 1/3 |
| E5 | — | 1/3 |
| E6 | 1/1 | 2/3 |

**9/9 mechanical, 9/14 judgement.** The plumbing is solid; the judgement is not, and E4 and E5 are
where it is weakest — the agent does not reliably return NO EVIDENCE for a skill I lack, which is the
failure mode the whole knowledge file exists to prevent.

E1's judgement miss is probably the *eval's* fault rather than the agent's: the assertion demands the
word "apply" and forbids "skip", and the agent used both in a sentence that read correctly. I have
not rewritten it. Editing an eval after seeing the output is how evals stop meaning anything, and I
would rather carry a 0/1 I can explain than a 1/1 I arranged.
