import { useState, useEffect } from 'react';
import api from '../../api/client';
import Ico from '../../components/Ico';
import BrandMark from '../../components/BrandMark';
import { TI } from '../../theme';

const M = { ink: TI.ink, sub: TI.sub, faint: TI.faint, border: TI.border, accent: TI.accent, surface: '#fff', bg: '#f2f3f7', ui: TI.ui, mono: TI.mono };
const peso = (n) => `\u20b1${Number(n).toLocaleString()}`;
const dateOnly = (date = new Date()) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const addDays = (value, days) => {
  const d = new Date(`${value}T00:00:00`);
  d.setDate(d.getDate() + days);
  return dateOnly(d);
};
const diffDays = (start, end) => {
  if (!start || !end) return 0;
  return Math.round((new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000);
};

function Stars({ rating, reviews }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
      <span style={{ fontSize: 12, fontWeight: 700, color: M.ink }}>{rating}</span>
      {reviews != null && <span style={{ fontSize: 12, color: M.sub }}>({reviews})</span>}
    </span>
  );
}

function Sheet({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(15,23,42,.35)', padding: '18px', display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center' }}>
      <div className="ti-fade" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520,
        background: M.surface, borderRadius: 18, padding: 18, boxShadow: TI.shadowLg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: M.ink }}>{title}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, border: `1px solid ${M.border}`,
            background: M.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="x" size={15} color={M.sub} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Stepper({ value, min, max, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={stepBtn}>-</button>
      <span style={{ width: 18, textAlign: 'center', fontWeight: 800 }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={stepBtn}>+</button>
    </div>
  );
}

function Notice({ icon, text }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '11px 0', borderTop: `1px solid ${M.border}` }}>
      <Ico name={icon} size={17} color={M.accent} />
      <span style={{ fontSize: 13, color: M.ink, lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

export default function Explore({ onOpen, isDesktop = false }) {
  const [rooms, setRooms] = useState([]);
  const [type, setType] = useState('');
  const [filters, setFilters] = useState([]);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [guests, setGuests] = useState(2);
  const [dates, setDates] = useState({ in: '', out: '' });
  const today = dateOnly();

  useEffect(() => {
    api.get('/booking-options/').then(r => {
      setDates(r.data.default_dates);
      setFilters(r.data.room_filters || []);
    });
  }, []);

  useEffect(() => {
    if (!dates.in || !dates.out) return;
    if (dates.in < today || diffDays(dates.in, dates.out) <= 0) return;
    api.get(`/rooms/?check_in=${dates.in}&check_out=${dates.out}`).then(r => setRooms(r.data.results || r.data));
  }, [dates.in, dates.out, today]);

  const filtered = rooms.filter(r => !type || r.room_type_name === type);
  const dateLabel = dates.in && dates.out
    ? `${new Date(dates.in).toLocaleString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dates.out).toLocaleString('en-US', { day: 'numeric' })}`
    : 'Loading dates';

  return (
    <div style={{ paddingBottom: isDesktop ? 36 : 96, maxWidth: isDesktop ? 1180 : 'none', margin: isDesktop ? '0 auto' : 0 }}>
      <div style={{ padding: isDesktop ? '26px 28px 14px' : '16px 18px 12px', background: M.surface, display: 'flex', alignItems: 'center', gap: 11,
        borderBottom: isDesktop ? `1px solid ${M.border}` : 'none' }}>
        <BrandMark size={44} radius={12} iconSize={23} style={{ boxShadow: '0 3px 10px rgba(79,70,229,.3)' }} />
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.15 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: M.ink }}>Traveller's Inn</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: M.sub }}>
            <Ico name="pin" size={12} color={M.faint} />12 Seaside Avenue - by the bay
          </div>
        </div>
        <button onClick={() => setNoticeOpen(true)} style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${M.border}`,
          background: M.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative' }}>
          <Ico name="bell" size={17} color={M.ink} />
          <span style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, background: TI.neg, border: '1.5px solid #fff' }} />
        </button>
      </div>

      <div style={{ padding: isDesktop ? '24px 28px 0' : '4px 18px 0' }}>
        <div style={{ position: 'relative', height: isDesktop ? 260 : 168, borderRadius: isDesktop ? 10 : 20, overflow: 'hidden',
          background: '#1e293b' }}>
          <img src="/landing-hero.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%',
            height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,.08) 0%, rgba(15,23,42,.24) 42%, rgba(15,23,42,.72) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
              background: 'rgba(255,255,255,.95)', borderRadius: 999, padding: '4px 10px', marginBottom: 9 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
              <span style={{ fontSize: 12, fontWeight: 800, color: M.ink }}>4.8</span>
              <span style={{ fontSize: 12, color: M.sub }}>- 369 reviews</span>
            </div>
            <div style={{ fontSize: 23, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Your stay by the bay</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.92)', marginTop: 3 }}>One inn - 36 rooms - book direct, no middleman</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: isDesktop ? '16px 28px 0' : '14px 18px 0' }}>
        <button onClick={() => setTripOpen(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', height: 46,
          background: M.surface, borderRadius: 12, border: `1px solid ${M.border}`, cursor: 'pointer', fontFamily: M.ui, textAlign: 'left' }}>
          <Ico name="cal" size={17} color={M.accent} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 9.5, color: M.sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Dates</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: M.ink }}>{dateLabel}</div>
          </div>
        </button>
        <button onClick={() => setTripOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', height: 46,
          background: M.surface, borderRadius: 12, border: `1px solid ${M.border}`, cursor: 'pointer', fontFamily: M.ui, textAlign: 'left' }}>
          <Ico name="user" size={17} color={M.accent} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 9.5, color: M.sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Guests</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: M.ink }}>{guests}</div>
          </div>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: isDesktop ? '16px 28px 4px' : '14px 18px 4px', overflowX: 'auto' }}>
        {filters.map(t => (
          <button key={t.value} onClick={() => setType(t.value)} style={{ flex: '0 0 auto', padding: '8px 15px', borderRadius: 999,
            border: `1px solid ${t.value === type ? M.accent : M.border}`,
            background: t.value === type ? M.accent : M.surface, color: t.value === type ? '#fff' : M.ink,
            fontSize: 13, fontWeight: 600, fontFamily: M.ui, cursor: 'pointer' }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: isDesktop ? '18px 28px 0' : '10px 18px 0' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: M.ink, letterSpacing: '-0.02em' }}>Our rooms</div>
        <div style={{ fontSize: 12.5, color: M.sub }}>{filtered.length} available - {dateLabel}</div>
      </div>

      <div style={{ display: isDesktop ? 'grid' : 'flex', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
        flexDirection: 'column', gap: 16, padding: isDesktop ? '18px 28px' : '14px 18px' }}>
        {filtered.map(r => (
          <div key={r.id} onClick={() => onOpen(r.id, dates)} style={{ background: M.surface, borderRadius: 18,
            overflow: 'hidden', border: `1px solid ${r.available ? M.border : '#fecaca'}`,
            boxShadow: '0 2px 10px rgba(15,23,42,.05)', cursor: 'pointer',
            opacity: r.available ? 1 : .72 }}>
            <div style={{ height: isDesktop ? 180 : 150, background: r.gradient_css || TI.accent, position: 'relative', overflow: 'hidden' }}>
              {r.image_url && <img src={r.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              <div style={{ position: 'absolute', inset: 0, background: r.image_url
                ? 'linear-gradient(180deg, rgba(15,23,42,.05), rgba(15,23,42,.18))'
                : 'radial-gradient(120% 80% at 75% 15%, rgba(255,255,255,.35), transparent 55%)' }} />
              {!r.image_url && (
                <Ico name="bed" size={40} color="rgba(255,255,255,.55)" sw={1.2}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)' }} />
              )}
              {!r.available && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,.48)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ padding: '7px 12px', borderRadius: 999, background: '#fff',
                    color: TI.neg, fontSize: 12.5, fontWeight: 800 }}>Unavailable</span>
                </div>
              )}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: M.ink }}>{r.name}</div>
                  <div style={{ fontSize: 12.5, color: M.sub, marginTop: 2 }}>{r.room_type_name} - sleeps {r.capacity}</div>
                </div>
                {r.available ? <Stars rating={r.rating} reviews={r.reviews} /> : (
                  <span style={{ fontSize: 12, fontWeight: 800, color: TI.neg }}>Unavailable</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(r.amenities || []).slice(0, 4).map(a => <Ico key={a} name={a} size={16} color={M.faint} />)}
                </div>
                <div><span style={{ fontSize: 18, fontWeight: 800, color: M.ink }}>{peso(r.price)}</span><span style={{ fontSize: 12, color: M.sub }}> /night</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {noticeOpen && (
        <Sheet title="Notifications" onClose={() => setNoticeOpen(false)}>
          <Notice icon="check" text="Booking requests appear in Trips after you reserve." />
          <Notice icon="bell" text="Confirmed, cancelled, and rejected reservations are shown in Trips." />
        </Sheet>
      )}

      {tripOpen && (
        <Sheet title="Edit search" onClose={() => setTripOpen(false)}>
          <label style={labelStyle}>Check-in</label>
          <input type="date" min={today} value={dates.in} onChange={e => setDates(d => {
            const nextIn = e.target.value < today ? today : e.target.value;
            return { ...d, in: nextIn, out: !d.out || diffDays(nextIn, d.out) <= 0 ? addDays(nextIn, 1) : d.out };
          })} style={inputStyle} />
          <label style={{ ...labelStyle, marginTop: 12 }}>Check-out</label>
          <input type="date" min={dates.in ? addDays(dates.in, 1) : addDays(today, 1)} value={dates.out} onChange={e => setDates(d => ({
            ...d,
            out: diffDays(d.in, e.target.value) <= 0 ? addDays(d.in || today, 1) : e.target.value,
          }))} style={inputStyle} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: M.ink }}>Guests</span>
            <Stepper value={guests} min={1} max={8} onChange={setGuests} />
          </div>
          <button onClick={() => setTripOpen(false)} style={primaryBtn}>Apply</button>
        </Sheet>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: M.ink, marginBottom: 6 };
const inputStyle = { width: '100%', height: 40, border: `1px solid ${M.border}`, borderRadius: 10,
  background: M.bg, padding: '0 11px', fontFamily: M.ui, fontSize: 13, boxSizing: 'border-box' };
const primaryBtn = { width: '100%', marginTop: 18, height: 42, border: 'none', borderRadius: 999,
  background: M.accent, color: '#fff', fontFamily: M.ui, fontSize: 14, fontWeight: 800, cursor: 'pointer' };
const stepBtn = { width: 34, height: 34, borderRadius: 999, border: `1px solid ${M.border}`,
  background: M.surface, cursor: 'pointer', fontSize: 18, color: M.ink };
