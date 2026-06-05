import { useState, useEffect } from 'react';
import api from '../../api/client';
import Pill from '../../components/Pill';
import Ico from '../../components/Ico';
import { TI } from '../../theme';
import useInnContact from '../../hooks/useInnContact';

const M = { ink: TI.ink, sub: TI.sub, faint: TI.faint, border: TI.border, accent: TI.accent, surface: '#fff', bg: '#f2f3f7', ui: TI.ui, mono: TI.mono };

export default function Trips({ onBookAgain, isDesktop = false }) {
  const innContact = useInnContact();
  const [bookings, setBookings] = useState([]);
  const [busy, setBusy] = useState(null);
  const [detail, setDetail] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    api.get('/bookings/').then(r => setBookings(r.data.results || r.data));
  }, []);

  const upcoming = bookings.filter(b => b.status !== 'Completed');
  const past = bookings.filter(b => b.status === 'Completed');

  const cancel = async (b) => {
    if (busy) return;
    if (!confirm(`Cancel ${b.booking_id}?`)) return;
    setBusy(b.id);
    try {
      const { data } = await api.post(`/bookings/${b.id}/cancel/`);
      setBookings(list => list.map(x => x.id === b.id ? data : x));
    } catch (e) {
      alert('Cancel failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setBusy(null);
    }
  };

  const submitReview = async (booking, payload) => {
    setBusy(`review-${booking.id}`);
    try {
      const { data } = await api.post(`/bookings/${booking.id}/review/`, payload);
      setBookings(list => list.map(x => x.id === booking.id ? data : x));
      setDetail(cur => cur?.id === booking.id ? data : cur);
      setReviewTarget(null);
    } catch (e) {
      alert('Review failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setBusy(null);
    }
  };

  const Row = (b) => (
    <div key={b.id} onClick={() => setDetail(b)} style={{ background: M.surface, borderRadius: 16, overflow: 'hidden',
      border: `1px solid ${M.border}`, marginBottom: 12, display: 'flex', cursor: 'pointer' }}>
      <div style={{ width: 96, flex: '0 0 96px', background: b.room_grad || TI.accent, position: 'relative', overflow: 'hidden' }}>
        {b.room_image ? (
          <img src={b.room_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Ico name="bed" size={26} color="rgba(255,255,255,.6)"
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        )}
      </div>
      <div style={{ flex: 1, padding: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{b.room_name}</div>
          <Pill status={b.status} />
        </div>
        <div style={{ fontSize: 12.5, color: M.sub, marginTop: 4 }}>{b.check_in} – {b.check_out} · {b.nights} nights</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: 11.5, fontFamily: M.mono, color: M.faint }}>{b.booking_id}</span>
          {b.status === 'Pending' && (
            <button onClick={(e) => { e.stopPropagation(); cancel(b); }} disabled={busy === b.id} style={{ background: 'none', border: `1px solid ${M.border}`, borderRadius: 999,
              padding: '6px 13px', fontSize: 12, fontWeight: 700, color: TI.neg, cursor: busy === b.id ? 'wait' : 'pointer', fontFamily: M.ui }}>
              {busy === b.id ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
          {b.status === 'Confirmed' && (
            <a onClick={(e) => e.stopPropagation()} href={`tel:${innContact.phone.replace(/\s/g, '')}`} style={{ fontSize: 11.5, color: M.accent,
              textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Call {innContact.phone}
            </a>
          )}
          {b.status === 'Completed' && !b.review && (
            <button onClick={(e) => { e.stopPropagation(); setReviewTarget(b); }} style={{ background: 'none', border: `1px solid ${M.border}`, borderRadius: 999,
              padding: '6px 13px', fontSize: 12, fontWeight: 700, color: M.accent, cursor: 'pointer', fontFamily: M.ui }}>Leave review</button>
          )}
          {b.status === 'Completed' && b.review && (
            <button onClick={(e) => { e.stopPropagation(); onBookAgain?.(b.room); }} style={{ background: 'none', border: `1px solid ${M.border}`, borderRadius: 999,
              padding: '6px 13px', fontSize: 12, fontWeight: 700, color: M.accent, cursor: 'pointer', fontFamily: M.ui }}>
              {b.review.rating} star{b.review.rating !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const label = (txt) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: M.sub, textTransform: 'uppercase',
      letterSpacing: .5, marginBottom: 10 }}>{txt}</div>
  );

  return (
    <div style={{ paddingBottom: isDesktop ? 36 : 96, background: M.bg, minHeight: '100%' }}>
      <div style={{ padding: isDesktop ? '26px 28px 14px' : '18px 18px 12px', background: M.surface,
        borderBottom: `1px solid ${M.border}` }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: M.ink }}>My trips</div>
        <div style={{ fontSize: 12, color: M.sub, marginTop: 1 }}>{upcoming.length} upcoming · {past.length} past</div>
      </div>
      <div style={{ padding: isDesktop ? '24px 28px' : '16px 18px', maxWidth: isDesktop ? 1180 : 'none',
        margin: isDesktop ? '0 auto' : 0, display: isDesktop ? 'grid' : 'block',
        gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined, gap: 20 }}>
        <section>
          {label('Upcoming')}
          {upcoming.length > 0 ? upcoming.map(Row) : <div style={{ fontSize: 13, color: M.sub, marginBottom: 16 }}>No upcoming trips.</div>}
        </section>
        <section>
          {label('Past stays')}
          {past.length > 0 ? past.map(Row) : <div style={{ fontSize: 13, color: M.sub }}>No past stays yet.</div>}
        </section>
      </div>
      {detail && (
        <BookingDetail booking={detail} innContact={innContact} onClose={() => setDetail(null)}
          onBookAgain={(roomId) => { setDetail(null); onBookAgain?.(roomId); }}
          onReview={(b) => setReviewTarget(b)} isDesktop={isDesktop} />
      )}
      {reviewTarget && (
        <ReviewModal booking={reviewTarget} busy={busy === `review-${reviewTarget.id}`}
          onClose={() => setReviewTarget(null)} onSubmit={submitReview} isDesktop={isDesktop} />
      )}
    </div>
  );
}

function BookingDetail({ booking, innContact, onClose, onBookAgain, onReview, isDesktop }) {
  const rate = Number(booking.room_price || (booking.nights ? Math.round(Number(booking.amount || 0) / booking.nights) : 0));
  const subtotal = rate * Number(booking.nights || 0);
  const total = Number(booking.amount || subtotal);
  const extra = Math.max(0, total - subtotal);
  const fmt = (n) => `\u20b1${Number(n || 0).toLocaleString()}`;
  const statusColor = booking.status === 'Cancelled' ? TI.neg : booking.status === 'Pending' ? TI.warn : booking.status === 'Confirmed' ? TI.pos : M.sub;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15,23,42,.38)',
      display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center', padding: isDesktop ? 18 : 0 }}>
      <div onClick={e => e.stopPropagation()} className="ti-fade" style={{ width: isDesktop ? 520 : '100%', maxWidth: '100%',
        background: M.surface, borderRadius: isDesktop ? 20 : '22px 22px 0 0', boxShadow: TI.shadowLg,
        overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${M.border}`, display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: M.mono, letterSpacing: 1.2, color: M.faint, textTransform: 'uppercase' }}>Transaction details</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: M.ink, marginTop: 4 }}>{booking.booking_id}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${M.border}`,
            background: M.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="x" size={15} color={M.sub} />
          </button>
        </div>

        <div style={{ padding: 20, display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', gap: 13, alignItems: 'center', padding: 12, borderRadius: 14,
            background: M.bg, border: `1px solid ${M.border}` }}>
            <div style={{ width: 70, height: 62, borderRadius: 12, background: booking.room_grad || M.accent,
              overflow: 'hidden', flex: '0 0 auto' }}>
              {booking.room_image && <img src={booking.room_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: M.ink }}>{booking.room_name}</div>
              <div style={{ fontSize: 12.5, color: M.sub, marginTop: 3 }}>{booking.room_type_name} - {booking.guests_count} guest{booking.guests_count !== 1 ? 's' : ''}</div>
            </div>
            <span style={{ padding: '6px 10px', borderRadius: 999, background: M.bg, color: statusColor,
              fontSize: 12, fontWeight: 800, border: `1px solid ${M.border}` }}>{booking.status}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Info icon="cal" label="Check-in" value={booking.check_in} />
            <Info icon="cal" label="Check-out" value={booking.check_out} />
            <Info icon="clock" label="Nights" value={`${booking.nights} night${booking.nights !== 1 ? 's' : ''}`} />
            <Info icon="user" label="Guests" value={`${booking.guests_count} guest${booking.guests_count !== 1 ? 's' : ''}`} />
          </div>

          <div style={{ borderRadius: 14, border: `1px solid ${M.border}`, overflow: 'hidden' }}>
            <MoneyRow label={`${fmt(rate)} x ${booking.nights} night${booking.nights !== 1 ? 's' : ''}`} value={fmt(subtotal)} />
            {extra > 0 && <MoneyRow label="Fees / adjustments" value={fmt(extra)} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 14px',
              background: TI.accentSoft, color: M.ink, fontSize: 16, fontWeight: 900 }}>
              <span>Total paid / payable</span><span>{fmt(total)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 12, borderRadius: 14,
            background: M.bg, border: `1px solid ${M.border}` }}>
            <Ico name="phone" size={17} color={M.accent} />
            <div style={{ flex: 1, fontSize: 12.5, color: M.sub }}>Need help with this booking?</div>
            <a href={`tel:${innContact.phone.replace(/\s/g, '')}`} style={{ color: M.accent, fontSize: 12.5,
              fontWeight: 800, textDecoration: 'none' }}>{innContact.phone}</a>
          </div>

          {booking.status === 'Completed' && booking.review && (
            <div style={{ padding: 13, borderRadius: 14, background: M.bg, border: `1px solid ${M.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: M.ink, fontSize: 13.5, fontWeight: 800 }}>
                <Ico name="star" size={15} color="#f59e0b" /> Your review: {booking.review.rating} star{booking.review.rating !== 1 ? 's' : ''}
              </div>
              {booking.review.comment && (
                <div style={{ marginTop: 7, color: M.sub, fontSize: 13, lineHeight: 1.45 }}>{booking.review.comment}</div>
              )}
            </div>
          )}

          {booking.status === 'Completed' && !booking.review && (
            <button onClick={() => onReview(booking)} style={{ height: 42, borderRadius: 999,
              border: 'none', background: M.accent, color: '#fff', fontFamily: M.ui,
              fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Leave a review</button>
          )}

          {booking.status === 'Completed' && (
            <button onClick={() => onBookAgain(booking.room)} style={{ height: 42, borderRadius: 999,
              border: `1px solid ${M.border}`, background: M.surface, color: M.accent, fontFamily: M.ui,
              fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Book this room again</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ booking, busy, onClose, onSubmit, isDesktop }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 95, background: 'rgba(15,23,42,.42)',
      display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center', padding: isDesktop ? 18 : 0 }}>
      <div onClick={e => e.stopPropagation()} className="ti-fade" style={{ width: isDesktop ? 460 : '100%', maxWidth: '100%',
        background: M.surface, borderRadius: isDesktop ? 20 : '22px 22px 0 0', boxShadow: TI.shadowLg, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: M.mono, letterSpacing: 1.2, color: M.faint, textTransform: 'uppercase' }}>Room review</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: M.ink, marginTop: 4 }}>{booking.room_name}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${M.border}`,
            background: M.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="x" size={15} color={M.sub} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)} style={{ width: 42, height: 42, borderRadius: 12,
              border: `1px solid ${n <= rating ? '#f59e0b' : M.border}`, background: n <= rating ? '#fffbeb' : M.surface,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="star" size={20} color={n <= rating ? '#f59e0b' : M.faint} />
            </button>
          ))}
        </div>

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: M.ink, marginBottom: 7 }}>Comment</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
          placeholder="Share what future guests should know about this room."
          style={{ width: '100%', resize: 'vertical', border: `1px solid ${M.border}`, borderRadius: 14,
            padding: 12, fontFamily: M.ui, fontSize: 13.5, color: M.ink, outline: 'none', background: M.bg }} />

        <button disabled={busy} onClick={() => onSubmit(booking, { rating, comment })} style={{ width: '100%', height: 44,
          marginTop: 14, border: 'none', borderRadius: 999, background: M.accent, color: '#fff',
          fontFamily: M.ui, fontSize: 14, fontWeight: 900, cursor: busy ? 'wait' : 'pointer', opacity: busy ? .75 : 1 }}>
          {busy ? 'Saving review...' : 'Submit review'}
        </button>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div style={{ padding: 12, borderRadius: 13, background: M.bg, border: `1px solid ${M.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: M.sub, fontSize: 11, textTransform: 'uppercase',
        letterSpacing: .5, fontWeight: 700 }}>
        <Ico name={icon} size={13} color={M.faint} />{label}
      </div>
      <div style={{ marginTop: 6, color: M.ink, fontSize: 14, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function MoneyRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 14px',
      borderBottom: `1px solid ${M.border}`, color: TI.ink2, fontSize: 13.5 }}>
      <span>{label}</span><span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  );
}
