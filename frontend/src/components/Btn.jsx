import Ico from './Ico';
import { TI } from '../theme';

const VARIANTS = {
  primary:     { background: TI.accent, color: '#fff', border: `1px solid ${TI.accent}`, boxShadow: '0 1px 2px rgba(79,70,229,.25)' },
  outline:     { background: TI.surface, color: TI.ink, border: `1px solid ${TI.border}` },
  ghost:       { background: 'transparent', color: TI.ink2, border: '1px solid transparent' },
  soft:        { background: TI.accentSoft, color: TI.accent, border: '1px solid transparent' },
  danger:      { background: TI.negSoft, color: TI.neg, border: `1px solid ${TI.neg}22` },
  dangerSolid: { background: TI.neg, color: '#fff', border: `1px solid ${TI.neg}` },
};
const SIZES = {
  sm: { p: '7px 12px', fs: 12.5, gap: 6, ic: 14 },
  md: { p: '10px 16px', fs: 13.5, gap: 8, ic: 16 },
  lg: { p: '13px 22px', fs: 15, gap: 9, ic: 18 },
};

export default function Btn({ variant = 'primary', size = 'md', icon, iconRight, children, onClick, style = {}, full, disabled }) {
  const s = SIZES[size];
  return (
    <button onClick={onClick} disabled={disabled} className="ti-btn" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap,
      padding: s.p, fontSize: s.fs, fontWeight: 600, fontFamily: TI.ui, borderRadius: 999,
      cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
      width: full ? '100%' : 'auto', opacity: disabled ? 0.6 : 1,
      ...VARIANTS[variant], ...style,
    }}>
      {icon && <Ico name={icon} size={s.ic} sw={2} />}
      {children}
      {iconRight && <Ico name={iconRight} size={s.ic} sw={2} />}
    </button>
  );
}
