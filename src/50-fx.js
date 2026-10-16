// ===================== effects: particles, tracers, decals, casings, lights =====================
const _pc = new THREE.Color();
class PSys {
  constructor(max, additive) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 3); this.size = new Float32Array(max); this.alpha = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.maxLife = new Float32Array(max); this.s0 = new Float32Array(max); this.grow = new Float32Array(max);
    this.a0 = new Float32Array(max); this.grav = new Float32Array(max); this.drag = new Float32Array(max);
    const geo = this.geo = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage);
    this.aSize = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    this.aAlpha = new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", this.aPos); geo.setAttribute("pcolor", this.aCol); geo.setAttribute("size", this.aSize); geo.setAttribute("alpha", this.aAlpha);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { scale: { value: 800 } }, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: "attribute float size; attribute float alpha; attribute vec3 pcolor; varying float vA; varying vec3 vC; uniform float scale; void main(){ vA = alpha; vC = pcolor; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = clamp(size * scale / max(-mv.z, 0.05), 1.0, 900.0); gl_Position = projectionMatrix * mv; }",
      fragmentShader: "varying float vA; varying vec3 vC; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, d); a *= a; gl_FragColor = vec4(vC, vA * a); }",
    });
    this.points = new THREE.Points(geo, this.mat); this.points.frustumCulled = false; this.points.renderOrder = additive ? 6 : 5;
    scene.add(this.points);
  }
  spawn(x, y, z, vx, vy, vz, size, life, hexc, alpha, grav = 0, drag = 0, grow = 0, bright = 1) {
    if (this.n >= this.max) return;
    const i = this.n++, i3 = i * 3;
    _pc.setHex(hexc, THREE.SRGBColorSpace);
    this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z; this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    this.col[i3] = _pc.r * bright; this.col[i3 + 1] = _pc.g * bright; this.col[i3 + 2] = _pc.b * bright;
    this.s0[i] = size; this.size[i] = size; this.grow[i] = grow; this.life[i] = life; this.maxLife[i] = life; this.a0[i] = alpha; this.alpha[i] = alpha; this.grav[i] = grav; this.drag[i] = drag;
  }
  update(dt) {
    for (let i = 0; i < this.n;) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.remove(i); continue; }
      const i3 = i * 3, k = 1 - this.life[i] / this.maxLife[i], dr = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i3 + 1] -= this.grav[i] * dt; this.vel[i3] *= dr; this.vel[i3 + 1] *= dr; this.vel[i3 + 2] *= dr;
      this.pos[i3] += this.vel[i3] * dt; this.pos[i3 + 1] += this.vel[i3 + 1] * dt; this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      this.size[i] = this.s0[i] + this.grow[i] * k * this.maxLife[i]; this.alpha[i] = this.a0[i] * (1 - k) * (1 - k * 0.3);
      i++;
    }
    this.geo.setDrawRange(0, this.n);
    this.aPos.needsUpdate = this.aCol.needsUpdate = this.aSize.needsUpdate = this.aAlpha.needsUpdate = true;
  }
  remove(i) {
    const l = --this.n; if (i === l) return;
    const i3 = i * 3, l3 = l * 3;
    for (let k = 0; k < 3; k++) { this.pos[i3 + k] = this.pos[l3 + k]; this.vel[i3 + k] = this.vel[l3 + k]; this.col[i3 + k] = this.col[l3 + k]; }
    for (const a of ["size", "alpha", "life", "maxLife", "s0", "grow", "a0", "grav", "drag"]) this[a][i] = this[a][l];
  }
  clear() { this.n = 0; this.geo.setDrawRange(0, 0); }
}
const fxAdd = new PSys(3500, true), fxSmoke = new PSys(3500, false);
function fxScale() { const s = (VH * PR) / (2 * Math.tan(camera.fov * Math.PI / 360)); fxAdd.mat.uniforms.scale.value = s; fxSmoke.mat.uniforms.scale.value = s; }

const rnd = () => Math.random(), rs = () => Math.random() - 0.5;
function sparks(x, y, z, n, cols, speed = 4, nx = 0, ny = 1, nz = 0) {
  for (let i = 0; i < n; i++) {
    const c = cols[(Math.random() * cols.length) | 0];
    fxAdd.spawn(x, y, z, (nx + rs() * 1.6) * speed * rnd(), (ny + rs() * 1.6) * speed * rnd() + 0.5, (nz + rs() * 1.6) * speed * rnd(), 0.025 + rnd() * 0.03, 0.25 + rnd() * 0.35, c, 1, 9, 0.5, 0, 3);
  }
}
function dust(x, y, z, n, col, size = 0.35, speed = 1.2, life = 1.2, nx = 0, ny = 1, nz = 0) {
  for (let i = 0; i < n; i++) fxSmoke.spawn(x + rs() * 0.1, y + rs() * 0.1, z + rs() * 0.1, (nx + rs()) * speed * rnd(), (ny + rs() * 0.6) * speed * rnd() + 0.2, (nz + rs()) * speed * rnd(), size * (0.6 + rnd() * 0.8), life * (0.6 + rnd() * 0.8), col, 0.55, -0.2, 1.2, 0.5);
}
function smokeTrail(x, y, z, n = 1, size = 0.08) { for (let i = 0; i < n; i++) fxSmoke.spawn(x, y, z, rs() * 0.2, 0.25 + rnd() * 0.2, rs() * 0.2, size, 1.2 + rnd() * 0.8, 0xbbbbbb, 0.25, -0.05, 0.8, 0.12); }
function blood(x, y, z, n, cols) {
  if (noBlood) { dust(x, y, z, Math.ceil(n / 3), 0xb8b2a0, 0.2, 1.4, 0.5); sparks(x, y, z, Math.ceil(n / 3), [0xffe9a0, 0xffffff], 3); return; }
  for (let i = 0; i < n; i++) fxSmoke.spawn(x, y, z, rs() * 3, rnd() * 2.2, rs() * 3, 0.05 + rnd() * 0.06, 0.5 + rnd() * 0.4, cols[(Math.random() * cols.length) | 0], 0.9, 9, 0.8, 0.05); }

// ---------- dynamic lights (fixed pool so shaders never recompile) ----------
const fxLights = [];
for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xffffff, 0, 22, 1.6); l.userData = { t: 0, dur: 0.1, peak: 0 }; scene.add(l); fxLights.push(l); }
function pushLight(x, y, z, hexc, peak, dur) {
  let best = fxLights[0];
  for (const l of fxLights) if (l.intensity < best.intensity) best = l;
  best.position.set(x, y, z); best.color.setHex(hexc, THREE.SRGBColorSpace); best.userData.peak = peak; best.userData.dur = dur; best.userData.t = dur; best.intensity = peak;
}

// ---------- tracers ----------
const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false });
const tracerGeo = new THREE.CylinderGeometry(0.014, 0.014, 1, 5); tracerGeo.translate(0, 0.5, 0);
const tracers = [];
for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(tracerGeo, tracerMat.clone()); m.visible = false; m.frustumCulled = false; scene.add(m); tracers.push({ m, active: false, a: new THREE.Vector3(), b: new THREE.Vector3(), d: new THREE.Vector3(), len: 0, t: 0, speed: 300 }); }
let tracerIdx = 0;
function addTracer(a, b, hexc, speed = 320, streak = 7) {
  const T = tracers[tracerIdx++ % tracers.length];
  T.a.copy(a); T.b.copy(b); T.d.copy(b).sub(a); T.len = T.d.length(); if (T.len < 0.5) return; T.d.multiplyScalar(1 / T.len);
  T.t = 0; T.speed = speed; T.streak = streak; T.active = true; T.m.visible = true;
  T.m.material.color.setHex(hexc, THREE.SRGBColorSpace).multiplyScalar(3.5);
  T.m.quaternion.setFromUnitVectors(_Y, T.d);
}
const _Y = new THREE.Vector3(0, 1, 0), _tv = new THREE.Vector3();
function updateTracers(dt) {
  for (const T of tracers) {
    if (!T.active) continue;
    T.t += dt; const head = T.t * T.speed, tail = Math.max(0, head - T.streak);
    if (tail >= T.len) { T.active = false; T.m.visible = false; continue; }
    const h = Math.min(head, T.len);
    T.m.position.copy(T.a).addScaledVector(T.d, tail); T.m.scale.set(1, Math.max(0.05, h - tail), 1);
  }
}

// ---------- bullet-hole decals ----------
const holeTex = (() => {
  const [c, g] = mk(64, 64);
  const rg = g.createRadialGradient(32, 32, 1, 32, 32, 30); rg.addColorStop(0, "rgba(0,0,0,0.95)"); rg.addColorStop(0.3, "rgba(10,8,6,0.8)"); rg.addColorStop(0.55, "rgba(20,16,12,0.35)"); rg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const holeMat = new THREE.MeshBasicMaterial({ map: holeTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
const holeGeo = new THREE.PlaneGeometry(0.2, 0.2);
const holes = [];
for (let i = 0; i < 90; i++) { const m = new THREE.Mesh(holeGeo, holeMat); m.visible = false; scene.add(m); holes.push(m); }
let holeIdx = 0;
const _hq = new THREE.Quaternion(), _hz = new THREE.Vector3(0, 0, 1);
function addHole(p, n) {
  const m = holes[holeIdx++ % holes.length]; m.visible = true;
  m.position.copy(p).addScaledVector(n, 0.012); m.quaternion.setFromUnitVectors(_hz, n); m.rotateZ(Math.random() * 6.28);
  const k = 0.6 + Math.random() * 0.8; m.scale.set(k, k, 1);
}

// ---------- shell casings ----------
const CAS_N = 48;
const casings = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.03, 6), new THREE.MeshStandardMaterial({ color: 0xd4a84a, metalness: 0.95, roughness: 0.3, envMapIntensity: 1.2 }), CAS_N);
casings.castShadow = false; casings.frustumCulled = false; scene.add(casings);
const casData = Array.from({ length: CAS_N }, () => ({ p: new THREE.Vector3(0, -50, 0), v: new THREE.Vector3(), r: new THREE.Euler(), rv: new THREE.Vector3(), life: 0 }));
let casIdx = 0; const _cm = new THREE.Matrix4(), _cq = new THREE.Quaternion(), _cs = new THREE.Vector3(1, 1, 1);
function ejectCasing(p, v) {
  const c = casData[casIdx++ % CAS_N]; c.p.copy(p); c.v.copy(v); c.rv.set(rs() * 30, rs() * 30, rs() * 30); c.r.set(rnd() * 3, rnd() * 3, rnd() * 3); c.life = 6;
}
function updateCasings(dt) {
  for (let i = 0; i < CAS_N; i++) {
    const c = casData[i];
    if (c.life > 0) {
      c.life -= dt; c.v.y -= 9.8 * dt; c.p.addScaledVector(c.v, dt);
      const gh = groundH(c.p.x, c.p.z) + 0.01;
      if (c.p.y < gh) { c.p.y = gh; c.v.y = Math.abs(c.v.y) * 0.3; c.v.x *= 0.5; c.v.z *= 0.5; c.rv.multiplyScalar(0.4); if (c.v.y < 0.3) { c.v.y = 0; c.rv.set(0, 0, 0); } }
      c.r.x += c.rv.x * dt; c.r.y += c.rv.y * dt; c.r.z += c.rv.z * dt;
      if (c.life <= 0) c.p.y = -50;
    }
    _cq.setFromEuler(c.r); _cm.compose(c.p, _cq, _cs); casings.setMatrixAt(i, _cm);
  }
  casings.instanceMatrix.needsUpdate = true;
}

// ---------- shockwave ----------
const shockMat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false });
const shockGeo = new THREE.RingGeometry(0.85, 1, 56); shockGeo.rotateX(-Math.PI / 2);
const shocks = [];
for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(shockGeo, shockMat.clone()); m.visible = false; scene.add(m); shocks.push({ m, t: 99 }); }
let shockIdx = 0;
function addShock(x, y, z, col) { const s = shocks[shockIdx++ % shocks.length]; s.t = 0; s.m.position.set(x, y + 0.15, z); s.m.material.color.setHex(col, THREE.SRGBColorSpace).multiplyScalar(2.2); s.m.visible = true; }

function explosionFx(x, y, z, T) {
  for (let i = 0; i < 70; i++) fxAdd.spawn(x + rs() * 0.5, y + rs() * 0.4, z + rs() * 0.5, rs() * 9, rnd() * 7, rs() * 9, 0.7 + rnd() * 0.9, 0.35 + rnd() * 0.45, [0xffe090, 0xffa030, 0xff6a18, 0xff4a10][R(0, 3)], 0.95, -1, 2.4, 1.8, 2.6);
  for (let i = 0; i < 40; i++) fxSmoke.spawn(x + rs() * 0.8, y + rs() * 0.5, z + rs() * 0.8, rs() * 4.5, 1 + rnd() * 3.4, rs() * 4.5, 1.1 + rnd() * 1.4, 2.0 + rnd() * 1.6, [0x2a2826, 0x3a3834, 0x4e4a44][R(0, 2)], 0.8, -0.3, 1.6, 0.5);
  for (let i = 0; i < 46; i++) fxAdd.spawn(x, y + 0.2, z, rs() * 15, rnd() * 12, rs() * 15, 0.05 + rnd() * 0.05, 0.6 + rnd() * 0.7, 0xffc060, 1, 14, 0.2, 0, 4);
  for (let i = 0; i < 38; i++) { const c = T.boomDebris[R(0, T.boomDebris.length - 1)]; fxSmoke.spawn(x, y + 0.2, z, rs() * 14, rnd() * 10, rs() * 14, 0.08 + rnd() * 0.12, 0.9 + rnd() * 0.7, c, 1, 16, 0.3, 0); }
  for (let i = 0; i < 26; i++) { const a = rnd() * TAU, sp = 6 + rnd() * 6; fxSmoke.spawn(x, y + 0.1, z, Math.cos(a) * sp, 0.4 + rnd(), Math.sin(a) * sp, 0.9 + rnd() * 0.8, 1.4 + rnd(), 0x7a6a50, 0.45, 0, 2.2, 0.9); }
  pushLight(x, y + 1.2, z, 0xffa850, 90, 0.55);
  addShock(x, y, z, 0xffc070);
  const sh = shocks[(shockIdx - 1) % shocks.length]; sh.m.scale.setScalar(0.5);
}

// ---------- per-frame ----------
const _shockV = new THREE.Vector3();
function fxUpdate(dt) {
  fxScale();
  fxAdd.update(dt); fxSmoke.update(dt);
  updateTracers(dt); updateCasings(dt);
  for (const l of fxLights) { if (l.userData.t > 0) { l.userData.t -= dt; l.intensity = l.userData.peak * Math.max(0, l.userData.t / l.userData.dur) ** 1.5; } else l.intensity = 0; }
  for (const s of shocks) {
    if (s.t < 0.5) { s.t += dt; const k = s.t / 0.5; s.m.scale.setScalar(0.5 + k * 11); s.m.material.opacity = (1 - k) * 0.55; if (s.t >= 0.5) s.m.visible = false; }
  }
}
function fxReset() {
  fxAdd.clear(); fxSmoke.clear();
  for (const T of tracers) { T.active = false; T.m.visible = false; }
  for (const h of holes) h.visible = false;
  for (const c of casData) { c.life = 0; c.p.y = -50; }
  for (const l of fxLights) { l.intensity = 0; l.userData.t = 0; }
  for (const s of shocks) { s.t = 99; s.m.visible = false; }
}
