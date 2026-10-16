// ===================== world: map, terrain, walls, props, sky, lights =====================
function genMap() {
  const m = Array.from({ length: MH }, (_, y) => Array.from({ length: MW }, (_, x) => (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) ? 3 : 0));
  const set = (x, y, v) => { if (x > 0 && y > 0 && x < MW - 1 && y < MH - 1) m[y][x] = v; };
  for (let i = 0; i < 45; i++) {
    const w = R(4, 8), h = R(4, 7), x0 = R(3, MW - w - 4), y0 = R(3, MH - h - 4), mat = R(1, 2);
    for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) {
      const edge = x === x0 || y === y0 || x === x0 + w - 1 || y === y0 + h - 1;
      if (edge && Math.random() > 0.22) set(x, y, mat);
    }
    set(x0 + R(1, w - 2), y0, 0); set(x0, y0 + R(1, h - 2), 0); set(x0 + R(1, w - 2), y0 + h - 1, 0); set(x0 + w - 1, y0 + R(1, h - 2), 0);
  }
  for (let i = 0; i < 16; i++) {
    const horiz = Math.random() < 0.5, len = R(8, 22), x0 = R(3, MW - 26), y0 = R(3, MH - 26);
    for (let k = 0; k < len; k++) { if (k % 6 >= 4) continue; set(horiz ? x0 + k : x0, horiz ? y0 : y0 + k, 1); }
  }
  for (let i = 0; i < 130; i++) set(R(2, MW - 3), R(2, MH - 3), 2);
  for (let i = 0; i < 70; i++) {
    const x = R(3, MW - 4), y = R(3, MH - 4);
    for (let k = R(2, 4); k > 0; k--) set(x + R(-1, 1), y + R(-1, 1), 3);
  }
  for (const [sx, sy] of SPAWNS) for (let dx = -4; dx <= 4; dx++) for (let dy = -4; dy <= 4; dy++) set(Math.floor(sx) + dx, Math.floor(sy) + dy, 0);
  return m;
}

// ---------- terrain height ----------
let craters = [];
function groundH(sx, sz) {
  let h = 0.2 * Math.sin(sx * 0.05) * Math.cos(sz * 0.043) + 0.1 * Math.sin(sx * 0.11 + sz * 0.07) + 0.04 * Math.sin(sz * 0.23 + 1.3);
  for (const c of craters) {
    const dx = sx - c.x, dz = sz - c.z, d2 = dx * dx + dz * dz;
    if (d2 < c.r * c.r * 6) {
      const d = Math.sqrt(d2);
      h -= c.d * Math.exp(-d2 / (c.r * c.r * 0.5));
      h += c.d * 0.35 * Math.exp(-((d - c.r * 1.15) ** 2) / (c.r * c.r * 0.12));
    }
  }
  return h;
}
const gyL = (x, y) => groundH(x * CELL, y * CELL);    // ground height at a logic position

// ---------- per-theme GPU resources (built once, cached) ----------
const themeRes = {};
function buildThemeRes(T) {
  if (themeRes[T.key]) return themeRes[T.key];
  const res = {};
  res.wallMats = T.walls.map(([base, kind]) => {
    const cv = makeTexCv(base, kind);
    const m = new THREE.MeshStandardMaterial({
      map: toTex(cv), normalMap: toTex(normalFromCanvas(cv, T.normStrength), { srgb: false }),
      roughness: T.wallRough, metalness: T.wallMetal, envMapIntensity: T.env,
    });
    m.normalScale.set(1.2, 1.2);
    if (T.wallEmis > 0) { m.emissive = new THREE.Color(1, 1, 1); m.emissiveMap = toTex(emissiveFrom(cv, 185)); m.emissiveIntensity = T.wallEmis; }
    return m;
  });
  const fcv = floorTexCv(T.floor);
  res.floorMat = new THREE.MeshStandardMaterial({
    map: toTex(fcv, { rx: T.floorRepeat, ry: T.floorRepeat }), normalMap: toTex(normalFromCanvas(fcv, T.normStrength * 1.2), { srgb: false, rx: T.floorRepeat, ry: T.floorRepeat }),
    roughness: T.floorRough, metalness: T.key === "ww3" ? 0.3 : 0, vertexColors: true, envMapIntensity: T.env,
  });
  if (T.floorEmis > 0) { res.floorMat.emissive = new THREE.Color(1, 1, 1); res.floorMat.emissiveMap = toTex(emissiveFrom(fcv, 170), { rx: T.floorRepeat, ry: T.floorRepeat }); res.floorMat.emissiveIntensity = T.floorEmis; }
  const skyCv = skyTex(T.sky);
  res.skyTex = new THREE.CanvasTexture(skyCv);
  res.skyTex.colorSpace = THREE.SRGBColorSpace; res.skyTex.wrapS = THREE.RepeatWrapping; res.skyTex.wrapT = THREE.ClampToEdgeWrapping;
  res.skyTex.repeat.set(2, 180 / (800 * 0.075)); res.skyTex.offset.set(0, -((90 - 7.5) / 180) * 180 / (800 * 0.075));
  res.skyTex.anisotropy = MAXANISO;
  const envSrc = new THREE.CanvasTexture(skyCv); envSrc.mapping = THREE.EquirectangularReflectionMapping; envSrc.colorSpace = THREE.SRGBColorSpace;
  res.env = pmrem.fromEquirectangular(envSrc).texture; envSrc.dispose();
  themeRes[T.key] = res; return res;
}
const pmrem = new THREE.PMREMGenerator(renderer);

// puddle / crater decal textures
function craterDecalTex() {
  const [c, g] = mk(256, 256);
  const rg = g.createRadialGradient(128, 128, 20, 128, 128, 128);
  rg.addColorStop(0, "rgba(0,0,0,0.55)"); rg.addColorStop(0.55, "rgba(10,6,2,0.4)"); rg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.18})`; g.beginPath(); g.arc(128 + (Math.random() - 0.5) * 220, 128 + (Math.random() - 0.5) * 220, 2 + Math.random() * 9, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const CRATER_TEX = craterDecalTex();

// ---------- sky, lights, fog (persistent objects) ----------
const skyMat = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, fog: false, depthWrite: false, toneMapped: false });   // geometry is x-mirrored, so its inside faces are front faces
const skyGeo = new THREE.SphereGeometry(520, 64, 32); skyGeo.scale(-1, 1, 1);
const skyMesh = new THREE.Mesh(skyGeo, skyMat); skyMesh.renderOrder = -10; skyMesh.frustumCulled = false;
scene.add(skyMesh);
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.castShadow = true; sunLight.shadow.mapSize.set(2048, 2048);
Object.assign(sunLight.shadow.camera, { left: -46, right: 46, top: 46, bottom: -46, near: 1, far: 240 });
sunLight.shadow.bias = -0.0004; sunLight.shadow.normalBias = 0.05;
scene.add(sunLight, sunLight.target);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemiLight);
const sunDir = new THREE.Vector3(0.4, 0.8, 0.3);
function skyDir(u, elevDeg) {
  const phi = u * TAU, el = elevDeg * Math.PI / 180;
  return new THREE.Vector3(Math.cos(phi) * Math.cos(el), Math.sin(el), Math.sin(phi) * Math.cos(el));
}

// ---------- world assembly ----------
let world = null;
const wallGeo = (() => {
  const g = new THREE.BoxGeometry(CELL, WALLH + 0.8, CELL), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) { const face = Math.floor(i / 4); if (face < 2 || face > 3) uv.setY(i, uv.getY(i) * (WALLH + 0.8) / CELL); }
  return g;
})();

function buildWorld(T) {
  if (world) { scene.remove(world.group); world.dispose.forEach(d => d.dispose()); }
  const res = buildThemeRes(T), group = new THREE.Group(), dispose = [];
  const own = o => { dispose.push(o); return o; };

  // environment look
  scene.fog = new THREE.FogExp2(hex(T.fog), T.fogDensity);
  scene.background = hex(T.fog);
  scene.environment = res.env;
  renderer.toneMappingExposure = T.exposure;
  skyMat.map = res.skyTex; skyMat.needsUpdate = true;
  sunLight.color.copy(hex(T.sun.color)); sunLight.intensity = T.sun.intensity;
  sunDir.copy(skyDir(T.sun.u, T.sun.elev));
  hemiLight.color.copy(hex(T.hemi.sky));
  hemiLight.groundColor.copy(hex(T.hemi.ground)); hemiLight.intensity = T.hemi.intensity;
  bloom.strength = T.bloom.s; bloom.radius = T.bloom.r; bloom.threshold = T.bloom.t;
  const g = T.grade;
  GU.gain.value.set(...g.gain); GU.lift.value.set(...g.lift); GU.gamma.value.set(...g.gamma);
  GU.sat.value = g.sat; GU.vig.value = g.vig; GU.grain.value = g.grain; GU.aberr.value = g.aberr; GU.scan.value = g.scan;

  // craters
  craters = [];
  for (let i = 0; i < 16; i++) {
    for (let t = 0; t < 40; t++) {
      const x = (6 + Math.random() * (MW - 12)) * CELL, z = (6 + Math.random() * (MH - 12)) * CELL;
      if (SPAWNS.some(([sx, sy]) => Math.hypot(sx * CELL - x, sy * CELL - z) < 14)) continue;
      craters.push({ x, z, r: 2.6 + Math.random() * 3.2, d: 0.35 + Math.random() * 0.4 }); break;
    }
  }

  // terrain
  const SIZE = (MW + 90) * CELL, SEG = 220;
  const tg = own(new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG)); tg.rotateX(-Math.PI / 2);
  const cx = MW * CELL / 2, cz = MH * CELL / 2, pos = tg.attributes.position, col = new Float32Array(pos.count * 3);
  const tone = T.key === "ww1" ? [1, 0.95, 0.88] : T.key === "ww3" ? [0.9, 0.95, 1.05] : [1.05, 0.9, 1.1];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx, z = pos.getZ(i) + cz;
    pos.setX(i, x); pos.setZ(i, z); const h = groundH(x, z); pos.setY(i, h);
    const n = 0.82 + 0.18 * (Math.sin(x * 0.21 + Math.sin(z * 0.13) * 2) * 0.5 + 0.5) + 0.1 * Math.sin(z * 0.37 + x * 0.19) - Math.max(0, -h) * 0.5;
    col[i * 3] = n * tone[0]; col[i * 3 + 1] = n * tone[1]; col[i * 3 + 2] = n * tone[2];
  }
  tg.setAttribute("color", new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, res.floorMat); terrain.receiveShadow = true; group.add(terrain);

  // walls (instanced, one mesh per material)
  const counts = [0, 0, 0, 0];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (MAP[y][x]) counts[MAP[y][x]]++;
  const mtx = new THREE.Matrix4(), c3 = new THREE.Color();
  for (let t = 1; t <= 3; t++) {
    if (!counts[t]) continue;
    const im = new THREE.InstancedMesh(wallGeo, res.wallMats[t - 1], counts[t]); let n = 0;
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (MAP[y][x] === t) {
      mtx.makeTranslation((x + 0.5) * CELL, (WALLH + 0.8) / 2 - 0.8, (y + 0.5) * CELL); im.setMatrixAt(n, mtx);
      const v = 0.8 + Math.random() * 0.2; c3.setRGB(v, v, v); im.setColorAt(n, c3); n++;
    }
    im.castShadow = im.receiveShadow = true; im.frustumCulled = false; group.add(im);
  }

  // props: rocks, debris, barrels, crates, themed extras
  const free = () => {
    for (let t = 0; t < 60; t++) {
      const x = 2 + Math.random() * (MW - 4), y = 2 + Math.random() * (MH - 4);
      if (!solid(x, y) && !SPAWNS.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 5)) return [x, y];
    }
    return null;
  };
  const scatter = (geo, mat, count, place, shadow = true) => {
    const im = new THREE.InstancedMesh(geo, mat, count), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
    let n = 0;
    for (let i = 0; i < count; i++) {
      const f = free(); if (!f) continue;
      const sx = f[0] * CELL, sz = f[1] * CELL, h = groundH(sx, sz), r = place(i, sx, sz, h, p, e, s);
      q.setFromEuler(e); m.compose(p, q, s); im.setMatrixAt(n++, m);
    }
    im.count = n; im.castShadow = shadow; im.receiveShadow = true; im.frustumCulled = false; group.add(im); return im;
  };
  const rockCol = T.key === "ww1" ? 0x6a604e : T.key === "ww3" ? 0x4a4c56 : 0x3a2a4a;
  const rockMat = own(new THREE.MeshStandardMaterial({ color: rockCol, roughness: 0.95, flatShading: true, envMapIntensity: T.env * 0.6 }));
  scatter(own(new THREE.IcosahedronGeometry(0.32, 0)), rockMat, 260, (i, x, z, h, p, e, s) => {
    const k = 0.5 + Math.random() * 1.4; p.set(x, h + 0.04, z); e.set(Math.random() * 3, Math.random() * 6, Math.random() * 3); s.set(k, k * (0.5 + Math.random() * 0.5), k * (0.7 + Math.random() * 0.6));
  });
  const metal = T.key === "ww1" ? 0x5a3a24 : T.key === "ww3" ? 0xd0701a : 0x5a4a78;
  const barrelMat = own(new THREE.MeshStandardMaterial({ color: metal, roughness: 0.55, metalness: 0.6, envMapIntensity: T.env }));
  if (T.key !== "ww10") scatter(own(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 14)), barrelMat, 46, (i, x, z, h, p, e, s) => { p.set(x, h + 0.44, z); e.set(0, Math.random() * 6, 0); s.set(1, 1, 1); });
  const crateMat = res.wallMats[1];
  scatter(own(new RoundedBoxGeometry(0.85, 0.75, 0.85, 3, 0.04)), crateMat, 26, (i, x, z, h, p, e, s) => { p.set(x, h + 0.36, z); e.set(0, Math.random() * 6, 0); s.set(1, 1, 1); });
  scatter(own(new THREE.BoxGeometry(1.4, 0.12, 0.7)), rockMat, 40, (i, x, z, h, p, e, s) => { p.set(x, h + 0.1, z); e.set((Math.random() - 0.5) * 0.4, Math.random() * 6, (Math.random() - 0.5) * 0.4); s.set(1, 1, 1); });
  if (T.key === "ww10") {                                                         // alien crystal clusters
    const cm = own(new THREE.MeshStandardMaterial({ color: 0x7a30d0, emissive: new THREE.Color(0.55, 0.2, 1), emissiveIntensity: 1.6, roughness: 0.2, metalness: 0.3, envMapIntensity: T.env }));
    scatter(own(new THREE.ConeGeometry(0.22, 1.5, 5)), cm, 150, (i, x, z, h, p, e, s) => { const k = 0.5 + Math.random() * 1.6; p.set(x, h + 0.7 * k, z); e.set((Math.random() - 0.5) * 0.5, Math.random() * 6, (Math.random() - 0.5) * 0.5); s.set(k, k, k); }, false);
  }
  if (T.key === "ww3") {                                                          // neon street posts
    const pm = own(new THREE.MeshStandardMaterial({ color: 0x20262e, roughness: 0.5, metalness: 0.7, emissive: new THREE.Color(0.1, 0.8, 1), emissiveIntensity: 1.6, envMapIntensity: T.env }));
    scatter(own(new THREE.CylinderGeometry(0.05, 0.07, 3.4, 8)), pm, 36, (i, x, z, h, p, e, s) => { p.set(x, h + 1.7, z); e.set(0, 0, 0); s.set(1, 1, 1); }, false);
  }

  // craters: scorch decal + reflective puddle
  const decalMat = own(new THREE.MeshBasicMaterial({ map: CRATER_TEX, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, fog: true }));
  const puddleCol = T.key === "ww10" ? new THREE.Color(0.3, 1.0, 0.5) : T.key === "ww3" ? new THREE.Color(0.02, 0.05, 0.1) : new THREE.Color(0.05, 0.05, 0.05);
  const puddleMat = own(new THREE.MeshStandardMaterial({ color: puddleCol, roughness: 0.04, metalness: T.key === "ww1" ? 0.0 : 0.6, transparent: true, opacity: T.key === "ww10" ? 0.9 : 0.78, envMapIntensity: 1.6, emissive: T.key === "ww10" ? new THREE.Color(0.1, 0.5, 0.2) : new THREE.Color(0, 0, 0), emissiveIntensity: 1 }));
  for (const c of craters) {
    const dm = new THREE.Mesh(own(new THREE.PlaneGeometry(c.r * 5, c.r * 5)), decalMat); dm.rotation.x = -Math.PI / 2; dm.position.set(c.x, groundH(c.x, c.z) + 0.03, c.z); group.add(dm);
    const pu = new THREE.Mesh(own(new THREE.CircleGeometry(c.r * 0.95, 28)), puddleMat); pu.rotation.x = -Math.PI / 2;
    pu.position.set(c.x, groundH(c.x, c.z) + 0.1 + c.d * 0.12, c.z); pu.scale.set(1, 1, 0.9); group.add(pu);
  }

  scene.add(group);
  world = { group, dispose };
  skyMesh.visible = true;
}

function updateWorld() {
  skyMesh.position.copy(camera.position);
  const cp = camera.position;
  const tx = Math.round(cp.x / 2) * 2, tz = Math.round(cp.z / 2) * 2;       // snap to avoid shadow shimmer
  sunLight.target.position.set(tx, 0, tz);
  sunLight.position.set(tx + sunDir.x * 120, sunDir.y * 120, tz + sunDir.z * 120);
  sunLight.target.updateMatrixWorld();
}
