// ResultScreen.jsx — every run ends with the historical fall, told with respect.
// Two stories, in order: (1) how well you HELD (Hold Score + ending), (2) the
// score that matters to your teacher — accuracy — then the debrief tying the 13
// days to victory at San Jacinto.

import { Art } from '../../services/assets.jsx';

const TIER_CLASS = { held: 'win', stood: 'mid', broke: 'low' };

export default function ResultScreen({ state, dispatch }) {
  const end = state.matchEnd;
  const meta = end.meta || state.match?.begin?.meta;
  const you = end.you;
  const ending = you.ending;
  const score = you.holdScore ?? 0;

  return (
    <div className="card result-screen">
      <div className="event-kicker">Before dawn · March 6, 1836</div>
      <h1 className={`result-headline ${TIER_CLASS[ending.key] || 'mid'}`}>{ending.title}</h1>

      <Art name="ending.jpg" alt="The Alamo at dawn after the siege" className="result-art" />

      <p className="fall-note">
        The Alamo fell, as it did in history — nearly all of its defenders gave
        their lives. This game was never about winning the battle. It was about
        <b> how well you held the line</b>, and how well your calls matched theirs.
      </p>

      <div className="ending-block travis">
        <p>{ending.text}</p>
      </div>

      <div className="score-block" aria-label="Hold Score">
        <div className="score-head">
          <span className="score-title">🛡️ Hold Score</span>
          <span className="score-num">{score}<span className="muted"> / 300</span></span>
        </div>
        <span className="score-bar-track">
          <span className={`score-bar ${TIER_CLASS[ending.key] || 'mid'}`} style={{ width: `${Math.min(100, (score / 300) * 100)}%` }} />
        </span>
        <div className="meter-final-row">
          {Object.entries(you.meters || {}).map(([k, v]) => (
            <span key={k} className="meter-final">{meta?.meters?.[k]?.name || k}: <b>{v}</b></span>
          ))}
        </div>
      </div>

      <div className="accuracy-block">
        <div className="accuracy-number">{you.accuracy}%</div>
        <div>
          <b>Your accuracy — the score your teacher sees.</b>
          <p>How well your 12 calls matched what the real defenders did. A commander who holds well <i>and</i> plays true to history scores highest.</p>
        </div>
      </div>

      <div className="debrief">
        <h3>What really happened</h3>
        <p>{you.debrief}</p>
      </div>

      <div className="btn-col">
        <button className="btn big" onClick={() => dispatch({ type: 'play-again' })}>
          Play again
        </button>
      </div>
    </div>
  );
}
