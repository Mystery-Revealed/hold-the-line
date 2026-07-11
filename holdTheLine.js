// holdTheLine.js — Unit 3 game adapter: "Hold the Line: The Alamo" (SOLO only).
// Everyone plays commander William B. Travis through the 13-day siege.
// 6 phases x (1 map action + 1 decision) = 12 graded actions.
// Meters: morale, supplies, defenses (start 50). Server holds the answer key.
//
// Notes:
// - `kind` ('map' | 'decision') tells the client whether to show the fort map or a
//   choice card. The current _stepGame factory ignores it (applies meter effects only);
//   `position` on a map choice is where to draw the marker once map-writes are wired in.
// - Content is the FULL script from the build spec (Section 5). This file is
//   build-complete: filling it here means the coding session can focus on the UI.

import { createStepGame } from './_stepGame.js';

const START = { morale: 50, supplies: 50, defenses: 50 };

const STEPS = {
  travis: [
    // ---- Phase 1 — Day 1 (Feb 23): The Army Arrives ----
    {
      kind: 'map', phase: 1, image: 'event_redflag.jpg',
      prompt: "Day 1 (Feb 23): Santa Anna's army raises a blood-red flag — \"no quarter,\" no mercy. Where do you pull your men?",
      choices: [
        { label: 'Pull everyone inside the Alamo walls and man the big 18-pounder cannon.',
          verdict: 'right', effects: { defenses: +15, morale: +5 }, position: 'cannon',
          feedback: 'Yes. The old mission was your fortress. Getting inside the walls was the only way to hold.' },
        { label: 'Keep some men out in the town to skirmish.',
          verdict: 'partial', effects: { defenses: -5, morale: +5 },
          feedback: 'Fighting in the streets spread you thin. The walls were your real strength.' },
        { label: 'Abandon the Alamo and slip away east.',
          verdict: 'wrong', effects: { defenses: -15 },
          feedback: "Leaving without a stand hands Santa Anna the town and buys Houston no time. The defenders chose to stand." },
      ],
    },
    {
      kind: 'decision', phase: 1, image: 'event_redflag.jpg',
      prompt: 'Santa Anna demands surrender. Your answer?',
      choices: [
        { label: 'Fire the 18-pounder in defiance and refuse.',
          verdict: 'right', effects: { morale: +15 },
          feedback: "Travis answered the red flag with a cannon shot. Defiance kept the men's spirits up." },
        { label: 'Ask for terms to buy a day.',
          verdict: 'partial', effects: { morale: -5, supplies: +5 },
          feedback: 'Talking bought a little time but risked the men’s resolve. Travis chose open defiance.' },
        { label: 'Surrender the fort.',
          verdict: 'wrong', effects: { morale: -15, defenses: -10 },
          feedback: "Surrender ends the delay Houston needed. This isn't the defenders' stand." },
      ],
    },

    // ---- Phase 2 — Day 2 (Feb 24): Victory or Death ----
    {
      kind: 'decision', phase: 2, image: 'event_letter.jpg',
      prompt: 'James Bowie, your co-commander, is too sick to lead. What do you do?',
      choices: [
        { label: "Take sole command and keep Bowie's men fighting beside yours.",
          verdict: 'right', effects: { morale: +10, defenses: +5 },
          feedback: 'Travis took command when Bowie fell ill, and the garrison stayed united.' },
        { label: 'Wait for Bowie to recover before deciding.',
          verdict: 'partial', effects: { defenses: -5 },
          feedback: 'Waiting wastes time while the enemy digs in. A commander must lead now.' },
        { label: 'Argue over who is really in charge.',
          verdict: 'wrong', effects: { morale: -10 },
          feedback: 'Split leadership weakens the defense. Unity mattered most.' },
      ],
    },
    {
      kind: 'decision', phase: 2, image: 'event_letter.jpg',
      prompt: 'You can send a message to the world. What do you write?',
      choices: [
        { label: 'Write "To the People of Texas and All Americans," ending "Victory or Death."',
          verdict: 'right', effects: { morale: +15 },
          feedback: "Travis's famous letter rallied Texans and made the Alamo a symbol." },
        { label: 'Send a short, plain request for ammunition.',
          verdict: 'partial', effects: { supplies: +5, morale: -5 },
          feedback: "Practical — but Travis's stirring words did far more to rally help." },
        { label: 'Send nothing and stay quiet.',
          verdict: 'wrong', effects: { morale: -10 },
          feedback: 'Silence wins no help. The letter was one of Travis’s greatest acts.' },
      ],
    },

    // ---- Phase 3 — Days 3–6 (Feb 25–28): The Siege Tightens ----
    {
      kind: 'map', phase: 3, image: 'event_siege.jpg',
      prompt: 'Food and gunpowder run low. Which wall do you strengthen most?',
      choices: [
        { label: 'Shore up the weak north wall with timber and earth.',
          verdict: 'right', effects: { defenses: +15 }, position: 'northWall',
          feedback: "The north wall was the Alamo's weak point — and exactly where the final attack would come. Good instinct." },
        { label: 'Reinforce the strong south gate again.',
          verdict: 'partial', effects: { defenses: +5 }, position: 'southGate',
          feedback: 'The gate was already solid. The north wall needed the work more.' },
        { label: 'Spread the work evenly and finish nothing.',
          verdict: 'wrong', effects: { defenses: -10 },
          feedback: 'Half-finished everywhere means strong nowhere. Priorities save forts.' },
      ],
    },
    {
      kind: 'decision', phase: 3, image: 'event_siege.jpg',
      prompt: 'How do you call for reinforcements?',
      choices: [
        { label: 'Send trusted couriers like Juan Seguín and James Bonham through the lines.',
          verdict: 'right', effects: { morale: +10, defenses: +5 },
          feedback: 'Travis sent riders — including the Tejano captain Juan Seguín — for help. Seguín got through and survived.' },
        { label: 'Send one rider and hope.',
          verdict: 'partial', effects: { morale: +5 },
          feedback: 'One messenger is a thin thread. Travis sent several to raise the alarm.' },
        { label: 'Keep everyone inside; send no one.',
          verdict: 'wrong', effects: { morale: -10 },
          feedback: 'No couriers means no help and no word to the world. Getting the message out mattered.' },
      ],
    },

    // ---- Phase 4 — Day 8 (March 1): The Immortal 32 ----
    {
      kind: 'decision', phase: 4, image: 'event_reinforcements.jpg',
      prompt: '32 volunteers from Gonzales slip into the fort. How do you meet them?',
      choices: [
        { label: 'Welcome and thank them, and post them on the walls to lift spirits.',
          verdict: 'right', effects: { morale: +15, defenses: +5 },
          feedback: 'The 32 from Gonzales were the only reinforcements to answer the call. Their courage lifted the whole garrison.' },
        { label: 'Put them straight to work with no rest.',
          verdict: 'partial', effects: { defenses: +5, morale: -5 },
          feedback: 'They helped, but a word of thanks would have meant more to tired men.' },
        { label: 'Complain that so few came.',
          verdict: 'wrong', effects: { morale: -15 },
          feedback: 'Scorning brave volunteers crushes morale. They risked everything to stand with you.' },
      ],
    },
    {
      kind: 'map', phase: 4, image: 'event_reinforcements.jpg',
      prompt: 'Where do you place your best shots?',
      choices: [
        { label: 'Put Crockett and his marksmen at the wooden palisade, the weakest stretch.',
          verdict: 'right', effects: { defenses: +15 }, position: 'palisade',
          feedback: "Crockett's sharpshooters held the low wooden palisade — plugging a gap with skill instead of stone." },
        { label: 'Keep them in reserve inside the chapel.',
          verdict: 'partial', effects: { defenses: +5 }, position: 'chapel',
          feedback: 'A reserve is useful, but the thin palisade needed defenders now.' },
        { label: 'Send them outside the walls to scout.',
          verdict: 'wrong', effects: { defenses: -10, morale: -5 },
          feedback: "Outside the walls they're exposed and wasted. Every rifle was needed on the line." },
      ],
    },

    // ---- Phase 5 — Days 10–12 (March 3–5): No Help Is Coming ----
    {
      kind: 'decision', phase: 5, image: 'event_line.jpg',
      prompt: 'Bonham returns: no large army is coming in time. What do you tell the garrison?',
      choices: [
        { label: 'Tell them the truth, then let each man choose to stay or go.',
          verdict: 'right', effects: { morale: +15 },
          feedback: 'The famous story says Travis drew a line and asked who would stay. Honesty and choice bound the defenders together.' },
        { label: 'Hide the bad news to keep them calm.',
          verdict: 'partial', effects: { morale: -5 },
          feedback: 'A short calm — but men fight best when they trust their leader with the truth.' },
        { label: 'Order them to stay and threaten deserters.',
          verdict: 'wrong', effects: { morale: -15 },
          feedback: 'Fear is weak glue. The defenders stayed by choice, not threat.' },
      ],
    },
    {
      kind: 'decision', phase: 5, image: 'event_line.jpg',
      prompt: 'The bombardment is heavy. How do you use these last days?',
      choices: [
        { label: 'Rest the men in shifts, save ammunition, and ready every position.',
          verdict: 'right', effects: { defenses: +10, supplies: +10 },
          feedback: 'Travis kept the garrison rested and ready for the assault everyone knew was coming.' },
        { label: 'Fire back constantly to answer the enemy guns.',
          verdict: 'partial', effects: { morale: +5, supplies: -10 },
          feedback: "Answering every shot felt bold but burned scarce powder you'd soon need." },
        { label: 'Keep everyone on watch with no rest.',
          verdict: 'wrong', effects: { defenses: -10 },
          feedback: "Exhausted defenders can't hold a wall. Rest was a weapon too." },
      ],
    },

    // ---- Phase 6 — Day 13 (March 6, before dawn): Hold the Line ----
    {
      kind: 'map', phase: 6, image: 'event_predawn.jpg',
      prompt: 'Thousands rush the walls before dawn. Where do you rush your defenders?',
      choices: [
        { label: 'Mass your men at the north wall, where the enemy breaks through first.',
          verdict: 'right', effects: { defenses: +15 }, position: 'northWall',
          feedback: 'The final assault came over the battered north wall — exactly where the fight was fiercest.' },
        { label: 'Hold every wall evenly.',
          verdict: 'partial', effects: { defenses: +5 },
          feedback: 'Spread thin, no single point holds. The north wall was the true crisis.' },
        { label: 'Pull everyone back to the chapel at once.',
          verdict: 'wrong', effects: { defenses: -10 }, position: 'chapel',
          feedback: 'Giving up the walls too soon lets the enemy pour in. The defenders fought for every foot.' },
      ],
    },
    {
      kind: 'decision', phase: 6, image: 'event_predawn.jpg',
      prompt: 'As the walls are overrun, what is your last order?',
      choices: [
        { label: 'Make sure Susanna Dickinson and the noncombatants are sheltered so the story survives — and fight on.',
          verdict: 'right', effects: { morale: +15 },
          feedback: 'Survivors like Susanna Dickinson carried the story out. Their witness turned the Alamo into a rallying cry.' },
        { label: 'Order a last-minute breakout attempt.',
          verdict: 'partial', effects: { defenses: -5, morale: +5 },
          feedback: 'A few tried to break out; most stood and fought. Either way, the end had come.' },
        { label: 'Destroy everything so no word escapes.',
          verdict: 'wrong', effects: { morale: -15 },
          feedback: "If no one lives to tell it, there is no 'Remember the Alamo.' The story was the victory." },
      ],
    },
  ],
};

// Ending tiers + debrief for the client to show at match:end.
// Hold Score = morale + supplies + defenses (max 300). Combine with accuracy as you like.
export const ENDINGS = {
  held:   { title: 'You Held the Line',
            text: 'You bought Sam Houston thirteen days, sent word across Texas, and made the Alamo a name that would win the war.' },
  stood:  { title: 'The Alamo Stood',
            text: 'The fort fell, as it did in history — but the days you held still slowed Santa Anna and stirred Texas to fight.' },
  broke:  { title: 'The Line Broke Early',
            text: 'The line broke sooner than it might have. The real defenders held longer by staying united, sending couriers, and readying the walls — but their courage is remembered all the same.' },
  debrief: 'On March 6, 1836, the Alamo fell and nearly all ~200 defenders died. Their 13-day stand delayed Santa Anna and gave Sam Houston time to gather an army. Six weeks later at San Jacinto, the cry "Remember the Alamo!" helped win Texas independence in an 18-minute battle.',
};

// Pick an ending tier from final meters (client helper; tune thresholds to taste).
export function endingTier(meters) {
  const hold = (meters.morale || 0) + (meters.supplies || 0) + (meters.defenses || 0);
  if (hold >= 210) return 'held';
  if (hold >= 150) return 'stood';
  return 'broke';
}

export default createStepGame({
  id: 'hold-the-line',
  title: 'Hold the Line: The Alamo',
  modes: ['solo'],
  sides: null,                 // solo-only; single role (Travis)
  totalActions: 12,
  startMeters: () => ({ ...START }),
  stepsFor: () => STEPS.travis,
  mapInit: () => ({
    positions: {
      northWall: { markers: [] },
      southGate: { markers: [] },
      westWall: { markers: [] },
      palisade: { markers: [] },
      chapel: { markers: [] },
      longBarracks: { markers: [] },
      cannon: { markers: [] },
    },
  }),
});
