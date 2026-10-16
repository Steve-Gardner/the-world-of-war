// ===================== per-frame render sync: entities, camera, viewmodel =====================
const gunSun = new THREE.DirectionalLight(0xffffff, 2.2); gunSun.position.set(-1.2, 2, 1.2); gunScene.add(gunSun);
const gunHemi = new THREE.HemisphereLight(0xffffff, 0x333333, 0.9); gunScene.add(gunHemi);
const gunFlashLight = new THREE.PointLight(0xffffff, 0, 3.5, 2); gunScene.add(gunFlashLight);
let lookDX = 0, lookDY = 0, swayX = 0, swayY = 0;
const BASE_FOV = 72;

function syncEntities(dt) {
  const cp = camera.position;
  const sync = (e, dead) => {
    const rig = e.rig, gx = e.x * CELL, gz = e.y * CELL, h = rig.holder;
    h.position.set(gx, groundH(gx, gz) + (e.h || 0), gz); h.rotation.y = Math.PI / 2 - e.face;
    const dist = Math.hypot(gx - cp.x, gz - cp.z);
    h.visible = dist < QUALITY[curQ].ents;
    if (!h.visible) return;
    poseSoldier(rig, e, dt, dead);
    if (rig.flashSprite) rig.flashSprite.visible = !dead && e.fired > 0;
  };
  for (const e of enemies) sync(e, false);
  for (const a of allies) sync(a, false);
  for (const c of corpses) sync(c, true);
  const T = performance.now() / 1000;
  for (const k of pickups) { k.mesh.position.y = k.base + 0.14 + Math.sin(T * 2 + k.ph) * 0.07; k.mesh.rotation.y += dt * 1.4; }
}

function updateCamera(dt) {
  const df = state === "dying" || state === "dead" ? Math.min(1, deathT / 1.5) : 0, ease = df * df * (3 - 2 * df);
  const gy = groundH(P.x * CELL, P.y * CELL);
  const grounded = P.jz <= 0, bobY = P.moving && grounded ? Math.sin(bob * 2) * 0.032 : 0, bobX = P.moving && grounded ? Math.cos(bob) * 0.018 : 0;
  const ey = lerp(EYE, 0.3, ease);
  const yaw = -P.a - Math.PI / 2;
  camera.position.set(P.x * CELL, gy + ey + P.jz + bobY * (1 - adsAmt * 0.6), P.y * CELL);
  camera.rotation.set(0, yaw, 0);
  camera.translateX(bobX * (1 - adsAmt * 0.6));
  const sk = shake * 0.012;
  camera.rotation.x = P.pitch + camKick + (shake ? rs() * sk : 0) - ease * 0.5;
  camera.rotation.y = yaw + (shake ? rs() * sk : 0);
  camera.rotation.z = ease * 0.85 + (shake ? rs() * sk * 0.7 : 0);
  const wd = curW(), zoom = wd.zoom || 1;
  const fovAds = 2 * Math.atan(Math.tan(BASE_FOV * Math.PI / 360) / zoom) * 180 / Math.PI;
  const f = lerp(BASE_FOV, fovAds, adsAmt) + (running() && P.moving && state === "play" ? 3 : 0);
  if (Math.abs(camera.fov - f) > 0.01) { camera.fov = lerp(camera.fov, f, Math.min(1, dt * 14)); camera.updateProjectionMatrix(); }
}

const _vp = new THREE.Vector3();
function updateVM(dt) {
  const set = VMS[themeKey]; if (!set) return;
  const df = state === "dying" || state === "dead" ? 1 : 0;
  for (const k of ["primary", "pistol", "knife"]) set[k].holder.visible = (k === P.w) && !df;
  const vm = set[P.w], wd = curW();
  const adsT = adsHeld && !wd.melee && P.reload <= 0 && P.swapT <= 0.05 && state === "play" ? 1 : 0;
  adsAmt = lerp(adsAmt, adsT, Math.min(1, dt * 11));
  swayX = lerp(swayX, clamp(-lookDX * 0.0009, -0.05, 0.05), Math.min(1, dt * 9)); swayY = lerp(swayY, clamp(lookDY * 0.0009, -0.05, 0.05), Math.min(1, dt * 9));
  lookDX = lookDY = 0;
  const pos = _vp.copy(vm.base).lerp(vm.ads, adsAmt);
  const mv = P.moving ? 1 : 0, sprint = P.moving && running();
  pos.y += Math.sin(bob * 2) * 0.007 * mv * (1 - adsAmt * 0.8) + (sprint ? -0.02 : 0);
  pos.x += Math.cos(bob) * 0.006 * mv * (1 - adsAmt * 0.8) + swayX * (1 - adsAmt * 0.7);
  pos.y += swayY * (1 - adsAmt * 0.7);
  let rx = recoil * 0.06, ry = swayX * 1.2, rz = swayX * -2 + (sprint ? 0.18 : 0), pz = recoil * 0.05;
  if (P.reload > 0 && wd.reload) { const k = Math.sin((wd.reload - P.reload) / wd.reload * Math.PI); pos.y -= k * 0.13; rz += k * 0.5; rx -= k * 0.25; pos.x -= k * 0.05; }
  if (P.swapT > 0) { const k = P.swapT / 0.3; pos.y -= k * 0.34; rx -= k * 0.5; }
  if (wd.melee && P.swing > 0) {
    const s = Math.sin((1 - P.swing) * Math.PI);
    pos.x = lerp(vm.base.x, -0.22, s); pos.y += 0.12 * s; pos.z -= 0.08 * s; rz += -1.3 * s; ry += 0.6 * s; rx += 0.4 * s;
  }
  vm.holder.position.set(pos.x, pos.y, pos.z + pz);
  vm.holder.rotation.set(rx, Math.PI + ry, rz);
  vm.flash.visible = flash > 0; if (flash > 0) { const k = 0.7 + Math.random() * 0.6; vm.flash.scale.setScalar((P.w === "pistol" ? 0.34 : 0.5) * k); vm.flash.material.rotation = Math.random() * 6; }
  vm.holder.updateMatrixWorld(true);
  if (flash > 0) { vm.muzzle.getWorldPosition(_vp); gunFlashLight.position.copy(_vp).add(new THREE.Vector3(0, 0.05, -0.1)); gunFlashLight.color.setHex(TH.flashCol, THREE.SRGBColorSpace); gunFlashLight.intensity = 14; } else gunFlashLight.intensity = 0;
}

function renderFrame(dt) {
  const T = performance.now() / 1000;
  syncEntities(dt); updateCamera(dt); updateWorld(); updateVM(dt); fxUpdate(dt);
  GU.time.value = T % 100;
  const low = state === "play" && P.hp < 30 ? (0.25 + 0.2 * Math.sin(T * 6)) * (1 - P.hp / 30) : 0;
  GU.hurt.value = Math.max(clamp(hurt * 1.6, 0, 1), low);
  const df = state === "dying" || state === "dead" ? Math.min(1, deathT / 1.4) : 0;
  GU.desat.value = df * 0.9; GU.flashAmt.value = boom > 0 ? boom * 1.5 : 0; GU.flashCol.value.set(1, 0.85, 0.55);
  GU.vig.value = TH.grade.vig + df * 0.6 + adsAmt * 0.35;
  composer.render(dt);
  drawHUD();
}
