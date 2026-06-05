import Ico from './Ico';
import { TI } from '../theme';

export default function Field({ label, value, placeholder, icon, type = 'text', onChange, style }) {
  return (
    <label style={{ display: 'block', ...style }}>
      {label && <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TI.ink2, marginBottom: 7, fontFamily: TI.ui }}>{label}</span>}
      <span style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', height: 42,
        background: TI.surfaceAlt, border: `1px solid ${TI.border}`, borderRadius: TI.radiusSm }}>
        {icon && <Ico name={icon} size={16} color={TI.faint} />}
        <input type={type} value={value} placeholder={placeholder} onChange={onChange} style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          fontSize: 14, color: TI.ink, fontFamily: TI.ui, minWidth: 0 }} />
      </span>
    </label>
  );
}
