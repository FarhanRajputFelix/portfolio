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

  const tick = setInterval(() => {
    const ceiling = sceneUp ? 100 : 88;
    progress = Math.min(ceiling, progress + Math.random() * 9 + 3);
    bar.style.width = progress + '%';
    pct.textContent = Math.round(progress);
    if (progress >= 100) { clearInterval(tick); retire(); }
  }, 110);

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
    }, 260);
  }

  document.addEventListener('scene:ready', () => { sceneUp = true; });
  // never trap the page if the Three.js CDN is blocked
  setTimeout(() => { sceneUp = true; }, 3000);
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
  const panel = $('#agentPanel');
  const log   = $('#agentLog');
  const form  = $('#agentForm');
  const input = $('#agentInput');
  const chips = $('#agentChips');
  const Agent = window.PersonalAgent;
  let started = false;

  function bubble(text, who) {
    const el = document.createElement('div');
    el.className = `msg ${who}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function typing() {
    const el = document.createElement('div');
    el.className = 'msg bot typing';
    el.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  /* The drone is the one answering: it speaks a short version in a bubble
     above itself and plays a talk animation, while the panel keeps the full text. */
  const charBubble = $('#charBubble');
  let bubbleTimer;

  function speak(text) {
    if (!charBubble) return;
    const short = text.length > 150 ? text.slice(0, 147).trimEnd() + '…' : text;
    charBubble.innerHTML = '<b>Farhan’s agent</b>' + short.replace(/\n+/g, ' ');
    charBubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => charBubble.classList.remove('show'),
      Math.min(9000, 3200 + short.length * 26));
    document.dispatchEvent(new CustomEvent('agent:reply', {
      detail: { length: short.length }
    }));
  }

  function send(question) {
    const q = (question || '').trim();
    if (!q) return;
    bubble(q, 'user');
    input.value = '';
    document.dispatchEvent(new CustomEvent('agent:thinking'));

    const answer = Agent.ask(q);
    const dots = typing();
    setTimeout(() => {
      dots.remove();
      bubble(answer, 'bot');
      speak(answer);
    }, Math.min(1100, 340 + answer.length * 2.2));
  }

  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    fab.classList.add('hidden');

    // park the drone beside the panel so the replies visibly come from it
    if (stage) {
      SECTIONS.forEach(s => stage.classList.remove('at-' + s));
      stage.classList.add('at-chat');
      document.dispatchEvent(new CustomEvent('section:change', { detail: { id: 'chat' } }));
    }

    if (!started) {
      started = true;
      bubble(Agent.greeting, 'bot');
      setTimeout(() => speak("Hi! Ask me anything about Farhan."), 500);
      Agent.suggestions.forEach(s => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = s;
        b.addEventListener('click', () => send(s));
        chips.appendChild(b);
      });
    }
    if (innerWidth > 760) setTimeout(() => input.focus(), 380);
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    fab.classList.remove('hidden');
    if (charBubble) charBubble.classList.remove('show');

    // send the drone back to whichever section is on screen
    if (stage) {
      stage.classList.remove('at-chat');
      stage.classList.add('at-' + (current || 'hero'));
      document.dispatchEvent(new CustomEvent('section:change', { detail: { id: current || 'hero' } }));
    }
  }

  fab.addEventListener('click', openPanel);
  $('#agentClose').addEventListener('click', closePanel);
  form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closePanel(); closeNav(); }
  });

})();
