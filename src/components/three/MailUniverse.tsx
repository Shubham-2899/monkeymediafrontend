import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createEnvelopeAssets, EnvelopeAssets } from "./envelopeAssets";

/* ==================================================================
   MailUniverse — plain three.js scene in the "editorial paper" style:
   an ink-dotted globe on warm paper, airmail-red/blue mail routes with
   messages travelling along them, and (optionally) small paper
   envelopes on the routes, an orbit ring and a few drifting in the
   background. Mouse moves the camera slightly.
=================================================================== */

export type MailUniverseVariant = "hero" | "login";

const GLOBE_RADIUS = 1.7;
const ARC_COUNT = 26;
const TRAVELERS_PER_ARC = 2;
const CAMERA_Z = 8;

const PAPER = "#f5f1ea";
const INK = "#14213d";
const STAMP = "#c8553d";
const AIRMAIL = "#1f4e8c";

/* ---------------- helpers ---------------- */

function latLonToVec(lat: number, lon: number, r: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Seeded RNG so the scene looks the same on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pseudo "land" mask so the dotted globe reads as continents. */
function landMask(p: THREE.Vector3) {
  const n =
    Math.sin(p.x * 2.1 + 1.3) * Math.sin(p.y * 2.6 + 0.4) * Math.sin(p.z * 2.3 + 2.1) +
    0.55 * Math.sin(p.x * 4.7 + p.z * 1.9) * Math.sin(p.y * 5.3 - 1.1) +
    0.25 * Math.sin(p.z * 9.1 + p.y * 3.3);
  return n > 0.05;
}

/** Round sprite for point clouds (crisp edge, like a printed dot). */
function makeDotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(32, 32, 26, 0, Math.PI * 2);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Puts an object on a curve: x along travel, face pointing along `up`. */
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _s = new THREE.Vector3();
function orientOnCurve(m: THREE.Matrix4, pos: THREE.Vector3, tangent: THREE.Vector3, up: THREE.Vector3, scale: number) {
  _x.copy(tangent).normalize();
  _z.copy(up).normalize();
  _y.crossVectors(_z, _x).normalize();
  _z.crossVectors(_x, _y).normalize();
  m.makeBasis(_x, _y, _z);
  m.scale(_s.setScalar(Math.max(scale, 0.0001)));
  m.setPosition(pos);
}

type Updater = (t: number, dt: number) => void;

/* ---------------- globe ---------------- */

const rimVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const rimFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(vNormal, vView)), uPower);
    gl_FragColor = vec4(uColor, f * uIntensity);
  }
`;

/** Soft ink shading toward the globe's edge (engraving-like, not a glow). */
function rimMaterial(power: number, intensity: number) {
  return new THREE.ShaderMaterial({
    vertexShader: rimVertex,
    fragmentShader: rimFragment,
    uniforms: { uColor: { value: new THREE.Color(INK) }, uPower: { value: power }, uIntensity: { value: intensity } },
    transparent: true,
    depthWrite: false,
  });
}

function buildGlobe(assets: EnvelopeAssets | null, dotTex: THREE.Texture) {
  const root = new THREE.Group();
  const spin = new THREE.Group();
  spin.rotation.set(0.35, -0.6, 0.08);
  root.add(spin);
  const rand = mulberry32(7);

  // flat paper core hides the far side (shading comes from the ink rim below)
  spin.add(new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 0.985, 64, 64), new THREE.MeshBasicMaterial({ color: "#f1ebe1" })));

  // graticule: real latitude / longitude lines, like an engraved map
  const grat: number[] = [];
  const R = GLOBE_RADIUS * 1.001;
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = 0; lon < 360; lon += 4) {
      const a = latLonToVec(lat, lon, R);
      const b = latLonToVec(lat, lon + 4, R);
      grat.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  for (let lon = 0; lon < 180; lon += 30) {
    for (let lat = -90; lat < 270; lat += 4) {
      const a = latLonToVec(lat <= 90 ? lat : 180 - lat, lat <= 90 ? lon : lon + 180, R);
      const n = lat + 4;
      const b = latLonToVec(n <= 90 ? n : 180 - n, n <= 90 ? lon : lon + 180, R);
      grat.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const gratGeo = new THREE.BufferGeometry();
  gratGeo.setAttribute("position", new THREE.Float32BufferAttribute(grat, 3));
  spin.add(new THREE.LineSegments(gratGeo, new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.12 })));

  // continents: fibonacci dots filtered by the land mask
  const N = 9000;
  const pos: number[] = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = Math.PI * (3 - Math.sqrt(5)) * i;
    const p = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    if (!landMask(p)) continue;
    p.multiplyScalar(GLOBE_RADIUS * 1.004);
    pos.push(p.x, p.y, p.z);
  }
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  spin.add(
    new THREE.Points(
      dotsGeo,
      new THREE.PointsMaterial({ size: 0.03, map: dotTex, color: INK, transparent: true, opacity: 0.72, alphaTest: 0.3, depthWrite: false })
    )
  );

  spin.add(new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 1.006, 64, 64), rimMaterial(3.2, 0.2)));

  // mail routes from a few sending hubs
  const hubs = [latLonToVec(38, -95, GLOBE_RADIUS), latLonToVec(51, 0, GLOBE_RADIUS), latLonToVec(19, 73, GLOBE_RADIUS), latLonToVec(1, 104, GLOBE_RADIUS)];
  const palette = [STAMP, AIRMAIL, STAMP, INK];
  const arcs = Array.from({ length: ARC_COUNT }, (_, i) => {
    const start = hubs[i % hubs.length];
    const end = latLonToVec(rand() * 130 - 60, rand() * 360 - 180, GLOBE_RADIUS);
    const dist = start.distanceTo(end);
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS + 0.22 + dist * 0.36);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const color = palette[i % palette.length];

    spin.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
        new THREE.LineDashedMaterial({ color, transparent: true, opacity: 0.55, dashSize: 0.05, gapSize: 0.035 })
      )
    );
    (spin.children[spin.children.length - 1] as THREE.Line).computeLineDistances();

    // landing ping (thin ring, like a postmark circle)
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1, 40),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.position.copy(end).multiplyScalar(1.004);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), end.clone().normalize());
    spin.add(ring);

    return { curve, ring, lastHit: -10 };
  });

  // messages travelling the routes: tiny envelopes, or ink dots when envelopes are off
  const travelerCount = ARC_COUNT * TRAVELERS_PER_ARC;
  const travelers = assets
    ? new THREE.InstancedMesh(assets.geometry, assets.materials, travelerCount)
    : new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 10), new THREE.MeshBasicMaterial({ color: STAMP }), travelerCount);
  travelers.frustumCulled = false;
  spin.add(travelers);
  const travelerScale = assets ? 0.085 : 0.028;
  const lastT = new Array(travelerCount).fill(0);

  const m4 = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const tan = new THREE.Vector3();

  const update: Updater = (t, dt) => {
    spin.rotation.y += dt * 0.07;

    for (let i = 0; i < travelerCount; i++) {
      const arcIdx = i % ARC_COUNT;
      const arc = arcs[arcIdx];
      const speed = 0.14 + (arcIdx % 5) * 0.022;
      const prog = (t * speed + i * 0.137 + Math.floor(i / ARC_COUNT) * 0.5) % 1;
      if (prog < lastT[i]) arc.lastHit = t;
      lastT[i] = prog;

      arc.curve.getPoint(prog, p);
      arc.curve.getTangent(prog, tan);
      orientOnCurve(m4, p, tan, p, travelerScale * Math.sin(Math.PI * Math.min(1, prog * 1.15)));
      travelers.setMatrixAt(i, m4);
    }
    travelers.instanceMatrix.needsUpdate = true;

    for (const arc of arcs) {
      const age = (t - arc.lastHit) / 1.4;
      const mat = arc.ring.material as THREE.MeshBasicMaterial;
      if (age > 1) {
        mat.opacity = 0;
        continue;
      }
      arc.ring.scale.setScalar(0.02 + age * 0.18);
      mat.opacity = (1 - age) * 0.8;
    }
  };

  return { object: root, update };
}

/* ---------------- orbit ring ---------------- */

function buildOrbitRing(assets: EnvelopeAssets | null) {
  const tilt = new THREE.Group();
  tilt.rotation.set(1.15, 0, -0.35);
  const radius = GLOBE_RADIUS * 1.45;

  const orbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2).getPoints(200).map((v) => new THREE.Vector3(v.x, 0, v.y))),
    new THREE.LineDashedMaterial({ color: INK, transparent: true, opacity: 0.35, dashSize: 0.08, gapSize: 0.06 })
  );
  orbit.computeLineDistances();
  tilt.add(orbit);

  const carousel = new THREE.Group();
  tilt.add(carousel);
  const items: THREE.Object3D[] = [];
  const count = assets ? 8 : 3;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const holder = new THREE.Group();
    holder.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    holder.rotation.set(-Math.PI / 2, 0, -a + Math.PI / 2);
    // envelopes, or small "satellite" dots when envelopes are off
    const obj = assets
      ? new THREE.Mesh(assets.geometry, assets.materials)
      : new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshBasicMaterial({ color: i === 0 ? STAMP : INK }));
    obj.scale.setScalar(assets ? 0.2 : 0.035);
    holder.add(obj);
    carousel.add(holder);
    items.push(obj);
  }

  const update: Updater = (t, dt) => {
    carousel.rotation.y -= dt * 0.18;
    if (!assets) return;
    items.forEach((m, i) => {
      m.rotation.y = Math.sin(t * 0.8 + i) * 0.5;
      m.rotation.z = Math.sin(t * 0.6 + i * 1.7) * 0.25;
      m.position.y = Math.sin(t * 1.2 + i * 0.9) * 0.06;
    });
  };

  return { object: tilt, update };
}

/* ---------------- a few drifting envelopes ---------------- */

function buildDriftField(assets: EnvelopeAssets, count = 8) {
  const inst = new THREE.InstancedMesh(assets.geometry, assets.materials, count);
  inst.frustumCulled = false;
  const rand = mulberry32(99);
  const seeds = Array.from({ length: count }, () => ({
    x: (rand() * 2 - 1) * 10,
    y: (rand() * 2 - 1) * 6,
    z: -4 - rand() * 6,
    s: 0.25 + rand() * 0.3,
    sp: 0.06 + rand() * 0.12,
    r: rand() * Math.PI * 2,
  }));
  const dummy = new THREE.Object3D();

  const update: Updater = (t) => {
    seeds.forEach((d, i) => {
      const y = ((d.y + t * d.sp + 6) % 12) - 6;
      dummy.position.set(d.x + Math.sin(t * 0.3 + d.r) * 0.4, y, d.z);
      dummy.rotation.set(Math.sin(t * 0.4 + d.r) * 0.5, t * 0.2 + d.r, Math.cos(t * 0.3 + d.r) * 0.3);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  };
  return { object: inst, update };
}

/* ---------------- the scene ---------------- */

type SceneOptions = { variant: MailUniverseVariant; envelopes: boolean };

function createMailUniverse(container: HTMLElement, { variant, envelopes }: SceneOptions) {
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const SPEED = reducedMotion ? 0.35 : 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);
  scene.fog = new THREE.Fog(PAPER, 10, 20);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  scene.add(new THREE.HemisphereLight("#ffffff", "#efe8dc", 2.4));
  const key = new THREE.DirectionalLight("#fffaf2", 1.2);
  key.position.set(4, 6, 7);
  scene.add(key);

  const assets = envelopes ? createEnvelopeAssets() : null;
  const dotTex = makeDotTexture();

  const globe = buildGlobe(assets, dotTex);
  const orbit = buildOrbitRing(assets);
  const globeGroup = new THREE.Group();
  globeGroup.add(globe.object, orbit.object);
  scene.add(globeGroup);
  const updaters: Updater[] = [globe.update, orbit.update];

  if (assets) {
    const drift = buildDriftField(assets);
    scene.add(drift.object);
    updaters.push(drift.update);
  }

  /* ----- responsive layout ----- */
  const lookTarget = new THREE.Vector3();
  const look = new THREE.Vector3();

  const layout = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const viewH = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const half = (viewH * camera.aspect) / 2;
    const login = variant === "login";

    if (w < 900) {
      globeGroup.position.set(0, login ? 1.6 : 1.5, -1.8);
      globeGroup.scale.setScalar(0.9);
      lookTarget.set(0, 0, 0);
    } else {
      const gx = Math.min(half * 0.54, 3.9);
      globeGroup.position.set(login ? -gx : gx, login ? 0.25 : 0.1, 0);
      globeGroup.scale.setScalar(envelopes ? 1 : 1.12);
      lookTarget.set(login ? -0.4 : 0.4, 0, 0);
    }
  };
  layout();
  look.copy(lookTarget);

  /* ----- pointer parallax ----- */
  const pointer = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  /* ----- loop ----- */
  const clock = new THREE.Clock();
  let elapsed = 0;
  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05) * SPEED;
    elapsed += dt;
    for (const u of updaters) u(elapsed, dt);

    const k = 1 - Math.exp(-dt * 2);
    camera.position.x += (pointer.x * 0.5 - camera.position.x) * k;
    camera.position.y += (pointer.y * 0.3 - camera.position.y) * k;
    look.lerp(lookTarget, k);
    camera.lookAt(look);

    renderer.render(scene, camera);
  };

  let running = false;
  const setRunning = (on: boolean) => {
    if (on === running) return;
    running = on;
    if (on) clock.getDelta();
    renderer.setAnimationLoop(on ? frame : null);
  };
  setRunning(true);

  const ro = new ResizeObserver(layout);
  ro.observe(container);
  const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([e]) => setRunning(e.isIntersecting)) : null;
  io?.observe(container);

  /* ----- teardown ----- */
  return () => {
    setRunning(false);
    ro.disconnect();
    io?.disconnect();
    window.removeEventListener("pointermove", onPointer);

    scene.traverse((obj) => {
      const o = obj as THREE.Mesh;
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => {
        (m as THREE.MeshStandardMaterial).map?.dispose();
        m.dispose();
      });
    });
    assets?.dispose();
    dotTex.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}

/** React wrapper: mounts the scene into an absolutely-positioned box. */
export default function MailUniverse({ variant = "hero", envelopes = true }: { variant?: MailUniverseVariant; envelopes?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return createMailUniverse(ref.current, { variant, envelopes });
  }, [variant, envelopes]);

  return <div ref={ref} style={{ position: "absolute", inset: 0 }} />;
}
