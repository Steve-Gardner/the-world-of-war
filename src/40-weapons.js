// ===================== weapon models + first-person viewmodels =====================
function buildGun(kind, detail, S = {}) {
  const g = new THREE.Group(); g.userData = {};
  const add = (geo, mat, x, y, z, o) => meshAt(g, geo, mat, x, y, z, o);
  const E = 1.4;
  const blued = pm([30, 32, 36], { m: 0.85, r: 0.38, e: E }), steel = pm([92, 94, 98], { m: 0.9, r: 0.3, e: E });
  const poly = pm([24, 26, 28], { r: 0.55, m: 0.15 }), wood = pm([112, 72, 40], { leather: true, r: 0.5 }), brass = pm([205, 165, 70], { m: 0.95, r: 0.28, e: E });
  const white = pm([226, 222, 236], { r: 0.32, m: 0.4, e: E });
  const gc = S.glow || (kind === "rail" || kind === "blaster" ? [210, 120, 255] : [60, 220, 255]);
  const glow = pm(gc, { glow: gc, gi: 3.4, r: 0.2 });
  const cyl = (r, len, mat, x, y, z) => add(gCyl(r, r, len, 12), mat, x, y, z, { rx: Math.PI / 2 });
  const grip = (r, l) => { g.userData.gripR = new THREE.Vector3(...r); g.userData.gripL = new THREE.Vector3(...l); };
  const muz = z => { const m = new THREE.Object3D(); m.position.set(0, kind === "luger" || kind === "sidearm" ? 0.03 : 0.025, z); g.add(m); g.userData.muzzle = m; };
  switch (kind) {
    case "enfield":
      add(gRB(0.04, 0.06, 0.16, 0.01), blued, 0, 0.02, 0.02);
      add(gRB(0.045, 0.085, 0.42, 0.02), wood, 0, -0.03, -0.3, { rx: -0.08 });
      add(gRB(0.04, 0.07, 0.14, 0.015), wood, 0, -0.025, -0.07);
      add(gRB(0.042, 0.05, 0.5, 0.015), wood, 0, 0.0, 0.42);
      cyl(0.0105, 0.78, steel, 0, 0.022, 0.56);
      cyl(0.016, 0.014, steel, 0, 0.022, 0.46); cyl(0.016, 0.014, steel, 0, 0.022, 0.72);
      add(gBox(0.006, 0.02, 0.006), steel, 0, 0.046, 0.95); add(gBox(0.022, 0.014, 0.01), steel, 0, 0.06, 0.12);
      cyl(0.006, 0.05, steel, -0.034, 0.02, -0.01).rotation.set(0, 0, Math.PI / 2); add(gSph(0.011), steel, -0.06, 0.02, -0.01);
      add(gRB(0.032, 0.06, 0.08, 0.008), blued, 0, -0.055, 0.03);
      add(gBox(0.008, 0.02, 0.07), steel, 0, -0.05, -0.04);
      grip([0, -0.045, -0.07], [0, -0.03, 0.46]); muz(0.95); break;
    case "luger":
      add(gRB(0.026, 0.05, 0.14, 0.01), blued, 0, 0, 0.03);
      cyl(0.007, 0.14, steel, 0, 0.022, 0.15);
      add(gRB(0.02, 0.03, 0.07, 0.008), steel, 0, 0.03, -0.03);
      add(gRB(0.026, 0.11, 0.05, 0.01), wood, 0, -0.075, -0.02, { rx: 0.25 });
      add(gBox(0.006, 0.02, 0.05), steel, 0, -0.035, 0.03);
      grip([0, -0.065, -0.02], [0.014, -0.08, -0.005]); muz(0.21); break;
    case "ar": {
      add(gRB(0.045, 0.09, 0.2, 0.012), poly, 0, -0.02, 0);
      add(gRB(0.05, 0.065, 0.32, 0.012), blued, 0, 0.04, 0.06);
      add(gRB(0.058, 0.062, 0.3, 0.02), poly, 0, 0.03, 0.34);
      add(gBox(0.025, 0.012, 0.3), steel, 0, 0.068, 0.34);
      for (const sd of [-1, 1]) add(gBox(0.004, 0.01, 0.2), glow, sd * 0.03, 0.03, 0.34, { noShadow: true });
      cyl(0.0095, 0.16, steel, 0, 0.03, 0.57); cyl(0.0145, 0.06, blued, 0, 0.03, 0.69);
      add(gRB(0.03, 0.14, 0.065, 0.008), poly, 0, -0.12, 0.04, { rx: 0.18 });
      add(gRB(0.032, 0.1, 0.045, 0.01), poly, 0, -0.085, -0.08, { rx: 0.35 });
      add(gRB(0.04, 0.075, 0.22, 0.014), poly, 0, 0.0, -0.27); cyl(0.02, 0.2, blued, 0, 0.03, -0.2);
      add(gBox(0.03, 0.02, 0.07), blued, 0, 0.082, 0.08); cyl(0.022, 0.1, blued, 0, 0.115, 0.08);
      add(gCyl(0.019, 0.019, 0.004, 14), pm([255, 40, 40], { glow: [255, 40, 40], gi: 3 }), 0, 0.115, 0.132, { rx: Math.PI / 2, noShadow: true });
      add(gRB(0.025, 0.07, 0.03, 0.01), poly, 0, -0.04, 0.33);
      grip([0, -0.09, -0.075], [0, -0.045, 0.34]); muz(0.73); break;
    }
    case "sidearm":
      add(gRB(0.032, 0.042, 0.2, 0.01), blued, 0, 0.03, 0.04);
      add(gRB(0.03, 0.04, 0.18, 0.01), poly, 0, -0.005, 0.03);
      add(gRB(0.032, 0.11, 0.055, 0.012), poly, 0, -0.075, -0.03, { rx: 0.18 });
      cyl(0.008, 0.03, steel, 0, 0.03, 0.16);
      for (const sd of [-1, 1]) add(gBox(0.004, 0.01, 0.12), glow, sd * 0.017, 0.03, 0.04, { noShadow: true });
      grip([0, -0.07, -0.03], [0.014, -0.085, -0.02]); muz(0.18); break;
    case "rail":
      add(gRB(0.06, 0.1, 0.4, 0.03), white, 0, 0, 0);
      for (const sd of [-1, 1]) add(gRB(0.012, 0.022, 0.6, 0.005), brass, sd * 0.018, 0.03, 0.5);
      cyl(0.006, 0.55, glow, 0, 0.03, 0.5);
      for (let i = 0; i < 4; i++) add(gTor(0.03, 0.007), brass, 0, 0.03, 0.35 + i * 0.12);
      for (let i = 0; i < 4; i++) add(gTor(0.0305, 0.003), glow, 0, 0.03, 0.35 + i * 0.12 + 0.012, { noShadow: true });
      add(gRB(0.035, 0.1, 0.05, 0.015), poly, 0, -0.09, -0.1, { rx: 0.3 });
      add(gRB(0.05, 0.09, 0.2, 0.02), white, 0, -0.01, -0.28); add(gBox(0.006, 0.05, 0.15), glow, 0.032, 0.02, 0.05, { noShadow: true });
      add(gRB(0.03, 0.045, 0.1, 0.012), brass, 0, 0.065, 0.1);
      grip([0, -0.09, -0.1], [0, -0.045, 0.3]); muz(0.83); break;
    case "blaster":
      add(gRB(0.04, 0.07, 0.2, 0.02), white, 0, 0.01, 0.05);
      cyl(0.013, 0.1, brass, 0, 0.015, 0.2); cyl(0.006, 0.18, glow, 0, 0.015, 0.14);
      add(gRB(0.034, 0.1, 0.05, 0.015), poly, 0, -0.07, -0.02, { rx: 0.2 });
      add(gBox(0.042, 0.01, 0.12), brass, 0, 0.048, 0.06);
      grip([0, -0.07, -0.02], [0.014, -0.085, -0.01]); muz(0.27); break;
    case "alienrifle": {
      const body = pm(S.uni || [70, 50, 100], { r: 0.35, m: 0.4, e: 1.3 }), plate = pm(S.plate || [110, 80, 150], { r: 0.3, m: 0.6, e: 1.3 });
      add(gCap(0.036, 0.4), body, 0, 0, 0.2, { rx: Math.PI / 2 });
      add(gSph(0.05), glow, 0, 0.02, 0.32, { noShadow: true });
      for (let i = 0; i < 3; i++) add(gCone(0.012, 0.07, 5), plate, 0, 0.045, 0.1 + i * 0.12, { rx: -0.2 });
      add(gCap(0.026, 0.2), body, 0, -0.02, -0.2, { rx: Math.PI / 2 });
      add(gCone(0.02, 0.14, 6), plate, 0, 0.0, 0.55, { rx: Math.PI / 2 });
      grip([0, -0.06, -0.04], [0, -0.03, 0.32]); muz(0.6); break;
    }
    default: {
      const body = pm(S.uni || [120, 60, 150], { r: 0.35, m: 0.4, e: 1.3 });
      add(gCap(0.03, 0.14), body, 0, 0, 0.08, { rx: Math.PI / 2 });
      add(gSph(0.04), glow, 0, 0.02, 0.14, { noShadow: true });
      grip([0, -0.04, -0.01], [0.012, -0.05, 0.0]); muz(0.2);
    }
  }
  return g;
}

function buildKnife(kind) {
  const g = new THREE.Group(); g.userData = {};
  const wood = pm([100, 66, 36], { leather: true, r: 0.5 }), brass = pm([205, 165, 70], { m: 0.95, r: 0.28, e: 1.4 }), dark = pm([20, 22, 24], { r: 0.5, m: 0.4 });
  const steel = pm([200, 204, 210], { m: 0.95, r: 0.18, e: 1.8 });
  const col = kind === "void" ? [210, 120, 255] : [60, 220, 255];
  const glow = pm(col, { glow: col, gi: 3.2, r: 0.15 });
  const sh = new THREE.Shape();
  sh.moveTo(0, -0.018); sh.lineTo(0.2, -0.02); sh.lineTo(0.3, -0.004); sh.lineTo(0.31, 0.0); sh.lineTo(0.2, 0.022); sh.lineTo(0, 0.02); sh.closePath();
  const bg = new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1 });
  bg.rotateY(-Math.PI / 2); bg.translate(0, 0, 0.0); bg.center(); bg.translate(0, 0, 0.18);
  const bladeMat = kind === "trench" ? steel : kind === "combat" ? pm([34, 36, 40], { m: 0.9, r: 0.3, e: 1.4 }) : glow;
  meshAt(g, bg, bladeMat, 0, 0.0, 0, { noShadow: true });
  if (kind === "combat") { const eg = bg.clone(); meshAt(g, eg, glow, 0, 0.002, 0.0, { s: [1.02, 1.0, 1.0], noShadow: true }).scale.set(0.35, 1.05, 1.01); }
  meshAt(g, gRB(0.02, 0.06, 0.03, 0.006), kind === "trench" ? brass : dark, 0, 0, 0.01);                       // guard
  if (kind === "trench") { const tor = meshAt(g, gTor(0.05, 0.007), brass, 0, -0.03, -0.06, { ry: Math.PI / 2 }); tor.scale.set(1, 1, 1); }
  meshAt(g, gCyl(0.017, 0.015, 0.13, 10), kind === "trench" ? wood : dark, 0, 0, -0.065, { rx: Math.PI / 2 });
  if (kind !== "trench") for (let i = 0; i < 4; i++) meshAt(g, gTor(0.0165, 0.002), glow, 0, 0, -0.03 - i * 0.03, { noShadow: true });
  g.userData.gripR = new THREE.Vector3(0, 0, -0.06); g.userData.gripL = new THREE.Vector3(0, -0.2, -0.2);
  const m = new THREE.Object3D(); m.position.set(0, 0, 0.3); g.add(m); g.userData.muzzle = m; g.userData.melee = true;
  return g;
}

// ---------- viewmodels ----------
const VMS = {};          // theme key -> {primary, pistol, knife} each {holder, gun, muzzle, base, ads}
const flashTex = (() => {
  const [c, g] = mk(128, 128);
  const rg = g.createRadialGradient(64, 64, 2, 64, 64, 62); rg.addColorStop(0, "rgba(255,255,255,1)"); rg.addColorStop(0.25, "rgba(255,255,255,0.85)"); rg.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  g.translate(64, 64);
  for (let i = 0; i < 7; i++) { g.rotate(Math.PI * 2 / 7 + Math.random() * 0.3); g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.moveTo(0, -3); g.lineTo(60, 0); g.lineTo(0, 3); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
function makeFlash(color, size) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false }));
  m.scale.set(size, size, 1); m.visible = false; return m;
}
function vmArm(holder, side, hand, T, gloveCol, sleeveMat, long) {
  const ua = long ? 0.36 : 0.3, fa = long ? 0.34 : 0.28;
  const sh = new THREE.Group(), SP = new THREE.Vector3(side * 0.2, -0.36, -0.7); holder.add(sh);
  meshAt(sh, gCap(0.062, ua), sleeveMat, 0, -(ua + 0.124) / 2, 0, { noShadow: true });
  const el = new THREE.Group(); el.position.y = -(ua + 0.124); sh.add(el);
  meshAt(el, gCap(0.052, fa), sleeveMat, 0, -(fa + 0.104) / 2, 0, { noShadow: true });
  const gm = pm(gloveCol, { leather: true, r: 0.65 });
  meshAt(el, gSph(0.062), gm, 0, -(fa + 0.104) + 0.0, 0, { s: [1.0, 1.25, 1.1], noShadow: true });
  const arm = { sh, el, SP, sd: side > 0 ? 1 : -1, ua: ua + 0.024, fa: fa - 0.004 };   // solveArm uses a = ua+0.1, b = fa+0.108
  arm.sh.position.copy(SP);
  solveArm(arm, hand);
  return arm;
}
function buildViewModels(T) {
  if (VMS[T.key]) return VMS[T.key];
  const out = {};
  const sleeve = T.key === "ww1" ? pm([140, 124, 86], { fabric: true, r: 0.95 }) : T.key === "ww3" ? pm([30, 38, 52], { fabric: true, r: 0.8 }) : pm([226, 222, 236], { r: 0.35, m: 0.5, e: 1.3 });
  const gloveC = T.key === "ww1" ? [76, 60, 44] : [22, 24, 28];
  const ally = T.soldiers.rifle;
  for (const slot of ["primary", "pistol", "knife"]) {
    const kind = T.models[slot], holder = new THREE.Group();
    const gun = slot === "knife" ? buildKnife(kind) : buildGun(kind, true, { glow: T.key === "ww10" ? [210, 120, 255] : T.key === "ww3" ? [60, 220, 255] : undefined });
    gun.traverse(o => { if (o.isMesh) o.castShadow = false; });
    holder.add(gun);
    const arms = [];
    arms.push(vmArm(holder, -1, gun.userData.gripR, T, gloveC, sleeve, true));
    if (slot !== "knife") arms.push(vmArm(holder, 1, gun.userData.gripL, T, gloveC, sleeve, true));
    const flash = makeFlash(T.flashCol, slot === "pistol" ? 0.34 : 0.5); flash.position.copy(gun.userData.muzzle.position); holder.add(flash);
    const base = slot === "primary" ? new THREE.Vector3(0.17, -0.2, -0.38) : slot === "pistol" ? new THREE.Vector3(0.15, -0.17, -0.45) : new THREE.Vector3(0.19, -0.2, -0.42);
    const ads = slot === "knife" ? base.clone() : slot === "primary" ? new THREE.Vector3(0, -0.138, -0.28) : new THREE.Vector3(0, -0.108, -0.34);
    out[slot] = { holder, gun, flash, base, ads, muzzle: gun.userData.muzzle };
    holder.visible = false;
    holder.rotation.y = Math.PI;
    gunScene.add(holder);
  }
  VMS[T.key] = out; return out;
}
