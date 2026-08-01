/* ==========================================================
   Hero companion — a sci-fi AI drone built entirely from
   Three.js primitives (no model file to load or host).

   Rig
     root
      └ core      shell + glass visor + glowing eye band + antenna
      └ gyros     halo ring plus a counter-spinning equator ring
      └ pods      two shoulder fins that trail the cursor
      └ shards    five micro octahedra orbiting on their own tracks
      └ jets      three thruster nozzles with flickering flames

   Life
     idle bob, breathing pulse on every emissive part, eye scan +
     blink, organic look-around when the pointer goes quiet,
     spin-up "excite" burst, and per-section camera + pose moves
     driven by the `section:change` event from main.js.
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
  const camPos = new THREE.Vector3(0, 0.1, 8.4);
  const camGoal = camPos.clone();
  camera.position.copy(camPos);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  /* ---------------- Materials ---------------- */
  // NOTE: keep metalness low. A metal surface shows its reflections, and this
  // scene has no environment map, so high metalness renders as a black blob.
  const metal = new THREE.MeshStandardMaterial({ color: 0x32323f, roughness: 0.44, metalness: 0.3 });
  const metalDark = new THREE.MeshStandardMaterial({ color: 0x1f1f29, roughness: 0.55, metalness: 0.25 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x14142033, roughness: 0.14, metalness: 0.35,
    transparent: true, opacity: 0.5
  });

  const emissive = (color, intensity = 1.6) => new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: intensity, roughness: 0.3, metalness: 0.2
  });
  const eyeMat = emissive(ACCENT2, 3.4);
  const trimMat = emissive(ACCENT, 2.2);
  const cyanMat = emissive(CYAN, 2.4);
  const haloMat = new THREE.MeshBasicMaterial({
    color: ACCENT2, transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: ACCENT, transparent: true, opacity: 0.32,
    blending: THREE.AdditiveBlending, depthWrite: false
  });

  /* ---------------- Lights ---------------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.62));

  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(2.4, 3.2, 4.4);
  scene.add(key);

  const front = new THREE.DirectionalLight(0xffffff, 0.75);   // lifts the face
  front.position.set(0.4, 0.6, 6);
  scene.add(front);

  const rim = new THREE.DirectionalLight(ACCENT2, 2.3);
  rim.position.set(-3.6, 1.2, -2.6);
  scene.add(rim);

  const eyeLight = new THREE.PointLight(ACCENT2, 9, 9);
  eyeLight.position.set(0, 0.05, 1.6);
  scene.add(eyeLight);

  /* ---------------- Rig ---------------- */
  const root = new THREE.Group();
  scene.add(root);

  /* ---- head ---- */
  const core = new THREE.Group();
  root.add(core);

  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), metal);
  shell.scale.set(1.04, 0.96, 1);
  core.add(shell);

  // dark glass visor: a curved patch that hugs the shell instead of a
  // floating plate, so nothing pokes through the silhouette
  const FRONT = Math.PI / 2;            // phi that faces the camera (+Z)
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(1.015, 64, 48, FRONT - 0.72, 1.44, 1.02, 0.78),
    glass
  );
  visor.scale.set(1.04, 0.96, 1);
  core.add(visor);

  // glowing eye band, also a curved patch — sits just under the glass
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(1.03, 64, 40, FRONT - 0.56, 1.12, 1.34, 0.17),
    eyeMat
  );
  eye.scale.set(1.04, 0.96, 1);
  core.add(eye);

  // brighter pupil that slides along the band
  const eyeCore = new THREE.Mesh(
    new THREE.SphereGeometry(1.045, 40, 32, FRONT - 0.14, 0.28, 1.35, 0.15),
    eyeMat
  );

  // fake bloom: a wider, softer additive band sitting just off the surface
  const eyeHalo = new THREE.Mesh(
    new THREE.SphereGeometry(1.09, 64, 40, FRONT - 0.66, 1.32, 1.28, 0.3),
    haloMat
  );
  eyeHalo.scale.set(1.04, 0.96, 1);
  core.add(eyeHalo);
  eyeCore.scale.set(1.04, 0.96, 1);
  core.add(eyeCore);

  // panel seams
  [
    { r: 0.99, y: 0.34, s: 0.024 },
    { r: 0.93, y: -0.42, s: 0.02 }
  ].forEach(c => {
    const seam = new THREE.Mesh(new THREE.TorusGeometry(c.r * 0.72, c.s, 8, 64), metalDark);
    seam.position.y = c.y;
    seam.rotation.x = Math.PI / 2;
    seam.scale.set(1.04, 1.04, 1);
    core.add(seam);
  });

  // crown trim strip over the top
  const crown = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.026, 8, 48, Math.PI * 0.9), trimMat);
  crown.position.set(0, 0.72, 0.42);
  crown.rotation.set(-0.95, 0, Math.PI * 0.05);
  core.add(crown);

  // side vents, flush against the shell
  [-1, 1].forEach(side => {
    const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.14, 24), metalDark);
    vent.position.set(side * 0.96, -0.06, 0);
    vent.rotation.z = Math.PI / 2;
    core.add(vent);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 8, 28), trimMat);
    ring.position.set(side * 1.03, -0.06, 0);
    ring.rotation.y = Math.PI / 2;
    core.add(ring);
  });

  // antenna
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.5, 12), metalDark);
  stalk.position.y = 1.16;
  core.add(stalk);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.062, 18, 18), cyanMat);
  tip.position.y = 1.44;
  core.add(tip);

  /* ---- halo + equator rings ---- */
  const gyros = [];
  [
    { r: 1.46, t: 0.026, mat: trimMat, rot: [Math.PI / 2 - 0.34, 0, 0.1], spin: [0, 0.85, 0.1], y: -0.05 },
    { r: 0.74, t: 0.018, mat: cyanMat, rot: [Math.PI / 2 - 0.16, 0.1, 0],  spin: [0, -0.7, 0],  y: 1.16 }
  ].forEach(cfg => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, cfg.t, 8, 96), cfg.mat);
    ring.rotation.set(...cfg.rot);
    ring.position.y = cfg.y;
    ring.userData.spin = cfg.spin;
    root.add(ring);
    gyros.push(ring);
  });

  /* ---- shoulder fins (close to the head, angled back) ---- */
  const pods = [];
  [-1, 1].forEach(side => {
    const pod = new THREE.Group();
    pod.position.set(side * 1.02, -0.3, -0.18);

    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.2, 0.5), metal);
    fin.rotation.set(0.1, side * 0.34, side * -0.42);
    pod.add(fin);

    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.045, 0.06), trimMat);
    edge.position.set(0, 0.1, 0.2);
    edge.rotation.set(0.1, side * 0.34, side * -0.42);
    pod.add(edge);

    pod.userData = { side, base: pod.position.clone(), phase: Math.random() * 6 };
    root.add(pod);
    pods.push(pod);
  });

  /* ---- orbiting micro-shards ---- */
  const shards = [];
  for (let i = 0; i < 5; i++) {
    const sh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.055 + Math.random() * 0.03),
      i % 2 ? cyanMat : trimMat
    );
    sh.userData = {
      radius: 1.62 + Math.random() * 0.5,
      speed: 0.34 + Math.random() * 0.45,
      offset: Math.random() * Math.PI * 2,
      tilt: (Math.random() - 0.5) * 1.4,
      yAmp: 0.35 + Math.random() * 0.6
    };
    root.add(sh);
    shards.push(sh);
  }

  /* ---- thruster nozzles under the head ---- */
  const jets = [];
  [[-0.34, -0.82, 0.08], [0.34, -0.82, 0.08], [0, -0.86, -0.3]].forEach(pos => {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.1, 18), metalDark);
    nozzle.position.set(...pos);
    core.add(nozzle);

    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), glowMat.clone());
    flame.position.set(pos[0], pos[1] - 0.12, pos[2]);
    flame.scale.set(1, 1.5, 1);
    root.add(flame);
    jets.push(flame);
  });

  /* ---------------- Pointer + idle gaze ---------------- */
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

  /* ---------------- Excite burst ---------------- */
  let excite = 0;
  const kick = (amount = 1) => { excite = Math.min(1.6, excite + amount); };

  // pointer passing near the drone counts as a poke — the stage itself is
  // pointer-events:none so it can never swallow a click on the page
  addEventListener('mousemove', e => {
    const r = host.getBoundingClientRect();
    if (!r.width) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < r.width * 0.55) kick(0.03);
  }, { passive: true });

  /* ---------------- Section poses ---------------- */
  // camera spot + rig orientation per section, so the drone reads as
  // inspecting whatever the visitor just navigated to
  const POSES = {
    hero:     { cam: [0, 0.1, 8.4],    rot: [0, 0, 0],       scale: 1.0 },
    about:    { cam: [1.5, 0.3, 7.6],  rot: [0.04, -0.55, -0.05], scale: 0.95 },
    doing:    { cam: [-1.6, 0.35, 7.6], rot: [0.05, 0.6, 0.05],   scale: 0.95 },
    projects: { cam: [0.3, -0.9, 7.0], rot: [0.26, -0.2, 0],      scale: 0.9 },
    certs:    { cam: [1.2, 1.1, 6.8],  rot: [-0.2, -0.42, 0.06],  scale: 0.88 },
    journey:  { cam: [-1.9, 0.1, 8.0], rot: [0.02, 0.85, 0.04],   scale: 0.92 },
    contact:  { cam: [0, 0.15, 7.2],   rot: [0, 0, 0],            scale: 1.05 },
    // parked next to the chat panel, turned toward it
    chat:     { cam: [0.6, 0.1, 7.0],  rot: [0.02, -0.3, -0.03],  scale: 1.0 }
  };

  const rotGoal = new THREE.Euler(0, 0, 0);
  let scaleGoal = 1, scaleNow = 1;

  function setSection(id) {
    const p = POSES[id] || POSES.hero;
    camGoal.set(...p.cam);
    rotGoal.set(...p.rot);
    scaleGoal = p.scale;
    kick(1.1);                     // spin up and flash on every move
  }

  document.addEventListener('section:change', e => setSection(e.detail && e.detail.id));
  setSection(document.body.dataset.section || 'hero');

  /* ---------------- Talking ---------------- */
  // the drone is the one answering in the chat, so it visibly reacts:
  // a quick spin-up while thinking, then a nodding "talk" cycle while its
  // speech bubble is on screen
  let talk = 0, think = 0;

  document.addEventListener('agent:thinking', () => { think = 1.1; kick(0.5); });
  document.addEventListener('agent:reply', e => {
    const len = (e.detail && e.detail.length) || 60;
    talk = Math.min(6.5, 1.8 + len * 0.022);
    think = 0;
    kick(0.9);
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

  /* ---------------- Loop ---------------- */
  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { clock.getDelta(); loop(); }
  });

  let blinkAt = 3, blinkT = -1, prevT = 0;

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

    // when the pointer has been still for a while the drone looks around by itself
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

    if (!reduce) {
      // while talking it nods on a faster cycle, like a mouth moving
      const talking = talk > 0 ? 1 : 0;
      const nod = talking ? Math.sin(t * 11) * 0.045 : 0;

      // hover bob + lean
      root.position.y = Math.sin(t * 1.25) * 0.11 + excite * 0.1 + nod;
      // bank into the direction of travel: the further the camera still has to
      // go, the harder it leans — so a section change reads as flying there
      const travelX = camGoal.x - camPos.x;
      root.rotation.z = rotGoal.z + Math.sin(t * 0.8) * 0.022 + smooth.x * -0.05
                      - travelX * 0.09;

      // aim: pose orientation plus cursor tracking on top of it
      root.rotation.y += ((rotGoal.y + smooth.x * 0.42) - root.rotation.y) * 0.05;
      root.rotation.x += ((rotGoal.x - smooth.y * 0.24 + nod * 1.6) - root.rotation.x) * 0.05;

      // the core turns a little further than the body
      core.rotation.y = smooth.x * 0.16;
      core.rotation.x = -smooth.y * 0.1;

      scaleNow += (scaleGoal - scaleNow) * 0.06;
      root.scale.setScalar(scaleNow * (1 + Math.sin(t * 1.7) * 0.008 + excite * 0.04));

      // gyros — spin faster during an excite burst
      const boost = 1 + excite * 3.4;
      gyros.forEach(g => {
        const [sx, sy, sz] = g.userData.spin;
        g.rotation.x += sx * 0.012 * boost;
        g.rotation.y += sy * 0.012 * boost;
        g.rotation.z += sz * 0.012 * boost;
      });

      // pods trail the cursor with lag, and drift on their own
      pods.forEach(p => {
        const d = p.userData;
        const wobble = Math.sin(t * 1.1 + d.phase) * 0.12;
        p.position.x = d.base.x + smooth.x * 0.3 + d.side * excite * 0.34;
        p.position.y = d.base.y + wobble + smooth.y * 0.14;
        p.position.z = d.base.z + Math.cos(t * 0.9 + d.phase) * 0.16;
        p.rotation.y = smooth.x * 0.5 + d.side * 0.22;
        p.rotation.z = -smooth.y * 0.2 + wobble * 0.3;
      });

      // shards orbit; the burst pushes them outward
      shards.forEach(s => {
        const d = s.userData;
        const a = t * d.speed + d.offset;
        const r = d.radius + excite * 0.55;
        s.position.set(
          Math.cos(a) * r,
          Math.sin(a * 0.8) * d.yAmp * 0.5 + Math.sin(t + d.offset) * 0.12,
          Math.sin(a) * r * Math.cos(d.tilt)
        );
        s.rotation.x += 0.02 + excite * 0.05;
        s.rotation.y += 0.015;
      });

      // emissive breathing + eye scan.
      // thinking = fast shallow flicker, talking = strong rhythmic pulse
      const rate = think > 0 ? 9 : talk > 0 ? 6.5 : 2.6;
      const depth = think > 0 ? 0.35 : talk > 0 ? 1.1 : 0.5;
      const pulse = 1.9 + Math.sin(t * rate) * depth + excite * 2.2;
      eyeMat.emissiveIntensity = pulse;
      haloMat.opacity = 0.16 + Math.sin(t * 2.6) * 0.05 + excite * 0.22;
      trimMat.emissiveIntensity = 1.2 + Math.sin(t * 1.9) * 0.35 + excite * 1.4;
      cyanMat.emissiveIntensity = 1.4 + Math.sin(t * 3.4 + 1) * 0.5 + excite;
      eyeLight.intensity = 7 + Math.sin(t * 2.6) * 2.4 + excite * 9;

      // the pupil patch slides along the band toward wherever we're looking
      eyeCore.rotation.y = smooth.x * 0.42 + Math.sin(t * 0.7) * 0.05;
      eyeCore.rotation.x = -smooth.y * 0.12;

      // blink: the bar collapses for a beat
      if (blinkT < 0 && t > blinkAt) blinkT = 0;
      if (blinkT >= 0) {
        blinkT += 0.07;
        const k = blinkT < 0.5 ? blinkT / 0.5 : (1 - blinkT) / 0.5;
        const lid = Math.max(0.06, 1 - k * 1.15);
        eye.scale.y = 0.96 * lid;
        eyeCore.scale.y = 0.96 * lid;
        if (blinkT >= 1) {
          blinkT = -1;
          eye.scale.y = eyeCore.scale.y = 0.96;
          blinkAt = t + 2.6 + Math.random() * 3.6;
        }
      }

      // thruster flicker + ground glow
      jets.forEach((f, i) => {
        const flick = 0.8 + Math.random() * 0.45 + excite * 0.7;
        f.scale.set(1 + Math.random() * 0.1, flick, 1 + Math.random() * 0.1);
        f.material.opacity = 0.2 + Math.random() * 0.12 + excite * 0.22;
      });
      tip.scale.setScalar(1 + Math.sin(t * 4) * 0.12 + excite * 0.3);
    }

    // camera glides to the pose spot
    camPos.lerp(camGoal, 0.045);
    camera.position.copy(camPos);
    camera.lookAt(0, 0.05, 0);

    renderer.render(scene, camera);
  }

  loop();
  document.dispatchEvent(new CustomEvent('character:ready'));
}
