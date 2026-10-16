import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// ===================== THE WORLD OF WAR — 3D engine =====================
const canvas = document.getElementById("c");
const hudCv = document.getElementById("hud");
const hud = hudCv.getContext("2d");
const overlay = document.getElementById("overlay");
const titleEl = document.getElementById("title");
const subEl = document.getElementById("sub");
const cardsEl = document.getElementById("cards");
const hintEl = document.getElementById("hint");
const restartEl = document.getElementById("restart");
const tutBtn = document.getElementById("tutBtn");
const bloodBtn = document.getElementById("bloodBtn");
let noBlood = true;                                                        // default: no blood (toggle with B)
try { noBlood = localStorage.getItem("wow_blood") !== "1"; } catch (e) {}
function setNoBlood(v) { noBlood = v; try { localStorage.setItem("wow_blood", v ? "0" : "1"); } catch (e) {} bloodBtn.textContent = noBlood ? "BLOOD: OFF  (B)" : "BLOOD: ON  (B)"; }

const CELL = 1.6;            // metres per map cell
const WALLH = 3.2;           // wall height in metres
const EYE = 1.68;            // eye height in metres
const MW = 80, MH = 80;
let MAP = [];
const solid = (x, y) => x < 0 || y < 0 || x >= MW || y >= MH || MAP[y | 0][x | 0] > 0;
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
function mk(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
const hex = a => new THREE.Color().setRGB(a[0] / 255, a[1] / 255, a[2] / 255, THREE.SRGBColorSpace);

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
let PR = Math.min(window.devicePixelRatio || 1, 1.5);
const MAXANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, 1, 0.05, 700);
camera.rotation.order = "YXZ";
scene.add(camera);
const gunScene = new THREE.Scene();
const gunCam = new THREE.PerspectiveCamera(52, 1, 0.01, 20);
gunScene.add(gunCam);

// ---------- post-processing ----------
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null }, time: { value: 0 }, vig: { value: 0.7 }, grain: { value: 0.04 }, aberr: { value: 0.004 },
    sat: { value: 1 }, hurt: { value: 0 }, desat: { value: 0 }, flashAmt: { value: 0 },
    lift: { value: new THREE.Vector3(0, 0, 0) }, gamma: { value: new THREE.Vector3(1, 1, 1) }, gain: { value: new THREE.Vector3(1, 1, 1) },
    flashCol: { value: new THREE.Vector3(1, 0.8, 0.5) }, scan: { value: 0 },
  },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, vig, grain, aberr, sat, hurt, desat, flashAmt, scan;
    uniform vec3 lift, gamma, gain, flashCol; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5; float r2 = dot(c, c); vec2 off = c * r2 * aberr;
      vec3 col; col.r = texture2D(tDiffuse, vUv - off).r; col.g = texture2D(tDiffuse, vUv).g; col.b = texture2D(tDiffuse, vUv + off).b;
      col = col * gain + lift; col = pow(max(col, 0.0), gamma);
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722)); col = mix(vec3(l), col, sat * (1.0 - desat));
      float v = smoothstep(0.95, 0.15, length(c * vec2(1.0, 0.92)) * 1.4); col *= mix(1.0, v, vig);
      col += (hash(vUv * vec2(1920.0, 1080.0)) - 0.5) * grain;
      col *= 1.0 - scan * (0.5 + 0.5 * sin(vUv.y * 1400.0));
      float hv = smoothstep(0.2, 0.85, length(c) * 1.5); col = mix(col, vec3(0.55, 0.01, 0.01), hurt * hv);
      col = mix(col, flashCol, flashAmt);
      gl_FragColor = vec4(col, 1.0);
    }`,
};
const rtTarget = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rtTarget);
composer.addPass(new RenderPass(scene, camera));
const gunPass = new RenderPass(gunScene, gunCam);
gunPass.clear = false; gunPass.clearDepth = true;
composer.addPass(gunPass);
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.6, 0.85);
composer.addPass(bloom);
const gradePass = new ShaderPass(GradeShader);
composer.addPass(gradePass);
composer.addPass(new OutputPass());
const GU = GradeShader.uniforms;

let VW = 1280, VH = 720;     // CSS size of the viewport
function resize() {
  VW = window.innerWidth; VH = window.innerHeight;
  renderer.setPixelRatio(PR);
  renderer.setSize(VW, VH, false);
  canvas.style.width = VW + "px"; canvas.style.height = VH + "px";
  composer.setPixelRatio(PR); composer.setSize(VW, VH);
  bloom.resolution.set(VW * PR * 0.5, VH * PR * 0.5);
  camera.aspect = gunCam.aspect = VW / VH;
  camera.updateProjectionMatrix(); gunCam.updateProjectionMatrix();
  hudCv.width = Math.round(VW * Math.min(window.devicePixelRatio || 1, 2)); hudCv.height = Math.round(VH * Math.min(window.devicePixelRatio || 1, 2));
  hudCv.style.width = VW + "px"; hudCv.style.height = VH + "px";
}
addEventListener("resize", resize);
resize();

// ---------- audio ----------
let actx = null;
function beep(freq, dur, type = "square", vol = 0.12, slide = 0) {
  if (!actx) return;
  const o = actx.createOscillator(), gn = actx.createGain();
  o.type = type; o.frequency.value = freq;
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), actx.currentTime + dur);
  gn.gain.setValueAtTime(vol, actx.currentTime);
  gn.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
  o.connect(gn).connect(actx.destination);
  o.start(); o.stop(actx.currentTime + dur);
}
function noise(dur, vol = 0.2) {
  if (!actx) return;
  const buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = actx.createBufferSource(), gn = actx.createGain();
  gn.gain.value = vol; s.buffer = buf; s.connect(gn).connect(actx.destination); s.start();
}
