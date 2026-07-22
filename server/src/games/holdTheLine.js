// holdTheLine.js — Unit 3 game adapter: "Hold the Line: The Alamo" (SOLO only).
// Everyone plays commander William B. Travis through the 13-day siege, Feb 23 –
// March 6, 1836. Six phases × (1 map action + 1 decision) = 12 graded actions.
//
// Tone: this is about HOLDING THE LINE and buying time, not "winning the battle."
// Every run ends with the historical fall, handled with dignity and no gore, and
// a debrief that ties the 13 days to victory at San Jacinto. These were real
// people who died — the game honors courage and sacrifice (spec §15).
//
// THE ANSWER KEY LIVES HERE, ON THE SERVER (verdicts/effects/feedback). The
// factory ships labels only; the client submits { kind, choiceIndex }.
// Student-facing text is written at a 5th grade reading level.

import { createStepGame } from './_stepGame.js';

// ---------------------------------------------------------------------------
// Board metadata (shipped to clients at match:begin — display info only)
// ---------------------------------------------------------------------------

export const METERS = {
  morale:   { name: 'Morale',   icon: 'morale',   blurb: 'The garrison’s spirit and will to hold.' },
  supplies: { name: 'Supplies', icon: 'supplies', blurb: 'Food, water, and gunpowder.' },
  defenses: { name: 'Defenses', icon: 'defenses', blurb: 'How ready the walls and positions are.' },
};

// The seven positions on the Alamo fort map (spec §3.1). `weak` marks the north
// wall as the vulnerable stretch — the teachable pattern smart players notice.
export const POSITIONS = {
  northWall:    { name: 'North Wall', sub: 'the weak point', weak: true },
  southGate:    { name: 'South Gate', sub: 'Low Barracks' },
  westWall:     { name: 'West Wall', sub: 'long & exposed' },
  palisade:     { name: 'Palisade', sub: 'Crockett’s wooden post' },
  chapel:       { name: 'The Chapel', sub: 'stone church' },
  longBarracks: { name: 'Long Barracks', sub: 'inner strongpoint' },
  cannon:       { name: '18-Pounder', sub: 'the big gun' },
};

// Marker glyphs the fort map can draw for a placement.
export const MARKERS = {
  cannon:       { name: 'Cannon' },
  crew:         { name: 'Work crew' },
  sharpshooters:{ name: 'Sharpshooters' },
  defenders:    { name: 'Defenders' },
};

const START_METERS = { morale: 50, supplies: 50, defenses: 50 };

// ---------------------------------------------------------------------------
// PHASES — the full content bank. Each phase: an event card + 2 graded steps.
// A step is 'map' (place on the fort map — right choice carries a position) or
// 'decision' (answer the moment). ✅ right (+1) · ⚠️ partial (+0.5) · ❌ wrong (0).
// ---------------------------------------------------------------------------

export const PHASES = [
  // ---- Phase 1 — Day 1 (Feb 23): The Army Arrives ----
  {
    title: 'The Army Arrives', date: 'Feb 23', image: 'event_redflag.jpg',
    event: 'Santa Anna’s army marches into town and raises a blood-red flag. It means “no quarter” — no mercy, no prisoners. You must act fast.',
    steps: [
      {
        kind: 'map',
        prompt: 'Where do you pull your men?',
        hint: 'The old mission’s walls are your real strength.',
        choices: [
          { label: 'Pull everyone inside the Alamo walls and man the big 18-pounder cannon.',
            verdict: 'right', effects: { defenses: 15, morale: 5 }, position: 'cannon', marker: 'cannon',
            feedback: 'Yes. The old mission was your fortress. Getting inside the walls was the only way to hold.' },
          { label: 'Keep some men out in the town to skirmish.',
            verdict: 'partial', effects: { defenses: -5, morale: 5 },
            feedback: 'Fighting in the streets spread you thin. The walls were your real strength.' },
          { label: 'Abandon the Alamo and slip away east.',
            verdict: 'wrong', effects: { defenses: -15 },
            feedback: 'Leaving without a stand hands Santa Anna the town and buys Houston no time. The defenders chose to stand.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'Santa Anna demands surrender. Your answer?',
        choices: [
          { label: 'Ask for terms to buy a day.',
            verdict: 'partial', effects: { morale: -5, supplies: 5 },
            feedback: 'Talking bought a little time but risked the men’s resolve. Travis chose open defiance.' },
          { label: 'Fire the 18-pounder in defiance and refuse.',
            verdict: 'right', effects: { morale: 15 },
            feedback: 'Travis answered the red flag with a cannon shot. Defiance kept the men’s spirits up.' },
          { label: 'Surrender the fort.',
            verdict: 'wrong', effects: { morale: -15, defenses: -10 },
            feedback: 'Surrender ends the delay Houston needed. This isn’t the defenders’ stand.' },
        ],
      },
    ],
  },

  // ---- Phase 2 — Day 2 (Feb 24): Victory or Death ----
  {
    title: 'Victory or Death', date: 'Feb 24', image: 'event_letter.jpg',
    event: 'Your co-commander, James Bowie, falls gravely ill. Command is now yours alone. Enemy cannon begins to pound the walls.',
    steps: [
      {
        kind: 'decision',
        prompt: 'Bowie is too sick to lead. What do you do?',
        choices: [
          { label: 'Wait for Bowie to recover before deciding.',
            verdict: 'partial', effects: { defenses: -5 },
            feedback: 'Waiting wastes time while the enemy digs in. A commander must lead now.' },
          { label: 'Argue over who is really in charge.',
            verdict: 'wrong', effects: { morale: -10 },
            feedback: 'Split leadership weakens the defense. Unity mattered most.' },
          { label: 'Take sole command and keep Bowie’s men fighting beside yours.',
            verdict: 'right', effects: { morale: 10, defenses: 5 },
            feedback: 'Travis took command when Bowie fell ill, and the garrison stayed united.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'You can send a message to the world. What do you write?',
        choices: [
          { label: 'Send a short, plain request for ammunition.',
            verdict: 'partial', effects: { supplies: 5, morale: -5 },
            feedback: 'Practical — but Travis’s stirring words did far more to rally help.' },
          { label: 'Write “To the People of Texas and All Americans,” ending “Victory or Death.”',
            verdict: 'right', effects: { morale: 15 },
            feedback: 'Travis’s famous letter rallied Texans and made the Alamo a symbol.' },
          { label: 'Send nothing and stay quiet.',
            verdict: 'wrong', effects: { morale: -10 },
            feedback: 'Silence wins no help. The letter was one of Travis’s greatest acts.' },
        ],
      },
    ],
  },

  // ---- Phase 3 — Days 3–6 (Feb 25–28): The Siege Tightens ----
  {
    title: 'The Siege Tightens', date: 'Feb 25–28', image: 'event_siege.jpg',
    event: 'Enemy soldiers dig their lines closer each night. Food and gunpowder run low. You need help to arrive.',
    steps: [
      {
        kind: 'map',
        prompt: 'Which wall do you strengthen most?',
        hint: 'Look for the weakest stretch of wall.',
        choices: [
          { label: 'Shore up the weak north wall with timber and earth.',
            verdict: 'right', effects: { defenses: 15 }, position: 'northWall', marker: 'crew',
            feedback: 'The north wall was the Alamo’s weak point — and exactly where the final attack would come. Good instinct.' },
          { label: 'Reinforce the strong south gate again.',
            verdict: 'partial', effects: { defenses: 5 }, position: 'southGate', marker: 'crew',
            feedback: 'The gate was already solid. The north wall needed the work more.' },
          { label: 'Spread the work evenly and finish nothing.',
            verdict: 'wrong', effects: { defenses: -10 },
            feedback: 'Half-finished everywhere means strong nowhere. Priorities save forts.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'How do you call for reinforcements?',
        choices: [
          { label: 'Send one rider and hope.',
            verdict: 'partial', effects: { morale: 5 },
            feedback: 'One messenger is a thin thread. Travis sent several to raise the alarm.' },
          { label: 'Keep everyone inside; send no one.',
            verdict: 'wrong', effects: { morale: -10 },
            feedback: 'No couriers means no help and no word to the world. Getting the message out mattered.' },
          { label: 'Send trusted couriers like Juan Seguín and James Bonham through the lines.',
            verdict: 'right', effects: { morale: 10, defenses: 5 },
            feedback: 'Travis sent riders — including the Tejano captain Juan Seguín — for help. Seguín got through and survived.' },
        ],
      },
    ],
  },

  // ---- Phase 4 — Day 8 (March 1): The Immortal 32 ----
  {
    title: 'The Immortal 32', date: 'March 1', image: 'event_reinforcements.jpg',
    event: 'In the dark, 32 volunteers from Gonzales slip past the enemy and into the fort. They are few — but they came.',
    steps: [
      {
        kind: 'decision',
        prompt: 'How do you meet the Gonzales men?',
        choices: [
          { label: 'Welcome and thank them, and post them on the walls to lift spirits.',
            verdict: 'right', effects: { morale: 15, defenses: 5 },
            feedback: 'The 32 from Gonzales were the only reinforcements to answer the call. Their courage lifted the whole garrison.' },
          { label: 'Put them straight to work with no rest.',
            verdict: 'partial', effects: { defenses: 5, morale: -5 },
            feedback: 'They helped, but a word of thanks would have meant more to tired men.' },
          { label: 'Complain that so few came.',
            verdict: 'wrong', effects: { morale: -15 },
            feedback: 'Scorning brave volunteers crushes morale. They risked everything to stand with you.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'Where do you place your best shots?',
        hint: 'A low wooden fence is the thinnest stretch of the line.',
        choices: [
          { label: 'Keep them in reserve inside the chapel.',
            verdict: 'partial', effects: { defenses: 5 }, position: 'chapel', marker: 'sharpshooters',
            feedback: 'A reserve is useful, but the thin palisade needed defenders now.' },
          { label: 'Put Crockett and his marksmen at the wooden palisade, the weakest stretch.',
            verdict: 'right', effects: { defenses: 15 }, position: 'palisade', marker: 'sharpshooters',
            feedback: 'Crockett’s sharpshooters held the low wooden palisade — plugging a gap with skill instead of stone.' },
          { label: 'Send them outside the walls to scout.',
            verdict: 'wrong', effects: { defenses: -10, morale: -5 },
            feedback: 'Outside the walls they’re exposed and wasted. Every rifle was needed on the line.' },
        ],
      },
    ],
  },

  // ---- Phase 5 — Days 10–12 (March 3–5): No Help Is Coming ----
  {
    title: 'No Help Is Coming', date: 'March 3–5', image: 'event_line.jpg',
    event: 'Bonham rides back through the enemy lines with hard news: no large army is coming in time. You gather the men.',
    steps: [
      {
        kind: 'decision',
        prompt: 'What do you tell the garrison?',
        choices: [
          { label: 'Hide the bad news to keep them calm.',
            verdict: 'partial', effects: { morale: -5 },
            feedback: 'A short calm — but men fight best when they trust their leader with the truth.' },
          { label: 'Order them to stay and threaten deserters.',
            verdict: 'wrong', effects: { morale: -15 },
            feedback: 'Fear is weak glue. The defenders stayed by choice, not threat.' },
          { label: 'Tell them the truth, then let each man choose to stay or go.',
            verdict: 'right', effects: { morale: 15 },
            feedback: 'The famous story says Travis drew a line and asked who would stay. Honesty and choice bound the defenders together.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'The bombardment is heavy. How do you use these last days?',
        choices: [
          { label: 'Fire back constantly to answer the enemy guns.',
            verdict: 'partial', effects: { morale: 5, supplies: -10 },
            feedback: 'Answering every shot felt bold but burned scarce powder you’d soon need.' },
          { label: 'Keep everyone on watch with no rest.',
            verdict: 'wrong', effects: { defenses: -10 },
            feedback: 'Exhausted defenders can’t hold a wall. Rest was a weapon too.' },
          { label: 'Rest the men in shifts, save ammunition, and ready every position.',
            verdict: 'right', effects: { defenses: 10, supplies: 10 },
            feedback: 'Travis kept the garrison rested and ready for the assault everyone knew was coming.' },
        ],
      },
    ],
  },

  // ---- Phase 6 — Day 13 (March 6, before dawn): Hold the Line ----
  {
    title: 'Hold the Line', date: 'March 6', image: 'event_predawn.jpg',
    event: 'In the cold dark before dawn, thousands of soldiers rush the walls. The hardest hour has come.',
    steps: [
      {
        kind: 'map',
        prompt: 'Where do you rush your defenders as the attack lands?',
        hint: 'The enemy will break through where the wall is weakest.',
        choices: [
          { label: 'Mass your men at the north wall, where the enemy breaks through first.',
            verdict: 'right', effects: { defenses: 15 }, position: 'northWall', marker: 'defenders',
            feedback: 'The final assault came over the battered north wall — exactly where the fight was fiercest.' },
          { label: 'Hold every wall evenly.',
            verdict: 'partial', effects: { defenses: 5 },
            feedback: 'Spread thin, no single point holds. The north wall was the true crisis.' },
          { label: 'Pull everyone back to the chapel at once.',
            verdict: 'wrong', effects: { defenses: -10 }, position: 'chapel', marker: 'defenders',
            feedback: 'Giving up the walls too soon lets the enemy pour in. The defenders fought for every foot.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'As the walls are overrun, what is your last order?',
        choices: [
          { label: 'Order a last-minute breakout attempt.',
            verdict: 'partial', effects: { defenses: -5, morale: 5 },
            feedback: 'A few tried to break out; most stood and fought. Either way, the end had come.' },
          { label: 'Make sure Susanna Dickinson and the noncombatants are sheltered so the story survives — and fight on.',
            verdict: 'right', effects: { morale: 15 },
            feedback: 'Survivors like Susanna Dickinson carried the story out. Their witness turned the Alamo into a rallying cry.' },
          { label: 'Destroy everything so no word escapes.',
            verdict: 'wrong', effects: { morale: -15 },
            feedback: 'If no one lives to tell it, there is no “Remember the Alamo.” The story was the victory.' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Endings & debrief. Hold Score = morale + supplies + defenses (max 300). Every
// run ends with the historical fall, told with respect (spec §3.5, §15).
// ---------------------------------------------------------------------------

export const ENDINGS = {
  held:  { key: 'held',  title: 'You Held the Line',
           text: 'You bought Sam Houston thirteen days, sent word across Texas, and made the Alamo a name that would win the war. The fort still fell on March 6 — as it did in history — but few defenders ever held so well.' },
  stood: { key: 'stood', title: 'The Alamo Stood',
           text: 'The fort fell, as it did in history — but the days you held still slowed Santa Anna and stirred Texas to fight.' },
  broke: { key: 'broke', title: 'The Line Broke Early',
           text: 'The line broke sooner than it might have. The real defenders held longer by staying united, sending couriers, and readying the walls — but their courage is remembered all the same.' },
};

export const DEBRIEF =
  'On March 6, 1836, the Alamo fell and nearly all of its roughly 200 defenders died. Their 13-day stand delayed Santa Anna and gave Sam Houston time to gather and train an army. Six weeks later at San Jacinto, the cry “Remember the Alamo!” helped win Texas independence in an 18-minute battle. The Alamo was a military loss — but the time it bought, and the story it told, helped win the war.';

// Hold Score = sum of the three meters (max 300).
export function holdScore(meters) {
  return (meters.morale || 0) + (meters.supplies || 0) + (meters.defenses || 0);
}

// Ending tier from the final Hold Score (spec §3.5).
export function endingFor(score) {
  if (score >= 210) return ENDINGS.held;
  if (score >= 150) return ENDINGS.stood;
  return ENDINGS.broke;
}

export default createStepGame({
  id: 'hold-the-line',
  title: 'Hold the Line: The Alamo',
  side: 'travis',                 // everyone plays Travis — a single class group
  startMeters: () => ({ ...START_METERS }),
  phases: PHASES,
  meta: { meters: METERS, positions: POSITIONS, markers: MARKERS },
  scoreMeters: holdScore,
  endingFor,
  debrief: DEBRIEF,
});
