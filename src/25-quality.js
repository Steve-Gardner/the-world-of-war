// ===================== graphics quality tiers (automatic, with manual override) =====================
const QUALITY = [
  { name: "HIGH",   pr: () => Math.min(window.devicePixelRatio || 1, 1.5), shadow: 2048, bloom: true,  msaa: 4, ents: 115 },
  { name: "MEDIUM", pr: () => Math.min(window.devicePixelRatio || 1, 1.0), shadow: 1024, bloom: true,  msaa: 0, ents: 80 },
  { name: "LOW",    pr: () => 0.75,                                         shadow: 0,    bloom: false, msaa: 0, ents: 65 },
];
const GFX_KEY = "wow_gfx";                                   // "auto" | "high" | "medium" | "low"
let gfxSetting = "auto", curQ = 0, qWarm = 150;           // qWarm = frames to ignore after a change (shader compiles, load hitches)
try { gfxSetting = localStorage.getItem(GFX_KEY) || "auto"; } catch (e) {}
const defaultQ = () => (DEV.mobile ? 1 : 0);                 // phones start at medium, PCs at high
const settingToQ = s => (s === "high" ? 0 : s === "medium" ? 1 : s === "low" ? 2 : defaultQ());

function applyQuality(i) {
  curQ = i; qWarm = 150; const q = QUALITY[i];
  PR = q.pr();
  if (q.shadow) {
    sunLight.castShadow = true;
    if (sunLight.shadow.mapSize.x !== q.shadow) { sunLight.shadow.mapSize.set(q.shadow, q.shadow); if (sunLight.shadow.map) { sunLight.shadow.map.dispose(); sunLight.shadow.map = null; } }
  } else sunLight.castShadow = false;
  bloom.enabled = q.bloom;
  for (const t of [composer.renderTarget1, composer.renderTarget2]) if (t.samples !== q.msaa) { t.samples = q.msaa; t.dispose(); }
  resize(); updateGfxLabel();
}
function updateGfxLabel() {
  gfxBtn.textContent = "GRAPHICS: " + (gfxSetting === "auto" ? `AUTO (${QUALITY[curQ].name})` : gfxSetting.toUpperCase());
}
function cycleGfx() {
  const order = ["auto", "high", "medium", "low"]; gfxSetting = order[(order.indexOf(gfxSetting) + 1) % order.length];
  try { localStorage.setItem(GFX_KEY, gfxSetting); } catch (e) {}
  qualityDone = false; applyQuality(settingToQ(gfxSetting));
}
gfxBtn.addEventListener("click", ev => { ev.stopPropagation(); cycleGfx(); });
let qualityDone = false;
applyQuality(settingToQ(gfxSetting));
