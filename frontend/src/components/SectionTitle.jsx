import { TI } from '../theme';

export default function SectionTitle({ kicker, title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
      <div>
        {kicker && <div style={{ fontSize: 11.5, fontFamily: TI.mono, letterSpacing: 1.5, color: TI.accent,
          textTransform: 'uppercase', marginBottom: 6 }}>{kicker}</div>}
        <h1 style={{ margin: 0, fontFamily: TI.ui, fontSize: 27, fontWeight: 800, color: TI.ink,
          letterSpacing: '-0.02em', lineHeight: 1.05 }}>{title}</h1>
        {sub && <div style={{ fontSize: 13, color: TI.sub, marginTop: 7, fontFamily: TI.ui }}>{sub}</div>}
      </div>
      {right && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{right}</div>}
    </div>
  );
}
