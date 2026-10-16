#!/usr/bin/env python3
"""Build the game: src/*.js -> index.html (from index.template.html) and sw.js (offline cache list).
Run `python3 build.py` after any change, then commit and push to publish."""
import glob, json, pathlib, time
root = pathlib.Path(__file__).parent
stamp = str(int(time.time()))
code = "\n".join(pathlib.Path(p).read_text() for p in sorted(glob.glob(str(root / "src" / "*.js"))))
tpl = (root / "index.template.html").read_text()
(root / "index.html").write_text(tpl.replace("/*GAME*/", code) + f"\n<!-- build {stamp} -->\n")
assets = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"]
assets += ["./" + str(p.relative_to(root)) for p in sorted((root / "vendor").rglob("*.js"))]
sw = (root / "sw.template.js").read_text().replace("__VERSION__", "wow-" + stamp).replace("__ASSETS__", json.dumps(assets))
(root / "sw.js").write_text(sw)
print(f"built index.html ({len(code)//1024} KB of game code) and sw.js ({len(assets)} cached files)")
