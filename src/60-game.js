// ===================== gameplay =====================
const WPN = ["pistol", "knife", "primary"];       // slots 1, 2, 3
let P, enemies = [], allies = [], corpses = [], pickups = [], grenades = [], wave = 0, score = 0, state = "menu";
let shake = 0, hurt = 0, flash = 0, recoil = 0, bob = 0, waveBanner = 0, hitMark = 0, hitHead = false, deathT = 0, boom = 0, toast = 0, toastText = "", adsAmt = 0, camKick = 0, bloomShots = 0;
let killFeed = [], dmgInd = [], droppedGuns = [];
let tut = null;                                   // tutorial state (null when playing normally)
const keys = {};
let mouseDown = false, adsHeld = false, autoFire = false, spawnIdx = 0, spawnPicked = false;
const curW = () => TH.weapons[P.w];
const running = () => keys.ShiftLeft || keys.ShiftRight || keys.KeyC || touchRun;     // hold Shift or C to run
const entRoot = new THREE.Group(); scene.add(entRoot);

function clearEntities() {
  for (const e of enemies) entRoot.remove(e.rig.holder);
  for (const a of allies) entRoot.remove(a.rig.holder);
  for (const c of corpses) dropCorpse(c);
  for (const g of droppedGuns) entRoot.remove(g.obj); droppedGuns = [];
  for (const k of pickups) entRoot.remove(k.mesh);
  for (const g of grenades) entRoot.remove(g.mesh);
  enemies = []; allies = []; corpses = []; pickups = []; grenades = []; killFeed = []; dmgInd = [];
}
function dropCorpse(c) { entRoot.remove(c.rig.holder); if (c.pool) entRoot.remove(c.pool); }
const _poolMats = {};
function poolMat() {
  if (_poolMats[TH.key]) return _poolMats[TH.key];
  const [cv, g] = mk(128, 128); g.fillStyle = "#fff";
  g.beginPath(); for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, r = 46 + Math.random() * 14 + Math.sin(a * 3) * 5; g[i ? "lineTo" : "moveTo"](64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } g.fill();
  for (let i = 0; i < 9; i++) { const a = Math.random() * TAU, r = 50 + Math.random() * 12; g.beginPath(); g.arc(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 3 + Math.random() * 5, 0, 7); g.fill(); }
  const tex = new THREE.CanvasTexture(cv);
  const alien = TH.key === "ww10";
  _poolMats[TH.key] = new THREE.MeshStandardMaterial({ color: alien ? 0x58c040 : 0x3a0505, emissive: alien ? new THREE.Color(0.1, 0.6, 0.15) : new THREE.Color(0, 0, 0), roughness: 0.22, metalness: 0.1, alphaMap: tex, transparent: true, opacity: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, envMapIntensity: 1.4 });
  return _poolMats[TH.key];
}
const _poolGeo = new THREE.CircleGeometry(1, 24); _poolGeo.rotateX(-Math.PI / 2);
function startPool(c) { if (c.pool || noBlood) return; const m = new THREE.Mesh(_poolGeo, poolMat()); m.scale.setScalar(0.01); m.userData.t = 0; m.userData.max = 0.55 + Math.random() * 0.35; c.pool = m; entRoot.add(m); }
function dropGun(rig, push) {
  const d = rig.weapon; if (!d.visible || (d.userData && d.userData.dropped)) return;
  rig.holder.updateMatrixWorld(true); d.updateWorldMatrix(true, false);
  const wm = d.matrixWorld.clone(); entRoot.add(d); wm.decompose(d.position, d.quaternion, d.scale); d.userData.dropped = true; rig.dropped = d;
  droppedGuns.push({ obj: d, v: new THREE.Vector3(push.x * (1.2 + rnd()) + rs(), 2 + rnd() * 1.5, push.z * (1.2 + rnd()) + rs()), w: new THREE.Vector3(rs() * 9, rs() * 9, rs() * 9), rest: false });
  if (droppedGuns.length > 10) { const o = droppedGuns.shift(); entRoot.remove(o.obj); }
}
function makeDeath(rig, c, info) {
  info = info || {};
  const kind = info.kind === "blast" && (info.power || 0) > 0.3 ? "blast" : "fall";
  const dir = info.dir ? info.dir.clone() : new THREE.Vector3(Math.cos(c.face + Math.PI), 0, Math.sin(c.face + Math.PI));
  dir.y = 0; if (dir.lengthSq() < 1e-4) dir.set(Math.cos(c.face + Math.PI), 0, Math.sin(c.face + Math.PI)); dir.normalize();
  const th = Math.PI / 2 - c.face, cs = Math.cos(-th), sn = Math.sin(-th);
  const d = { t: 0, kind, lpx: dir.x * cs + dir.z * sn, lpz: -dir.x * sn + dir.z * cs, twist: (Math.random() - 0.5) * 1.5, headRoll: (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.5),
    style: info.head || info.kind === "melee" || Math.random() < 0.25 ? DEATH_STYLES.drop : DEATH_STYLES.fall, gunDropped: false };
  if (kind === "blast") {
    const pw = info.power;
    d.air = true; d.sx = rs(); d.sy = rs() * 0.5; d.sz = rs(); d.spin = 4 + rnd() * 6 + pw * 4; d.faceUp = Math.random() < 0.5; d.yaw = Math.random() * TAU;
    c.vel = new THREE.Vector3(dir.x * (3 + pw * 7), 3 + pw * 6, dir.z * (3 + pw * 7)); c.h = 0.25; d.style = DEATH_STYLES.fall;
  }
  c.death = d;
  setTimeout(() => { if (rig.holder.parent) { dropGun(rig, dir); d.gunDropped = true; } }, kind === "blast" ? 0 : 120);
  if (kind !== "blast") startPool(c);
}
function updateCorpses(dt) {
  for (const c of corpses) {
    c.t += dt; const d = c.death;
    if (d && d.kind === "blast" && d.air) {
      c.vel.y -= 9.8 * dt; c.h += c.vel.y * dt;
      const nx = c.x + c.vel.x * dt / CELL, ny = c.y + c.vel.z * dt / CELL;
      if (!solid(nx, c.y)) c.x = nx; else c.vel.x *= -0.3;
      if (!solid(c.x, ny)) c.y = ny; else c.vel.z *= -0.3;
      if (c.h <= 0) {
        c.h = 0;
        if (c.vel.y < -2.4) { c.vel.y *= -0.3; c.vel.x *= 0.5; c.vel.z *= 0.5; beep(70, 0.1, "triangle", 0.1, -20); const p = wpos(c, 0.1); dust(p.x, p.y, p.z, 5, TH.key === "ww1" ? 0x6a5a40 : 0x778899, 0.3, 1.5, 0.9); }
        else { d.air = false; c.vel.set(0, 0, 0); startPool(c); }
      }
    }
    if (c.pool) {
      const m = c.pool, u = m.userData; u.t += dt;
      const p = wpos(c, 0.03); m.position.set(p.x, p.y, p.z); m.scale.setScalar(Math.max(0.01, u.max * sm01((u.t - 0.5) / 3.8)));
    }
  }
  for (const g of droppedGuns) {
    if (g.rest) continue;
    g.v.y -= 9.8 * dt; g.obj.position.addScaledVector(g.v, dt);
    g.obj.rotation.x += g.w.x * dt; g.obj.rotation.y += g.w.y * dt; g.obj.rotation.z += g.w.z * dt;
    const gh = groundH(g.obj.position.x, g.obj.position.z) + 0.05;
    if (g.obj.position.y < gh) {
      g.obj.position.y = gh;
      if (g.v.y < -1.6) { g.v.y *= -0.3; g.v.x *= 0.5; g.v.z *= 0.5; g.w.multiplyScalar(0.5); beep(160, 0.05, "square", 0.04); } else { g.rest = true; g.obj.rotation.x = Math.PI / 2 * (rnd() < 0.5 ? 1 : -1) * 0.1; g.obj.rotation.z = rs() * 0.6; }
    }
  }
}
function makeRig(e, S, scale) {
  const rig = buildSoldier(S, scale);
  const holder = new THREE.Group(); holder.add(rig.root); rig.holder = holder; entRoot.add(holder);
  const fl = makeFlash(TH.flashCol, 0.7); rig.muzzle.add(fl); rig.flashSprite = fl;
  e.rig = rig; return rig;
}

function reset() {
  MAP = tut ? genTutorialMap() : genMap();
  clearEntities(); fxReset();
  buildWorld(TH);
  const sp = SPAWNS[spawnIdx], wp = TH.weapons;
  P = {
    x: sp[0], y: sp[1], a: Math.atan2(40 - sp[1], 40 - sp[0]), pitch: 0, hp: 100, cd: 0, reload: 0, reloadW: "primary",
    w: "primary", lastW: "pistol", swapT: 0.3, swing: 0, grenades: 3, gcd: 0, vx: 0, vy: 0, moving: false, jz: 0, jv: 0,
    ammo: { primary: { mag: wp.primary.mag, reserve: wp.primary.reserve }, pistol: { mag: wp.pistol.mag, reserve: wp.pistol.reserve } },
  };
  autoFire = false; wave = 0; score = 0; deathT = 0; hurt = 0; shake = 0; adsAmt = 0; camKick = 0; toast = 0; boom = 0;
  if (tut) setupTutorial(); else nextWave();
}

function nextWave() {
  wave++; waveBanner = 2.6;
  const n = Math.min(4 + wave * 2, curQ >= 1 ? 12 : 16);
  for (let i = 0; i < n; i++) {
    let x, y, tries = 0;
    do { const ang = Math.random() * TAU, r = 14 + Math.random() * 16; x = P.x + Math.cos(ang) * r; y = P.y + Math.sin(ang) * r; tries++; } while (solid(x, y) && tries < 300);
    const r = Math.random();
    const type = wave >= 3 && r < 0.2 ? "trooper" : wave >= 2 && r < 0.4 ? "officer" : "rifle";
    const T = TH.types[type];
    const e = { x, y, type, hp: T.hp + (wave > 4 && type === "rifle" ? 1 : 0), cd: 1 + Math.random() * 2, pain: 0, fired: 0, aiming: false, moving: false,
      face: Math.random() * TAU, wk: Math.random() * 6, sdir: Math.random() < 0.5 ? 1 : -1, st: Math.random() * 2, ph: Math.random() * 6, spd: T.spd * (1 + Math.min(wave * 0.05, 0.5)) };
    makeRig(e, TH.soldiers[type], T.scale); enemies.push(e);
  }
  P.hp = Math.min(100, P.hp + 15);
  topUpAllies();
}
function topUpAllies() {
  const want = Math.min(5, 3 + Math.floor((wave - 1) / 3));
  let added = 0;
  while (allies.length < want) {
    let x, y, tries = 0;
    do { const a = Math.random() * TAU, r = 2 + Math.random() * 2; x = P.x + Math.cos(a) * r; y = P.y + Math.sin(a) * r; tries++; } while (solid(x, y) && tries < 100);
    const a = { x, y, type: "ally", hp: 40, cd: 1 + Math.random(), pain: 0, fired: 0, aiming: false, moving: false, face: P.a, wk: Math.random() * 6, sdir: Math.random() < 0.5 ? 1 : -1, st: Math.random() * 2, ph: 0, spd: ALLY_T.spd };
    makeRig(a, TH.soldiers.ally, 1); allies.push(a); added++;
  }
  for (const a of allies) a.hp = Math.min(40, a.hp + 15);
  if (added && wave > 1) { toast = 1.8; toastText = "REINFORCEMENTS ARRIVE"; }
}

function los(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), steps = Math.ceil(d / 0.2);
  for (let i = 1; i < steps; i++) { const t = i / steps; if (solid(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false; }
  return true;
}
function tryMove(o, dx, dy, r = 0.22) {
  if (!solid(o.x + dx + Math.sign(dx) * r, o.y)) o.x += dx;
  if (!solid(o.x, o.y + dy + Math.sign(dy) * r)) o.y += dy;
}
const wpos = (o, y = 0) => new THREE.Vector3(o.x * CELL, groundH(o.x * CELL, o.y * CELL) + y, o.y * CELL);

// ---------- weapons ----------
function setWeapon(w) {
  if (state !== "play" || !w || P.w === w) return;
  P.lastW = P.w; P.w = w; P.reload = 0; P.swapT = 0.3; P.cd = Math.max(P.cd, 0.18); if (tut) tut.f.sw.add(w);
  beep(260, 0.06, "triangle", 0.06);
}
function startReload() {
  if (state !== "play") return;
  const wd = curW(); if (wd.melee) return;
  const am = P.ammo[P.w];
  if (P.reload <= 0 && am.mag < wd.mag && am.reserve > 0) { P.reload = wd.reload; P.reloadW = P.w; beep(200, 0.15, "sawtooth", 0.08); }
}
function feed(text, col = "#fff") { killFeed.unshift({ text, col, t: 4.5 }); if (killFeed.length > 5) killFeed.pop(); }

const TYPE_NAMES = {
  ww1: { rifle: "Soldat", officer: "Offizier", trooper: "Gasmann" },
  ww3: { rifle: "Hostile", officer: "Commander", trooper: "Heavy" },
  ww10: { rifle: "Drone", officer: "Psi Commander", trooper: "Hive Brute" },
};
function killEnemy(e, byAlly, head, info) {
  enemies.splice(enemies.indexOf(e), 1);
  const pos = wpos(e, 0.9);
  blood(pos.x, pos.y, pos.z, 18, TH.die);
  const rig = e.rig, corpse = { x: e.x, y: e.y, type: e.type, t: 0, face: e.face, rig, h: 0 }; corpses.push(corpse);
  makeDeath(rig, corpse, Object.assign({}, info, { head }));
  if (corpses.length > 14) dropCorpse(corpses.shift());
  const pts = Math.round(TH.types[e.type].pts * wave * (byAlly ? 0.5 : 1)) + (head ? 50 : 0);
  score += pts; noise(0.2, 0.2); beep(90, 0.3, "sawtooth", 0.15, -60);
  feed(`${byAlly ? "ALLY" : "YOU"}  ▸  ${TYPE_NAMES[TH.key][e.type]}${head ? "  ◎ HEADSHOT" : ""}  +${pts}`, byAlly ? "#8fa" : head ? "#fd6" : "#fff");
  if (tut) tutKill(e, head, info);
  const r = Math.random();
  if (r < (e.type === "officer" ? 0.5 : 0.3)) addPickup(e, "ammo");
  else if (r < 0.5) addPickup(e, "health");
  else if (r < 0.62) addPickup(e, "grenade");
}
function hitEnemy(e, dmg, head, point, info) {
  e.hp -= dmg; e.pain = 0.25; e.alert = true; hitMark = 0.2; hitHead = !!head; if (tut) tut.hits++;
  const p = point || wpos(e, 1.2);
  blood(p.x, p.y, p.z, head ? 14 : 8, TH.hit); sparks(p.x, p.y, p.z, 5, TH.hit, 3);
  beep(head ? 520 : 300, 0.06, "square", 0.1, -150);
  if (e.hp <= 0) killEnemy(e, false, head, info);
}
function allyHit(e, a) {
  e.hp -= 1; e.pain = 0.25; e.alert = true;
  const p = wpos(e, 1.2); blood(p.x, p.y, p.z, 6, TH.hit);
  if (e.hp <= 0) killEnemy(e, true, false, { dir: new THREE.Vector3(e.x - a.x, 0, e.y - a.y), kind: "bullet" });
}
function killAlly(a, info) {
  allies.splice(allies.indexOf(a), 1);
  const corpse = { x: a.x, y: a.y, type: "ally", t: 0, face: a.face, rig: a.rig, h: 0 }; corpses.push(corpse);
  makeDeath(a.rig, corpse, info);
  if (corpses.length > 14) dropCorpse(corpses.shift());
  const p = wpos(a, 1); blood(p.x, p.y, p.z, 14, TH.die);
  toast = 1.4; toastText = "ALLY DOWN"; beep(120, 0.25, "sawtooth", 0.1, -60); feed("ALLY DOWN", "#f88");
}

// ---------- 3D hit scan ----------
const HIT_SPHERES = [[1.68, 0.14, true], [1.3, 0.27, false], [1.0, 0.25, false], [0.62, 0.21, false], [0.25, 0.17, false]];
const _ro = new THREE.Vector3(), _rd = new THREE.Vector3(), _fw = new THREE.Vector3(), _rt = new THREE.Vector3(), _up = new THREE.Vector3(), _hp = new THREE.Vector3();
function raySphere(o, d, c, r) {
  const ox = o.x - c.x, oy = o.y - c.y, oz = o.z - c.z, b = ox * d.x + oy * d.y + oz * d.z, cc = ox * ox + oy * oy + oz * oz - r * r, disc = b * b - cc;
  if (disc < 0) return -1; const t = -b - Math.sqrt(disc); return t > 0 ? t : (-b + Math.sqrt(disc) > 0 ? 0.001 : -1);
}
function castWorld(o, d, maxT) {                               // first wall / ground hit
  let px = o.x, py = o.y, pz = o.z, pcx = Math.floor(px / CELL), pcz = Math.floor(pz / CELL);
  const step = 0.12;
  for (let t = step; t < maxT; t += step) {
    px = o.x + d.x * t; py = o.y + d.y * t; pz = o.z + d.z * t;
    const cx = Math.floor(px / CELL), cz = Math.floor(pz / CELL);
    if (py < groundH(px, pz)) return { t, p: new THREE.Vector3(px, groundH(px, pz), pz), n: new THREE.Vector3(0, 1, 0), ground: true };
    if (py < WALLH && solid(cx, cz)) {
      const n = new THREE.Vector3();
      if (cx !== pcx) n.x = -Math.sign(d.x); else if (cz !== pcz) n.z = -Math.sign(d.z); else n.y = 1;
      return { t, p: new THREE.Vector3(px, py, pz), n, ground: false };
    }
    pcx = cx; pcz = cz;
  }
  return null;
}
function castEnemies(o, d, list, maxT) {
  let best = null;
  for (const e of list) {
    const base = wpos(e, 0), sc = TH.types[e.type].scale * (TH.soldiers[e.type] && TH.soldiers[e.type].alien ? 1.08 : 1);
    if (Math.abs(base.x - o.x) > maxT || Math.abs(base.z - o.z) > maxT) continue;
    for (const [y, r, head] of HIT_SPHERES) {
      _hp.set(base.x, base.y + y * sc, base.z); const t = raySphere(o, d, _hp, r * sc * (e.type === "trooper" ? 1.15 : 1));
      if (t >= 0 && t < maxT && (!best || t < best.t)) best = { t, e, head };
    }
  }
  return best;
}

function doJump() { if (state === "play" && P.jz <= 0) { P.jv = 6.4; P.jz = 0.001; beep(240, 0.08, "triangle", 0.06, 120); if (tut) tut.f.jump = true; } }
function fire() {
  if (P.cd > 0 || P.reload > 0 || P.swapT > 0.1) return;
  const wd = curW();
  if (wd.melee) { stab(wd); return; }
  const am = P.ammo[P.w];
  if (am.mag <= 0) { beep(120, 0.05, "square", 0.08); P.cd = 0.25; startReload(); return; }
  am.mag--; P.cd = wd.cd; recoil = 1; flash = 0.07; shake = Math.max(shake, wd.shake * 0.6);
  camKick += wd.shake * (P.w === "pistol" ? 0.05 : 0.07) + 0.006; bloomShots = Math.min(1, bloomShots + 0.18);
  TH.shot(P.w === "pistol" ? "pistol" : "rifle");
  for (const e of enemies) if (Math.hypot(e.x - P.x, e.y - P.y) < (P.w === "pistol" ? 20 : 28)) e.alert = true;
  // aim ray with spread
  camera.getWorldDirection(_fw); _rt.set(1, 0, 0).applyQuaternion(camera.quaternion); _up.set(0, 1, 0).applyQuaternion(camera.quaternion);
  const spread = wd.spread * (1 - adsAmt * 0.65) * (1 + (P.moving ? 0.9 : 0)) * (1 + bloomShots * 1.6);
  _rd.copy(_fw).addScaledVector(_rt, rs() * spread * 2).addScaledVector(_up, rs() * spread * 2).normalize();
  if (touchMode) assistAim();                                                   // gentle aim assist on touch screens
  _ro.copy(camera.position);
  const wall = castWorld(_ro, _rd, 160), en = castEnemies(_ro, _rd, enemies, wall ? wall.t : 160);
  const muzzle = _tmpA.copy(camera.position).addScaledVector(_fw, 0.9).addScaledVector(_rt, 0.13).addScaledVector(_up, -0.1);
  if (en) {
    const end = _tmpB.copy(_ro).addScaledVector(_rd, en.t);
    addTracer(muzzle, end.clone(), TH.tracer);
    hitEnemy(en.e, curW().dmg * (en.head ? 2 : 1), en.head, end.clone(), { dir: _rd.clone(), kind: "bullet" });
  } else if (wall) {
    addTracer(muzzle, wall.p.clone(), TH.tracer);
    addHole(wall.p, wall.n);
    sparks(wall.p.x, wall.p.y, wall.p.z, 8, TH.wallHit, 4, wall.n.x, wall.n.y, wall.n.z);
    dust(wall.p.x, wall.p.y, wall.p.z, 4, TH.key === "ww1" ? 0x8a7a5a : 0x778899, 0.3, 1.2, 1, wall.n.x, wall.n.y, wall.n.z);
  } else addTracer(muzzle, _tmpB.copy(_ro).addScaledVector(_rd, 160).clone(), TH.tracer);
  // muzzle effects
  const mp = _tmpC.copy(camera.position).addScaledVector(_fw, 1.2);
  pushLight(mp.x, mp.y, mp.z, TH.flashCol, 22, 0.08);
  smokeTrail(muzzle.x + _fw.x * 0.5, muzzle.y + _fw.y * 0.5, muzzle.z + _fw.z * 0.5, 2, 0.12);
  if (TH.key !== "ww10" && !(TH.key === "ww3")) ejectCasing(_tmpA.copy(camera.position).addScaledVector(_rt, 0.2).addScaledVector(_fw, 0.4).addScaledVector(_up, -0.08), _tmpB.set(0, 0, 0).addScaledVector(_rt, 2.4 + rnd()).addScaledVector(_up, 1.8 + rnd()).addScaledVector(_fw, rs()));
  else if (TH.key === "ww3") ejectCasing(_tmpA.copy(camera.position).addScaledVector(_rt, 0.2).addScaledVector(_fw, 0.4).addScaledVector(_up, -0.08), _tmpB.set(0, 0, 0).addScaledVector(_rt, 2.4 + rnd()).addScaledVector(_up, 1.8 + rnd()));
  if (am.mag === 0) startReload();
}
const _tmpA = new THREE.Vector3(), _tmpB = new THREE.Vector3(), _tmpC = new THREE.Vector3();

function stab(wd) {
  P.cd = wd.cd; P.swing = 1; noise(0.08, 0.1); beep(500, 0.08, "triangle", 0.05, -300);
  const dx = Math.cos(P.a), dy = Math.sin(P.a);
  let best = null, bd = 1e9;
  for (const e of enemies) {
    const ex = e.x - P.x, ey = e.y - P.y, fwd = ex * dx + ey * dy;
    if (fwd <= 0 || fwd > wd.range) continue;
    const side = Math.abs(ex * -dy + ey * dx);
    if (side < 0.55 && fwd < bd && los(P.x, P.y, e.x, e.y)) { best = e; bd = fwd; }
  }
  if (best) {
    const silent = !best.alert;
    if (silent) { score += 50 * wave; toast = 1.2; toastText = "SILENT KILL +" + 50 * wave; }
    hitEnemy(best, silent ? 99 : wd.dmg, false, null, { dir: new THREE.Vector3(dx, 0, dy), kind: "melee" });
  }
}

// ---------- grenades ----------
function makeGrenadeMesh() {
  const g = new THREE.Group();
  if (TH.key === "ww1") {
    meshAt(g, GEO("gren1", () => new THREE.SphereGeometry(0.05, 14, 10)), pm([58, 74, 42], { r: 0.6, m: 0.4 }), 0, 0, 0, { s: [0.85, 1.1, 0.85] });
    meshAt(g, gCyl(0.012, 0.012, 0.035, 8), pm([120, 120, 110], { m: 0.9, r: 0.3 }), 0, 0.065, 0);
  } else {
    meshAt(g, GEO("gren3", () => new THREE.SphereGeometry(0.055, 16, 12)), pm([26, 30, 40], { r: 0.3, m: 0.7 }), 0, 0, 0);
    g.userData.glow = meshAt(g, gTor(0.056, 0.008), pm(TH.key === "ww10" ? [220, 150, 255] : [100, 240, 255], { glow: TH.key === "ww10" ? [220, 150, 255] : [100, 240, 255], gi: 3.5 }), 0, 0, 0, { rx: Math.PI / 2, noShadow: true });
  }
  return g;
}
function throwGrenade() {
  if (state !== "play" || P.grenades <= 0 || P.gcd > 0) return;
  P.grenades--; P.gcd = 0.9; P.swapT = 0.28; P.reload = 0;
  camera.getWorldDirection(_fw);
  const g = { p: camera.position.clone().addScaledVector(_fw, 0.7).add(new THREE.Vector3(0, -0.2, 0)), v: _fw.clone().multiplyScalar(14).add(new THREE.Vector3(0, 3.4, 0)), fuse: 2.4, mesh: makeGrenadeMesh() };
  g.mesh.position.copy(g.p); entRoot.add(g.mesh); grenades.push(g);
  beep(300, 0.1, "triangle", 0.08, 200); noise(0.05, 0.08);
}
function explode(g) {
  const RADm = 8, pc = g.p.x / CELL, pyc = g.p.z / CELL;
  explosionFx(g.p.x, g.p.y, g.p.z, TH);
  noise(0.7, 0.55); beep(60, 0.5, "sawtooth", 0.25, -30);
  const pd = Math.hypot(g.p.x - camera.position.x, g.p.z - camera.position.z) / CELL;
  shake = Math.max(shake, 1.2 * Math.max(0, 1 - pd / 14)); camKick += 0.05 * Math.max(0, 1 - pd / 14);
  if (pd < 22) boom = 0.2;
  const ok = (x, y) => los(pc, pyc, x, y) || Math.hypot(x - pc, y - pyc) < 1.2;
  for (const e of enemies.slice()) {
    const d = Math.hypot(e.x - pc, e.y - pyc) * CELL;
    if (d < 28 * CELL) e.alert = true;
    if (d < RADm && ok(e.x, e.y)) hitEnemy(e, Math.max(1, Math.ceil(8 * (1 - d / RADm))), false, null, { dir: new THREE.Vector3(e.x - pc, 0, e.y - pyc), kind: "blast", power: 1 - d / RADm });
  }
  for (const a of allies.slice()) {
    const d = Math.hypot(a.x - pc, a.y - pyc) * CELL;
    if (d < RADm && ok(a.x, a.y)) { a.hp -= Math.round(60 * (1 - d / RADm)); a.pain = 0.3; if (a.hp <= 0) killAlly(a, { dir: new THREE.Vector3(a.x - pc, 0, a.y - pyc), kind: "blast", power: 1 - d / RADm }); }
  }
  const dp = Math.hypot(P.x - pc, P.y - pyc) * CELL;
  if (dp < 7 && ok(P.x, P.y)) { P.hp -= Math.round(60 * (1 - dp / 7)); hurt = 0.7; addDmgInd(pc, pyc); }
}
function updateGrenades(dt) {
  for (let i = grenades.length - 1; i >= 0; i--) {
    const g = grenades[i];
    g.fuse -= dt; g.v.y -= 9.8 * dt;
    const nx = g.p.x + g.v.x * dt, nz = g.p.z + g.v.z * dt;
    if (g.p.y < WALLH) {
      if (solid(nx / CELL, g.p.z / CELL)) { g.v.x *= -0.45; } else g.p.x = nx;
      if (solid(g.p.x / CELL, nz / CELL)) { g.v.z *= -0.45; } else g.p.z = nz;
    } else { g.p.x = nx; g.p.z = nz; }
    g.p.y += g.v.y * dt;
    const gh = groundH(g.p.x, g.p.z) + 0.06;
    if (g.p.y < gh) { g.p.y = gh; if (Math.abs(g.v.y) > 1.5) beep(180, 0.04, "square", 0.04); g.v.y = -g.v.y * 0.35; g.v.x *= 0.72; g.v.z *= 0.72; if (Math.abs(g.v.y) < 0.8) g.v.y = 0; }
    g.mesh.position.copy(g.p); g.mesh.rotation.x += dt * 6; g.mesh.rotation.z += dt * 4;
    const blink = g.fuse < 0.8 && Math.floor(g.fuse * 14) % 2 === 0;
    if (g.mesh.userData.glow) g.mesh.userData.glow.material.emissiveIntensity = blink ? 8 : 3.5;
    if (g.fuse < 1.6 && Math.random() < dt * 25) smokeTrail(g.p.x, g.p.y + 0.06, g.p.z, 1, 0.05);
    if (g.fuse <= 0) { grenades.splice(i, 1); entRoot.remove(g.mesh); explode(g); }
  }
}

// ---------- pickups ----------
function addPickup(e, type) {
  const g = new THREE.Group(), C = TH.pick[type], body = pm(C[0], { r: 0.45, m: type === "ammo" ? 0.5 : 0.1 }), acc = pm(C[1], { glow: C[1], gi: 2.6, r: 0.3 });
  if (type === "health") {
    meshAt(g, gRB(0.34, 0.24, 0.2, 0.04), body, 0, 0, 0);
    meshAt(g, gBox(0.07, 0.19, 0.012), acc, 0, 0, 0.104, { noShadow: true }); meshAt(g, gBox(0.19, 0.07, 0.012), acc, 0, 0, 0.104, { noShadow: true });
    meshAt(g, gBox(0.07, 0.19, 0.012), acc, 0, 0, -0.104, { noShadow: true }); meshAt(g, gBox(0.19, 0.07, 0.012), acc, 0, 0, -0.104, { noShadow: true });
  } else if (type === "ammo") {
    meshAt(g, gRB(0.34, 0.2, 0.22, 0.03), body, 0, 0, 0);
    for (let i = -1; i <= 1; i++) meshAt(g, gCyl(0.018, 0.018, 0.14, 8), acc, i * 0.07, 0.11, 0, { rx: Math.PI / 2, noShadow: true });
  } else {
    const gm = makeGrenadeMesh(); gm.scale.setScalar(1.5); g.add(gm);
  }
  const beam = new THREE.Mesh(GEO("beam", () => new THREE.CylinderGeometry(0.16, 0.16, 3, 12, 1, true)), new THREE.MeshBasicMaterial({ color: hex(C[1]), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  beam.position.y = 1.4; g.add(beam);
  const p = wpos(e, 0.45); g.position.copy(p); entRoot.add(g);
  pickups.push({ x: e.x, y: e.y, type, mesh: g, base: p.y, ph: Math.random() * 6 });
}

// ---------- allies ----------
function updateAllies(dt) {
  const T = ALLY_T;
  allies.forEach((a, idx) => {
    a.pain -= dt; a.cd -= dt; a.fired -= dt; a.st -= dt;
    let tgt = null, td = 1e9;
    for (const e of enemies) { const d = Math.hypot(e.x - a.x, e.y - a.y); if (d < 16 && d < td && los(a.x, a.y, e.x, e.y)) { tgt = e; td = d; } }
    a.aiming = false;
    const ox = a.x, oy = a.y;
    if (tgt) {
      const dx = tgt.x - a.x, dy = tgt.y - a.y, d = td;
      a.face = Math.atan2(dy, dx); a.aiming = a.cd < 0.45;
      if (!a.aiming && a.pain <= 0) {
        const ux = dx / d, uy = dy / d, sp = a.spd * dt;
        if (d > T.keep + 2) tryMove(a, ux * sp, uy * sp, 0.25);
        else if (d < T.keep - 1.5) tryMove(a, -ux * sp * 0.8, -uy * sp * 0.8, 0.25);
        if (a.st <= 0) { a.sdir = -a.sdir; a.st = 1 + Math.random() * 1.8; }
        tryMove(a, -uy * a.sdir * sp * 0.55, ux * a.sdir * sp * 0.55, 0.25);
      }
      if (a.cd <= 0) {
        a.cd = T.cd[0] + Math.random() * (T.cd[1] - T.cd[0]); a.fired = 0.15;
        if (Math.hypot(a.x - P.x, a.y - P.y) < 26) TH.eshot("rifle");
        const hit = Math.random() < Math.max(0.3, T.acc - d * 0.03);
        enemyTracer(a, tgt, hit, true);
        if (hit) allyHit(tgt, a);
      }
    } else {
      const ang = P.a + Math.PI + (idx - (allies.length - 1) / 2) * 0.9;
      const fx2 = P.x + Math.cos(ang) * 2.6, fy2 = P.y + Math.sin(ang) * 2.6;
      const dx = fx2 - a.x, dy = fy2 - a.y, d = Math.hypot(dx, dy);
      if (d > 0.6 && a.pain <= 0) {
        const sp = a.spd * (d > 7 ? 1.8 : d > 2.5 ? 1.1 : 0.6) * dt;
        tryMove(a, dx / d * sp, dy / d * sp, 0.25);
        if (Math.hypot(a.x - ox, a.y - oy) < sp * 0.3) tryMove(a, -dy / d * sp * 0.8, dx / d * sp * 0.8, 0.25);
      }
      if (Math.hypot(a.x - P.x, a.y - P.y) > 30) for (let k = 0; k < 40; k++) { const t2 = Math.random() * TAU; if (!solid(P.x + Math.cos(t2) * 2, P.y + Math.sin(t2) * 2)) { a.x = P.x + Math.cos(t2) * 2; a.y = P.y + Math.sin(t2) * 2; break; } }
    }
    a.moving = Math.hypot(a.x - ox, a.y - oy) > 1e-4;
    if (!tgt && a.moving) a.face = Math.atan2(a.y - oy, a.x - ox);
    if (a.moving) a.wk += dt * (a.spd * 2.2 + 3);
    const pdx = a.x - P.x, pdy = a.y - P.y, pd = Math.hypot(pdx, pdy);
    if (pd > 0.001 && pd < 0.8) tryMove(a, pdx / pd * dt * 1.2, pdy / pd * dt * 1.2, 0.25);
    for (const o of allies) { if (o === a) continue; const sx = a.x - o.x, sy = a.y - o.y, sd = Math.hypot(sx, sy); if (sd > 0.001 && sd < 0.6) tryMove(a, sx / sd * dt * 0.8, sy / sd * dt * 0.8, 0.25); }
  });
}
function enemyTracer(from, to, hit, isAlly) {
  const rig = from.rig; rig.holder.updateMatrixWorld(true);
  const a = new THREE.Vector3(); rig.muzzle.getWorldPosition(a);
  const b = to === P ? camera.position.clone() : wpos(to, 1.2);
  if (!hit) { b.x += rs() * 2.4; b.y += rs() * 1.2 - 0.3; b.z += rs() * 2.4; }
  addTracer(a, b, isAlly ? 0x9bffb0 : TH.tracer, 220, 5);
  pushLight(a.x, a.y, a.z, TH.flashCol, 8, 0.07);
}
function addDmgInd(ax, ay) { dmgInd.push({ ang: Math.atan2(ay - P.y, ax - P.x), t: 1.4 }); if (dmgInd.length > 6) dmgInd.shift(); }

// ---------- update ----------
function update(dt) {
  const dirX = Math.cos(P.a), dirY = Math.sin(P.a);
  let mx = 0, my = 0;
  if (keys.KeyW || keys.ArrowUp) { mx += dirX; my += dirY; }
  if (keys.KeyS || keys.ArrowDown) { mx -= dirX; my -= dirY; }
  if (keys.KeyD) { mx -= dirY; my += dirX; }
  if (keys.KeyA) { mx += dirY; my -= dirX; }
  if (keys.ArrowLeft) P.a -= 2.2 * dt;
  if (keys.ArrowRight) P.a += 2.2 * dt;
  const keyMove = mx !== 0 || my !== 0;
  let speedF = 1;
  if (touchMove.active) {                                                       // analog thumbstick
    const tx = touchMove.x, ty = touchMove.y;
    mx += dirX * -ty - dirY * tx; my += dirY * -ty + dirX * tx;
    if (!keyMove) speedF = Math.min(1, Math.hypot(tx, ty));
  }
  const len = Math.hypot(mx, my);
  P.moving = len > 0 || P.jz > 0;
  if (len > 0) {
    const sprint = running() && adsAmt < 0.3;
    const sp = (sprint ? 4.6 : 3.1) * (P.w === "knife" ? 1.12 : 1) * (1 - adsAmt * 0.45) * speedF * dt / len;
    tryMove(P, mx * sp, my * sp);
    bob += dt * (sprint ? 12 : 8);
  }
  if (P.jz > 0 || P.jv > 0) {                                                 // jump physics
    P.jv -= 18 * dt; P.jz += P.jv * dt;
    if (P.jz <= 0) { P.jz = 0; P.jv = 0; camKick += 0.012; beep(90, 0.07, "triangle", 0.08, -30); noise(0.05, 0.08); dust(P.x * CELL, groundH(P.x * CELL, P.y * CELL) + 0.05, P.y * CELL, 5, TH.key === "ww1" ? 0x6a5a40 : 0x778899, 0.25, 1.2, 0.8); }
  }
  P.cd -= dt; P.gcd -= dt; P.swapT = Math.max(0, P.swapT - dt); P.swing = Math.max(0, P.swing - dt / 0.3);
  bloomShots = Math.max(0, bloomShots - dt * 1.4);
  if (P.reload > 0) {
    P.reload -= dt;
    if (P.reload <= 0) { const am = P.ammo[P.reloadW], wd = TH.weapons[P.reloadW], need = Math.min(wd.mag - am.mag, am.reserve); am.mag += need; am.reserve -= need; beep(420, 0.06, "square", 0.05); if (tut) tut.f.reloaded = true; }
  }
  if (mouseDown || keys.KeyZ) fire();                    // click or hold Z to shoot

  updateCorpses(dt);
  for (const e of enemies) {
    const T = TH.types[e.type];
    if (e.dummy) { dummyUpdate(e, dt); continue; }
    let tx = P.x, ty = P.y, tgtA = null, d0 = Math.hypot(P.x - e.x, P.y - e.y);
    for (const al of allies) { const ad = Math.hypot(al.x - e.x, al.y - e.y); if (ad < d0 * 0.85 && ad < 18 && los(e.x, e.y, al.x, al.y)) { tx = al.x; ty = al.y; tgtA = al; d0 = ad; } }
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
    e.pain -= dt; e.cd -= dt; e.fired -= dt; e.st -= dt;
    const sees = d < 20 && los(e.x, e.y, tx, ty);
    if (sees || Math.hypot(P.x - e.x, P.y - e.y) < 5) e.alert = true;
    e.aiming = sees && d < 9 && e.cd < 0.5 && e.cd > -0.2;
    e.moving = false;
    if (!e.alert) {
      const ox = e.x, oy = e.y;
      if (e.st <= 0) { e.wa = Math.random() * TAU; e.st = 2 + Math.random() * 3; e.idle = Math.random() < 0.3; }
      if (!e.idle && e.wa !== undefined) tryMove(e, Math.cos(e.wa) * e.spd * 0.4 * dt, Math.sin(e.wa) * e.spd * 0.4 * dt, 0.25);
      e.moving = Math.hypot(e.x - ox, e.y - oy) > 1e-4;
      if (e.moving === false && !e.idle) e.st = 0;
    }
    if (e.alert && e.pain <= 0 && !e.aiming) {
      const ux = dx / d, uy = dy / d, ox = e.x, oy = e.y, run = d > 10 ? 2 : 1;
      if (d > T.keep + 0.5) {
        tryMove(e, ux * e.spd * run * dt, uy * e.spd * run * dt, 0.25);
        if (!sees) tryMove(e, -uy * e.spd * run * dt * 0.6, ux * e.spd * run * dt * 0.6, 0.25);
      } else if (d < T.keep - 1) tryMove(e, -ux * e.spd * dt * 0.8, -uy * e.spd * dt * 0.8, 0.25);
      if (sees && d < T.keep + 4) {
        if (e.st <= 0) { e.sdir = -e.sdir; e.st = 1 + Math.random() * 1.8; }
        tryMove(e, -uy * e.sdir * e.spd * 0.55 * dt, ux * e.sdir * e.spd * 0.55 * dt, 0.25);
      }
      e.moving = Math.hypot(e.x - ox, e.y - oy) > 1e-4;
    }
    if (e.alert) e.face = Math.atan2(dy, dx); else if (e.wa !== undefined && e.moving) e.face = e.wa;
    if (e.moving) e.wk += dt * (e.alert && d > 10 ? 14 : 8);
    for (const o of enemies) { if (o === e) continue; const sx = e.x - o.x, sy = e.y - o.y, sd = Math.hypot(sx, sy); if (sd > 0.001 && sd < 0.6) tryMove(e, sx / sd * dt * 0.8, sy / sd * dt * 0.8, 0.25); }
    if (sees && e.cd <= 0 && d < 9) {
      e.cd = T.cd[0] + Math.random() * (T.cd[1] - T.cd[0]); e.fired = 0.15;
      TH.eshot(e.type);
      const hit = Math.random() < Math.max(0.25, T.acc - d * 0.06);
      enemyTracer(e, tgtA || P, hit, false);
      if (hit) {
        const dmg = T.dmg[0] + Math.floor(Math.random() * (T.dmg[1] - T.dmg[0] + 1));
        if (tgtA) { tgtA.hp -= Math.round(dmg * 0.7); tgtA.pain = 0.2; if (tgtA.hp <= 0) killAlly(tgtA, { dir: new THREE.Vector3(tgtA.x - e.x, 0, tgtA.y - e.y), kind: "bullet" }); }
        else { P.hp -= dmg; hurt = 0.4; shake = Math.max(shake, 0.3); camKick += 0.02; addDmgInd(e.x, e.y); beep(80, 0.2, "sawtooth", 0.15, -40); }
      }
    }
  }
  for (let i = pickups.length - 1; i >= 0; i--) {
    const k = pickups[i];
    if (Math.hypot(k.x - P.x, k.y - P.y) < 0.9) {
      if (k.type === "health") { if (P.hp >= 100) continue; P.hp = Math.min(100, P.hp + 25); feed("+25 HEALTH", "#9f9"); }
      else if (k.type === "grenade") { if (P.grenades >= 9) continue; P.grenades++; feed("+1 GRENADE", "#fff"); }
      else { P.ammo.primary.reserve += TH.weapons.primary.pickup; P.ammo.pistol.reserve += TH.weapons.pistol.pickup; feed("+ AMMO", "#fd6"); }
      beep(700, 0.12, "triangle", 0.1, 400); entRoot.remove(k.mesh); pickups.splice(i, 1); if (tut) tut.f.picks++;
    }
  }
  updateAllies(dt);
  updateGrenades(dt);
  if (tut) tutUpdate(dt);
  if (P.hp > 0 && enemies.length === 0 && !tut) nextWave();

  recoil = Math.max(0, recoil - dt * 7); flash = Math.max(0, flash - dt); hurt = Math.max(0, hurt - dt); hitMark = Math.max(0, hitMark - dt);
  toast = Math.max(0, toast - dt); shake = Math.max(0, shake - dt * 1.5); waveBanner = Math.max(0, waveBanner - dt); boom = Math.max(0, boom - dt);
  camKick = Math.max(0, camKick - dt * (0.55 + camKick * 4));
  for (const f of killFeed) f.t -= dt; killFeed = killFeed.filter(f => f.t > 0);
  for (const d of dmgInd) d.t -= dt; dmgInd = dmgInd.filter(d => d.t > 0);

  if (P.hp <= 0) {
    P.hp = 0; state = "dying"; deathT = 0; mouseDown = false; adsHeld = false; autoFire = false;
    document.exitPointerLock(); noise(0.5, 0.3); beep(140, 0.8, "sawtooth", 0.18, -110);
  }
}
function updateDying(dt) {
  deathT += dt; hurt = 0; shake = 0; flash = 0; recoil = 0;
  for (const k of pickups) k.mesh.rotation.y += dt;
  if (deathT >= 1.9) {
    state = "dead";
    titleEl.textContent = "YOU DIED"; subEl.textContent = `Score ${score}  ·  Reached wave ${wave}`;
    cardsEl.style.display = "flex"; restartEl.style.display = "block"; tutBtn.style.display = "block";
    setHint("← → switch era · 1–5 pick spawn · or click / press L", "Tap an era (or anywhere) to play again");
    overlay.style.display = "flex";
  }
}
