import { useState, useEffect } from 'react';
import api from '../../api/client';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Btn from '../../components/Btn';
import Toggle from '../../components/Toggle';
import SectionTitle from '../../components/SectionTitle';
import Ico from '../../components/Ico';
import { TI } from '../../theme';

const AMENITIES = ['wifi', 'ac', 'tv', 'coffee', 'bath', 'parking'];
const AMENITY_LABELS = {
  wifi: 'Free Wi-Fi',
  ac: 'Air conditioning',
  tv: 'Smart TV',
  coffee: 'Coffee bar',
  bath: 'Rain shower',
  parking: 'Free parking',
};

const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg,#a5b4fc,#6366f1)',
  'linear-gradient(135deg,#fcd34d,#f97316)',
  'linear-gradient(135deg,#5eead4,#0284c7)',
  'linear-gradient(135deg,#f0abfc,#a855f7)',
  'linear-gradient(135deg,#bae6fd,#3b82f6)',
  'linear-gradient(135deg,#fda4af,#f43f5e)',
];

const DEFAULT_ROOM_TYPES = [
  { id: 1, name: 'Standard' },
  { id: 2, name: 'Deluxe' },
  { id: 3, name: 'Suite' },
  { id: 4, name: 'Family' },
];

const IMAGE_MAX_SOURCE_BYTES = 4 * 1024 * 1024;
const IMAGE_MAX_WIDTH = 1200;
const IMAGE_MAX_HEIGHT = 720;
const IMAGE_QUALITY = 0.82;

const emptyForm = {
  room_id: '',
  name: '',
  room_type: '',
  capacity: 2,
  price: 2400,
  status: 'Active',
  floor: 1,
  amenities: ['wifi', 'ac', 'tv'],
  description: '',
  gradient_css: DEFAULT_GRADIENTS[0],
  image_url: '',
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

function Modal({ children, onClose, width = 520 }) {
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
          maxHeight: 'calc(100vh - 32px)', overflowY: 'auto',
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

function getApiErrorMessage(error, fallback = 'Save failed.') {
  const data = error.response?.data;
  if (typeof data === 'string') {
    if (data.trim().startsWith('<!DOCTYPE') || data.includes('<html')) {
      if (data.includes('RequestDataTooBig')) {
        return 'The image is too large to save. Choose a smaller image or compress it first.';
      }
      return 'The server returned an error while saving. Please try again with a smaller image.';
    }
    return data;
  }
  return data?.room_id?.[0] || data?.name?.[0] || data?.image_url?.[0] || data?.detail || fallback;
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Image upload failed.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The selected image could not be loaded.'));
      img.onload = () => {
        const scale = Math.min(1, IMAGE_MAX_WIDTH / img.width, IMAGE_MAX_HEIGHT / img.height);
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function RoomFormModal({ mode, room, roomTypes, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    if (!room) return { ...emptyForm, room_type: roomTypes[0]?.id || '' };
    return {
      room_id: room.room_id || '',
      name: room.name || '',
      room_type: room.room_type || '',
      capacity: room.capacity || 1,
      price: room.price || 0,
      status: room.status || 'Active',
      floor: room.floor || 1,
      amenities: room.amenities || [],
      description: room.description || '',
      gradient_css: room.gradient_css || DEFAULT_GRADIENTS[0],
      image_url: room.image_url || '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!form.room_type && roomTypes.length > 0) {
      update('room_type', roomTypes[0].id);
    }
  }, [form.room_type, roomTypes]);

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErr('Please choose an image file.');
      return;
    }
    if (file.size > IMAGE_MAX_SOURCE_BYTES) {
      setErr('Please choose an image smaller than 4 MB.');
      return;
    }
    try {
      const imageUrl = await resizeImage(file);
      update('image_url', imageUrl);
      setErr('');
    } catch (e) {
      setErr(e.message || 'Image upload failed.');
    }
  };
  const toggleAmenity = (name) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(name)
        ? f.amenities.filter(a => a !== name)
        : [...f.amenities, name],
    }));
  };

  const save = async () => {
    if (!form.room_id.trim() || !form.name.trim() || !form.room_type) {
      setErr('Room ID, room name, and room type are required.');
      return;
    }
    if (form.capacity < 1 || form.price < 1 || form.floor < 1) {
      setErr('Capacity, price, and floor must be positive numbers.');
      return;
    }

    setSaving(true);
    setErr('');
    try {
      const payload = {
        ...form,
        room_id: form.room_id.trim(),
        name: form.name.trim(),
        capacity: Number(form.capacity),
        price: Number(form.price),
        floor: Number(form.floor),
      };
      const { data } = mode === 'edit'
        ? await api.patch(`/rooms/${room.id}/`, payload)
        : await api.post('/rooms/', payload);
      onSaved(data);
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} width={620}>
      <div style={{ padding: '22px 24px 16px', borderBottom: `1px solid ${TI.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: TI.mono, color: TI.faint, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 4 }}>{mode === 'edit' ? 'Edit Room' : 'New Room'}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink }}>
            {mode === 'edit' ? room.name : 'Add room listing'}
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

        <div style={{ height: 112, borderRadius: TI.radius, background: form.gradient_css,
          border: `1px solid ${TI.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {form.image_url ? (
            <img src={form.image_url} alt="" style={{ width: '100%', height: '100%',
              objectFit: 'cover', display: 'block' }} />
          ) : (
            <Ico name="bed" size={40} color="rgba(255,255,255,.86)" sw={1.3} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: form.image_url
            ? 'linear-gradient(180deg, rgba(15,23,42,.05), rgba(15,23,42,.28))'
            : 'transparent', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'flex', gap: 8 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,.92)',
              border: '1px solid rgba(255,255,255,.6)', color: TI.ink, fontSize: 12.5,
              fontWeight: 700, cursor: 'pointer', boxShadow: TI.shadow }}>
              <Ico name="upload" size={14} />
              {form.image_url ? 'Change image' : 'Upload image'}
              <input type="file" accept="image/*" onChange={e => uploadImage(e.target.files?.[0])}
                style={{ display: 'none' }} />
            </label>
            {form.image_url && (
              <button type="button" onClick={() => update('image_url', '')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 11px', borderRadius: 999, background: 'rgba(255,255,255,.92)',
                  border: '1px solid rgba(255,255,255,.6)', color: TI.neg, fontSize: 12.5,
                  fontWeight: 700, cursor: 'pointer', fontFamily: TI.ui, boxShadow: TI.shadow }}>
                <Ico name="x" size={13} color={TI.neg} />Remove
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <TextField label="Room ID" value={form.room_id} onChange={v => update('room_id', v)} placeholder="R-501" />
          <TextField label="Room name" value={form.name} onChange={v => update('name', v)} placeholder="Garden Standard" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1.2fr) repeat(3, minmax(86px, .8fr))', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: TI.ink2 }}>Room type</span>
            <select value={form.room_type} onChange={e => update('room_type', e.target.value)}
              style={{ height: 42, padding: '0 12px', border: `1px solid ${TI.border}`,
                borderRadius: TI.radiusSm, background: TI.surfaceAlt, color: TI.ink,
                fontFamily: TI.ui, fontSize: 14, outline: 'none', width: '100%',
                minWidth: 0, boxSizing: 'border-box' }}>
              <option value="">Select type</option>
              {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </label>
          <TextField label="Capacity" type="number" min={1} value={form.capacity} onChange={v => update('capacity', v)} />
          <TextField label="Floor" type="number" min={1} value={form.floor} onChange={v => update('floor', v)} />
          <TextField label="Price" type="number" min={1} value={form.price} onChange={v => update('price', v)} />
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: TI.ink2 }}>Description</span>
          <textarea value={form.description} onChange={e => update('description', e.target.value)}
            rows={3} placeholder="Short guest-facing room description"
            style={{ padding: 12, border: `1px solid ${TI.border}`, borderRadius: TI.radiusSm,
              background: TI.surfaceAlt, color: TI.ink, fontFamily: TI.ui, fontSize: 14,
              outline: 'none', resize: 'vertical' }} />
        </label>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TI.ink2, marginBottom: 8 }}>Amenities</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {AMENITIES.map(a => {
              const on = form.amenities.includes(a);
              return (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 11px',
                    borderRadius: 999, border: `1px solid ${on ? TI.accent : TI.border}`,
                    background: on ? TI.accentSoft : TI.surface, color: on ? TI.accent : TI.ink2,
                    cursor: 'pointer', fontFamily: TI.ui, fontSize: 12.5, fontWeight: 600 }}>
                  <Ico name={a} size={14} />{AMENITY_LABELS[a]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TI.ink2, marginBottom: 8 }}>Color</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DEFAULT_GRADIENTS.map(g => (
              <button key={g} type="button" title="Set fallback color" onClick={() => update('gradient_css', g)}
                style={{ width: 34, height: 34, borderRadius: 999, background: g, cursor: 'pointer',
                  border: `3px solid ${form.gradient_css === g ? TI.ink : '#fff'}`,
                  boxShadow: `0 0 0 1px ${TI.border}` }} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', borderRadius: TI.radius, border: `1px solid ${TI.border}`,
          background: TI.surfaceAlt }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TI.ink }}>Listing status</div>
            <div style={{ fontSize: 12, color: TI.sub, marginTop: 2 }}>Inactive rooms stay hidden from customers.</div>
          </div>
          <Toggle on={form.status === 'Active'}
            onClick={() => update('status', form.status === 'Active' ? 'Inactive' : 'Active')} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn icon="check" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Add room'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function CalendarModal({ room, bookings, loading, onClose }) {
  const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ padding: '22px 24px 16px', borderBottom: `1px solid ${TI.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: TI.mono, color: TI.faint, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 4 }}>Room Calendar</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink }}>
            {room.room_id} - {room.name}
          </div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8,
          border: `1px solid ${TI.border}`, background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ico name="x" size={15} color={TI.sub} />
        </button>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
          <SummaryTile label="Bookings" value={bookings.length} />
          <SummaryTile label="Active stays" value={activeBookings.length} />
          <SummaryTile label="Booked nights" value={activeBookings.reduce((sum, b) => sum + Number(b.nights || 0), 0)} />
        </div>

        {loading && (
          <div style={{ padding: '26px 12px', textAlign: 'center', color: TI.sub, fontSize: 13 }}>
            Loading calendar...
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div style={{ padding: '28px 16px', textAlign: 'center', color: TI.sub,
            background: TI.surfaceAlt, border: `1px solid ${TI.border}`, borderRadius: TI.radius }}>
            No bookings scheduled for this room yet.
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div style={{ border: `1px solid ${TI.border}`, borderRadius: TI.radius, overflow: 'hidden' }}>
            {bookings.map((b, i) => (
              <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto',
                gap: 12, padding: '13px 15px', borderTop: i ? `1px solid ${TI.border}` : 'none',
                background: TI.surface }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: TI.mono, fontSize: 12.5, fontWeight: 800, color: TI.ink }}>{b.booking_id}</span>
                    <Pill status={b.status} />
                  </div>
                  <div style={{ fontSize: 13, color: TI.ink2, fontWeight: 600 }}>{b.guest_name}</div>
                  <div style={{ fontSize: 12, color: TI.sub, marginTop: 2 }}>
                    {b.check_in} to {b.check_out} - {b.nights} night{b.nights !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: TI.mono, fontSize: 12.5, fontWeight: 800,
                  color: TI.ink, alignSelf: 'center' }}>
                  {peso(b.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function DeleteRoomModal({ room, onClose, onConfirm, deleting }) {
  return (
    <Modal onClose={onClose} width={420}>
      <div style={{ padding: '26px 26px 22px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: TI.negSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <Ico name="trash" size={20} color={TI.neg} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: TI.ink, marginBottom: 7 }}>Delete room?</div>
            <div style={{ fontSize: 13.5, color: TI.sub, lineHeight: 1.5 }}>
              Delete <b style={{ color: TI.ink }}>{room.name}</b> ({room.room_id}) from the room listings.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="outline" onClick={onClose} disabled={deleting}>Cancel</Btn>
          <Btn variant="dangerSolid" icon="trash" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div style={{ padding: 12, borderRadius: TI.radiusSm, background: TI.surfaceAlt,
      border: `1px solid ${TI.border}` }}>
      <div style={{ fontSize: 11, color: TI.sub, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, color: TI.ink, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const peso = (n) => `\u20b1${Number(n).toLocaleString()}`;

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [toast, setToast] = useState(null);
  const [toastKind, setToastKind] = useState('pos');
  const [formState, setFormState] = useState(null);
  const [calendarState, setCalendarState] = useState(null);
  const [calendarBookings, setCalendarBookings] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [busyToggle, setBusyToggle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const availableRoomTypes = Array.from(
    new Map(
      [
        ...DEFAULT_ROOM_TYPES,
        ...rooms
          .filter(r => r.room_type && r.room_type_name)
          .map(r => ({ id: r.room_type, name: r.room_type_name })),
        ...roomTypes,
      ].map(t => [String(t.id), t])
    ).values()
  );

  const fire = (msg, kind = 'pos') => {
    setToast(msg);
    setToastKind(kind);
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    api.get('/rooms/').then(r => setRooms(r.data.results || r.data));
    api.get('/room-types/').then(r => setRoomTypes(r.data.results || r.data));
  }, []);

  const toggle = async (id, name, roomId) => {
    setBusyToggle(id);
    try {
      const { data } = await api.post(`/rooms/${id}/toggle_status/`);
      setRooms(r => r.map(x => x.id === id ? data : x));
      fire(`${name} (${roomId}) ${data.status === 'Active' ? 'activated' : 'deactivated'}`);
    } catch {
      fire('Status update failed', 'neg');
    } finally {
      setBusyToggle(null);
    }
  };

  const openCalendar = async (room) => {
    setCalendarState(room);
    setCalendarBookings([]);
    setCalendarLoading(true);
    try {
      const { data } = await api.get(`/bookings/?room=${room.id}`);
      setCalendarBookings(data.results || data);
    } catch {
      fire('Calendar failed to load', 'neg');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleSaved = (saved) => {
    setRooms(list => {
      const exists = list.some(r => r.id === saved.id);
      return exists ? list.map(r => r.id === saved.id ? saved : r) : [saved, ...list];
    });
    setFormState(null);
    fire(`${saved.name} ${formState?.mode === 'edit' ? 'updated' : 'added'}`);
  };

  const deleteRoom = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/rooms/${deleteTarget.id}/`);
      setRooms(list => list.filter(r => r.id !== deleteTarget.id));
      fire(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (e) {
      fire(e.response?.data?.detail || 'Delete failed', 'neg');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <SectionTitle kicker="Room Management" title="Rooms & Listings"
        sub="Add, edit and deactivate rooms - set type, capacity and nightly price"
        right={<Btn icon="plus" onClick={() => setFormState({ mode: 'add', room: null })}>Add room</Btn>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {rooms.map(r => (
          <Card key={r.id} pad={0} style={{ overflow: 'hidden', opacity: r.status === 'Inactive' ? .7 : 1 }}>
            <div style={{ height: 132, background: r.gradient_css || TI.accent, position: 'relative',
              display: 'flex', alignItems: 'flex-end', padding: 12, overflow: 'hidden' }}>
              {r.image_url && (
                <img src={r.image_url} alt="" style={{ position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {r.image_url && (
                <div style={{ position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, rgba(15,23,42,.08), rgba(15,23,42,.28))' }} />
              )}
              <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10.5, fontFamily: TI.mono,
                fontWeight: 700, color: '#fff', background: 'rgba(15,23,42,.35)', backdropFilter: 'blur(4px)',
                padding: '4px 9px', borderRadius: 999 }}>{r.room_id}</span>
              <span style={{ position: 'absolute', top: 12, right: 12 }}><Pill status={r.status} /></span>
              {!r.image_url && (
                <Ico name="bed" size={42} color="rgba(255,255,255,.85)" sw={1.3} style={{ margin: '0 auto' }} />
              )}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TI.ink }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: TI.sub, marginTop: 2 }}>{r.room_type_name} - sleeps {r.capacity} - floor {r.floor}</div>
                </div>
                <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink, letterSpacing: '-0.02em' }}>{peso(r.price)}</div>
                  <div style={{ fontSize: 10.5, color: TI.sub }}>/ night</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 7, margin: '13px 0', flexWrap: 'wrap' }}>
                {(r.amenities || []).slice(0, 5).map(a => (
                  <span key={a} title={AMENITY_LABELS[a] || a} style={{ width: 30, height: 30, borderRadius: 8,
                    background: TI.surfaceAlt, border: `1px solid ${TI.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ico name={a} size={15} color={TI.ink2} />
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 13, borderTop: `1px solid ${TI.border}` }}>
                <Btn size="sm" variant="outline" icon="edit" full
                  onClick={() => setFormState({ mode: 'edit', room: r })}>Edit</Btn>
                <Btn size="sm" variant="ghost" icon="cal" onClick={() => openCalendar(r)}>Calendar</Btn>
                <Btn size="sm" variant="danger" icon="trash" onClick={() => setDeleteTarget(r)}>Delete</Btn>
                <Toggle on={r.status === 'Active'}
                  onClick={() => busyToggle === r.id ? null : toggle(r.id, r.name, r.room_id)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {formState && (
        <RoomFormModal
          mode={formState.mode}
          room={formState.room}
          roomTypes={availableRoomTypes}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}

      {calendarState && (
        <CalendarModal
          room={calendarState}
          bookings={calendarBookings}
          loading={calendarLoading}
          onClose={() => setCalendarState(null)}
        />
      )}

      {deleteTarget && (
        <DeleteRoomModal
          room={deleteTarget}
          deleting={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteRoom}
        />
      )}

      <Toast msg={toast} kind={toastKind} />
    </div>
  );
}
