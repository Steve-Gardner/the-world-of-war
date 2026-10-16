// ===================== input, menu, main loop =====================
let fresh = false;
function selectTheme(key) {
  themeKey = key; TH = THEMES[key];
  buildThemeRes(TH); buildViewModels(TH);
  gunScene.environment = themeRes[key].env;
  gunSun.color.copy(hex(TH.sun.color)); gunSun.intensity = TH.sun.intensity * 1.2;
  gunHemi.color.copy(hex(TH.hemi.sky)); gunHemi.groundColor.copy(hex(TH.hemi.ground)); gunHemi.intensity = TH.hemi.intensity;
  for (const c of cardsEl.children) c.classList.toggle("sel", c.dataset.t === key);
  if (state === "menu") subEl.textContent = TH.sub;
  document.documentElement.dataset.theme = key;
  if (state === "menu") { reset(); fresh = true; P.pitch = 0.05; }
}
for (const c of cardsEl.children) c.addEventListener("click", ev => { ev.stopPropagation(); selectTheme(c.dataset.t); startGame(); });

function startGame() {
  if (state === "dying") return;
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === "suspended") actx.resume();
  if (touchMode) goFullscreenLandscape();
  if (state === "dead" || (state === "menu" && (!fresh || spawnPicked))) {
    if (!spawnPicked) spawnIdx = Math.floor(Math.random() * SPAWNS.length);
    spawnPicked = false; reset();
  }
  fresh = false; state = "play"; restartEl.style.display = "none"; tutBtn.style.display = "none"; exitTutBtn.style.display = "none"; overlay.style.display = "none";
  try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) {}
}
function pause() {
  if (state !== "play") return;
  state = "paused"; mouseDown = false; adsHeld = false; autoFire = false;
  titleEl.textContent = "PAUSED"; subEl.textContent = ""; cardsEl.style.display = "none"; restartEl.style.display = "none";
  releaseTouch(); tutBtn.style.display = "none"; bloodBtn.style.display = "block"; exitTutBtn.style.display = tut ? "block" : "none";
  setHint(tut ? "Press L or click to resume  ·  X to exit the tutorial" : "Press L or click to resume", "Tap anywhere to resume"); overlay.style.display = "flex";
}
tutBtn.addEventListener("click", ev => { ev.stopPropagation(); startTutorial(); });
bloodBtn.addEventListener("click", ev => { ev.stopPropagation(); setNoBlood(!noBlood); });
setNoBlood(noBlood);
overlay.addEventListener("click", startGame);
document.addEventListener("pointerlockchange", () => { if (document.pointerLockElement !== canvas) pause(); });

exitTutBtn.addEventListener("click", ev => { ev.stopPropagation(); exitTutorial(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) setTimeout(() => { if (document.hidden) pause(); }, 600); });   // pause when you switch apps/tabs (ignores brief flickers)
function goFullscreenLandscape() {                                            // Android: go fullscreen and lock to landscape (iPhones don't allow this)
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().then(() => { screen.orientation && screen.orientation.lock && screen.orientation.lock("landscape").catch(() => {}); }).catch(() => {});
  } catch (err) {}
}
addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === "Space") { e.preventDefault(); if (!e.repeat) doJump(); }
  if (tut && state === "play") {
    if (e.code === "Enter") tut.f.enter = true;
    if (e.code === "Tab") { e.preventDefault(); tutSkip(); }
    if (e.code === "KeyL" && TUT_STEPS[tut.step].final) { finishTutorial(); return; }
    if (e.code === "KeyX" && TUT_STEPS[tut.step].final) { exitTutorial(); return; }
  }
  if (tut && state === "paused" && e.code === "KeyX") { exitTutorial(); return; }
  if (state === "menu" && e.code === "KeyH") { startTutorial(); return; }
  if (e.code === "KeyB" && state !== "play" && state !== "dying") setNoBlood(!noBlood);
  if (e.code === "KeyN" && state === "play") adsHeld = true;                       // hold N (or right-click) to aim
  if (e.code === "KeyR") { if (state === "dead") { startGame(); return; } startReload(); }
  if (state === "play") {
    if (e.code === "Digit1") setWeapon("pistol");
    if (e.code === "Digit2") setWeapon("knife");
    if (e.code === "Digit3") setWeapon("primary");
    if (e.code === "KeyQ") setWeapon(P.lastW);
    if (e.code === "KeyG") throwGrenade();
  }
  if (state === "menu" || state === "dead") {
    const ti = THEME_ORDER.indexOf(themeKey);
    if (e.code === "ArrowLeft") selectTheme(THEME_ORDER[(ti + 2) % 3]);
    if (e.code === "ArrowRight" || e.code === "KeyT") selectTheme(THEME_ORDER[(ti + 1) % 3]);
    const n = +e.key;
    if (n >= 1 && n <= SPAWNS.length) { spawnIdx = n - 1; spawnPicked = true; setHint(`Spawn ${n} selected`); }
  }
  if ((e.code === "KeyL" || e.code === "Enter") && (state === "menu" || state === "dead" || state === "paused")) startGame();
  if (e.code === "Escape") pause();
});
addEventListener("keyup", e => { keys[e.code] = false; if (e.code === "KeyN") adsHeld = false; });
addEventListener("mousedown", e => { if (touchMode || state !== "play") return; if (e.button === 0) mouseDown = true; if (e.button === 2) adsHeld = true; });
addEventListener("mouseup", e => { if (e.button === 0) mouseDown = false; if (e.button === 2) adsHeld = false; });
addEventListener("contextmenu", e => e.preventDefault());
addEventListener("mousemove", e => {
  if (document.pointerLockElement === canvas && state === "play") {
    const k = 0.0022 * (1 - adsAmt * 0.45);
    P.a += e.movementX * k; P.pitch = clamp(P.pitch - e.movementY * k, -1.35, 1.35);
    lookDX += e.movementX; lookDY += e.movementY;
  }
});
addEventListener("wheel", e => { if (state === "play") setWeapon(WPN[(WPN.indexOf(P.w) + (e.deltaY > 0 ? 1 : 2)) % 3]); }, { passive: true });

// ---------- loop ----------
let last = performance.now(), fpsAcc = 0, fpsN = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  try {
    if (state === "play") update(dt);
    else if (state === "dying") updateDying(dt);
    else if (state === "menu") { P.a += dt * 0.1; }
    renderFrame(dt);
    updateTouchUI();
    if (!qualityDone && gfxSetting === "auto" && state === "play" && !document.hidden && dt < 0.4) {   // adaptive quality: step down only if the device is really slow
      if (qWarm > 0) qWarm--; else { fpsAcc += dt; fpsN++; }
      if (fpsN >= 90) {
        const fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0;
        if (fps < 38) { if (curQ < 2) applyQuality(curQ + 1); else if (PR > 0.5) { PR = Math.max(0.5, PR - 0.12); resize(); } }
        else if (fps > 52) qualityDone = true;
      }
    }
  } catch (err) {
    if (!window.__lastErr) console.error(err);
    window.__lastErr = String((err && err.stack) || err).slice(0, 600);
  }
  requestAnimationFrame(loop);
}
window.__boom = (fwd = 8, side = 0) => { const ca = Math.cos(P.a), sa = Math.sin(P.a), x = (P.x + ca * fwd - sa * side) * CELL, z = (P.y + sa * fwd + ca * side) * CELL; explode({ p: new THREE.Vector3(x, groundH(x, z) + 0.3, z) }); };
window.__prof = () => {
  const out = {}, T = (k, f) => { const t = performance.now(); f(); out[k] = +(performance.now() - t).toFixed(1); };
  T("sync", () => syncEntities(0.016)); T("cam", () => updateCamera(0.016)); T("world", updateWorld); T("vm", () => updateVM(0.016)); T("fx", () => fxUpdate(0.016));
  T("composer", () => composer.render(0.016)); renderer.getContext().finish(); T("finish", () => renderer.getContext().finish()); T("hud", drawHUD);
  T("update", () => { if (state === "play") update(0.016); });
  out.calls = renderer.info.render.calls; out.tris = renderer.info.render.triangles; out.programs = renderer.info.programs.length; out.geos = renderer.info.memory.geometries; out.tex = renderer.info.memory.textures;
  out.pAdd = fxAdd.n; out.pSmoke = fxSmoke.n; return out;
};
window.__g = () => ({ tut, TUT_STEPS, state, P, enemies, allies, corpses, pickups, grenades, wave, score, TH, camera, scene, renderer, composer, THREE, killFeed });
// debug helper: drop a test soldier relative to the player (used for visual checks)
window.__spawn = (type = "rifle", fwd = 4, side = 0, o = {}) => {
  const ca = Math.cos(P.a), sa = Math.sin(P.a), x = P.x + ca * fwd - sa * side, y = P.y + sa * fwd + ca * side;
  const T = TH.types[type === "ally" ? "ally" : type], S = TH.soldiers[type];
  const e = Object.assign({ x, y, type, hp: 99, cd: 99, pain: 0, fired: 0, aiming: false, moving: false, face: P.a + Math.PI, wk: 1, sdir: 1, st: 99, ph: 0, spd: 0, alert: true }, o);
  makeRig(e, S, T.scale); (type === "ally" ? allies : enemies).push(e); return e;
};
window.__hit = (e, dmg = 99, head = false, kind = "bullet", power = 0.8) => hitEnemy(e, dmg, head, null, { dir: new THREE.Vector3(Math.cos(P.a), 0, Math.sin(P.a)), kind, power });
window.__clear = () => { for (const e of enemies) entRoot.remove(e.rig.holder); for (const a of allies) entRoot.remove(a.rig.holder); enemies.length = 0; allies.length = 0; };
selectTheme("ww1");
if (!P) reset();
requestAnimationFrame(loop);
