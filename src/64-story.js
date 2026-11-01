// ===================== story mode: 9 levels, play as Jeff Sr. or Jeff Jr. =====================
const STORY = [
  { era: "ww1", map: "front", goal: 3, title: "OVER THE TOP",
    brief: "France, 1917. {me} climbs out of the trench and into no man's land, with {other} close behind. Clear the enemy from the front line.",
    win: "The line holds. {other} wipes the mud off and grins. One battle down, but the war is far from over." },
  { era: "ww1", map: "gallipoli", goal: 3, title: "THE LANDING",
    brief: "Gallipoli, 1915. The boats hit the beach under fire. {me} and {other} must storm the shore and take the dunes before the tide of the battle turns.",
    win: "The beach is theirs. Up on the cliffs, the Turkish trenches are waiting for the next push." },
  { era: "ww1", map: "verdun", goal: 4, title: "HOLD THE FORT",
    brief: "Verdun, 1916. The old fort is a pile of rubble, and the enemy wants it back. Hold it with everything you have.",
    win: "The fort stands, barely. {other} finds a scorched map pointing toward the Somme." },
  { era: "ww1", map: "somme", goal: 4, title: "NO MAN'S LAND",
    brief: "The Somme, 1916. Two trench lines and a field of craters between them. Cross it, keep moving, and keep {other} covered.",
    win: "Across the wire and into their trench. Tonight the sky is clear. Tomorrow, Ypres." },
  { era: "ww1", map: "ypres", goal: 5, title: "NIGHT AT YPRES",
    brief: "Ypres, 1917. Fog, flooded streets and a moonless night. Something is moving in the ruins of the old hall. Stay sharp.",
    win: "At dawn a strange light fills the sky. {me} and {other} blink, and the trenches are gone." },
  { era: "ww3", map: "front", goal: 4, title: "NEON RUINS",
    brief: "2087. The Jeffs wake up in a city of neon and ruins. Machines are hunting them. Find a way through the streets.",
    win: "The first machines fall. A faint signal is coming from the old tower across the city." },
  { era: "ww3", map: "front", goal: 5, title: "MACHINE UPRISING",
    brief: "The machines have dug in around the signal tower. Break their line so {other} can reach it.",
    win: "The tower hums, then the sky tears open and pulls {me} and {other} through." },
  { era: "ww10", map: "front", goal: 5, title: "ALIEN SKIES",
    brief: "3050. A purple sky and alien soldiers everywhere. The signal led here. Fight your way toward the hive.",
    win: "The hive is close. You can feel the ground shaking. One more fight." },
  { era: "ww10", map: "front", goal: 6, title: "THE LAST STAND",
    brief: "The hive's last defenders. Win this, and {me} and {other} can finally go home.",
    win: "The hive collapses. A warm light opens, and the Jeffs step through, home at last." },
];
const HEROES = { sr: { name: "JEFF SR.", other: "Jeff Jr.", perk: "TOUGH · takes 20% less damage" }, jr: { name: "JEFF JR.", other: "Jeff Sr.", perk: "QUICK · runs 10% faster" } };
let story = null, storyUI = false, storyMode = "select", hero = "sr", storyProg = 1;
try { hero = localStorage.getItem("wow_hero") === "jr" ? "jr" : "sr"; storyProg = Math.max(1, Math.min(9, +localStorage.getItem("wow_story") || 1)); } catch (e) {}
const heroMul = () => (story && hero === "sr" ? 0.8 : 1);
const heroSpd = () => (story && hero === "jr" ? 1.1 : 1);
const storyEl = document.getElementById("story"), storyTextEl = document.getElementById("storyText"), lvGridEl = document.getElementById("lvGrid"), heroRowEl = document.getElementById("heroRow");
const storyGoEl = document.getElementById("storyGo"), storyBackEl = document.getElementById("storyBack"), storyBtn = document.getElementById("storyBtn");
const sfill = s => s.replace(/\{me\}/g, hero === "sr" ? "Jeff Sr." : "Jeff Jr.").replace(/\{other\}/g, HEROES[hero].other);

function showStory(mode) {
  storyMode = mode; storyUI = true; document.body.classList.add("storyui"); mouseDown = false; adsHeld = false;
  cardsEl.style.display = mapsEl.style.display = "none"; restartEl.style.display = "none"; tutBtn.style.display = storyBtn.style.display = "none"; exitTutBtn.style.display = "none";
  overlay.style.display = "flex"; storyEl.style.display = "flex";
  const sel = mode === "select", L = story ? STORY[story.lv] : null;
  lvGridEl.style.display = heroRowEl.style.display = sel ? "flex" : "none";
  storyGoEl.style.display = sel ? "none" : "block"; storyBackEl.style.display = "block";
  if (sel) {
    titleEl.textContent = "STORY MODE"; subEl.textContent = "Pick your hero, then choose a level.";
    storyTextEl.textContent = "Play as Jeff Sr. or Jeff Jr. — the other one fights beside you. " + HEROES[hero].perk + ".";
    lvGridEl.innerHTML = ""; heroRowEl.innerHTML = "";
    for (const k of ["sr", "jr"]) { const b = document.createElement("div"); b.className = "chip" + (hero === k ? " sel" : ""); b.textContent = HEROES[k].name; b.onclick = ev => { ev.stopPropagation(); hero = k; try { localStorage.setItem("wow_hero", k); } catch (e) {} showStory("select"); }; heroRowEl.appendChild(b); }
    STORY.forEach((d, i) => {
      const b = document.createElement("div"), open = i < storyProg;
      b.className = "lv" + (open ? "" : " lock") + (i === storyProg - 1 ? " cur" : ""); b.innerHTML = `<b>${open ? i + 1 : "🔒"}</b><i>${d.title}</i>`;
      if (open) b.onclick = ev => { ev.stopPropagation(); story = { lv: i, goal: d.goal }; showStory("brief"); };
      lvGridEl.appendChild(b);
    });
    storyBackEl.textContent = "BACK TO MENU";
  } else {
    storyBackEl.textContent = "LEVEL SELECT";
    if (mode === "brief") { titleEl.textContent = `LEVEL ${story.lv + 1} · ${L.title}`; subEl.textContent = `${HEROES[hero].name}  ·  win by surviving ${L.goal} waves`; storyTextEl.textContent = sfill(L.brief); storyGoEl.textContent = "▶ START LEVEL"; }
    else if (mode === "win") { const last = story.lv === STORY.length - 1; titleEl.textContent = last ? "THE END" : `LEVEL ${story.lv + 1} COMPLETE`; subEl.textContent = `Score ${score}`; storyTextEl.textContent = sfill(L.win) + (last ? "  Thanks for playing! Created by KrackedGames." : ""); storyGoEl.textContent = last ? "PLAY AGAIN FROM LEVEL 1" : "NEXT LEVEL ▶"; }
    else { titleEl.textContent = "YOU DIED"; subEl.textContent = `Level ${story.lv + 1} · ${L.title} · reached wave ${wave} of ${L.goal}`; storyTextEl.textContent = "Get up. The Jeffs never quit."; storyGoEl.textContent = "RETRY LEVEL"; }
  }
}
function storyPrimary() {
  if (storyMode === "brief" || storyMode === "lose") beginLevel();
  else if (storyMode === "win") { if (story.lv === STORY.length - 1) story.lv = 0; else story.lv++; story.goal = STORY[story.lv].goal; showStory("brief"); }
}
function beginLevel() {
  const d = STORY[story.lv]; story.goal = d.goal; storyUI = false; document.body.classList.remove("storyui"); storyEl.style.display = "none";
  state = "menu"; fresh = false; spawnPicked = false; spawnIdx = Math.floor(Math.random() * SPAWNS.length);
  selectTheme(d.era); startGame();
}
function storyWin() {
  state = "menu"; mouseDown = false; adsHeld = false; document.exitPointerLock && document.exitPointerLock();
  if (story.lv + 2 > storyProg) { storyProg = Math.min(9, story.lv + 2); try { localStorage.setItem("wow_story", String(storyProg)); } catch (e) {} }
  noise(0.2, 0.2); beep(660, 0.12, "triangle", 0.1, 300); beep(990, 0.2, "triangle", 0.08, 200);
  showStory("win");
}
function leaveStory() {                                                       // back to the main menu
  story = null; storyUI = false; document.body.classList.remove("storyui"); storyEl.style.display = "none"; exitTutorial();
}
storyBtn.addEventListener("click", ev => { ev.stopPropagation(); if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); story = { lv: Math.min(storyProg, 9) - 1, goal: 0 }; showStory("select"); });
storyGoEl.addEventListener("click", ev => { ev.stopPropagation(); storyPrimary(); });
storyBackEl.addEventListener("click", ev => { ev.stopPropagation(); if (storyMode === "select") leaveStory(); else { state = state === "dead" || state === "menu" ? state : "menu"; showStory("select"); } });
storyEl.addEventListener("click", ev => ev.stopPropagation());
