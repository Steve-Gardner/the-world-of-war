// ===================== themes (look + gameplay data) =====================
const TYPE_BASE = {
  ww1:  { rifle: { hp: 2, spd: 1.0, keep: 2.5, cd: [1.3, 2.4], dmg: [6, 11],  acc: 0.7,  pts: 100, scale: 1 },
          officer: { hp: 2, spd: 1.5, keep: 5, cd: [0.9, 1.5], dmg: [4, 8],   acc: 0.6,  pts: 150, scale: 1 },
          trooper: { hp: 5, spd: 0.7, keep: 2, cd: [1.8, 2.8], dmg: [10, 16], acc: 0.75, pts: 250, scale: 1.08 } },
  ww3:  { rifle: { hp: 3, spd: 1.3, keep: 4, cd: [0.8, 1.5], dmg: [4, 8],  acc: 0.65, pts: 100, scale: 1 },
          officer: { hp: 3, spd: 1.8, keep: 6, cd: [0.6, 1.1], dmg: [3, 6],  acc: 0.55, pts: 150, scale: 1 },
          trooper: { hp: 9, spd: 0.8, keep: 3, cd: [1.4, 2.2], dmg: [9, 14], acc: 0.75, pts: 250, scale: 1.15 } },
  ww10: { rifle: { hp: 3, spd: 1.5, keep: 4, cd: [0.7, 1.3], dmg: [4, 8],   acc: 0.65, pts: 120, scale: 1.06 },
          officer: { hp: 4, spd: 2.0, keep: 6, cd: [0.5, 1.0], dmg: [3, 7],   acc: 0.55, pts: 180, scale: 1.1 },
          trooper: { hp: 11, spd: 0.9, keep: 3, cd: [1.3, 2.0], dmg: [10, 15], acc: 0.75, pts: 300, scale: 1.3 } },
};
const ALLY_T = { hp: 40, spd: 3.0, keep: 6, cd: [0.9, 1.6], dmg: [1, 1], acc: 0.55, pts: 0, scale: 1 };

const THEMES = {
  ww1: {
    key: "ww1", sub: "1917 — No man's land. Hunt them down. Don't die.", accent: "#fc3",
    font: "'Courier New', monospace", mapCol: "#b9a98a", enemyCol: "#ff4a3a",
    fog: [176, 164, 132], fogDensity: 0.011, exposure: 1.45,
    sun: { color: [255, 232, 196], intensity: 3.4, u: 0.1, elev: 32 }, hemi: { sky: [160, 168, 182], ground: [96, 80, 56], intensity: 1.5 }, env: 0.7,
    bloom: { s: 0.28, r: 0.7, t: 0.92 },
    grade: { gain: [1.06, 1.0, 0.88], lift: [0.004, 0.003, 0], gamma: [1.04, 1.0, 0.94], sat: 0.8, vig: 0.6, grain: 0.022, aberr: 0.003, scan: 0 },
    walls: [["#8a7448", "sandbag"], ["#6b4a2a", "planks"], ["#4a3826", "earth"]], wallRough: 0.95, wallMetal: 0, wallEmis: 0, normStrength: 3.2,
    floor: "mud", floorRepeat: 64, floorRough: 0.92, floorEmis: 0, sky: "ww1", props: "ww1",
    models: { primary: "enfield", pistol: "luger", knife: "trench" },
    weapons: {
      primary: { name: "RIFLE",  tag: "RIFLE",  cd: 0.6,  mag: 10, reserve: 40, reload: 1.7, pickup: 10, shake: 0.4,  auto: false, dmg: 1, spread: 0.004, zoom: 1.35 },
      pistol:  { name: "PISTOL", tag: "PISTOL", cd: 0.34, mag: 8,  reserve: 32, reload: 1.3, pickup: 8,  shake: 0.2,  auto: false, dmg: 1, spread: 0.008, zoom: 1.15 },
      knife:   { name: "KNIFE",  tag: "KNIFE",  melee: true, cd: 0.45, dmg: 2, range: 1.7 },
    },
    types: TYPE_BASE.ww1,
    soldiers: {
      rifle:   { uni: [88, 94, 80], trs: [72, 74, 62], head: "stahl", helm: [86, 90, 86], pouches: true, pack: true, gun: "enfield", moustache: true },
      officer: { uni: [66, 78, 100], trs: [54, 60, 72], head: "cap", helm: [66, 78, 100], coat: true, accent: [200, 170, 60], armband: [170, 30, 30], pistol: true, gun: "luger", moustache: true },
      trooper: { uni: [80, 86, 74], trs: [66, 70, 58], head: "gas", helm: [78, 82, 80], pouches: true, pack: true, gun: "enfield", wide: 1.14 },
      ally:    { uni: [142, 126, 88], trs: [118, 104, 70], head: "brodie", helm: [104, 112, 76], vest: [112, 100, 66], pouches: true, pack: true, gun: "enfield" },
    },
    pick: { health: [[220, 214, 190], [200, 40, 40]], ammo: [[74, 62, 38], [220, 180, 70]], grenade: [[58, 74, 42], [120, 120, 110]] },
    hit: [0x8a6a48, 0xb03020, 0x5a4630], die: [0x5a4630, 0x8a2a20, 0x3a2c1c], wallHit: [0x8a7a5a, 0x6a5a3a, 0xaaaaaa],
    tracer: 0xffd890, flashCol: 0xffc070, orb: [0x3a4a2a, 0x777777], boomDebris: [0x8a7a5a, 0x6a5a3a, 0x4a3a28],
    shot(kind) {
      if (kind === "pistol") { noise(0.14, 0.22); beep(190, 0.14, "sawtooth", 0.14, -100); }
      else { noise(0.22, 0.32); beep(110, 0.2, "sawtooth", 0.18, -70); }
    },
    eshot(t) { beep(t === "officer" ? 760 : 520, 0.1, "square", 0.06, -300); },
  },
  ww3: {
    key: "ww3", sub: "2087 — Neon ruins. Machines don't stop. Don't die.", accent: "#4ef",
    font: "'Trebuchet MS', 'Helvetica Neue', Arial, sans-serif", mapCol: "#7ab", enemyCol: "#ff4aa0",
    fog: [44, 36, 80], fogDensity: 0.0095, exposure: 1.25,
    sun: { color: [150, 190, 255], intensity: 1.5, u: 0.137, elev: 26 }, hemi: { sky: [90, 110, 190], ground: [36, 30, 64], intensity: 1.4 }, env: 1.1,
    bloom: { s: 0.55, r: 0.8, t: 0.82 },
    grade: { gain: [0.96, 1.0, 1.1], lift: [0, 0.004, 0.012], gamma: [1.02, 1.0, 0.96], sat: 1.12, vig: 0.8, grain: 0.03, aberr: 0.006, scan: 0.03 },
    walls: [["#7d848c", "concrete"], ["#18222f", "tech"], ["#3c3a3e", "rubble"]], wallRough: 0.7, wallMetal: 0.25, wallEmis: 2.2, normStrength: 3,
    floor: "tech", floorRepeat: 64, floorRough: 0.55, floorEmis: 1.8, sky: "ww3", props: "ww3",
    models: { primary: "ar", pistol: "sidearm", knife: "combat" },
    weapons: {
      primary: { name: "PLASMA",  tag: "PLASMA", cd: 0.2,  mag: 30, reserve: 120, reload: 1.4, pickup: 30, shake: 0.12, auto: true,  dmg: 1, spread: 0.004, zoom: 1.4 },
      pistol:  { name: "SIDEARM", tag: "SIDE",   cd: 0.16, mag: 16, reserve: 64,  reload: 1.0, pickup: 16, shake: 0.08, auto: false, dmg: 1, spread: 0.007, zoom: 1.15 },
      knife:   { name: "BLADE",   tag: "BLADE",  melee: true, cd: 0.35, dmg: 3, range: 1.9 },
    },
    types: TYPE_BASE.ww3,
    soldiers: {
      rifle:   { uni: [44, 50, 46], trs: [40, 44, 40], head: "visor", helm: [56, 60, 58], vest: [34, 38, 40], pouches: true, pack: true, fut: true, glow: [255, 140, 30], gun: "ar" },
      officer: { uni: [110, 36, 44], trs: [60, 30, 36], head: "visor", helm: [210, 214, 222], vest: [200, 204, 212], fut: true, glow: [255, 40, 70], pistol: true, gun: "sidearm" },
      trooper: { uni: [34, 52, 58], trs: [30, 44, 50], head: "visor", helm: [60, 96, 104], vest: [60, 96, 104], fut: true, pack: true, glow: [60, 235, 255], gun: "ar", wide: 1.25 },
      ally:    { uni: [28, 36, 52], trs: [26, 34, 48], head: "visor", helm: [215, 225, 238], vest: [210, 220, 235], fut: true, pouches: true, pack: true, glow: [80, 255, 130], gun: "ar" },
    },
    pick: { health: [[232, 240, 244], [60, 255, 140]], ammo: [[34, 44, 58], [60, 220, 255]], grenade: [[26, 38, 56], [100, 240, 255]] },
    hit: [0x66ffff, 0xffaa44, 0xffffff], die: [0x66ffff, 0xff44aa, 0xffaa44], wallHit: [0x66ffff, 0xffffff, 0xffaa44],
    tracer: 0x66f0ff, flashCol: 0x66e0ff, orb: [0x33ddff, 0x66ffff], boomDebris: [0x66ffff, 0xffffff, 0x88aaff],
    shot(kind) {
      if (kind === "pistol") beep(1500, 0.1, "sawtooth", 0.08, -1200);
      else { beep(1200, 0.18, "sawtooth", 0.1, -1000); beep(320, 0.12, "square", 0.05, -120); }
    },
    eshot(t) { beep(t === "officer" ? 1500 : 950, 0.12, "sawtooth", 0.05, -700); },
  },
  ww10: {
    key: "ww10", sub: "3050 — Alien skies. The hive wants Earth. Don't die.", accent: "#c6f",
    font: "'Trebuchet MS', 'Helvetica Neue', Arial, sans-serif", mapCol: "#a8f", enemyCol: "#88ff44",
    fog: [96, 44, 124], fogDensity: 0.011, exposure: 1.05,
    sun: { color: [255, 170, 230], intensity: 1.9, u: 0.171, elev: 24 }, hemi: { sky: [150, 90, 220], ground: [44, 22, 70], intensity: 1.0 }, env: 0.9,
    bloom: { s: 0.5, r: 0.8, t: 0.85 },
    grade: { gain: [1.04, 0.96, 1.1], lift: [0.008, 0, 0.016], gamma: [1.0, 1.02, 0.94], sat: 1.15, vig: 0.8, grain: 0.03, aberr: 0.007, scan: 0.02 },
    walls: [["#d8d4e0", "hull"], ["#3a1a66", "crystal"], ["#14281c", "alien"]], wallRough: 0.6, wallMetal: 0.2, wallEmis: 2.4, normStrength: 3,
    floor: "alien", floorRepeat: 56, floorRough: 0.6, floorEmis: 1.2, sky: "ww10", props: "ww10",
    models: { primary: "rail", pistol: "blaster", knife: "void" },
    weapons: {
      primary: { name: "RAILGUN",    tag: "RAIL",  cd: 0.45, mag: 8,  reserve: 40, reload: 1.5, pickup: 8,  shake: 0.35, auto: false, dmg: 2, spread: 0.002, zoom: 1.45 },
      pistol:  { name: "BLASTER",    tag: "BLAST", cd: 0.14, mag: 20, reserve: 80, reload: 1.0, pickup: 20, shake: 0.08, auto: false, dmg: 1, spread: 0.007, zoom: 1.15 },
      knife:   { name: "VOID BLADE", tag: "VOID",  melee: true, cd: 0.3, dmg: 4, range: 2.1 },
    },
    types: TYPE_BASE.ww10,
    soldiers: {
      rifle:   { alien: true, uni: [70, 50, 100], plate: [110, 80, 150], glow: [120, 255, 100], gun: "alienrifle" },
      officer: { alien: true, uni: [120, 60, 150], plate: [210, 170, 80], glow: [255, 80, 255], pistol: true, gun: "alienpistol" },
      trooper: { alien: true, uni: [60, 74, 50], plate: [130, 104, 70], glow: [255, 130, 40], gun: "alienrifle", wide: 1.35 },
      ally:    { uni: [40, 60, 90], trs: [30, 48, 76], head: "visor", helm: [225, 225, 240], vest: [225, 225, 240], fut: true, pouches: true, pack: true, glow: [90, 200, 255], gun: "ar" },
    },
    pick: { health: [[40, 70, 50], [150, 255, 110]], ammo: [[36, 20, 60], [200, 110, 255]], grenade: [[34, 12, 58], [220, 150, 255]] },
    hit: [0x99ff44, 0xcc66ff, 0xffffff], die: [0x99ff44, 0xcc66ff, 0xffee88], wallHit: [0xcc66ff, 0xffffff, 0x88ffff],
    tracer: 0xe090ff, flashCol: 0xd070ff, orb: [0xcc66ff, 0xeeccff], boomDebris: [0xcc66ff, 0xffffff, 0x88ffff],
    shot(kind) {
      if (kind === "pistol") beep(600, 0.12, "triangle", 0.1, 500);
      else { beep(70, 0.3, "sawtooth", 0.2, -30); beep(900, 0.2, "sine", 0.1, -700); }
    },
    eshot(t) { beep(t === "officer" ? 420 : 300, 0.15, "sawtooth", 0.05, 500); },
  },
};
for (const k in THEMES) THEMES[k].types.ally = ALLY_T;
const THEME_ORDER = ["ww1", "ww3", "ww10"];
let TH = THEMES.ww1, themeKey = "ww1";
const SPAWNS = [[10.5, 10.5], [69.5, 10.5], [10.5, 69.5], [69.5, 69.5], [40.5, 40.5]];
