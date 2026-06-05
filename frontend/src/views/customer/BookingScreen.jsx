import { useState, useEffect } from 'react';
import api from '../../api/client';
import Ico from '../../components/Ico';
import Btn from '../../components/Btn';
import { TI } from '../../theme';

const M = { ink: TI.ink, sub: TI.sub, faint: TI.faint, border: TI.border, accent: TI.accent, surface: '#fff', bg: '#f2f3f7', ui: TI.ui };
const peso = (n) => `\u20b1${Number(n).toLocaleString()}`;
const SERVICE_FEE = 850;
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

function DateSheet({ dates, setDates, today, onClose }) {
  const updateDate = (key, value) => {
    setDates(d => {
      const next = { ...d, [key]: value };
      if (key === 'in') {
        if (next.in < today) next.in = today;
        if (!next.out || diffDays(next.in, next.out) <= 0) next.out = addDays(next.in, 1);
      } else if (key === 'out' && diffDays(next.in, next.out) <= 0) {
        next.out = addDays(next.in, 1);
      }
      return next;
    });
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(15,23,42,.35)', display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} className="ti-fade" style={{ width: '100%', background: M.surface,
        borderRadius: '22px 22px 0 0', padding: '18px 18px 28px', boxShadow: TI.shadowLg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: M.ink }}>Edit dates</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999,
            border: `1px solid ${M.border}`, background: M.surface, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="x" size={15} color={M.sub} />
          </button>
        </div>
        <DateInput label="Check-in" value={dates.in} min={today} onChange={v => updateDate('in', v)} />
        <DateInput label="Check-out" value={dates.out} min={dates.in ? addDays(dates.in, 1) : addDays(today, 1)} onChange={v => updateDate('out', v)} />
        <button onClick={onClose} style={{ width: '100%', marginTop: 16, height: 42,
          border: 'none', borderRadius: 999, background: M.accent, color: '#fff',
          fontFamily: M.ui, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Apply</button>
      </div>
    </div>
  );
}

function DateInput({ label, value, min, onChange }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: M.ink, marginBottom: 6 }}>{label}</span>
      <input type="date" value={value} min={min} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', height: 40, border: `1px solid ${M.border}`, borderRadius: 10,
          background: M.bg, padding: '0 11px', fontFamily: M.ui, fontSize: 13, boxSizing: 'border-box' }} />
    </label>
  );
}

export default function BookingScreen({ id, dates: initialDates, onBack, onConfirm, isDesktop = false }) {
  const [room, setRoom] = useState(null);
  const [guests, setGuests] = useState(2);
  const [nightCount, setNightCount] = useState(4);
  const [saving, setSaving] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [pendingDuplicate, setPendingDuplicate] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const today = dateOnly();
  const [dates, setDates] = useState(() => ({
    in: initialDates?.in && initialDates.in >= today ? initialDates.in : '',
    out: initialDates?.out || '',
  }));

  useEffect(() => {
    api.get('/booking-options/').then(r => {
      setDates(current => {
        if (current.in && current.out && diffDays(current.in, current.out) > 0) return current;
        return r.data.default_dates;
      });
    });
    api.get(`/bookings/?room=${id}&status=Pending`)
      .then(r => {
        const list = r.data.results || r.data;
        setPendingDuplicate(list.some(b => b.status === 'Pending' && Number(b.room) === Number(id)));
      })
      .catch(() => setPendingDuplicate(false));
  }, [id]);

  useEffect(() => {
    const query = dates.in && dates.out ? `?check_in=${dates.in}&check_out=${dates.out}` : '';
    api.get(`/rooms/${id}/${query}`).then(r => {
      setRoom(r.data);
      setUnavailable(r.data.available === false);
    });
  }, [id, dates.in, dates.out]);

  useEffect(() => {
    if (!dates.in || !dates.out) return;
    const diff = diffDays(dates.in, dates.out);
    if (diff > 0 && diff !== nightCount) setNightCount(Math.min(30, diff));
  }, [dates.in, dates.out, nightCount]);

  if (!room) return <div style={{ padding: 40, color: TI.sub, fontFamily: TI.ui }}>Loading...</div>;

  const nights = nightCount;
  const sub = room.price * nights;
  const fee = SERVICE_FEE;
  const total = sub + fee;
  const hasInvalidPastDate = Boolean(dates.in && dates.in < today);
  const hasInvalidRange = Boolean(dates.in && dates.out && diffDays(dates.in, dates.out) <= 0);
  const fmt = (v) => v ? new Date(`${v}T00:00:00`).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Loading';
  const setNights = (value) => {
    if (!dates.in) return;
    const next = Math.max(1, Math.min(30, value));
    setNightCount(next);
    setDates(d => ({ ...d, out: addDays(d.in, next) }));
  };

  const confirm = async () => {
    if (hasInvalidPastDate || hasInvalidRange) return;
    if (pendingDuplicate) return;
    if (unavailable) return;
    if (saving) return;
    if (!dates.in || !dates.out) return;
    setSaving(true);
    try {
      const { data } = await api.post('/bookings/', {
        room: id,
        check_in: dates.in,
        check_out: dates.out,
        nights,
        guests_count: guests,
        amount: total,
      });
      onConfirm({
        room,
        guests,
        total: data.amount ?? total,
        nights: data.nights ?? nights,
        booking_id: data.booking_id,
        check_in: data.check_in ?? dates.in,
        check_out: data.check_out ?? dates.out,
      });
    } catch (e) {
      alert('Booking failed: ' + (e.response?.data?.detail || e.message));
      if (e.response?.data?.detail?.includes('pending reservation')) setPendingDuplicate(true);
      if (e.response?.data?.detail?.includes('unavailable')) setUnavailable(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: M.bg, minHeight: '100%', paddingBottom: isDesktop ? 0 : 178 }}>
      <div style={{ padding: isDesktop ? '18px 28px' : '16px 18px 12px', background: M.surface,
        borderBottom: `1px solid ${M.border}`, display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 8 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${M.border}`,
          background: M.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <Ico name="chevL" size={18} color={M.ink} sw={2.2} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: M.ink, letterSpacing: '-0.02em' }}>Confirm &amp; book</div>
        </div>
      </div>

      <div style={{ padding: isDesktop ? '24px 28px' : '16px 18px', display: 'grid',
        gridTemplateColumns: isDesktop ? '1.1fr .9fr' : '1fr', gap: 14, maxWidth: isDesktop ? 980 : 'none',
        margin: isDesktop ? '0 auto' : 0 }}>
        <div style={{ display: 'flex', gap: 13, background: M.surface, borderRadius: 16, padding: 12, border: `1px solid ${M.border}` }}>
          <div style={{ width: 70, height: 70, borderRadius: 12, background: room.gradient_css || TI.accent,
            flex: '0 0 70px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', position: 'relative' }}>
            {room.image_url ? (
              <img src={room.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Ico name="bed" size={28} color="rgba(255,255,255,.7)" sw={1.3} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{room.name}</div>
            <div style={{ fontSize: 12.5, color: M.sub, marginTop: 2 }}>{room.room_type_name} - sleeps {room.capacity}</div>
          </div>
        </div>

        <div style={{ background: M.surface, borderRadius: 16, padding: 16, border: `1px solid ${M.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Your trip</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${M.border}` }}>
            <div><div style={{ fontSize: 12, color: M.sub }}>Check-in</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{fmt(dates.in)}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, color: M.sub }}>Check-out</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{fmt(dates.out)}</div></div>
            <button onClick={() => setDateOpen(true)} style={{ background: 'none', border: 'none', color: M.accent, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: M.ui }}>Edit</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
            <div><div style={{ fontSize: 12, color: M.sub }}>Guests</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{guests} {guests > 1 ? 'guests' : 'guest'}</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setGuests(g => Math.max(1, g - 1))} style={stepBtn}>-</button>
              <span style={{ fontSize: 16, fontWeight: 700, width: 18, textAlign: 'center' }}>{guests}</span>
              <button onClick={() => setGuests(g => Math.min(room.capacity, g + 1))} style={stepBtn}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 12,
            borderTop: `1px solid ${M.border}` }}>
            <div><div style={{ fontSize: 12, color: M.sub }}>Nights</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{nights} night{nights !== 1 ? 's' : ''}</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setNights(nights - 1)} style={stepBtn}>-</button>
              <span style={{ fontSize: 16, fontWeight: 700, width: 18, textAlign: 'center' }}>{nights}</span>
              <button onClick={() => setNights(nights + 1)} style={stepBtn}>+</button>
            </div>
          </div>
        </div>

        <div style={{ background: M.surface, borderRadius: 16, padding: 16, border: `1px solid ${M.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Price details</div>
          {[[`${peso(room.price)} x ${nights} nights`, peso(sub)], ['Service fee', peso(fee)]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: TI.ink2, padding: '5px 0' }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: M.ink,
            paddingTop: 11, marginTop: 6, borderTop: `1px solid ${M.border}` }}>
            <span>Total</span><span>{peso(total)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '0 4px' }}>
          <Ico name="shield" size={16} color={M.sub} style={{ flex: '0 0 auto', marginTop: 1 }} />
          <span style={{ fontSize: 12, color: M.sub, lineHeight: 1.5 }}>
            {hasInvalidPastDate ? (
              <>Check-in date cannot be in the past. Please choose today or a future date.</>
            ) : hasInvalidRange ? (
              <>Check-out must be after check-in. Please choose valid dates.</>
            ) : unavailable ? (
              <>This room is already booked for the selected dates. Please choose a different room or dates.</>
            ) : pendingDuplicate ? (
              <>You already have a <b style={{ color: M.ink }}>Pending</b> reservation for this room. You can still book a different room.</>
            ) : (
              <>Your booking will be <b style={{ color: M.ink }}>Pending</b> until the inn confirms it - usually within a few hours.
              Free cancellation up to 48h before check-in.</>
            )}
          </span>
        </div>
      </div>

      <div style={{ position: isDesktop ? 'sticky' : 'fixed', bottom: isDesktop ? 0 : 76, left: 0, right: 0, padding: isDesktop ? '16px 28px' : '12px 18px',
        background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${M.border}`, zIndex: 30, maxWidth: isDesktop ? 980 : 'none',
        margin: isDesktop ? '0 auto' : 0 }}>
        <Btn size="lg" full onClick={confirm} disabled={saving || pendingDuplicate || unavailable || hasInvalidPastDate || hasInvalidRange}>
          {hasInvalidPastDate ? 'Choose a future date' : hasInvalidRange ? 'Fix dates' : unavailable ? 'Unavailable' : pendingDuplicate ? 'Already pending' : saving ? 'Sending...' : 'Confirm reservation'}
        </Btn>
      </div>

      {dateOpen && <DateSheet dates={dates} setDates={setDates} today={today} onClose={() => setDateOpen(false)} />}
    </div>
  );
}

const stepBtn = { width: 34, height: 34, borderRadius: 999, border: `1px solid ${M.border}`,
  background: M.surface, cursor: 'pointer', fontSize: 18, color: M.ink };
