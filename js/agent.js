/* ==========================================================
   Personal Agent — retrieval over a local knowledge base.
   No API key, no network calls: works on static hosting.

   How it works:
   1. Every entry has trigger keywords + weighted phrases.
   2. A question is tokenised, stop-words dropped, and scored
      against each entry (keyword hits + phrase bonus).
   3. The best-scoring entry answers; ties fall back to a
      "here's what I can tell you" menu.
   ========================================================== */

(function (global) {
  'use strict';

  /* ---------------- Knowledge base (facts only) ---------------- */
  const KB = [
    {
      id: 'identity',
      keys: ['yourself', 'introduce', 'intro', 'name', 'farhan', 'bashir', 'bio', 'background'],
      phrases: ['who are you', 'who is farhan', 'tell me about you', 'about yourself',
                'introduce yourself', 'about farhan', 'your background'],
      answer:
        "I'm Farhan Bashir — a Computer Science undergraduate at SZABIST University in Karachi, Pakistan, " +
        "and currently an Artificial Intelligence Intern at FlyRank AI on the General AI Fluency track.\n\n" +
        "I'm passionate about AI, Machine Learning, Agentic AI and Data Science, and I build intelligent " +
        "systems for education, healthcare, crisis management and sustainability."
    },
    {
      id: 'education',
      keys: ['education', 'study', 'studying', 'university', 'degree', 'college', 'szabist',
             'graduation', 'student', 'major', 'academic', 'coursework'],
      phrases: ['where do you study', 'what is your degree', 'when do you graduate'],
      answer:
        "I'm doing a BS in Computer Science at SZABIST University (Shaheed Zulfikar Ali Bhutto Institute " +
        "of Science and Technology), Karachi.\n\n" +
        "• Started: September 2023\n• Expected graduation: 2027\n" +
        "• Coursework across AI, machine learning, data science and software engineering"
    },
    {
      id: 'internship',
      keys: ['flyrank', 'intern', 'internship', 'job', 'working', 'experience',
             'employment', 'role', 'company', 'history'],
      phrases: ['where do you work', 'your experience', 'current role', 'what do you do',
                'work history', 'work experience'],
      answer:
        "Current role — Artificial Intelligence Intern at FlyRank AI (July 2026 – present, remote).\n\n" +
        "I'm on the General AI Fluency track, working on AI learning pathways, professional development " +
        "and applied AI projects, and I've completed the Anthropic AI Fluency certification series.\n\n" +
        "I also competed in the Google AI Seekho Antigravity Hackathon, where I built Crisis " +
        "Intelligence — an emergency-response tool driven by AI agents."
    },
    {
      id: 'skills',
      keys: ['skill', 'skills', 'tech', 'stack', 'technology', 'technologies', 'language',
             'languages', 'framework', 'frameworks', 'tool', 'tools', 'coding',
             'programming', 'python', 'java', 'javascript', 'flutter', 'dart', 'php', 'sql', 'c++'],
      phrases: ['what are your skills', 'tech stack', 'what can you do', 'what languages'],
      answer:
        "Languages: Python, C++, Java, JavaScript, PHP, SQL, HTML, CSS, Dart\n\n" +
        "Frameworks: TensorFlow, Scikit-learn, Pandas, NumPy, OpenCV, FastAPI, Flutter, Laravel, " +
        "Node.js / Express.js\n\n" +
        "Databases: PostgreSQL, Neon PostgreSQL, MySQL, Firebase, Redis\n\n" +
        "Cloud & DevOps: AWS, Docker, GitHub Actions, Firebase\n\n" +
        "Tools: Git, GitHub, VS Code, Linux, Jupyter, Google Colab, Postman, Figma"
    },
    {
      id: 'ai-skills',
      keys: ['ai', 'ml', 'machine', 'learning', 'deep', 'neural', 'model', 'agentic',
             'llm', 'llms', 'nlp', 'vision', 'data', 'science', 'tensorflow', 'sklearn'],
      phrases: ['ai skills', 'machine learning', 'what ai', 'deep learning'],
      answer:
        "My AI stack: Machine Learning, Deep Learning, Neural Networks, Random Forest, " +
        "classification & regression, model evaluation, data visualization, Agentic AI systems " +
        "and LLM integration.\n\n" +
        "Hands-on with TensorFlow, Scikit-learn, Pandas, NumPy and OpenCV — and I've shipped ML work " +
        "end to end, e.g. an Air Quality Prediction model reaching R² ≈ 0.97 with Random Forest."
    },
    {
      id: 'projects',
      keys: ['project', 'projects', 'built', 'building', 'shipped', 'showcase', 'demo'],
      phrases: ['what projects', 'your projects', 'what have you built', 'show me projects'],
      answer:
        "Featured projects:\n\n" +
        "1. KIDO — AI-powered educational platform for children (Flutter, FastAPI, PostgreSQL, Redis, " +
        "Python, OpenAI APIs) with adaptive quizzes, an AI tutor, gamification, learning analytics and " +
        "parent/teacher portals on a COPPA-aware architecture.\n\n" +
        "2. Self-Regulating AI System — research prototype on adaptive agents that detect drift and " +
        "self-correct using entropy-based regulation.\n\n" +
        "3. Air Quality Prediction — Random Forest AQI model, R² ≈ 0.97.\n\n" +
        "4. Crisis Intelligence — Google AI Seekho Antigravity Hackathon build for emergency response " +
        "using AI agents, maps, Flutter, Firebase and a Python backend.\n\n" +
        "5. Laravel Canteen Management System, a Job Portal, and a Contact Management System.\n\n" +
        "Ask me about any one of them for detail."
    },
    {
      id: 'kido',
      keys: ['kido', 'children', 'kids', 'educational', 'tutor', 'quiz', 'quizzes', 'coppa'],
      phrases: ['tell me about kido', 'what is kido'],
      answer:
        "KIDO is my flagship project — an AI-powered educational platform for children.\n\n" +
        "Stack: Flutter, FastAPI, PostgreSQL, Redis, Python, OpenAI APIs.\n" +
        "Features: adaptive quizzes, an AI tutor, gamification, learning analytics, a parent dashboard " +
        "and a teacher portal — all on a COPPA-aware architecture."
    },
    {
      id: 'aqi',
      keys: ['air', 'quality', 'aqi', 'environment', 'environmental', 'random', 'forest',
             'accuracy', 'r2', 'pollution'],
      phrases: ['air quality', 'aqi project'],
      answer:
        "Air Quality Prediction — a Machine Learning model that predicts AQI from environmental " +
        "datasets. I used a Random Forest regressor and reached R² ≈ 0.97. It sits at the intersection " +
        "of environmental AI and data science, which is one of my core interest areas."
    },
    {
      id: 'self-reg',
      keys: ['self', 'regulating', 'regulation', 'entropy', 'drift', 'adaptive', 'agent',
             'agents', 'prototype', 'research'],
      phrases: ['self regulating', 'entropy based', 'research prototype'],
      answer:
        "The Self-Regulating AI System is a research prototype exploring adaptive intelligent agents " +
        "that can detect drift, maintain stability and self-correct using entropy-based regulation. " +
        "It's my main hands-on exploration of Agentic AI and adaptive systems."
    },
    {
      id: 'hackathon',
      keys: ['hackathon', 'crisis', 'emergency', 'seekho', 'antigravity', 'google', 'competition',
             'disaster', 'maps'],
      phrases: ['crisis intelligence', 'hackathon project'],
      answer:
        "Crisis Intelligence was built for the Google AI Seekho Antigravity Hackathon. It focuses on " +
        "emergency response, combining AI agents, live maps, a Flutter front end, Firebase and a " +
        "Python backend."
    },
    {
      id: 'research',
      keys: ['research', 'interests', 'interest', 'phd', 'masters', 'publication',
             'publications', 'paper', 'papers'],
      phrases: ['research interests', 'what research', 'research goals'],
      answer:
        "Research interests: Artificial Intelligence, Machine Learning, Deep Learning, Agentic AI, " +
        "LLMs, Reinforcement Learning, Data Science, Computer Vision, NLP, Human-AI Interaction, " +
        "AI for Education, AI for Healthcare, AI for Sustainability, Responsible AI and Explainable AI.\n\n" +
        "Research goals: publish AI research papers, collaborate internationally, develop socially " +
        "beneficial AI systems, contribute to open-source AI, and pursue an MS and PhD abroad.\n\n" +
        "Publications are still coming — research papers, conference publications, AI articles and " +
        "technical blogs are on the roadmap."
    },
    {
      id: 'goal',
      keys: ['goal', 'goals', 'career', 'objective', 'future', 'ambition', 'aspire',
             'plans', 'vision', 'aspiration'],
      phrases: ['career goal', 'what do you want', 'your objective', 'long term'],
      answer:
        "My career objective: to become an internationally recognized AI researcher developing " +
        "trustworthy, explainable and socially impactful intelligent systems, while contributing to " +
        "open research and global innovation.\n\n" +
        "Practically that means graduate study abroad, then research " +
        "roles where AI can improve education, healthcare, sustainability and humanitarian response."
    },
    {
      id: 'grad-study',
      keys: ['abroad', 'graduate', 'grad', 'postgraduate', 'admission', 'admissions',
             'supervisor', 'program', 'programme'],
      phrases: ['graduate study', 'study abroad', 'masters abroad', 'phd abroad'],
      answer:
        "I'm working toward graduate study abroad — an MS and then a PhD — with a research focus on " +
        "trustworthy, explainable and socially impactful AI.\n\n" +
        "Groundwork so far: an Open Doors High Achievement Diploma in Applied Mathematics & AI, " +
        "the Anthropic AI Fluency certification series, a research prototype on self-regulating AI " +
        "agents, and applied ML work like my AQI prediction model (R² ≈ 0.97).\n\n" +
        "If you're a supervisor or researcher, email is the best way to reach me: " +
        "farhanmuhammadbashir@gmail.com"
    },
    {
      id: 'certs',
      keys: ['certificate', 'certificates', 'certification', 'certifications', 'certified',
             'anthropic', 'course', 'courses', 'coursera', 'ned', 'fluency', 'credential',
             'claude', 'cowork'],
      phrases: ['what certifications', 'your certificates', 'how many certificates'],
      answer:
        "17 certifications so far. The key ones:\n\n" +
        "Anthropic Academy (10 in total, 2026) — the main ones being AI Fluency Framework & " +
        "Foundations, AI Fluency for Builders, AI Capabilities and Limitations, and Introduction " +
        "to Claude Cowork.\n\n" +
        "• AWS Academy Graduate — Cloud Foundations (2026)\n" +
        "• Open Doors High Achievement Diploma — Applied Mathematics & AI (2026)\n" +
        "• Open Doors High Achievement Diploma — Engineering & Technology (2026)\n" +
        "• Cyber Security & Ethical Hacking — NED University (2025)\n" +
        "• Google AI Specialization (2025)\n" +
        "• Certified Data Science — NED University (2025)\n" +
        "• Foundations of Cyber Security — Google (2024)"
    },
    {
      id: 'achievements',
      keys: ['achievement', 'achievements', 'award', 'awards', 'medal', 'medalist', 'gold',
             'tcf', 'accomplishment', 'accomplishments', 'olympiad'],
      phrases: ['your achievements', 'any awards'],
      answer:
        "Achievements: Gold Medalist at TCF School, two Open Doors High Achievement Diplomas " +
        "(Applied Mathematics & AI, and Engineering & Technology), AI hackathon participant, " +
        "research proposal author, Machine Learning project developer and active open-source learner."
    },
    {
      id: 'leadership',
      keys: ['leadership', 'leader', 'lead', 'captain', 'cricket', 'team', 'manage',
             'managing', 'mentor', 'teamwork', 'collaborate', 'collaboration'],
      phrases: ['leadership skills', 'leadership experience', 'lead a team', 'work in a team'],
      answer:
        "Leadership: I captained my cricket team, and I lead collaborative projects — including " +
        "hackathon teamwork at the Google AI Seekho Antigravity Hackathon, where we built Crisis " +
        "Intelligence under time pressure.\n\n" +
        "I'm also the kind of teammate who documents and reviews: software quality assurance and " +
        "code review are among my top listed skills, and I hold Anthropic's Teaching the AI Fluency " +
        "Framework certificate, which is about guiding other people through AI workflows."
    },
    {
      id: 'security-cloud',
      keys: ['security', 'cyber', 'cybersecurity', 'hacking', 'ethical', 'aws', 'cloud',
             'devops', 'infrastructure'],
      phrases: ['cyber security', 'ethical hacking', 'cloud experience', 'do you know aws'],
      answer:
        "Cloud: AWS Academy Graduate — Cloud Foundations (2026), covering cloud infrastructure, " +
        "security and core AWS services. I also work with Docker, GitHub Actions and Firebase.\n\n" +
        "Security: Cyber Security & Ethical Hacking — NED University (2025), and Foundations of " +
        "Cyber Security — Google (2024). It's a supporting interest rather than my main track — " +
        "my focus is AI and machine learning."
    },
    {
      id: 'contact',
      keys: ['contact', 'email', 'reach', 'linkedin', 'github', 'connect', 'message',
             'mail', 'touch', 'social', 'link', 'links'],
      phrases: ['how can i contact', 'get in touch', 'your email', 'reach you', 'contact you'],
      answer:
        "Easiest way is email: farhanmuhammadbashir@gmail.com\n\n" +
        "LinkedIn: linkedin.com/in/farhan-rajput\n" +
        "GitHub: github.com/FarhanRajputFelix\n\n" +
        "I'm based in Karachi, Pakistan and open to remote collaboration."
    },
    {
      id: 'location',
      keys: ['location', 'city', 'country', 'based', 'live', 'living',
             'karachi', 'pakistan', 'remote', 'relocate', 'nationality'],
      phrases: ['where are you based', 'where do you live', 'where are you from',
                'what country', 'which city'],
      answer:
        "I'm based in Karachi, Sindh, Pakistan, and I'm Pakistani by nationality. " +
        "I'm open to remote work and to relocating abroad for graduate study."
    },
    {
      id: 'site',
      keys: ['site', 'website', 'portfolio', 'three', 'threejs', 'capstone',
             'agent', 'chatbot', 'bot', 'human'],
      phrases: ['how was this site built', 'about this website', 'what is this site',
                'how do you work', 'are you real', 'real person', 'how were you built',
                'this page', 'are you human'],
      answer:
        "This site is my FlyRank AI capstone — a 3D portfolio built with Three.js, vanilla JavaScript " +
        "and CSS, deployed as a static site on GitHub Pages.\n\n" +
        "And me? I'm a lightweight retrieval agent: no API key, no server. Your question is matched " +
        "against a knowledge base of Farhan's real details written into the page, so I only ever answer " +
        "with facts he actually provided."
    },
    {
      id: 'strengths',
      keys: ['strength', 'strengths', 'hire', 'hiring', 'unique', 'special',
             'motivation', 'motivated', 'passion'],
      phrases: ['why should we hire', 'why should i hire', 'what are your strengths',
                'what makes you', 'why you'],
      answer:
        "What I'd point to: I build full systems, not just notebooks — KIDO spans Flutter, FastAPI, " +
        "PostgreSQL and Redis, and my AQI model went from raw environmental data to R² ≈ 0.97.\n\n" +
        "I also ship under pressure (Google AI Seekho Antigravity Hackathon), lead teams (cricket team " +
        "captain, collaborative project lead), and keep a steady record of certifications and research " +
        "proposals alongside full-time coursework. Persistence is the through-line."
    }
  ];

  const GREETINGS = ['hi', 'hey', 'hello', 'yo', 'salam', 'assalam', 'hola', 'greetings', 'sup'];
  const THANKS = ['thanks', 'thank', 'thx', 'appreciate', 'great', 'awesome', 'nice', 'cool'];

  const STOP = new Set([
    'a','an','the','is','are','am','was','were','be','been','do','does','did','of','in','on','at',
    'to','for','with','and','or','but','if','so','it','its','this','that','these','those','my',
    'me','i','him','her','their','there','here','can','could','would','should','will','shall',
    'have','has','had','get','got','tell','give','show','please','about','from','as','by','up'
  ]);

  const SUGGESTIONS = [
    'Who are you?',
    'What are your skills?',
    'Tell me about KIDO',
    'Research interests?',
    'Why should we hire you?',
    'How can I contact you?'
  ];

  /* ---------------- Matching ---------------- */
  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s+#]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !STOP.has(w));
  }

  /* How many entries claim each keyword. A word owned by one entry is a strong
     signal; a word several entries share is weak. Without this, "leadership
     skills" scored the tech-stack entry as highly as the achievements entry,
     because both "leadership" and "skills" were worth a flat 3. */
  const KEY_FREQ = {};
  KB.forEach(e => {
    new Set(e.keys).forEach(k => { KEY_FREQ[k] = (KEY_FREQ[k] || 0) + 1; });
  });

  function keyWeight(k) {
    const f = KEY_FREQ[k] || 1;
    return f === 1 ? 3.2 : f === 2 ? 1.8 : 0.9;
  }

  function score(entry, tokens, raw) {
    let s = 0;

    tokens.forEach(tok => {
      entry.keys.forEach(k => {
        if (k === tok) s += keyWeight(k);
        else if (k.length > 3 && (k.startsWith(tok) || tok.startsWith(k))) s += keyWeight(k) * 0.5;
      });
    });

    (entry.phrases || []).forEach(p => {
      if (raw.includes(p)) s += 6.5;
    });

    return s;
  }

  function ask(question) {
    const raw = (question || '').toLowerCase().trim();
    if (!raw) return "Ask me anything about Farhan — his skills, projects, research or how to reach him.";

    const tokens = tokenize(raw);
    // whole words only — substring checks would make "who are yoU?" match the greeting "yo"
    const words = raw.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
    const short = words.length <= 4;

    // short social turns
    if (tokens.length === 0 || (short && words.some(w => GREETINGS.includes(w)))) {
      return "Hey! I'm Farhan's personal agent. Ask me about his projects, AI stack, research " +
             "interests, experience or how to get in touch.";
    }
    if (short && words.some(w => THANKS.includes(w))) {
      return "Anytime. Anything else you'd like to know — projects, research goals, contact details?";
    }

    const ranked = KB
      .map(entry => ({ entry, s: score(entry, tokens, raw) }))
      .sort((a, b) => b.s - a.s);

    if (ranked[0].s < 3) {
      return "I don't have that in Farhan's knowledge base, so I won't guess.\n\n" +
             "Here's what I can cover: his background and education, AI/ML skills and tech stack, " +
             "projects (KIDO, Air Quality Prediction, Self-Regulating AI, Crisis Intelligence), " +
             "research interests, certifications, achievements, and contact details.\n\n" +
             "For anything else, email him directly: farhanmuhammadbashir@gmail.com";
    }

    return ranked[0].entry.answer;
  }

  global.PersonalAgent = {
    ask,
    suggestions: SUGGESTIONS,
    greeting:
      "Hi! I'm Farhan's personal agent — I run entirely in this page, no server involved.\n\n" +
      "Ask me about his background, AI stack, projects, research interests or how to reach him."
  };

})(window);
