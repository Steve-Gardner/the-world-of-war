// ===================== WWI battlefields + shooting range =====================
// Each map has a layout generator (gen), an optional terrain shaper (mapH) and a look that is laid over the WWI theme.
const newMap = () => Array.from({ length: MH }, (_, y) => Array.from({ length: MW }, (_, x) => (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) ? 3 : 0));
const mset = (m, x, y, v) => { if (x > 0 && y > 0 && x < MW - 1 && y < MH - 1) m[y][x] = v; };
const mrect = (m, x0, y0, w, h, v) => { for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) mset(m, x, y, v); };
function mshell(m, x0, y0, w, h, v, gap, doors) {                      // hollow building; gap = chance a wall cell is missing (ruin)
  for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) {
    const edge = x === x0 || y === y0 || x === x0 + w - 1 || y === y0 + h - 1;
    if (edge && Math.random() >= gap) mset(m, x, y, v);
  }
  for (let i = 0; i < doors; i++) { const side = R(0, 3); if (side < 2) mset(m, x0 + R(1, w - 2), side ? y0 + h - 1 : y0, 0); else mset(m, side === 2 ? x0 : x0 + w - 1, y0 + R(1, h - 2), 0); }
}
function clearSpawns(m) { for (const [sx, sy] of SPAWNS) for (let dx = -4; dx <= 4; dx++) for (let dy = -4; dy <= 4; dy++) mset(m, Math.floor(sx) + dx, Math.floor(sy) + dy, 0); return m; }
const WW1G = THEMES.ww1.grade, gradeOf = o => Object.assign({}, WW1G, o);

function genVerdun() {                                                  // shattered fort town, rubble and craters
  const m = newMap();
  for (let i = 0; i < 34; i++) { const w = R(5, 9), h = R(5, 8); mshell(m, R(3, MW - w - 4), R(3, MH - h - 4), w, h, 2, 0.4, 2); }
  mshell(m, 29, 29, 22, 22, 3, 0.16, 4); mshell(m, 33, 33, 14, 14, 3, 0.4, 3);
  for (let i = 0; i < 16; i++) { const horiz = Math.random() < 0.5, len = R(6, 16), x0 = R(3, MW - 20), y0 = R(3, MH - 20); for (let k = 0; k < len; k++) { if (k % 5 === 4) continue; mset(m, horiz ? x0 + k : x0, horiz ? y0 : y0 + k, 2); } }
  for (let i = 0; i < 150; i++) { const x = R(3, MW - 4), y = R(3, MH - 4); for (let k = R(1, 3); k > 0; k--) mset(m, x + R(-1, 1), y + R(-1, 1), 3); }
  return clearSpawns(m);
}
const TRENCHES = [20, 60];
function genSomme() {                                                   // two trench lines facing each other across no man's land
  const m = newMap();
  for (const yc of TRENCHES) {
    for (let x = 3; x < MW - 3; x++) { if (x % 11 >= 8) continue; mset(m, x, yc - 2, 1); mset(m, x, yc + 2, 1); }
    for (let x = 10, k = 0; x < MW - 4; x += 14, k++) { mset(m, x, yc - 1, 1); mset(m, x, k % 2 ? yc : yc + 1, 1); }   // zig-zag traverses
    for (let i = 0; i < 4; i++) { const sgn = yc < 40 ? -1 : 1; mshell(m, R(6, MW - 14), yc + sgn * 8 + (sgn < 0 ? -2 : 0), R(4, 6), 4, 2, 0.15, 1); }
  }
  for (let i = 0; i < 50; i++) mset(m, R(3, MW - 4), R(28, 52), Math.random() < 0.6 ? 3 : 1);
  return clearSpawns(m);
}
function genGallipoli() {                                               // beach landing, dunes, cliff gullies, Turkish trenches
  const m = newMap();
  for (let i = 0; i < 26; i++) { const x = R(3, 14), y = R(3, MH - 5); mrect(m, x, y, Math.random() < 0.5 ? 2 : 1, Math.random() < 0.5 ? 2 : 1, 2); }
  for (let i = 0; i < 6; i++) { const y = R(6, MH - 14), x = R(15, 26); for (let k = 0; k < 7; k++) mset(m, x, y + k, 1); for (let k = 0; k < 3; k++) { mset(m, x + k + 1, y, 1); mset(m, x + k + 1, y + 6, 1); } }
  for (let y = 3; y < MH - 3; y += R(10, 14)) mrect(m, 30, y, 3, R(7, 11), 3);
  for (let y = 3; y < MH - 3;) { const len = R(10, 15); mrect(m, 46, y, 5, len, 3); y += len + R(3, 4); }
  for (const xc of [58, 66]) { for (let y = 3; y < MH - 3; y++) { if (y % 12 >= 9) continue; mset(m, xc - 2, y, 1); mset(m, xc + 2, y, 1); } }
  mshell(m, 68, 30, 9, 20, 2, 0.1, 3);
  return clearSpawns(m);
}
function genYpres() {                                                   // ruined cloth hall and flooded streets at night
  const m = newMap();
  for (let x = 16; x < 64; x++) { if (x % 8 >= 6) continue; mset(m, x, 26, 2); mset(m, x, 27, 2); }
  mshell(m, 36, 20, 8, 8, 2, 0.12, 2); mshell(m, 16, 22, 5, 5, 2, 0.2, 2); mshell(m, 59, 22, 5, 5, 2, 0.2, 2);
  for (let i = 0; i < 30; i++) { const w = R(5, 8), h = R(5, 7); mshell(m, R(3, MW - w - 4), R(3, MH - h - 4), w, h, Math.random() < 0.75 ? 2 : 1, 0.3, 2); }
  for (let i = 0; i < 12; i++) { const horiz = Math.random() < 0.5, len = R(6, 14), x0 = R(3, MW - 18), y0 = R(3, MH - 18); for (let k = 0; k < len; k++) { if (k % 5 === 4) continue; mset(m, horiz ? x0 + k : x0, horiz ? y0 : y0 + k, 1); } }
  for (let i = 0; i < 110; i++) { const x = R(3, MW - 4), y = R(3, MH - 4); for (let k = R(1, 3); k > 0; k--) mset(m, x + R(-1, 1), y + R(-1, 1), 3); }
  return clearSpawns(m);
}

// ---------- shooting range layout: open lanes, side berms, firing line at the west end ----------
const RANGE_D = [25, 50, 75, 100], RANGE_SPREAD = [3, 4.5, 6, 7.5];
const RANGE_KINDS = [["paper", "gong", "pop"], ["pop", "paper", "gong"], ["gong", "pop", "paper"], ["paper", "pop", "gong"]];
const RANGE_X0 = 10.5, RANGE_Y0 = 40.5;
function genRangeMap() {
  const m = newMap();
  mrect(m, 12, 24, 66, 1, 3); mrect(m, 12, 57, 66, 1, 3);               // berms along both sides
  for (const y of [32, 37, 44, 49]) mset(m, 11, y, 2);                  // booth posts at the firing line
  return m;
}

// ---------- map table ----------
const SKY_DUSK = [0.2, 0.26, 0.42];
const MAPS = {
  front: { name: "WESTERN FRONT", note: "The classic trench maze. Mud, wire and walls everywhere.", gen: () => genMap() },
  verdun: {
    name: "VERDUN", note: "1916 — A shattered fort town. Rubble, ruins and endless craters.", gen: genVerdun,
    look: { fog: [122, 110, 96], fogDensity: 0.016, exposure: 1.35, sun: { color: [255, 205, 150], intensity: 2.4, u: 0.35, elev: 20 }, hemi: { sky: [130, 126, 124], ground: [70, 58, 46], intensity: 1.3 },
      grade: gradeOf({ sat: 0.62, vig: 0.75 }), tone: [0.8, 0.76, 0.72], skyTint: [0.86, 0.82, 0.8], craters: 34, craterR: 1.2, extra: g => deadTrees(g, 90) },
  },
  somme: {
    name: "THE SOMME", note: "1916 — Two trench lines and a cratered no man's land between them.", gen: genSomme,
    look: { fog: [168, 150, 120], fogDensity: 0.012, exposure: 1.4, sun: { color: [255, 236, 200], intensity: 3.2, u: 0.6, elev: 38 }, tone: [0.9, 0.82, 0.7], craters: 42, craterR: 1.15,
      mapH: (sx, sz) => { let h = 0; const cz = sz / CELL, cx = sx / CELL; if (cx > 2 && cx < MW - 2) for (const yc of TRENCHES) h -= 0.75 * clamp((3.4 - Math.abs(cz - yc)) / 1.6, 0, 1); return h; },
      extra: g => { barbedWire(g, 70); deadTrees(g, 14); } },
  },
  gallipoli: {
    name: "GALLIPOLI", note: "1915 — Land on the beach, push up the dunes and storm the cliffs.", gen: genGallipoli,
    look: { fog: [214, 196, 160], fogDensity: 0.006, exposure: 1.75, sun: { color: [255, 244, 214], intensity: 4.2, u: 0.25, elev: 52 }, hemi: { sky: [170, 190, 215], ground: [150, 128, 90], intensity: 1.7 },
      grade: gradeOf({ sat: 0.95, gain: [1.08, 1.02, 0.9] }), tone: [1.9, 1.7, 1.2], skyTint: [1.1, 1.15, 1.3], craters: 8,
      mapH: (sx, sz) => { const cx = sx / CELL; return -0.9 * clamp((8 - cx) / 6, 0, 1) + 0.4 * Math.sin(sz * 0.07 + sx * 0.045) * clamp((cx - 10) / 10, 0, 1); },
      extra: (g, own) => {
        const wm = own(new THREE.MeshStandardMaterial({ color: 0x3b8fa6, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.78, envMapIntensity: 1.5 }));
        const wg = own(new THREE.PlaneGeometry(8 * CELL, MH * CELL)); wg.rotateX(-Math.PI / 2);
        const w = new THREE.Mesh(wg, wm); w.position.set(4 * CELL, -0.3, MH * CELL / 2); g.add(w);
      } },
  },
  ypres: {
    name: "YPRES", note: "1917 — Night in a ruined, flooded town. Fog, moonlight and mud.", gen: genYpres,
    look: { fog: [24, 30, 42], fogDensity: 0.02, exposure: 2.3, sun: { color: [150, 175, 230], intensity: 1.8, u: 0.7, elev: 35 }, hemi: { sky: [50, 66, 100], ground: [30, 34, 44], intensity: 1.3 },
      bloom: { s: 0.4, r: 0.8, t: 0.85 }, grade: gradeOf({ sat: 0.55, vig: 0.95, gain: [0.9, 0.98, 1.1] }), tone: [0.7, 0.75, 0.9], skyTint: SKY_DUSK, noEnv: true, craters: 44, craterR: 1.3, extra: g => deadTrees(g, 40) },
  },
  range: {
    name: "SHOOTING RANGE", note: "Practice with every weapon. Paper targets, steel gongs and pop-up soldiers at 25 to 100 m.", gen: genRangeMap,
    look: { fog: [190, 205, 215], fogDensity: 0.0035, exposure: 1.45, sun: { color: [255, 244, 220], intensity: 3.8, u: 0.2, elev: 46 }, hemi: { sky: [170, 190, 215], ground: [110, 100, 80], intensity: 1.6 },
      tone: [0.9, 1.05, 0.75], skyTint: [0.95, 1, 1.1], craters: 0, noProps: true },
  },
  challenge: {
    name: "RANGE CHALLENGE", note: "60 seconds. Hit the target with the green marker, then the next one lights up. Farther is worth more.", gen: genRangeMap,
    look: null,   // shares the range look (filled in below)
  },
};
MAPS.challenge.look = MAPS.range.look;
const MAP_ORDER = ["front", "verdun", "somme", "gallipoli", "ypres", "range", "challenge"];
let mapKey = "front";
try { const k = localStorage.getItem("wow_map"); if (MAPS[k]) mapKey = k; } catch (e) {}
const isRange = () => !story && mapKey === "range" || mapKey === "challenge";           // the range exists in every era
const curMap = () => (story ? MAPS[STORY[story.lv].map] : themeKey === "ww1" || isRange() ? MAPS[mapKey] : MAPS.front);
const lookFor = T => (tut ? {} : isRange() ? (T.key === "ww1" ? MAPS.range.look : { craters: 0, noProps: true }) : T.key === "ww1" && curMap().look) || {};
let mapH = null;                                                         // terrain shaper for the current map (read by groundH)
let range = null;                                                        // shooting-range state (null when not on the range)
let rangeT = [];                                                         // range targets

// ---------- map props ----------
function instScatter(group, geo, mat, count, pick, place, shadow = true) {
  const im = new THREE.InstancedMesh(geo, mat, count), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  let n = 0;
  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, ok = false;
    for (let t = 0; t < 40 && !ok; t++) { [x, y] = pick(); ok = !solid(x, y) && !SPAWNS.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 4); }
    if (!ok) continue;
    const sx = x * CELL, sz = y * CELL; s.set(1, 1, 1); e.set(0, 0, 0); place(sx, sz, groundH(sx, sz), p, e, s);
    q.setFromEuler(e); m.compose(p, q, s); im.setMatrixAt(n++, m);
  }
  im.count = n; im.castShadow = shadow; im.receiveShadow = true; im.frustumCulled = false; group.add(im); return im;
}
let _treeGeo = null, _wireGeo = null;
function deadTrees(group, count) {
  if (!_treeGeo) {
    const mt = (g, x, y, z, rx, ry, rz) => { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(1, 1, 1))); return g; };
    _treeGeo = mergeGeometries([mt(new THREE.CylinderGeometry(0.1, 0.2, 4.4, 7), 0, 2.2, 0, 0, 0, 0), mt(new THREE.BoxGeometry(0.08, 1.6, 0.08), 0.5, 3.2, 0, 0, 0, -0.9), mt(new THREE.BoxGeometry(0.07, 1.3, 0.07), -0.4, 3.6, 0.2, 0.3, 0, 0.8), mt(new THREE.BoxGeometry(0.06, 1.0, 0.06), 0.1, 4.2, -0.3, -0.7, 0, 0.3)]);
  }
  const mat = new THREE.MeshStandardMaterial({ color: 0x2c2218, roughness: 0.95, flatShading: true });
  instScatter(group, _treeGeo, mat, count, () => [3 + Math.random() * (MW - 6), 3 + Math.random() * (MH - 6)], (x, z, h, p, e, s) => { const k = 0.7 + Math.random() * 0.7; p.set(x, h, z); e.set((Math.random() - 0.5) * 0.15, Math.random() * 6, (Math.random() - 0.5) * 0.15); s.set(k, k * (0.55 + Math.random() * 0.6), k); });
}
function barbedWire(group, count) {
  if (!_wireGeo) {
    const mt = (g, x, y, z) => { g.translate(x, y, z); return g; };
    _wireGeo = mergeGeometries([mt(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 6), -1.3, 0.65, 0), mt(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 6), 1.3, 0.65, 0), mt(new THREE.BoxGeometry(2.7, 0.025, 0.025), 0, 0.5, 0), mt(new THREE.BoxGeometry(2.7, 0.025, 0.025), 0, 0.85, 0), mt(new THREE.BoxGeometry(2.7, 0.025, 0.025), 0, 1.15, 0)]);
  }
  const mat = new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 0.6, metalness: 0.6 });
  instScatter(group, _wireGeo, mat, count, () => [4 + Math.random() * (MW - 8), 28 + Math.random() * 24], (x, z, h, p, e, s) => { p.set(x, h, z); e.set(0, Math.random() < 0.5 ? 0 : Math.PI / 2 + (Math.random() - 0.5) * 0.4, 0); });
}

// ===================== shooting range =====================
const RT = {};
const NEG_X = new THREE.Vector3(-1, 0, 0);
function rtInit() {
  if (RT.ok) return; RT.ok = true;
  const tex = (w, h, fn) => { const [c, g] = mk(w, h); fn(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  RT.paperTex = tex(256, 256, (g, w) => {
    g.fillStyle = "#e9e1c6"; g.fillRect(0, 0, w, w);
    const ppr = w / 2 / 10;                                              // pixels per scoring ring
    g.fillStyle = "#16130e"; g.beginPath(); g.arc(w / 2, w / 2, ppr * 5, 0, TAU); g.fill();
    for (let i = 1; i <= 10; i++) { g.strokeStyle = i <= 5 ? "#e9e1c6" : "#16130e"; g.lineWidth = 2; g.beginPath(); g.arc(w / 2, w / 2, ppr * i, 0, TAU); g.stroke(); }
    g.fillStyle = "#e9e1c6"; g.beginPath(); g.arc(w / 2, w / 2, 3, 0, TAU); g.fill();
    g.strokeStyle = "#8a7a50"; g.lineWidth = 6; g.strokeRect(0, 0, w, w);
  });
  RT.popTex = tex(128, 256, (g, w, h) => {
    g.fillStyle = "#6f6244"; g.strokeStyle = "#1c170e"; g.lineWidth = 5;
    g.beginPath(); g.roundRect(12, 52, w - 24, h - 58, 14); g.fill(); g.stroke();
    g.beginPath(); g.arc(w / 2, 26, 19, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#4a4a3a"; g.beginPath(); g.arc(w / 2, 22, 19, Math.PI, 0); g.fill();
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2; for (const r of [26, 52, 78]) { g.beginPath(); g.arc(w / 2, 110, r * 0.8, 0, TAU); g.stroke(); }
  });
  RT.postMat = new THREE.MeshStandardMaterial({ color: 0x6a5232, roughness: 0.9 });
  RT.steelMat = new THREE.MeshStandardMaterial({ color: 0x70757c, roughness: 0.3, metalness: 0.85, envMapIntensity: 1.2 });
  RT.paperMat = new THREE.MeshStandardMaterial({ map: RT.paperTex, roughness: 0.95, side: THREE.DoubleSide });
  RT.popMat = new THREE.MeshStandardMaterial({ map: RT.popTex, roughness: 0.9, alphaTest: 0.5, side: THREE.DoubleSide });
  RT.post = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);
  RT.board = new THREE.PlaneGeometry(0.9, 0.9);
  RT.plate = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 28); RT.plate.rotateZ(Math.PI / 2);
  RT.popPlane = new THREE.PlaneGeometry(0.62, 1.8); RT.popPlane.translate(0, 0.9, 0);
  RT.halo = new THREE.RingGeometry(0.62, 0.7, 36);
  RT.haloMat = new THREE.MeshBasicMaterial({ color: 0x4dff7a, transparent: true, opacity: 0.9, depthTest: false, side: THREE.DoubleSide, fog: false });
}
function signMesh(text) {
  const [c, g] = mk(256, 128); g.fillStyle = "#e8e2cc"; g.fillRect(0, 0, 256, 128); g.strokeStyle = "#222"; g.lineWidth = 8; g.strokeRect(4, 4, 248, 120);
  g.fillStyle = "#222"; g.font = "bold 76px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 128, 68);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const grp = new THREE.Group(), post = new THREE.Mesh(RT.post, RT.postMat); post.scale.y = 2.2; post.position.y = 1.1;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, side: THREE.DoubleSide })); sign.position.set(-0.05, 1.9, 0); sign.rotation.y = -Math.PI / 2;
  grp.add(post, sign); return grp;
}
function buildTarget(kind, cx, cy, d) {
  const sc = 1 + d / 60, g = new THREE.Group(), gx = cx * CELL, gz = cy * CELL;
  g.position.set(gx, groundH(gx, gz), gz); g.scale.setScalar(sc);
  const tg = { kind, x: cx, y: cy, d, sc, g, wx: gx, wz: gz, gy: g.position.y, up: true, tm: 2 + Math.random() * 4, ang: 0, sw: 0, sv: 0, piv: null, halo: null, cyc: 0 };
  const addPost = (z, h) => { const p = new THREE.Mesh(RT.post, RT.postMat); p.scale.y = h; p.position.set(0, h / 2, z); p.castShadow = true; g.add(p); };
  if (kind === "paper") {
    addPost(-0.5, 1.7); addPost(0.5, 1.7);
    const b = new THREE.Mesh(RT.board, RT.paperMat); b.position.set(-0.03, 1.25, 0); b.rotation.y = -Math.PI / 2; b.castShadow = true; g.add(b);
    tg.cy = 1.25; tg.R = 0.45;
  } else if (kind === "gong") {
    addPost(-0.5, 2.1); addPost(0.5, 2.1);
    const bar = new THREE.Mesh(RT.post, RT.postMat); bar.rotation.x = Math.PI / 2; bar.scale.y = 1.1; bar.position.set(0, 2.1, 0); g.add(bar);
    const piv = new THREE.Group(); piv.position.set(0, 2.1, 0); g.add(piv); tg.piv = piv;
    const pl = new THREE.Mesh(RT.plate, RT.steelMat); pl.position.y = -0.6; pl.castShadow = true; piv.add(pl);
    for (const z of [-0.18, 0.18]) { const ch = new THREE.Mesh(RT.post, RT.steelMat); ch.scale.set(0.35, 0.35, 0.35); ch.scale.y = 0.3; ch.position.set(0, -0.3, z); piv.add(ch); }
    tg.cy = 1.5; tg.R = 0.3;
  } else {
    const piv = new THREE.Group(); g.add(piv); tg.piv = piv;
    const p = new THREE.Mesh(RT.popPlane, RT.popMat); p.rotation.y = -Math.PI / 2; p.castShadow = true; piv.add(p);
    tg.cy = 0.9; tg.R = 0.45;
  }
  const halo = new THREE.Mesh(RT.halo, RT.haloMat); halo.rotation.y = -Math.PI / 2; halo.position.set(-0.12, tg.cy, 0); halo.renderOrder = 20; halo.visible = false; g.add(halo); tg.halo = halo;
  entRoot.add(g); return tg;
}
function clearRange() { for (const t of rangeT) { entRoot.remove(t.g); } rangeT = []; }
function newRange() { return { shots: 0, hits: 0, last: "", chal: mapKey === "challenge", pre: 3, t: 60, over: false, lit: null, best: 0, bullHits: 0 }; }
function setupRange() {
  rtInit(); clearRange();
  waveBanner = 0; wave = 0; P.x = RANGE_X0; P.y = RANGE_Y0; P.a = 0; P.pitch = 0.02;
  P.ammo.primary.reserve = 999; P.ammo.pistol.reserve = 999; P.grenades = 9;
  try { range.best = +localStorage.getItem("wow_range_best") || 0; } catch (e) {}
  RANGE_D.forEach((d, i) => {
    const cx = RANGE_X0 + d / CELL;
    RANGE_KINDS[i].forEach((kind, k) => rangeT.push(buildTarget(kind, cx, RANGE_Y0 + (k - 1) * RANGE_SPREAD[i], d)));
    const s = signMesh(d + " m"); s.position.set((cx - 1.2) * CELL, groundH((cx - 1.2) * CELL, (RANGE_Y0 - RANGE_SPREAD[i] - 2.6) * CELL), (RANGE_Y0 - RANGE_SPREAD[i] - 2.6) * CELL); entRoot.add(s); rangeT.push({ g: s, kind: "sign", up: false, dead: true });
  });
  rangeT = rangeT.filter(t => { if (t.kind === "sign") { t.keep = t.g; return true; } return true; });
}
const rangeTargets = () => rangeT.filter(t => !t.dead);
function pickLit() {
  const c = rangeTargets().filter(t => t.up && t !== range.lit);
  range.lit = c.length ? c[Math.floor(Math.random() * c.length)] : null;
  for (const t of rangeTargets()) t.halo.visible = t === range.lit;
}
function endChallenge() {
  const r = range; r.over = true; r.lit = null; for (const t of rangeTargets()) t.halo.visible = false;
  const nb = score > r.best; if (nb) { r.best = score; try { localStorage.setItem("wow_range_best", String(score)); } catch (e) {} }
  toast = 7; toastText = `TIME!   SCORE ${score}   ` + (nb ? "NEW BEST!" : "BEST " + r.best); beep(660, 0.12, "triangle", 0.1, 300); beep(990, 0.2, "triangle", 0.08, 200);
}
function rangeUpdate(dt) {
  const r = range; P.hp = 100;
  if (r.chal && !r.over) {
    if (r.pre > 0) { r.pre -= dt; if (r.pre <= 0) pickLit(); }
    else { r.t -= dt; if (r.t <= 0) endChallenge(); }
  }
  for (const t of rangeTargets()) {
    if (t.kind === "pop") {
      t.tm -= dt;
      if (r.chal) { if (!t.up && t.tm <= 0) t.up = true; }
      else if (t.tm <= 0) { t.up = !t.up; t.tm = t.up ? 3 + Math.random() * 2.5 : 1.5 + Math.random() * 3; }
      t.ang += ((t.up ? 0 : -Math.PI / 2) - t.ang) * Math.min(1, dt * 12); t.piv.rotation.z = t.ang;
      if (r.lit === t && !t.up) pickLit();
    } else if (t.kind === "gong") {
      t.sv += (-t.sw * 40 - t.sv * 1.6) * dt; t.sw += t.sv * dt; t.piv.rotation.z = -t.sw;
    }
    if (t.halo.visible) { const k = 1 + Math.sin(performance.now() / 150) * 0.06; t.halo.scale.setScalar(k); }
  }
}
function castTargets(o, d, maxT) {
  let best = null;
  if (Math.abs(d.x) < 1e-4) return null;
  for (const t of rangeTargets()) {
    if (!t.up) continue;
    const tt = (t.wx - o.x) / d.x; if (tt <= 0 || tt >= maxT || (best && tt >= best.t)) continue;
    const dy = (o.y + d.y * tt - t.gy) / t.sc, dz = (o.z + d.z * tt - t.wz) / t.sc;
    let head = false, dist = 0, ok = false;
    if (t.kind === "pop") {
      if (Math.hypot(dz, dy - 1.62) < 0.15) { ok = true; head = true; } else if (Math.abs(dz) < 0.27 && dy > 0 && dy < 1.45) ok = true;
    } else { dist = Math.hypot(dz, dy - t.cy); ok = dist < t.R; }
    if (ok) best = { t: tt, tg: t, head, dist, p: new THREE.Vector3(o.x + d.x * tt, o.y + d.y * tt, o.z + d.z * tt) };
  }
  return best;
}
function hitTarget(h) {
  const tg = h.tg, r = range; r.hits++; hitMark = 0.2; hitHead = h.head;
  let pts = 0, label = "";
  if (tg.kind === "paper") {
    const ring = clamp(10 - Math.floor(h.dist / 0.045), 1, 10); pts = ring; label = ring === 10 ? "BULLSEYE" : "RING " + ring; if (ring === 10) r.bullHits++;
    addHole(h.p, NEG_X); beep(260, 0.05, "square", 0.06, -80);
  } else if (tg.kind === "gong") {
    pts = 5; label = "GONG!"; tg.sv += 5.5 / tg.sc; sparks(h.p.x, h.p.y, h.p.z, 8, [0xfff0c0, 0xffffff], 4);
    beep(1250, 0.7, "sine", 0.16, -260); beep(1880, 0.5, "sine", 0.07, -300);
  } else {
    pts = h.head ? 10 : 6; label = h.head ? "HEADSHOT" : "HIT"; tg.up = false; tg.tm = r.chal ? 1.2 : 3; beep(h.head ? 520 : 300, 0.06, "square", 0.1, -150);
  }
  const mult = Math.round(pts * (1 + tg.d / 50));
  if (r.chal) {
    if (r.pre <= 0 && !r.over && tg === r.lit) { const g = Math.round(tg.d / 5) + mult; score += g; label += "  +" + g; pickLit(); beep(880, 0.08, "triangle", 0.09, 300); }
    else label += r.over ? "" : "  (not the lit target)";
  } else { score += mult; label += "  +" + mult; }
  r.last = `${tg.d} m  ·  ${label}`; feed(r.last, h.head ? "#fd6" : "#fff");
}
function drawRange(W, H, u, font, A) {
  const r = range, T = performance.now() / 1000, tc = touchMode;
  hud.save(); hud.textAlign = "center";
  const acc = r.shots ? Math.round(100 * r.hits / r.shots) : 0;
  const y0 = (tc ? 70 : 92) * u;
  hud.fillStyle = "rgba(6,10,16,0.62)"; hud.fillRect(W / 2 - 260 * u, y0 - 16 * u, 520 * u, r.chal ? 74 * u : 56 * u);
  hud.fillStyle = A; hud.fillRect(W / 2 - 260 * u, y0 - 16 * u, 520 * u, 3 * u);
  hud.fillStyle = "#fff"; hud.font = font(tc ? 12 : 14);
  hud.fillText(r.chal ? `RANGE CHALLENGE   ·   SCORE ${score}   ·   BEST ${Math.max(r.best, 0)}` : `SHOTS ${r.shots}   ·   HITS ${r.hits}   ·   ACCURACY ${acc}%   ·   SCORE ${score}`, W / 2, y0);
  hud.fillStyle = "rgba(255,255,255,0.75)"; hud.font = font(tc ? 11 : 12, false);
  hud.fillText(r.last || (r.chal ? "Hit the target with the green marker" : "Shoot the targets. Farther targets score more."), W / 2, y0 + 20 * u);
  if (r.chal) { hud.fillStyle = r.t < 10 && !r.over ? "#ff6a5a" : A; hud.font = font(tc ? 16 : 20); hud.fillText(r.over ? "TIME UP" : r.pre > 0 ? "GET READY..." : `${Math.ceil(r.t)} s`, W / 2, y0 + 44 * u); }
  hud.fillStyle = "rgba(255,255,255,0.45)"; hud.font = font(10, false);
  if (!tc) hud.fillText(r.chal ? "Y restarts the challenge  ·  Esc pause, then X to leave" : "Y resets the score  ·  Esc pause, then X to leave the range", W / 2, y0 + (r.chal ? 66 : 42) * u);
  if (r.lit && r.lit.up) {                                                // marker over the lit target
    _pv.set(r.lit.wx, r.lit.gy + (r.lit.cy + 0.9) * r.lit.sc, r.lit.wz).project(camera);
    if (_pv.z < 1) { const x = (_pv.x * 0.5 + 0.5) * W, y = (-_pv.y * 0.5 + 0.5) * H, bob = Math.sin(T * 6) * 4 * u; hud.fillStyle = "#4dff7a"; hud.strokeStyle = "rgba(0,0,0,0.7)"; hud.lineWidth = 2 * u;
      hud.beginPath(); hud.moveTo(x, y + bob); hud.lineTo(x - 9 * u, y + bob - 14 * u); hud.lineTo(x + 9 * u, y + bob - 14 * u); hud.closePath(); hud.stroke(); hud.fill(); }
  }
  hud.restore();
}
