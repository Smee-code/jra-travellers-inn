import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import Ico from '../../components/Ico';
import { TI } from '../../theme';
import useInnContact from '../../hooks/useInnContact';
import usePushNotifications from '../../hooks/usePushNotifications';

const M = { ink: TI.ink, sub: TI.sub, faint: TI.faint, border: TI.border, accent: TI.accent, surface: '#fff', bg: '#f2f3f7', ui: TI.ui };

export default function Profile({ isDesktop = false }) {
  const { user, logout } = useAuth();
  const innContact = useInnContact();
  const push = usePushNotifications();
  const navigate = useNavigate();
  const [panel, setPanel] = useState(null);

  const rows = [
    { ic: 'user', t: 'Personal information', d: user?.name },
    { ic: 'mail', t: 'Email', d: user?.email },
    { ic: 'phone', t: 'Phone', d: user?.phone || 'Not set' },
    { ic: 'lock', t: 'Password & security' },
    { ic: 'bell', t: 'Notifications' },
    { ic: 'phone', t: 'Contact the inn', d: innContact.phone },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ paddingBottom: isDesktop ? 36 : 96, background: M.bg, minHeight: '100%' }}>
      <div style={{ padding: isDesktop ? '26px 28px 14px' : '18px 18px 12px', background: M.surface,
        borderBottom: `1px solid ${M.border}` }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: M.ink }}>Profile</div>
      </div>
      <div style={{ padding: isDesktop ? '24px 28px' : '16px 18px', maxWidth: isDesktop ? 980 : 'none', margin: isDesktop ? '0 auto' : 0,
        display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '320px minmax(0, 1fr)' : undefined, gap: 18,
        alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: M.surface, borderRadius: 18, padding: 20, border: `1px solid ${M.border}`,
            display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={user?.name || 'Guest'} size={56} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: M.ink, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Guest'}</div>
              <div style={{ fontSize: 13, color: M.sub, marginTop: 2 }}>Traveller's Inn member</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '14px',
            borderRadius: 14, border: `1px solid ${M.border}`, background: M.surface,
            color: TI.neg, fontSize: 14.5, fontWeight: 700, fontFamily: M.ui, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Ico name="logout" size={17} color={TI.neg} />Log out
          </button>
        </div>
        <div style={{ background: M.surface, borderRadius: 18, border: `1px solid ${M.border}`, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <button key={r.t} onClick={() => setPanel(r)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px',
              border: 'none', borderTop: i ? `1px solid ${M.border}` : 'none', cursor: 'pointer',
              background: M.surface, width: '100%', textAlign: 'left', fontFamily: M.ui }}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: TI.accentSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                <Ico name={r.ic} size={17} color={M.accent} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: M.ink }}>{r.t}</div>
                {r.d && <div style={{ fontSize: 12.5, color: M.sub, marginTop: 1 }}>{r.d}</div>}
              </div>
              <Ico name="chevR" size={16} color={M.faint} />
            </button>
          ))}
        </div>
      </div>
      {panel && (
        <div onClick={() => setPanel(null)} style={{ position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(15,23,42,.35)', display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end',
          justifyContent: 'center', padding: isDesktop ? 18 : 0 }}>
          <div onClick={e => e.stopPropagation()} className="ti-fade" style={{ width: isDesktop ? 460 : '100%',
            maxWidth: '100%', background: M.surface, borderRadius: isDesktop ? 20 : '22px 22px 0 0',
            padding: '18px 18px 28px', boxShadow: TI.shadowLg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: M.ink }}>{panel.t}</div>
              <button onClick={() => setPanel(null)} style={{ width: 32, height: 32, borderRadius: 999,
                border: `1px solid ${M.border}`, background: M.surface, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ico name="x" size={15} color={M.sub} />
              </button>
            </div>
            {panel.t === 'Notifications' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 14, borderRadius: 14, background: M.bg, border: `1px solid ${M.border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: M.ink }}>Device notifications</div>
                  <div style={{ fontSize: 12, color: M.sub, marginTop: 2 }}>
                    {push.message || 'Get notified when your booking is confirmed.'}
                  </div>
                </div>
                <button onClick={push.enable} disabled={push.isEnabled || push.status === 'enabling'} style={{ minWidth: 92, height: 34,
                  borderRadius: 999, border: 'none', background: push.isEnabled ? TI.posSoft : M.accent,
                  color: push.isEnabled ? TI.pos : '#fff', cursor: push.isEnabled || push.status === 'enabling' ? 'default' : 'pointer',
                  fontFamily: M.ui, fontSize: 12.5, fontWeight: 800 }}>
                  {push.isEnabled ? 'Enabled' : push.status === 'enabling' ? 'Enabling...' : 'Enable'}
                </button>
              </div>
            ) : panel.t === 'Contact the inn' ? (
              <div style={{ padding: 14, borderRadius: 14, background: M.bg, border: `1px solid ${M.border}`,
                display: 'grid', gap: 10 }}>
                {[
                  { label: 'Phone', value: innContact.phone, href: `tel:${innContact.phone.replace(/\s/g, '')}`, icon: 'phone' },
                  { label: 'Email', value: innContact.email, href: `mailto:${innContact.email}`, icon: 'mail' },
                  { label: 'Address', value: innContact.address, icon: 'pin' },
                ].map(item => (
                  <a key={item.label} href={item.href || undefined} style={{ display: 'flex', gap: 10, alignItems: 'center',
                    textDecoration: 'none', color: M.ink, fontSize: 13.5, lineHeight: 1.35 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 9, background: TI.accentSoft,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                      <Ico name={item.icon} size={15} color={M.accent} />
                    </span>
                    <span>
                      <span style={{ display: 'block', color: M.sub, fontSize: 11.5 }}>{item.label}</span>
                      <span style={{ fontWeight: 700 }}>{item.value}</span>
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ padding: 14, borderRadius: 14, background: M.bg, border: `1px solid ${M.border}`,
                fontSize: 13.5, color: M.ink, lineHeight: 1.5 }}>
                {panel.t === 'Password & security'
                  ? 'Please contact the inn front desk to change your password.'
                  : panel.d || 'No details available yet.'}
              </div>
            )}
            <button onClick={() => setPanel(null)} style={{ width: '100%', marginTop: 16, height: 42,
              border: 'none', borderRadius: 999, background: M.accent, color: '#fff',
              fontFamily: M.ui, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
