# Retrospective — 500 to 800 words, written by Farhan

> **This file is a scaffold, not a draft. The words have to be yours.**
>
> FL-10 says the retrospective is "the gold" and asks reviewers to push people
> past generic reflection. It is graded on being *specific to your build*. It is
> also the one deliverable in the whole track that is about what changed in your
> head — which is the one thing nobody else can write for you.
>
> I have put the raw material below: the real events, with the real numbers, from
> your own repos. Use it, ignore it, disagree with it. But write the sentences
> yourself. **Ask me to edit what you write — that I will do.**
>
> Delete this whole block before submitting.

---

## The brief

Written **for the person you were in Week 1**. Four things:

1. What you set out to do
2. What changed
3. What you'd build next
4. The three most transferable things you learned

500–800 words. Aim for 600.

---

## Raw material — things that actually happened, with numbers

Pick four or five. Do not use all of them; a retrospective that lists everything
reflects on nothing.

**Week 1 you believed the work was the hard part.**
You had four projects and a Europass CV. The first CV audit scored 68/100 and
reported **0 experience entries** — the layout was unparseable, so the most
relevant thing you had scored nothing. The work existed and was invisible.

**The measurement that went against you, and you published it.**
FL-04's pipeline turned out **2.1× slower** than doing the job by hand. You
published that instead of quietly reframing it. What it actually saved was 3
factual errors and 2 of 5 applications abandoned before a word was written.

**Writing the test before the thing.**
Six eval cases before the agent existed. On the first live run the agent
*invented* a GPA requirement for a programme that states none, and skipped the
best-fit opportunity you had, eleven days before its deadline. E1 caught it
because E1 was written first.

**Your own optimisation broke a correct answer.**
You cut the posting fetch from 6,000 characters to 2,500 to stay under a rate
limit. KAUST states its GPA minimum below that cut. The agent reasoned perfectly
from incomplete input and told you to apply somewhere you cannot get in. A test
written before the code caught what reading the diff would not have.

**The bug that had been sitting in your run history for days.**
The model kept retyping the posting URL and getting it wrong — `spari.org`
instead of `sparai.org`. That domain resolves; it belongs to an animal rescue.
Your agent fetched a real but wrong website and returned a sensible verdict about
a dog shelter. No prompt fixes that. Taking the decision away from the model does.

**Auditing the paper your own internship is built on.**
11 claims scored. Both findings you could check independently replicated. One
headline finding reversed. You found a 71% classifier quoted without its 62.1%
base rate — about 9 points of real skill, not 71.

**And then the same discipline turned on your own work.**
In Self-Regulating AI, a fixed learning rate — the simplest thing in the
comparison — beat your regulator on both error measures. Your page reported
ranges, not per-method numbers, so nobody could check the "stability, not
victory" claim. You now publish the whole table with the baseline's win in bold.

**Two strangers saw what you could not.**
Your 3D character sat on top of your own headline on mobile. You had screenshotted
that page yourself and looked straight past it, because you already knew what the
text said.

**The thing that became useful to other people.**
The opportunity board: 8 public feeds, 2 scheduled GitHub Actions, ~1,200 listings
refreshed twice a day, eligibility checked in the visitor's browser so nothing is
transmitted. Verifying 13 funded programmes against their own pages found **4
materially wrong** on widely-shared lists — including one not running at all.

**Where you finished.** #1 of 2,377 on the ML track. CV audit 68 → 86. LinkedIn
audit 56 → 95.

---

## Three candidates for "most transferable" — pick your own, these are prompts

- **A number means nothing without what it is compared against.** Base rate,
  denominator, and who ended up in the treated group. You caught this in someone
  else's paper and then had to apply it to your own result.
- **Write the test before the thing, because you cannot see your own blind spot.**
  Every serious bug this term was invisible to you at the moment you shipped it.
- **Remove the opportunity for error rather than instructing against it.** No send
  capability. A gate returning PASS/FAIL without the value. The harness owning
  the URL. Prompts ask; architecture decides.

---

## What to avoid

- "I learned a lot about AI." Says nothing. A reviewer is told to send this back.
- Listing every assignment. Reflection is not an index — the index is
  [TRACK-INDEX.md](TRACK-INDEX.md).
- Claiming the failures were planned. They were not, and the honesty is the point.
- Writing as though it went well throughout. It did not, and that is the story.

---

## Structure that works

| Words | What goes here |
|---|---|
| ~100 | Week 1. What you thought you were doing, and what you had. |
| ~250 | The two or three moments that changed your mind. Name the number. |
| ~150 | The three transferable things, in your own words. |
| ~100 | What you would build next, and why that one. |

---

<!-- WRITE BELOW THIS LINE. Delete everything above it before you submit. -->
