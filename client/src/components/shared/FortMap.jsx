// FortMap.jsx — the interactive Alamo compound, top-down. Pure SVG (crisp at any
// size, keyboard accessible). The seven positions are chunky, labeled, tappable
// blocks arranged like the fort's plan. The North Wall reads as the weak point —
// the teachable pattern a smart commander notices.
//
// Placement is server truth: markers render only from `map.positions`. The
// component holds no state; `selected`/`eligible`/`onSelect` are controlled by
// the parent (MatchView).

// Zone layout (viewBox 0 0 440 440). Chunky blocks = big tap targets on a phone.
const ZONES = {
  northWall:    { x: 70,  y: 58,  w: 302, h: 48, label: 'North Wall',   sub: 'weak point', weak: true },
  westWall:     { x: 40,  y: 112, w: 66,  h: 188, label: 'West Wall',    sub: 'long & exposed' },
  longBarracks: { x: 334, y: 112, w: 66,  h: 188, label: 'Long',        sub: 'Barracks' },
  cannon:       { x: 40,  y: 306, w: 112, h: 68,  label: '18-Pounder',   sub: 'the big gun' },
  southGate:    { x: 158, y: 306, w: 142, h: 68,  label: 'South Gate',   sub: 'Low Barracks' },
  palisade:     { x: 306, y: 306, w: 94,  h: 34,  label: 'Palisade',     sub: '' },
  chapel:       { x: 306, y: 346, w: 94,  h: 62,  label: 'Chapel',       sub: 'stone church' },
};
const ORDER = ['northWall', 'westWall', 'longBarracks', 'cannon', 'southGate', 'palisade', 'chapel'];

// Plaza (the open courtyard) — decorative, not clickable.
const PLAZA = { x: 112, y: 112, w: 220, h: 188 };

// Small hand-drawn glyphs for each marker type (22×22 box, drawn at origin).
function MarkerGlyph({ marker }) {
  if (marker === 'cannon') {
    return (
      <g>
        <rect x="6" y="9" width="12" height="5" rx="2" />
        <circle cx="8" cy="16" r="4" />
        <circle cx="8" cy="16" r="1.6" fill="#fff" />
        <rect x="14" y="7" width="4" height="3" rx="1" />
      </g>
    );
  }
  if (marker === 'crew') {
    // A hammer (repair crew).
    return (
      <g>
        <rect x="4" y="4" width="12" height="5" rx="1.5" transform="rotate(35 10 6)" />
        <rect x="9" y="8" width="3" height="11" rx="1.5" transform="rotate(35 10 13)" />
      </g>
    );
  }
  if (marker === 'sharpshooters') {
    // A long rifle laid diagonally.
    return (
      <g>
        <path d="M4,17 L17,5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M14,4 L18,4 M6,15 L9,18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    );
  }
  // defenders — a small shield.
  return (
    <g>
      <path d="M11,3 L18,6 V12 C18,16 15,18 11,20 C7,18 4,16 4,12 V6 Z" />
      <path d="M11,3 V20" stroke="#fff" strokeWidth="1.1" opacity="0.7" />
    </g>
  );
}

export default function FortMap({
  meta,                 // { positions: { id: { name, sub, weak } }, markers: {...} }
  map,                  // { positions: { id: { markers: [{ side, marker }] } } }
  eligible = [],        // position ids that are choices this step (highlighted)
  selected = null,      // position id currently picked
  onSelect,
}) {
  const positionsMeta = meta?.positions || {};
  const eligibleSet = new Set(eligible);
  const interactive = eligibleSet.size > 0;

  return (
    <svg
      className={`fort-map ${interactive ? 'selectable' : ''}`}
      viewBox="0 0 440 440"
      role="group"
      aria-label="Top-down map of the Alamo compound with seven positions"
    >
      <defs>
        <filter id="fortShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3a2a18" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* compound footprint + open plaza */}
      <rect x="30" y="48" width="380" height="368" rx="10" className="fort-base" filter="url(#fortShadow)" />
      <rect x={PLAZA.x} y={PLAZA.y} width={PLAZA.w} height={PLAZA.h} rx="6" className="fort-plaza" />
      <text x={PLAZA.x + PLAZA.w / 2} y={PLAZA.y + PLAZA.h / 2} textAnchor="middle" className="plaza-label">Plaza</text>

      {ORDER.map((id) => {
        const z = ZONES[id];
        const info = positionsMeta[id] || { name: z.label };
        const markers = map?.positions?.[id]?.markers || [];
        const isEligible = eligibleSet.has(id);
        const isSelected = selected === id;
        const cx = z.x + z.w / 2;

        const cls = [
          'zone',
          z.weak ? 'weak' : '',
          isEligible ? 'clickable' : '',
          isSelected ? 'selected' : '',
        ].filter(Boolean).join(' ');

        return (
          <g key={id} className="zone-group">
            <rect
              x={z.x} y={z.y} width={z.w} height={z.h} rx="7"
              className={cls}
              role={isEligible ? 'button' : 'img'}
              tabIndex={isEligible ? 0 : -1}
              aria-label={`${info.name}${info.sub ? ` (${info.sub})` : ''}${isEligible ? '. Press Enter to choose this position.' : ''}`}
              onClick={isEligible ? () => onSelect?.(id) : undefined}
              onKeyDown={isEligible ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(id); }
              } : undefined}
            />
            {/* weak-point cracks on the north wall */}
            {z.weak && (
              <path d={`M${z.x + 96},${z.y + 4} l6,${z.h - 8} M${z.x + 150},${z.y + 6} l-5,${z.h - 10} M${z.x + 205},${z.y + 3} l6,${z.h - 6}`}
                    className="wall-crack" aria-hidden="true" />
            )}

            <text x={cx} y={z.y + (z.sub ? z.h / 2 - 3 : z.h / 2 + 4)} textAnchor="middle" className="zone-label">
              {z.label}
            </text>
            {z.sub && (
              <text x={cx} y={z.y + z.h / 2 + 12} textAnchor="middle" className={`zone-sub ${z.weak ? 'weak' : ''}`}>
                {z.weak ? `⚠ ${z.sub}` : z.sub}
              </text>
            )}

            {/* placed markers, in a row along the bottom of the block */}
            {markers.slice(0, 5).map((m, i) => (
              <g key={i} className="marker" transform={`translate(${z.x + 8 + i * 20}, ${z.y + z.h - 20})`} aria-hidden="true">
                <circle cx="11" cy="11" r="11" className="marker-halo" />
                <g className="marker-glyph"><MarkerGlyph marker={m.marker} /></g>
              </g>
            ))}
            {markers.length > 5 && (
              <text x={z.x + z.w - 10} y={z.y + z.h - 6} textAnchor="end" className="zone-sub">+{markers.length - 5}</text>
            )}
          </g>
        );
      })}

      {/* compass */}
      <g transform="translate(404,30)" className="fort-compass" aria-hidden="true">
        <circle r="13" />
        <path d="M0,-10 L3,0 L0,10 L-3,0 Z" />
        <text y="-16" textAnchor="middle">N</text>
      </g>
    </svg>
  );
}

export { MarkerGlyph };
