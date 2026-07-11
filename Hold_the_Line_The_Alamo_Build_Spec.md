# "Hold the Line: The Alamo" — Build Specification
### Unit 3 Game · 7th Grade Texas History · Mexican National & Texas Revolution

**Purpose of this document:** A complete, build-ready spec you can paste into Claude (Fable, Opus, Sonnet) to build the game, host it on GitHub, deploy on Render, and embed it in Wix. It covers the game design, the full historical content (all 12 graded actions), the interactive fort map, the shared Socket.IO engine integration, ready-to-use Higgsfield prompts, a model-by-model workflow, the Teacher Command Center, and sensitivity/accuracy notes.

> **Reading-level rule (everything the student sees):** Present 7th grade content at a **5th grade reading level**. Short sentences, common words, define hard terms the first time. This rule does **not** apply to this spec.

> **Data method — the shared Socket.IO engine (same as Chronos / Survive the Season / Claim the Land).** This game runs as the engine's **solo mode**: server-authoritative Node + Express + Socket.IO backend, a React + Vite thin client, deployed as one Render web service. Session state lives in **server memory (no database)**, so it's session-only by design. Reuse the *Shared Game Engine* — this spec only adds a new game adapter (`holdTheLine.js`) and the client screens.

> **Tone — read before building.** Historically, the Alamo's defenders did not survive. This game is **not** about "winning the battle." It is about **holding the line and buying time** — doing what the real defenders did (defiance, couriers for help, morale, readying defenses) so Sam Houston could prepare. Every path ends with the fall on March 6, 1836, handled with **dignity and without graphic violence**, and the debrief explains the real payoff at San Jacinto. Keep it respectful of real people who died.

---

## 1. Game at a Glance

| Field | Value |
|---|---|
| **Title** | Hold the Line: The Alamo |
| **Unit** | 3 — Mexican National & Texas Revolution (1821–1836) |
| **TEKS** | 7.3C (issues around the Alamo; Travis's letter "To the People of Texas and All Americans"; the heroism of the diverse defenders; the chain of events), 7.3B (roles of Travis, Bowie, Crockett, Seguín). Skills: 7.20B (cause and effect), 7.21 (maps) |
| **Role** | The student plays **William B. Travis**, the Alamo's commander |
| **Type** | Solo strategy game — **hybrid: a clickable Alamo fort map + day-by-day decisions** |
| **Playtime** | 7–10 minutes |
| **Goal** | **Hold the line and buy time** — not survive. Score is how well you did what the defenders really did |
| **Platform** | Shared Socket.IO engine (solo mode), React + Vite client, one Render web service, embedded in Wix |
| **Class tracking** | Teacher Command Center — class code, live in-progress vs completed, **class accuracy**, PDF download; session-only (server memory, no database) |
| **Art style** | Semi-realistic / cinematic (Section 8) |

**One-sentence pitch:** For thirteen days in 1836, you command the Alamo against Santa Anna's army — position your defenders on the fort map and make the hard calls Travis faced, holding the line to buy Sam Houston the time that would win Texas.

**The core teaching idea:** The Alamo was a military loss but a turning point. By making Travis's real choices — answering the "no quarter" flag with defiance, writing the famous letter, sending couriers like Juan Seguín for help, strengthening the weak north wall, and honoring the men's choice to stay — students learn **why the 13-day stand mattered**: it delayed Santa Anna, rallied Texas, and gave birth to "Remember the Alamo!" (TEKS 7.3C).

**Winning vs. history.** There is no "beat the battle" ending — that would be false. Instead the game scores a **Hold Score** (how strong your defense, morale, and supplies were) plus **accuracy** (how historically sound your choices were). A great run "holds the line" — buys the most time and gets the story out. Every run ends with the historical fall, told with respect, and a debrief connecting it to San Jacinto.

---

## 2. Historical Content Bank

All facts below come from your Texas Revolution materials (the battle summary and the outline) and are well-established history. Build the game from this bank; keep student text at a 5th grade level.

### 2.1 The 13-day siege (Feb 23 – March 6, 1836)
- **The army arrives (Feb 23).** General **Antonio López de Santa Anna** marches into San Antonio de Béxar with a large army and raises a **blood-red flag — "no quarter,"** meaning no mercy and no prisoners. The Texian defenders pull into the old **Alamo** mission and answer with a cannon shot of defiance.
- **Command and the letter (Feb 24).** Co-commander **James Bowie** falls seriously ill, leaving **William B. Travis** in sole command. Travis writes his famous letter, **"To the People of Texas and All Americans in the World,"** pleading for help and ending **"Victory or Death."**
- **The siege tightens (Feb 25–28).** Mexican lines creep closer; food and gunpowder run low. Travis sends couriers — including the Tejano captain **Juan Seguín** and **James Bonham** — through the enemy lines to beg for reinforcements.
- **The Immortal 32 (March 1).** Thirty-two volunteers from **Gonzales** slip through the lines into the fort — the only reinforcements to answer the call.
- **No help is coming (March 3–5).** Bonham rides back with hard news: no large army will arrive in time. By legend, Travis draws a **line in the sand** and asks who will stay. Nearly all do.
- **The fall (March 6, before dawn).** Thousands of Mexican soldiers storm the walls, breaking through at the **north wall**. After fierce fighting, the fort falls; almost all ~200 defenders die. A few noncombatants, including **Susanna Dickinson**, are spared and carry the story out.

### 2.2 Why it mattered (the whole point)
- The 13-day stand **delayed Santa Anna** and let **Sam Houston** gather and train an army.
- The defenders' sacrifice and Travis's letter **rallied Texas** and the wider public.
- Six weeks later at **San Jacinto (April 21)**, the cry **"Remember the Alamo!"** helped power an 18-minute victory that won Texas independence.

### 2.3 The diverse defenders (TEKS 7.3B/C — treat with dignity)
- **William B. Travis** — young commander; wrote the letter; symbol of defiance.
- **James Bowie** — famous frontiersman and co-commander; fell ill during the siege.
- **David "Davy" Crockett** — frontiersman and former congressman; led sharpshooters at the wooden **palisade**; kept spirits up.
- **Juan Seguín** — Tejano captain; carried Travis's plea through the lines and survived; later fought at San Jacinto. A reminder that **Tejanos** fought for Texas.
- **James Bonham** — courier who returned through enemy lines knowing the odds.
- **Susanna Dickinson** — survivor who carried the news, helping make the Alamo a rallying cry.
- Defenders included Anglos, **Tejanos** (like Seguín and Gregorio Esparza), and volunteers from many places — a genuinely diverse garrison.

### 2.4 Key vocabulary (define on first use)
- **Siege** — surrounding a fort to cut it off and force it to give up.
- **No quarter** — showing no mercy; taking no prisoners (the red flag).
- **Courier** — a rider who carries messages through danger.
- **Palisade** — a wall or fence made of wooden stakes.
- **Garrison** — the group of soldiers defending a fort.
- **Reinforcements** — extra soldiers sent to help.

---

## 3. Core Mechanics

### 3.1 The fort map (interactive layer)
A simple top-down map of the Alamo compound with clickable positions:
1. **North Wall** — the weakest stretch; where the final breach came.
2. **South Wall & Main Gate (Low Barracks)** — the strong front.
3. **West Wall** — long, exposed to bombardment.
4. **The Palisade** — a wooden fence on the southeast; Crockett's post.
5. **The Chapel** — the stone church on the southeast; last-stand strongpoint; where noncombatants sheltered.
6. **The Long Barracks** — interior building; fallback strongpoint.
7. **The 18-pounder cannon** — the big gun at the southwest corner.

On map-action steps, the player **clicks a position** to place defenders, cannon, or work crews. Placing well (e.g., strengthening the vulnerable north wall) raises **Defenses**; placing poorly wastes effort. The map shows small markers for where defenders and guns are set.

### 3.2 Meters (each 0–100, start at 50)
- **Morale** ❤️ — the garrison's spirit and will to hold.
- **Supplies** 📦 — food, water, and gunpowder.
- **Defenses** 🛡️ — how ready the walls and positions are.

There is no "health bar" that ends the game early; the siege always runs its 13 days. The meters feed the final **Hold Score = Morale + Supplies + Defenses** (higher = you held the line longer and stronger).

### 3.3 Structure — 6 phases across the 13 days
Each **phase** is a moment in the siege. In a phase:
1. **Event card** — a short cinematic image + 2–4 sentences (Fable-written) setting the scene.
2. **A map action or a decision** (each phase has one of each): click the fort map to position, or choose from 3 options.
3. **Feedback** — meter changes + one or two plain sentences explaining why (the learning moment).

Six phases × (1 map action + 1 decision) = **12 graded actions**, used for accuracy.

### 3.4 Accuracy (same math as the other games)
Per graded action: **right = 1, partial = 0.5, wrong = 0.** Accuracy = (points ÷ 12) × 100, rounded. The **server** computes it (via the engine's `scoring.js`); the client never holds the answer key.

### 3.5 Endings (Hold Score + accuracy — always end with the historical fall)
- **"You Held the Line"** (high) — "You bought Sam Houston thirteen days, sent word across Texas, and made the Alamo a name that would win the war."
- **"The Alamo Stood"** (mid) — "The fort fell, as it did in history — but the days you held still slowed Santa Anna and stirred Texas to fight."
- **"The Line Broke Early"** (low) — a gentle debrief showing what the real defenders did to hold longer; still honors them.
- Every ending shows a **debrief**: the fall on March 6, the 13-day delay, Houston's preparation, and **"Remember the Alamo!"** at San Jacinto — plus the student's **accuracy**. Respectful, non-graphic.

---

## 4. The Alamo Map (interactive)

- Show a clean top-down illustration of the Alamo compound with the **7 positions** (Section 3.1) as clickable zones.
- On a map-action step, eligible zones **highlight**; clicking one opens a short "place here" confirm and applies the effect.
- Show small markers for placed defenders 🔵, the cannon 🔴, and work crews 🟠, plus a simple "readiness" tint per wall.
- Keep it readable on a phone: large tap zones, clear labels, colorblind-safe cues (icons + patterns, not color alone).
- The north wall should visibly read as the **weak point** (e.g., a cracked/low section) so smart players notice — that's the teachable pattern.

---

## 5. Reference Content — the Six Phases (complete, all 12 actions)

Player-facing text below is already at a 5th grade level — match this voice. Verdicts/effects are the **server-side answer key** (they live in the adapter, never on the client). ✅ right (+1) · ⚠️ partial (+0.5) · ❌ wrong (0).

### Phase 1 — Day 1 (Feb 23): "The Army Arrives"
*Event:* Santa Anna's army marches into town and raises a blood-red flag. It means "no quarter" — no mercy, no prisoners. You must act fast.

**Map action — Where do you pull your men?**
- ✅ **Pull everyone inside the Alamo walls and man the big 18-pounder cannon.** Defenses +15, Morale +5. *"Yes. The old mission was your fortress. Getting inside the walls was the only way to hold."*
- ⚠️ **Keep some men out in the town to skirmish.** Defenses −5, Morale +5. *"Fighting in the streets spread you thin. The walls were your real strength."*
- ❌ **Abandon the Alamo and slip away east.** Defenses −15. *"Leaving without a stand hands Santa Anna the town and buys Houston no time. The defenders chose to stand."*

**Decision — Santa Anna demands surrender. Your answer?**
- ✅ **Fire the 18-pounder in defiance and refuse.** Morale +15. *"Travis answered the red flag with a cannon shot. Defiance kept the men's spirits up."*
- ⚠️ **Ask for terms to buy a day.** Morale −5, Supplies +5. *"Talking bought a little time but risked the men's resolve. Travis chose open defiance."*
- ❌ **Surrender the fort.** Morale −15, Defenses −10. *"Surrender ends the delay Houston needed. This isn't the defenders' stand."*

### Phase 2 — Day 2 (Feb 24): "Victory or Death"
*Event:* Your co-commander, James Bowie, falls gravely ill. Command is now yours alone. Enemy cannon begins to pound the walls.

**Decision — Bowie is too sick to lead. What do you do?**
- ✅ **Take sole command and keep Bowie's men fighting beside yours.** Morale +10, Defenses +5. *"Travis took command when Bowie fell ill, and the garrison stayed united."*
- ⚠️ **Wait for Bowie to recover before deciding.** Defenses −5. *"Waiting wastes time while the enemy digs in. A commander must lead now."*
- ❌ **Argue over who is really in charge.** Morale −10. *"Split leadership weakens the defense. Unity mattered most."*

**Decision — You can send a message to the world. What do you write?**
- ✅ **Write "To the People of Texas and All Americans," ending "Victory or Death."** Morale +15. *"Travis's famous letter rallied Texans and made the Alamo a symbol."*
- ⚠️ **Send a short, plain request for ammunition.** Supplies +5, Morale −5. *"Practical — but Travis's stirring words did far more to rally help."*
- ❌ **Send nothing and stay quiet.** Morale −10. *"Silence wins no help. The letter was one of Travis's greatest acts."*

### Phase 3 — Days 3–6 (Feb 25–28): "The Siege Tightens"
*Event:* Enemy soldiers dig their lines closer each night. Food and gunpowder run low. You need help to arrive.

**Map action — Which wall do you strengthen most?**
- ✅ **Shore up the weak north wall with timber and earth.** Defenses +15. *"The north wall was the Alamo's weak point — and exactly where the final attack would come. Good instinct."*
- ⚠️ **Reinforce the strong south gate again.** Defenses +5. *"The gate was already solid. The north wall needed the work more."*
- ❌ **Spread the work evenly and finish nothing.** Defenses −10. *"Half-finished everywhere means strong nowhere. Priorities save forts."*

**Decision — How do you call for reinforcements?**
- ✅ **Send trusted couriers like Juan Seguín and James Bonham through the lines.** Morale +10, Defenses +5. *"Travis sent riders — including the Tejano captain Juan Seguín — for help. Seguín got through and survived."*
- ⚠️ **Send one rider and hope.** Morale +5. *"One messenger is a thin thread. Travis sent several to raise the alarm."*
- ❌ **Keep everyone inside; send no one.** Morale −10. *"No couriers means no help and no word to the world. Getting the message out mattered."*

### Phase 4 — Day 8 (March 1): "The Immortal 32"
*Event:* In the dark, 32 volunteers from Gonzales slip past the enemy and into the fort. They are few — but they came.

**Decision — How do you meet the Gonzales men?**
- ✅ **Welcome and thank them, and post them on the walls to lift spirits.** Morale +15, Defenses +5. *"The 32 from Gonzales were the only reinforcements to answer the call. Their courage lifted the whole garrison."*
- ⚠️ **Put them straight to work with no rest.** Defenses +5, Morale −5. *"They helped, but a word of thanks would have meant more to tired men."*
- ❌ **Complain that so few came.** Morale −15. *"Scorning brave volunteers crushes morale. They risked everything to stand with you."*

**Map action — Where do you place your best shots?**
- ✅ **Put Crockett and his marksmen at the wooden palisade, the weakest stretch.** Defenses +15. *"Crockett's sharpshooters held the low wooden palisade — plugging a gap with skill instead of stone."*
- ⚠️ **Keep them in reserve inside the chapel.** Defenses +5. *"A reserve is useful, but the thin palisade needed defenders now."*
- ❌ **Send them outside the walls to scout.** Defenses −10, Morale −5. *"Outside the walls they're exposed and wasted. Every rifle was needed on the line."*

### Phase 5 — Days 10–12 (March 3–5): "No Help Is Coming"
*Event:* Bonham rides back through the enemy lines with hard news: no large army is coming in time. You gather the men.

**Decision — What do you tell the garrison?**
- ✅ **Tell them the truth, then let each man choose to stay or go.** Morale +15. *"The famous story says Travis drew a line and asked who would stay. Honesty and choice bound the defenders together."*
- ⚠️ **Hide the bad news to keep them calm.** Morale −5. *"A short calm — but men fight best when they trust their leader with the truth."*
- ❌ **Order them to stay and threaten deserters.** Morale −15. *"Fear is weak glue. The defenders stayed by choice, not threat."*

**Decision — The bombardment is heavy. How do you use these last days?**
- ✅ **Rest the men in shifts, save ammunition, and ready every position.** Defenses +10, Supplies +10. *"Travis kept the garrison rested and ready for the assault everyone knew was coming."*
- ⚠️ **Fire back constantly to answer the enemy guns.** Morale +5, Supplies −10. *"Answering every shot felt bold but burned scarce powder you'd soon need."*
- ❌ **Keep everyone on watch with no rest.** Defenses −10. *"Exhausted defenders can't hold a wall. Rest was a weapon too."*

### Phase 6 — Day 13 (March 6, before dawn): "Hold the Line"
*Event:* In the cold dark before dawn, thousands of soldiers rush the walls. The hardest hour has come.

**Map action — Where do you rush your defenders as the attack lands?**
- ✅ **Mass your men at the north wall, where the enemy breaks through first.** Defenses +15. *"The final assault came over the battered north wall — exactly where the fight was fiercest."*
- ⚠️ **Hold every wall evenly.** Defenses +5. *"Spread thin, no single point holds. The north wall was the true crisis."*
- ❌ **Pull everyone back to the chapel at once.** Defenses −10. *"Giving up the walls too soon lets the enemy pour in. The defenders fought for every foot."*

**Decision — As the walls are overrun, what is your last order?**
- ✅ **Make sure Susanna Dickinson and the noncombatants are sheltered so the story survives — and fight on.** Morale +15. *"Survivors like Susanna Dickinson carried the story out. Their witness turned the Alamo into a rallying cry."*
- ⚠️ **Order a last-minute breakout attempt.** Defenses −5, Morale +5. *"A few tried to break out; most stood and fought. Either way, the end had come."*
- ❌ **Destroy everything so no word escapes.** Morale −15. *"If no one lives to tell it, there is no 'Remember the Alamo.' The story was the victory."*

*(Reaching the end computes the Hold Score and shows the matching ending + the debrief connecting the 13 days to San Jacinto.)*

---

## 6. Screen Flow / State Machine

```
[Title] → [How to Play]
        → [Join: enter class code + choose name]
        → [Waiting for teacher approval]   (if approval on)
        → [Briefing: "You are William B. Travis. Hold the line."]
        → [Phase loop ×6: Event → Map action or Decision → Feedback]
        → [The Fall + Ending + Debrief + your Accuracy]
        → [Play Again]
```

**States:** `title`, `howToPlay`, `join`, `waitingApproval`, `briefing`, `phaseEvent`, `mapAction`, `decision`, `feedback`, `ending`. The engine drives progression server-side; the client renders `turn:begin` / `turn:resolution` / `match:end`.

---

## 7. Engine Integration (shared Socket.IO engine, solo mode)

Reuse the **Shared Game Engine** unchanged; add one game adapter.

- **New adapter:** `server/src/games/holdTheLine.js` — solo-only, one variant (`travis`), `totalActions: 12`, meters `{ morale, supplies, defenses }` starting at 50, and a `STEPS.travis` array of the 12 actions from Section 5. Map-action steps also write the chosen position into `gameState.map` (Alamo positions from Section 3.1).
- **Register it:** add to `server/src/games/index.js`.
- **Session:** `teacher:create_session { gameId: 'hold-the-line', mode: 'solo' }`. Everything else — join codes, name approval, scoring, live roster, PDF, end-session, idle sweep — is already in the engine.
- **Client:** a `Datapad`-style view with the **fort map** component plus the decision/feedback cards. It sends only `student:submit_move { choiceIndex }`; the server scores and pushes state.

Adapter sketch (fill all 12 steps from Section 5):
```js
// games/holdTheLine.js
import { createStepGame } from './_stepGame.js';
const START = { morale: 50, supplies: 50, defenses: 50 };
const STEPS = { travis: [ /* 12 steps: {prompt, image, kind:'map'|'decision', choices:[{label,verdict,effects,feedback}]} */ ] };
export default createStepGame({
  id: 'hold-the-line', title: 'Hold the Line: The Alamo',
  modes: ['solo'], sides: null, totalActions: 12,
  startMeters: () => ({ ...START }),
  stepsFor: () => STEPS.travis,
  mapInit: () => ({ positions: { northWall:{}, southGate:{}, westWall:{}, palisade:{}, chapel:{}, longBarracks:{}, cannon:{} } }),
});
```

---

## 8. Visual & Audio Assets (Higgsfield MCP)

**Art direction (top of every prompt):**
> Semi-realistic cinematic historical illustration. Warm, dramatic but respectful. Historically accurate 1836 clothing, weapons, and the Alamo mission architecture. Dignified — this honors real people. No graphic violence, no gore. No text, no logos. Wide 16:9 framing.

**Accuracy & sensitivity rules:**
- The Alamo is a **stone mission compound** with a low wall, a wooden **palisade**, the famous **chapel** with its curved top (the well-known facade), and the **Long Barracks**. Show it as a 1836 fort, not a modern monument.
- Depict defenders as a **diverse garrison** — Anglos, **Tejanos**, frontiersmen — with dignity. No caricatures.
- **No gore or dying figures.** Convey drama through weather, smoke, torchlight, tension, and scale — not injury. This is a classroom game about courage and sacrifice.

**Priority asset list:**

| # | Asset | Type | Prompt (append art direction + rules) |
|---|---|---|---|
| 1 | Title / hero | Image | "The Alamo mission at dusk before the siege, its stone chapel and long low walls against a wide Texas sky, campfires of a distant army on the horizon — tense and cinematic." |
| 2 | Fort map (base) | Image | "A clean top-down illustrated map of the 1836 Alamo compound: north wall, south gate and low barracks, west wall, a wooden palisade on the southeast, the stone chapel, the long barracks, and a large cannon at the southwest corner. Warm parchment tones, clear and readable." |
| 3 | Briefing — Travis | Image | "A young 1836 Texian commander in a long coat standing on the Alamo wall at dawn, looking out with resolve, a rolled letter in hand. Dignified, no violence." |
| 4 | Phase 1 — the red flag | Image | "A large army arriving outside a Texas town in 1836, a blood-red flag raised over their camp, seen from the Alamo wall at a distance. Tension, no gore." |
| 5 | Phase 2 — the letter | Image | "By candlelight, a commander writes a letter at a rough wooden table inside a stone fort, 1836, a quill in hand, a look of determination." |
| 6 | Phase 3 — the siege | Image | "Defenders repairing a fort wall with timber and earth under a gray sky, distant enemy cannon smoke on the horizon, 1836, tense but not graphic." |
| 7 | Phase 4 — reinforcements | Image | "A small band of volunteers slipping through the dark into a torchlit fort gate at night, welcomed by defenders, 1836. Hopeful, cinematic." |
| 8 | Phase 5 — the line | Image | "A commander speaking to gathered defenders inside the fort courtyard at dusk, a line drawn in the dirt at his feet, men listening. Solemn, dignified." |
| 9 | Phase 6 — before dawn | Image | "The Alamo walls in cold pre-dawn darkness, torches and smoke, the silhouettes of many soldiers approaching in the distance. Dramatic through light and scale, absolutely no gore." |
| 10 | Position markers (defender, cannon, work crew) | Flat icons | Best as clean flat vector: a defender figure, a cannon, a work-crew tool. Small and crisp for the map. |
| 11 | *(Optional)* Title loop | Video (`generate_video`) | "Slow torch smoke drifting over the Alamo walls at dusk, a flag stirring, calm cinematic loop." |
| 12 | *(Optional)* Ambient audio | Audio (`generate_audio`) | "Low wind, a distant drum, faint campfire crackle — tense ambient loop." Default muted, with a toggle. |

Save images to `assets/images/` (or `client/public`) with the filenames used in the adapter; compress to < ~400 KB.

---

## 9. When to Use Each Claude Model (and Higgsfield)

| Model | Best for here | Use it to… |
|---|---|---|
| **Claude Fable** *(long-form creative writing)* | Immersive, reading-level-controlled narrative | Write the **event cards, choice labels, feedback, and endings/debrief** (Section 5), keeping the respectful "buy time, not win" tone and the 5th grade level. Output into the `holdTheLine.js` STEPS. |
| **Claude Opus** *(deepest reasoning)* | Architecture + the tricky parts | Wire the game into the shared engine (fill `holdTheLine.js`), build the **clickable fort map** and its state, the map-action → `gameState.map` writes, and the Command Center integration. The engine's `GameManager` + `scoring.js` already handle sessions and accuracy. |
| **Claude Sonnet** *(fast, capable, cost-effective)* | High-volume iteration | Build/polish the **map UI and screens**, wire in Higgsfield art, tune styling/responsiveness/accessibility, and run test passes. |
| **Claude Haiku** *(quick, light)* | Optional small tasks | Rename files, reformat data, quick copy tweaks. |
| **Higgsfield MCP** | Media | `generate_image` for the map, briefing, and phase scenes; `generate_video`/`generate_audio` for the optional title loop and ambience. |

**Recommended build order:**
1. **Fable** — write the 12 actions + endings into `holdTheLine.js` STEPS.
2. **Opus** — add the adapter to the engine; build the client game view + fort map; map actions write to `gameState.map`.
3. **Higgsfield** — generate the map + phase art; save to `assets/`.
4. **Sonnet** — wire art in, polish the map UI and responsiveness, test.
5. **Opus/Sonnet** — confirm the Command Center works with this game (it's the same engine); deploy on Render; embed in Wix.

---

## 10. Teacher Command Center

Identical to the shared-engine Command Center (Chronos / Survive the Season): join code, PIN gate, name approval + profanity filter, live roster, PDF, **delete-on-end with the "This will delete session data. Do you want to proceed?" box**, and the memory-only lifecycle (idle sweep + Render spin-down; no database).

**This game's specifics:**
- **Everyone plays Travis**, so there's a **single group** — the roster shows each student's **status** (Not started / In progress / Completed) and **accuracy %**, and the class summary shows one overall **class average accuracy** (e.g., *"Class — 24 students — 78% average"*). (The engine groups accuracy by variant; with one variant, that's the whole class.)
- **PDF (jsPDF + html2canvas):** Header (join code, date, # students); Table 1 — Students: Name · Status · Accuracy %; Table 2 — Class summary: # completed · Average accuracy; Footer: "7th Grade Texas History · Hold the Line: The Alamo · TEKS 7.3B, 7.3C." Filename: `hold-the-line_<code>_<date>.pdf`.
- **Data lifecycle:** session-only by design — End Session drops it from server memory; an abandoned session is swept automatically. The PDF is the only lasting record.

---

## 11. GitHub Repo & Render Deploy

Same shape as the other games (shared engine `server/` + React `client/`):
```
hold-the-line/
├── server/          Shared Game Engine + games/holdTheLine.js
├── client/          React 18 + Vite (Datapad game view + FortMap component + CommandCenter)
├── assets/images/   map, briefing, phase art, icons
├── render.yaml
├── package.json     root: postinstall installs server/ + client/; build compiles client
└── README.md
```
1. Push to GitHub (same account as your other games).
2. On **Render**, create a **Web Service** from the repo (`buildCommand: npm install && npm run build`, `startCommand: node server/src/index.js`).
3. Live URL, e.g. `https://hold-the-line.onrender.com` — students on the base URL, teacher on the Command Center route (match how Chronos routes them).
4. Free plan spins down when idle (fine for class; also the "no data left behind" backstop).

## 12. Embed in Wix
- **Student page:** **Add → Embed Code → Embed a Site**, paste the Render **student URL**, size to fit (~1000 × 760), publish, test on phone.
- **Teacher page:** new Wix page → embed the Render **Command Center URL** → **Page Settings → Permissions → Password/Members-only**. The in-app PIN is a second layer.
- Use the `https://` Render URL; no Velo needed; push to GitHub to redeploy (hard-refresh to clear cache).

## 13. Build Checklist

**Game**
- [ ] Fable content for all 12 actions (6 phases × map action + decision) + endings/debrief
- [ ] `holdTheLine.js` adapter filled and registered; meters start at 50; server scores every action
- [ ] Fort map with 7 positions; map actions write to `gameState.map`; north wall reads as the weak point
- [ ] Hold Score = Morale + Supplies + Defenses; three ending tiers; debrief ties to San Jacinto
- [ ] Accuracy = 12 graded actions (right=1/partial=.5/wrong=0), server-side
- [ ] Respectful, non-graphic tone throughout; diverse defenders represented
- [ ] Reading level checked; images compressed with alt text; responsive to 360 px; no browser storage for game state

**Teacher Command Center (shared engine)**
- [ ] `teacher:create_session { gameId:'hold-the-line', mode:'solo' }` returns a join code; PIN gate; name approval + filter
- [ ] Student join: enter code + choose name; approval flow works on and off
- [ ] Live roster shows Not started / In progress / Completed in real time
- [ ] Class average accuracy displays with student count
- [ ] PDF download (jsPDF + html2canvas): student table + class summary
- [ ] End Session → confirmation box → session dropped from server memory; "download PDF first" reminder
- [ ] Idle-session sweep + free-plan spin-down confirmed (no data persists)

**Ship**
- [ ] Render URL live; student route embedded in Wix; Command Center route on a password-protected Wix page
- [ ] Tested solo end-to-end and on phone; tested with two windows (teacher + student)

## 14. Test Plan (quick)
1. **High path:** always pick the right choice → "You Held the Line" ending with high accuracy.
2. **Low path:** always pick wrong → "The Line Broke Early" with a respectful debrief.
3. **Mixed path:** lands on "The Alamo Stood."
4. **Map actions:** clicking a position updates `gameState.map` and the shown markers; north-wall choices score as right where noted.
5. **Accuracy math:** a known pattern matches the expected % (e.g., all-right = 100%).
6. **Device check:** plays cleanly on phone width inside the Wix iframe; map is tappable; images load.
7. **Command center:** create session, join as a student, approve name, confirm "In progress" → "Completed"; class average updates; PDF correct.
8. **Security:** a student can't reach the Command Center route or receive another student's state.
9. **End & clear:** confirmation box appears; Proceed drops the session from server memory; an idle session evaporates on its own.

## 15. Sensitivity, Accuracy & Teacher Notes
- **Respect first.** These were real people who died. The game honors courage and sacrifice; it does **not** show gore, celebrate killing, or treat the defenders' deaths as a "game over" to laugh at. Drama comes from tension and scale, not injury.
- **It's about buying time, not winning.** Make sure every ending and the debrief say this plainly: the Alamo was a military loss whose *value* was the delay, the rallying cry, and the road to San Jacinto (TEKS 7.3C). A student who "loses" the battle but plays accurately has understood the lesson.
- **A diverse garrison.** Include **Tejanos** (Juan Seguín, Gregorio Esparza) alongside Anglos and frontiersmen. The TEKS names "the heroism of the diverse defenders" — show it.
- **Legends vs. facts.** The "line in the sand" is a famous story that may be legend; present it as the well-known *story* (as the content does) rather than certain fact. Travis's letter and "Victory or Death" are real.
- **Dates simplified** for a 5th grade reading level; these notes hold the fuller context if students ask.

---

*Companion to your Chronos Protocol, Texas Geography, Native American Interactive Map, Survive the Season, and Claim the Land builds. Same shared Socket.IO engine (solo mode); same Teacher Command Center; same GitHub → Render → Wix workflow.*
