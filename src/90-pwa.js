// ===================== install as app, offline support, fullscreen =====================
const installBtn = document.getElementById("installBtn");
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; installBtn.style.display = "block"; });
installBtn.addEventListener("click", async ev => {
  ev.stopPropagation(); if (!deferredInstall) return;
  deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; installBtn.style.display = "none";
});
window.addEventListener("appinstalled", () => { installBtn.style.display = "none"; });
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(() => {});
addEventListener("keydown", e => {
  if (e.code !== "KeyF" || e.repeat) return;
  if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
});
