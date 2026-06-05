import { useState, useEffect } from 'react';
import api from '../../api/client';
import Card from '../../components/Card';
import Btn from '../../components/Btn';
import Field from '../../components/Field';
import Toggle from '../../components/Toggle';
import SectionTitle from '../../components/SectionTitle';
import Ico from '../../components/Ico';
import LogoSettings from '../../components/LogoSettings';
import { TI } from '../../theme';

const TYPE_COLORS = [
  'linear-gradient(135deg,#93c5fd,#6366f1)',
  'linear-gradient(135deg,#fbbf24,#f97316)',
  'linear-gradient(135deg,#5eead4,#0ea5e9)',
  'linear-gradient(135deg,#f0abfc,#a855f7)',
  'linear-gradient(135deg,#fda4af,#f43f5e)',
  'linear-gradient(135deg,#a7f3d0,#059669)',
];

const EMPTY_TYPE = {
  name: '',
  base_price: 2400,
  capacity: 2,
  count: 0,
  gradient_css: TYPE_COLORS[0],
};

function Toast({ msg, kind = 'pos' }) {
  if (!msg) return null;
  return (
    <div className="ti-fade" style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 999,
      background: TI.ink, color: '#fff', fontSize: 13.5, fontWeight: 600, boxShadow: TI.shadowLg }}>
      <Ico name={kind === 'neg' ? 'x' : 'check'} size={16} color={kind === 'neg' ? '#fca5a5' : '#6ee7b7'} sw={2.5} />
      {msg}
    </div>
  );
}

function Modal({ children, onClose, width = 440 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1001, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
        <div className="ti-fade" onClick={e => e.stopPropagation()} style={{
          pointerEvents: 'all', width, maxWidth: '100%', background: TI.surface,
          borderRadius: TI.radiusLg, boxShadow: TI.shadowLg, fontFamily: TI.ui,
        }}>
          {children}
        </div>
      </div>
    </>
  );
}

function TextField({ label, value, onChange, type = 'text', min, placeholder }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: TI.ink2 }}>{label}</span>
      <input type={type} min={min} value={value} placeholder={placeholder}
        onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        style={{ height: 42, padding: '0 12px', border: `1px solid ${TI.border}`,
          borderRadius: TI.radiusSm, background: TI.surfaceAlt, color: TI.ink,
          fontFamily: TI.ui, fontSize: 14, outline: 'none', width: '100%',
          minWidth: 0, boxSizing: 'border-box' }} />
    </label>
  );
}

function RoomTypeModal({ initial, onClose, onSaved }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(initial || EMPTY_TYPE);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) { setErr('Room type name is required.'); return; }
    if (form.base_price < 1 || form.capacity < 1 || form.count < 0) {
      setErr('Price and capacity must be positive. Room count cannot be negative.');
      return;
    }

    setSaving(true);
    setErr('');
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        base_price: Number(form.base_price),
        capacity: Number(form.capacity),
        count: Number(form.count),
      };
      const { data } = editing
        ? await api.patch(`/room-types/${initial.id}/`, payload)
        : await api.post('/room-types/', payload);
      onSaved(data);
    } catch (e) {
      const data = e.response?.data;
      setErr(data?.name?.[0] || data?.detail || 'Room type could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '22px 24px 16px', borderBottom: `1px solid ${TI.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: TI.mono, color: TI.faint, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 4 }}>{editing ? 'Edit Type' : 'New Type'}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink }}>
            {editing ? form.name : 'Add room type'}
          </div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8,
          border: `1px solid ${TI.border}`, background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ico name="x" size={15} color={TI.sub} />
        </button>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {err && (
          <div style={{ padding: '10px 14px', borderRadius: TI.radiusSm, background: TI.negSoft,
            color: TI.neg, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ico name="x" size={14} color={TI.neg} sw={2.5} />{err}
          </div>
        )}

        <div style={{ height: 70, borderRadius: TI.radius, background: form.gradient_css,
          border: `1px solid ${TI.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center' }}>
          <Ico name="bed" size={32} color="rgba(255,255,255,.86)" sw={1.3} />
        </div>

        <TextField label="Type name" value={form.name} onChange={v => update('name', v)} placeholder="Executive" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          <TextField label="Base price" type="number" min={1} value={form.base_price} onChange={v => update('base_price', v)} />
          <TextField label="Capacity" type="number" min={1} value={form.capacity} onChange={v => update('capacity', v)} />
          <TextField label="Room count" type="number" min={0} value={form.count} onChange={v => update('count', v)} />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TI.ink2, marginBottom: 8 }}>Color</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPE_COLORS.map(g => (
              <button key={g} type="button" title="Set color" onClick={() => update('gradient_css', g)}
                style={{ width: 34, height: 34, borderRadius: 999, background: g, cursor: 'pointer',
                  border: `3px solid ${form.gradient_css === g ? TI.ink : '#fff'}`,
                  boxShadow: `0 0 0 1px ${TI.border}` }} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn icon="check" onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add type'}</Btn>
        </div>
      </div>
    </Modal>
  );
}

const BOOKING_RULES = [
  { k: 'approval', t: 'Require admin approval', d: 'New bookings start as Pending until confirmed' },
  { k: 'autoEmail', t: 'Email notifications', d: 'Notify guests on status changes' },
  { k: 'allowCancel', t: 'Allow guest cancellation', d: 'Within the cancellation policy window' },
  { k: 'overbook', t: 'Allow overbooking buffer', d: 'Accept 1 extra booking per room type' },
];

export default function Settings({ logoOnly = false }) {
  const [cfg, setCfg] = useState({ approval: true, autoEmail: true, allowCancel: true, overbook: false });
  const [types, setTypes] = useState([]);
  const [toast, setToast] = useState(null);
  const [toastKind, setToastKind] = useState('pos');
  const [modalType, setModalType] = useState(null);

  const fire = (msg, kind = 'pos') => {
    setToast(msg);
    setToastKind(kind);
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    api.get('/room-types/').then(r => setTypes(r.data.results || r.data));
  }, []);

  const saveType = (saved) => {
    setTypes(list => {
      const exists = list.some(t => t.id === saved.id);
      return exists ? list.map(t => t.id === saved.id ? saved : t) : [...list, saved];
    });
    setModalType(null);
    fire(`${saved.name} ${modalType?.id ? 'updated' : 'added'}`);
  };

  const peso = (n) => `\u20b1${Number(n).toLocaleString()}`;

  return (
    <div>
      <SectionTitle kicker="System Settings" title={logoOnly ? 'Branding' : 'Configuration'} sub={logoOnly ? 'Change the system logo used across Traveller\'s Inn' : 'System-wide rules, room types and categories'} />

      <div style={{ marginBottom: logoOnly ? 0 : 16 }}>
        <LogoSettings onToast={fire} />
      </div>

      {logoOnly ? (
        <>
          <Toast msg={toast} kind={toastKind} />
        </>
      ) : (
        <>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink, marginBottom: 14 }}>Booking rules</div>
          {BOOKING_RULES.map((o, i) => (
            <div key={o.k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0',
              borderTop: i ? `1px solid ${TI.border}` : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: TI.ink }}>{o.t}</div>
                <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 2 }}>{o.d}</div>
              </div>
              <Toggle on={cfg[o.k]} onClick={() => setCfg(c => ({ ...c, [o.k]: !c[o.k] }))} />
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <Field label="Cancellation window (hours before check-in)" value="48" icon="clock" />
          </div>
        </Card>

        <Card pad={0}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TI.border}`, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Room types & categories</span>
            <Btn size="sm" variant="soft" icon="plus" onClick={() => setModalType({ ...EMPTY_TYPE })}>Add type</Btn>
          </div>
          {types.map((t, i) => (
            <div key={t.id} className="ti-row" style={{ display: 'flex', alignItems: 'center', gap: 13,
              padding: '14px 20px', borderTop: i ? `1px solid ${TI.border}` : 'none' }}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: t.gradient_css, flex: '0 0 auto' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 11.5, color: TI.sub }}>{t.count} rooms - sleeps {t.capacity}</div>
              </div>
              <div style={{ fontFamily: TI.mono, fontWeight: 700, fontSize: 13 }}>{peso(t.base_price)}</div>
              <button onClick={() => setModalType(t)} title={`Edit ${t.name}`} style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${TI.border}`,
                background: TI.surface, cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ico name="edit" size={15} color={TI.ink2} />
              </button>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
        <Btn icon="check" onClick={() => fire('Settings saved')}>Save changes</Btn>
      </div>
      {modalType && <RoomTypeModal initial={modalType} onClose={() => setModalType(null)} onSaved={saveType} />}
      <Toast msg={toast} kind={toastKind} />
        </>
      )}
    </div>
  );
}
