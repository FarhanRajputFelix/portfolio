/* ==========================================================
   BYTE — Farhan's companion bot.

   Game-companion styling: chunky rounded-box body, oversized
   screen face with expressive eyes, cap with a brim, mitten
   hands, hover base. Everything is generated at runtime —
   no model, texture or image file to host.

   Quality notes
     - RoundedBoxGeometry (three addons) for the chunky toy
       silhouette; plain BoxGeometry reads cheap and sharp.
     - RoomEnvironment through PMREMGenerator gives real image
       based lighting, so the white shell shows soft gradients
       instead of flat grey.
     - ACES tone mapping + sRGB output so the emissive cyan
       screen doesn't clip to white.
     - The face is a 2D canvas repainted each frame, which is
       what lets the eyes blink, squint, and follow the cursor.

   Events from main.js: section:change / agent:thinking /
   agent:reply. It waves on approach, click and greeting.
   ========================================================== */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('char-canvas');
if (canvas) boot(canvas);

function boot(canvas) {
  const host = canvas.parentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const VIOLET = 0x7c5cff;
  const VIOLET2 = 0xa78bfa;
  const CYAN = 0x22d3ee;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const camPos = new THREE.Vector3(0, 0.05, 9.2);
  const camGoal = camPos.clone();
  camera.position.copy(camPos);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // image-based lighting: the single biggest quality win for plastic/metal
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.05).texture;

  /* ==========================================================
     Face — canvas texture, repainted every frame
     ========================================================== */
  const FW = 320, FH = 240;
  const fc = document.createElement('canvas');
  fc.width = FW; fc.height = FH;
  const fx = fc.getContext('2d');
  const faceTex = new THREE.CanvasTexture(fc);
  faceTex.colorSpace = THREE.SRGBColorSpace;
  faceTex.anisotropy = 8;

  const face = { mood: 'idle', lookX: 0, lookY: 0, blink: 0, talk: 0, t: 0 };

  function rr(x, y, w, h, r) {
    fx.beginPath();
    fx.moveTo(x + r, y);
    fx.arcTo(x + w, y, x + w, y + h, r);
    fx.arcTo(x + w, y + h, x, y + h, r);
    fx.arcTo(x, y + h, x, y, r);
    fx.arcTo(x, y, x + w, y, r);
    fx.closePath();
    fx.fill();
  }

  function drawFace() {
    const t = face.t;
    fx.clearRect(0, 0, FW, FH);

    // deep screen with a soft vignette + scanlines
    const g = fx.createRadialGradient(FW / 2, FH / 2, 20, FW / 2, FH / 2, FW * 0.75);
    g.addColorStop(0, '#0b2430');
    g.addColorStop(1, '#04101a');
    fx.fillStyle = g;
    fx.fillRect(0, 0, FW, FH);
    fx.fillStyle = 'rgba(120,240,255,.045)';
    for (let y = 0; y < FH; y += 5) fx.fillRect(0, y, FW, 2);

    const glow = face.mood === 'thinking' ? '#b79bff' : '#8ef6ff';
    fx.shadowColor = glow;
    fx.shadowBlur = 26;
    fx.fillStyle = glow;
    fx.strokeStyle = glow;

    const cx = FW / 2;
    const ey = 104 + face.lookY * 14;
    const dx = 58;
    const ox = face.lookX * 18;

    if (face.mood === 'thinking') {
      [-1, 1].forEach(s => {
        fx.beginPath();
        fx.arc(cx + s * dx + ox, ey, 13, 0, Math.PI * 2);
        fx.fill();
      });
      for (let i = 0; i < 3; i++) {
        fx.globalAlpha = 0.25 + (Math.sin(t * 6 - i * 0.9) * 0.5 + 0.5) * 0.75;
        fx.beginPath();
        fx.arc(cx - 30 + i * 30, 178, 8, 0, Math.PI * 2);
        fx.fill();
      }
      fx.globalAlpha = 1;

    } else if (face.mood === 'happy') {
      fx.lineWidth = 16;
      fx.lineCap = 'round';
      fx.lineJoin = 'round';
      [-1, 1].forEach(s => {
        fx.beginPath();
        fx.moveTo(cx + s * dx - 30 + ox, ey + 14);
        fx.lineTo(cx + s * dx + ox, ey - 20);
        fx.lineTo(cx + s * dx + 30 + ox, ey + 14);
        fx.stroke();
      });

    } else {
      const open = Math.max(0.07, 1 - face.blink);
      const h = 62 * open;
      [-1, 1].forEach(s => rr(cx + s * dx - 26 + ox, ey - h / 2, 52, h, Math.min(20, h / 2)));
      if (open > 0.55) {
        fx.globalAlpha = 0.75;
        fx.fillStyle = '#ffffff';
        [-1, 1].forEach(s => rr(cx + s * dx - 16 + ox, ey - h / 2 + 8, 14, 14, 7));
        fx.globalAlpha = 1;
        fx.fillStyle = glow;
      }
    }

    if (face.talk > 0.02) {
      const mw = 66, mh = 8 + face.talk * 30;
      rr(cx - mw / 2, 186 - mh / 2, mw, mh, mh / 2);
    } else if (face.mood === 'happy') {
      fx.lineWidth = 10;
      fx.beginPath();
      fx.arc(cx, 168, 26, 0.15 * Math.PI, 0.85 * Math.PI);
      fx.stroke();
    }

    fx.shadowBlur = 0;
    faceTex.needsUpdate = true;
  }

  /* ==========================================================
     Materials
     ========================================================== */
  const shell = new THREE.MeshPhysicalMaterial({
    color: 0xf2f3f8, roughness: 0.32, metalness: 0.05,
    clearcoat: 0.85, clearcoatRoughness: 0.22, envMapIntensity: 0.9
  });
  const shellSoft = new THREE.MeshPhysicalMaterial({
    color: 0xd7d9e6, roughness: 0.45, metalness: 0.04, clearcoat: 0.4, envMapIntensity: 0.8
  });
  const capMat = new THREE.MeshPhysicalMaterial({
    color: VIOLET, roughness: 0.34, metalness: 0.1,
    clearcoat: 0.9, clearcoatRoughness: 0.2, envMapIntensity: 1
  });
  const dark = new THREE.MeshPhysicalMaterial({
    color: 0x1b1a24, roughness: 0.38, metalness: 0.5, envMapIntensity: 0.7
  });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x2a2934, roughness: 0.9, metalness: 0.03 });
  const screenMat = new THREE.MeshBasicMaterial({ map: faceTex, toneMapped: false });

  const emis = (c, i) => new THREE.MeshStandardMaterial({
    color: c, emissive: c, emissiveIntensity: i, roughness: 0.35, metalness: 0.1
  });
  const trimMat = emis(VIOLET2, 2.2);
  const cyanMat = emis(CYAN, 2.4);
  const glowMat = new THREE.MeshBasicMaterial({
    color: VIOLET, transparent: true, opacity: 0.28,
    blending: THREE.AdditiveBlending, depthWrite: false
  });

  /* ---------------- Lights on top of the environment ---------------- */
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2.6, 3.6, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(VIOLET2, 2.4);
  rim.position.set(-4, 1.6, -3);
  scene.add(rim);

  const faceLight = new THREE.PointLight(CYAN, 6, 8);
  faceLight.position.set(0, 0.6, 2);
  scene.add(faceLight);

  /* ==========================================================
     Rig
     ========================================================== */
  const root = new THREE.Group();
  scene.add(root);

  /* ---------------- Head ---------------- */
  const head = new THREE.Group();
  head.position.y = 0.78;
  root.add(head);

  const skull = new THREE.Mesh(new RoundedBoxGeometry(2.16, 1.74, 1.42, 8, 0.42), shell);
  head.add(skull);

  // recessed screen: dark frame, then the glowing face just in front of it
  const frame = new THREE.Mesh(new RoundedBoxGeometry(1.78, 1.32, 0.16, 6, 0.2), dark);
  frame.position.z = 0.66;
  head.add(frame);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1.18), screenMat);
  screen.position.z = 0.755;
  head.add(screen);

  // cap + brim
  const cap = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.54, 1.46, 6, 0.26), capMat);
  cap.position.y = 0.92;
  head.add(cap);

  const brim = new THREE.Mesh(new RoundedBoxGeometry(2.12, 0.14, 0.62, 5, 0.07), capMat);
  brim.position.set(0, 0.74, 0.78);
  brim.rotation.x = -0.16;
  head.add(brim);

  const capBadge = new THREE.Mesh(new THREE.CircleGeometry(0.13, 26), cyanMat);
  capBadge.position.set(0, 0.94, 0.735);
  head.add(capBadge);

  // ear pods
  [-1, 1].forEach(side => {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 26), shellSoft);
    pod.position.set(side * 1.14, -0.06, 0);
    pod.rotation.z = Math.PI / 2;
    head.add(pod);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 10, 30), cyanMat);
    ring.position.set(side * 1.26, -0.06, 0);
    ring.rotation.y = Math.PI / 2;
    head.add(ring);
  });

  // antenna
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.5, 12), dark);
  stalk.position.set(0.5, 1.34, -0.16);
  stalk.rotation.z = -0.2;
  head.add(stalk);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 20), cyanMat);
  tip.position.set(0.6, 1.58, -0.16);
  head.add(tip);

  /* ---------------- Body ---------------- */
  const body = new THREE.Group();
  body.position.y = -0.86;
  root.add(body);

  const torso = new THREE.Mesh(new RoundedBoxGeometry(1.54, 1.24, 1.06, 7, 0.34), shell);
  body.add(torso);

  const collar = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.2, 0.9, 5, 0.09), capMat);
  collar.position.y = 0.6;
  body.add(collar);

  const chest = new THREE.Mesh(new THREE.CircleGeometry(0.22, 30), trimMat);
  chest.position.set(0, 0.06, 0.545);
  body.add(chest);

  const chestRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 10, 34), dark);
  chestRing.position.set(0, 0.06, 0.53);
  body.add(chestRing);

  const pack = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.86, 0.36, 5, 0.16), capMat);
  pack.position.set(0, 0.06, -0.62);
  body.add(pack);

  /* ---------------- Arms ---------------- */
  function makeArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.86, 0.3, 0.02);
    shoulder.rotation.z = side * 0.22;

    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24), shellSoft);
    shoulder.add(pad);

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.34, 8, 20), rubber);
    upper.position.y = -0.32;
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.y = -0.6;
    shoulder.add(elbow);

    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.28, 8, 20), shell);
    fore.position.y = -0.24;
    elbow.add(fore);

    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.04, 10, 24), capMat);
    cuff.position.y = -0.42;
    cuff.rotation.x = Math.PI / 2;
    elbow.add(cuff);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 24), shell);
    hand.position.y = -0.58;
    hand.scale.set(1, 1.08, 0.9);
    elbow.add(hand);

    body.add(shoulder);
    return { shoulder, elbow };
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);

  /* ---------------- Hover base ---------------- */
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.66, 0.34, 30, 1, true), dark);
  skirt.position.y = -0.78;
  body.add(skirt);

  const jetRing = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 10, 40), trimMat);
  jetRing.position.y = -0.95;
  jetRing.rotation.x = Math.PI / 2;
  body.add(jetRing);

  const jet = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.5, 24), glowMat);
  jet.position.y = -1.3;
  jet.rotation.x = Math.PI;
  body.add(jet);

  // soft contact shadow so it reads as hovering over something
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.5;
  root.add(shadow);

  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.02, 8, 90), trimMat);
  halo.position.y = -2.42;
  halo.rotation.x = Math.PI / 2;
  root.add(halo);

  /* ---------------- Orbiting bits ---------------- */
  const shards = [];
  for (let i = 0; i < 4; i++) {
    const sh = new THREE.Mesh(new THREE.OctahedronGeometry(0.07 + Math.random() * 0.03),
      i % 2 ? cyanMat : trimMat);
    sh.userData = {
      radius: 2.0 + Math.random() * 0.5,
      speed: 0.4 + Math.random() * 0.45,
      offset: Math.random() * Math.PI * 2,
      yAmp: 0.5 + Math.random() * 0.6
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

  let excite = 0, waveT = -1, happy = 0, talk = 0, think = 0;
  const kick = (a = 1) => { excite = Math.min(1.6, excite + a); };
  const happyFor = s => { happy = Math.max(happy, s); };
  const wave = () => { if (waveT < 0) { waveT = 0; happyFor(2.6); } };

  let near = false;
  addEventListener('mousemove', e => {
    const r = host.getBoundingClientRect();
    if (!r.width) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const inside = Math.hypot(e.clientX - cx, e.clientY - cy) < r.width * 0.5;
    if (inside && !near) wave();
    near = inside;
    if (inside) kick(0.02);
  }, { passive: true });

  addEventListener('click', e => {
    const r = host.getBoundingClientRect();
    if (!r.width) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < r.width * 0.45) wave();
  }, { passive: true });

  /* ==========================================================
     Section poses
     ========================================================== */
  const POSES = {
    hero:     { cam: [0, 0.05, 9.2],    rot: [0, 0, 0],           scale: 1.0 },
    about:    { cam: [1.6, 0.2, 8.6],   rot: [0.04, -0.5, -0.04], scale: 0.95 },
    doing:    { cam: [-1.7, 0.25, 8.6], rot: [0.05, 0.55, 0.04],  scale: 0.95 },
    projects: { cam: [0.3, -1.0, 8.0],  rot: [0.24, -0.18, 0],    scale: 0.9 },
    certs:    { cam: [1.3, 1.1, 7.8],   rot: [-0.18, -0.4, 0.05], scale: 0.88 },
    journey:  { cam: [-2.0, 0.05, 9.0], rot: [0.02, 0.8, 0.03],   scale: 0.92 },
    contact:  { cam: [0, 0.15, 8.2],    rot: [0, 0, 0],           scale: 1.05 },
    chat:     { cam: [0, 0.15, 8.0],    rot: [0, 0, 0],           scale: 1.0 }
  };

  const rotGoal = new THREE.Euler(0, 0, 0);
  let scaleGoal = 1, scaleNow = 1;

  function setSection(id) {
    const p = POSES[id] || POSES.hero;
    camGoal.set(...p.cam);
    rotGoal.set(...p.rot);
    scaleGoal = p.scale;
    kick(1.2);
    if (id === 'chat') wave();
  }

  document.addEventListener('section:change', e => setSection(e.detail && e.detail.id));
  setSection(document.body.dataset.section || 'hero');

  document.addEventListener('agent:thinking', () => { think = 1.2; talk = 0; kick(0.6); });
  document.addEventListener('agent:reply', e => {
    const len = (e.detail && e.detail.length) || 60;
    talk = Math.min(7, 1.8 + len * 0.024);
    think = 0;
    kick(1);
    happyFor(1.2);
  });

  /* ---------------- Resize ---------------- */
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
     Loop — lerp rates kept high so moves feel snappy, not floaty
     ========================================================== */
  const clock = new THREE.Clock();
  let running = true, prevT = 0, blinkAt = 2.4, blinkT = -1;

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { prevT = clock.getElapsedTime(); loop(); }
  });

  /* Same INP fix as the background scene: cap rendering to 30fps so a tap is
     not stuck behind a frame. Additionally, on phones BYTE is set to opacity 0
     outside the hero and chat sections — there is no reason to render a robot
     nobody can see, so those frames are skipped entirely. */
  const FRAME_MS = 1000 / 30;
  let lastFrame = 0;
  const stageEl = document.getElementById('charStage');

  function loop(ts = 0) {
    if (!running) return;
    requestAnimationFrame(loop);

    if (ts - lastFrame < FRAME_MS) return;
    lastFrame = ts;

    // Invisible on this viewport? Skip the draw, keep the loop alive.
    if (stageEl && getComputedStyle(stageEl).opacity === '0') return;

    const t = clock.getElapsedTime();
    const dt = Math.min(0.05, t - prevT);
    prevT = t;
    const now = performance.now();

    excite *= 0.955;
    if (talk > 0) talk -= dt;
    if (think > 0) think -= dt;
    if (happy > 0) happy -= dt;

    if (now - lastMove > 2600) {
      if (t > nextGaze) {
        idleGaze.x = (Math.random() - 0.5) * 1.5;
        idleGaze.y = (Math.random() - 0.5) * 0.8;
        nextGaze = t + 1.5 + Math.random() * 2.2;
      }
      smooth.x += (idleGaze.x - smooth.x) * 0.03;
      smooth.y += (idleGaze.y - smooth.y) * 0.03;
    } else {
      smooth.x += (target.x - smooth.x) * 0.13;
      smooth.y += (target.y - smooth.y) * 0.13;
    }

    /* face */
    face.t = t;
    face.lookX = smooth.x;
    face.lookY = -smooth.y * 0.6;
    face.mood = think > 0 ? 'thinking' : happy > 0 ? 'happy' : 'idle';
    face.talk = talk > 0 ? (0.35 + Math.abs(Math.sin(t * 13)) * 0.65) : 0;

    if (blinkT < 0 && t > blinkAt && face.mood === 'idle') blinkT = 0;
    if (blinkT >= 0) {
      blinkT += dt * 7.5;
      face.blink = blinkT < 0.5 ? blinkT * 2 : (1 - blinkT) * 2;
      if (blinkT >= 1) { blinkT = -1; face.blink = 0; blinkAt = t + 2.2 + Math.random() * 3.2; }
    }
    drawFace();

    if (!reduce) {
      const nod = talk > 0 ? Math.sin(t * 11) * 0.03 : 0;

      root.position.y = Math.sin(t * 1.3) * 0.1 + excite * 0.08 + nod;

      const travelX = camGoal.x - camPos.x;
      root.rotation.z = rotGoal.z + Math.sin(t * 0.9) * 0.02 - travelX * 0.12;
      root.rotation.y += ((rotGoal.y + smooth.x * 0.3) - root.rotation.y) * 0.11;
      root.rotation.x += ((rotGoal.x + nod * 1.4) - root.rotation.x) * 0.11;

      head.rotation.y = smooth.x * 0.34;
      head.rotation.x = -smooth.y * 0.2 + nod;
      head.rotation.z = smooth.x * -0.07;

      scaleNow += (scaleGoal - scaleNow) * 0.12;
      root.scale.setScalar(scaleNow * (1 + Math.sin(t * 1.8) * 0.007 + excite * 0.03));

      armL.shoulder.rotation.x = Math.sin(t * 1.3) * 0.13;
      armL.elbow.rotation.x = -0.32 + Math.sin(t * 1.3 + 0.6) * 0.09;

      if (waveT >= 0) {
        waveT += dt * 0.75;
        const p = Math.min(1, waveT);
        const raise = Math.sin(p * Math.PI);
        armR.shoulder.rotation.z = 0.22 - raise * 2.5;
        armR.shoulder.rotation.x = -raise * 0.32;
        armR.elbow.rotation.z = raise * Math.sin(waveT * 26) * 0.75;
        if (p >= 1) {
          waveT = -1;
          armR.shoulder.rotation.set(0, 0, 0.22);
          armR.elbow.rotation.set(0, 0, 0);
        }
      } else {
        armR.shoulder.rotation.x = Math.sin(t * 1.3 + Math.PI) * 0.13;
        armR.elbow.rotation.x = -0.32 + Math.sin(t * 1.3 + Math.PI + 0.6) * 0.09;
      }

      halo.rotation.z += 0.012 + excite * 0.05;
      halo.scale.setScalar(1 + Math.sin(t * 2.1) * 0.04 + excite * 0.1);
      shadow.scale.setScalar(1 - root.position.y * 0.08);
      shadow.material.opacity = 0.3 - root.position.y * 0.05;

      jet.scale.set(1, 0.8 + Math.random() * 0.3 + excite * 0.5, 1);
      jet.material.opacity = 0.16 + Math.random() * 0.08 + excite * 0.18;

      shards.forEach(s => {
        const d = s.userData;
        const a = t * d.speed + d.offset;
        const r = d.radius + excite * 0.5;
        s.position.set(Math.cos(a) * r, Math.sin(a * 0.9) * d.yAmp + 0.2, Math.sin(a) * r * 0.5);
        s.rotation.x += 0.025;
        s.rotation.y += 0.02;
      });

      const rate = think > 0 ? 9 : talk > 0 ? 6.5 : 2.4;
      trimMat.emissiveIntensity = 1.8 + Math.sin(t * rate) * 0.5 + excite * 1.4;
      cyanMat.emissiveIntensity = 1.9 + Math.sin(t * rate + 1) * 0.5 + excite;
      tip.scale.setScalar(1 + Math.sin(t * 4.2) * 0.14 + excite * 0.3);
      faceLight.intensity = 5 + Math.sin(t * rate) * 1.4 + excite * 6;
    }

    camPos.lerp(camGoal, 0.11);          // was 0.045 — the moves felt sluggish
    camera.position.copy(camPos);
    camera.lookAt(0, -0.15, 0);

    renderer.render(scene, camera);
  }

  loop();
  setTimeout(wave, 1400);
  document.dispatchEvent(new CustomEvent('character:ready'));
}
