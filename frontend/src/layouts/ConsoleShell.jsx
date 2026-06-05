import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Ico from '../components/Ico';
import Avatar from '../components/Avatar';
import Pill from '../components/Pill';
import BrandMark from '../components/BrandMark';
import { TI } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

// ── Sign-out confirmation modal ───────────────────────────────────────────────

function SignOutModal({ onConfirm, onCancel }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <>
      {/* backdrop */}
      <div onClick={onCancel} style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(4px)',
      }} />
      {/* centering wrapper — flexbox avoids transform conflict with ti-fade */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
      }}>
      {/* dialog */}
      <div className="ti-fade" onClick={e => e.stopPropagation()} style={{
        pointerEvents: 'all',
        width: 400, maxWidth: '100%', background: TI.surface, borderRadius: TI.radiusLg,
        boxShadow: TI.shadowLg, padding: '28px 28px 22px', fontFamily: TI.ui,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: TI.negSoft, flex: '0 0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico name="logout" size={21} color={TI.neg} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: TI.ink, marginBottom: 7 }}>Sign out?</div>
            <div style={{ fontSize: 13.5, color: TI.sub, lineHeight: 1.55 }}>
              You'll be returned to the login screen. Any unsaved changes will be lost.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '9px 20px', borderRadius: 999, border: `1px solid ${TI.border}`,
            background: TI.surface, color: TI.ink2, fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: '9px 20px', borderRadius: 999, border: 'none',
            background: TI.neg, color: '#fff', fontSize: 13.5, fontWeight: 600,
            fontFamily: TI.ui, cursor: 'pointer',
          }}>Sign out</button>
        </div>
      </div>
      </div>
    </>
  );
}

// ── Search bar ────────────────────────────────────────────────────────────────

const STATUS_ICON = { Confirmed: 'check', Cancelled: 'x', Pending: 'clock',
                      Completed: 'check', Active: 'check', Inactive: 'x' };

function SearchBar({ userRole }) {
  const navigate = useNavigate();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState(null);
  const [focused, setFocused] = useState(false);
  const [busy, setBusy]       = useState(false);
  const debounce = useRef(null);
  const wrapRef  = useRef(null);

  const runSearch = useCallback((q) => {
    if (q.trim().length < 2) { setResults(null); return; }
    setBusy(true);
    api.get(`/search/?q=${encodeURIComponent(q.trim())}`)
      .then(r => setResults(r.data))
      .catch(() => setResults(null))
      .finally(() => setBusy(false));
  }, []);

  const onChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => runSearch(q), 280);
  };

  const clear = () => { setQuery(''); setResults(null); };

  // Close on outside click
  useEffect(() => {
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const hasResults = results && (results.bookings?.length || results.rooms?.length || results.customers?.length);
  const showDrop   = focused && query.length >= 2;

  const goTo = (section) => {
    const base = userRole === 'admin' ? '/admin' : '/owner';
    const map  = { bookings: `${base}/bookings`, rooms: `${base}/rooms`, customers: `${base}/customers` };
    if (map[section]) { navigate(map[section]); setFocused(false); clear(); }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
        height: 38, width: 230,
        background: focused ? TI.surface : TI.surfaceAlt,
        border: `1px solid ${focused ? TI.accent : TI.border}`, borderRadius: 999,
        transition: 'border-color .15s, background .15s',
      }}>
        <Ico name="search" size={15} color={focused ? TI.accent : TI.faint} />
        <input value={query} onChange={onChange}
          onFocus={() => setFocused(true)}
          placeholder="Search…"
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontSize: 13, color: TI.ink, fontFamily: TI.ui }} />
        {query && (
          <button onClick={clear} style={{ border: 'none', background: 'transparent',
            cursor: 'pointer', display: 'flex', padding: 0 }}>
            <Ico name="x" size={13} color={TI.faint} />
          </button>
        )}
      </div>

      {showDrop && (
        <div style={{
          position: 'absolute', top: 44, left: 0, minWidth: 340,
          background: TI.surface, border: `1px solid ${TI.border}`,
          borderRadius: TI.radius, boxShadow: TI.shadowMd, zIndex: 500,
          maxHeight: 380, overflowY: 'auto',
        }}>
          {busy && (
            <div style={{ padding: '14px 16px', fontSize: 13, color: TI.sub }}>Searching…</div>
          )}
          {!busy && !hasResults && (
            <div style={{ padding: '14px 16px', fontSize: 13, color: TI.sub }}>
              No results for <b style={{ color: TI.ink }}>"{query}"</b>
            </div>
          )}
          {!busy && hasResults && (
            <>
              {results.bookings?.length > 0 && (
                <SearchSection label="Bookings" onViewAll={() => goTo('bookings')}>
                  {results.bookings.map(b => (
                    <SearchRow key={b.id} onClick={() => goTo('bookings')}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: TI.accentSoft,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                        <Ico name="cal" size={14} color={TI.accent} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TI.ink }}>
                          <span style={{ fontFamily: TI.mono }}>{b.booking_id}</span> · {b.guest_name}
                        </div>
                        <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 1 }}>{b.room_name}</div>
                      </div>
                      <Pill status={b.status} />
                    </SearchRow>
                  ))}
                </SearchSection>
              )}
              {results.rooms?.length > 0 && (
                <SearchSection label="Rooms" onViewAll={() => goTo('rooms')}>
                  {results.rooms.map(r => (
                    <SearchRow key={r.id} onClick={() => goTo('rooms')}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: TI.accentSoft,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                        <Ico name="bed" size={14} color={TI.accent} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TI.ink }}>
                          <span style={{ fontFamily: TI.mono }}>{r.room_id}</span> · {r.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 1 }}>{r.room_type_name}</div>
                      </div>
                      <Pill status={r.status} />
                    </SearchRow>
                  ))}
                </SearchSection>
              )}
              {results.customers?.length > 0 && (
                <SearchSection label="Customers" onViewAll={() => goTo('customers')}>
                  {results.customers.map(c => (
                    <SearchRow key={c.id} onClick={() => goTo('customers')}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: TI.accentSoft,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                        <Ico name="user" size={14} color={TI.accent} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TI.ink }}>{c.full_name}</div>
                        <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 1 }}>{c.email}</div>
                      </div>
                    </SearchRow>
                  ))}
                </SearchSection>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SearchSection({ label, onViewAll, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px 4px' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, fontFamily: TI.mono, color: TI.faint,
          textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
        <button onClick={onViewAll} style={{ fontSize: 11.5, color: TI.accent, fontWeight: 600,
          border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: TI.ui }}>
          View all
        </button>
      </div>
      {children}
    </div>
  );
}

function SearchRow({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
        cursor: 'pointer', background: hov ? TI.surfaceAlt : 'transparent',
        transition: 'background .1s' }}>
      {children}
    </div>
  );
}

// ── Notification bell ─────────────────────────────────────────────────────────

const NOTIF_KEY = 'ti_notif_seen_at';

const KIND_STYLES = {
  Confirmed: { bg: TI.posSoft,  ink: TI.pos,  icon: 'check'   },
  Cancelled: { bg: TI.negSoft,  ink: TI.neg,  icon: 'x'       },
  Inactive:  { bg: TI.warnSoft, ink: TI.warn, icon: 'bed'      },
  Pending:   { bg: TI.warnSoft, ink: TI.warn, icon: 'clock'    },
  Active:    { bg: TI.posSoft,  ink: TI.pos,  icon: 'check'    },
  info:      { bg: TI.infoSoft, ink: TI.info, icon: 'refresh'  },
};

function NotificationBell() {
  const [open,  setOpen]  = useState(false);
  const [items, setItems] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    api.get('/audit/').then(r => {
      const data = r.data.results || r.data;
      setItems(data);
      const lastSeen = localStorage.getItem(NOTIF_KEY);
      if (data.length > 0) {
        const newest = data[0]?.timestamp;
        setHasNew(!lastSeen || (newest && new Date(newest) > new Date(lastSeen)));
      }
    }).catch(() => {});
  }, []);

  const toggleOpen = () => {
    if (!open) {
      // Mark all as seen
      localStorage.setItem(NOTIF_KEY, new Date().toISOString());
      setHasNew(false);
    }
    setOpen(o => !o);
  };

  // Close on outside click
  useEffect(() => {
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button onClick={toggleOpen} style={{
        width: 38, height: 38, borderRadius: 999,
        border: `1px solid ${open ? TI.accent : TI.border}`,
        background: open ? TI.accentSoft : TI.surface,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', transition: 'border-color .15s, background .15s',
      }}>
        <Ico name="bell" size={17} color={open ? TI.accent : TI.ink2} />
        {hasNew && (
          <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8,
            borderRadius: 4, background: TI.neg, border: '2px solid #fff' }} />
        )}
      </button>

      {open && (
        <div className="ti-fade" style={{
          position: 'absolute', top: 46, right: 0, width: 'min(340px, calc(100vw - 28px))',
          background: TI.surface, border: `1px solid ${TI.border}`,
          borderRadius: TI.radius, boxShadow: TI.shadowMd, zIndex: 500,
        }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${TI.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: TI.ink }}>Notifications</span>
            <span style={{ fontSize: 11.5, color: TI.sub }}>{items.length} recent</span>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {items.length === 0 && (
              <div style={{ padding: '18px 16px', fontSize: 13, color: TI.sub, textAlign: 'center' }}>
                No notifications yet.
              </div>
            )}
            {items.map((a, i) => {
              const s = KIND_STYLES[a.kind] || KIND_STYLES.info;
              return (
                <div key={a.id} style={{
                  display: 'flex', gap: 12, padding: '11px 16px',
                  borderTop: i ? `1px solid ${TI.border}` : 'none',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, flex: '0 0 auto',
                    background: s.bg, color: s.ink,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ico name={s.icon} size={15} color={s.ink} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: TI.ink, lineHeight: 1.4 }}>
                      <b>{a.action}</b>
                      {' · '}
                      <span style={{ fontFamily: TI.mono, fontSize: 12, color: TI.sub }}>{a.target}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 2 }}>{a.who}</div>
                  </div>
                  <div style={{ fontSize: 11, color: TI.faint, whiteSpace: 'nowrap', paddingTop: 2 }}>{a.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

function useIsMobileConsole() {
  const getMobile = () => window.matchMedia('(max-width: 820px)').matches;
  const [mobile, setMobile] = useState(getMobile);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 820px)');
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return mobile;
}

export default function ConsoleShell({ roleTag, nav, route, onNav, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cur = nav.find(n => n.id === route) || nav[0];
  const [showSignOut, setShowSignOut] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobileConsole();

  useEffect(() => {
    if (user?.role === 'owner' || user?.role === 'admin') {
      api.get('/analytics/model-info/')
        .then(r => setModelInfo(r.data))
        .catch(() => setModelInfo(null));
    }
  }, [user?.role]);

  const handleLogout = () => { logout(); navigate('/'); };
  const handleNav = (id) => {
    onNav(id);
    setDrawerOpen(false);
  };

  const sidebarContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 8px 22px' }}>
        <BrandMark size={44} radius={12} iconSize={23} style={{ boxShadow: '0 4px 12px rgba(79,70,229,.3)' }} />
        <div style={{ lineHeight: 1.1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: TI.ink, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>Traveller's Inn</div>
          <div style={{ fontSize: 9.5, color: TI.sub, letterSpacing: 1.5, fontFamily: TI.mono, textTransform: 'uppercase' }}>{roleTag}</div>
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <div style={{ fontSize: 10, fontFamily: TI.mono, letterSpacing: 1.5, color: TI.faint,
          padding: '0 10px 8px', textTransform: 'uppercase' }}>{roleTag}</div>
        {nav.map(n => {
          const on = n.id === route;
          return (
            <button key={n.id} className="ti-nav" onClick={() => handleNav(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px',
              borderRadius: 9, border: 'none', cursor: 'pointer',
              background: on ? TI.accentSoft : 'transparent',
              color: on ? TI.accent : TI.ink2,
              fontSize: 13.5, fontWeight: on ? 700 : 500, fontFamily: TI.ui, textAlign: 'left', width: '100%',
            }}>
              <Ico name={n.icon} size={17} sw={on ? 2 : 1.7} /> {n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ background: TI.surfaceAlt, border: `1px solid ${TI.border}`, borderRadius: TI.radius, padding: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: TI.pos, boxShadow: `0 0 8px ${TI.pos}` }} />
          <span style={{ fontSize: 10.5, fontFamily: TI.mono, letterSpacing: .5, color: TI.ink, fontWeight: 600 }}>{modelInfo?.status_label || 'MODEL STATUS'}</span>
        </div>
        <div style={{ fontSize: 11.5, color: TI.sub, lineHeight: 1.5 }}>
          {modelInfo?.training_message || 'Loading model training status.'}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: TI.bg, fontFamily: TI.ui, overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 240, flex: '0 0 240px', background: TI.navBg,
        borderRight: `1px solid ${TI.border}`, display: isMobile ? 'none' : 'flex', flexDirection: 'column', padding: '20px 14px' }}>
        {sidebarContent}
      </aside>

      {isMobile && drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(15,23,42,.42)', backdropFilter: 'blur(2px)',
          }} />
          <aside className="ti-fade" style={{
            position: 'fixed', inset: '0 auto 0 0', width: 'min(82vw, 292px)', zIndex: 901,
            background: TI.navBg, borderRight: `1px solid ${TI.border}`,
            display: 'flex', flexDirection: 'column', padding: '20px 14px', boxShadow: TI.shadowLg,
          }}>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* ── Content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: isMobile ? 58 : 62, flex: `0 0 ${isMobile ? 58 : 62}px`, borderBottom: `1px solid ${TI.border}`,
          background: TI.surface, display: 'flex', alignItems: 'center', padding: isMobile ? '0 14px' : '0 26px', gap: isMobile ? 10 : 18 }}>

          {isMobile && (
            <button onClick={() => setDrawerOpen(true)} title="Open menu" style={{
              width: 38, height: 38, borderRadius: 10, border: `1px solid ${TI.border}`,
              background: TI.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flex: '0 0 auto',
            }}>
              <Ico name="list" size={18} color={TI.ink2} />
            </button>
          )}

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: TI.sub, fontSize: 13, minWidth: 0 }}>
            <Ico name={cur.icon} size={16} color={TI.faint} />
            <span style={{ fontWeight: 600, color: TI.ink2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cur.label}</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            {!isMobile && <SearchBar userRole={user?.role} />}

            {/* Notifications */}
            <NotificationBell />

            {/* User + sign-out */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 9, paddingLeft: isMobile ? 0 : 4,
              borderLeft: isMobile ? 'none' : `1px solid ${TI.border}`, marginLeft: isMobile ? 0 : 2 }}>
              <Avatar name={user?.name || 'User'} size={34} />
              <div style={{ lineHeight: 1.15, display: isMobile ? 'none' : 'block' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TI.ink }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: 11, color: TI.sub }}>{roleTag}</div>
              </div>
              <button onClick={() => setShowSignOut(true)} title="Sign out"
                style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${TI.border}`,
                  background: 'transparent', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginLeft: 2,
                  transition: 'background .15s, border-color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = TI.negSoft; e.currentTarget.style.borderColor = TI.neg + '55'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = TI.border; }}>
                <Ico name="logout" size={15} color={TI.sub} />
              </button>
            </div>
          </div>
        </header>

        <main key={route} className="ti-fade ti-responsive-scope"
          style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 14px 28px' : '28px 30px 40px' }}>
          {children}
        </main>
      </div>

      {/* ── Sign-out modal ── */}
      {showSignOut && (
        <SignOutModal
          onConfirm={handleLogout}
          onCancel={() => setShowSignOut(false)}
        />
      )}
    </div>
  );
}
