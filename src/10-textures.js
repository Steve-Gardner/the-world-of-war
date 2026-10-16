// ===================== textures =====================
const TS = 512;
const tint = a => `rgba(${a > 0 ? "255,255,255" : "0,0,0"},${Math.abs(a)})`;
function noiseDots(g, n, amt, size = 1) {
  for (let i = 0; i < n; i++) { g.fillStyle = tint((Math.random() - 0.5) * amt); g.fillRect(Math.random() * 64, Math.random() * 64, size, size); }
}

function makeTexCv(base, kind) {
  const [t, g] = mk(TS, TS);
  g.scale(TS / 64, TS / 64);
  g.fillStyle = base; g.fillRect(0, 0, 64, 64);
  if (kind === "sandbag") {
    for (let y = 0; y < 64; y += 13) {
      const off = (y / 13) % 2 ? 0 : 10;
      for (let x = off - 20; x < 64; x += 20) {
        const gr = g.createLinearGradient(0, y, 0, y + 13);
        gr.addColorStop(0, "#c8ae78"); gr.addColorStop(1, "#7a653c");
        g.fillStyle = gr; g.beginPath(); g.roundRect ? g.roundRect(x + 1, y + 1, 18, 11, 4) : g.rect(x + 1, y + 1, 18, 11); g.fill();
        g.strokeStyle = "rgba(40,28,10,0.7)"; g.lineWidth = 0.7; g.stroke();
        g.fillStyle = "rgba(255,255,255,0.14)"; g.fillRect(x + 4, y + 3, 11, 1);
        g.strokeStyle = "rgba(60,44,20,0.35)"; g.beginPath(); g.moveTo(x + 4, y + 7); g.lineTo(x + 16, y + 6.5); g.stroke();
      }
    }
  } else if (kind === "planks") {
    for (let x = 0; x < 64; x += 16) {
      g.fillStyle = tint((Math.random() - 0.5) * 0.3); g.fillRect(x, 0, 16, 64);
      g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(x, 0, 1.5, 64);
      for (let i = 0; i < 7; i++) { g.fillStyle = "rgba(30,15,5,0.25)"; g.fillRect(x + 3 + Math.random() * 10, Math.random() * 64, 1, 8 + Math.random() * 14); }
      g.fillStyle = "#222"; g.fillRect(x + 7, 6, 2, 2); g.fillRect(x + 7, 56, 2, 2);
    }
    g.fillStyle = "#3a2410"; g.fillRect(0, 14, 64, 4); g.fillRect(0, 46, 64, 4);
    g.fillStyle = "rgba(255,255,255,0.1)"; g.fillRect(0, 14, 64, 1); g.fillRect(0, 46, 64, 1);
  } else if (kind === "earth") {
    for (let i = 0; i < 80; i++) {
      g.fillStyle = tint((Math.random() - 0.5) * 0.4);
      g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 64, 1 + Math.random() * 4, 1 + Math.random() * 3, Math.random() * 3, 0, 7); g.fill();
    }
    g.strokeStyle = "rgba(20,12,4,0.6)"; g.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) { g.beginPath(); const x = Math.random() * 64; g.moveTo(x, 0); g.lineTo(x + (Math.random() - 0.5) * 10, 20 + Math.random() * 30); g.stroke(); }
    g.strokeStyle = "rgba(200,180,140,0.4)"; g.lineWidth = 0.6;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(Math.random() * 64, 0); g.bezierCurveTo(Math.random() * 64, 10, Math.random() * 64, 20, Math.random() * 64, 30); g.stroke(); }
  } else if (kind === "concrete") {
    for (const [px, py] of [[0, 0], [32, 0], [0, 32], [32, 32]]) {
      g.fillStyle = tint((Math.random() - 0.5) * 0.14); g.fillRect(px, py, 32, 32);
      g.fillStyle = "rgba(0,0,0,0.4)"; g.fillRect(px, py, 32, 1.5); g.fillRect(px, py, 1.5, 32);
      g.fillStyle = "rgba(255,255,255,0.15)"; g.fillRect(px + 1.5, py + 1.5, 30, 1); g.fillRect(px + 1.5, py + 1.5, 1, 30);
      g.fillStyle = "#333"; for (const [bx, by] of [[4, 4], [27, 4], [4, 27], [27, 27]]) g.fillRect(px + bx, py + by, 2, 2);
    }
    for (let i = 0; i < 7; i++) {
      const x = Math.random() * 64, gr = g.createLinearGradient(0, 0, 0, 64);
      gr.addColorStop(0, "rgba(0,0,0,0.28)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr; g.fillRect(x, 0, 1 + Math.random() * 3, 20 + Math.random() * 40);
    }
    g.fillStyle = "rgba(255,170,0,0.7)"; for (let x = -8; x < 64; x += 8) { g.beginPath(); g.moveTo(x, 62); g.lineTo(x + 4, 62); g.lineTo(x + 8, 64); g.lineTo(x + 4, 64); g.fill(); }
  } else if (kind === "tech") {
    for (const [px, py] of [[0, 0], [32, 0], [0, 32], [32, 32]]) {
      g.fillStyle = tint((Math.random() - 0.5) * 0.12); g.fillRect(px, py, 32, 32);
      g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(px, py, 32, 2); g.fillRect(px, py, 2, 32);
      g.fillStyle = "rgba(120,180,255,0.18)"; g.fillRect(px + 2, py + 2, 30, 1); g.fillRect(px + 2, py + 2, 1, 30);
      g.fillStyle = "rgba(0,0,0,0.35)"; for (let y = 22; y < 30; y += 2) g.fillRect(px + 5, py + y, 22, 1);
      const col = Math.random() < 0.5 ? "#38e8ff" : "#ff4fd8";
      g.shadowColor = col; g.shadowBlur = 3; g.fillStyle = col;
      g.fillRect(px + 5, py + 8 + R(0, 4), 12 + R(0, 10), 1.6); g.fillRect(px + 5, py + 13, 3, 3);
      g.shadowBlur = 0;
    }
    g.fillStyle = "#cde"; g.fillRect(31, 0, 2, 64);
  } else if (kind === "rubble") {
    for (let i = 0; i < 40; i++) {
      g.fillStyle = tint((Math.random() - 0.5) * 0.35);
      g.beginPath(); const x = Math.random() * 64, y = Math.random() * 64, r = 3 + Math.random() * 7;
      for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + Math.random() * 0.5; g[k ? "lineTo" : "moveTo"](x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8); }
      g.fill();
    }
    g.strokeStyle = "rgba(140,70,30,0.6)"; g.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) { g.beginPath(); const x = Math.random() * 64; g.moveTo(x, 0); g.lineTo(x + (Math.random() - 0.5) * 12, 64); g.stroke(); }
    g.strokeStyle = "#555"; g.lineWidth = 1.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(Math.random() * 64, 0); g.lineTo(Math.random() * 64, 64); g.stroke(); }
  } else if (kind === "hull") {
    for (const [px, py] of [[0, 0], [32, 0], [0, 32], [32, 32]]) {
      g.fillStyle = tint((Math.random() - 0.5) * 0.12); g.fillRect(px, py, 32, 32);
      g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(px, py, 32, 1.6); g.fillRect(px, py, 1.6, 32);
      g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(px + 1.6, py + 1.6, 30, 1); g.fillRect(px + 1.6, py + 1.6, 1, 30);
      g.fillStyle = "#c9a640"; g.fillRect(px + 4, py + 4, 24, 1.4); g.fillRect(px + 4, py + 26, 24, 1.4);
      g.shadowColor = "#c6f"; g.shadowBlur = 4; g.fillStyle = "#d9a0ff"; g.fillRect(px + 6, py + 14 + R(0, 3), 20, 1.8); g.shadowBlur = 0;
      g.fillStyle = "#8a8a98"; for (const [bx, by] of [[3, 3], [28, 3], [3, 28], [28, 28]]) { g.beginPath(); g.arc(px + bx, py + by, 1, 0, 7); g.fill(); }
    }
  } else if (kind === "crystal") {
    const pal = ["#5a2aa0", "#8a3ad0", "#2a8ac0", "#c03a9a", "#3a1a70", "#6a4ae0"];
    for (let i = 0; i < 34; i++) {
      const cx = Math.random() * 64, cy = Math.random() * 64, r = 6 + Math.random() * 14, a0 = Math.random() * 6.28;
      const gr = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      gr.addColorStop(0, pal[R(0, 5)]); gr.addColorStop(1, pal[R(0, 5)]);
      g.globalAlpha = 0.85; g.fillStyle = gr; g.beginPath();
      for (let k = 0; k < 3; k++) { const a = a0 + k * 2.1 + Math.random() * 0.5; g[k ? "lineTo" : "moveTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      g.closePath(); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = "rgba(255,255,255,0.3)"; g.lineWidth = 0.5; g.stroke();
    }
    g.shadowColor = "#e9f"; g.shadowBlur = 4; g.strokeStyle = "rgba(240,190,255,0.85)"; g.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(Math.random() * 64, Math.random() * 64); g.lineTo(Math.random() * 64, Math.random() * 64); g.stroke(); }
    g.shadowBlur = 0;
  } else if (kind === "alien") {
    for (let i = 0; i < 70; i++) {
      g.fillStyle = tint((Math.random() - 0.5) * 0.35);
      g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 64, 2 + Math.random() * 6, 2 + Math.random() * 5, Math.random() * 3, 0, 7); g.fill();
    }
    g.shadowBlur = 5;
    for (let i = 0; i < 7; i++) {
      const col = Math.random() < 0.6 ? "#7f4" : "#f4c"; g.shadowColor = col; g.strokeStyle = col; g.globalAlpha = 0.8; g.lineWidth = 0.8 + Math.random();
      g.beginPath(); g.moveTo(Math.random() * 64, 0); g.bezierCurveTo(Math.random() * 64, 20, Math.random() * 64, 40, Math.random() * 64, 64); g.stroke();
    }
    g.shadowBlur = 0; g.globalAlpha = 1;
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 64, y = Math.random() * 64;
      g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.ellipse(x, y, 2.4, 1.8, 0, 0, 7); g.fill();
      g.strokeStyle = "rgba(160,255,120,0.4)"; g.lineWidth = 0.5; g.stroke();
    }
  }
  noiseDots(g, 1000, 0.3);
  const sh = g.createLinearGradient(0, 0, 0, 64);
  sh.addColorStop(0, "rgba(255,255,255,0.10)"); sh.addColorStop(1, "rgba(0,0,0,0.32)");
  g.fillStyle = sh; g.fillRect(0, 0, 64, 64);
  return t;
}

function floorTexCv(kind) {
  const [fc, g] = mk(512, 512); g.scale(8, 8);
  if (kind === "mud") {
    g.fillStyle = "#4b3b29"; g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 90; i++) { g.fillStyle = tint((Math.random() - 0.5) * 0.35); g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 64, 1 + Math.random() * 5, 1 + Math.random() * 3, Math.random() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 2; i++) {
      const x = Math.random() * 64, y = Math.random() * 64;
      g.fillStyle = "rgba(70,80,92,0.55)"; g.beginPath(); g.ellipse(x, y, 7 + Math.random() * 5, 3 + Math.random() * 3, 0, 0, 7); g.fill();
      g.fillStyle = "rgba(200,210,220,0.18)"; g.beginPath(); g.ellipse(x - 2, y - 1, 3, 1, 0, 0, 7); g.fill();
    }
    g.strokeStyle = "rgba(20,12,4,0.35)"; g.lineWidth = 1.5; for (let i = 0; i < 2; i++) { const y = 10 + i * 30 + Math.random() * 10; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(20, y - 4, 40, y + 4, 64, y); g.stroke(); }
    g.fillStyle = "rgba(150,140,120,0.5)"; for (let i = 0; i < 10; i++) g.fillRect(Math.random() * 64, Math.random() * 64, 1.5, 1.2);
  } else if (kind === "alien") {
    g.fillStyle = "#1c1230"; g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 70; i++) { g.fillStyle = tint((Math.random() - 0.5) * 0.3); g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 64, 1 + Math.random() * 5, 1 + Math.random() * 3, Math.random() * 3, 0, 7); g.fill(); }
    for (const [w, col, blur] of [[3.2, "rgba(220,60,255,0.25)", 0], [1.1, "#f6f", 0]]) {              // glowing cracks (tile seamlessly)
      g.strokeStyle = col; g.lineWidth = w;
      for (let k = 0; k < 2; k++) {
        const c = 14 + k * 32, a = 3 + Math.random() * 3, ph = k * 2.1, f = 1 + k;
        g.beginPath(); for (let x = 0; x <= 64; x += 2) { const y = c + a * Math.sin(x / 64 * 6.2832 * f + ph); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
        g.beginPath(); for (let y = 0; y <= 64; y += 2) { const x = c + 8 + a * Math.sin(y / 64 * 6.2832 * f + ph + 1); y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      }
    }
    g.fillStyle = "rgba(120,255,180,0.8)"; for (let i = 0; i < 8; i++) g.fillRect(Math.random() * 64, Math.random() * 64, 1.4, 1.4);
  } else {
    g.fillStyle = "#1b2330"; g.fillRect(0, 0, 64, 64);
    noiseDots(g, 600, 0.25);
    g.fillStyle = "rgba(0,0,0,0.6)"; g.fillRect(0, 0, 64, 2); g.fillRect(0, 0, 2, 64);
    g.fillStyle = "rgba(130,170,220,0.16)"; g.fillRect(2, 2, 62, 1); g.fillRect(2, 2, 1, 62);
    g.fillStyle = "rgba(56,232,255,0.5)"; g.fillRect(0, 62, 64, 1); g.fillRect(62, 0, 1, 64);
    g.fillStyle = "rgba(56,232,255,0.28)"; g.fillRect(0, 61, 64, 1); g.fillRect(61, 0, 1, 64);
    g.fillStyle = "rgba(255,255,255,0.08)"; g.beginPath(); g.moveTo(32, 26); g.lineTo(38, 32); g.lineTo(32, 38); g.lineTo(26, 32); g.fill();
    g.fillStyle = "#5af"; g.fillRect(31, 31, 2, 2);
  }
  return fc;
}

const SKYW = 2048, SKYH = 800, SKYHOR = 700;
function wrapDraw(g, fn) { for (const dx of [-SKYW, 0, SKYW]) { g.save(); g.translate(dx, 0); fn(); g.restore(); } }
function skyTex(kind) {
  const [c, g] = mk(SKYW, SKYH);
  if (kind === "ww1") {
    const gr = g.createLinearGradient(0, 0, 0, SKYH);
    gr.addColorStop(0, "#3c4044"); gr.addColorStop(0.4, "#6c6e6a"); gr.addColorStop(0.8, "#aaa088"); gr.addColorStop(1, "#c8b88c");
    g.fillStyle = gr; g.fillRect(0, 0, SKYW, SKYH);
    for (let i = 0; i < 170; i++) {
      const x = Math.random() * SKYW, y = 220 + Math.random() * 420, rx = 70 + Math.random() * 260, ry = 12 + Math.random() * 40;
      const dark = Math.random() < 0.5, a = 0.04 + Math.random() * 0.07;
      wrapDraw(g, () => { g.fillStyle = dark ? `rgba(40,40,40,${a})` : `rgba(235,230,215,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); });
    }
    for (let p = 0; p < 7; p++) {
      const x0 = Math.random() * SKYW;
      for (let k = 0; k < 55; k++) {
        const x = x0 + Math.sin(k * 0.15 + p) * (6 + k * 0.5), y = SKYHOR - k * 7;
        wrapDraw(g, () => { g.fillStyle = "rgba(36,32,28,0.05)"; g.beginPath(); g.arc(x, y, 9 + k * 1.1, 0, 7); g.fill(); });
      }
    }
    const hz = g.createLinearGradient(0, 560, 0, SKYHOR);
    hz.addColorStop(0, "rgba(220,190,120,0)"); hz.addColorStop(1, "rgba(230,200,130,0.55)");
    g.fillStyle = hz; g.fillRect(0, 560, SKYW, SKYHOR - 560);
    g.fillStyle = "#2a251f"; g.beginPath(); g.moveTo(0, SKYH);
    for (let x = 0; x <= SKYW; x += 8) { const a = x / SKYW * 6.2832; g.lineTo(x, SKYHOR - 8 + Math.sin(a * 3) * 9 + Math.sin(a * 7 + 1) * 6 + Math.sin(a * 13) * 3); }
    g.lineTo(SKYW, SKYH); g.fill();
    g.strokeStyle = "#2a251f"; g.lineCap = "round";
    for (let i = 0; i < 70; i++) {
      const x = 20 + Math.random() * (SKYW - 40), h = 25 + Math.random() * 70;
      g.lineWidth = 2 + Math.random() * 3; g.beginPath(); g.moveTo(x, SKYHOR); g.lineTo(x + (Math.random() - 0.5) * 6, SKYHOR - h); g.stroke();
      g.lineWidth = 1.5;
      for (let b = 0; b < 3; b++) { const by = SKYHOR - h * (0.4 + b * 0.2); g.beginPath(); g.moveTo(x, by); g.lineTo(x + (Math.random() - 0.5) * 36, by - 10 - Math.random() * 14); g.stroke(); }
    }
  } else if (kind === "ww10") {
    const gr = g.createLinearGradient(0, 0, 0, SKYH);
    gr.addColorStop(0, "#0a0620"); gr.addColorStop(0.4, "#2a1060"); gr.addColorStop(0.75, "#6a2a90"); gr.addColorStop(1, "#d060a0");
    g.fillStyle = gr; g.fillRect(0, 0, SKYW, SKYH);
    for (let i = 0; i < 70; i++) {                                                                    // nebula
      const x = Math.random() * SKYW, y = 230 + Math.random() * 400, r = 80 + Math.random() * 220;
      const col = ["60,220,200", "255,70,200", "255,150,60", "120,80,255"][R(0, 3)];
      wrapDraw(g, () => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${col},0.10)`); rg.addColorStop(1, `rgba(${col},0)`); g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
    }
    for (let i = 0; i < 650; i++) { g.fillStyle = `rgba(255,255,${220 + R(0, 35)},${0.2 + Math.random() * 0.8})`; const s = Math.random() < 0.07 ? 3 : Math.random() < 0.3 ? 2 : 1; g.fillRect(Math.random() * SKYW, 210 + Math.random() * 440, s, s); }
    const GX = 700, GY = 600, GR = 330;                                                               // gas giant
    g.fillStyle = "rgba(255,150,220,0.12)"; g.beginPath(); g.arc(GX, GY, GR + 50, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(GX, GY, GR, 0, 7); g.clip();
    const pg = g.createLinearGradient(GX - GR, GY - GR, GX + GR, GY + GR); pg.addColorStop(0, "#ffb870"); pg.addColorStop(0.5, "#c0507a"); pg.addColorStop(1, "#38105a");
    g.fillStyle = pg; g.fillRect(GX - GR, GY - GR, GR * 2, GR * 2);
    for (let y = GY - GR; y < GY + GR; y += 9 + Math.random() * 14) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "255,220,180" : "60,10,90"},${0.06 + Math.random() * 0.14})`; g.fillRect(GX - GR, y, GR * 2, 5 + Math.random() * 10); }
    const sh = g.createRadialGradient(GX - 120, GY - 140, 20, GX, GY, GR); sh.addColorStop(0, "rgba(255,255,255,0.12)"); sh.addColorStop(1, "rgba(0,0,20,0.7)");
    g.fillStyle = sh; g.fillRect(GX - GR, GY - GR, GR * 2, GR * 2); g.restore();
    g.strokeStyle = "rgba(255,215,190,0.55)"; g.lineWidth = 9; g.beginPath(); g.ellipse(GX, GY - 20, GR * 1.55, 52, -0.2, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    const mx = 1500, my = 390;                                                                         // small moon
    const mg = g.createRadialGradient(mx - 10, my - 10, 4, mx, my, 44); mg.addColorStop(0, "#e8ffe8"); mg.addColorStop(1, "#486a58");
    g.fillStyle = mg; g.beginPath(); g.arc(mx, my, 42, 0, 7); g.fill();
    g.fillStyle = "rgba(0,0,0,0.18)"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(mx + R(-25, 25), my + R(-25, 25), 3 + Math.random() * 6, 0, 7); g.fill(); }
    wrapDraw(g, () => {                                                                                // orbital ring
      g.strokeStyle = "rgba(255,210,140,0.5)"; g.lineWidth = 7; g.beginPath(); g.ellipse(1450, 1000, 980, 640, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2; g.stroke();
      for (let k = 0; k < 60; k++) { const a = Math.PI * 1.1 + k / 60 * Math.PI * 0.8; g.fillStyle = k % 3 ? "rgba(255,240,200,0.9)" : "rgba(120,255,230,0.9)"; g.fillRect(1450 + Math.cos(a) * 980, 1000 + Math.sin(a) * 640, 3, 3); }
    });
    for (let i = 0; i < 16; i++) {                                                                     // floating islands
      const x = Math.random() * SKYW, y = 420 + Math.random() * 170, w = 30 + Math.random() * 90;
      g.fillStyle = "#17092e"; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + w, y); g.lineTo(x + w * 0.4, y + w * 0.7); g.lineTo(x, y + w * 1.1); g.lineTo(x - w * 0.5, y + w * 0.6); g.closePath(); g.fill();
      g.fillStyle = "#2a5a3a"; g.fillRect(x - w, y - 3, w * 2, 4);
      if (Math.random() < 0.5) { g.fillStyle = "#17092e"; g.fillRect(x - 2, y - 26, 4, 26); g.fillStyle = "#f6f"; g.fillRect(x - 2, y - 28, 4, 4); }
    }
    for (const [col, hMin, hMax, glow] of [["#1d0f3c", 40, 150, false], ["#0c0518", 60, 240, true]]) {      // alien spires
      for (let x = glow ? 31 : 0; x < SKYW;) {
        const bw = 16 + R(0, 30), bh = R(hMin, hMax);
        g.fillStyle = col; g.beginPath(); g.moveTo(x, SKYHOR + 20); g.lineTo(x, SKYHOR - bh * 0.8); g.quadraticCurveTo(x + bw * 0.5, SKYHOR - bh * 1.15, x + bw, SKYHOR - bh * 0.7 - R(0, 20)); g.lineTo(x + bw, SKYHOR + 20); g.fill();
        if (glow) for (let k = 0; k < 6; k++) if (Math.random() < 0.7) { g.fillStyle = ["#f6f", "#6fe", "#fd6"][R(0, 2)]; g.fillRect(x + 3 + Math.random() * (bw - 6), SKYHOR - Math.random() * bh * 0.8, 2, 3); }
        x += bw + R(0, 8);
      }
    }
    const hz = g.createLinearGradient(0, 560, 0, SKYHOR); hz.addColorStop(0, "rgba(255,90,200,0)"); hz.addColorStop(1, "rgba(255,110,210,0.4)");
    g.fillStyle = hz; g.fillRect(0, 560, SKYW, SKYHOR - 560);
    g.fillStyle = "#08030f"; g.fillRect(0, SKYHOR, SKYW, SKYH - SKYHOR);
  } else {
    const gr = g.createLinearGradient(0, 0, 0, SKYH);
    gr.addColorStop(0, "#03040c"); gr.addColorStop(0.45, "#0c1130"); gr.addColorStop(0.85, "#2c1654"); gr.addColorStop(1, "#7a2c78");
    g.fillStyle = gr; g.fillRect(0, 0, SKYW, SKYH);
    for (let i = 0; i < 700; i++) {
      g.fillStyle = `rgba(${200 + R(0, 55)},${210 + R(0, 45)},255,${0.25 + Math.random() * 0.75})`;
      const s = Math.random() < 0.08 ? 3 : Math.random() < 0.3 ? 2 : 1; g.fillRect(Math.random() * SKYW, 220 + Math.random() * 430, s, s);
    }
    for (let b = 0; b < 3; b++) {
      const y0 = 300 + b * 70, ph = Math.random() * 6, col = ["60,255,170", "70,170,255", "190,90,255"][b];
      const ag = g.createLinearGradient(0, y0 - 70, 0, y0 + 60); ag.addColorStop(0, `rgba(${col},0)`); ag.addColorStop(0.5, `rgba(${col},0.16)`); ag.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = ag; g.beginPath(); g.moveTo(0, SKYH);
      for (let x = 0; x <= SKYW; x += 8) { const a = x / SKYW * 6.2832; g.lineTo(x, y0 + Math.sin(a * 2 + ph) * 40 + Math.sin(a * 5 + ph) * 18); }
      g.lineTo(SKYW, SKYH); g.closePath(); g.fill();
    }
    const mg = g.createRadialGradient(560, 400, 6, 560, 400, 84);
    mg.addColorStop(0, "#f4ecff"); mg.addColorStop(0.6, "#9a86d8"); mg.addColorStop(1, "#3a2a78");
    g.fillStyle = "rgba(160,120,255,0.14)"; g.beginPath(); g.arc(560, 400, 130, 0, 7); g.fill();
    g.fillStyle = mg; g.beginPath(); g.arc(560, 400, 78, 0, 7); g.fill();
    g.strokeStyle = "rgba(220,200,255,0.65)"; g.lineWidth = 6; g.beginPath(); g.ellipse(560, 400, 150, 22, -0.35, 0, 7); g.stroke();
    g.strokeStyle = "rgba(220,200,255,0.3)"; g.lineWidth = 3; g.beginPath(); g.ellipse(560, 400, 172, 28, -0.35, 0, 7); g.stroke();
    for (const [layer, col, hMin, hMax] of [[0, "#171a42", 30, 120], [1, "#0b0d22", 50, 210]]) {
      for (let x = layer * 23; x < SKYW;) {
        const bw = 22 + R(0, 44), bh = R(hMin, hMax);
        g.fillStyle = col; g.fillRect(x, SKYHOR - bh, bw, bh + 100);
        if (layer === 1) {
          for (let wy = SKYHOR - bh + 8; wy < SKYHOR - 6; wy += 9) for (let wx = x + 4; wx < x + bw - 4; wx += 7) if (Math.random() < 0.28) { g.fillStyle = Math.random() < 0.7 ? "rgba(255,220,130,0.85)" : "rgba(90,230,255,0.85)"; g.fillRect(wx, wy, 3, 4); }
          if (Math.random() < 0.3) { const nc = Math.random() < 0.5 ? "#ff3fd0" : "#35e8ff"; g.shadowColor = nc; g.shadowBlur = 10; g.fillStyle = nc; g.fillRect(x, SKYHOR - bh - 2, bw, 2); g.shadowBlur = 0; }
          if (Math.random() < 0.2) { g.fillStyle = col; g.fillRect(x + bw / 2 - 1, SKYHOR - bh - 30, 2, 30); g.fillStyle = "#f33"; g.fillRect(x + bw / 2 - 2, SKYHOR - bh - 32, 4, 4); }
        }
        x += bw + R(0, 6);
      }
    }
    const hz = g.createLinearGradient(0, 580, 0, SKYHOR);
    hz.addColorStop(0, "rgba(255,70,200,0)"); hz.addColorStop(1, "rgba(255,70,200,0.35)");
    g.fillStyle = hz; g.fillRect(0, 580, SKYW, SKYHOR - 580);
    g.fillStyle = "#06070f"; g.fillRect(0, SKYHOR, SKYW, SKYH - SKYHOR);
  }
  return c;
}


// height -> tangent-space normal map
function normalFromCanvas(cv, strength = 2) {
  const w = cv.width, h = cv.height, src = cv.getContext("2d").getImageData(0, 0, w, h).data;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) lum[i] = (src[i * 4] * 0.3 + src[i * 4 + 1] * 0.59 + src[i * 4 + 2] * 0.11) / 255;
  const [out, g] = mk(w, h), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const xl = lum[y * w + ((x - 1 + w) % w)], xr = lum[y * w + ((x + 1) % w)], yu = lum[((y - 1 + h) % h) * w + x], yd = lum[((y + 1) % h) * w + x];
    let nx = (xl - xr) * strength, ny = (yd - yu) * strength, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const o = (y * w + x) * 4; d[o] = (nx * 0.5 + 0.5) * 255; d[o + 1] = (ny * 0.5 + 0.5) * 255; d[o + 2] = (nz * 0.5 + 0.5) * 255; d[o + 3] = 255;
  }
  g.putImageData(im, 0, 0); return out;
}
// keep only bright saturated (neon) pixels
function emissiveFrom(cv, thr = 190) {
  const w = cv.width, h = cv.height, src = cv.getContext("2d").getImageData(0, 0, w, h).data;
  const [out, g] = mk(w, h), im = g.createImageData(w, h), d = im.data;
  for (let i = 0; i < w * h; i++) {
    const r = src[i * 4], gg = src[i * 4 + 1], b = src[i * 4 + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    if (mx > thr && mx - mn > 55) { d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; }
    d[i * 4 + 3] = 255;
  }
  g.putImageData(im, 0, 0); return out;
}
function toTex(cv, { srgb = true, rx = 1, ry = 1 } = {}) {
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.anisotropy = MAXANISO; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.needsUpdate = true; return t;
}
// woven fabric + leather detail textures used by soldiers
function fabricCv() {
  const [c, g] = mk(128, 128); g.fillStyle = "#f0f0f0"; g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 2) { g.fillStyle = `rgba(0,0,0,${0.10 + Math.random() * 0.1})`; g.fillRect(0, y, 128, 1); }
  for (let x = 0; x < 128; x += 2) { g.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.08})`; g.fillRect(x, 0, 1, 128); }
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "0,0,0" : "255,255,255"},${Math.random() * 0.1})`; g.fillRect(Math.random() * 128, Math.random() * 128, 1, 1); }
  return c;
}
function leatherCv() {
  const [c, g] = mk(128, 128); g.fillStyle = "#e0e0e0"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "0,0,0" : "255,255,255"},${Math.random() * 0.2})`; g.beginPath(); g.arc(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 0, 7); g.fill(); }
  return c;
}
