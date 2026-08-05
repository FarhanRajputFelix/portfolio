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

**Source of truth: the Europass CV (dated 5 Aug 2026), which overrides the website wherever the two
disagree.** They disagree in several places — see §4b. Dates below are the CV's.

| Project | What it is | Stack (per CV) | Hard number |
|---|---|---|---|
| **AUREXIS** — Autonomous Ultra-Resilient Emergency & eXigency Interface System · 25/05/2024 – current | Research prototype: software-defined survival habitat architecture for extreme environments (space, deep-sea, disaster zones), evolved from an earlier C prototype (MESP). Zero-Interaction Protocol — a *proposed* hardware-enforced safety model with an air-gapped core for life-critical actuators and an FPGA-based Hardware Safety Layer. Priority-driven Meta-Arbitrator orchestrating 5 specialised agents (Environment, Resource, Health, Psychology, Emergency). | Python, NumPy, Pandas, **PyTorch**, scikit-learn, Docker, Raspberry Pi (planned), HTML/JS/CSS | **27 technical design documents**; core safety logic validated by Monte Carlo stress-testing *in local development*. Hardware integration, deployment and FPGA field-testing are **planned, not done** — say so. |
| **Air Quality ML System** · 01/05/2026 – 30/05/2026 | End-to-end ML pipeline on the IQAir 2025 World Air Quality Report predicting regional **PM2.5** concentrations. Compared ensemble architectures, deployed a Random Forest. Serves real-time inference through FastAPI. | Python, FastAPI, Joblib, ensemble learning | **R² = 0.9746** and **MAE = 3.13 µg/m³** — quote both exactly. Never "97% accuracy": it is a regression, and accuracy is not its metric. |
| **KIDO** — Agentic AI Learning Ecosystem for Children · 14/04/2026 – 10/05/2026 | Open-source multi-agent EdTech framework of **11 collaborative AI agents** adaptively scaling learning parameters to children's engagement and cognitive stress. AI tutor, parent/teacher analytics dashboards, child-safety protocols preventing unauthorised external connections. | **TypeScript, Kotlin, Node.js** | 11 agents. No before/after learning metrics. |
| **Self-Regulating AI** · 30/01/2026 – 10/02/2026 | Biologically inspired autonomous agent using a continuous homeostatic feedback loop for dynamic hyperparameter adaptation; treats high loss as environment-induced stress and self-tunes under non-stationary drift. | Python, ML | none — no benchmark result recorded |
| **3D portfolio + BYTE agent** (FlyRank capstone) | Three.js portfolio with an embedded retrieval agent answering from a 19-entry local knowledge base, no API key, no backend; refuses out-of-scope questions. | Three.js, vanilla JS/CSS, GitHub Pages | 19 KB entries; ~3,200-particle field |

**Public repos — all four confirmed on the CV**, so they can be offered to a reviewer:
`aurexis-core` · `KIDO` (live demo: kido-orcin.vercel.app) · `Air-Quality-Prediction` ·
`self-regulating-ai` · plus `portfolio`.

### 4b. Where the CV and the website contradict each other

Do not paper over these. Until Farhan reconciles them, treat the CV as correct and **do not state the
website's version of any row below**:

| Item | Website says | CV says | Ruling |
|---|---|---|---|
| KIDO stack | Flutter, FastAPI, PostgreSQL, Redis, Python, OpenAI APIs | TypeScript, Kotlin, Node.js | **Unresolved and serious.** These are disjoint stacks. Say nothing specific about KIDO's stack until Farhan confirms which is true. |
| Deep-learning framework | TensorFlow | PyTorch | **PyTorch is evidenced** (AUREXIS stack + skills list). TensorFlow appears only on the site and is **not** on the CV — treat TensorFlow as unverified. |
| AQI figure | R² ≈ 0.97, "environmental datasets" | R² = 0.9746, MAE 3.13 µg/m³, PM2.5 from IQAir 2025 | Use the CV's precise pair. |
| AQI deployment | notebook result | served via FastAPI | Served. This materially strengthens any MLOps requirement. |
| Crisis Intelligence (Google AI Seekho hackathon) | listed as a project | **absent from the CV** | Site-only. Do not lead with it; ask Farhan whether it belongs. |
| Laravel builds (canteen, job portal, CMS) | listed as shipped | Laravel/MySQL in skills, projects not listed | Skills yes, specific builds unverified. |
| Certification count | 17 credentials, 10 from Anthropic | 5 listed; **no Anthropic certificates at all** | The Anthropic certs are verifiable via skilljar (§6) but are missing from the CV — a gap in the CV, not in the facts. |

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
| TensorFlow | **Website only, absent from the CV.** Do not claim it. PyTorch is the evidenced framework. |
| Kaggle competition placement | Data science coursework at NED Academy. No placement or medal. |
| CI/CD at scale | No production pipeline evidenced. |
| FPGA / hardware engineering | AUREXIS's FPGA safety layer is **designed and planned**, never built. Never imply hardware was delivered. |

---

## 6. Certifications — 17 credentials, IDs for verification

**Anthropic Academy (10 total; 5 with verify links, 5 more on LinkedIn)**

| Certificate | Credential ID | Verify |
|---|---|---|
| AI Fluency Framework & Foundations | `mcahqkoh8fza` | verify.skilljar.com/c/mcahqkoh8fza |
| AI Fluency for Builders | `zaujx5d969gf` | verify.skilljar.com/c/zaujx5d969gf |
| AI Capabilities and Limitations | `tbpn7pwtt3wn` | verify.skilljar.com/c/tbpn7pwtt3wn |
| Introduction to Claude Cowork | `8i64i4zo5aao` | verify.skilljar.com/c/8i64i4zo5aao |
| Teaching the AI Fluency Framework | `zep7y3v3x8qk` | verify.skilljar.com/c/zep7y3v3x8qk |
| + 5 more: Claude 101 · AI Fluency for Students / Educators / Nonprofits / Small Businesses | on LinkedIn | linkedin.com/in/farhan-rajput/details/certifications/ |

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
- "I hold 17 credentials including 10 from Anthropic Academy, all individually verifiable."
- "Two Open Doors High Achievement Diplomas — Applied Mathematics & AI, and Engineering & Technology —
  from a pool of 146,000+ international applicants."
- "My honest gap is publications: I have prototypes and 27 design documents but nothing
  peer-reviewed, which is exactly what I want a research group for."
