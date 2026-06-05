import { TI } from '../theme';

export default function Avatar({ name = '', size = 38, bg = TI.accentSoft, color = TI.accent }) {
  const init = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: size, background: bg, color,
      flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, fontFamily: TI.ui }}>{init}</div>
  );
}
