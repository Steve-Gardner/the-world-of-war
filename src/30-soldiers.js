// ===================== soldiers: jointed humanoid rigs =====================
const FAB = (() => { const cv = fabricCv(); return { map: toTex(cv, { rx: 3, ry: 3 }), norm: toTex(normalFromCanvas(cv, 3), { srgb: false, rx: 3, ry: 3 }) }; })();
const LEA = (() => { const cv = leatherCv(); return { map: toTex(cv, { rx: 2, ry: 2 }), norm: toTex(normalFromCanvas(cv, 2.5), { srgb: false, rx: 2, ry: 2 }) }; })();
const _matCache = new Map();
function pm(color, o = {}) {
  const key = TH.key + "|" + color.join(",") + "|" + JSON.stringify(o);
  let m = _matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: hex(color), roughness: o.r ?? 0.85, metalness: o.m ?? 0, envMapIntensity: (o.e ?? 0.6) * (TH ? TH.env : 0.6) / 0.6 * 1.7 });
    if (o.fabric) { m.map = FAB.map; m.normalMap = FAB.norm; m.normalScale.set(0.7, 0.7); }
    if (o.leather) { m.map = LEA.map; m.normalMap = LEA.norm; m.normalScale.set(0.8, 0.8); }
    if (o.glow) { m.emissive = hex(o.glow); m.emissiveIntensity = o.gi ?? 2.4; }
    if (o.ds) m.side = THREE.DoubleSide;
    _matCache.set(key, m);
  }
  return m;
}
const _geoCache = new Map();
function GEO(key, fn) { let g = _geoCache.get(key); if (!g) { g = fn(); _geoCache.set(key, g); } return g; }
const gCap = (r, l) => GEO(`cap${r}_${l}`, () => new THREE.CapsuleGeometry(r, l, 5, 12));
const gRB = (w, h, d, r = 0.02) => GEO(`rb${w}_${h}_${d}_${r}`, () => new RoundedBoxGeometry(w, h, d, 2, r));
const gBox = (w, h, d) => GEO(`bx${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
const gSph = (r, ws = 16, hs = 12) => GEO(`sp${r}_${ws}_${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const gCyl = (rt, rb, h, seg = 14, open = false) => GEO(`cy${rt}_${rb}_${h}_${seg}_${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open));
const gCone = (r, h, seg = 8) => GEO(`co${r}_${h}_${seg}`, () => new THREE.ConeGeometry(r, h, seg));
const gDome = (r, frac = 0.5) => GEO(`dm${r}_${frac}`, () => new THREE.SphereGeometry(r, 22, 12, 0, TAU, 0, Math.PI * frac));
const gTor = (r, t) => GEO(`to${r}_${t}`, () => new THREE.TorusGeometry(r, t, 8, 28));

function meshAt(parent, geo, mat, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
  if (o.s) m.scale.set(o.s[0], o.s[1], o.s[2]);
  m.castShadow = o.noShadow ? false : true; m.receiveShadow = true;
  parent.add(m); return m;
}

function buildSoldier(S, scale = 1) {
  const root = new THREE.Group(), rig = { root, legs: [], arms: [], mv: 0, aim: 0, dieT: 0 };
  root.scale.setScalar(scale);
  const alien = !!S.alien, fut = !!S.fut, wide = S.wide || 1, A = alien;
  const uniM = pm(S.uni, { fabric: !A, r: A ? 0.38 : 0.92, m: A ? 0.4 : 0, e: A ? 1.2 : 0.4 });
  const trsM = pm(S.trs || S.uni, { fabric: !A, r: A ? 0.38 : 0.92, m: A ? 0.4 : 0, e: A ? 1.2 : 0.4 });
  const skinM = pm(S.skin || [206, 160, 130], { r: 0.55, e: 0.3 });
  const gloveM = pm(S.glove || (fut ? [24, 26, 30] : [72, 58, 42]), { leather: true, r: 0.7 });
  const bootM = pm(S.boot || (fut ? [26, 28, 32] : [30, 22, 16]), { leather: true, r: 0.5 });
  const helmM = pm(S.helm || [90, 94, 90], { r: 0.5, m: 0.5, e: 1 });
  const vestM = S.vest ? pm(S.vest, { fabric: true, r: 0.8 }) : null;
  const plateM = S.plate ? pm(S.plate, { r: 0.3, m: 0.6, e: 1.3 }) : null;
  const glowM = S.glow ? pm(S.glow, { glow: S.glow, gi: 3.2, r: 0.2, m: 0.1 }) : null;
  const beltM = pm([40, 32, 24], { leather: true, r: 0.6 });
  const darkM = pm([22, 24, 24], { r: 0.6, m: 0.2 });

  const hipY = alien ? 1.02 : 0.93;
  const hips = new THREE.Group(); hips.position.y = hipY; root.add(hips); rig.hips = hips; rig.hipY = hipY;
  meshAt(hips, gRB(0.3 * wide, 0.18, 0.2, 0.05), trsM);
  for (const sd of [-1, 1]) {                                                    // legs
    const hip = new THREE.Group(); hip.position.set(sd * 0.095 * wide, 0, 0); hips.add(hip);
    const thL = alien ? 0.36 : 0.3, shL = alien ? 0.36 : 0.3;
    meshAt(hip, gCap(alien ? 0.06 : 0.078, thL), trsM, 0, -(thL + 0.15) / 2, 0);
    const knee = new THREE.Group(); knee.position.y = -(thL + 0.15); hip.add(knee);
    meshAt(knee, gCap(alien ? 0.045 : 0.06, shL), trsM, 0, -(shL + 0.12) / 2, 0);
    const footY = -(shL + 0.12) - 0.01;
    if (alien) { meshAt(knee, gRB(0.09, 0.05, 0.22, 0.02), plateM, 0, footY, 0.06); meshAt(knee, gCone(0.03, 0.12, 5), plateM, 0, footY, 0.2, { rx: Math.PI / 2 }); }
    else { meshAt(knee, gRB(0.11, 0.1, 0.27, 0.035), bootM, 0, footY + 0.01, 0.06); }
    if (fut || S.vest) meshAt(knee, gRB(0.1, 0.1, 0.05, 0.02), vestM || helmM, 0, 0.0, 0.065);
    rig.legs.push({ hip, knee, sd });
  }
  if (S.coat) { const cm = pm(S.uni, { fabric: true, r: 0.92, ds: true }); meshAt(hips, gCyl(0.19, 0.29, 0.55, 18, true), cm, 0, -0.23, 0); }

  const spine = new THREE.Group(); spine.position.y = 0.1; hips.add(spine); rig.spine = spine;
  if (alien) {
    meshAt(spine, gCap(0.12, 0.34), uniM, 0, 0.3, 0, { s: [wide * 1.05, 1, 0.8] });
    for (let i = 0; i < 4; i++) meshAt(spine, gRB((0.27 - i * 0.02) * wide, 0.018, 0.17, 0.008), plateM, 0, 0.2 + i * 0.09, 0.02);
    for (let i = 0; i < 5; i++) meshAt(spine, gCone(0.025, 0.1, 5), plateM, 0, 0.18 + i * 0.1, -0.13, { rx: -Math.PI / 2 - 0.4 });
    meshAt(spine, gRB(0.04, 0.3, 0.02, 0.01), glowM, 0, 0.36, 0.1, { noShadow: true });
  } else {
    meshAt(spine, gCap(0.155, 0.27), uniM, 0, 0.28, 0, { s: [1.2 * wide, 1, 0.8] });
    meshAt(spine, gRB(0.34 * wide, 0.06, 0.22, 0.02), beltM, 0, 0.07, 0);
    meshAt(spine, gRB(0.05, 0.04, 0.02, 0.005), pm([200, 170, 70], { m: 0.9, r: 0.3 }), 0, 0.07, 0.115);
    if (S.pouches) for (const x of [-0.11, 0.11, 0.0]) meshAt(spine, gRB(0.07, 0.09, 0.05, 0.015), pm([56, 46, 34], { leather: true }), x, 0.1, x === 0 ? -0.11 : 0.115);
    if (vestM) {
      meshAt(spine, gRB(0.3 * wide, 0.32, 0.07, 0.03), vestM, 0, 0.33, 0.115);
      meshAt(spine, gRB(0.3 * wide, 0.32, 0.07, 0.03), vestM, 0, 0.33, -0.115);
      for (const x of [-0.09, 0, 0.09]) meshAt(spine, gRB(0.065, 0.1, 0.04, 0.012), darkM, x, 0.24, 0.16);
      if (!fut) for (const sd of [-1, 1]) meshAt(spine, gRB(0.05, 0.12, 0.2, 0.015), vestM, sd * 0.15 * wide, 0.5, 0);
    }
    if (S.pack) {
      meshAt(spine, gRB(0.28 * wide, 0.34, 0.15, 0.04), vestM || pm([64, 60, 48], { fabric: true }), 0, 0.34, -0.2);
      if (!fut) meshAt(spine, gCyl(0.055, 0.055, 0.3, 12), pm([90, 80, 60], { fabric: true }), 0, 0.55, -0.2, { rz: Math.PI / 2 });
    }
    if (fut) {
      meshAt(spine, gRB(0.04, 0.2, 0.02, 0.008), glowM, 0, 0.4, 0.158, { noShadow: true });
      meshAt(spine, gRB(0.12, 0.012, 0.02, 0.004), glowM, 0, 0.5, -0.16, { noShadow: true });
    }
    if (S.head === "gas") {
      meshAt(spine, gCyl(0.045, 0.045, 0.11, 12), pm([48, 54, 46], { r: 0.5, m: 0.3 }), 0, 0.4, 0.17, { rx: Math.PI / 2 });
    }
  }
  const neckLen = alien ? 0.16 : 0.07;
  meshAt(spine, gCyl(0.05, 0.055, neckLen, 10), alien ? uniM : skinM, 0, 0.58 + neckLen * 0.2, 0);
  const head = new THREE.Group(); head.position.y = 0.66 + (alien ? 0.12 : 0); spine.add(head); rig.head = head;
  if (alien) {
    meshAt(head, gSph(0.12), uniM, 0, 0.04, 0.0, { s: [0.85, 1.28, 1.18] });
    for (const sd of [-1, 1]) {
      meshAt(head, gSph(0.034), glowM, sd * 0.058, 0.05, 0.115, { s: [1.7, 0.7, 0.5], rz: sd * -0.4, noShadow: true });
      meshAt(head, gCone(0.014, 0.12, 5), plateM, sd * 0.045, -0.12, 0.1, { rx: Math.PI, rz: sd * 0.3 });
      meshAt(head, gCyl(0.004, 0.004, 0.28, 4), plateM, sd * 0.05, 0.28, -0.04, { rx: -0.5 });
      meshAt(head, gSph(0.012), glowM, sd * 0.05, 0.4, -0.12, { noShadow: true });
    }
    meshAt(head, gRB(0.03, 0.14, 0.26, 0.012), plateM, 0, 0.2, -0.06, { rx: -0.25 });
  } else {
    const masked = S.head === "gas" || S.head === "visor";
    meshAt(head, gSph(0.105), skinM, 0, 0.02, 0, { s: [0.92, 1.08, 1.0] });
    for (const sd of [-1, 1]) meshAt(head, gSph(0.026), skinM, sd * 0.098, 0.01, 0, { s: [0.5, 1, 0.8] });
    if (!masked) {
      meshAt(head, gBox(0.026, 0.05, 0.03), skinM, 0, 0.0, 0.1);
      for (const sd of [-1, 1]) { meshAt(head, gSph(0.014), darkM, sd * 0.04, 0.04, 0.092, { noShadow: true }); meshAt(head, gBox(0.05, 0.008, 0.012), pm([50, 36, 24]), sd * 0.04, 0.062, 0.1, { noShadow: true }); }
      if (S.moustache) meshAt(head, gBox(0.07, 0.018, 0.02), pm([70, 44, 26]), 0, -0.03, 0.098, { noShadow: true });
      meshAt(head, gBox(0.045, 0.006, 0.01), pm([120, 60, 56]), 0, -0.055, 0.092, { noShadow: true });
    }
    const hk = S.head;
    if (hk === "stahl" || hk === "gas") {
      meshAt(head, gDome(0.13), helmM, 0, 0.04, -0.005, { s: [1, 0.92, 1.12] });
      meshAt(head, gTor(0.126, 0.011), helmM, 0, 0.038, -0.005, { rx: Math.PI / 2, s: [1, 1.12, 1] });
      meshAt(head, gCyl(0.118, 0.14, 0.055, 22, true), pm(S.helm || [90, 94, 90], { r: 0.5, m: 0.5, ds: true }), 0, 0.012, -0.03, { s: [1, 1, 1.15] });
      for (const sd of [-1, 1]) meshAt(head, gCyl(0.012, 0.012, 0.03, 8), darkM, sd * 0.125, 0.07, 0, { rz: Math.PI / 2 });
      meshAt(head, gBox(0.01, 0.1, 0.01), beltM, 0.095, -0.03, 0.03, { noShadow: true }); meshAt(head, gBox(0.01, 0.1, 0.01), beltM, -0.095, -0.03, 0.03, { noShadow: true });
    } else if (hk === "brodie") {
      meshAt(head, gDome(0.118, 0.45), helmM, 0, 0.05, 0, { s: [1, 0.72, 1.05] });
      meshAt(head, gCyl(0.175, 0.175, 0.012, 30), helmM, 0, 0.042, 0);
      meshAt(head, gBox(0.012, 0.09, 0.012), beltM, 0.09, -0.02, 0.03, { noShadow: true }); meshAt(head, gBox(0.012, 0.09, 0.012), beltM, -0.09, -0.02, 0.03, { noShadow: true });
    } else if (hk === "cap") {
      meshAt(head, gCyl(0.112, 0.118, 0.075, 22), helmM, 0, 0.075, 0);
      meshAt(head, gCyl(0.128, 0.126, 0.016, 22), helmM, 0, 0.118, 0.004, { s: [1, 1, 1.05] });
      meshAt(head, gCyl(0.121, 0.121, 0.02, 22), pm(S.armband || [170, 30, 30]), 0, 0.048, 0);
      meshAt(head, gBox(0.14, 0.008, 0.075), darkM, 0, 0.042, 0.115, { rx: 0.18 });
      meshAt(head, gCyl(0.013, 0.013, 0.006, 10), pm(S.accent || [200, 170, 60], { m: 0.9, r: 0.3 }), 0, 0.085, 0.118, { rx: Math.PI / 2 });
    } else if (hk === "visor") {
      meshAt(head, gRB(0.25, 0.2, 0.28, 0.08), helmM, 0, 0.045, -0.01);
      meshAt(head, gRB(0.18, 0.05, 0.03, 0.012), glowM, 0, 0.01, 0.133, { noShadow: true });
      meshAt(head, gRB(0.16, 0.07, 0.08, 0.025), vestM || darkM, 0, -0.055, 0.075);
      meshAt(head, gBox(0.04, 0.03, 0.07), darkM, 0, 0.16, 0.06);
      for (const sd of [-1, 1]) meshAt(head, gBox(0.012, 0.04, 0.16), darkM, sd * 0.126, 0.04, -0.01);
    }
    if (hk === "gas") {
      meshAt(head, gCap(0.042, 0.05), pm([30, 34, 30], { r: 0.45 }), 0, -0.035, 0.115, { rx: Math.PI / 2 });
      for (const sd of [-1, 1]) {
        meshAt(head, gCyl(0.031, 0.031, 0.02, 14), pm([12, 12, 12], { r: 0.04, m: 0.9, e: 1.6 }), sd * 0.042, 0.022, 0.108, { rx: Math.PI / 2 });
        meshAt(head, gTor(0.031, 0.006), pm([120, 120, 110], { m: 0.9, r: 0.4 }), sd * 0.042, 0.022, 0.116);
      }
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.045, 0.14), new THREE.Vector3(0, -0.12, 0.19), new THREE.Vector3(0, -0.24, 0.19), new THREE.Vector3(0, -0.29, 0.14)]);
      meshAt(head, GEO("hose", () => new THREE.TubeGeometry(curve, 16, 0.013, 8)), pm([26, 30, 24], { r: 0.6 }));
    }
  }
  for (const sd of [-1, 1]) {                                                    // arms
    const sh = new THREE.Group(), SP = new THREE.Vector3(sd * (0.2 * wide + (alien ? 0.02 : 0)), 0.5, 0); sh.position.copy(SP); spine.add(sh);
    const ua = alien ? 0.26 : 0.2, fa = alien ? 0.24 : 0.19;
    meshAt(sh, gCap(alien ? 0.04 : 0.052, ua), uniM, 0, -(ua + 0.1) / 2, 0);
    const el = new THREE.Group(); el.position.y = -(ua + 0.1); sh.add(el);
    meshAt(el, gCap(alien ? 0.034 : 0.044, fa), alien ? uniM : (fut ? pm(S.uni, { fabric: true }) : uniM), 0, -(fa + 0.088) / 2, 0);
    if (alien) { meshAt(el, gSph(0.05), plateM, 0, -(fa + 0.088), 0, { s: [0.9, 1.2, 0.9] }); for (let f = -1; f <= 1; f++) meshAt(el, gCone(0.01, 0.09, 4), plateM, f * 0.022, -(fa + 0.15), 0.01, { rx: 0.2 }); }
    else meshAt(el, gSph(0.05), gloveM, 0, -(fa + 0.088) , 0, { s: [0.95, 1.15, 1.0] });
    if (fut) { meshAt(sh, gSph(0.09, 14, 8), vestM || helmM, 0, 0.05, 0, { s: [1, 0.7, 1] }); meshAt(el, gRB(0.1, 0.12, 0.1, 0.03), vestM || helmM, 0, -0.08, 0); }
    else if (!alien) meshAt(sh, gRB(0.1, 0.012, 0.065, 0.004), S.accent ? pm(S.accent, { m: 0.8, r: 0.35 }) : pm([64, 64, 60]), 0, 0.05, 0);
    if (S.armband && sd === 1) meshAt(sh, gCyl(0.058, 0.058, 0.045, 14), pm(S.armband), 0, -0.1, 0);
    rig.arms.push({ sh, el, SP, sd, ua, fa });
  }
  const gun = buildGun(S.gun, false, S);
  gun.traverse(o => { if (o.isMesh) { o.castShadow = false; } });
  const wp = new THREE.Group(); wp.add(gun); spine.add(wp); rig.weapon = wp; rig.gun = gun;
  rig.muzzle = gun.userData.muzzle;
  return rig;
}

// ---------- 2-bone IK for arms ----------
const _S = new THREE.Vector3(), _T = new THREE.Vector3(), _D = new THREE.Vector3(), _P = new THREE.Vector3(), _E = new THREE.Vector3(), _U = new THREE.Vector3(), _F = new THREE.Vector3(), _Hd = new THREE.Vector3();
const _DOWN = new THREE.Vector3(0, -1, 0), _qi = new THREE.Quaternion();
function solveArm(arm, target) {
  const a = arm.ua + 0.1, b = arm.fa + 0.088 + 0.02;
  _S.copy(arm.SP); _D.copy(target).sub(_S);
  let dist = _D.length(); const maxd = a + b - 0.01; if (dist > maxd) { _D.multiplyScalar(maxd / dist); dist = maxd; }
  dist = Math.max(dist, 0.15); _D.normalize();
  const cosA = clamp((a * a + dist * dist - b * b) / (2 * a * dist), -1, 1), angA = Math.acos(cosA);
  _P.set(arm.sd * 0.8, -1, -0.35); _P.sub(_U.copy(_D).multiplyScalar(_P.dot(_D))).normalize();
  _E.copy(_S).addScaledVector(_D, Math.cos(angA) * a).addScaledVector(_P, Math.sin(angA) * a);
  _Hd.copy(_S).addScaledVector(_D, dist);
  _U.copy(_E).sub(_S).normalize();
  arm.sh.quaternion.setFromUnitVectors(_DOWN, _U);
  _qi.copy(arm.sh.quaternion).invert();
  _F.copy(_Hd).sub(_E).normalize().applyQuaternion(_qi);
  arm.el.quaternion.setFromUnitVectors(_DOWN, _F);
}

// ---------- pose / animate a soldier from its entity state ----------
const _gr = new THREE.Vector3(), _gl = new THREE.Vector3();
function poseSoldier(rig, o, dt, dead) {
  const root = rig.root;
  if (dead) { poseDead(rig, o, dt); return; }
  root.rotation.set(0, 0, 0); root.position.set(0, 0, 0);
  rig.mv = lerp(rig.mv, o.moving ? 1 : 0, Math.min(1, dt * 10));
  rig.aim = lerp(rig.aim, (o.aiming || o.fired > 0) ? 1 : 0, Math.min(1, dt * 12));
  const t = o.wk, mv = rig.mv;
  for (let i = 0; i < 2; i++) {
    const ph = t + (i ? Math.PI : 0), L = rig.legs[i];
    L.hip.rotation.x = -Math.sin(ph) * 0.62 * mv;
    L.knee.rotation.x = (0.06 + 0.9 * Math.max(0, Math.cos(ph))) * mv + 0.04;
    L.hip.rotation.z = 0;
  }
  rig.hips.position.y = rig.hipY - 0.015 + Math.abs(Math.sin(t)) * 0.035 * mv;
  const kick = o.fired > 0 ? o.fired / 0.15 : 0, flinch = o.pain > 0 ? Math.min(1, o.pain / 0.25) : 0;
  rig.spine.rotation.x = lerp(0.04, 0.1, rig.aim) * 1 + 0.06 * mv - kick * 0.09 - flinch * 0.28;
  rig.spine.rotation.y = Math.sin(t * 0.5) * 0.06 * mv;
  rig.head.rotation.x = -rig.spine.rotation.x * 0.7 + flinch * 0.2;
  const wp = rig.weapon, aim = rig.aim;
  wp.position.set(lerp(-0.13, -0.015, aim), lerp(0.2, 0.44, aim), lerp(0.22, 0.28, aim) - kick * 0.05);
  wp.rotation.set(lerp(0.5, -0.02, aim) - kick * 0.12, lerp(0.25, 0, aim), lerp(0.15, 0, aim));
  wp.updateMatrix();
  const g = rig.gun.userData;
  _gr.copy(g.gripR).applyMatrix4(wp.matrix); _gl.copy(g.gripL).applyMatrix4(wp.matrix);
  solveArm(rig.arms[0], _gr); solveArm(rig.arms[1], _gl);
}

// ---------- death animation ----------
const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _ax = new THREE.Vector3(), _c0 = new THREE.Vector3(), _eu = new THREE.Euler(), _eY = new THREE.Vector3(0, 1, 0), _eX = new THREE.Vector3(1, 0, 0);
const sm01 = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const DEATH_STYLES = {
  fall: { kneeT: 0.22, fallStart: 0.14, fallDur: 0.75, hipDrop: 0.1, kneeBend: 0.9, hipFwd: -0.5, arch: -0.32, stagger: 0.3 },     // staggers, then topples
  drop: { kneeT: 0.3, fallStart: 0.22, fallDur: 0.6, hipDrop: 0.42, kneeBend: 2.0, hipFwd: -1.2, arch: -0.1, stagger: 0.0 },        // legs give out, slumps
};
function poseDead(rig, c, dt) {
  const d = c.death; if (!d) return;
  const root = rig.root, sc = root.scale.x, legs = rig.legs, arms = rig.arms; d.t += dt; const t = d.t;
  let e1, e2; const S = d.style || DEATH_STYLES.fall;
  if (d.kind === "blast") {
    e1 = 1;
    if (d.air) {                                                                    // tumbling through the air
      _ax.set(d.sx, d.sy, d.sz); _qa.setFromAxisAngle(_ax, d.spin * dt); root.quaternion.premultiply(_qa);
      _c0.set(0, 0.9 * sc, 0); root.position.copy(_c0).sub(_c0.clone().applyQuaternion(root.quaternion)); e2 = 0.35;
      rig.hips.position.y = rig.hipY; rig.spine.rotation.x = -0.2;
    } else {                                                                        // land and settle
      if (!d.qLand) {
        d.qLand = root.quaternion.clone(); d.pLand = root.position.clone(); d.landT = 0;
        d.qLie = new THREE.Quaternion().setFromAxisAngle(_eX, d.faceUp ? -Math.PI / 2 : Math.PI / 2).premultiply(new THREE.Quaternion().setFromAxisAngle(_eY, d.yaw));
      }
      d.landT += dt; const k = sm01(d.landT / 0.5);
      root.quaternion.slerpQuaternions(d.qLand, d.qLie, k);
      root.position.lerpVectors(d.pLand, _c0.set(0, 0.13 * sc, 0), k);
      e2 = 0.35 + 0.65 * k; rig.hips.position.y = rig.hipY - 0.05 * k; rig.spine.rotation.x = -0.2 * (1 - k) + 0.15 * k;
    }
  } else {
    e1 = sm01(t / S.kneeT); e2 = sm01((t - S.fallStart) / S.fallDur);
    _ax.set(d.lpz, 0, -d.lpx); _qa.setFromAxisAngle(_ax, e2 * (Math.PI / 2 - 0.1)); _qb.setFromAxisAngle(_eY, d.twist * e2);
    root.quaternion.copy(_qa).multiply(_qb);
    const slide = (S.stagger * e1 + 0.7 * e2) * sc;
    root.position.set(d.lpx * slide, 0.12 * e2 * sc, d.lpz * slide);
    rig.spine.rotation.x = S.arch * e1 * (1 - e2) + 0.3 * e2;
    rig.hips.position.y = rig.hipY - S.hipDrop * e1 - 0.05 * e2;
  }
  const flail = Math.sin(t * 16) * 0.3 * Math.exp(-t * 3.2);
  for (let i = 0; i < 2; i++) {
    const L = legs[i], A = arms[i];
    L.hip.rotation.set(S.hipFwd * e1 * (1 - e2 * 0.5) + (i ? 0.3 : -0.2) * e2, 0, L.sd * 0.32 * e2);
    L.knee.rotation.x = S.kneeBend * e1 * (1 - e2 * 0.6) + 0.15 * e2;
    A.sh.quaternion.setFromEuler(_eu.set(-1.0 * e1 * (1 - e2) + 0.3 * e2 + flail, 0, A.sd * (0.35 * e1 + 0.95 * e2) + flail * A.sd));
    A.el.quaternion.setFromEuler(_eu.set(-0.9 * (1 - e2) * e1 - 0.1, 0, A.sd * 0.2 * e2));
  }
  rig.head.rotation.set(-0.45 * e1 * (1 - e2) + 0.3 * e2, 0, d.headRoll * e2);
  rig.weapon.visible = !d.gunDropped;
}
