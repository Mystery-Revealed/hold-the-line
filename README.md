# Hold the Line: The Alamo

**Unit 3 · 7th Grade Texas History · Mexican National & Texas Revolution**
TEKS **7.3B, 7.3C** (Travis's letter, the diverse defenders, the chain of events).

A solo strategy game: for thirteen days in 1836 you command the Alamo as
**William B. Travis**. You cannot beat Santa Anna's whole army — no one could.
Your job is to **hold the line and buy time**, making the same hard calls the
real defenders faced. Every run ends with the historical fall on March 6, told
with dignity and without gore, and a debrief connecting the 13-day stand to
victory at **San Jacinto**.

It runs on the same shared **Socket.IO game engine** as Chronos Protocol,
Survive the Season, and Claim the Land: a server-authoritative Node + Express +
Socket.IO backend and a thin React + Vite client, deployed as one Render web
service. **All session state lives in server memory — no database.** Ending a
session (or the idle sweep, or a Render spin-down) erases it. The teacher's PDF
is the only lasting record.

## How it plays

- **6 phases** of the siege (Feb 23 – March 6, 1836). Each phase: an event card,
  then **two graded actions** — a **fort-map action** (place men, cannon, or work
  crews on a top-down Alamo; the North Wall reads as the weak point) and a
  **decision** (3 choices). **12 graded actions** total.
- **Three meters** (start 50): **Morale ❤️**, **Supplies 📦**, **Defenses 🛡️**.
  **Hold Score** = the three added up (max 300).
- **Endings** by Hold Score: *You Held the Line* (≥210), *The Alamo Stood* (≥150),
  *The Line Broke Early* (<150). Every ending shows the fall + debrief.
- **Accuracy** (the grade the teacher sees) = right 1 / partial 0.5 / wrong 0,
  over 12 actions, computed **server-side** — the client never holds the answer key.

## Project layout

```
server/          Shared Socket.IO engine + games/holdTheLine.js (+ _stepGame.js factory)
client/          React 18 + Vite (Datapad game view + FortMap + CommandCenter)
assets/images/   place Higgsfield art here (also copy into client/public/assets/images)
render.yaml      Render web-service template
package.json     root: postinstall installs server/ + client/; build compiles client
```

The engine is single-role solo for this game (`sides: ['travis']`): everyone
commands Travis, so the class is one group. `server/src/games/_stepGame.js` is a
reusable factory that turns the phase/step content in `holdTheLine.js` into the
adapter the `GameManager` drives.

## Run locally

```bash
npm install          # cascades installs into server/ and client/
npm test             # server tests (scoring, content/balance, GameManager)
npm run build        # build the client into client/dist
npm start            # serve the whole app at http://localhost:4000
```

For hot-reload dev, run `npm run dev:server` and `npm run dev:client` in two
terminals (Vite proxies `/socket.io` to the server on :4000).

- **Students:** open the base URL. Enter the class code + a first name.
- **Teacher Command Center:** open the base URL with `#teacher`
  (e.g. `http://localhost:4000/#teacher`). Create a session (4-digit PIN),
  approve names, watch live status + class accuracy, download the PDF, End Session.

## Deploy (Render) & embed (Wix)

1. Push to GitHub. On **Render**, create a **Web Service** from the repo
   (`buildCommand: npm install && npm run build`, `startCommand: node server/src/index.js`,
   free plan). Live at e.g. `https://hold-the-line.onrender.com`.
2. In **Wix**: embed the Render **student URL** on a public page; embed the
   **`#teacher`** URL on a **password-protected** page (the in-app PIN is a second
   layer). Use the `https://` URL; push to GitHub to redeploy.

## Art

Images resolve through `client/public/assets/images/`. Missing files degrade to a
styled placeholder, so the game is playable art-or-no-art. Priority assets
(semi-realistic, cinematic, respectful, no gore): `title_hero.jpg`, the six phase
scenes (`event_redflag/letter/siege/reinforcements/line/predawn.jpg`), and
`ending.jpg`. The fort map itself is inline SVG — no image needed.
