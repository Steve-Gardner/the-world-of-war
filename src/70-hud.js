// ===================== HUD (2D overlay, Battlefield-style) =====================
function drawHUD() {
  const dpr = hudCv.width / VW;
  hud.setTransform(dpr, 0, 0, dpr, 0, 0);
  hud.clearRect(0, 0, VW, VH);
  if (!P || state === "menu") return;
  const W = VW, H = VH, A = TH.accent, df = state === "dying" || state === "dead" ? Math.min(1, deathT / 1.4) : 0;
  const u = Math.max(0.75, Math.min(1.5, Math.min(W / 1280, H / 720)));          // ui scale
  const font = (px, bold = true) => `${bold ? "700 " : "500 "}${Math.round(px * u)}px ${TH.font}`;
  const wd = curW(), am = P.ammo[P.w];
  hud.textBaseline = "middle";

  if (df < 0.5) {
    // ---- crosshair ----
    const cx = W / 2, cy = H / 2, sp = (P.moving ? 7 : 3) + bloomShots * 16 + recoil * 5;
    const gap = (4 + sp * (1 - adsAmt * 0.7)) * u, len = 9 * u;
    hud.strokeStyle = "rgba(255,255,255,0.92)"; hud.lineWidth = 2 * u; hud.shadowColor = "rgba(0,0,0,0.7)"; hud.shadowBlur = 3;
    if (!wd.melee && adsAmt < 0.8) {
      hud.beginPath();
      hud.moveTo(cx - gap - len, cy); hud.lineTo(cx - gap, cy); hud.moveTo(cx + gap, cy); hud.lineTo(cx + gap + len, cy);
      hud.moveTo(cx, cy + gap); hud.lineTo(cx, cy + gap + len); hud.stroke();
    }
    hud.fillStyle = "#fff"; hud.beginPath(); hud.arc(cx, cy, 1.8 * u, 0, TAU); hud.fill(); hud.shadowBlur = 0;
    if (hitMark > 0) {
      const a = Math.min(1, hitMark * 6), s = 11 * u; hud.strokeStyle = hitHead ? `rgba(255,200,60,${a})` : `rgba(255,255,255,${a})`; hud.lineWidth = 2.4 * u; hud.beginPath();
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { hud.moveTo(cx + dx * s * 0.5, cy + dy * s * 0.5); hud.lineTo(cx + dx * s * 1.4, cy + dy * s * 1.4); }
      hud.stroke();
    }
    // ---- damage direction ----
    for (const d of dmgInd) {
      const rel = d.ang - P.a, a = Math.min(1, d.t * 1.5), ra = Math.min(W, H) * 0.32;
      hud.save(); hud.translate(cx, cy); hud.rotate(rel + Math.PI / 2);
      hud.strokeStyle = `rgba(255,60,50,${a})`; hud.lineWidth = 9 * u; hud.beginPath(); hud.arc(0, 0, ra, -Math.PI / 2 - 0.22, -Math.PI / 2 + 0.22); hud.stroke(); hud.restore();
    }
  }

  // ---- bottom-left: health ----
  const bx = 34 * u, by = H - 44 * u, bw = 280 * u, bh = 12 * u, low = P.hp <= 30;
  hud.fillStyle = "rgba(0,0,0,0.38)"; hud.fillRect(bx - 12 * u, by - 40 * u, bw + 24 * u, 76 * u);
  hud.fillStyle = low ? "#ff5a4a" : "#fff"; hud.font = font(34); hud.textAlign = "left"; hud.fillText(String(Math.max(0, P.hp | 0)), bx, by - 14 * u);
  hud.font = font(11); hud.fillStyle = "rgba(255,255,255,0.65)"; hud.fillText("HEALTH", bx + 78 * u, by - 20 * u);
  const segs = 20, sw = bw / segs;
  for (let i = 0; i < segs; i++) {
    const on = (i + 1) / segs <= P.hp / 100 + 0.0001 || (i / segs < P.hp / 100 && P.hp / 100 < (i + 1) / segs);
    hud.fillStyle = on ? (low ? "#ff5a4a" : "#fff") : "rgba(255,255,255,0.2)"; hud.fillRect(bx + i * sw, by + 6 * u, sw - 3 * u, bh);
  }

  // ---- bottom-right: ammo ----
  const rx = W - 34 * u;
  hud.fillStyle = "rgba(0,0,0,0.38)"; hud.fillRect(rx - 300 * u, H - 112 * u, 312 * u, 100 * u);
  hud.textAlign = "right";
  if (wd.melee) { hud.fillStyle = "#fff"; hud.font = font(34); hud.fillText(wd.name, rx, H - 56 * u); }
  else {
    hud.fillStyle = am.mag <= Math.ceil(wd.mag * 0.25) ? "#ff5a4a" : "#fff"; hud.font = font(52); hud.fillText(P.reload > 0 ? "--" : String(am.mag), rx - 90 * u, H - 62 * u);
    hud.fillStyle = "rgba(255,255,255,0.75)"; hud.font = font(24); hud.fillText(`| ${am.reserve}`, rx, H - 56 * u);
  }
  hud.font = font(12); hud.fillStyle = A; hud.fillText(P.reload > 0 ? "RELOADING" : wd.name, rx, H - 94 * u);
  // slots
  WPN.forEach((k, i) => {
    const x = rx - 224 * u + i * 62 * u, on = P.w === k; hud.fillStyle = on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.18)"; hud.fillRect(x - 2 * u, H - 34 * u, 56 * u, 3 * u);
    hud.fillStyle = on ? "#fff" : "rgba(255,255,255,0.5)"; hud.font = font(11); hud.textAlign = "left"; hud.fillText(`${i + 1} ${TH.weapons[k].tag}`, x, H - 22 * u);
  });
  hud.textAlign = "left"; hud.fillStyle = P.grenades > 0 ? "#fff" : "rgba(255,255,255,0.35)"; hud.font = font(13);
  hud.fillText(`G ◉ ×${P.grenades}`, rx - 292 * u, H - 94 * u);

  // ---- minimap (rotating) ----
  const mr = 82 * u, mx = 34 * u + mr, my = 34 * u + mr, RR = 22, cs = mr / RR;
  hud.save(); hud.beginPath(); hud.arc(mx, my, mr, 0, TAU); hud.clip();
  hud.fillStyle = "rgba(6,10,14,0.62)"; hud.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
  hud.translate(mx, my); hud.rotate(-Math.PI / 2 - P.a);
  const pxi = Math.floor(P.x), pyi = Math.floor(P.y);
  hud.fillStyle = TH.mapCol; hud.globalAlpha = 0.75;
  for (let y = -RR - 1; y <= RR + 1; y++) for (let x = -RR - 1; x <= RR + 1; x++) if (solid(pxi + x, pyi + y)) hud.fillRect((x - (P.x - pxi)) * cs, (y - (P.y - pyi)) * cs, cs + 0.5, cs + 0.5);
  hud.globalAlpha = 1;
  const dot = (o, col, r) => { const ex = (o.x - P.x) * cs, ey = (o.y - P.y) * cs; if (ex * ex + ey * ey < mr * mr) { hud.fillStyle = col; hud.beginPath(); hud.arc(ex, ey, r * u, 0, TAU); hud.fill(); } };
  for (const e of enemies) dot(e, TH.enemyCol, 3.2); for (const a of allies) dot(a, "#6f9", 3);
  hud.restore();
  hud.strokeStyle = "rgba(255,255,255,0.55)"; hud.lineWidth = 2 * u; hud.beginPath(); hud.arc(mx, my, mr, 0, TAU); hud.stroke();
  hud.fillStyle = "#fff"; hud.beginPath(); hud.moveTo(mx, my - 7 * u); hud.lineTo(mx + 5 * u, my + 5 * u); hud.lineTo(mx - 5 * u, my + 5 * u); hud.closePath(); hud.fill();

  // ---- compass ----
  const bear = ((P.a + Math.PI / 2) % TAU + TAU) % TAU, cw = 420 * u, cx2 = W / 2, cy2 = 26 * u;
  hud.fillStyle = "rgba(0,0,0,0.32)"; hud.fillRect(cx2 - cw / 2, cy2 - 12 * u, cw, 24 * u);
  hud.save(); hud.beginPath(); hud.rect(cx2 - cw / 2, cy2 - 14 * u, cw, 28 * u); hud.clip();
  const ppd = cw / (Math.PI * 0.9);                                              // px per radian (≈162° span)
  for (let d = 0; d < 360; d += 15) {
    let rel = d * Math.PI / 180 - bear; rel = Math.atan2(Math.sin(rel), Math.cos(rel)); const x = cx2 + rel * ppd;
    const lab = { 0: "N", 90: "E", 180: "S", 270: "W" }[d];
    hud.fillStyle = lab ? "#fff" : "rgba(255,255,255,0.5)";
    if (lab) { hud.font = font(13); hud.textAlign = "center"; hud.fillText(lab, x, cy2); } else hud.fillRect(x - 0.5 * u, cy2 - 4 * u, 1 * u, 8 * u);
  }
  for (const e of enemies) {
    const ang = Math.atan2(e.y - P.y, e.x - P.x) + Math.PI / 2; let rel = ang - bear; rel = Math.atan2(Math.sin(rel), Math.cos(rel)); const x = cx2 + rel * ppd;
    if (Math.abs(x - cx2) < cw / 2) { hud.fillStyle = TH.enemyCol; hud.beginPath(); hud.moveTo(x, cy2 + 11 * u); hud.lineTo(x - 4 * u, cy2 + 4 * u); hud.lineTo(x + 4 * u, cy2 + 4 * u); hud.closePath(); hud.fill(); }
  }
  hud.restore();
  hud.fillStyle = A; hud.beginPath(); hud.moveTo(cx2, cy2 - 15 * u); hud.lineTo(cx2 - 5 * u, cy2 - 22 * u); hud.lineTo(cx2 + 5 * u, cy2 - 22 * u); hud.closePath(); hud.fill();
  hud.font = font(12); hud.textAlign = "center"; hud.fillStyle = "rgba(255,255,255,0.85)";
  hud.fillText(tut ? `TRAINING ARENA   ·   STEP ${tut.step + 1} / ${TUT_STEPS.length}` : `WAVE ${wave}   ·   HOSTILES ${enemies.length}   ·   ALLIES ${allies.length}`, cx2, cy2 + 30 * u);

  // ---- kill feed + score ----
  hud.textAlign = "right"; let ky = 38 * u;
  hud.font = font(14); hud.fillStyle = "#fff"; hud.fillText(`SCORE  ${score}`, W - 34 * u, ky); ky += 30 * u;
  for (const f of killFeed) {
    hud.globalAlpha = Math.min(1, f.t * 1.5); const w = hud.measureText(f.text).width;
    hud.fillStyle = "rgba(0,0,0,0.42)"; hud.fillRect(W - 34 * u - w - 14 * u, ky - 12 * u, w + 22 * u, 24 * u);
    hud.fillStyle = f.col; hud.fillText(f.text, W - 34 * u, ky); ky += 28 * u; hud.globalAlpha = 1;
  }

  // ---- banners ----
  hud.textAlign = "center";
  if (waveBanner > 0) { hud.globalAlpha = Math.min(1, waveBanner); hud.font = font(46); hud.fillStyle = "#fff"; hud.shadowColor = "rgba(0,0,0,0.6)"; hud.shadowBlur = 8; hud.fillText(`WAVE ${wave}`, W / 2, H * 0.22); hud.font = font(15); hud.fillStyle = A; hud.fillText("ELIMINATE ALL HOSTILES", W / 2, H * 0.22 + 34 * u); hud.shadowBlur = 0; hud.globalAlpha = 1; }
  if (toast > 0) { hud.globalAlpha = Math.min(1, toast * 2); hud.font = font(18); hud.fillStyle = A; hud.fillText(toastText, W / 2, H * 0.3); hud.globalAlpha = 1; }
  if (tut && state === "play") drawTutorial(W, H, u, font, A);
  hud.textAlign = "left";
}
