import { TI, STATUS_STYLES } from '../theme';

export default function Pill({ status, label }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Completed;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
      borderRadius: 999, background: s.bg, color: s.ink, fontSize: 11.5, fontWeight: 700, fontFamily: TI.ui }}>
      <span style={{ width: 6, height: 6, borderRadius: 4, background: s.dot }} />
      {label || status}
    </span>
  );
}
