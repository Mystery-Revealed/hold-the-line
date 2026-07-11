// _stepGame.js — a factory that turns a linear list of "steps" into a game
// adapter GameManager can drive. It powers single-role SOLO games (everyone
// plays the same commander) like "Hold the Line: The Alamo".
//
// A game is a list of PHASES. Each phase has an event card (cinematic image +
// a few sentences) and exactly two graded STEPS — a map action and a decision,
// in either order. A step offers 3 choices (one right, one partial, one wrong).
//
// THE ANSWER KEY LIVES HERE, ON THE SERVER. currentPrompt() ships labels only;
// the client submits { kind, choiceIndex } and the server grades it.
//
// The adapter interface GameManager expects (all implemented below):
//   id, title, modes, sides, totalActions, chapterCount, meta,
//   initMatch, chapterEvent, eventSnapshot, currentPrompt, resolve, aiMove,
//   isComplete, report   (owners is optional and omitted — this map has no rival)

import { accuracyPercent } from '../scoring.js';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const pointsFor = (verdict) => (verdict === 'right' ? 1 : verdict === 'partial' ? 0.5 : 0);

export function createStepGame({
  id,
  title,
  side = 'player',        // the single side key (e.g. 'travis'); groups class accuracy
  startMeters,            // () => ({ meterKey: number })
  phases,                 // [{ title, date, image, event, eventEffects?, steps: [step, step] }]
  meta,                   // { meters, positions, markers } — display info shipped to clients
  scoreMeters,            // (meters) => number   (e.g. Hold Score = sum of meters)
  endingFor,              // (score, accuracy, meters) => { key, title, text }
  debrief,                // string shown on every ending
}) {
  // Flatten phases → a single list of 12 steps (2 per phase). cursor indexes it.
  const STEPS = phases.flatMap((p) => p.steps);
  const TOTAL = STEPS.length;
  const CHAPTER_COUNT = phases.length;
  const POSITION_KEYS = Object.keys(meta.positions || {});

  const chapterOf = (cursor) => Math.floor(cursor / 2);

  const chapterMeta = (idx) => {
    const p = phases[idx];
    return { index: idx, count: CHAPTER_COUNT, title: p.title, date: p.date, image: p.image };
  };

  function makeSideState(isAI = false) {
    return {
      key: side,
      isAI,
      cursor: 0,                 // 0..TOTAL-1
      meters: { ...startMeters() },
      actions: [],               // [{ stepIndex, kind, verdict, points }]
      eventApplied: -1,          // last phase whose eventEffects were applied
      // Per-match shuffle of each step's choices, so "the first answer" is never a tell.
      shuffles: STEPS.map((step) => shuffle([...step.choices.keys()])),
    };
  }

  function applyEffects(ss, effects = {}) {
    for (const [k, v] of Object.entries(effects)) {
      ss.meters[k] = clamp((ss.meters[k] ?? 0) + v, 0, 100);
    }
  }

  return {
    id,
    title,
    modes: ['solo'],
    sides: [side],
    totalActions: TOTAL,
    chapterCount: CHAPTER_COUNT,
    meta,

    // Only ever solo here; soloSide is the single side. One human side, no AI rival.
    initMatch() {
      return {
        mode: 'solo',
        map: { positions: Object.fromEntries(POSITION_KEYS.map((k) => [k, { markers: [] }])) },
        sides: { [side]: makeSideState() },
        whoseTurn: side,
        chapterIndex: 0,
        status: 'active',
        winner: null,
      };
    },

    // The phase event card, applying its one-time meter toll. Null if already shown.
    chapterEvent(state) {
      const ss = state.sides[side];
      const idx = chapterOf(ss.cursor);
      if (idx >= CHAPTER_COUNT || ss.eventApplied >= idx) return null;
      const p = phases[idx];
      ss.eventApplied = idx;
      if (p.eventEffects) applyEffects(ss, p.eventEffects);
      return {
        chapter: chapterMeta(idx),
        text: p.event,
        eventEffects: p.eventEffects || null,
        meters: { ...ss.meters },
      };
    },

    // Non-mutating version, for re-pushing state after a reconnect.
    eventSnapshot(state) {
      const ss = state.sides[side];
      const idx = Math.min(chapterOf(ss.cursor), CHAPTER_COUNT - 1);
      const p = phases[idx];
      return {
        chapter: chapterMeta(idx),
        text: p.event,
        eventEffects: p.eventEffects || null,
        meters: { ...ss.meters },
      };
    },

    // What the player sees now. NO verdicts/effects/feedback leak out. For map
    // steps, each choice carries its fort position + marker so the client can
    // highlight zones — that's information the player needs, not the answer key.
    currentPrompt(state) {
      const ss = state.sides[side];
      if (ss.cursor >= TOTAL) return null;
      const idx = chapterOf(ss.cursor);
      const step = STEPS[ss.cursor];
      const order = ss.shuffles[ss.cursor];
      const base = {
        stepIndex: ss.cursor,
        kind: step.kind,
        chapter: chapterMeta(idx),
        meters: { ...ss.meters },
        prompt: step.prompt,
        hint: step.hint || null,
      };
      if (step.kind === 'map') {
        return {
          ...base,
          choices: order.map((i) => ({
            label: step.choices[i].label,
            position: step.choices[i].position || null,
            marker: step.choices[i].marker || null,
          })),
        };
      }
      return { ...base, choices: order.map((i) => step.choices[i].label) };
    },

    // Apply a submitted move. move = { kind, choiceIndex } (choiceIndex is the
    // presented, shuffled index — mapped back to the real choice here).
    resolve(state, _side, move) {
      const ss = state.sides[side];
      if (ss.cursor >= TOTAL) return { error: 'side_done' };
      const step = STEPS[ss.cursor];
      if (!move || move.kind !== step.kind) return { error: 'wrong_step_kind' };
      const order = ss.shuffles[ss.cursor];
      const realIndex = order[move.choiceIndex];
      const choice = step.choices[realIndex];
      if (!choice) return { error: 'bad_choice' };

      const effects = choice.effects || {};
      let placed = null;
      if (step.kind === 'map' && choice.position) {
        const marker = choice.marker || 'defenders';
        state.map.positions[choice.position]?.markers.push({ side, marker });
        placed = { position: choice.position, marker };
      }
      applyEffects(ss, effects);
      ss.actions.push({ stepIndex: ss.cursor, kind: step.kind, verdict: choice.verdict, points: pointsFor(choice.verdict) });
      ss.cursor += 1;

      return {
        side,
        kind: step.kind,
        verdict: choice.verdict,
        feedback: choice.feedback,
        effects,
        placed,
        stepIndex: ss.cursor - 1,
        meters: { ...ss.meters },
        chapterDone: ss.cursor % 2 === 0,
        sideDone: ss.cursor >= TOTAL,
      };
    },

    // The historically right move right now (used by content/balance tests; not
    // an in-game AI opponent, since this game is single-role solo).
    aiMove(state) {
      const ss = state.sides[side];
      const step = STEPS[ss.cursor];
      const rightIdx = step.choices.findIndex((c) => c.verdict === 'right');
      const shuffledIdx = ss.shuffles[ss.cursor].indexOf(rightIdx);
      return { kind: step.kind, choiceIndex: shuffledIdx };
    },

    isComplete(state) {
      return Object.values(state.sides).every((ss) => ss.cursor >= TOTAL);
    },

    // Final report. No winner/rival — the value is the Hold Score + accuracy.
    report(state) {
      const ss = state.sides[side];
      const score = scoreMeters(ss.meters);
      const accuracy = accuracyPercent(ss.actions, TOTAL);
      return {
        winner: null,
        owners: null,
        perSide: {
          [side]: {
            isAI: !!ss.isAI,
            holdScore: Math.round(score),
            meters: { ...ss.meters },
            accuracy,
            ending: endingFor(Math.round(score), accuracy, ss.meters),
            debrief,
          },
        },
      };
    },
  };
}
