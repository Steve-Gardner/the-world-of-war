// ===================== tutorial mode =====================
// A guided training arena: each step asks for one action and advances when you do it.
function genTutorialMap() {
  const m = Array.from({ length: MH }, (_, y) => Array.from({ length: MW }, (_, x) => (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) ? 3 : 0));
  const wall = (x0, y0, w, h, t) => { for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) m[y][x] = t; };
  wall(34, 28, 12, 1, 1); wall(30, 52, 6, 1, 2); wall(44, 52, 6, 1, 2); wall(20, 36, 1, 8, 1); wall(60, 36, 1, 8, 1);   // simple cover to look at
  return m;
}

function newTut() { return { step: 0, t: 0, lookAcc: 0, dist: 0, runT: 0, adsT: 0, zT: 0, hits: 0, doneT: 0, lastA: 0, lastP: 0, lastX: 0, lastY: 0, pending: [], f: { jump: false, head: false, reloaded: false, sw: new Set(), knife: false, blastKills: 0, picks: 0, enter: false } }; }

function addDummy(fwd, side, opts = {}) {
  const ca = Math.cos(P.a), sa = Math.sin(P.a);
  let x = P.x + ca * fwd - sa * side, y = P.y + sa * fwd + ca * side;
  x = clamp(x, 4, MW - 4); y = clamp(y, 4, MH - 4);
  const T = TH.types.rifle;
  const e = Object.assign({ x, y, type: "rifle", hp: 2, cd: 99, pain: 0, fired: 0, aiming: false, moving: false, face: Math.atan2(P.y - y, P.x - x), wk: 1, sdir: 1, st: 99, ph: 0, spd: 0, alert: true, dummy: true }, opts);
  makeRig(e, TH.soldiers.rifle, T.scale); enemies.push(e); return e;
}
function clearDummies() { for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].dummy) { entRoot.remove(enemies[i].rig.holder); enemies.splice(i, 1); } }
function spawnDummies(n) { clearDummies(); for (let i = 0; i < n; i++) addDummy(10 + Math.random() * 6, (i - (n - 1) / 2) * 4.5 + rs() * 1.5); }

const TUT_STEPS = [
  { title: "LOOK AROUND", tText: "Drag your thumb on the right side of the screen to look around.", tKey: "DRAG", text: "Move the mouse to look around. Look up at the sky and down at the ground.", key: "MOUSE", prog: () => [tut.lookAcc, 4], check: () => tut.lookAcc >= 4 },
  { title: "MOVE", tText: "Use the left thumbstick to walk around.", tKey: "STICK", text: "Walk around with W A S D.", key: "W A S D", prog: () => [tut.dist, 12], check: () => tut.dist >= 12 },
  { title: "JUMP", tText: "Tap the JUMP button.", tKey: "JUMP", text: "Press SPACE to jump.", key: "SPACE", check: () => tut.f.jump },
  { title: "RUN", tText: "Push the thumbstick all the way to run.", tKey: "PUSH FAR", text: "Hold C (or SHIFT) while moving to run.", key: "HOLD C", prog: () => [tut.runT, 1.5], check: () => tut.runT >= 1.5 },
  { title: "SHOOT", tText: "Hold the big FIRE button to shoot. Slide that same thumb to aim while firing.", tKey: "FIRE", text: "Click to fire at the targets. Hit them 3 times.", key: "CLICK", enter: () => { P.w = "primary"; P.swapT = 0.3; spawnDummies(3); }, prog: () => [tut.hits, 3], check: () => tut.hits >= 3 },
  { title: "AIM DOWN SIGHTS", tText: "Tap AIM to zoom in for steady shots. Tap again to zoom out.", tKey: "AIM", text: "Hold N (or right-click) to zoom in. Aimed shots are steadier and more accurate.", key: "HOLD N", prog: () => [tut.adsT, 1.5], check: () => tut.adsT >= 1.5 },
  { title: "HEADSHOT", tText: "Tap AIM, put the crosshair on a head and fire for a headshot kill.", tKey: "AIM + FIRE", text: "Aim at a target's head and shoot for a headshot kill. Headshots deal double damage and bonus points.", key: "AIM + CLICK", enter: () => spawnDummies(2), check: () => tut.f.head },
  { title: "RELOAD", tText: "Tap the RELOAD button when your magazine runs low.", tKey: "RELOAD", text: "Press R to reload when your magazine runs low.", key: "R", enter: () => { clearDummies(); P.w = "primary"; P.ammo.primary.mag = Math.min(P.ammo.primary.mag, TH.weapons.primary.mag - 3); P.ammo.primary.reserve = 90; }, check: () => tut.f.reloaded },
  { title: "HOLD TO SHOOT", desktopOnly: true, text: "Hold Z to keep firing without clicking. Release to stop.", key: "HOLD Z", enter: () => { P.ammo.primary.reserve = 90; spawnDummies(2); }, prog: () => [tut.zT, 1.2], check: () => tut.zT >= 1.2 },
  { title: "SWITCH WEAPONS", tText: "Tap the weapon button to cycle: pistol, knife, rifle.", tKey: "SWAP", text: "Press 1 for your pistol, 2 for the knife and 3 for the rifle. The mouse wheel and Q also swap weapons.", key: "1   2   3", enter: () => { clearDummies(); tut.f.sw = new Set([P.w]); }, prog: () => [tut.f.sw.size, 3], check: () => tut.f.sw.size >= 3 },
  { title: "SILENT KNIFE KILL", tText: "Switch to the knife and sneak up on the soldier with his back to you. Tap FIRE to stab him before he notices.", tKey: "KNIFE + FIRE", text: "Equip the knife (2) and sneak up on the soldier who has his back to you. Stab him before he notices. Enemies you haven't alerted die instantly.", key: "2 + CLICK", enter: () => { clearDummies(); addDummy(9, 0, { face: P.a, alert: false, unaware: true }); }, check: () => tut.f.knife },
  { title: "GRENADES", tText: "Tap the grenade button to throw at the group of targets. Stay out of the blast!", tKey: "GRENADE", text: "Press G to throw a grenade at the group of targets. Stay out of the blast!", key: "G", enter: () => { clearDummies(); P.grenades = Math.max(P.grenades, 3); for (let i = 0; i < 4; i++) addDummy(13 + rs() * 1.2, (i - 1.5) * 1.1); }, prog: () => [tut.f.blastKills, 2], check: () => tut.f.blastKills >= 2 },
  { title: "PICKUPS", tText: "Walk over the glowing packs to collect health and ammo.", tKey: "WALK OVER", text: "Walk over the glowing packs to collect health and ammo. Defeated enemies drop them in the real game.", key: "WALK OVER", enter: () => { clearDummies(); const ca = Math.cos(P.a), sa = Math.sin(P.a); addPickup({ x: P.x + ca * 5 - sa * 3, y: P.y + sa * 5 + ca * 3 }, "health"); addPickup({ x: P.x + ca * 6 + sa * 3, y: P.y + sa * 6 - ca * 3 }, "ammo"); }, prog: () => [tut.f.picks, 2], check: () => tut.f.picks >= 2 },
  { title: "ALLIES & WAVES", tText: "In the real game, waves of enemies attack and friendly soldiers fight beside you (green markers). Tap NEXT to continue.", tKey: "NEXT", text: "In the real game, waves of enemies attack and friendly soldiers fight beside you (green markers). Defeat every hostile to start the next wave. Press ENTER to continue.", key: "ENTER", enter: () => { wave = 1; topUpAllies(); }, check: () => tut.f.enter },
  { title: "TUTORIAL COMPLETE", tText: "You're ready for the battlefield. Tap PLAY to start a real game, or MENU to go back.", tKey: "PLAY", text: "You're ready for the battlefield. Press L to start a real game, or X to go back to the menu.", key: "L", final: true },
];

function tutEnter() {
  const s = TUT_STEPS[tut.step];
  tut.hits = 0; tut.runT = 0; tut.adsT = 0; tut.zT = 0; tut.lookAcc = 0; tut.dist = 0; tut.f.jump = false; tut.f.head = false; tut.f.reloaded = false; tut.f.knife = false; tut.f.blastKills = 0; tut.f.picks = 0; tut.f.enter = false;
  tut.pending.length = 0; tut.cool = 0;
  if (s.enter) s.enter();
}
function dummyUpdate(e, dt) { e.pain -= dt; e.fired = 0; e.moving = false; e.aiming = false; if (e.unaware) e.alert = false; else e.face = Math.atan2(P.y - e.y, P.x - e.x); }
function setupTutorial() { waveBanner = 0; tut.step = 0; tut.lastA = P.a; tut.lastP = P.pitch; tut.lastX = P.x; tut.lastY = P.y; wave = 0; P.ammo.primary.reserve = 90; tutEnter(); }

function tutUpdate(dt) {
  const s = TUT_STEPS[tut.step];
  tut.t += dt; tut.doneT = Math.max(0, tut.doneT - dt);
  tut.lookAcc += Math.abs(Math.atan2(Math.sin(P.a - tut.lastA), Math.cos(P.a - tut.lastA))) + Math.abs(P.pitch - tut.lastP);
  tut.dist += Math.hypot(P.x - tut.lastX, P.y - tut.lastY);
  tut.lastA = P.a; tut.lastP = P.pitch; tut.lastX = P.x; tut.lastY = P.y;
  if (running() && P.moving && P.jz <= 0) tut.runT += dt;
  if (adsAmt > 0.8) tut.adsT += dt;
  if (keys.KeyZ) tut.zT += dt;
  for (let i = tut.pending.length - 1; i >= 0; i--) { const q = tut.pending[i]; q.t -= dt; if (q.t <= 0) { q.fn(); tut.pending.splice(i, 1); } }
  P.hp = 100;                                                                      // can't be hurt in training
  if (s.final || tut.cool > 0) { tut.cool = Math.max(0, (tut.cool || 0) - dt); if (tut.cool > 0 || s.final) return; }
  if (s.check && s.check()) {
    beep(660, 0.1, "triangle", 0.1, 300); beep(990, 0.14, "triangle", 0.08, 200);
    tut.doneT = 1.0; tut.step++; while (touchMode && TUT_STEPS[tut.step].desktopOnly) tut.step++; tutEnter(); tut.cool = 0.9;
  }
}
function tutSkip() { if (!tut) return; const s = TUT_STEPS[tut.step]; if (s.final) return; tut.step++; while (touchMode && TUT_STEPS[tut.step].desktopOnly) tut.step++; tutEnter(); tut.doneT = 0.8; tut.cool = 0.4; }

// events fired from gameplay code
function tutKill(e, head, info) {
  if (head) tut.f.head = true;
  if (info && info.kind === "melee") tut.f.knife = true;
  if (info && info.kind === "blast") tut.f.blastKills++;
  const id = TUT_STEPS[tut.step].title;
  if (e.dummy && (id === "SHOOT" || id === "HEADSHOT" || id === "HOLD TO SHOOT")) tut.pending.push({ t: 1.4, fn: () => { if (enemies.filter(x => x.dummy).length < 3) addDummy(10 + Math.random() * 6, (Math.random() - 0.5) * 12); } });
}

// ---------- start / finish ----------
function startTutorial() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  tut = newTut(); spawnIdx = 4; spawnPicked = false; fresh = false;
  state = "menu"; reset();
  state = "play"; restartEl.style.display = "none"; overlay.style.display = "none";
  try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) {}
}
function exitTutorial() {
  tut = null; state = "menu"; mouseDown = false; adsHeld = false;
  document.exitPointerLock && document.exitPointerLock();
  titleEl.textContent = "THE WORLD OF WAR"; cardsEl.style.display = "flex"; restartEl.style.display = "none"; tutBtn.style.display = "block";
  exitTutBtn.style.display = "none"; setHint("Click an era to play · ← → switch · 1–5 pick spawn · H tutorial · or press L", "Tap an era to play");
  overlay.style.display = "flex"; selectTheme(themeKey);
}
function finishTutorial() { tut = null; state = "menu"; fresh = false; spawnPicked = false; startGame(); }

// ---------- HUD: step panel + target markers ----------
function wrapLines(g, text, maxW) {
  const words = text.split(" "), lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
const _pv = new THREE.Vector3();
function drawTutorial(W, H, u, font, A) {
  const s = TUT_STEPS[tut.step], n = TUT_STEPS.length, T = performance.now() / 1000, tc = touchMode;
  const stText = tc ? (s.tText || s.text) : s.text, stKey = tc ? (s.tKey || s.key) : s.key;
  // world markers over targets / pickups
  const mark = (pos, label, col) => {
    _pv.copy(pos).project(camera); if (_pv.z > 1 || Math.abs(_pv.x) > 1.05 || Math.abs(_pv.y) > 1.05) return;
    const x = (_pv.x * 0.5 + 0.5) * W, y = (-_pv.y * 0.5 + 0.5) * H, bob = Math.sin(T * 4) * 3 * u;
    hud.fillStyle = col; hud.strokeStyle = "rgba(0,0,0,0.7)"; hud.lineWidth = 2 * u;
    hud.beginPath(); hud.moveTo(x, y + bob + 4 * u); hud.lineTo(x - 8 * u, y + bob - 8 * u); hud.lineTo(x + 8 * u, y + bob - 8 * u); hud.closePath(); hud.stroke(); hud.fill();
    hud.font = font(11); hud.textAlign = "center"; hud.fillStyle = "#fff"; hud.fillText(label, x, y + bob - 16 * u);
  };
  if (!s.final) {
    for (const e of enemies) if (e.dummy) { const p = wpos(e, 2.25); mark(p, e.unaware ? "SNEAK UP" : "TARGET", e.unaware ? "#ffd24a" : "#ff6a5a"); }
    for (const k of pickups) mark(wpos(k, 1.1), "PICK UP", "#7dff9a");
  }
  // panel
  const pw = tc ? Math.min(W * 0.46, 430 * u) : Math.min(W - 40 * u, 700 * u), px = (W - pw) / 2, kw = tc ? 92 * u : 170 * u;
  hud.font = font(tc ? 13 : 15, false); const lines = wrapLines(hud, stText, pw - kw - 56 * u);
  const lh = (tc ? 18 : 22) * u, ph = (tc ? 70 : 92) * u + lines.length * lh, py = tc ? 74 * u : H - 150 * u - ph;
  hud.save();
  hud.fillStyle = "rgba(6,10,16,0.72)"; hud.fillRect(px, py, pw, ph);
  hud.fillStyle = tut.doneT > 0 ? "#6f9" : A; hud.fillRect(px, py, pw, 3 * u);
  hud.textAlign = "left"; hud.fillStyle = A; hud.font = font(12); hud.fillText(`TUTORIAL  ${tut.step + 1} / ${n}`, px + 18 * u, py + 20 * u);
  hud.fillStyle = "#fff"; hud.font = font(tc ? 18 : 24); hud.fillText(s.title, px + 18 * u, py + (tc ? 40 : 46) * u);
  hud.fillStyle = "rgba(255,255,255,0.88)"; hud.font = font(tc ? 13 : 15, false);
  lines.forEach((l, i) => hud.fillText(l, px + 18 * u, py + (tc ? 62 : 72) * u + i * lh));
  // key chip
  const cw = kw, chh = (tc ? 40 : 52) * u, chx = px + pw - cw - 14 * u, chy = py + 20 * u;
  hud.fillStyle = "rgba(255,255,255,0.1)"; hud.fillRect(chx, chy, cw, chh); hud.strokeStyle = A; hud.lineWidth = 2 * u; hud.strokeRect(chx, chy, cw, chh);
  hud.textAlign = "center"; hud.fillStyle = "#fff"; hud.font = font(stKey.length > 9 ? (tc ? 11 : 17) : (tc ? 14 : 22)); hud.fillText(stKey, chx + cw / 2, chy + chh / 2);
  // progress for this step
  if (s.prog) { const [cur, max] = s.prog(), f = clamp(cur / max, 0, 1); hud.fillStyle = "rgba(255,255,255,0.15)"; hud.fillRect(chx, chy + chh + 8 * u, cw, 6 * u); hud.fillStyle = f >= 1 ? "#6f9" : A; hud.fillRect(chx, chy + chh + 8 * u, cw * f, 6 * u); }
  // step dots
  const dw = (pw - 36 * u) / n;
  for (let i = 0; i < n; i++) { hud.fillStyle = i < tut.step ? "#6f9" : i === tut.step ? A : "rgba(255,255,255,0.2)"; hud.fillRect(px + 18 * u + i * dw, py + ph - 16 * u, dw - 3 * u, 4 * u); }
  hud.textAlign = "right"; hud.fillStyle = "rgba(255,255,255,0.5)"; hud.font = font(10, false);
  if (!tc) hud.fillText("TAB skip step  ·  ESC pause  ·  X exit tutorial (when paused)", px + pw - 14 * u, py + ph - 24 * u);
  if (tut.doneT > 0) { hud.globalAlpha = Math.min(1, tut.doneT * 2); hud.textAlign = "center"; hud.fillStyle = "#6f9"; hud.font = font(30); hud.fillText("✓ STEP COMPLETE", W / 2, H * 0.3); }
  hud.restore();
}
