import Btn from '../../components/Btn';
import Ico from '../../components/Ico';
import { TI } from '../../theme';

const M = { ink: TI.ink, sub: TI.sub, surface: '#fff', bg: '#f2f3f7', mono: TI.mono, ui: TI.ui };
const peso = (n) => `₱${Number(n).toLocaleString()}`;

export default function Success({ booking, onDone }) {
  return (
    <div style={{ background: M.surface, minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
      <div className="ti-fade" style={{ width: 84, height: 84, borderRadius: 999, background: TI.posSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <div style={{ width: 60, height: 60, borderRadius: 999, background: TI.pos,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ico name="check" size={32} color="#fff" sw={2.6} />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: M.ink, letterSpacing: '-0.02em' }}>Request sent!</div>
      <div style={{ fontSize: 14.5, color: M.sub, marginTop: 10, lineHeight: 1.5 }}>
        Your reservation for <b style={{ color: M.ink }}>{booking.room?.name}</b> is{' '}
        <b style={{ color: TI.warn }}>Pending</b>. We'll notify you once the inn confirms — usually within a few hours.
      </div>
      <div style={{ width: '100%', background: M.bg, borderRadius: 16, padding: 16, margin: '24px 0', textAlign: 'left' }}>
        {[
          ['Booking ID', booking.booking_id || 'BK-3392'],
          ['Dates', `Jun 14 – 18 · ${booking.nights} nights`],
          ['Total', peso(booking.total)],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
            <span style={{ color: M.sub }}>{k}</span>
            <span style={{ fontFamily: M.mono, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
      <Btn size="lg" full onClick={onDone}>View my trips</Btn>
    </div>
  );
}
