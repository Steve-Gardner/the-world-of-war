// ===================== touch controls (phones / tablets) =====================
// Left thumb: floating stick (move). Right thumb: drag anywhere to look. Buttons: fire, aim, jump, reload, grenade, swap weapon.
// On PCs none of this is active unless you switch "Controls" to Touch in the menu.
const touchMove = { active: false, x: 0, y: 0 };
let touchRun = false, touchMode = false, ctlSetting = "auto";
const CTL_KEY = "wow_controls";                              // "auto" | "touch" | "desktop"
try { ctlSetting = localStorage.getItem(CTL_KEY) || "auto"; } catch (e) {}

const touchEl = document.createElement("div"); touchEl.id = "touch";
touchEl.innerHTML = `
  <div id="stickHint"></div><div id="stickBase"></div><div id="stickKnob"></div>
  <div class="tb" id="tPause" data-act="pause">II</div>
  <div class="tb" id="tFire" data-act="fire">FIRE</div>
  <div class="tb" id="tAim" data-act="aim">AIM</div>
  <div class="tb" id="tJump" data-act="jump">JUMP</div>
  <div class="tb" id="tReload" data-act="reload">RELOAD</div>
  <div class="tb" id="tGren" data-act="gren">G</div>
  <div class="tb" id="tSwap" data-act="swap">SWAP</div>
  <div class="tb tw" id="tSkip" data-act="tskip">SKIP</div>
  <div class="tb tw" id="tNext" data-act="tnext">NEXT ▶</div>
  <div class="tb tw" id="tPlay" data-act="tplay">PLAY</div>
  <div class="tb tw" id="tMenu" data-act="tmenu">MENU</div>`;
document.body.appendChild(touchEl);
const $t = id => document.getElementById(id);
const stickBase = $t("stickBase"), stickKnob = $t("stickKnob");

const tPtrs = new Map();                                     // pointerId -> {kind, x, y, btn}
let stickId = null, stickOx = 0, stickOy = 0;
const STICK_R = 62;

function releaseTouch() {
  tPtrs.clear(); stickId = null; touchMove.active = false; touchMove.x = touchMove.y = 0; touchRun = false;
  mouseDown = false; stickBase.style.display = stickKnob.style.display = "none"; $t("tFire").classList.remove("on");
}
function applyLook(dx, dy) {
  const sticky = assistTarget(0.14) ? 0.5 : 1;                               // slow down when the crosshair is near an enemy
  const k = 0.0046 * (1 - adsAmt * 0.45) * sticky;
  P.a += dx * k; P.pitch = clamp(P.pitch - dy * k * 0.85, -1.35, 1.35); lookDX += dx; lookDY += dy;
}
function stickUpdate(x, y) {
  let dx = x - stickOx, dy = y - stickOy; const len = Math.hypot(dx, dy), m = Math.min(1, len / STICK_R);
  const dz = 0.14, mag = m < dz ? 0 : (m - dz) / (1 - dz);
  touchMove.x = len ? (dx / len) * mag : 0; touchMove.y = len ? (dy / len) * mag : 0; touchMove.active = mag > 0;
  touchRun = mag > 0.97;                                                     // pushed all the way = run
  if (len > STICK_R) { dx = dx / len * STICK_R; dy = dy / len * STICK_R; }
  stickKnob.style.left = (stickOx + dx - 30) + "px"; stickKnob.style.top = (stickOy + dy - 30) + "px";
}
function pressButton(btn, e) {
  const act = btn.dataset.act;
  tPtrs.set(e.pointerId, { kind: act === "fire" ? "fire" : "btn", x: e.clientX, y: e.clientY, btn });
  try { touchEl.setPointerCapture(e.pointerId); } catch (err) {}
  if (act === "fire") { mouseDown = true; btn.classList.add("on"); }
  else if (act === "aim") { adsHeld = !adsHeld; }
  else if (act === "jump") doJump();
  else if (act === "reload") startReload();
  else if (act === "gren") throwGrenade();
  else if (act === "swap") setWeapon(WPN[(WPN.indexOf(P.w) + 1) % 3]);
  else if (act === "pause") pause();
  else if (tut && act === "tskip") tutSkip();
  else if (tut && act === "tnext") tut.f.enter = true;
  else if (tut && act === "tplay") finishTutorial();
  else if (tut && act === "tmenu") exitTutorial();
}
touchEl.addEventListener("pointerdown", e => {
  if (!touchMode || state !== "play") return;
  e.preventDefault();
  const btn = e.target.closest && e.target.closest(".tb");
  if (btn) return pressButton(btn, e);
  if (e.clientX < innerWidth * 0.45 && stickId === null) {
    stickId = e.pointerId; stickOx = e.clientX; stickOy = e.clientY; tPtrs.set(e.pointerId, { kind: "stick" });
    stickBase.style.cssText = `display:block;left:${stickOx - 65}px;top:${stickOy - 65}px`; stickKnob.style.display = "block"; stickUpdate(e.clientX, e.clientY);
    try { touchEl.setPointerCapture(e.pointerId); } catch (err) {}
  } else {
    tPtrs.set(e.pointerId, { kind: "look", x: e.clientX, y: e.clientY });
    try { touchEl.setPointerCapture(e.pointerId); } catch (err) {}
  }
});
touchEl.addEventListener("pointermove", e => {
  const t = tPtrs.get(e.pointerId); if (!t || !touchMode) return;
  e.preventDefault();
  if (t.kind === "stick") stickUpdate(e.clientX, e.clientY);
  else if (t.kind === "look" || t.kind === "fire") { applyLook(e.clientX - t.x, e.clientY - t.y); t.x = e.clientX; t.y = e.clientY; }
});
const touchEnd = e => {
  const t = tPtrs.get(e.pointerId); if (!t) return;
  tPtrs.delete(e.pointerId);
  if (t.kind === "stick") { stickId = null; touchMove.active = false; touchMove.x = touchMove.y = 0; touchRun = false; stickBase.style.display = stickKnob.style.display = "none"; }
  if (t.kind === "fire") { mouseDown = false; t.btn.classList.remove("on"); }
};
touchEl.addEventListener("pointerup", touchEnd); touchEl.addEventListener("pointercancel", touchEnd);
touchEl.addEventListener("contextmenu", e => e.preventDefault());

// ---------- aim assist ----------
const _av = new THREE.Vector3(), _ap = new THREE.Vector3();
function assistTarget(maxAng) {                              // nearest visible enemy to the crosshair (angle in radians)
  if (!touchMode || !P) return null;
  camera.getWorldDirection(_av); let best = null, ba = maxAng;
  for (const e of enemies) {
    if (!los(P.x, P.y, e.x, e.y)) continue;
    const sc = TH.types[e.type].scale;
    _ap.set(e.x * CELL, groundH(e.x * CELL, e.y * CELL) + 1.25 * sc, e.y * CELL).sub(camera.position);
    const d = _ap.length(); if (d < 1.5 || d > 70) continue; _ap.multiplyScalar(1 / d);
    const a = Math.acos(clamp(_ap.dot(_av), -1, 1));
    if (a < ba) { ba = a; best = { dir: _ap.clone(), ang: a }; }
  }
  return best;
}
function assistAim() { const t = assistTarget(0.1 + adsAmt * 0.03); if (t) _rd.lerp(t.dir, 0.72).normalize(); }

// ---------- compact bottom-centre HUD panel used on touch screens ----------
function drawTouchPanel(W, H, u, font, A, wd, am) {
  const pw = Math.min(330 * u, W * 0.34), x0 = W / 2 - pw / 2, y0 = H - 64 * u, ph = 54 * u, low = P.hp <= 30;
  hud.fillStyle = "rgba(0,0,0,0.42)"; hud.fillRect(x0, y0, pw, ph);
  hud.textAlign = "left"; hud.fillStyle = low ? "#ff5a4a" : "#fff"; hud.font = font(26); hud.fillText(String(Math.max(0, P.hp | 0)), x0 + 10 * u, y0 + 20 * u);
  const segs = 10, bw = 118 * u, sw = bw / segs;
  for (let i = 0; i < segs; i++) { const on = (i + 1) / segs <= P.hp / 100 + 0.0001 || (i / segs < P.hp / 100 && P.hp / 100 < (i + 1) / segs); hud.fillStyle = on ? (low ? "#ff5a4a" : "#fff") : "rgba(255,255,255,0.22)"; hud.fillRect(x0 + 10 * u + i * sw, y0 + 36 * u, sw - 2 * u, 8 * u); }
  hud.textAlign = "right";
  if (wd.melee) { hud.fillStyle = "#fff"; hud.font = font(20); hud.fillText(wd.name, x0 + pw - 10 * u, y0 + 30 * u); }
  else {
    hud.fillStyle = am.mag <= Math.ceil(wd.mag * 0.25) ? "#ff5a4a" : "#fff"; hud.font = font(30); hud.fillText(P.reload > 0 ? "--" : String(am.mag), x0 + pw - 50 * u, y0 + 28 * u);
    hud.fillStyle = "rgba(255,255,255,0.75)"; hud.font = font(15); hud.fillText(`| ${am.reserve}`, x0 + pw - 10 * u, y0 + 32 * u);
  }
  hud.font = font(10); hud.fillStyle = A; hud.fillText(P.reload > 0 ? "RELOADING" : wd.name, x0 + pw - 10 * u, y0 + 10 * u);
}

// ---------- per-frame UI state ----------
function updateTouchUI() {
  const show = touchMode && state === "play";
  touchEl.style.display = show ? "block" : "none";
  document.body.classList.toggle("portrait", innerHeight > innerWidth);
  if (!show) { if (tPtrs.size || touchMove.active || touchRun) releaseTouch(); return; }
  $t("tAim").classList.toggle("on", adsHeld);
  $t("tGren").textContent = `G ×${P.grenades}`;
  $t("tSwap").innerHTML = `SWAP<br><small>${curW().tag}</small>`;
  const am = P.ammo[P.w]; $t("tReload").classList.toggle("warn", !curW().melee && am.mag <= Math.ceil(curW().mag * 0.25));
  const s = tut ? TUT_STEPS[tut.step] : null;
  $t("tSkip").style.display = s && !s.final ? "flex" : "none";
  $t("tNext").style.display = s && s.key === "ENTER" ? "flex" : "none";
  $t("tPlay").style.display = $t("tMenu").style.display = s && s.final ? "flex" : "none";
}

// ---------- controls mode (auto / touch / desktop) ----------
function setTouchMode(on) {
  touchMode = !!on; document.body.classList.toggle("touch", touchMode);
  if (!touchMode) releaseTouch();
  ctlBtn.innerHTML = "CONTROLS: " + (ctlSetting === "auto" ? `AUTO (${touchMode ? "TOUCH" : "KEYBOARD"})` : ctlSetting === "touch" ? "TOUCH" : "KEYBOARD + MOUSE");
}
const wantTouch = () => (ctlSetting === "touch" ? true : ctlSetting === "desktop" ? false : DEV.mobile);
ctlBtn.addEventListener("click", ev => {
  ev.stopPropagation();
  const order = ["auto", "touch", "desktop"]; ctlSetting = order[(order.indexOf(ctlSetting) + 1) % 3];
  try { localStorage.setItem(CTL_KEY, ctlSetting); } catch (e) {}
  if (DEV.iOS && !DEV.standalone) document.body.classList.add("ios");
setTouchMode(wantTouch());
});
if (DEV.iOS && !DEV.standalone) document.body.classList.add("ios");
setTouchMode(wantTouch());
