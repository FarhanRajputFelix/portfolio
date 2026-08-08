/* ==========================================================
   UI logic — loader, kinetic type, cursor, reveals,
   tilt cards, counters, copy-to-clipboard, agent widget
   ========================================================== */

(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ==========================================================
     Loader
     ========================================================== */
  const loader = $('#loader');
  const bar = $('.loader-bar i');
  const pct = $('#loadPct');
  document.body.classList.add('loading');

  let progress = 0, retired = false, sceneUp = false;

  /* Largest Contentful Paint was measuring 25% "Poor" in Cloudflare's Core Web
     Vitals, and this loader was the reason. It used to hold the ceiling at 88%
     until Three.js (655 KB) reported ready, with a 3,000 ms fallback behind
     that — so on a slow connection the hero text, which is in the HTML from the
     first byte, stayed hidden for seconds behind a progress bar filled with
     Math.random().

     The scene is decoration. It must never gate the content. So the loader now
     runs on its own clock and retires on a hard deadline; the particle field and
     BYTE fade in whenever they are ready, which is what .ready already does. */
  const DEADLINE = 800;
  const loadT0 = performance.now();

  const tick = setInterval(() => {
    const elapsed = performance.now() - loadT0;
    // Track real elapsed time against the deadline rather than inventing a number.
    progress = Math.min(100, Math.max(progress, (elapsed / DEADLINE) * 100));
    bar.style.width = progress + '%';
    pct.textContent = Math.round(progress);
    if (progress >= 100) { clearInterval(tick); retire(); }
  }, 50);

  // Belt and braces: if the interval is starved by a slow main thread — which is
  // exactly the situation where LCP is already suffering — retire anyway.
  setTimeout(retire, DEADLINE + 150);

  function retire() {
    if (retired) return;
    retired = true;
    clearInterval(tick);
    bar.style.width = '100%';
    pct.textContent = '100';
    setTimeout(() => {
      loader.classList.add('done');
      document.body.classList.remove('loading');
      playHero();

      // body had overflow:hidden while loading, which can swallow the browser's
      // anchor jump on a deep link — redo it once scrolling is possible again
      if (location.hash.length > 1) {
        const el = document.querySelector(location.hash);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      }
    }, 90);   // was 260ms of deliberate delay in front of the content
  }

  // Kept only so the scene can still announce itself; it no longer holds the
  // loader open, which is the point of the change above.
  document.addEventListener('scene:ready', () => { sceneUp = true; });
  setTimeout(retire, 6500);

  /* ==========================================================
     Kinetic type — split into characters / words
     ========================================================== */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.animationDelay = `${i * 45}ms`;
      el.appendChild(s);
    });
  }

  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'word';
      s.textContent = w;
      s.style.transitionDelay = `${i * 60}ms`;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  $$('[data-split]').forEach(splitChars);
  $$('[data-split-words]').forEach(splitWords);

  function playHero() {
    $$('#hero [data-split]').forEach(el => el.classList.add('played'));
    $$('#hero [data-anim]').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 240 + i * 110);
    });
  }

  /* ==========================================================
     Rotating hero role — only titles actually held or in progress
     ========================================================== */
  const ROLES = ['AI INTERN', 'AI ENTHUSIAST', 'ML ENGINEER'];
  const roleEl = $('#roleRotate');
  let roleIdx = 0;

  if (roleEl && !reduce) {
    setInterval(() => {
      roleIdx = (roleIdx + 1) % ROLES.length;
      roleEl.textContent = ROLES[roleIdx];
      roleEl.classList.remove('swap');
      void roleEl.offsetWidth;          // restart the keyframe
      roleEl.classList.add('swap');
    }, 2800);
  }

  /* ==========================================================
     Scroll progress bar
     ========================================================== */
  const progBar = $('#progress i');
  const nav = $('#nav');

  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progBar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', scrollY > 40);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ==========================================================
     Nav
     ========================================================== */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  function closeNav() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });
  $$('a', navLinks).forEach(a => a.addEventListener('click', closeNav));

  /* ==========================================================
     Section tracking — drives the nav highlight AND the 3D
     companion's stage position / camera pose
     ========================================================== */
  const stage = $('#charStage');
  const SECTIONS = ['hero', 'about', 'doing', 'projects', 'certs', 'journey', 'contact'];
  let current = '';

  function setSection(id) {
    if (!SECTIONS.includes(id) || id === current) return;
    current = id;
    document.body.dataset.section = id;

    if (stage) {
      SECTIONS.forEach(s => stage.classList.remove('at-' + s));
      stage.classList.add('at-' + id);
    }
    // the character module listens for this and glides its camera + pose
    document.dispatchEvent(new CustomEvent('section:change', { detail: { id } }));

    const link = navLinks.querySelector(`a[href="#${id}"]`);
    $$('a', navLinks).forEach(a => a.classList.remove('active'));
    if (link) link.classList.add('active');
  }

  // scroll spy
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setSection(e.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach(s => spy.observe(s));

  // nav clicks react immediately instead of waiting for the scroll to land
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href').slice(1);
      if (id) setSection(id);
    });
  });

  // a deep link should place the companion correctly on first paint too
  const fromHash = location.hash.slice(1);
  setSection(SECTIONS.includes(fromHash) ? fromHash : 'hero');
  addEventListener('hashchange', () => setSection(location.hash.slice(1)));
  if (stage) setTimeout(() => stage.classList.add('ready'), 900);

  /* ==========================================================
     Reveal on scroll (everything outside the hero)
     ========================================================== */
  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => {
        e.target.classList.add('in');
        if (e.target.hasAttribute('data-split-words')) e.target.classList.add('played');
      }, i * 80);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -70px 0px' });

  $$('[data-anim], [data-split-words]').forEach(el => {
    if (!el.closest('#hero')) revealer.observe(el);
  });

  // Safety net: anything already on screen gets revealed outright. Without this a
  // deep link (index.html#projects) can land on content the observer never fired for,
  // leaving the section blank.
  function sweepReveal() {
    $$('[data-anim], [data-split-words]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 1.1 && r.bottom > -40) {
        el.classList.add('in');
        if (el.hasAttribute('data-split-words')) el.classList.add('played');
      }
    });
  }
  addEventListener('load', () => setTimeout(sweepReveal, 400));
  addEventListener('hashchange', () => setTimeout(sweepReveal, 700));
  setTimeout(sweepReveal, 3000);

  /* ==========================================================
     Animated counters
     ========================================================== */
  const counters = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const to = parseFloat(el.dataset.to);
      const dec = parseInt(el.dataset.dec || '0', 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();

      // The markup ships the real number so that a visitor whose JS is slow,
      // blocked or mid-load reads "17 Certifications" rather than "0". We only
      // drop it to zero here, at the moment we know we can animate it back up.
      el.textContent = '0';

      (function step(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      })(start);

      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('.count').forEach(el => counters.observe(el));

  /* ==========================================================
     Pointer glow on cards
     ========================================================== */
  $$('.work, .cert, .do-row').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ==========================================================
     3D tilt on project cards
     ========================================================== */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ==========================================================
     Magnetic buttons
     ========================================================== */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ==========================================================
     Custom cursor
     ========================================================== */
  if (fine && !reduce) {
    const dot = $('#cursorDot');
    const ring = $('#cursorRing');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('cursor-on');
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();

    const hoverables = 'a, button, [data-tilt], .chips span, input';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverables)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverables)) document.body.classList.remove('cursor-hover');
    });
  }

  /* ==========================================================
     Copy to clipboard + toast
     ========================================================== */
  const toast = $('#toast');
  let toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  $$('[data-copy]').forEach(el => {
    el.addEventListener('click', async e => {
      e.preventDefault();
      e.stopPropagation();
      const value = el.dataset.copy;
      const ok = await copyText(value);
      showToast(ok ? `Copied — ${value}` : `Email: ${value}`);
    });
  });

  /* ==========================================================
     Year
     ========================================================== */
  $('#year').textContent = new Date().getFullYear();

  /* ==========================================================
     Personal agent widget
     ========================================================== */
  const fab   = $('#agentFab');
  const chips = $('#agentChips');
  const Agent = window.PersonalAgent;
  let started = false;

  /* ---------- voice: BYTE speaks its answers out loud ---------- */
  let voiceOn = true;
  const synth = window.speechSynthesis;

  function say(text) {
    if (!voiceOn || !synth) return;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(
        text.replace(/[•·↗]/g, ' ').replace(/\s+/g, ' ').slice(0, 420)
      );
      u.rate = 1.05;
      u.pitch = 1.15;
      synth.speak(u);
    } catch (err) { /* speech is a bonus, never break the page for it */ }
  }

  /* BYTE answers on screen — the reply is typed out in the bubble above the
     bot, not listed in a chat log. The bubble is the whole conversation UI. */
  const charBubble = $('#charBubble');
  let typeTimer, hideTimer;

  function stopTyping() {
    clearInterval(typeTimer);
    clearTimeout(hideTimer);
  }

  function speak(text, opts = {}) {
    if (!charBubble) return;
    stopTyping();

    const body = document.createElement('span');
    body.className = 'bub-body';
    charBubble.innerHTML = '<b>' + (opts.label || 'BYTE') + '</b>';
    charBubble.appendChild(body);
    charBubble.classList.add('show');
    charBubble.classList.toggle('wide', text.length > 180);

    document.dispatchEvent(new CustomEvent('agent:reply', { detail: { length: text.length } }));

    // typewriter, a few characters per tick so long answers still land quickly.
    // Deliberately NOT auto-scrolled to the bottom: a reader needs to start at
    // the first line, and the panel scrolls on its own if they want the rest.
    charBubble.scrollTop = 0;
    let i = 0;
    const step = text.length > 260 ? 5 : 3;
    typeTimer = setInterval(() => {
      i = Math.min(text.length, i + step);
      body.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typeTimer);
        // Long answers stay on screen. Reading 700 characters takes longer than
        // any timer I would pick, and someone with the sound off has only the
        // text — so only short replies auto-dismiss.
        if (!opts.sticky && text.length < 220) {
          hideTimer = setTimeout(() => charBubble.classList.remove('show'), 9000);
        }
      }
    }, 16);
  }

  let chipToggle = null, extraCount = 0;

  function collapseTopics() {
    if (!chips.classList.contains('expanded')) return;
    chips.classList.remove('expanded');
    if (chipToggle) chipToggle.textContent = `+ ${extraCount} more topics`;
  }

  function send(question) {
    const q = (question || '').trim();
    if (!q) return;
    collapseTopics();        // give the answer panel the room

    // show what was asked, then BYTE answers it
    if (charBubble) {
      stopTyping();
      charBubble.innerHTML = '<b>you asked</b><span class="bub-body">' + q.replace(/[<>&]/g, '') + '</span>';
      charBubble.classList.add('show', 'asking');
    }
    document.dispatchEvent(new CustomEvent('agent:thinking'));

    const answer = Agent.ask(q);
    setTimeout(() => {
      if (charBubble) charBubble.classList.remove('asking');
      speak(answer);
      say(answer);
    }, 850);
  }

  function openPanel() {
    fab.classList.add('hidden');
    document.body.classList.add('asking');   // dims the page behind the bot

    // the ask controls are mounted on the bot, so bring the bot into view
    if (stage) {
      SECTIONS.forEach(s => stage.classList.remove('at-' + s));
      stage.classList.add('at-chat', 'asking');
      document.dispatchEvent(new CustomEvent('section:change', { detail: { id: 'chat' } }));
    }

    if (!started) {
      started = true;

      const chip = (label, question, cls) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        if (cls) b.className = cls;
        b.addEventListener('click', () => send(question));
        chips.appendChild(b);
        return b;
      };

      Agent.suggestions.forEach(s => chip(s, s));

      // every knowledge-base topic must be reachable — there is no text box,
      // so the rest live behind a "more" toggle rather than being unaskable
      const extra = [];
      (Agent.moreTopics || []).forEach(s => extra.push(chip(s, s, 'extra')));

      if (extra.length) {
        extraCount = extra.length;
        chipToggle = document.createElement('button');
        chipToggle.type = 'button';
        chipToggle.className = 'chip-more';
        chipToggle.textContent = `+ ${extraCount} more topics`;
        chipToggle.addEventListener('click', () => {
          const open = chips.classList.toggle('expanded');
          chipToggle.textContent = open ? '− fewer topics' : `+ ${extraCount} more topics`;
        });
        chips.appendChild(chipToggle);
      }
    }
    setTimeout(() => {
      speak(Agent.greeting);
      say(Agent.greeting);
    }, 620);
  }

  function closePanel() {
    fab.classList.remove('hidden');
    document.body.classList.remove('asking');
    stopTyping();
    if (charBubble) charBubble.classList.remove('show', 'asking', 'wide');

    // send the bot back to whichever section is on screen
    if (stage) {
      stage.classList.remove('at-chat', 'asking');
      stage.classList.add('at-' + (current || 'hero'));
      document.dispatchEvent(new CustomEvent('section:change', { detail: { id: current || 'hero' } }));
    }
  }

  fab.addEventListener('click', openPanel);
  $('#agentClose').addEventListener('click', closePanel);
  $('#byteHit').addEventListener('click', () => {           // the bot itself is the button
    if (document.body.classList.contains('asking')) closePanel();
    else openPanel();
  });

  const scrim = $('#askScrim');
  if (scrim) scrim.addEventListener('click', closePanel);   // click outside to dismiss

  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closePanel(); closeNav(); }
  });

  /* ---------- voice toggle ---------- */
  const muteBtn = $('#byteMute');
  muteBtn.addEventListener('click', () => {
    voiceOn = !voiceOn;
    muteBtn.setAttribute('aria-pressed', String(voiceOn));
    muteBtn.classList.toggle('off', !voiceOn);
    muteBtn.querySelector('span').textContent = voiceOn ? 'voice on' : 'voice off';
    if (!voiceOn && synth) synth.cancel();
  });

  /* ---------- talk to it: browser speech recognition, no API key ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = $('#byteMic');

  if (SR && micBtn) {
    micBtn.hidden = false;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let listening = false;

    micBtn.addEventListener('click', () => {
      if (listening) { rec.stop(); return; }
      try { rec.start(); } catch (err) { /* already running */ }
    });

    rec.addEventListener('start', () => {
      listening = true;
      micBtn.classList.add('live');
      micBtn.querySelector('span').textContent = 'listening…';
      if (charBubble) {
        stopTyping();
        charBubble.innerHTML = '<b>BYTE</b><span class="bub-body">I’m listening — ask me about Farhan.</span>';
        charBubble.classList.add('show');
      }
    });

    const endListening = () => {
      listening = false;
      micBtn.classList.remove('live');
      micBtn.querySelector('span').textContent = 'talk to me';
    };
    rec.addEventListener('end', endListening);
    rec.addEventListener('error', endListening);

    rec.addEventListener('result', e => {
      const said = e.results[0] && e.results[0][0] && e.results[0][0].transcript;
      if (said) send(said);
    });
  }

  /* ---------- BYTE greets on its own, once, like a companion should ---------- */
  const hint = $('#byteHint');
  setTimeout(() => {
    if (document.body.classList.contains('asking')) return;
    speak("Hi! I'm BYTE, Farhan's assistant. Click me and I'll tell you about him.");
    if (hint) hint.classList.add('show');
  }, 4200);

})();
