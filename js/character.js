/* ==========================================================
   BYTE — Farhan's companion bot.

   A screen-faced robot assistant in the style of game companion
   bots: chunky helmet, glowing display face, stubby arms, hover
   base. Built entirely from Three.js primitives plus a live
   CanvasTexture for the face, so there is no model or image file
   to host — it all ships in this one file.

   The face is a 2D canvas redrawn every frame. That is what makes
   it expressive: eyes can blink, squint into ^^ when happy, shrink
   to dots while thinking, and a mouth bar animates while talking.
   Geometry alone could never do that cheaply.

   Public behaviour, driven by events from main.js:
     section:change  -> flies to a new pose, banks into the turn
     agent:thinking  -> thinking face, ring spins up
     agent:reply     -> talking face + nodding for the reply length
     (hover / click) -> waves
   ========================================================== */

import * as THREE from 'three';

const canvas = document.getElementById('char-canvas');
if (canvas) boot(canvas);

function boot(canvas) {
  const host = canvas.parentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ACCENT = 0x8b5cf6;
  const ACCENT2 = 0xa78bfa;
  const CYAN = 0x22d3ee;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const camPos = new THREE.Vector3(0, 0.1, 8.6);
  const camGoal = camPos.clone();
  camera.position.copy(camPos);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  /* ==========================================================
     Face — a canvas texture we repaint every frame
     ========================================================== */
  const FACE_W = 256, FACE_H = 200;
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = FACE_W;
  faceCanvas.height = FACE_H;
  const fx = faceCanvas.getContext('2d');
  const faceTex = new THREE.CanvasTexture(faceCanvas);
  faceTex.anisotropy = 4;

  const face = {
    mood: 'idle',      // idle | happy | thinking | talking | surprised
    lookX: 0, lookY: 0,
    blink: 0,          // 0 open .. 1 shut
    talk: 0,           // mouth openness
    t: 0
  };

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
    c.fill();
  }

  function drawFace() {
    const t = face.t;
    fx.clearRect(0, 0, FACE_W, FACE_H);

    // screen background + scanlines
    fx.fillStyle = '#06121a';
    fx.fillRect(0, 0, FACE_W, FACE_H);
    fx.fillStyle = 'rgba(34,211,238,.05)';
    for (let y = 0; y < FACE_H; y += 4) fx.fillRect(0, y, FACE_W, 2);

    const glow = face.mood === 'thinking' ? '#a78bfa' : '#7ff3ff';
    fx.shadowColor = glow;
    fx.shadowBlur = 22;
    fx.fillStyle = glow;

    const cx = FACE_W / 2;
    const eyeY = 84 + face.lookY * 12;
    const dx = 46;
    const ox = face.lookX * 14;

    if (face.mood === 'thinking') {
      // small dots + a travelling loading dot underneath
      [-1, 1].forEach(s => {
        fx.beginPath();
        fx.arc(cx + s * dx + ox, eyeY, 11, 0, Math.PI * 2);
        fx.fill();
      });
      for (let i = 0; i < 3; i++) {
        const a = Math.sin(t * 6 - i * 0.9) * 0.5 + 0.5;
        fx.globalAlpha = 0.25 + a * 0.75;
        fx.beginPath();
        fx.arc(cx - 26 + i * 26, 146, 7, 0, Math.PI * 2);
        fx.fill();
      }
      fx.globalAlpha = 1;

    } else if (face.mood === 'happy') {
      // ^ ^ arcs
      fx.strokeStyle = glow;
      fx.lineWidth = 13;
      fx.lineCap = 'round';
      [-1, 1].forEach(s => {
        fx.beginPath();
        fx.moveTo(cx + s * dx - 24 + ox, eyeY + 12);
        fx.lineTo(cx + s * dx + ox, eyeY - 16);
        fx.lineTo(cx + s * dx + 24 + ox, eyeY + 12);
        fx.stroke();
      });

    } else {
      // rounded rectangular eyes, squashed by blink
      const open = Math.max(0.08, 1 - face.blink);
      const h = 46 * open;
      [-1, 1].forEach(s => {
        roundRect(fx, cx + s * dx - 20 + ox, eyeY - h / 2, 40, h, Math.min(14, h / 2));
      });
      // highlight
      fx.globalAlpha = 0.55;
      fx.fillStyle = '#ffffff';
      [-1, 1].forEach(s => {
        if (open > 0.5) roundRect(fx, cx + s * dx - 12 + ox, eyeY - h / 2 + 6, 11, 11, 5);
      });
      fx.globalAlpha = 1;
      fx.fillStyle = glow;
    }

    // mouth bar: only while talking
    if (face.talk > 0.02) {
      const mw = 54, mh = 6 + face.talk * 26;
      roundRect(fx, cx - mw / 2, 150 - mh / 2, mw, mh, mh / 2);
    } else if (face.mood === 'happy') {
      fx.strokeStyle = glow;
      fx.lineWidth = 8;
      fx.beginPath();
      fx.arc(cx, 138, 22, 0.15 * Math.PI, 0.85 * Math.PI);
      fx.stroke();
    }

    fx.shadowBlur = 0;
    faceTex.needsUpdate = true;
  }

  /* ==========================================================
     Materials
     ========================================================== */
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xe8e9f2, roughness: 0.42, metalness: 0.18 });
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0x7c5cff, roughness: 0.46, metalness: 0.2 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x23222e, roughness: 0.5, metalness: 0.3 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x2c2b38, roughness: 0.85, metalness: 0.05 });
  const screenMat = new THREE.MeshBasicMaterial({ map: faceTex, toneMapped: false });

  const emissive = (c, i) => new THREE.MeshStandardMaterial({
    color: c, emissive: c, emissiveIntensity: i, roughness: 0.3, metalness: 0.2
  });
  const trimMat = emissive(ACCENT, 2.0);
  const cyanMat = emissive(CYAN, 2.2);
  const glowMat = new THREE.MeshBasicMaterial({
    color: ACCENT, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false
  });

  /* ==========================================================
     Lights
     ========================================================== */
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));

  const key = new THREE.DirectionalLight(0xffffff, 1.85);
  key.position.set(2.4, 3.4, 4.6);
  scene.add(key);

  const rim = new THREE.DirectionalLight(ACCENT2, 2.1);
  rim.position.set(-3.6, 1.4, -2.4);
  scene.add(rim);

  const faceLight = new THREE.PointLight(CYAN, 7, 8);
  faceLight.position.set(0, 0.55, 1.9);
  scene.add(faceLight);

  /* ==========================================================
     Rig
     ========================================================== */
  const root = new THREE.Group();
  scene.add(root);

  /* ---- head ---- */
  const head = new THREE.Group();
  head.position.y = 0.62;
  root.add(head);

  // helmet shell: a squarish capsule-ish box built from a scaled sphere so the
  // silhouette stays soft without needing a rounded-box geometry
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), shellMat);
  helmet.scale.set(1.02, 0.92, 0.86);
  head.add(helmet);

  // hood / back cowl in the accent colour
  // BACK of the head is phi = 3*PI/2 (phi = PI/2 faces the camera)
  const BACK = Math.PI * 1.5;
  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(1.06, 48, 40, BACK - Math.PI * 0.62, Math.PI * 1.24, 0, Math.PI * 0.8),
    hoodMat
  );
  hood.scale.set(1.02, 0.95, 0.9);
  head.add(hood);

  // brim over the screen
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.07, 10, 40, Math.PI), hoodMat);
  brim.position.set(0, 0.5, 0.2);
  brim.rotation.set(-1.15, 0, 0);
  head.add(brim);

  // dark backing plate, then the screen just in front of it — both must clear
  // the shell surface (z = 0.86 after scaling) or the face renders inside the head
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 1.12), darkMat);
  plate.position.set(0, 0.02, 0.885);
  head.add(plate);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), screenMat);
  screen.position.set(0, 0.02, 0.9);
  head.add(screen);

  // ear pods
  [-1, 1].forEach(side => {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 22), darkMat);
    pod.position.set(side * 1.0, 0, 0);
    pod.rotation.z = Math.PI / 2;
    head.add(pod);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.028, 8, 26), cyanMat);
    ring.position.set(side * 1.08, 0, 0);
    ring.rotation.y = Math.PI / 2;
    head.add(ring);
  });

  // antenna with a blinking tip
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.44, 12), darkMat);
  stalk.position.set(0.34, 0.98, -0.1);
  stalk.rotation.z = -0.24;
  head.add(stalk);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 18), cyanMat);
  tip.position.set(0.44, 1.19, -0.1);
  head.add(tip);

  /* ---- body ---- */
  const body = new THREE.Group();
  body.position.y = -0.92;
  root.add(body);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 0.42, 12, 28), shellMat);
  torso.scale.set(1, 1, 0.86);
  body.add(torso);

  const chest = new THREE.Mesh(new THREE.CircleGeometry(0.2, 28), trimMat);
  chest.position.set(0, 0.08, 0.53);
  body.add(chest);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.06, 10, 40), hoodMat);
  belt.position.y = -0.3;
  belt.rotation.x = Math.PI / 2;
  belt.scale.set(1, 1, 0.86);
  body.add(belt);

  // backpack thruster
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.24), darkMat);
  pack.position.set(0, 0.02, -0.56);
  body.add(pack);

  /* ---- arms: shoulder + elbow so a wave really articulates ---- */
  function makeArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.72, 0.16, 0.08);
    shoulder.rotation.z = side * 0.28;

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.3, 8, 18), rubberMat);
    upper.position.y = -0.24;
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.y = -0.48;
    shoulder.add(elbow);

    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.26, 8, 18), shellMat);
    fore.position.y = -0.22;
    elbow.add(fore);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), shellMat);
    hand.position.y = -0.44;
    elbow.add(hand);

    body.add(shoulder);
    return { shoulder, elbow, side };
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);

  /* ---- hover base instead of legs ---- */
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.36, 26, 1, true), darkMat);
  skirt.position.y = -0.62;
  body.add(skirt);

  const jet = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.36, 20), glowMat);
  jet.position.y = -0.94;
  jet.rotation.x = Math.PI;
  body.add(jet);

  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.022, 8, 80), trimMat);
  halo.position.y = -1.34;
  halo.rotation.x = Math.PI / 2;
  root.add(halo);

  /* ---- orbiting bits ---- */
  const shards = [];
  for (let i = 0; i < 4; i++) {
    const sh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.06 + Math.random() * 0.03),
      i % 2 ? cyanMat : trimMat
    );
    sh.userData = {
      radius: 1.7 + Math.random() * 0.4,
      speed: 0.34 + Math.random() * 0.4,
      offset: Math.random() * Math.PI * 2,
      yAmp: 0.4 + Math.random() * 0.5
    };
    root.add(sh);
    shards.push(sh);
  }

  /* ==========================================================
     Input + state
     ========================================================== */
  const target = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };
  let lastMove = 0, idleGaze = { x: 0, y: 0 }, nextGaze = 0;

  function point(x, y) {
    target.x = (x / innerWidth) * 2 - 1;
    target.y = -((y / innerHeight) * 2 - 1);
    lastMove = performance.now();
  }
  addEventListener('mousemove', e => point(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => {
    if (e.touches.length) point(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  let excite = 0;
  const kick = (a = 1) => { excite = Math.min(1.6, excite + a); };

  let waveT = -1;
  const wave = () => { if (waveT < 0) { waveT = 0; happyFor(2.4); } };

  let happy = 0, talk = 0, think = 0;
  const happyFor = s => { happy = Math.max(happy, s); };

  // proximity poke — the stage is pointer-events:none, so nothing is blocked
  let near = false;
  addEventListener('mousemove', e => {
    const r = host.getBoundingClientRect();
    if (!r.width) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const inside = Math.hypot(e.clientX - cx, e.clientY - cy) < r.width * 0.55;
    if (inside && !near) wave();          // waves when you first come close
    near = inside;
    if (inside) kick(0.02);
  }, { passive: true });

  addEventListener('click', e => {
    const r = host.getBoundingClientRect();
    if (!r.width) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < r.width * 0.5) wave();
  }, { passive: true });

  /* ==========================================================
     Poses per section
     ========================================================== */
  const POSES = {
    hero:     { cam: [0, 0.15, 8.6],   rot: [0, 0, 0],            scale: 1.0 },
    about:    { cam: [1.5, 0.3, 8.0],  rot: [0.04, -0.5, -0.04],  scale: 0.95 },
    doing:    { cam: [-1.6, 0.35, 8.0], rot: [0.05, 0.55, 0.04],  scale: 0.95 },
    projects: { cam: [0.3, -0.9, 7.4], rot: [0.24, -0.18, 0],     scale: 0.9 },
    certs:    { cam: [1.2, 1.0, 7.2],  rot: [-0.18, -0.4, 0.05],  scale: 0.88 },
    journey:  { cam: [-1.9, 0.1, 8.4], rot: [0.02, 0.8, 0.03],    scale: 0.92 },
    contact:  { cam: [0, 0.2, 7.6],    rot: [0, 0, 0],            scale: 1.05 },
    chat:     { cam: [0, 0.25, 7.2],   rot: [0, 0, 0],            scale: 1.0 }
  };

  const rotGoal = new THREE.Euler(0, 0, 0);
  let scaleGoal = 1, scaleNow = 1;

  function setSection(id) {
    const p = POSES[id] || POSES.hero;
    camGoal.set(...p.cam);
    rotGoal.set(...p.rot);
    scaleGoal = p.scale;
    kick(1.1);
    if (id === 'chat') { wave(); }
  }

  document.addEventListener('section:change', e => setSection(e.detail && e.detail.id));
  setSection(document.body.dataset.section || 'hero');

  document.addEventListener('agent:thinking', () => { think = 1.4; talk = 0; kick(0.5); });
  document.addEventListener('agent:reply', e => {
    const len = (e.detail && e.detail.length) || 60;
    talk = Math.min(7, 1.8 + len * 0.024);
    think = 0;
    kick(0.9);
    happyFor(1.2);
  });

  /* ==========================================================
     Resize
     ========================================================== */
  function resize() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(resize).observe(host);

  /* ==========================================================
     Loop
     ========================================================== */
  const clock = new THREE.Clock();
  let running = true, prevT = 0, blinkAt = 2.5, blinkT = -1;

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { prevT = clock.getElapsedTime(); loop(); }
  });

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);

    const t = clock.getElapsedTime();
    const dt = Math.min(0.05, t - prevT);
    prevT = t;
    const now = performance.now();

    excite *= 0.965;
    if (talk > 0) talk -= dt;
    if (think > 0) think -= dt;
    if (happy > 0) happy -= dt;

    // gaze: follows the cursor, wanders on its own when the pointer rests
    if (now - lastMove > 2600) {
      if (t > nextGaze) {
        idleGaze.x = (Math.random() - 0.5) * 1.5;
        idleGaze.y = (Math.random() - 0.5) * 0.8;
        nextGaze = t + 1.6 + Math.random() * 2.4;
      }
      smooth.x += (idleGaze.x - smooth.x) * 0.022;
      smooth.y += (idleGaze.y - smooth.y) * 0.022;
    } else {
      smooth.x += (target.x - smooth.x) * 0.06;
      smooth.y += (target.y - smooth.y) * 0.06;
    }

    /* ---- face ---- */
    face.t = t;
    face.lookX = smooth.x;
    face.lookY = -smooth.y * 0.6;
    face.mood = think > 0 ? 'thinking' : happy > 0 ? 'happy' : 'idle';
    face.talk = talk > 0 ? (0.35 + Math.abs(Math.sin(t * 13)) * 0.65) : 0;

    if (blinkT < 0 && t > blinkAt && face.mood === 'idle') blinkT = 0;
    if (blinkT >= 0) {
      blinkT += dt * 7;
      face.blink = blinkT < 0.5 ? blinkT * 2 : (1 - blinkT) * 2;
      if (blinkT >= 1) { blinkT = -1; face.blink = 0; blinkAt = t + 2.4 + Math.random() * 3.4; }
    }
    drawFace();

    if (!reduce) {
      const nod = talk > 0 ? Math.sin(t * 11) * 0.03 : 0;

      // hover
      root.position.y = Math.sin(t * 1.2) * 0.1 + excite * 0.08 + nod;

      // bank into the direction of travel while flying to a new section
      const travelX = camGoal.x - camPos.x;
      root.rotation.z = rotGoal.z + Math.sin(t * 0.8) * 0.02 - travelX * 0.1;
      root.rotation.y += ((rotGoal.y + smooth.x * 0.3) - root.rotation.y) * 0.05;
      root.rotation.x += ((rotGoal.x + nod * 1.4) - root.rotation.x) * 0.05;

      // head leads the body
      head.rotation.y = smooth.x * 0.32;
      head.rotation.x = -smooth.y * 0.2 + nod;
      head.rotation.z = smooth.x * -0.06;

      scaleNow += (scaleGoal - scaleNow) * 0.06;
      root.scale.setScalar(scaleNow * (1 + Math.sin(t * 1.7) * 0.008 + excite * 0.03));

      // arms
      armL.shoulder.rotation.x = Math.sin(t * 1.2) * 0.12;
      armL.elbow.rotation.x = -0.3 + Math.sin(t * 1.2 + 0.6) * 0.08;

      if (waveT >= 0) {
        waveT += dt * 0.62;
        const p = Math.min(1, waveT);
        const raise = Math.sin(p * Math.PI);                 // up, then down
        armR.shoulder.rotation.z = 0.28 - raise * 2.5;
        armR.shoulder.rotation.x = -raise * 0.3;
        armR.elbow.rotation.z = raise * Math.sin(waveT * 26) * 0.7;
        if (p >= 1) {
          waveT = -1;
          armR.shoulder.rotation.set(0, 0, 0.28);
          armR.elbow.rotation.set(0, 0, 0);
        }
      } else {
        armR.shoulder.rotation.x = Math.sin(t * 1.2 + Math.PI) * 0.12;
        armR.elbow.rotation.x = -0.3 + Math.sin(t * 1.2 + Math.PI + 0.6) * 0.08;
      }

      // hover ring + thruster
      halo.rotation.z += (0.01 + excite * 0.04);
      halo.scale.setScalar(1 + Math.sin(t * 2) * 0.04 + excite * 0.1);
      jet.scale.set(1, 0.8 + Math.random() * 0.35 + excite * 0.5, 1);
      jet.material.opacity = 0.14 + Math.random() * 0.08 + excite * 0.16;

      // orbiting bits
      shards.forEach(s => {
        const d = s.userData;
        const a = t * d.speed + d.offset;
        const r = d.radius + excite * 0.5;
        s.position.set(Math.cos(a) * r, Math.sin(a * 0.9) * d.yAmp, Math.sin(a) * r * 0.5);
        s.rotation.x += 0.02;
        s.rotation.y += 0.015;
      });

      // emissives breathe; faster while thinking or talking
      const rate = think > 0 ? 9 : talk > 0 ? 6.5 : 2.4;
      trimMat.emissiveIntensity = 1.6 + Math.sin(t * rate) * 0.5 + excite * 1.4;
      cyanMat.emissiveIntensity = 1.7 + Math.sin(t * rate + 1) * 0.5 + excite;
      tip.scale.setScalar(1 + Math.sin(t * 4) * 0.14 + excite * 0.3);
      faceLight.intensity = 5.5 + Math.sin(t * rate) * 1.6 + excite * 6;
    }

    camPos.lerp(camGoal, 0.045);
    camera.position.copy(camPos);
    camera.lookAt(0, -0.1, 0);

    renderer.render(scene, camera);
  }

  loop();
  setTimeout(wave, 1600);        // greets once on arrival
  document.dispatchEvent(new CustomEvent('character:ready'));
}
