# Demo cue card — read this, press record, done

Six blocks. Each one is **one screen** and **a few short sentences**. Nothing to
memorise. Put this on your phone and read it.

**Two tabs open, nothing else:**

- **Tab A** — the dashboard: run `node agent/server.mjs`, open `localhost:4173`
- **Tab B** — `agent/README.md` on GitHub

You will switch between them **twice**. That is the whole production.

> **Fumbles are fine.** If a sentence comes out wrong, say it again and carry on.
> Nobody expects a perfect take and the brief does not ask for one. What it asks
> for is a real run, which is what you have.
>
> **Pauses are fine too.** If the model takes 30 seconds, say "that pause is the
> free tier's rate limit" and wait. Leaving it in is *required* — an unedited run
> is what is being marked.

---

## 1 · Dashboard, log empty · ~30 sec

> This is Opportunity Scout. It reads a job or research posting and tells me whether to apply.
>
> I built it because the tool before it was slower than doing the job by hand.
>
> What it saved was not time. It stopped me applying to two things I had no chance at.

---

## 2 · Switch to Tab B, the architecture diagram · ~40 sec

### ← THIS BLOCK IS THE DESIGN DECISION. It is marked. Do not skip it.

> Here is the architecture. Three parts.
>
> The agent loop is one file. The tools live in a separate program, an MCP server. And a language model.
>
> There are three tools. Fetch a posting. Check a GPA gate. Log the run.
>
> The design decision I want to explain is this. It is a loop, not a chain.
>
> In my earlier version, I decided the order myself. Here, the model decides which tool to call, and when to stop.
>
> So I cannot know how many steps a run will take before it runs. That is the real difference between a workflow and an agent.

---

## 3 · Back to Tab A. Paste `https://sparai.org/`, press Run agent · ~50 sec

> Now a real run. This is SPAR, a research programme that is open now.
>
> Watch which tools it calls.

*(wait for the tool lines to appear)*

> It fetched the posting. And it did not call the GPA gate. SPAR does not state a GPA requirement, so there was nothing to check.
>
> A tool that runs for no reason is a bug, not a feature. That is one of the six things I test for.
>
> The verdict is apply. And the run is saved to a file on disk, so the history survives after I close this.

---

## 4 · Clear the log. Paste the KAUST URL, press Run · ~55 sec

`https://admissions.kaust.edu.sa/study/internships`

### ← THIS BLOCK IS THE GUARDRAIL. Also marked.

> Same agent. Different posting. KAUST asks for a minimum GPA of three point five out of four.

*(wait for `check_gpa_gate` to appear)*

> There. It called the GPA gate by itself. I did not tell it to. It read the number off the page and decided the check was needed.
>
> Now look at the answer. Pass or fail, and the threshold it tested. Not my GPA.
>
> My GPA sits in a file the model never sees. The tool answers the question without the number leaving my computer.
>
> The verdict is skip. And notice there is no email. When the answer is skip, it writes nothing at all.

---

## 5 · Switch to Tab B. Scroll to the eval results table · ~50 sec

### ← THIS BLOCK IS THE LIMITATION. Marked. It is the best part.

> Here are my results. Six tests, written before the agent existed.
>
> Nine out of nine on the mechanical checks. But only nine out of fourteen on judgement. Cases four and five are weak, and I have not fixed them.
>
> And here is the failure I actually want to show you.
>
> When I ran these tests, the GPA test failed. Not because the model was wrong.
>
> Because I had cut the page text from six thousand characters down to two and a half thousand, to stay under a rate limit.
>
> KAUST states its GPA minimum below that cut. So the agent never saw it.
>
> It told me to apply to a programme I cannot get into. My speed fix had broken a correct answer — and a test I wrote before the code caught it.

---

## 6 · Stay on the README · ~20 sec

> One last thing. This agent cannot send anything. No email. No forms.
>
> Not switched off — it does not exist. Sending is the only thing here you cannot undo, so I never built it.

---

## That is the end. Stop recording.

Roughly **4 minutes**. The brief allows 3 to 5.

## Before you press record

- [ ] `node agent/server.mjs` running, `localhost:4173` open, log cleared
- [ ] Tab B on `agent/README.md`
- [ ] OBS: **Window Capture** (not Display) + **Audio Input Capture**
- [ ] **Speak once and watch the mic meter move.** A silent take is the classic waste
- [ ] Browser at ~125% zoom, other tabs closed
- [ ] Provider dropdown NOT on `mock` — it must be a real run

## After

Upload to YouTube as **Unlisted**. Title:

`Opportunity Scout — an AI agent that decides whether to apply (FL-09 demo)`

Optionally add `agent/demo-subtitles.srt` under Subtitles → Upload file → *With timing*.

Then submit two links:

```
https://github.com/FarhanRajputFelix/portfolio/blob/main/agent/README.md
<your unlisted YouTube link>
```
