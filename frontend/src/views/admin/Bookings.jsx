import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Btn from '../../components/Btn';
import Avatar from '../../components/Avatar';
import SectionTitle from '../../components/SectionTitle';
import Ico from '../../components/Ico';
import { TI } from '../../theme';

// ── Helpers ───────────────────────────────────────────────────────────────────

const peso = (n) => `₱${Number(n).toLocaleString()}`;
const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, kind = 'pos' }) {
  if (!msg) return null;
  return (
    <div className="ti-fade" style={{
      position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 20px', borderRadius: 999, background: TI.ink, color: '#fff',
      fontSize: 13.5, fontWeight: 600, boxShadow: TI.shadowLg,
    }}>
      <Ico name={kind === 'neg' ? 'x' : 'check'} size={16}
        color={kind === 'neg' ? '#fca5a5' : '#6ee7b7'} sw={2.5} />
      {msg}
    </div>
  );
}

// ── Backdrop modal wrapper ────────────────────────────────────────────────────

function Modal({ children, onClose, width = 480 }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(4px)',
      }} />

      {/*
        Centering wrapper — flexbox so no transform is needed for centering.
        The ti-fade animation only does translateY(8px)→none for the slide-in,
        which no longer conflicts with any positioning transform.
        pointer-events:none lets outside-clicks fall through to the backdrop.
      */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
      }}>
        <div className="ti-fade"
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'all',
            width, maxWidth: '100%',
            background: TI.surface, borderRadius: TI.radiusLg,
            boxShadow: TI.shadowLg, fontFamily: TI.ui,
            maxHeight: 'calc(100vh - 32px)', overflowY: 'auto',
          }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ── Cancel confirmation ───────────────────────────────────────────────────────

function CancelModal({ booking, onConfirm, onClose }) {
  return (
    <Modal onClose={onClose} width={400}>
      <div style={{ padding: '28px 28px 22px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: TI.negSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <Ico name="x" size={21} color={TI.neg} sw={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: TI.ink, marginBottom: 7 }}>
              Cancel booking?
            </div>
            <div style={{ fontSize: 13.5, color: TI.sub, lineHeight: 1.5 }}>
              Cancel <span style={{ fontWeight: 700, color: TI.ink, fontFamily: TI.mono }}>{booking.booking_id}</span> for <b style={{ color: TI.ink }}>{booking.guest_name}</b>?
              This action cannot be undone.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 999, border: `1px solid ${TI.border}`,
            background: TI.surface, color: TI.ink2, fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: 'pointer',
          }}>Keep booking</button>
          <button onClick={onConfirm} style={{
            padding: '9px 20px', borderRadius: 999, border: 'none',
            background: TI.neg, color: '#fff', fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: 'pointer',
          }}>Yes, cancel it</button>
        </div>
      </div>
    </Modal>
  );
}

// ── View modal ────────────────────────────────────────────────────────────────

function ViewModal({ booking: b, onClose }) {
  const STATUS_FLOW = ['Pending', 'Confirmed', 'Completed'];
  const isCancelled = b.status === 'Cancelled';
  const currentIdx  = STATUS_FLOW.indexOf(b.status);

  return (
    <Modal onClose={onClose} width={500}>
      {/* Header */}
      <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${TI.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: TI.mono, color: TI.faint, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 4 }}>Booking Detail</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink, fontFamily: TI.mono }}>{b.booking_id}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill status={b.status} />
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8,
            border: `1px solid ${TI.border}`, background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="x" size={15} color={TI.sub} />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Guest */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14,
          background: TI.surfaceAlt, borderRadius: TI.radius, border: `1px solid ${TI.border}` }}>
          <Avatar name={b.guest_name} size={42} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TI.ink }}>{b.guest_name}</div>
            <div style={{ fontSize: 12, color: TI.sub, marginTop: 2 }}>{b.guest_email || 'No email'}</div>
            <div style={{ fontSize: 12, color: b.guest_phone ? TI.ink2 : TI.sub, marginTop: 2 }}>{b.guest_phone || 'No phone set'}</div>
          </div>
        </div>

        {/* Room + Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <DetailBlock icon="bed" label="Room">
            <div style={{ fontWeight: 700 }}>{b.room_name}</div>
            <div style={{ color: TI.sub, fontSize: 12 }}>{b.room_type_name} · sleeps {b.room_capacity ?? '—'}</div>
          </DetailBlock>
          <DetailBlock icon="user" label="Guests">
            <div style={{ fontWeight: 700 }}>{b.guests_count} {b.guests_count === 1 ? 'guest' : 'guests'}</div>
          </DetailBlock>
          <DetailBlock icon="cal" label="Check-in">
            <div style={{ fontWeight: 700 }}>{b.check_in}</div>
          </DetailBlock>
          <DetailBlock icon="cal" label="Check-out">
            <div style={{ fontWeight: 700 }}>{b.check_out}</div>
            <div style={{ color: TI.sub, fontSize: 12 }}>{b.nights} night{b.nights !== 1 ? 's' : ''}</div>
          </DetailBlock>
        </div>

        {/* Amount */}
        <div style={{ padding: '14px 16px', background: TI.accentSoft,
          borderRadius: TI.radius, border: `1px solid ${TI.accent}22` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: TI.ink2 }}>{peso(b.room_price ?? Math.round(b.amount / b.nights))} × {b.nights} nights</div>
            <div style={{ fontSize: 13, color: TI.ink2 }}>{peso(b.amount)}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 8, paddingTop: 8, borderTop: `1px solid ${TI.accent}22` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TI.ink }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink }}>{peso(b.amount)}</div>
          </div>
        </div>

        {/* Status timeline */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TI.sub, marginBottom: 12 }}>Status timeline</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STATUS_FLOW.map((s, i) => {
              const done    = !isCancelled && i <= currentIdx;
              const current = !isCancelled && i === currentIdx;
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 999,
                      background: done ? TI.pos : TI.border,
                      border: `2px solid ${done ? TI.pos : TI.borderStrong}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: current ? `0 0 0 4px ${TI.posSoft}` : 'none',
                    }}>
                      <Ico name={done ? 'check' : 'clock'} size={13} color={done ? '#fff' : TI.faint} sw={2.5} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: current ? 700 : 500,
                      color: done ? TI.pos : TI.faint, whiteSpace: 'nowrap' }}>{s}</div>
                  </div>
                  {i < 2 && (
                    <div style={{ flex: 1, height: 2, background: done && i < currentIdx ? TI.pos : TI.border,
                      margin: '0 6px', marginBottom: 20 }} />
                  )}
                </div>
              );
            })}
            {isCancelled && (
              <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: TI.negSoft,
                  border: `2px solid ${TI.neg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ico name="x" size={13} color={TI.neg} sw={2.5} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TI.neg }}>Cancelled</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DetailBlock({ icon, label, children }) {
  return (
    <div style={{ padding: '12px 14px', background: TI.surfaceAlt,
      borderRadius: TI.radiusSm, border: `1px solid ${TI.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Ico name={icon} size={13} color={TI.faint} />
        <span style={{ fontSize: 11, fontWeight: 600, color: TI.sub, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 13.5, color: TI.ink }}>{children}</div>
    </div>
  );
}

// ── Modify modal ──────────────────────────────────────────────────────────────

function ModifyModal({ booking: orig, onSave, onClose }) {
  const [checkIn,  setCheckIn]  = useState(orig.check_in);
  const [checkOut, setCheckOut] = useState(orig.check_out);
  const [guests,   setGuests]   = useState(orig.guests_count);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState('');

  const roomPrice = orig.room_price ?? Math.round(orig.amount / orig.nights);
  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : orig.nights;
  const total = nights * roomPrice;

  const save = async () => {
    if (nights <= 0) { setErr('Check-out must be after check-in.'); return; }
    setSaving(true); setErr('');
    try {
      const { data } = await api.patch(`/bookings/${orig.id}/modify/`, {
        check_in: checkIn, check_out: checkOut, guests_count: guests,
      });
      onSave(data);
    } catch (e) {
      setErr(e.response?.data?.detail || 'Save failed.');
    } finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} width={460}>
      {/* Header */}
      <div style={{ padding: '22px 24px 16px', borderBottom: `1px solid ${TI.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: TI.mono, color: TI.faint, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 4 }}>Modify Booking</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: TI.ink }}>
            <span style={{ fontFamily: TI.mono }}>{orig.booking_id}</span>
            <span style={{ fontWeight: 400, color: TI.sub, fontSize: 13, marginLeft: 8 }}>· {orig.guest_name}</span>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8,
          border: `1px solid ${TI.border}`, background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ico name="x" size={15} color={TI.sub} />
        </button>
      </div>

      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {err && (
          <div style={{ padding: '10px 14px', borderRadius: TI.radiusSm, background: TI.negSoft,
            color: TI.neg, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ico name="x" size={14} color={TI.neg} sw={2.5} />{err}
          </div>
        )}

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <DateField label="Check-in" value={checkIn} onChange={setCheckIn} />
          <DateField label="Check-out" value={checkOut} onChange={setCheckOut} />
        </div>

        {/* Guests stepper */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: TI.ink2, display: 'block', marginBottom: 8 }}>
            Guests
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setGuests(g => Math.max(1, g - 1))} style={{
              width: 36, height: 36, borderRadius: 999, border: `1px solid ${TI.border}`,
              background: TI.surface, cursor: 'pointer', fontSize: 18, color: TI.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
            <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{guests}</span>
            <button onClick={() => setGuests(g => Math.min(orig.room_capacity ?? 10, g + 1))} style={{
              width: 36, height: 36, borderRadius: 999, border: `1px solid ${TI.border}`,
              background: TI.surface, cursor: 'pointer', fontSize: 18, color: TI.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
            <span style={{ fontSize: 12, color: TI.sub }}>
              {orig.room_name} · max {orig.room_capacity ?? '?'} guests
            </span>
          </div>
        </div>

        {/* Live cost preview */}
        <div style={{ padding: '14px 16px', background: TI.surfaceAlt,
          borderRadius: TI.radius, border: `1px solid ${TI.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: TI.sub, marginBottom: 6 }}>
            <span>{peso(roomPrice)} × {nights} night{nights !== 1 ? 's' : ''}</span>
            <span>{peso(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: TI.ink,
            paddingTop: 8, borderTop: `1px solid ${TI.border}` }}>
            <span>New total</span>
            <span>{peso(total)}</span>
          </div>
          {total !== orig.amount && (
            <div style={{ fontSize: 11.5, color: TI.warn, marginTop: 6 }}>
              Original total was {peso(orig.amount)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: 999, border: `1px solid ${TI.border}`,
            background: TI.surface, color: TI.ink2, fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={save} disabled={saving || nights <= 0} style={{
            padding: '10px 20px', borderRadius: 999, border: 'none',
            background: TI.accent, color: '#fff', fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: saving ? 'wait' : 'pointer',
            opacity: saving || nights <= 0 ? 0.6 : 1,
          }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: TI.ink2 }}>{label}</span>
      <input type="date" value={value} onChange={e => onChange(e.target.value)}
        style={{ height: 42, padding: '0 12px', border: `1px solid ${TI.border}`,
          borderRadius: TI.radiusSm, fontSize: 14, color: TI.ink, fontFamily: TI.ui,
          background: TI.surfaceAlt, outline: 'none', cursor: 'pointer',
          width: '100%', boxSizing: 'border-box' }} />
    </label>
  );
}

// ── Icon action button ────────────────────────────────────────────────────────

function IconBtn({ name, color = TI.ink2, onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 32, height: 32, borderRadius: 8,
      border: `1px solid ${TI.border}`, background: TI.surface,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background .12s, border-color .12s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = color === TI.neg ? TI.negSoft : TI.surfaceAlt; }}
    onMouseLeave={e => { e.currentTarget.style.background = TI.surface; }}>
      <Ico name={name} size={15} color={color} />
    </button>
  );
}

// ── Audit log (bottom) ────────────────────────────────────────────────────────

function AuditLog({ refreshKey }) {
  const [audit, setAudit] = useState([]);
  const ICONS  = { Confirmed: 'check', Cancelled: 'x', Inactive: 'bed', Pending: 'plus', info: 'refresh' };
  const COLORS = { Confirmed: TI.posSoft,  Cancelled: TI.negSoft,  info: TI.infoSoft, Inactive: TI.warnSoft, Pending: TI.warnSoft };
  const INK    = { Confirmed: TI.pos,      Cancelled: TI.neg,      info: TI.info,     Inactive: TI.warn,     Pending: TI.warn };

  useEffect(() => {
    api.get('/audit/').then(r => setAudit(r.data.results || r.data));
  }, [refreshKey]);

  return (
    <Card pad={0}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TI.border}`,
        display: 'flex', alignItems: 'center', gap: 9 }}>
        <Ico name="clock" size={17} color={TI.accent} />
        <span style={{ fontSize: 15, fontWeight: 700 }}>Audit history</span>
      </div>
      <div style={{ padding: '8px 20px 16px' }}>
        {audit.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', gap: 13, padding: '11px 0',
            borderBottom: i < audit.length - 1 ? `1px solid ${TI.border}` : 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, flex: '0 0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: COLORS[a.kind] || TI.infoSoft, color: INK[a.kind] || TI.info }}>
              <Ico name={ICONS[a.kind] || 'info'} size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>
                <b>{a.action}</b> · <span style={{ fontFamily: TI.mono, color: TI.sub }}>{a.target}</span>
              </div>
              <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 2 }}>{a.who}</div>
            </div>
            <div style={{ fontSize: 11.5, color: TI.faint, whiteSpace: 'nowrap' }}>{a.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function ImportHistoryModal({ onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const upload = async () => {
    if (!file) { setErr('Choose a CSV or Excel file first.'); return; }
    setBusy(true); setErr(''); setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/bookings/import-history/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      onImported(data);
    } catch (e) {
      setErr(e.response?.data?.detail || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ padding: '22px 24px 16px', borderBottom: `1px solid ${TI.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: TI.mono, color: TI.faint, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 4 }}>Forecast Data</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink }}>Upload booking history</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8,
          border: `1px solid ${TI.border}`, background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ico name="x" size={15} color={TI.sub} />
        </button>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ padding: 14, borderRadius: TI.radius, background: TI.infoSoft,
          border: `1px solid ${TI.info}22`, color: TI.ink2, fontSize: 13, lineHeight: 1.55,
          marginBottom: 16 }}>
          Upload CSV or Excel rows with columns:
          <div style={{ fontFamily: TI.mono, color: TI.ink, marginTop: 6, fontSize: 12 }}>
            booking_id, guest_name, guest_email, room_id, check_in, check_out, nights, guests_count, amount, status
          </div>
        </div>
        <label style={{ display: 'block', border: `1px dashed ${TI.borderStrong}`, borderRadius: TI.radius,
          padding: 18, background: TI.surfaceAlt, cursor: 'pointer', textAlign: 'center' }}>
          <Ico name="upload" size={22} color={TI.accent} />
          <div style={{ fontSize: 13.5, fontWeight: 700, color: TI.ink, marginTop: 8 }}>
            {file ? file.name : 'Choose history file'}
          </div>
          <div style={{ fontSize: 12, color: TI.sub, marginTop: 3 }}>CSV or .xlsx workbook</div>
          <input type="file" accept=".csv,.xlsx" onChange={e => setFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }} />
        </label>
        {err && <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: TI.radiusSm,
          background: TI.negSoft, color: TI.neg, fontSize: 13 }}>{err}</div>}
        {result && <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: TI.radiusSm,
          background: TI.posSoft, color: TI.pos, fontSize: 13 }}>
          Imported {result.created} booking(s), skipped {result.skipped}.
        </div>}
        {result?.errors?.length > 0 && (
          <div style={{ marginTop: 10, maxHeight: 120, overflow: 'auto', fontSize: 12, color: TI.sub }}>
            {result.errors.map(e => <div key={`${e.row}-${e.error}`}>Row {e.row}: {e.error}</div>)}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <Btn variant="outline" onClick={onClose}>Close</Btn>
          <Btn icon="upload" onClick={upload} disabled={busy}>{busy ? 'Uploading...' : 'Upload history'}</Btn>
        </div>
      </div>
    </Modal>
  );
}

export default function Bookings() {
  const { user } = useAuth();
  const [list,         setList]         = useState([]);
  const [filter,       setFilter]       = useState('All');
  const [search,       setSearch]       = useState('');
  const [toast,        setToast]        = useState(null);
  const [toastKind,    setToastKind]    = useState('pos');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [viewTarget,   setViewTarget]   = useState(null);
  const [modifyTarget, setModifyTarget] = useState(null);
  const [importOpen,   setImportOpen]   = useState(false);
  const [auditKey,     setAuditKey]     = useState(0);

  const fire = (msg, kind = 'pos') => {
    setToast(msg); setToastKind(kind);
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    api.get('/bookings/').then(r => setList(r.data.results || r.data));
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const confirm = async (id) => {
    try {
      const { data } = await api.post(`/bookings/${id}/confirm/`);
      setList(l => l.map(b => b.id === id ? data : b));
      setAuditKey(k => k + 1);
      fire(`${data.booking_id} confirmed`);
    } catch { fire('Confirm failed', 'neg'); }
  };

  const complete = async (id) => {
    try {
      const { data } = await api.post(`/bookings/${id}/complete/`);
      setList(l => l.map(b => b.id === id ? data : b));
      setAuditKey(k => k + 1);
      fire(`${data.booking_id} completed`);
    } catch { fire('Complete failed', 'neg'); }
  };

  const rejectBooking = async (booking) => {
    try {
      const { data } = await api.post(`/bookings/${booking.id}/cancel/`);
      setList(l => l.map(b => b.id === booking.id ? data : b));
      setAuditKey(k => k + 1);
      fire(`${data.booking_id} rejected`, 'neg');
    } catch { fire('Reject failed', 'neg'); }
  };

  const cancelBooking = async () => {
    const id = cancelTarget.id;
    setCancelTarget(null);
    try {
      const { data } = await api.post(`/bookings/${id}/cancel/`);
      setList(l => l.map(b => b.id === id ? data : b));
      setAuditKey(k => k + 1);
      fire(`${data.booking_id} cancelled`, 'neg');
    } catch { fire('Cancel failed', 'neg'); }
  };

  const saveModify = (updated) => {
    setList(l => l.map(b => b.id === updated.id ? updated : b));
    setModifyTarget(null);
    setAuditKey(k => k + 1);
    fire(`${updated.booking_id} updated`);
  };

  const exportExcel = async () => {
    try {
      const res = await api.post('/reports/generate/', { format: 'excel' }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url;
      a.download = 'bookings_report.xlsx'; a.click();
      URL.revokeObjectURL(url);
      fire('Report downloaded');
    } catch { fire('Export failed', 'neg'); }
  };

  const finishImport = ({ created, skipped }) => {
    api.get('/bookings/').then(r => setList(r.data.results || r.data));
    setAuditKey(k => k + 1);
    fire(`History import complete: ${created} added, ${skipped} skipped`);
  };

  // ── Filtering + search ─────────────────────────────────────────────────────

  const q = search.trim().toLowerCase();
  const shown = list
    .filter(b => filter === 'All' || b.status === filter)
    .filter(b => !q || b.booking_id.toLowerCase().includes(q)
                    || b.guest_name.toLowerCase().includes(q)
                    || (b.guest_email || '').toLowerCase().includes(q)
                    || (b.guest_phone || '').toLowerCase().includes(q)
                    || b.room_name.toLowerCase().includes(q));

  const counts = FILTERS.reduce((a, f) => ({
    ...a, [f]: f === 'All' ? list.length : list.filter(b => b.status === f).length,
  }), {});

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <SectionTitle
        kicker="Booking Management" title="All Bookings"
        sub={user?.role === 'owner'
          ? 'Confirm or reject pending reservations'
          : 'Confirm, modify or cancel reservations across every customer'}
        right={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Btn variant="outline" icon="download" onClick={exportExcel}>Export</Btn>
          </div>
        }
      />

      {/* Filter tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: TI.surface, border: `1px solid ${TI.border}`,
          borderRadius: 999, padding: 3 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 600, fontFamily: TI.ui,
              background: f === filter ? TI.accent : 'transparent',
              color: f === filter ? '#fff' : TI.sub,
              transition: 'background .15s, color .15s',
            }}>
              {f} <span style={{ opacity: .65, fontFamily: TI.mono, fontSize: 11 }}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Live search input */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 12px', height: 38, width: 240,
          background: TI.surface, border: `1px solid ${search ? TI.accent : TI.border}`,
          borderRadius: 999, transition: 'border-color .15s' }}>
          <Ico name="search" size={15} color={search ? TI.accent : TI.faint} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings…"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: TI.ink, fontFamily: TI.ui }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent',
              cursor: 'pointer', display: 'flex', padding: 0 }}>
              <Ico name="x" size={13} color={TI.faint} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card pad={0} style={{ marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
            <thead>
              <tr style={{ background: TI.surfaceAlt }}>
                {['Booking', 'Guest', 'Room', 'Stay', 'Amount', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 4 ? 'right' : i === 6 ? 'right' : 'left',
                    padding: '12px 18px', fontSize: 11, fontWeight: 600, color: TI.sub,
                    textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px 18px', textAlign: 'center',
                    fontSize: 13.5, color: TI.sub }}>
                    {search ? `No bookings matching "${search}"` : 'No bookings in this category'}
                  </td>
                </tr>
              )}
              {shown.map(b => (
                <tr key={b.id} className="ti-row" style={{ borderTop: `1px solid ${TI.border}` }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, fontFamily: TI.mono, fontSize: 12.5 }}>{b.booking_id}</div>
                    <div style={{ fontSize: 11, color: TI.sub, marginTop: 2 }}>created {b.created}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: TI.ink }}>{b.guest_name}</div>
                    <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 2 }}>{b.guest_email || 'No email'}</div>
                    <div style={{ fontSize: 11.5, color: b.guest_phone ? TI.ink2 : TI.sub, marginTop: 2 }}>{b.guest_phone || 'No phone set'}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{b.room_name}</div>
                    <div style={{ fontSize: 11.5, color: TI.sub }}>{b.room_type_name} · {b.guests_count} guest{b.guests_count !== 1 ? 's' : ''}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13 }}>
                    <div style={{ fontSize: 12.5 }}>{b.check_in}</div>
                    <div style={{ fontSize: 11.5, color: TI.sub }}>{b.nights} nights → {b.check_out}</div>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontFamily: TI.mono, fontWeight: 700, fontSize: 13 }}>
                    {peso(b.amount)}
                  </td>
                  <td style={{ padding: '14px 18px' }}><Pill status={b.status} /></td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                      {b.status === 'Pending' && user?.role === 'owner' && <>
                        <Btn size="sm" icon="check" onClick={() => confirm(b.id)}>Confirm</Btn>
                        <IconBtn name="x" color={TI.neg} title="Reject booking"
                          onClick={() => rejectBooking(b)} />
                      </>}
                      {b.status === 'Pending' && user?.role !== 'owner' && <>
                        <Btn size="sm" icon="check" onClick={() => confirm(b.id)}>Confirm</Btn>
                        <IconBtn name="x" color={TI.neg} title="Cancel booking"
                          onClick={() => setCancelTarget(b)} />
                      </>}
                      {b.status === 'Confirmed' && user?.role !== 'owner' && <>
                        <Btn size="sm" icon="check" onClick={() => complete(b.id)}>Complete</Btn>
                        <Btn size="sm" variant="outline" icon="edit"
                          onClick={() => setModifyTarget(b)}>Modify</Btn>
                        <IconBtn name="x" color={TI.neg} title="Cancel booking"
                          onClick={() => setCancelTarget(b)} />
                      </>}
                      {b.status === 'Confirmed' && user?.role === 'owner' && (
                        <>
                          <Btn size="sm" icon="check" onClick={() => complete(b.id)}>Complete</Btn>
                          <IconBtn name="eye" title="View details"
                            onClick={() => setViewTarget(b)} />
                        </>
                      )}
                      {(b.status === 'Completed' || b.status === 'Cancelled') && (
                        <IconBtn name="eye" title="View details"
                          onClick={() => setViewTarget(b)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AuditLog refreshKey={auditKey} />
      <Toast msg={toast} kind={toastKind} />

      {/* Modals */}
      {cancelTarget && (
        <CancelModal booking={cancelTarget}
          onConfirm={cancelBooking} onClose={() => setCancelTarget(null)} />
      )}
      {viewTarget && (
        <ViewModal booking={viewTarget} onClose={() => setViewTarget(null)} />
      )}
      {modifyTarget && (
        <ModifyModal booking={modifyTarget}
          onSave={saveModify} onClose={() => setModifyTarget(null)} />
      )}
      {false && importOpen && (
        <ImportHistoryModal
          onClose={() => setImportOpen(false)}
          onImported={finishImport}
        />
      )}
    </div>
  );
}
