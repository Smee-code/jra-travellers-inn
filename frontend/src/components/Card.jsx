import { TI } from '../theme';

export default function Card({ children, style = {}, pad = 20, onClick, hover }) {
  return (
    <div onClick={onClick} className={hover ? 'ti-card-h' : ''} style={{
      background: TI.surface, border: `1px solid ${TI.border}`,
      borderRadius: TI.radius, boxShadow: TI.shadow, padding: pad, ...style,
    }}>{children}</div>
  );
}
