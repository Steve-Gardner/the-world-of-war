// ===================== vehicles: one drivable ground vehicle per era =====================
// Press E next to a vehicle to climb in. W/S throttle, A/D steer, mouse aims the gun, click or Z fires, E exits.
// Local model axes: +z forward, +x right. Heading v.h uses the same convention as the player's aim P.a.
const vehicles = [];
let drv = null;                                                                  // vehicle the player is driving (null on foot)
const VTYPES = {
  ww1:  { name: "MARK IV TANK", hp: 320, vmax: 3.8, acc: 2.4, turn: 0.95, r: 0.95, len: 4.8, wid: 2.8, cd: 1.5, armor: 0.32, eye: 2.45, hover: 0, rad: 6.5, dmg: 7, cockpit: true, engine: [38, 7, "sawtooth"], shell: 0xffc070, enter: "Mark IV tank" },
  ww3:  { name: "HOVER TANK", hp: 280, vmax: 8, acc: 6.5, turn: 1.9, r: 0.9, len: 4.6, wid: 2.4, cd: 0.85, armor: 0.38, eye: 1.95, hover: 0.55, rad: 5.5, dmg: 6, cockpit: true, engine: [95, 12, "triangle"], shell: 0x66f0ff, enter: "hover tank" },
  ww10: { name: "HOVER BIKE", hp: 130, vmax: 12, acc: 10, turn: 2.6, r: 0.5, len: 2.6, wid: 1.1, cd: 0.13, armor: 0.65, eye: 1.55, hover: 0.5, auto: true, rad: 0, dmg: 1, cockpit: false, engine: [180, 16, "sine"], shell: 0xe090ff, enter: "hover bike" },
};
const vmat = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(...c.map(v => v / 255)), roughness: 0.7, metalness: 0.3, envMapIntensity: 1 }, o || {}));
const vglow = c => new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(...c.map(v => v / 255)), emissiveIntensity: 2.6, roughness: 0.3 });

function buildVehicleMesh(key) {
  const g = new THREE.Group(), T = VTYPES[key], o = {};
  const box = (w, h, l, x, y, z, m, par = g, rx = 0) => { const b = new THREE.Mesh(gBox(w, h, l), m); b.position.set(x, y, z); b.rotation.x = rx; b.castShadow = b.receiveShadow = true; par.add(b); return b; };
  const cyl = (rt, rb, h, x, y, z, m, par = g, rx = 0, rz = 0) => { const c = new THREE.Mesh(gCyl(rt, rb, h, 14), m); c.position.set(x, y, z); c.rotation.set(rx, 0, rz); c.castShadow = c.receiveShadow = true; par.add(c); return c; };
  const turret = new THREE.Group(), pivot = new THREE.Group(); o.turret = turret; o.pivot = pivot; g.add(turret);
  if (key === "ww1") {
    const hull = vmat([84, 90, 66], { roughness: 0.85, metalness: 0.15 }), dark = vmat([44, 40, 34], { roughness: 0.9, metalness: 0.2 }), rust = vmat([90, 62, 40], { roughness: 0.9 });
    box(2.0, 1.2, 4.0, 0, 1.25, 0, hull);
    for (const sd of [-1, 1]) {
      box(0.7, 1.7, 3.0, sd * 1.25, 1.0, 0, dark);                                              // tracks: slab + rounded ends + slanted nose
      cyl(0.85, 0.85, 0.7, sd * 1.25, 1.0, 1.5, dark, g, 0, Math.PI / 2); cyl(0.85, 0.85, 0.7, sd * 1.25, 1.0, -1.5, dark, g, 0, Math.PI / 2);
      box(0.7, 0.18, 1.0, sd * 1.25, 1.62, 2.1, dark, g, 0.7); box(0.7, 0.18, 1.0, sd * 1.25, 1.62, -2.1, dark, g, -0.7);
      box(0.9, 0.8, 1.4, sd * 1.55, 1.75, 0.2, hull);                                           // sponsons
      cyl(0.07, 0.07, 1.3, sd * 1.55, 1.8, 1.2, vmat([30, 30, 30], { metalness: 0.8 }), g, Math.PI / 2);
    }
    box(0.9, 0.5, 1.0, 0, 0.7, 2.25, rust, g, 0.5);
    box(1.5, 0.9, 1.5, 0, 2.2, -0.2, hull, turret); box(0.7, 0.35, 0.7, 0, 2.8, -0.2, dark, turret);
    pivot.position.set(0, 1.85, 0.5); turret.add(pivot); cyl(0.1, 0.12, 2.6, 0, 0, 1.3, vmat([36, 36, 34], { metalness: 0.85, roughness: 0.4 }), pivot, Math.PI / 2);
    o.muzzle = 2.6;
  } else if (key === "ww3") {
    const hull = vmat([60, 68, 78], { metalness: 0.65, roughness: 0.35 }), dark = vmat([20, 24, 30], { metalness: 0.6, roughness: 0.4 }), glow = vglow([60, 235, 255]);
    box(2.2, 0.7, 4.4, 0, 1.0, 0, hull); box(1.7, 0.4, 1.8, 0, 1.0, 2.5, hull, g, 0.35);
    box(2.5, 0.25, 4.6, 0, 0.6, 0, dark); box(2.52, 0.08, 4.62, 0, 0.74, 0, glow);
    for (const sd of [-1, 1]) { box(0.35, 0.5, 2.4, sd * 1.25, 1.2, -0.5, dark); box(0.05, 0.5, 2.0, sd * 1.43, 1.2, -0.5, glow); }
    cyl(1.0, 1.0, 0.1, 0, 0.35, 0, glow);
    box(1.6, 0.55, 1.8, 0, 1.55, -0.2, hull, turret); box(0.9, 0.3, 0.9, 0, 1.9, -0.3, dark, turret);
    pivot.position.set(0, 1.55, 0.7); turret.add(pivot); cyl(0.09, 0.11, 2.2, 0, 0, 1.0, dark, pivot, Math.PI / 2); cyl(0.12, 0.12, 0.2, 0, 0, 2.1, glow, pivot, Math.PI / 2);
    o.muzzle = 2.2;
  } else {
    const hull = vmat([226, 222, 236], { metalness: 0.5, roughness: 0.3 }), dark = vmat([50, 28, 90], { metalness: 0.6, roughness: 0.35 }), glow = vglow([200, 110, 255]);
    box(0.7, 0.45, 2.4, 0, 0.85, 0, hull); box(0.5, 0.3, 1.0, 0, 0.85, 1.4, hull, g, -0.35);
    box(0.25, 0.7, 0.9, 0, 1.2, -0.7, dark); box(1.9, 0.08, 0.4, 0, 0.9, -1.0, dark);
    for (const sd of [-1, 1]) { box(0.08, 0.14, 1.8, sd * 0.4, 0.62, 0, glow); box(0.12, 0.12, 0.7, sd * 0.95, 0.95, -1.0, glow); }
    cyl(0.5, 0.5, 0.07, 0, 0.42, 0, glow);
    pivot.position.set(0, 1.0, 0.8); turret.add(pivot); cyl(0.04, 0.05, 0.9, 0.18, 0, 0.5, dark, pivot, Math.PI / 2); cyl(0.04, 0.05, 0.9, -0.18, 0, 0.5, dark, pivot, Math.PI / 2);
    o.muzzle = 1.0;
  }
  o.g = g; return o;
}
const FREE_R = 8;
function vHits(x, y, r) {                                                        // how many probe points around the hull touch a wall
  let n = solid(x, y) ? 4 : 0;
  for (let i = 0; i < FREE_R; i++) { const a = i / FREE_R * TAU; if (solid(x + Math.cos(a) * r, y + Math.sin(a) * r)) n++; }
  return n;
}
const vBlocked = (x, y, r) => vHits(x, y, r) > 0;
function spawnVehicle(x, y, h) {
  const T = VTYPES[themeKey], m = buildVehicleMesh(themeKey);
  const v = { x, y, h: h || 0, sp: 0, hp: T.hp, T, g: m.g, turret: m.turret, pivot: m.pivot, muzzle: m.muzzle, cd: 0, ph: Math.random() * 6, dead: false, ta: h || 0, smokeT: 0 };
  entRoot.add(m.g); vehicles.push(v); return v;
}
function spawnVehicleNear(minR = 6, maxR = 11) {
  const T = VTYPES[themeKey]; let tries = 0;
  while (tries++ < 200) {
    const a = Math.random() * TAU, r = minR + Math.random() * (maxR - minR), x = P.x + Math.cos(a) * r, y = P.y + Math.sin(a) * r;
    if (!vBlocked(x, y, T.r + 0.4)) return spawnVehicle(x, y, Math.atan2(P.y - y, P.x - x));
  }
  return null;
}
function clearVehicles() { for (const v of vehicles) entRoot.remove(v.g); vehicles.length = 0; drv = null; engineSet(0); }
const nearVehicle = () => { let b = null, bd = 3.4; for (const v of vehicles) { if (v.dead) continue; const d = Math.hypot(v.x - P.x, v.y - P.y); if (d < bd) { bd = d; b = v; } } return b; };

// ---------- enter / exit ----------
function toggleVehicle() {
  if (state !== "play" || tut) return;
  if (drv) { exitVehicle(false); return; }
  const v = nearVehicle(); if (!v) return;
  drv = v; mouseDown = false; autoFire = false; adsHeld = false; P.jz = 0; P.jv = 0; P.reload = 0;
  P.a = v.h; P.x = v.x; P.y = v.y; toast = 2.2; toastText = `DRIVING ${v.T.name}  ·  E to exit`;
  beep(180, 0.15, "square", 0.08, -60); noise(0.1, 0.1); engineSet(1);
}
function exitVehicle(forced) {
  const v = drv; if (!v) return;
  drv = null; v.sp *= 0.5; engineSet(0);
  const sx = -Math.sin(v.h), sy = Math.cos(v.h);
  for (const [side, dist] of [[1, 2.3], [-1, 2.3], [1, 3.2], [-1, 3.2], [0, -3.4], [0, 3.6]]) {
    const x = side ? v.x + sx * side * dist : v.x + Math.cos(v.h) * dist, y = side ? v.y + sy * side * dist : v.y + Math.sin(v.h) * dist;
    if (!solid(x, y) && !solid(x + 0.3, y) && !solid(x - 0.3, y) && !solid(x, y + 0.3) && !solid(x, y - 0.3)) { P.x = x; P.y = y; break; }
  }
  P.swapT = 0.3; if (!forced) { toast = 1.2; toastText = "ON FOOT"; beep(260, 0.08, "triangle", 0.07, 120); }
}

// ---------- driving ----------
function driveUpdate(dt) {
  const v = drv, T = v.T;
  v.cd -= dt;
  const thr = clamp((keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - (touchMove.active ? touchMove.y : 0), -1, 1);
  const st = clamp((keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + (touchMove.active ? touchMove.x : 0), -1, 1);
  const boost = running() ? 1.3 : 1, target = thr * T.vmax * (thr < 0 ? 0.5 : 1) * boost;
  const rate = (Math.abs(target) > Math.abs(v.sp) && Math.sign(target) === Math.sign(v.sp || target) ? T.acc : T.acc * 1.6) * dt;
  v.sp += clamp(target - v.sp, -rate, rate);
  const turn = st * T.turn * dt * clamp(0.4 + Math.abs(v.sp) / T.vmax, 0.4, 1) * (v.sp < -0.3 ? -1 : 1);
  v.h += turn; P.a += turn;
  const dx = Math.cos(v.h) * v.sp * dt / CELL, dy = Math.sin(v.h) * v.sp * dt / CELL, ox = v.x, oy = v.y;
  const h0 = vHits(v.x, v.y, T.r);                                                // moving is allowed if it does not push deeper into a wall (lets a wedged vehicle back out)
  { const n = vHits(v.x + dx, v.y, T.r); if (n === 0 || n <= h0) v.x += dx; }
  { const n = vHits(v.x, v.y + dy, T.r), h1 = vHits(v.x, v.y, T.r); if (n === 0 || n <= h1) v.y += dy; }
  const moved = Math.hypot(v.x - ox, v.y - oy) * CELL / Math.max(dt, 1e-4);
  if (Math.abs(v.sp) > 2 && moved < Math.abs(v.sp) * 0.35) { if (Math.abs(v.sp) > 4) { shake = Math.max(shake, 0.5); beep(70, 0.1, "square", 0.1, -30); damageVehicle(v, Math.abs(v.sp) * 0.8, true); } v.sp *= 0.3; }
  P.x = v.x; P.y = v.y; P.moving = Math.abs(v.sp) > 0.4; P.jz = 0; bob += dt * Math.abs(v.sp) * 0.8;
  if (Math.abs(v.sp) > 0.8 && !T.hover && Math.random() < dt * 22) dust(v.x * CELL - Math.cos(v.h) * 2, groundH(v.x * CELL, v.y * CELL) + 0.2, v.y * CELL - Math.sin(v.h) * 2, 1, TH.key === "ww1" ? 0x6a5a40 : 0x778899, 0.5, 1, 1.2);
  if (T.hover && Math.abs(v.sp) > 1 && Math.random() < dt * 25) sparks(v.x * CELL - Math.cos(v.h) * 2, groundH(v.x * CELL, v.y * CELL) + 0.3, v.y * CELL - Math.sin(v.h) * 2, 1, [T.shell], 1.5);
  if (Math.abs(v.sp) > 2) for (const e of enemies.slice()) {                    // run them over
    if (Math.hypot(e.x - v.x, e.y - v.y) < T.r + 0.35) { noise(0.15, 0.2); hitEnemy(e, 99, false, null, { dir: new THREE.Vector3(Math.cos(v.h), 0.2, Math.sin(v.h)), kind: "blast", power: 0.5 }); }
  }
  if (mouseDown || keys.KeyZ || (T.auto && autoFire)) driveFire();
}
function driveFire() {
  const v = drv, T = v.T; if (!v || v.cd > 0) return;
  v.cd = T.cd; recoil = 1; shake = Math.max(shake, T.rad ? 0.7 : 0.15); camKick += T.rad ? 0.03 : 0.004;
  if (range) range.shots++;
  camera.getWorldDirection(_fw); _rt.set(1, 0, 0).applyQuaternion(camera.quaternion); _up.set(0, 1, 0).applyQuaternion(camera.quaternion);
  const sp = T.rad ? 0.004 : 0.012; _rd.copy(_fw).addScaledVector(_rt, rs() * sp).addScaledVector(_up, rs() * sp).normalize(); _ro.copy(camera.position);
  const wall = castWorld(_ro, _rd, 200), en = castEnemies(_ro, _rd, enemies, wall ? wall.t : 200);
  const rt = range ? castTargets(_ro, _rd, Math.min(wall ? wall.t : 200, en ? en.t : 200)) : null;
  const mz = _tmpA.copy(camera.position).addScaledVector(_fw, v.muzzle + 0.4).addScaledVector(_up, -0.55);
  let hitP = null;
  if (rt) { hitP = rt.p.clone(); hitTarget(rt); }
  else if (en) { hitP = _tmpB.copy(_ro).addScaledVector(_rd, en.t).clone(); if (!T.rad) hitEnemy(en.e, T.dmg * (en.head ? 2 : 1), en.head, hitP, { dir: _rd.clone(), kind: "bullet" }); }
  else if (wall) { hitP = wall.p.clone(); if (!T.rad) { addHole(wall.p, wall.n); sparks(wall.p.x, wall.p.y, wall.p.z, 6, TH.wallHit, 4, wall.n.x, wall.n.y, wall.n.z); } }
  addTracer(mz, hitP || _tmpB.copy(_ro).addScaledVector(_rd, 200).clone(), T.shell, T.rad ? 190 : 330, T.rad ? 4 : 7);
  pushLight(mz.x, mz.y, mz.z, T.shell, T.rad ? 60 : 22, 0.1);
  if (T.rad) {
    noise(0.35, 0.45); beep(70, 0.35, "sawtooth", 0.25, -35); dust(mz.x + _fw.x, mz.y, mz.z + _fw.z, 6, 0x999999, 0.6, 2, 1.2);
    if (hitP) setTimeout(() => { if (state === "play" || state === "paused") explode({ p: hitP, own: true, rad: T.rad, dmg: T.dmg }); }, Math.min(500, hitP.distanceTo(_ro) / 190 * 1000));
    for (const e of enemies) if (Math.hypot(e.x - P.x, e.y - P.y) < 40) e.alert = true;
  } else { TH.shot("rifle"); for (const e of enemies) if (Math.hypot(e.x - P.x, e.y - P.y) < 24) e.alert = true; }
}

// ---------- damage & destruction ----------
function damagePlayer(dmg, src) {                                                // all incoming bullet damage goes through here
  if (drv) { damageVehicle(drv, dmg * 4, false); hurt = 0.15; shake = Math.max(shake, 0.25); if (src) addDmgInd(src.x, src.y); beep(110, 0.08, "square", 0.1, -20); return; }
  P.hp -= Math.max(1, Math.round(dmg * heroMul())); hurt = 0.4; shake = Math.max(shake, 0.3); camKick += 0.02; if (src) addDmgInd(src.x, src.y); beep(80, 0.2, "sawtooth", 0.15, -40);
}
function damageVehicle(v, amt, raw) {
  if (v.dead) return;
  v.hp -= raw ? amt : amt * v.T.armor; sparks(v.x * CELL, groundH(v.x * CELL, v.y * CELL) + 1.5, v.y * CELL, 3, [0xffe9a0], 3);
  if (v.hp <= 0) destroyVehicle(v);
}
function destroyVehicle(v) {
  v.dead = true; v.hp = 0; v.sp = 0;
  const wasDriven = v === drv; if (wasDriven) { exitVehicle(true); P.hp -= 25; hurt = 0.8; toast = 2.4; toastText = "VEHICLE DESTROYED"; feed("VEHICLE DESTROYED", "#f88"); }
  const x = v.x * CELL, z = v.y * CELL, y = groundH(x, z) + 1;
  explode({ p: new THREE.Vector3(x, y, z), own: false, rad: 9, dmg: 10, vehicle: v });
  v.g.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.multiplyScalar(0.12); m.material.emissiveIntensity = 0; m.material.metalness = 0.2; } });
  v.pivot.rotation.x = -0.4; v.turret.rotation.y += 0.5; v.burn = 40; v.dead = true;
}
function vehicleExplosionHits(g, pc, pyc) {                                      // called from explode(): player / vehicle damage from blasts
  if (g.own) return;
  const dp = Math.hypot(P.x - pc, P.y - pyc) * CELL, R = 7;
  if (dp < R && !(drv && g.vehicle === drv)) {
    const amt = 60 * (1 - dp / R);
    if (drv) damageVehicle(drv, amt * 0.5, false); else { P.hp -= Math.round(amt * heroMul()); hurt = 0.7; addDmgInd(pc, pyc); }
  }
}

// ---------- per-frame visuals ----------
const _vt = performance.now();
function syncVehicles(dt) {
  const T = performance.now() / 1000;
  for (const v of vehicles) {
    const g = v.g, wx = v.x * CELL, wz = v.y * CELL, gy = groundH(wx, wz), fx = Math.cos(v.h), fz = Math.sin(v.h), L = v.T.len / 2, W = v.T.wid / 2;
    const hF = groundH(wx + fx * L, wz + fz * L), hB = groundH(wx - fx * L, wz - fz * L), hR = groundH(wx + fz * W, wz - fx * W), hL = groundH(wx - fz * W, wz + fx * W);
    const hov = v.dead ? 0.1 : v.T.hover ? v.T.hover + Math.sin(T * 2.2 + v.ph) * 0.07 : 0;
    g.position.set(wx, Math.max(gy, (hF + hB) / 2 * 0.5 + gy * 0.5) + hov, wz);
    g.rotation.order = "YXZ"; g.rotation.y = Math.PI / 2 - v.h; g.rotation.x = -Math.atan2(hF - hB, v.T.len) * 0.9; g.rotation.z = Math.atan2(hR - hL, v.T.wid) * 0.9 + (v.dead ? 0.08 : 0);
    if (!v.dead) { v.ta = v === drv ? P.a : v.ta + Math.atan2(Math.sin(v.h - v.ta), Math.cos(v.h - v.ta)) * Math.min(1, dt * 2); v.turret.rotation.y = v.h - v.ta; v.pivot.rotation.x = v === drv ? -clamp(P.pitch, -0.25, 0.6) : 0; }
    if (v.dead && v.burn > 0) { v.burn -= dt; if (Math.random() < dt * 14) fxSmoke.spawn(wx + rs() * 0.8, gy + 1.8, wz + rs() * 0.8, rs() * 0.3, 1.4 + rnd(), rs() * 0.3, 0.9 + rnd() * 0.7, 2.2 + rnd(), 0x202020, 0.55, 0.3, 1.4, 0.3); if (Math.random() < dt * 8) fxAdd.spawn(wx + rs() * 0.7, gy + 1.5, wz + rs() * 0.7, rs() * 0.4, 1.4 + rnd(), rs() * 0.4, 0.5 + rnd() * 0.5, 0.5 + rnd() * 0.3, 0xff7a20, 0.9, 1, 0.8, 0.2); }
    else if (!v.dead && v.hp < v.T.hp * 0.4 && Math.random() < dt * (v.hp < v.T.hp * 0.2 ? 16 : 7)) fxSmoke.spawn(wx + rs() * 0.5, gy + 1.9, wz + rs() * 0.5, rs() * 0.3, 1.2 + rnd(), rs() * 0.3, 0.6 + rnd() * 0.5, 1.6 + rnd(), v.hp < v.T.hp * 0.2 ? 0x1a1a1a : 0x6a6a6a, 0.5, 0.3, 1.2, 0.3);
  }
  engineSet(drv && state === "play" ? 1 : 0);
}

// ---------- engine sound ----------
let _eng = null;
function engineSet(on) {
  if (!actx) return;
  if (!_eng && on && drv) {
    const o = actx.createOscillator(), o2 = actx.createOscillator(), gn = actx.createGain(), lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600; gn.gain.value = 0;
    o.connect(lp); o2.connect(lp); lp.connect(gn); gn.connect(actx.destination); o.start(); o2.start(); _eng = { o, o2, gn };
  }
  if (!_eng) return;
  if (on && drv) { const e = drv.T.engine, f = e[0] + Math.abs(drv.sp) * e[1]; _eng.o.type = e[2]; _eng.o2.type = e[2]; _eng.o.frequency.setTargetAtTime(f, actx.currentTime, 0.08); _eng.o2.frequency.setTargetAtTime(f * 1.5, actx.currentTime, 0.08); _eng.gn.gain.setTargetAtTime(0.045 + Math.abs(drv.sp) / drv.T.vmax * 0.04, actx.currentTime, 0.1); }
  else _eng.gn.gain.setTargetAtTime(0, actx.currentTime, 0.1);
}

// ---------- HUD ----------
function drawVehicleHUD(W, H, u, font, A) {
  const T = touchMode;
  if (drv) {
    const v = drv, T0 = v.T;
    if (T0.cockpit) { hud.fillStyle = "rgba(6,8,6,0.88)"; hud.fillRect(0, 0, W, H * 0.07); hud.fillRect(0, H * 0.9, W, H * 0.1); hud.fillRect(0, 0, W * 0.035, H); hud.fillRect(W * 0.965, 0, W * 0.035, H); }
    const pw = 340 * u, x0 = W / 2 - pw / 2, y0 = H - (T ? 150 : 108) * u;
    hud.fillStyle = "rgba(0,0,0,0.5)"; hud.fillRect(x0, y0, pw, 62 * u);
    hud.textAlign = "left"; hud.fillStyle = A; hud.font = font(13); hud.fillText(T0.name, x0 + 12 * u, y0 + 14 * u);
    hud.fillStyle = "#fff"; hud.font = font(22); hud.fillText(`${Math.round(Math.abs(v.sp) * 3.6)} km/h`, x0 + 12 * u, y0 + 40 * u);
    const f = clamp(v.hp / T0.hp, 0, 1); hud.fillStyle = "rgba(255,255,255,0.2)"; hud.fillRect(x0 + 130 * u, y0 + 32 * u, 198 * u, 10 * u); hud.fillStyle = f < 0.3 ? "#ff5a4a" : f < 0.6 ? "#fd6" : "#7dff9a"; hud.fillRect(x0 + 130 * u, y0 + 32 * u, 198 * u * f, 10 * u);
    hud.font = font(10); hud.fillStyle = "rgba(255,255,255,0.7)"; hud.textAlign = "right"; hud.fillText("ARMOR", x0 + pw - 12 * u, y0 + 14 * u);
    if (!T0.auto) { const c = clamp(1 - v.cd / T0.cd, 0, 1); hud.fillStyle = "rgba(255,255,255,0.2)"; hud.fillRect(x0 + 130 * u, y0 + 50 * u, 198 * u, 4 * u); hud.fillStyle = c >= 1 ? "#fff" : A; hud.fillRect(x0 + 130 * u, y0 + 50 * u, 198 * u * c, 4 * u); }
    hud.textAlign = "center"; hud.fillStyle = "rgba(255,255,255,0.6)"; hud.font = font(10, false); if (!T) hud.fillText("W/S drive · A/D steer · click fire · E exit", W / 2, y0 + 78 * u);
    hud.textAlign = "left";
  } else {
    const n = nearVehicle();
    if (n && !T) { hud.textAlign = "center"; hud.fillStyle = "#fff"; hud.shadowColor = "#000"; hud.shadowBlur = 6; hud.font = font(20); hud.fillText(`PRESS E  —  ENTER ${n.T.name}`, W / 2, H * 0.62); hud.shadowBlur = 0; hud.textAlign = "left"; }
  }
  for (const v of vehicles) {                                                    // world markers
    if (v === drv) continue;
    const d = Math.hypot(v.x - P.x, v.y - P.y) * CELL; if (d > 70) continue;
    _pv.set(v.x * CELL, groundH(v.x * CELL, v.y * CELL) + 3.4, v.y * CELL).project(camera);
    if (_pv.z > 1 || Math.abs(_pv.x) > 1.05 || Math.abs(_pv.y) > 1.05) continue;
    const x = (_pv.x * 0.5 + 0.5) * W, y = (-_pv.y * 0.5 + 0.5) * H;
    hud.fillStyle = v.dead ? "#888" : "#5ac8ff"; hud.beginPath(); hud.moveTo(x, y + 4 * u); hud.lineTo(x - 7 * u, y - 7 * u); hud.lineTo(x + 7 * u, y - 7 * u); hud.closePath(); hud.fill();
    hud.font = font(11); hud.textAlign = "center"; hud.fillStyle = "#fff"; hud.fillText(`${v.dead ? "WRECK" : v.T.name}  ${Math.round(d)} m`, x, y - 16 * u); hud.textAlign = "left";
  }
}
