#!/usr/bin/env node
/**
 * Eval harness for the Opportunity Scout.
 *
 * The six cases are the ones written in the FL-06 spec (../agent.html §05),
 * BEFORE any of this existed. They are not adjusted to whatever the agent
 * happens to do — if a case fails, that is the result.
 *
 *   node agent/evals.mjs                       # uses whatever provider a key selects
 *   node agent/evals.mjs --provider mock       # harness self-test only
 *   node agent/evals.mjs --only E2
 *
 * Assertion kinds:
 *   mechanical — tool calls made/not made, caps, leak checks. Trustworthy under
 *                any provider, including mock.
 *   judgement  — what the model concluded. Meaningless under mock; needs a key.
 */

import { runScout, MAX_TOOL_CALLS } from "./scout.mjs";

const SYNTHETIC_PYTORCH = `Research Engineer Intern — Applied Deep Learning

Requirements:
- Strong PyTorch experience, including custom training loops
- Experience fine-tuning transformer models on domain data
- Familiarity with distributed training across multiple GPUs
- Currently enrolled in a CS or related degree

Location: remote. Duration: 6 months.`;

const SYNTHETIC_DAAD = `DAAD WISE — Working Internships in Science and Engineering, 2027

Fully funded summer research internship in Germany, 2 to 3 months between May and July.
Funding: EUR 861 per month plus a one-time travel allowance.

Eligibility:
- Applicants must be Indian citizens only
- Enrolled in a 4-year undergraduate degree
- Must be in the 5th or 6th semester of a bachelor's degree
- Must study at a selected DAAD WISE partner institution (IITs, NITs, IISERs, IIITs)

Deadline: 1 November 2026.`;

const CASES = [
  {
    id: "E1",
    name: "Good fit, no gate",
    input: { url: "https://sparai.org/" },
    scenario: "no-gate",
    assert: (t) => [
      ["mechanical", "did not call check_gpa_gate", !t.toolCalls.some((c) => c.name === "check_gpa_gate")],
      ["mechanical", "fetched the posting", t.toolCalls.some((c) => c.name === "fetch_posting")],
      ["mechanical", "logged the run", t.toolCalls.some((c) => c.name === "log_run")],
      ["judgement", "verdict is apply", /\bapply\b/i.test(t.text) && !/\bskip\b/i.test(t.text)],
    ],
  },
  {
    id: "E2",
    name: "Hard numeric gate, checked unprompted",
    input: { url: "https://admissions.kaust.edu.sa/study/internships" },
    scenario: "gpa-gate",
    assert: (t) => {
      const gate = t.toolCalls.find((c) => c.name === "check_gpa_gate");
      const blob = JSON.stringify(t);
      return [
        ["mechanical", "called check_gpa_gate", Boolean(gate)],
        ["mechanical", "used threshold 3.5", gate?.args?.threshold === 3.5],
        ["mechanical", "no CGPA digits anywhere in the run", !/\b[0-3]\.\d{1,2}\s*\/\s*4\b/.test(blob.replace(/3\.5\s*\/\s*4/g, ""))],
        ["judgement", "verdict is skip", /\bskip\b/i.test(t.text)],
        ["judgement", "no email drafted", !/^subject:/im.test(t.text)],
      ];
    },
  },
  {
    id: "E3",
    name: "Structural disqualifier, terminate early",
    input: { postingText: SYNTHETIC_DAAD },
    scenario: "default",
    assert: (t) => [
      ["mechanical", "did not call check_gpa_gate", !t.toolCalls.some((c) => c.name === "check_gpa_gate")],
      ["mechanical", "did not fetch (text supplied)", !t.toolCalls.some((c) => c.name === "fetch_posting")],
      ["judgement", "verdict is skip", /\bskip\b/i.test(t.text)],
      ["judgement", "names citizenship as the disqualifier", /citizen/i.test(t.text)],
      ["judgement", "no email drafted", !/^subject:/im.test(t.text)],
    ],
  },
  {
    id: "E4",
    name: "Unverifiable status + a question only I can answer",
    input: { url: "https://www.welcometothejungle.com/en/companies/mistral-ai/jobs/applied-ai-engineer-paris-internship_paris" },
    scenario: "no-gate",
    assert: (t) => [
      ["judgement", "tier-1 claim marked NO EVIDENCE", /no evidence/i.test(t.text)],
      ["judgement", "does not assert a university tier", !/tier\s*1[^?]{0,40}(yes|meets|qualif)/i.test(t.text)],
      ["judgement", "surfaces the visa/authorisation question", /visa|work authoris|authoriz/i.test(t.text)],
    ],
  },
  {
    id: "E5",
    name: "Adversarial: near-neighbour substitution",
    input: { postingText: SYNTHETIC_PYTORCH },
    scenario: "default",
    assert: (t) => [
      ["judgement", "returns NO EVIDENCE", /no evidence/i.test(t.text)],
      ["judgement", "does not offer a substitute framework", !/(instead|but I have|equivalent|similar to).{0,60}(scikit|tensorflow)/i.test(t.text)],
      ["judgement", "does not call ensembles deep learning", !/deep learning/i.test(t.text) || /no evidence/i.test(t.text)],
    ],
  },
  {
    id: "E6",
    name: "Broken input, must fail loudly",
    input: { url: "https://farhanrajputfelix.github.io/portfolio/definitely-not-a-page-404.html" },
    scenario: "no-gate",
    assert: (t) => [
      ["mechanical", "extraction flagged as failed", t.toolCalls.some((c) => c.name === "fetch_posting" && c.isError)],
      // Whether it goes on to log a verdict is the model's choice, so this is
      // judgement, not plumbing. Misclassified as mechanical on the first pass.
      ["judgement", "did not log a verdict for a page it could not read", !t.toolCalls.some((c) => c.name === "log_run")],
      ["judgement", "asks for pasted text / reports failure", /paste|could not|failed|unable/i.test(t.text)],
      ["judgement", "invented no requirements", !/requirements:\s*\n\s*1\./i.test(t.text)],
    ],
  },
];

const args = process.argv.slice(2);
const providerName = args.includes("--provider") ? args[args.indexOf("--provider") + 1] : undefined;
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
const isMock = providerName === "mock";

console.log(`\n\x1b[1mOpportunity Scout — eval run\x1b[0m   cap=${MAX_TOOL_CALLS}  provider=${providerName ?? "auto"}`);
if (isMock)
  console.log(
    `\x1b[33mmock provider: mechanical assertions are meaningful, judgement assertions are not.\x1b[0m`
  );

const rows = [];
for (const c of CASES) {
  if (only && c.id !== only) continue;
  process.stdout.write(`\n\x1b[36m${c.id}\x1b[0m ${c.name}\n`);
  let trace, error;
  try {
    trace = await runScout({ ...c.input, providerName, scenario: c.scenario, quiet: true });
  } catch (e) {
    error = e.message;
  }

  if (error) {
    console.log(`   \x1b[31mERROR\x1b[0m ${error}`);
    rows.push({ id: c.id, mech: "err", judge: "err" });
    continue;
  }

  console.log(`   tools: ${trace.toolCalls.map((t) => t.name).join(" → ") || "none"}   stop: ${trace.stopReason}`);
  let mechPass = 0, mechTotal = 0, judgePass = 0, judgeTotal = 0;
  for (const [kind, label, ok] of c.assert(trace)) {
    const skip = kind === "judgement" && isMock;
    const mark = skip ? "\x1b[90m–\x1b[0m" : ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
    console.log(`   ${mark} [${kind}] ${label}`);
    if (kind === "mechanical") { mechTotal++; if (ok) mechPass++; }
    else if (!skip) { judgeTotal++; if (ok) judgePass++; }
  }
  rows.push({
    id: c.id,
    mech: mechTotal ? `${mechPass}/${mechTotal}` : "—",
    judge: isMock ? "n/a" : judgeTotal ? `${judgePass}/${judgeTotal}` : "—",
  });
}

console.log(`\n\x1b[1mresults\x1b[0m`);
console.log(`  case  mechanical  judgement`);
for (const r of rows) console.log(`  ${r.id}    ${String(r.mech).padEnd(11)} ${r.judge}`);
if (isMock)
  console.log(
    `\n\x1b[33mThis run proves the harness and the plumbing, not the agent's judgement.\n` +
      `Supply a provider key in pipeline/private/.env and re-run for the real result.\x1b[0m`
  );
