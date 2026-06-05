import { useState, useEffect } from 'react';
import api from '../../api/client';
import Ico from '../../components/Ico';
import Btn from '../../components/Btn';
import { TI } from '../../theme';

const M = { ink: TI.ink, sub: TI.sub, faint: TI.faint, border: TI.border, accent: TI.accent, surface: '#fff', bg: '#f2f3f7', ui: TI.ui };
const peso = (n) => `₱${Number(n).toLocaleString()}`;
const AMENITY_LABELS = { wifi: 'Free Wi-Fi', ac: 'Air conditioning', tv: 'Smart TV', coffee: 'Coffee bar', bath: 'Rain shower', parking: 'Free parking' };
const diffDays = (start, end) => {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000));
};
const formatRange = (start, end) => {
  if (!start || !end) return 'Select dates';
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const first = a.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const second = b.toLocaleString('en-US', sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' });
  return `${first}-${second}`;
};

function Stars({ rating, reviews }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
      <span style={{ fontSize: 13, fontWeight: 700, color: M.ink }}>{rating}</span>
      {reviews != null && <span style={{ fontSize: 13, color: M.sub }}>({reviews})</span>}
    </span>
  );
}

export default function RoomDetail({ id, dates, onBack, onReserve, isDesktop = false }) {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const qs = dates?.in && dates?.out ? `?check_in=${dates.in}&check_out=${dates.out}` : '';
    api.get(`/rooms/${id}/${qs}`).then(r => setRoom(r.data));
  }, [id, dates?.in, dates?.out]);

  if (!room) return <div style={{ padding: 40, color: TI.sub, fontFamily: TI.ui }}>Loading…</div>;
  const selectedNights = diffDays(dates?.in, dates?.out) || 1;

  return (
    <div style={{ paddingBottom: isDesktop ? 0 : 178, background: M.bg, minHeight: '100%', maxWidth: isDesktop ? 1180 : 'none',
      margin: isDesktop ? '0 auto' : 0 }}>
      {/* photo */}
      <div style={{ height: isDesktop ? 420 : 280, margin: isDesktop ? '28px 28px 0' : 0,
        borderRadius: isDesktop ? 10 : 0, background: room.gradient_css || TI.accent, position: 'relative', overflow: 'hidden' }}>
        {room.image_url && <img src={room.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: room.image_url
          ? 'linear-gradient(180deg, rgba(15,23,42,.05), rgba(15,23,42,.22))'
          : 'radial-gradient(120% 80% at 75% 15%, rgba(255,255,255,.35), transparent 55%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(15,23,42,.28))' }} />
        {!room.image_url && (
          <Ico name="bed" size={72} color="rgba(255,255,255,.4)" sw={1.1}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)' }} />
        )}
        <button onClick={onBack} style={{ position: 'absolute', top: isDesktop ? 18 : 16, left: 16, width: 38, height: 38,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,.9)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <Ico name="chevL" size={19} color={M.ink} sw={2.2} />
        </button>
      </div>

      {/* content card */}
      <div style={{ background: M.surface, borderRadius: isDesktop ? 10 : '22px 22px 0 0', margin: isDesktop ? '18px 28px 0' : '-22px 0 0',
        position: 'relative', padding: isDesktop ? '26px 28px' : '20px 18px', border: isDesktop ? `1px solid ${M.border}` : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: M.ink, letterSpacing: '-0.02em' }}>{room.name}</div>
            <div style={{ fontSize: 13, color: M.sub, marginTop: 3 }}>{room.room_type_name} · sleeps {room.capacity} · floor {room.floor}</div>
          </div>
          <Stars rating={room.rating} reviews={room.reviews} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, color: TI.pos, fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: room.available ? TI.pos : TI.neg }} />
          <span style={{ color: room.available ? TI.pos : TI.neg }}>{room.available ? 'Available' : 'Unavailable'}</span>
        </div>
        <p style={{ fontSize: 14, color: M.ink, lineHeight: 1.55, marginTop: 16 }}>{room.description}</p>
        <div style={{ fontSize: 14, fontWeight: 700, color: M.ink, margin: '8px 0 12px' }}>What this room offers</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {(room.amenities || []).map(a => (
            <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: M.ink }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: M.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                <Ico name={a} size={17} color={M.accent} />
              </span>
              {AMENITY_LABELS[a] || a}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: TI.accentSoft,
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <Ico name="pin" size={18} color={M.accent} />
          <span style={{ fontSize: 12.5, color: TI.ink2, lineHeight: 1.4 }}>12 Seaside Avenue · 4 min walk to the bay promenade</span>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: M.ink }}>Guest reviews</div>
            <Stars rating={room.rating} reviews={room.reviews} />
          </div>
          {(room.recent_reviews || []).length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {room.recent_reviews.map(review => (
                <div key={review.id} style={{ padding: 13, borderRadius: 14, background: M.bg, border: `1px solid ${M.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: M.ink }}>{review.guest_name}</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 800, color: M.ink }}>
                      <Ico name="star" size={13} color="#f59e0b" /> {review.rating}
                    </span>
                  </div>
                  {review.comment && (
                    <div style={{ marginTop: 7, fontSize: 13, lineHeight: 1.5, color: M.sub }}>{review.comment}</div>
                  )}
                  <div style={{ marginTop: 7, fontSize: 11.5, color: M.faint }}>{review.created}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 14, borderRadius: 14, background: M.bg, border: `1px solid ${M.border}`,
              fontSize: 13, color: M.sub }}>No reviews for this room yet.</div>
          )}
        </div>
      </div>

      {/* sticky reserve bar */}
      <div style={{ position: isDesktop ? 'sticky' : 'fixed', bottom: isDesktop ? 0 : 76, left: 0, right: 0, padding: isDesktop ? '16px 28px' : '12px 18px',
        background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${M.border}`, display: 'flex', alignItems: 'center', gap: 14, zIndex: 30,
        margin: isDesktop ? '18px 28px 0' : 0, borderRadius: isDesktop ? 10 : 0 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: M.ink }}>{peso(room.price)}</div>
          <div style={{ fontSize: 11.5, color: M.sub }}>{selectedNights} night{selectedNights !== 1 ? 's' : ''} · {formatRange(dates?.in, dates?.out)}</div>
        </div>
        <Btn size="lg" full variant={room.available ? 'primary' : 'outline'}
          onClick={() => room.available && onReserve(id, dates)} disabled={!room.available}
          style={{ flex: 1, ...(room.available ? {} : { background: '#f1f5f9', color: M.sub, borderColor: M.border }) }}>
          {room.available ? 'Reserve' : 'Unavailable'}
        </Btn>
      </div>
    </div>
  );
}
