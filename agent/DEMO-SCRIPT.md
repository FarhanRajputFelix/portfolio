# Demo video script — Opportunity Scout

**Target: 4 minutes.** The brief allows 3–5, and 4 leaves room to speak slowly.

The rubric requires: a live end-to-end run (no slides), clear narration, **one design decision** and
**one limitation** explained on camera. Both are marked below.

---

## Before you hit record

```bash
cd "c:/Users/Laptronics.co/OneDrive/Desktop/CAPSTON"
node agent/evals.mjs --provider mock          # warm-up, confirms nothing is broken
```

- Terminal font size up to ~16–18pt. Nobody can read 11pt on YouTube.
- Close other tabs. Full-screen the terminal.
- Have `agent/README.md` open in a second tab for the architecture diagram.
- **Check your Groq daily budget.** If it's low, use `SCOUT_MODEL=openai/gpt-oss-20b`.
- Rate-limit waits of 20–40s will happen. **Leave them in and say what they are** — an unedited run
  is what's being graded.

Record with OBS (Window Capture → your terminal). Xbox Game Bar will not record a terminal.

---

## 0:00–0:30 · What it is and why

*Show: the terminal, cleared.*

> "This is Opportunity Scout. It's an agent that decides whether a job or research programme is worth
> applying to — and refuses to write the application when it isn't.
>
> I built it because I measured the workflow it replaced, and that workflow was actually *slower* than
> writing the email by hand. What it saved wasn't time. It was two applications out of five that I
> should never have started. So this agent is scoped to deciding, not writing."

---

## 0:30–1:00 · The architecture, in one breath

*Show: the ASCII diagram in `agent/README.md`.*

> "Three pieces. The agent loop is one file. The tools live in a separate process — an MCP server
> speaking JSON-RPC, with zero dependencies. And a model, from whichever provider has a key.
>
> The tools are: fetch a posting, check a GPA gate, and log the run. That's it."

**← DESIGN DECISION (required by the rubric). Say this explicitly:**

> "The design decision I want to point out is that this is a *loop*, not a chain. In the version
> before this, I carried text between five fixed prompts by hand — I decided what happened next. Here
> the model decides which tool to call and when to stop. That means the number of steps isn't
> knowable before it runs, and that's the actual line between a workflow and an agent."

---

## 1:00–2:00 · Run one: no gate

*Run it. Talk while it works.*

```bash
node agent/scout.mjs https://sparai.org/
```

> "SPAR is a real research fellowship, applications genuinely open. Watch which tools it calls.
>
> It fetched the posting. Now — it has a `check_gpa_gate` tool available, and it is *not* calling it,
> because SPAR states no GPA requirement. A tool that runs with no reason to run is a defect, not a
> bonus. That restraint is one of the six things I test for."

*When the verdict appears:*

> "Verdict: apply. And it logged the run to disk, so the history survives the session."

*If a rate-limit wait appears:*

> "That pause is the free tier's token limit. I'm leaving it in — this is an unedited run."

---

## 2:00–3:15 · Run two: the guardrail

```bash
node agent/scout.mjs https://admissions.kaust.edu.sa/study/internships
```

> "Same command, different posting. KAUST states a minimum GPA of 3.5 out of 4."

*When `check_gpa_gate` appears:*

> "There — it called the GPA gate on its own. I never told it to. It read the threshold off the
> posting and decided the check was necessary.
>
> Now look at what came back: PASS or FAIL, and the threshold it tested. **Not my GPA.** The number
> lives in a gitignored file the model never sees. The tool answers the question without the answer
> leaving my machine — because pasting my academic record into a chat to get a one-bit answer is a bad
> trade."

*When the skip verdict appears:*

> "Verdict: skip. And notice there's no email. When the answer is skip it produces nothing to send,
> because a polished email for an application I can't make is worse than no output at all."

---

## 3:15–4:00 · The limitation

**← LIMITATION (required by the rubric). This is the strongest 45 seconds in the video. Do not cut it.**

*Show: the eval results table in `agent/README.md`.*

> "Here are the real numbers. Six eval cases, written before the agent existed. Nine out of nine on
> the mechanical assertions — tool calls, caps, leaks. But only **nine out of fourteen** on judgement.
> E4 and E5 are the weak ones: it doesn't reliably say NO EVIDENCE for a skill I don't have. That's a
> prompt problem I haven't solved.
>
> And the limitation I most want to show you is this one. When I ran these evals, **E2 — the GPA
> case — failed.** Not because the model was wrong. Because *I* had cut the posting fetch from six
> thousand characters to two and a half thousand, to stay under a rate limit. And KAUST states its GPA
> minimum *past* that cut.
>
> So the agent never saw the requirement, reasoned perfectly correctly that there wasn't one, and told
> me to apply to a programme I can't get into. A performance optimisation had silently become a
> correctness failure — in the exact behaviour that justifies the agent existing.
>
> An eval I wrote before any of the code caught a regression from an unrelated change. That's the
> whole argument for writing evals first. The fix keeps the clip but scans past it for anything
> gate-shaped and carries it across. E2 passes five out of five now.
>
> One last thing: this agent cannot send anything. There's no email tool, no form filling. Not
> disabled — absent. Sending is the only irreversible thing here, so the guardrail is that the
> capability doesn't exist. Everything it produces lands in my hands first."

---

## Checklist before uploading

- [ ] 3–5 minutes
- [ ] Live terminal throughout, no slides
- [ ] **Design decision** stated out loud (the loop vs the chain, ~0:45)
- [ ] **Limitation** stated out loud (E2 / the clip, ~3:15)
- [ ] Both runs complete to a verdict on camera
- [ ] Rate-limit waits left in, and explained
- [ ] Unedited — no cuts

Upload to YouTube as **Unlisted**. Title:
`Opportunity Scout — an AI agent that decides whether to apply (FL-09 demo)`

Paste the link in the portal alongside the README.
