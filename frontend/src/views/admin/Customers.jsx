import { useState, useEffect } from 'react';
import api from '../../api/client';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Btn from '../../components/Btn';
import Avatar from '../../components/Avatar';
import Toggle from '../../components/Toggle';
import SectionTitle from '../../components/SectionTitle';
import Ico from '../../components/Ico';
import { TI } from '../../theme';

// ── Toast (flexbox-centred to avoid ti-fade transform conflict) ───────────────

function Toast({ msg, kind = 'pos' }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 26, left: 0, right: 0, zIndex: 9999,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div className="ti-fade" style={{
        pointerEvents: 'all', display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 20px', borderRadius: 999, background: TI.ink, color: '#fff',
        fontSize: 13.5, fontWeight: 600, boxShadow: TI.shadowLg,
      }}>
        <Ico name={kind === 'neg' ? 'x' : 'check'} size={16}
          color={kind === 'neg' ? '#fca5a5' : '#6ee7b7'} sw={2.5} />
        {msg}
      </div>
    </div>
  );
}

// ── Shared modal shell ────────────────────────────────────────────────────────

function Modal({ children, onClose, width = 460 }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(4px)',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
      }}>
        <div className="ti-fade" onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'all', width, maxWidth: '100%',
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

// ── Deactivate confirmation ───────────────────────────────────────────────────

function DeactivateModal({ customer, onConfirm, onClose }) {
  return (
    <Modal onClose={onClose} width={400}>
      <div style={{ padding: '28px 28px 22px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: TI.warnSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <Ico name="user" size={21} color={TI.warn} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: TI.ink, marginBottom: 7 }}>
              Deactivate account?
            </div>
            <div style={{ fontSize: 13.5, color: TI.sub, lineHeight: 1.55 }}>
              <b style={{ color: TI.ink }}>{customer.full_name}</b> will lose access to the booking
              system until reactivated. Existing bookings are not affected.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 999, border: `1px solid ${TI.border}`,
            background: TI.surface, color: TI.ink2, fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: 'pointer',
          }}>Keep active</button>
          <button onClick={onConfirm} style={{
            padding: '9px 20px', borderRadius: 999, border: 'none',
            background: TI.warn, color: '#fff', fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: 'pointer',
          }}>Deactivate</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Reset password confirmation ───────────────────────────────────────────────

function ResetModal({ customer, onConfirm, onClose }) {
  return (
    <Modal onClose={onClose} width={400}>
      <div style={{ padding: '28px 28px 22px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: TI.accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <Ico name="key" size={21} color={TI.accent} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: TI.ink, marginBottom: 7 }}>
              Reset password?
            </div>
            <div style={{ fontSize: 13.5, color: TI.sub, lineHeight: 1.55 }}>
              A temporary password will be set for <b style={{ color: TI.ink }}>{customer.full_name}</b>.
              They will need to change it on their next login.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 999, border: `1px solid ${TI.border}`,
            background: TI.surface, color: TI.ink2, fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: '9px 20px', borderRadius: 999, border: 'none',
            background: TI.accent, color: '#fff', fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: 'pointer',
          }}>Reset password</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Customer detail modal ─────────────────────────────────────────────────────

function AddUserModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    role: 'customer',
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    password: 'TempPass123!',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      await onSave(form);
    } catch (error) {
      const data = error.response?.data;
      const msg = data?.username?.[0] || data?.email?.[0] || data?.password?.[0] || data?.role?.[0] || data?.detail;
      setErr(msg || 'Could not create user.');
    } finally {
      setSaving(false);
    }
  };

  const input = {
    width: '100%', height: 40, border: `1px solid ${TI.border}`, borderRadius: 9,
    padding: '0 11px', fontFamily: TI.ui, fontSize: 13.5, boxSizing: 'border-box',
  };
  const label = { display: 'block', fontSize: 12, fontWeight: 700, color: TI.ink2, marginBottom: 6 };

  return (
    <Modal onClose={onClose} width={520}>
      <form onSubmit={submit} style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink }}>Add user</div>
            <div style={{ fontSize: 12.5, color: TI.sub, marginTop: 3 }}>Create a customer or owner account.</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8,
            border: `1px solid ${TI.border}`, background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="x" size={15} color={TI.sub} />
          </button>
        </div>

        {err && <div style={{ padding: '10px 12px', borderRadius: 9, background: TI.negSoft,
          color: TI.neg, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{err}</div>}

        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={label}>Role</span>
          <select value={form.role} onChange={e => update('role', e.target.value)} style={input}>
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
          </select>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label><span style={label}>First name</span><input required value={form.first_name} onChange={e => update('first_name', e.target.value)} style={input} /></label>
          <label><span style={label}>Last name</span><input required value={form.last_name} onChange={e => update('last_name', e.target.value)} style={input} /></label>
        </div>
        <label style={{ display: 'block', marginTop: 12 }}><span style={label}>Username</span><input required value={form.username} onChange={e => update('username', e.target.value)} style={input} /></label>
        <label style={{ display: 'block', marginTop: 12 }}><span style={label}>Email</span><input required type="email" value={form.email} onChange={e => update('email', e.target.value)} style={input} /></label>
        <label style={{ display: 'block', marginTop: 12 }}><span style={label}>Phone</span><input value={form.phone} onChange={e => update('phone', e.target.value)} style={input} /></label>
        <label style={{ display: 'block', marginTop: 12 }}><span style={label}>Temporary password</span><input required value={form.password} onChange={e => update('password', e.target.value)} style={input} /></label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 999,
            border: `1px solid ${TI.border}`, background: TI.surface, color: TI.ink2, fontWeight: 700,
            fontFamily: TI.ui, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={saving} style={{ padding: '9px 20px', borderRadius: 999,
            border: 'none', background: TI.accent, color: '#fff', fontWeight: 800,
            fontFamily: TI.ui, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Creating...' : 'Create user'}</button>
        </div>
      </form>
    </Modal>
  );
}

const STATUS_COLOR = {
  Confirmed: TI.pos, Completed: TI.sub, Cancelled: TI.neg, Pending: TI.warn,
};

function CustomerDetailModal({ customer, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get(`/bookings/?guest_id=${customer.id}`)
      .then(r => setBookings(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [customer.id]);

  const peso = (n) => `₱${Number(n).toLocaleString()}`;

  return (
    <Modal onClose={onClose} width={520}>
      {/* Header */}
      <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${TI.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={customer.full_name} size={46} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink }}>{customer.full_name}</div>
            <div style={{ fontSize: 12.5, color: TI.sub, marginTop: 2 }}>
              {customer.email}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill status={customer.is_active ? 'Active' : 'Inactive'} />
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8,
            border: `1px solid ${TI.border}`, background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="x" size={15} color={TI.sub} />
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ padding: '18px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
        borderBottom: `1px solid ${TI.border}` }}>
        {[
          { icon: 'phone',  label: 'Phone',    value: customer.phone || '—' },
          { icon: 'cal',    label: 'Joined',   value: customer.joined },
          { icon: 'cal',    label: 'Bookings', value: customer.bookings_count },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ padding: '10px 12px', background: TI.surfaceAlt,
            borderRadius: TI.radiusSm, border: `1px solid ${TI.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <Ico name={icon} size={12} color={TI.faint} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: TI.sub,
                textTransform: 'uppercase', letterSpacing: .5 }}>{label}</span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: TI.ink }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Booking history */}
      <div style={{ padding: '16px 24px 22px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: TI.ink, marginBottom: 12 }}>
          Booking history
        </div>
        {loading && (
          <div style={{ fontSize: 13, color: TI.sub, padding: '8px 0' }}>Loading…</div>
        )}
        {!loading && bookings.length === 0 && (
          <div style={{ fontSize: 13, color: TI.sub, padding: '12px 0', textAlign: 'center' }}>
            No bookings yet.
          </div>
        )}
        {!loading && bookings.map((b, i) => (
          <div key={b.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
            borderTop: i > 0 ? `1px solid ${TI.border}` : 'none',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, flex: '0 0 auto',
              background: b.room_grad || TI.accentSoft, overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {b.room_image ? (
                <img src={b.room_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Ico name="bed" size={18} color="rgba(255,255,255,.75)" sw={1.5} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: TI.ink }}>{b.room_name}</div>
              <div style={{ fontSize: 12, color: TI.sub, marginTop: 2 }}>
                {b.check_in} → {b.check_out} · {b.nights} night{b.nights !== 1 ? 's' : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TI.ink, fontFamily: TI.mono }}>
                {peso(b.amount)}
              </div>
              <div style={{ marginTop: 4 }}><Pill status={b.status} /></div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Customers({ manageUsers = false }) {
  const [users,          setUsers]          = useState([]);
  const [search,         setSearch]         = useState('');
  const [toast,          setToast]          = useState(null);
  const [toastKind,      setToastKind]      = useState('pos');
  const [deactivateTarget, setDeactivate]   = useState(null);
  const [resetTarget,    setResetTarget]    = useState(null);
  const [viewTarget,     setViewTarget]     = useState(null);
  const [addOpen,        setAddOpen]        = useState(false);
  const basePath = manageUsers ? '/users' : '/customers';

  const fire = (msg, kind = 'pos') => {
    setToast(msg); setToastKind(kind);
    setTimeout(() => setToast(null), 2800);
  };

  const loadUsers = () => api.get(`${basePath}/`).then(r => setUsers(r.data.results || r.data));

  useEffect(() => {
    loadUsers();
  }, [basePath]);

  // ── Toggle (active ↔ inactive) ─────────────────────────────────────────────

  const handleToggleClick = (user) => {
    if (user.is_active) {
      setDeactivate(user);          // active → deactivating: show confirmation
    } else {
      doToggle(user.id);            // inactive → activating: immediate
    }
  };

  const doToggle = async (id) => {
    setDeactivate(null);
    try {
      const { data } = await api.post(`${basePath}/${id}/toggle_status/`);
      setUsers(u => u.map(x => x.id === id ? data : x));
      fire(
        `${data.full_name} ${data.is_active ? 'activated' : 'deactivated'}`,
        data.is_active ? 'pos' : 'neg',
      );
    } catch { fire('Action failed', 'neg'); }
  };

  // ── Reset password ─────────────────────────────────────────────────────────

  const doReset = async () => {
    const id   = resetTarget.id;
    const name = resetTarget.full_name;
    setResetTarget(null);
    try {
      await api.post(`${basePath}/${id}/reset_password/`);
      fire(`Password reset sent to ${name}`);
    } catch { fire('Reset failed', 'neg'); }
  };

  const addUser = async (payload) => {
    const { data } = await api.post(`${basePath}/`, payload);
    setUsers(list => [data, ...list.filter(u => u.id !== data.id)]);
    setAddOpen(false);
    fire(`${payload.role === 'owner' ? 'Owner' : 'Customer'} account created`);
  };

  // ── Search filter ──────────────────────────────────────────────────────────

  const q = search.trim().toLowerCase();
  const shown = users.filter(u =>
    !q
    || u.full_name.toLowerCase().includes(q)
    || u.email.toLowerCase().includes(q)
    || u.username.toLowerCase().includes(q)
    || (u.phone || '').toLowerCase().includes(q)
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <SectionTitle
        kicker="Account & User Management" title={manageUsers ? 'Users' : 'Customers'}
        sub={manageUsers ? 'Add customer and owner accounts, reset passwords, or deactivate access' : 'Activate, deactivate or reset access for registered guests'}
        right={
          /* Live search input */
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
            height: 38, width: 240,
            background: TI.surface,
            border: `1px solid ${search ? TI.accent : TI.border}`,
            borderRadius: 999, transition: 'border-color .15s',
          }}>
            <Ico name="search" size={15} color={search ? TI.accent : TI.faint} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search customers…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 13, color: TI.ink, fontFamily: TI.ui }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', padding: 0,
              }}>
                <Ico name="x" size={13} color={TI.faint} />
              </button>
            )}
          </div>
        }
      />

      {manageUsers && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Btn icon="plus" onClick={() => setAddOpen(true)}>Add user</Btn>
        </div>
      )}

      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
            <thead>
              <tr style={{ background: TI.surfaceAlt }}>
                {['Customer', 'Contact', 'Joined', 'Bookings', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 3 ? 'center' : i === 5 ? 'right' : 'left',
                    padding: '12px 18px', fontSize: 11, fontWeight: 600, color: TI.sub,
                    textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px 18px', textAlign: 'center',
                    fontSize: 13.5, color: TI.sub }}>
                    {search ? `No customers matching "${search}"` : 'No customers yet.'}
                  </td>
                </tr>
              )}
              {shown.map(u => (
                <tr key={u.id} className="ti-row" style={{ borderTop: `1px solid ${TI.border}` }}>
                  {/* Customer — clicking opens detail modal */}
                  <td style={{ padding: '14px 18px', cursor: 'pointer' }}
                    onClick={() => setViewTarget(u)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <Avatar name={u.full_name} size={36} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: TI.ink }}>{u.full_name}</div>
                        <div style={{ fontSize: 11, color: TI.sub, fontFamily: TI.mono }}>
                          {u.username}{manageUsers ? ` · ${u.role}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: 12.5 }}>{u.email}</div>
                    <div style={{ fontSize: 11.5, color: u.phone ? TI.ink2 : TI.sub, marginTop: 3 }}>
                      {u.phone || 'No phone set'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: TI.sub, fontSize: 13 }}>{u.joined}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'center',
                    fontFamily: TI.mono, fontWeight: 700, fontSize: 13 }}>
                    {u.bookings_count}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <Pill status={u.is_active ? 'Active' : 'Inactive'} />
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
                      {/* View details */}
                      <button onClick={() => setViewTarget(u)} title="View profile"
                        style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${TI.border}`,
                          background: TI.surface, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background .12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = TI.surfaceAlt}
                        onMouseLeave={e => e.currentTarget.style.background = TI.surface}>
                        <Ico name="eye" size={15} color={TI.ink2} />
                      </button>
                      {/* Reset password */}
                      <Btn size="sm" variant="ghost" icon="key"
                        onClick={() => setResetTarget(u)}>Reset</Btn>
                      {/* Activate / Deactivate toggle */}
                      <Toggle on={u.is_active} onClick={() => handleToggleClick(u)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Toast msg={toast} kind={toastKind} />

      {/* Modals */}
      {deactivateTarget && (
        <DeactivateModal
          customer={deactivateTarget}
          onConfirm={() => doToggle(deactivateTarget.id)}
          onClose={() => setDeactivate(null)}
        />
      )}
      {resetTarget && (
        <ResetModal
          customer={resetTarget}
          onConfirm={doReset}
          onClose={() => setResetTarget(null)}
        />
      )}
      {viewTarget && (
        <CustomerDetailModal
          customer={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}
      {addOpen && (
        <AddUserModal
          onSave={addUser}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
