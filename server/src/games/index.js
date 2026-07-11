// games/index.js — registry of playable games. GameManager looks games up here,
// keeping the engine reusable across Texas History units.

import holdTheLine from './holdTheLine.js';

export const GAMES = {
  [holdTheLine.id]: holdTheLine,
};

export function getGame(id) {
  return GAMES[id] || null;
}
