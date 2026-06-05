import { TI } from '../theme';

export default function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} style={{ width: 40, height: 23, borderRadius: 999, border: 'none',
      cursor: 'pointer', background: on ? TI.accent : '#cbd5e1', position: 'relative',
      transition: 'background .18s', flex: '0 0 auto' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 20 : 3, width: 17, height: 17,
        borderRadius: 999, background: '#fff', transition: 'left .18s',
        boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
    </button>
  );
}
