// content.test.js — sanity + historical-balance checks on the Alamo content bank.
import test from 'node:test';
import assert from 'node:assert/strict';
import game, { PHASES, POSITIONS, MARKERS, holdScore, endingFor } from '../src/games/holdTheLine.js';

test('six phases, each with an event and two graded steps (3 choices: right/partial/wrong)', () => {
  assert.equal(PHASES.length, 6, 'phase count');
  for (const [i, ph] of PHASES.entries()) {
    assert.ok(ph.title && ph.date && ph.event && ph.image, `phase ${i} metadata`);
    assert.equal(ph.steps.length, 2, `phase ${i} has 2 steps`);
    for (const [j, step] of ph.steps.entries()) {
      assert.ok(step.kind === 'map' || step.kind === 'decision', `phase ${i} step ${j} kind`);
      assert.ok(step.prompt?.length > 5, `phase ${i} step ${j} prompt`);
      const verdicts = step.choices.map((c) => c.verdict).sort();
      assert.deepEqual(verdicts, ['partial', 'right', 'wrong'], `phase ${i} step ${j} verdicts`);
      for (const c of step.choices) {
        assert.ok(c.label?.length > 5 && c.feedback?.length > 10, `phase ${i} step ${j} choice text`);
        if (c.position) assert.ok(POSITIONS[c.position], `phase ${i} step ${j} position ${c.position}`);
        if (c.marker) assert.ok(MARKERS[c.marker], `phase ${i} step ${j} marker ${c.marker}`);
      }
      // Every 'map' step must have at least one placeable (right) position so the
      // fort map is genuinely interactive.
      if (step.kind === 'map') {
        assert.ok(step.choices.some((c) => c.verdict === 'right' && c.position), `phase ${i} step ${j} right map choice has a position`);
      }
    }
  }
  // 12 graded actions total; several are map actions so the fort map matters.
  const steps = PHASES.flatMap((p) => p.steps);
  assert.equal(steps.length, 12, '12 graded actions');
  const mapSteps = steps.filter((s) => s.kind === 'map').length;
  assert.ok(mapSteps >= 4, `${mapSteps} map actions — the fort map is used across phases`);
});

test('the north wall is flagged as the weak point (the teachable pattern)', () => {
  assert.equal(POSITIONS.northWall.weak, true);
});

// --- Playthrough helpers (drive the adapter directly, no GameManager) --------

function playRun(pick) {
  const state = game.initMatch();
  for (let step = 0; step < game.totalActions; step++) {
    game.chapterEvent(state);           // idempotent per phase; safe to call each step
    const res = game.resolve(state, 'travis', pick(state));
    assert.ok(!res.error, `step ${step} failed: ${res.error}`);
  }
  return game.report(state);
}

const rightMove = (state) => game.aiMove(state);

function wrongMove(state) {
  const ss = state.sides.travis;
  const cursor = ss.cursor;
  const step = PHASES[Math.floor(cursor / 2)].steps[cursor % 2];
  const wrongReal = step.choices.findIndex((c) => c.verdict === 'wrong');
  return { kind: step.kind, choiceIndex: ss.shuffles[cursor].indexOf(wrongReal) };
}

test('all-right run: 100% accuracy and "You Held the Line"', () => {
  const report = playRun(rightMove);
  const you = report.perSide.travis;
  assert.equal(you.accuracy, 100);
  assert.ok(you.holdScore >= 210, `hold score ${you.holdScore} should be high`);
  assert.equal(you.ending.key, 'held');
  assert.ok(you.debrief.includes('San Jacinto'), 'debrief ties to San Jacinto');
});

test('all-wrong run: 0% accuracy and "The Line Broke Early"', () => {
  const report = playRun(wrongMove);
  const you = report.perSide.travis;
  assert.equal(you.accuracy, 0);
  assert.ok(you.holdScore < 150, `hold score ${you.holdScore} should be low`);
  assert.equal(you.ending.key, 'broke');
});

test('hold-score tiers: held ≥ 210, stood 150–209, broke < 150', () => {
  assert.equal(endingFor(300).key, 'held');
  assert.equal(endingFor(210).key, 'held');
  assert.equal(endingFor(180).key, 'stood');
  assert.equal(endingFor(150).key, 'stood');
  assert.equal(endingFor(100).key, 'broke');
  assert.equal(holdScore({ morale: 50, supplies: 50, defenses: 50 }), 150);
});

test('map placements write markers into the fort map state', () => {
  const state = game.initMatch();
  // Phase 1 step 1 is a map action; play it right (mans the 18-pounder).
  game.chapterEvent(state);
  const res = game.resolve(state, 'travis', game.aiMove(state));
  assert.equal(res.kind, 'map');
  assert.ok(res.placed, 'a marker was placed');
  const zone = res.placed.position;
  assert.ok(state.map.positions[zone].markers.length >= 1, 'marker recorded on the map');
});

test('currentPrompt never leaks the answer key', () => {
  const state = game.initMatch();
  game.chapterEvent(state);
  const prompt = game.currentPrompt(state);
  assert.ok(prompt.choices.length === 3);
  for (const c of prompt.choices) {
    // Map choices are objects {label, position, marker}; decisions are strings.
    if (typeof c === 'object') {
      assert.ok(!('verdict' in c) && !('feedback' in c) && !('effects' in c), 'no answer key on map choice');
    }
  }
});
