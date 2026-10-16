# The World of War

A 3D first-person shooter you can play in your browser, across three wars: **World War I**, **World War III** and **World War 10**.
Created by **KrackedGames**.

**Play:** open the game's web address in Chrome or Edge, click an era, and press **L** (or click) to start.
Click **Install as app** on the title screen for a desktop icon that also works offline.

## Phones and tablets
The game detects touch devices automatically (Android and iPhone/iPad) and switches to on-screen controls:
a floating thumbstick on the left (push it all the way to run), drag on the right to look, and buttons for fire, aim, jump, reload, grenade and weapon swap.
Graphics quality also adapts: phones start at Medium and the game steps down by itself if it runs slowly.
Use the **Controls** and **Graphics** buttons on the title screen to override either. On iPhone, use Share → Add to Home Screen for full-screen play.

## Controls (keyboard and mouse)
| Action | Key |
|---|---|
| Move / look | WASD / mouse |
| Fire | Click, or hold **Z** |
| Aim down sights | Hold **N** or right-click |
| Jump / run | **Space** / hold **C** or Shift |
| Weapons | **1** pistol, **2** knife, **3** rifle (wheel / Q also swap) |
| Grenade / reload | **G** / **R** |
| Pause / fullscreen | **Esc** / **F** |
| Tutorial / blood toggle (title screen) | **H** / **B** |

## For whoever edits the game
* Game code lives in `src/*.js`; the page shell is `index.template.html`.
* After any change run `python3 build.py` (it writes `index.html` and `sw.js`), then commit and push. GitHub Pages republishes automatically in about a minute.
* The 3D library (Three.js, MIT licence) is bundled in `vendor/` so the game works offline.
