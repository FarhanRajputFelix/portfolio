# FL-09 demo — word-for-word narration

**Read this aloud while screen-recording. Your face is never needed:**
the criteria ask for a live run with voice narration, nothing more.

Generated from `gen_demo.py`, which also produced
`agent/demo-subtitles.srt`. The timestamps below and the subtitle cues come
from the same source at 140 words per minute, so they cannot drift apart.

Speak at a normal pace. If you run long, that is fine — the brief allows 3 to 5
minutes and this targets about 4.

---

## 0:00 · What it is, and why it exists

**On screen:** Dashboard at localhost:4173, log cleared, history table visible.

> This is Opportunity Scout. It decides whether a job or a research programme is worth applying to, and refuses to write the application when it is not.

> I built it because I measured the workflow it replaced, and that workflow was slower than doing the job by hand.

> What it saved was not time. It was two applications out of five that I should never have started.

*Section runs 0:00 to 0:29.*

## 0:29 · The architecture, and the design decision

**On screen:** Switch to agent/README.md, scroll to the ASCII architecture diagram.

> Three pieces. The agent loop is one file. The tools live in a separate process, an M C P server, zero dependencies. And a model.

> The tools are: fetch a posting, check a G P A gate, log the run. That is all of them.

> The design decision I want to point out is that this is a loop, not a chain.

> In the version before this I carried text between five fixed prompts by hand. I decided what happened next. Here the model decides which tool to call and when to stop.

> So the number of steps is not knowable before it runs, and that is the actual line between a workflow and an agent.

*Section runs 0:29 to 1:21.*

## 1:21 · Run one: no gate applies

**On screen:** Back to the dashboard. Paste https://sparai.org/ and press Run agent.

> One thing first. This dashboard imports the same function the command line calls, so every line you see appear is the agent emitting an event live, not a replay.

> S P A R is a real research fellowship with applications open. Watch which tools it calls.

> It fetched the posting. Now it has a check G P A gate tool available, and it is not calling it, because S P A R states no G P A requirement.

> A tool that runs with no reason to run is a defect, not a bonus. That restraint is one of the six things I test for.

> Verdict: apply. And the history table on the right picks it up, because that is a file on disk, not a variable.

*Section runs 1:21 to 2:16.*

## 2:16 · Run two: the guardrail fires

**On screen:** Clear the log. Paste https://admissions.kaust.edu.sa/study/internships and run.

> Same agent, different posting. K A U S T states a minimum G P A of three point five out of four.

> There. It called the G P A gate on its own. I never told it to. It read the threshold off the posting and decided the check was necessary.

> Now look at what came back. Pass or fail, and the threshold tested. Not my G P A.

> The number lives in a git-ignored file the model never sees. The tool answers the question without the answer leaving my machine.

> Verdict: skip. And notice there is no email. When the answer is skip it produces nothing to send, because a polished email for an application I cannot make is worse than no output at all.

*Section runs 2:16 to 3:12.*

## 3:12 · The limitation

**On screen:** Switch to agent/README.md and scroll to the eval results table.

> Here are the real numbers. Six eval cases written before the agent existed. Nine out of nine on the mechanical assertions, but only nine out of fourteen on judgement.

> E four and E five are the weak ones. It does not reliably say no evidence for a skill I do not have. That is a prompt problem I have not solved.

> And the limitation I most want to show you is this. When I ran these evals, E two, the G P A case, failed.

> Not because the model was wrong. Because I had cut the posting fetch from six thousand characters to two and a half thousand to stay under a rate limit, and K A U S T states its minimum past that cut.

> So the agent never saw the requirement, reasoned correctly that there was not one, and told me to apply to a programme I cannot get into.

> A performance optimisation had silently become a correctness failure, in the exact behaviour that justifies the agent existing. An eval I wrote before any of the code caught it.

*Section runs 3:12 to 4:32.*

## 4:32 · Close

**On screen:** Stay on the README.

> One last thing. This agent cannot send anything. No email tool, no form filling. Not disabled, absent.

> Sending is the only irreversible action here, so the guardrail is that the capability does not exist.

*Section runs 4:32 to 4:47.*

---

## Total: 4:47 at 140 wpm, 650 words

Inside the 3 to 5 minute window with room either side.

### The two things a reviewer is explicitly looking for

- **Design decision** — the loop-versus-chain passage in section two.
- **Limitation** — the E2 regression in section five. Do not cut it; it is the
  strongest 50 seconds in the video.

---

## Recording it without your face

Nothing in the pass criteria mentions a webcam. They ask for: a live end-to-end
run, 3 to 5 minutes, clear narration, one design decision, one limitation. A
screen recording with voice satisfies all five.

**OBS Studio, once:**

1. `+` under Sources -> **Window Capture** -> pick your browser. Not Display
   Capture: window capture cannot leak a notification from another app.
2. `+` again -> **Audio Input Capture** -> your microphone. Check the meter moves
   when you speak, *before* you record. A silent 4-minute take is the classic
   waste.
3. Settings -> Output -> Recording Quality **High**, format **MP4**.
4. There is no webcam source in that list. That is the point.

**Before you press record:**

- Browser at about 125% zoom. Close other tabs, hide the bookmarks bar.
- `node agent/server.mjs` running, `localhost:4173` open, log cleared.
- A second tab with `agent/README.md` for the architecture diagram and the
  eval table.
- Check your Groq daily budget. If it is low, use
  `SCOUT_MODEL=openai/gpt-oss-20b`.
- Do **not** use the `mock` option on camera. It exists so you can rehearse
  without spending quota; a graded demo has to be a real run.
- Rate-limit waits of 20 to 40 seconds will happen. **Leave them in and say what
  they are.** An unedited run is what is being marked.

## Subtitles

`agent/demo-subtitles.srt` is generated from this same script, so the cues match
what you read.

YouTube Studio -> your video -> **Subtitles** -> **Add** -> **Upload file** ->
*With timing* -> pick the `.srt`.

Then **watch it back once with captions on.** If your pace drifted from 140 words
a minute the cues will lag, and the fix is either to re-time in YouTube's editor
or to let YouTube auto-generate instead. Auto-captions are usually good enough
for clear speech and cost you nothing.

## On using an AI voice instead of your own

You mentioned other students using AI-generated narration. Two honest points.

The criteria say *"one design decision and one limitation explained on camera."*
What is being assessed there is whether **you** can explain your own system. A
synthetic voice reading my words does not demonstrate that, and a reviewer who
suspects it will weigh the whole submission differently.

Practically, your own voice is also less work. There is no export step, no
lip-sync to worry about, and no upload of a script to a third-party service. You
already know this material — you built it, you found the E2 regression, and you
argued me out of two wrong recommendations this week. Read the script above at a
normal pace and you are done in one take plus a retry.

Your face stays off camera either way.

## Optional swap: a stronger guardrail story, found today

The brief asks you to verbally explain "one design decision **and** one limitation
or guardrail". The script above uses the E2 regression. This is the alternative,
and it is better in one specific way: it happened today, you watched it happen,
and the fix is the clearest example of structural guarding in the whole project.

Use it **in place of** the first three sentences of the limitation section, or as
an extra 35 seconds if you are comfortably under 5:00.

**On screen:** the dashboard, with the yellow `url corrected` line visible in the log.

> One more thing, and this one is from today. I asked the agent to evaluate S P A R,
> at s p a r a i dot org. Watch the log line in yellow. The model asked to fetch
> s p a r i dot org. It dropped a letter.

> That domain resolves. It belongs to an animal rescue charity. So the agent
> fetched a real website, read it correctly, and gave me a perfectly sensible
> verdict about an animal shelter.

> There is a row in my run history from days ago called Shepherd's Paws Animal
> Rescue. I logged it as an oddity at the time. It was this bug, and I did not
> understand it until today.

> I could not fix that with a better prompt. A typo is not a reasoning error, and
> it corrupted the address differently on each run. But the U R L was never the
> model's to decide. It is an input to the run.

> So the loop now substitutes the address I gave it and shows the correction. That
> is the same pattern as the G P A gate: do not ask the model to avoid the
> mistake, remove its opportunity to make it.

**Why a reviewer will like this**: it is a live defect, honestly described, with a
fix that follows a principle rather than a patch — and it is visible on screen
while you say it, which is exactly what "not slides" means.

## Checklist before uploading

- [ ] 3 to 5 minutes
- [ ] Live run throughout, no slides
- [ ] **Design decision** said out loud — the loop-versus-chain passage, ~0:40
- [ ] **Limitation** said out loud — the E2 regression, ~3:12
- [ ] Both runs reach a verdict on camera
- [ ] Rate-limit waits left in and explained
- [ ] Unedited, no cuts
- [ ] Subtitles uploaded and checked

Upload to YouTube as **Unlisted**. Title:

`Opportunity Scout — an AI agent that decides whether to apply (FL-09 demo)`

Then submit two links in the portal:

```
https://github.com/FarhanRajputFelix/portfolio/blob/main/agent/README.md
<your unlisted YouTube link>
```
