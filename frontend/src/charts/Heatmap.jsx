import { useState } from 'react';
import { TI } from '../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LOW    = [0xee, 0xf2, 0xff];
const HIGH   = [0x43, 0x38, 0xca];

function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
function heatColor(v) {
  return `rgb(${lerp(LOW[0], HIGH[0], v)},${lerp(LOW[1], HIGH[1], v)},${lerp(LOW[2], HIGH[2], v)})`;
}

function Cell({ v, month, week }) {
  const [hov, setHov] = useState(false);
  const pct = Math.round(v * 100);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 34, borderRadius: 7,
        background: heatColor(v),
        position: 'relative',
        transform: hov ? 'scaleY(1.08)' : 'none',
        transition: 'transform .12s',
        cursor: 'default',
      }}
    >
      {hov && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)',
          background: TI.ink, color: '#fff', borderRadius: 6,
          padding: '5px 9px', fontSize: 11.5, fontFamily: TI.mono,
          whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
          boxShadow: TI.shadowMd,
        }}>
          {MONTHS[month]} wk{week + 1} — {pct}%
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: `5px solid ${TI.ink}`,
          }} />
        </div>
      )}
    </div>
  );
}

export default function Heatmap({ matrix }) {
  if (!matrix) return null;

  const WEEK_LABELS = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'];
  // Column layout: 44px month label + 5 equal-width week columns
  const cols = '44px repeat(5, 1fr)';

  return (
    <div style={{ width: '100%' }}>
      {/* Week column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 6, marginBottom: 6 }}>
        <div />
        {WEEK_LABELS.map(w => (
          <div key={w} style={{
            fontSize: 10.5, fontWeight: 600, color: TI.faint,
            fontFamily: TI.mono, textAlign: 'center', letterSpacing: .5,
          }}>
            {w}
          </div>
        ))}
      </div>

      {/* Heatmap rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {matrix.map((row, m) => (
          <div key={m} style={{ display: 'grid', gridTemplateColumns: cols, gap: 6, alignItems: 'center' }}>
            <span style={{
              fontSize: 11.5, fontWeight: 500, color: TI.sub,
              fontFamily: TI.ui, textAlign: 'right', paddingRight: 8,
            }}>
              {MONTHS[m]}
            </span>
            {row.map((v, w) => <Cell key={w} v={v} month={m} week={w} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
