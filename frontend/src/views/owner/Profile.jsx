import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import Btn from '../../components/Btn';
import Card from '../../components/Card';
import Field from '../../components/Field';
import Ico from '../../components/Ico';
import SectionTitle from '../../components/SectionTitle';
import { TI } from '../../theme';

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  location: '',
};

function Toast({ msg, kind = 'pos' }) {
  if (!msg) return null;
  return (
    <div className="ti-fade" style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px',
      borderRadius: 999, background: TI.ink, color: '#fff', fontSize: 13.5,
      fontWeight: 600, boxShadow: TI.shadowLg }}>
      <Ico name={kind === 'neg' ? 'x' : 'check'} size={16} color={kind === 'neg' ? '#fca5a5' : '#6ee7b7'} sw={2.5} />
      {msg}
    </div>
  );
}

export default function Profile() {
  const { user, reload } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastKind, setToastKind] = useState('pos');

  useEffect(() => {
    setForm({
      first_name: user?.first_name || user?.name?.split(' ')[0] || '',
      last_name: user?.last_name || user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
    });
  }, [user]);

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const fire = (msg, kind = 'pos') => {
    setToast(msg);
    setToastKind(kind);
    setTimeout(() => setToast(''), 2600);
  };

  const save = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      fire('First name and last name are required.', 'neg');
      return;
    }
    if (!form.email.trim()) {
      fire('Email address is required.', 'neg');
      return;
    }

    setSaving(true);
    try {
      await api.patch('/auth/me/', form);
      await reload();
      fire('Profile updated');
    } catch (e) {
      fire(e.response?.data?.detail || 'Profile could not be saved.', 'neg');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionTitle
        kicker="Owner Profile"
        title="Personal Information"
        sub="Update your contact details and location for account records"
        right={<Btn icon="check" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={user?.name || 'Owner'} size={58} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: TI.ink, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Owner'}</div>
              <div style={{ fontSize: 12.5, color: TI.sub, marginTop: 2 }}>{user?.username}</div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
            {[
              { icon: 'mail', label: 'Email', value: form.email || 'Not set' },
              { icon: 'phone', label: 'Contact number', value: form.phone || 'Not set' },
              { icon: 'pin', label: 'Location', value: form.location || 'Not set' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 10, alignItems: 'center',
                padding: '10px 0', borderTop: `1px solid ${TI.border}` }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: TI.accentSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                  <Ico name={item.icon} size={15} color={TI.accent} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 11.5, color: TI.sub }}>{item.label}</span>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: TI.ink,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 16, fontWeight: 800, color: TI.ink, marginBottom: 14 }}>Edit profile</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
            <Field label="First name" value={form.first_name} onChange={update('first_name')} icon="user" />
            <Field label="Last name" value={form.last_name} onChange={update('last_name')} icon="user" />
            <Field label="Email address" value={form.email} onChange={update('email')} icon="mail" type="email" />
            <Field label="Contact number" value={form.phone} onChange={update('phone')} icon="phone" />
            <Field label="Location" value={form.location} onChange={update('location')} icon="pin"
              style={{ gridColumn: '1 / -1' }} placeholder="Business address or office location" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <Btn variant="outline" onClick={() => reload()} disabled={saving}>Reset</Btn>
            <Btn icon="check" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Btn>
          </div>
        </Card>
      </div>

      <Toast msg={toast} kind={toastKind} />
    </div>
  );
}
