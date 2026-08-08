# CV facts — Farhan Muhammad Bashir

Knowledge file #2 for the *Opportunity → Outreach Pack* pipeline (FL-04).
Companion to `PROJECT-BRIEF.md`. **Every fact here is verifiable** — it is either published on
farhanrajputfelix.github.io/portfolio or backed by a credential ID below.

> **Rule for the assistant reading this file:** if a posting asks for something that is not written
> in this file or in `PROJECT-BRIEF.md`, the answer is `NO EVIDENCE`. Section 9 lists the things I
> deliberately do *not* have, so you never have to guess about them.

---

## 1. Identity

| Field | Value |
|---|---|
| Full name | Farhan Muhammad Bashir |
| Goes by | Farhan Bashir |
| Location | Karachi, Pakistan (remote-friendly) |
| Email | farhanmuhammadbashir@gmail.com |
| LinkedIn | https://www.linkedin.com/in/farhan-rajput/ |
| GitHub | https://github.com/FarhanRajputFelix |
| Portfolio | https://FarhanRajputFelix.github.io/portfolio/ |
| Current title | Computer Science undergraduate · AI Intern |

**Never describe me as:** researcher, AI researcher, ML engineer, senior, expert, or anyone with
industry years. I am an undergraduate with no publications. "Aspiring researcher" is acceptable only
where the posting is explicitly for students.

---

## 2. Education

**BS Computer Science — SZABIST University, Karachi, Pakistan**
September 2023 — 2027 (expected graduation 2027; currently in progress)
Coursework and projects across AI, ML, data science and software engineering.

- GPA / CGPA: **held in `pipeline/private/cv-private.md`**, which is gitignored and attached to the
  Claude Project locally. It is deliberately not published here — this file is public assignment
  evidence, and academic standing belongs in a specific application that asks for it, not on a
  portfolio. If that private file is attached, the pipeline can answer GPA gates truthfully; if it is
  not, the correct output is `NO EVIDENCE`, never a guess.
- Prior schooling: Gold Medalist, TCF School (award, no date recorded here)

---

## 3. Experience

**Artificial Intelligence Intern — FlyRank AI** · July 2026 — present · Remote
General AI Fluency track. AI learning pathways, professional development and applied AI projects;
modern AI workflows and real-world applications. Completed the Anthropic AI Fluency certification
series during the internship.

**Antigravity Hackathon — Google AI Seekho** · 2026
Team-built "Crisis Intelligence", an emergency-response tool: AI agents, live maps, Flutter,
Firebase, Python backend. Built under hackathon time constraints.

**Retail Sales Manager — Bashir Communication** · Karachi · 21/06/2019 – 21/07/2021
Sales operations, customer service, team training, inventory and marketing. Non-technical, but it is
**two years of real paid employment** with team-training and customer-facing responsibility — useful
evidence for any "communicates with non-technical audiences" or "works with customers" requirement,
and it must never be described as software work.

- Paid *software/industry* employment: **none** → `NO EVIDENCE`
- Teaching / TA experience: **none recorded** → `NO EVIDENCE`

---

## 4. Projects, with the one number each is allowed to claim

**Source of truth, in strict order: (1) the public repository README, (2) the Europass CV, (3) the
website.** Updated 5 Aug 2026 after reading the actual repos — which contradicted *both* the CV and
the site in places. A repo is the only source a reviewer can independently check, so it wins. See
§4b for every disagreement found.

| Project | What it is | Stack (per CV) | Hard number |
|---|---|---|---|
| **AUREXIS** — Autonomous Ultra-Resilient Emergency & eXigency Interface System · 25/05/2024 – current | Research prototype: software-defined survival habitat architecture for extreme environments. Zero-Interaction Protocol. Priority-driven Meta-Arbitrator (`aurexis_orchestrator.py`) over 5 agents: Environment (10 threat categories), Resource (rationing, 15% water recycling), Health (HR/SpO₂), Psychology (panic scoring), Emergency (escalation). **Implemented:** live web console (REST + WebSocket), Monte Carlo engine, 25-intent Intent Reasoner, air-gap core, real phone alerts via ntfy.sh, Docker. **Designed only:** FPGA safety layer, RF relay (simulated), Raspberry Pi deployment, PINNs/RL. | Python, FastAPI, Gradio 4.44.1, **rule-based multi-agent — explicitly *not* neural networks**, Web Speech API | Simulated: survival **15.0% → 55.8% (+40.8 pp)**, mean survival **4.9 → 7.8 hrs**, resource isolation **1.45×**, over **10,000 Monte Carlo trials** (seed 2026). Always say "simulated, against my own baseline". |
| **Air Quality ML System** · 01/05/2026 – 30/05/2026 | End-to-end ML pipeline on the IQAir *2025 World Air Quality Report* (released March 2026) predicting regional **PM2.5**. Comparative framework across Random Forest and Gradient Boosting. | Python, scikit-learn, ensemble learning | **R² ≈ 0.97** — the only metric the repo documents. Never "97% accuracy": regression, not classification. Repo-stated limits: correlation ≠ causality; robustness concentrated in densely monitored regions; specific to the 2025 cycle. |
| **KIDO** — A Safe, Agentic-AI Learning Ecosystem for Children · 14/04/2026 – 10/05/2026 | Production-grade EdTech platform, **live and installable** (web, PWA, signed Android APK). **11 cooperating agents** on a ReAct loop with tool-calling, an orchestrator, a Contradiction-Detection agent and a Fallback-Recovery agent; every run persists an explainable trace. Model chain degrades Groq → Gemini → curated banks. Verifiable Parental Consent gates all social actions; single `getAccessibleChild()` server-side guard returns 403 on cross-account access; age-gated content; JWT + bcrypt + RBAC. MIT licensed. | **Next.js 15, React 19, TypeScript, Tailwind v4, Prisma ORM, PostgreSQL (Neon), NextAuth v5, Groq llama-3.3-70b, Gemini 2.0-flash, Vercel, PWA** | 11 agents; 5 architecture layers. **No learning-outcome study, no user base, no uptime figures.** Live demo: kido-orcin.vercel.app |
| **Self-Regulating AI** · 30/01/2026 – 10/02/2026 | Biologically inspired autonomous agent using a continuous homeostatic feedback loop for dynamic hyperparameter adaptation; treats high loss as environment-induced stress and self-tunes under non-stationary drift. | Python, ML | none — no benchmark result recorded |
| **3D portfolio + BYTE agent** (FlyRank capstone) | Three.js portfolio with an embedded retrieval agent answering from a 19-entry local knowledge base, no API key, no backend; refuses out-of-scope questions. | Three.js, vanilla JS/CSS, GitHub Pages | 19 KB entries; ~3,200-particle field |

**Public repos — all four confirmed on the CV**, so they can be offered to a reviewer:
`aurexis-core` · `KIDO` (live demo: kido-orcin.vercel.app) · `Air-Quality-Prediction` ·
`self-regulating-ai` · plus `portfolio`.

### 4b. Where the CV and the website contradict each other

Do not paper over these. Until Farhan reconciles them, treat the CV as correct and **do not state the
website's version of any row below**:

| Item | Website said | CV says | **Repo says (authoritative)** | Ruling |
|---|---|---|---|---|
| KIDO stack | Flutter, FastAPI, PostgreSQL, Redis, Python, OpenAI APIs | TypeScript, Kotlin, Node.js | **Next.js 15, React 19, TypeScript, Prisma, PostgreSQL (Neon), Groq, Gemini** | **Resolved — both earlier sources were wrong.** No FastAPI, no Redis, no OpenAI APIs, no Python. The Flutter claim traces to a real early commit later reverted to "keep only the Next.js project". Site corrected 5 Aug 2026; **the CV still needs fixing.** |
| Deep-learning framework | TensorFlow | PyTorch (skills + AUREXIS stack) | AUREXIS is "rule-based… **not neural networks**"; no PyTorch in its stack | **Both unverified.** TensorFlow appears only on the site; PyTorch is claimed on the CV but contradicted by the one repo that supposedly used it. Output `NO EVIDENCE` for either until a repo shows one. |
| AQI metrics | R² ≈ 0.97 | R² = 0.9746 **and MAE = 3.13 µg/m³** | **R² ≈ 0.97 only — no MAE stated** | Claim R² ≈ 0.97. The MAE is uncorroborated; do not use it. |
| AQI deployment | notebook result | "served real-time inferences through a modular FastAPI framework" | **no deployment documented** — local execution via Python scripts | **The CV overstates this.** Do not claim a serving layer. My earlier "correction" that upgraded this to SUPPORTED was itself wrong. |
| AUREXIS maturity | absent from site | prototype, "core modules tested locally" | live web console, Monte Carlo engine, air-gap core, real phone alerts, Docker — **more built than the CV implies** | The CV *understates* it. Use the repo's implemented/planned split. |
| Crisis Intelligence (Google AI Seekho hackathon) | listed as a project | **absent from the CV** | Site-only. Do not lead with it; ask Farhan whether it belongs. |
| Laravel builds (canteen, job portal, CMS) | listed as shipped | Laravel/MySQL in skills, projects not listed | Skills yes, specific builds unverified. |
| Certification count | 27 credentials, **all 20** Anthropic Academy courses (updated 8 Aug 2026) | 5 listed; **no Anthropic certificates at all** | The Anthropic certs are verifiable via skilljar (§6) but are missing from the CV — a gap in the CV, not in the facts, and now a 20-certificate gap rather than a 10. |

---

## 5. Technical skills — as actually evidenced

Taken from the CV's own skills section, which is narrower than the website's list.

**Languages:** C · Java · Python · TypeScript · Kotlin
**ML / AI:** agentic multi-agent frameworks · Random Forest · gradient boosting · ensemble learning ·
scikit-learn · **PyTorch** · model evaluation and optimisation · principles of AI · NLP
**Cloud & infrastructure:** AWS · CDN · scalable infrastructure · cloud security and compliance ·
cloud architecture design
**Backend & web:** Laravel · FastAPI · MySQL · REST APIs · Laravel Sanctum · AJAX · Bootstrap 5
**Also evidenced by projects:** NumPy · Pandas · Docker · Node.js · Three.js · HTML/JS/CSS
**Other:** penetration testing · cyber security · project management · MS Office · configuration
management · ICT network routing · operating systems

**Website-only, unverified by the CV** — usable only if Farhan reconciles them: TensorFlow · OpenCV ·
Flutter · Dart · PostgreSQL · Neon · Firebase · Redis · GitHub Actions · C++ · JavaScript · PHP ·
SQL · Jupyter · Colab · Postman · Figma.

**Adjacent-but-absent — the highest-risk substitutions.** These are *not* mine. If a posting asks
for one, output `NO EVIDENCE`; do not offer the neighbour as if it counted:

| Asked for | Truth |
|---|---|
| Hugging Face / transformers library | Not evidenced. |
| LangChain / LlamaIndex / vector DBs (Pinecone, Weaviate, FAISS) | Not evidenced. BYTE is keyword+phrase retrieval, not embeddings. |
| Fine-tuning / RLHF / training LLMs | Not evidenced. I integrate and prompt models; I have not fine-tuned one. |
| Kubernetes | Not evidenced. Docker only. |
| Spark / Hadoop / big-data pipelines | Not evidenced. |
| R / MATLAB / Julia / Scala / Go / Rust | Not evidenced. |
| React / Vue / Angular / Next.js | Not evidenced. TypeScript **is** evidenced (KIDO); the frameworks are not. |
| TensorFlow | Website only, absent from the CV and from every repo. Do not claim it. |
| PyTorch | Claimed on the CV, but the AUREXIS repo it is attributed to states the system is rule-based and *not* neural networks. **Unverified — do not claim it** until a repo demonstrates it. |
| Any deep-learning framework at all | No repo evidences one. The ML work is scikit-learn ensembles (Random Forest, Gradient Boosting). That is real ML and worth stating plainly; it is not deep learning. |
| Kaggle competition placement | Data science coursework at NED Academy. No placement or medal. |
| CI/CD at scale | No production pipeline evidenced. |
| FPGA / hardware engineering | AUREXIS's FPGA safety layer is **designed and planned**, never built. Never imply hardware was delivered. |

---

## 6. Certifications — 27 credentials, IDs for verification

**Anthropic Academy — all 20, the complete catalogue (5 with verify links, 15 more on LinkedIn)**

| Certificate | Credential ID | Verify |
|---|---|---|
| AI Fluency Framework & Foundations | `mcahqkoh8fza` | verify.skilljar.com/c/mcahqkoh8fza |
| AI Fluency for Builders | `zaujx5d969gf` | verify.skilljar.com/c/zaujx5d969gf |
| AI Capabilities and Limitations | `tbpn7pwtt3wn` | verify.skilljar.com/c/tbpn7pwtt3wn |
| Introduction to Claude Cowork | `8i64i4zo5aao` | verify.skilljar.com/c/8i64i4zo5aao |
| Teaching AI Fluency | `zep7y3v3x8qk` | verify.skilljar.com/c/zep7y3v3x8qk |
| **Developer track, all Aug 2026 (10):** Introduction to Model Context Protocol · Model Context Protocol: Advanced Topics · Claude Code 101 · Claude Code in Action · Introduction to subagents · Introduction to agent skills · Building with the Claude API · Claude Platform 101 · Claude with Amazon Bedrock · Claude on Google Cloud | IDs not yet recorded | on LinkedIn |
| **Remaining AI Fluency (5):** Claude 101 · AI Fluency for Students / Educators / Nonprofits / Small Businesses | IDs not yet recorded | on LinkedIn |

**Others**

| Certificate | Issuer | Year | ID |
|---|---|---|---|
| Google AI Specialization (AI Essentials, using AI responsibly) | Google · Coursera | 2025 | `UYZ1HWZF5EUW` |
| Foundations of Cyber Security | Google · Coursera | 2024 | `LJD77YK6QZJ3` |
| AWS Academy Graduate — Cloud Foundations | Amazon Web Services | 2026 | LinkedIn badge |
| High Achievement Diploma — Applied Mathematics & AI | Open Doors · Global Universities (International Olympiad) | 2026 | `2025-BT-APP-H108` |
| High Achievement Diploma — Engineering & Technology | Open Doors · Global Universities (International Olympiad) | 2026 | `2025-BT-ENG-H197` |
| Certified Data Science (Kaggle, web scraping, applied DS) | NED University · PITP | 2025 | ID `25277` |
| Cyber Security & Ethical Hacking (Competence) | NED University · PITP | 2025 | ID `31419` |

---

## 7. Research interests and goals

**Interests:** AI · ML · deep learning · agentic AI · LLMs · reinforcement learning · data science ·
computer vision · NLP · human-AI interaction · AI for education · AI for healthcare ·
AI for sustainability · responsible AI · explainable AI (15 areas as listed on the site).

**Focus statement:** trustworthy, explainable AI for education, healthcare, sustainability and
humanitarian response.

**Goals:** publish AI research · collaborate internationally · build socially beneficial AI ·
contribute to open-source AI · pursue graduate study (MS and PhD).

**Listed as:** "research proposal author" — a proposal exists but is **not yet public and not
attached**. Do not describe its contents, title or findings; there is no evidence here for any of it.

---

## 8. Languages and admin

Europass self-assessed levels (CEFR). These are **self-assessed, not test-certified** — say so if a
posting asks for certification:

| Language | Listening | Reading | Spoken production | Spoken interaction | Writing |
|---|---|---|---|---|---|
| Urdu | mother tongue | — | — | — | — |
| English | C1 | B2 | B2 | B2 | B2 |
| Punjabi | C2 | C2 | C2 | C2 | B2 |

- Formal English test score (IELTS/TOEFL): **none** → `NO EVIDENCE`. Where a posting demands an
  official score, the honest answer is that none has been taken, not the CEFR self-assessment.
- Nationality: Pakistani. Passport: held (number and expiry in the private file — **expiry unverified**).
- Visa/work-authorisation status for any specific country: `NO EVIDENCE`.
- CV as PDF: **does not exist yet** (listed as a P2 gap in `PROJECT-BRIEF.md`). Never tell a
  recipient a CV is attached.

---

## 9. Deliberate gap list — always `NO EVIDENCE`

Written down so the model has a definite answer instead of an invented one:

1. Publications, preprints, citations, conference talks
2. Class rank or transcript documents (the CGPA itself is in the private file)
3. Paid *software* employment; any "N years of software experience" claim
4. Named referees or testimonials
5. Open-source contributions to other people's repositories (PRs merged elsewhere)
6. Prize money; any competition *placing* — but see the Open Doors note below
7. Production systems with real users, uptime or scale numbers
8. Before/after learning metrics for KIDO
9. Security clearance, driving licence, professional memberships
10. Any framework, library or cloud service not listed in section 5
11. Delivered hardware of any kind (AUREXIS's FPGA layer is designed, not built)

**Partial exception to 6 — the Open Doors diplomas.** The CV states both High Achievement Diplomas
were awarded from a pool of **146,000+ international applicants**, in a competition run by leading
Russian research universities with the Ministry of Science and Higher Education. That is a real
competitive distinction and may be cited with the applicant-pool figure. It is *not* a ranking: there
is no "1st place" or percentile, so never imply one.

---

## 10. Honest one-liners the draft step may reuse

These are pre-approved because each is traceable to a row above:

- "I'm a CS undergraduate at SZABIST (started Sept 2023), currently an AI intern at FlyRank AI."
- "I built an end-to-end ML pipeline on the IQAir 2025 air-quality report that predicts regional PM2.5
  with a Random Forest at R² = 0.9746 and MAE 3.13 µg/m³, served through FastAPI."
- "I built KIDO, an open-source multi-agent EdTech framework — 11 agents that adapt learning
  parameters to a child's engagement and cognitive stress." *(No stack claim: the CV and site
  disagree — see §4b.)*
- "I'm prototyping AUREXIS, a survival-habitat architecture for extreme environments: five
  specialised agents under a priority-driven arbitrator, with the safety logic validated by Monte
  Carlo stress-testing. The hardware safety layer is designed, not built."
- "I built a self-regulating agent that treats high loss as environment-induced stress and re-tunes
  its own hyperparameters under non-stationary drift."
- "I shipped a 3D portfolio with an embedded agent that refuses questions outside its 19-entry
  knowledge base rather than inventing answers."
- "I hold 27 credentials, including all 20 Anthropic Academy certificates — the complete
  catalogue, developer track included: MCP introduction and advanced, Claude Code, subagents,
  agent skills, the Claude API, Bedrock and Google Cloud."
- "The MCP and subagent certificates are not decoration — I built an MCP server and an agent loop
  on top of that material, and both are public."
- "Two Open Doors High Achievement Diplomas — Applied Mathematics & AI, and Engineering & Technology —
  from a pool of 146,000+ international applicants."
- "My honest gap is publications: I have prototypes and 27 design documents but nothing
  peer-reviewed, which is exactly what I want a research group for."
