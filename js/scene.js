/* ==========================================================
   3D background scene — particle field + floating geometry
   Reacts to mouse / touch and to scroll position.
   ========================================================== */

import * as THREE from 'three';

const canvas = document.getElementById('bg-canvas');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07050e, 0.05);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 120);
camera.position.set(0, 0, 16);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

/* ---------------- Lights ---------------- */
scene.add(new THREE.AmbientLight(0x3b2f66, 1.15));

const key = new THREE.PointLight(0x7c5cff, 100, 60);
key.position.set(9, 7, 12);
scene.add(key);

const rim = new THREE.PointLight(0xa855f7, 85, 60);
rim.position.set(-11, -5, 8);
scene.add(rim);

const cyan = new THREE.PointLight(0xc98bff, 60, 50);
cyan.position.set(0, 9, -6);
scene.add(cyan);

/* ---------------- Particle field ---------------- */
const isMobile = innerWidth < 760;
const COUNT = isMobile ? 1400 : 3200;

const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const seeds = new Float32Array(COUNT);

const paletteA = new THREE.Color(0x7c5cff);
const paletteB = new THREE.Color(0xa855f7);
const paletteC = new THREE.Color(0xc98bff);
const tmpColor = new THREE.Color();

for (let i = 0; i < COUNT; i++) {
  const r = 6 + Math.random() * 26;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
  positions[i * 3 + 2] = r * Math.cos(phi);

  const t = Math.random();
  tmpColor.copy(t < 0.45 ? paletteA : t < 0.75 ? paletteB : paletteC);
  tmpColor.multiplyScalar(0.5 + Math.random() * 0.5);
  colors[i * 3]     = tmpColor.r;
  colors[i * 3 + 1] = tmpColor.g;
  colors[i * 3 + 2] = tmpColor.b;

  seeds[i] = Math.random() * Math.PI * 2;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particles = new THREE.Points(
  particleGeo,
  new THREE.PointsMaterial({
    size: 0.075,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
);
scene.add(particles);

const basePositions = positions.slice();

/* ---------------- Floating geometry ---------------- */
const shapesGroup = new THREE.Group();
scene.add(shapesGroup);

const geometries = [
  new THREE.IcosahedronGeometry(1.5, 0),
  new THREE.TorusGeometry(1.15, 0.34, 16, 60),
  new THREE.OctahedronGeometry(1.35, 0),
  new THREE.TorusKnotGeometry(0.85, 0.26, 90, 14),
  new THREE.DodecahedronGeometry(1.3, 0),
  new THREE.BoxGeometry(1.7, 1.7, 1.7)
];

const layout = [
  { pos: [-7.0,  2.6, -3],  scale: 1.00, wire: true  },
  { pos: [ 7.4,  1.4, -5],  scale: 0.95, wire: false },
  { pos: [-5.6, -3.4, -2],  scale: 0.80, wire: false },
  { pos: [ 5.4, -3.0, -1],  scale: 0.90, wire: true  },
  { pos: [ 0.5,  4.6, -8],  scale: 1.10, wire: true  },
  { pos: [-2.4, -5.2, -7],  scale: 0.70, wire: false }
];

const shapes = [];

layout.forEach((cfg, i) => {
  const material = cfg.wire
    ? new THREE.MeshBasicMaterial({
        color: [0x7c5cff, 0xa855f7, 0xc98bff][i % 3],
        wireframe: true,
        transparent: true,
        opacity: 0.28
      })
    : new THREE.MeshStandardMaterial({
        color: 0x140f28,
        roughness: 0.22,
        metalness: 0.92,
        transparent: true,
        opacity: 0.9
      });

  const mesh = new THREE.Mesh(geometries[i % geometries.length], material);
  mesh.position.set(...cfg.pos);
  mesh.scale.setScalar(cfg.scale);
  mesh.userData = {
    baseY: cfg.pos[1],
    floatSpeed: 0.4 + Math.random() * 0.5,
    floatAmp: 0.35 + Math.random() * 0.4,
    rotX: (Math.random() - 0.5) * 0.28,
    rotY: (Math.random() - 0.5) * 0.28,
    phase: Math.random() * Math.PI * 2
  };
  shapesGroup.add(mesh);
  shapes.push(mesh);
});

/* ---------------- Pointer tracking ---------------- */
const pointer = { x: 0, y: 0 };
const target = { x: 0, y: 0 };

function setPointer(clientX, clientY) {
  target.x = (clientX / innerWidth) * 2 - 1;
  target.y = -((clientY / innerHeight) * 2 - 1);
}

addEventListener('mousemove', e => setPointer(e.clientX, e.clientY), { passive: true });
addEventListener('touchmove', e => {
  if (e.touches.length) setPointer(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

/* ---------------- Resize ---------------- */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
}, { passive: true });

/* ---------------- Scroll ---------------- */
let scrollProgress = 0;
addEventListener('scroll', () => {
  const max = document.body.scrollHeight - innerHeight;
  scrollProgress = max > 0 ? scrollY / max : 0;
}, { passive: true });

/* ---------------- Pause when tab hidden ---------------- */
let running = true;
document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  if (running) animate();
});

/* ---------------- Animation loop ---------------- */
const clock = new THREE.Clock();
const posAttr = particleGeo.attributes.position;

function animate() {
  if (!running) return;
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // smooth the pointer
  pointer.x += (target.x - pointer.x) * 0.045;
  pointer.y += (target.y - pointer.y) * 0.045;

  if (!reduceMotion) {
    // slow drift of the whole cloud
    particles.rotation.y = t * 0.022;

    // Cursor position in world space on the z = 0 plane.
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const halfW = halfH * camera.aspect;
    const cx = pointer.x * halfW;
    const cy = pointer.y * halfH;

    // The cloud is rotated about Y, so repulsion has to be computed in world
    // space and mapped back to local space — otherwise the push-away bubble
    // slides off the cursor as the rotation accumulates.
    const cosT = Math.cos(particles.rotation.y);
    const sinT = Math.sin(particles.rotation.y);
    const RADIUS = 5.5;

    const step = isMobile ? 3 : 1;
    for (let i = 0; i < COUNT; i += step) {
      const idx = i * 3;
      const bx = basePositions[idx];
      const bz = basePositions[idx + 2];
      const by = basePositions[idx + 1] + Math.sin(t * 0.6 + seeds[i]) * 0.28;

      const worldX = bx * cosT + bz * sinT;
      const dx = worldX - cx;
      const dy = by - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < RADIUS && dist > 0.001) {
        const push = (1 - dist / RADIUS) * 2.4;
        const wx = worldX + (dx / dist) * push;
        const wz = -bx * sinT + bz * cosT;          // world z is unchanged
        posAttr.array[idx]     = wx * cosT - wz * sinT;
        posAttr.array[idx + 1] = by + (dy / dist) * push;
        posAttr.array[idx + 2] = wx * sinT + wz * cosT;
      } else {
        posAttr.array[idx]     = bx;
        posAttr.array[idx + 1] = by;
        posAttr.array[idx + 2] = bz;
      }
    }
    posAttr.needsUpdate = true;

    // floating shapes
    shapes.forEach(m => {
      const d = m.userData;
      m.rotation.x += d.rotX * 0.006;
      m.rotation.y += d.rotY * 0.006;
      m.position.y = d.baseY + Math.sin(t * d.floatSpeed + d.phase) * d.floatAmp;
    });

    // pointer parallax plus a slow scroll-driven turn of the whole cluster
    shapesGroup.rotation.y = pointer.x * 0.22 + scrollProgress * 1.1;
    shapesGroup.rotation.x = -pointer.y * 0.14 + scrollProgress * 0.35;
  }

  // camera parallax + scroll dolly
  camera.position.x += (pointer.x * 2.4 - camera.position.x) * 0.05;
  camera.position.y += (pointer.y * 1.5 - camera.position.y) * 0.05;
  camera.position.z = 16 + scrollProgress * 9;
  camera.lookAt(0, 0, 0);

  // lights follow the pointer a little
  key.position.x = 9 + pointer.x * 4;
  key.position.y = 7 + pointer.y * 3;

  renderer.render(scene, camera);
}

animate();

/* Tell main.js the scene is live so the loader can retire. */
document.dispatchEvent(new CustomEvent('scene:ready'));
