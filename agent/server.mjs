#!/usr/bin/env node
/**
 * Opportunity Scout — local dashboard server.
 *
 *     node agent/server.mjs        →  http://localhost:4173
 *
 * Why local and not hosted: the agent needs a model API key. A browser UI on
 * Netlify or GitHub Pages would have to ship that key to every visitor, which
 * is the one thing you must never do. So the server runs on your machine, the
 * key stays in the gitignored env file, and the browser only ever talks to
 * localhost.
 *
 * Zero dependencies — node:http and node:fs only, like the MCP server.
 *
 * Endpoints
 *   GET  /                 the dashboard
 *   GET  /api/runs         the run history from pipeline/runs/INDEX.md
 *   POST /api/run          { urls: [...], filters: {...} } → SSE stream of
 *                          the agent's tool calls as they happen
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScout } from "./scout.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const PORT = Number(process.env.PORT || 4173);

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };

/* ------------------------------------------------------------------ *
 * Opportunity type. The agent returns prose; the dashboard needs a
 * facet to filter on. Classified from the posting text and the verdict
 * rather than asked of the model, because it is a lookup, not a judgement.
 * ------------------------------------------------------------------ */
const TYPES = [
  ["scholarship", /scholarship|tuition|fully funded|stipend award|bursary/i],
  ["assistantship", /assistantship|teaching assistant|research assistant\b|\bTA\b|\bRA\b/i],
  ["funding", /grant|funding|fellowship award|travel award|prize/i],
  ["research", /research (programme|program|internship|placement|project)|lab|PhD|postdoc|VSRP|mentee/i],
  ["internship", /internship|intern\b|trainee|placement/i],
  ["job", /full[- ]time|graduate role|engineer|developer|analyst|position|vacancy|hiring/i],
];

function classify(text = "") {
  const hits = TYPES.filter(([, re]) => re.test(text)).map(([t]) => t);
  return hits.length ? hits : ["other"];
}

/* ------------------------------------------------------------------ *
 * Run history, parsed out of the markdown table log_run appends to.
 * ------------------------------------------------------------------ */
async function readRuns() {
  const p = join(REPO, "pipeline", "runs", "INDEX.md");
  if (!existsSync(p)) return [];
  const md = await readFile(p, "utf8");
  return md
    .split(/\r?\n/)
    .filter((l) => /^\|\s*\d+\s*\|/.test(l))
    .map((l) => {
      const c = l.split("|").slice(1, -1).map((x) => x.trim());
      const [n, programme, fit, call, verify, source] = c;
      const score = Number((fit || "").split("/")[0]);
      return {
        n: Number(n),
        programme,
        fit,
        score: Number.isFinite(score) ? score : null,
        call,
        verify,
        source,
        types: classify(`${programme} ${verify} ${source}`),
      };
    })
    .reverse();
}

function sse(res) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  });
  return (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    /* ---------------- run history ---------------- */
    if (url.pathname === "/api/runs") {
      const runs = await readRuns();
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify(runs));
    }

    /* ---------------- run the agent ---------------- */
    if (url.pathname === "/api/run" && req.method === "POST") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { urls = [], postingText = "", provider, scenario } = JSON.parse(body || "{}");
      const send = sse(res);

      // One entry per URL. A single null means "no URL" — either pasted text,
      // or a mock replay, where the scenario supplies everything.
      const clean = urls.filter(Boolean);
      const queue = postingText.trim() || !clean.length ? [null] : clean;
      send({ type: "queued", count: queue.length });

      for (const [i, target] of queue.entries()) {
        const label = target ?? (postingText.trim() ? "(pasted text)" : `(mock replay: ${scenario ?? "default"})`);
        send({ type: "item", index: i, total: queue.length, url: label });
        try {
          await runScout({
            url: target ?? undefined,
            postingText: target ? undefined : postingText,
            providerName: provider || undefined,
            scenario,
            quiet: true,
            onEvent: (e) => send({ ...e, index: i }),
          });
        } catch (err) {
          send({ type: "error", index: i, message: String(err.message || err) });
        }
      }

      send({ type: "all-done" });
      return res.end();
    }

    /* ---------------- static ---------------- */
    let file = url.pathname === "/" ? "ui/index.html" : url.pathname.replace(/^\/+/, "");
    const full = resolve(HERE, file);
    if (!full.startsWith(HERE)) {          // no traversal out of agent/
      res.writeHead(403);
      return res.end("forbidden");
    }
    if (!existsSync(full)) {
      res.writeHead(404);
      return res.end("not found");
    }
    res.writeHead(200, { "content-type": MIME[extname(full)] || "text/plain" });
    return res.end(await readFile(full));
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(String(err.message || err));
  }
});

server.listen(PORT, () => {
  console.log(`\n  Opportunity Scout dashboard`);
  console.log(`  http://localhost:${PORT}\n`);
  console.log(`  The API key stays on this machine. Nothing is exposed to the network.\n`);
});
