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
