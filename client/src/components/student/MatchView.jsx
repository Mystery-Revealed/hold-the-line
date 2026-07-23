// MatchView.jsx — one phase beat at a time: event card → map action or decision
// → feedback. Single-role solo, so it's always your turn. The fort map is always
// on screen; the action panel swaps.

import { useEffect, useState } from 'react';
import { emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import FortMap, { MarkerGlyph } from '../shared/FortMap.jsx';
import MetersBar from '../shared/MetersBar.jsx';

const holdScore = (m) => (m ? (m.morale || 0) + (m.supplies || 0) + (m.defenses || 0) : 0);

export default function MatchView({ state, dispatch }) {
  const { match } = state;
  const { begin, eventCard, turn, feedback } = match;
  const meta = begin.meta;

  // Choice picked for the current map action (cleared whenever the step changes).
  const [pickedIdx, setPickedIdx] = useState(null);
  useEffect(() => setPickedIdx(null), [turn?.stepIndex, turn?.kind]);

  // The server pushes the NEXT chapter's chapter:event AND its first turn:begin
  // synchronously with the CURRENT chapter's LAST turn:resolution — it doesn't
  // wait for the student to dismiss anything. So while a chapter-ending verdict
  // is on screen, eventCard AND turn have BOTH already raced ahead, and
  // preferring either would make the chip read one chapter ahead. Only
  // feedback.stepIndex is baked into the feedback payload itself and can't
  // race — derive the chapter from it (2 steps per chapter, the same rule the
  // server's chapterOf uses). Once feedback is dismissed, eventCard/turn are
  // exactly what's on screen next, so THEIR chapter is what should show.
  const chapters = meta.chapters?.[begin.side] || [];
  const stepsPerChapter = meta.stepsPerChapter || 2;
  const chapterIndexFor = (stepIndex) => Math.floor(stepIndex / stepsPerChapter);
  const liveChapterIndex = feedback ? chapterIndexFor(feedback.stepIndex)
    : turn?.yourTurn ? chapterIndexFor(turn.stepIndex)
    : eventCard ? eventCard.chapter.index
    : null;
  const phase = liveChapterIndex != null && chapters[liveChapterIndex]
    ? { index: liveChapterIndex, count: chapters.length, ...chapters[liveChapterIndex] }
    : (eventCard?.chapter || turn?.chapter); // fallback if meta.chapters is ever absent
  const mapTurn = !feedback && !eventCard && !!turn?.yourTurn && turn.kind === 'map';
  const choices = turn?.choices || [];

  // Fort-map wiring for a map action: highlight the positions the choices offer.
  const eligible = mapTurn ? choices.filter((c) => c && c.position).map((c) => c.position) : [];
  const selectedPos = mapTurn && pickedIdx != null ? choices[pickedIdx]?.position || null : null;
  const onSelectZone = (posId) => {
    const idx = choices.findIndex((c) => c && c.position === posId);
    if (idx >= 0) setPickedIdx(idx);
  };

  const lowMeter = Object.entries(match.meters || {}).find(([, v]) => v <= 15);

  return (
    <div className="match">
      <header className="match-header">
        <div className="nation-chip travis">Commander <b>Travis</b></div>
        <div className="hold-chip" title="Your three meters added up (max 300)">
          Hold Score <b>{holdScore(match.meters)}</b><span className="muted"> / 300</span>
        </div>
        {phase && (
          <div className="chapter-chip">
            Phase {phase.index + 1} of {phase.count} · {phase.date}
          </div>
        )}
      </header>

      <div className="meters-row solo">
        <MetersBar meters={match.meters} meta={meta} title="The Garrison" />
      </div>

      {lowMeter && !feedback && (
        <div className="banner danger" role="alert">
          ⚠️ Your {meta.meters[lowMeter[0]]?.name || lowMeter[0]} is running very low. Steady the line.
        </div>
      )}

      <div className="match-body">
        <section className="action-panel" aria-live="polite">
          {feedback ? (
            <FeedbackPanel
              feedback={feedback}
              meta={meta}
              matchEnded={!!state.matchEnd}
              onContinue={() => dispatch({ type: 'dismiss-feedback' })}
            />
          ) : eventCard ? (
            <EventCard eventCard={eventCard} meta={meta} onContinue={() => dispatch({ type: 'dismiss-event' })} />
          ) : turn?.yourTurn && turn.kind === 'map' ? (
            <MapActionPanel turn={turn} meta={meta} pickedIdx={pickedIdx} onPick={setPickedIdx} />
          ) : turn?.yourTurn && turn.kind === 'decision' ? (
            <DecisionPanel turn={turn} />
          ) : (
            <div className="waiting-panel"><div className="pulse-dot" aria-hidden="true" /><p>Steady…</p></div>
          )}
        </section>

        <section className="map-panel">
          <FortMap
            meta={meta}
            map={match.map}
            eligible={eligible}
            selected={selectedPos}
            onSelect={onSelectZone}
          />
          <MapLegend meta={meta} />
        </section>
      </div>
    </div>
  );
}

/* -------- panels -------- */

function EventCard({ eventCard, meta, onContinue }) {
  const ch = eventCard.chapter;
  return (
    <div className="event-card">
      <div className="event-kicker">Phase {ch.index + 1} of {ch.count} · {ch.date}</div>
      <h2>{ch.title}</h2>
      <Art name={ch.image} alt={ch.title} className="event-art" />
      <p className="event-text">{eventCard.text}</p>
      {eventCard.eventEffects && (
        <div className="effects-row">
          {Object.entries(eventCard.eventEffects).map(([k, v]) => (
            <span key={k} className={`effect-chip ${v > 0 ? 'up' : 'down'}`}>
              {meta.meters[k]?.name} {v > 0 ? `+${v}` : v}
            </span>
          ))}
        </div>
      )}
      <button className="btn big" onClick={onContinue}>To the fort!</button>
    </div>
  );
}

function MapActionPanel({ turn, meta, pickedIdx, onPick }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const choices = turn.choices || [];
  const hasZones = choices.some((c) => c && c.position);

  async function confirm() {
    if (busy || pickedIdx == null) return;
    setBusy(true);
    const res = await emitAck('student:submit_move', { move: { kind: 'map', choiceIndex: pickedIdx } });
    if (!res.ok) { setErr(errorText(res.error)); setBusy(false); }
    // On success the server pushes turn:resolution and this panel unmounts.
  }

  return (
    <div className="move-panel">
      <h2>🗺️ Fort map action</h2>
      <p className="prompt">{turn.prompt}</p>
      {turn.hint && <p className="hint">💡 {turn.hint}</p>}
      {hasZones && <p className="instruction">👉 Tap a glowing spot on the fort, or choose an option below.</p>}
      <div className="choice-list">
        {choices.map((c, i) => (
          <button
            key={i}
            className={`choice-btn ${pickedIdx === i ? 'picked' : ''}`}
            disabled={busy}
            onClick={() => onPick(i)}
          >
            {c.position && meta.positions[c.position] && (
              <span className="choice-tag">📍 {meta.positions[c.position].name}</span>
            )}
            {c.label}
          </button>
        ))}
      </div>
      {pickedIdx != null && (
        <button className="btn big confirm" disabled={busy} onClick={confirm}>
          {busy ? 'Placing…' : 'Give the order'}
        </button>
      )}
      <p className="err" role="alert">{err}</p>
    </div>
  );
}

function DecisionPanel({ turn }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function choose(choiceIndex) {
    if (busy) return;
    setBusy(true);
    const res = await emitAck('student:submit_move', { move: { kind: 'decision', choiceIndex } });
    if (!res.ok) { setErr(errorText(res.error)); setBusy(false); }
  }

  return (
    <div className="move-panel">
      <h2>🤔 Your decision</h2>
      <p className="prompt">{turn.prompt}</p>
      <div className="choice-list">
        {(turn.choices || []).map((label, i) => (
          <button key={i} className="choice-btn" disabled={busy} onClick={() => choose(i)}>
            {label}
          </button>
        ))}
      </div>
      <p className="err" role="alert">{err}</p>
    </div>
  );
}

const VERDICT_UI = {
  right: { label: 'Well judged', className: 'right', icon: '✓' },
  partial: { label: 'Half measure', className: 'partial', icon: '≈' },
  wrong: { label: 'A costly call', className: 'wrong', icon: '✗' },
};

function FeedbackPanel({ feedback, meta, matchEnded, onContinue }) {
  const v = VERDICT_UI[feedback.verdict] || VERDICT_UI.partial;
  return (
    <div className="feedback-panel">
      <div className={`verdict-badge ${v.className}`}>
        <span aria-hidden="true">{v.icon}</span> {v.label}
      </div>
      {feedback.placed && (
        <p className="placed-line">
          You posted <b>{meta.markers[feedback.placed.marker]?.name || 'your men'}</b> at the{' '}
          <b>{meta.positions[feedback.placed.position]?.name}</b>.
        </p>
      )}
      <p className="feedback-text">{feedback.feedback}</p>
      <div className="effects-row">
        {Object.entries(feedback.effects || {}).map(([k, val]) => (
          <span key={k} className={`effect-chip ${val > 0 ? 'up' : 'down'}`}>
            {meta.meters[k]?.name} {val > 0 ? `+${val}` : val}
          </span>
        ))}
      </div>
      <button className="btn big" onClick={onContinue}>
        {matchEnded ? 'See how it ends' : 'Continue'}
      </button>
    </div>
  );
}

function MapLegend({ meta }) {
  return (
    <div className="map-legend">
      {Object.entries(meta.markers || {}).map(([id, m]) => (
        <span key={id} className="legend-item">
          <svg viewBox="0 0 22 22" className="legend-glyph" aria-hidden="true"><MarkerGlyph marker={id} /></svg>
          {m.name}
        </span>
      ))}
    </div>
  );
}
