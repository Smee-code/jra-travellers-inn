import { useEffect, useState } from 'react';
import Explore from './Explore';
import RoomDetail from './RoomDetail';
import BookingScreen from './BookingScreen';
import Success from './Success';
import Trips from './Trips';
import Profile from './Profile';
import Ico from '../../components/Ico';
import BrandMark from '../../components/BrandMark';
import { TI } from '../../theme';

const NAV_ITEMS = [
  { id: 'explore', icon: 'bed', label: 'Rooms' },
  { id: 'trips', icon: 'cal', label: 'Bookings' },
  { id: 'profile', icon: 'user', label: 'Profile' },
];

const SIDEBAR_WIDE = 248;
const SIDEBAR_COMPACT = 72;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 769px)').matches);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 769px)');
    const update = () => setIsDesktop(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

function CustomerSidebar({ activeTab, hasDetailView, compact = false, fixed = false, onSelect, onToggle }) {
  const width = compact ? SIDEBAR_COMPACT : SIDEBAR_WIDE;
  const toggleLabel = compact ? 'Expand sidebar' : 'Collapse sidebar';

  const toggleButton = (
    <button type="button" onClick={onToggle} title={toggleLabel}
      aria-label={toggleLabel}
      style={{
        width: compact ? 42 : 38,
        height: compact ? 42 : 38,
        border: `1px solid ${TI.border}`,
        borderRadius: 12,
        background: TI.surfaceAlt,
        color: TI.ink2,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
      <Ico name="menu" size={21} sw={2.2} />
    </button>
  );

  return (
    <aside style={{
      width,
      flex: `0 0 ${width}px`,
      minHeight: '100dvh',
      background: '#fff',
      borderRight: `1px solid ${TI.border}`,
      padding: compact ? '16px 10px' : '22px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? 14 : 22,
      position: fixed ? 'fixed' : 'sticky',
      left: 0,
      top: 0,
      bottom: fixed ? 0 : undefined,
      zIndex: 50,
      transition: 'width .18s ease, flex-basis .18s ease',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: compact ? 'center' : 'space-between',
        gap: 11,
        padding: compact ? 0 : '0 6px',
        flexDirection: compact ? 'column' : 'row',
      }}>
        {compact && toggleButton}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: compact ? 'center' : 'flex-start',
          gap: 11,
          minWidth: 0,
        }}>
          <BrandMark size={compact ? 38 : 46} radius={13} iconSize={compact ? 20 : 24} />
          {!compact && (
            <div style={{ lineHeight: 1.12, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: TI.ink, whiteSpace: 'nowrap' }}>Traveller's Inn</div>
              <div style={{ fontSize: 10, color: TI.sub, fontFamily: TI.mono, letterSpacing: 1.4, textTransform: 'uppercase' }}>Guest</div>
            </div>
          )}
        </div>
        {!compact && toggleButton}
      </div>

      {compact && (
        <div style={{
          width: 34,
          height: 1,
          background: TI.border,
          alignSelf: 'center',
        }} />
      )}

      {!compact && (
        <div style={{
          borderTop: `1px solid ${TI.border}`,
          paddingTop: 14,
          marginTop: -6,
        }}>
          <div style={{ fontSize: 11, color: TI.sub, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .7 }}>
            Menu
          </div>
        </div>
      )}

      <nav aria-label="Customer navigation" style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 4 }}>
        {NAV_ITEMS.map(item => {
          const active = item.id === activeTab && !hasDetailView;
          return (
            <button key={item.id} type="button" title={compact ? item.label : undefined}
              onClick={() => onSelect(item.id)}
              style={{
                minHeight: compact ? 58 : 42,
                border: 'none',
                borderRadius: compact ? 14 : 10,
                background: active ? TI.accentSoft : 'transparent',
                color: active ? TI.accent : TI.ink2,
                display: 'flex',
                flexDirection: compact ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: compact ? 'center' : 'flex-start',
                gap: compact ? 5 : 11,
                padding: compact ? '7px 4px' : '0 12px',
                cursor: 'pointer',
                fontFamily: TI.ui,
                fontSize: compact ? 10.5 : 13.5,
                fontWeight: active ? 800 : 600,
                lineHeight: 1.1,
              }}>
              <Ico name={item.icon} size={compact ? 20 : 17} sw={active ? 2.2 : 1.8} />
              {!compact && (
                <span style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default function CustomerApp() {
  const [tab, setTab] = useState('explore');
  const [view, setView] = useState(null);
  const isDesktop = useIsDesktop();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => !window.matchMedia('(min-width: 769px)').matches);

  useEffect(() => {
    setSidebarCollapsed(previous => isDesktop ? previous : true);
  }, [isDesktop]);

  const openTab = (nextTab) => {
    setView(null);
    setTab(nextTab);
  };

  let screen;
  if (view?.type === 'room') {
    screen = <RoomDetail id={view.id} dates={view.dates} isDesktop={isDesktop}
      onBack={() => setView(null)}
      onReserve={(id, dates) => setView({ type: 'book', id, dates })} />;
  } else if (view?.type === 'book') {
    screen = <BookingScreen id={view.id} dates={view.dates} isDesktop={isDesktop}
      onBack={() => setView({ type: 'room', id: view.id, dates: view.dates })}
      onConfirm={(booking) => setView({ type: 'success', booking })} />;
  } else if (view?.type === 'success') {
    screen = <Success booking={view.booking} onDone={() => { setView(null); setTab('trips'); }} />;
  } else if (tab === 'explore') {
    screen = <Explore isDesktop={isDesktop} onOpen={(id, dates) => setView({ type: 'room', id, dates })} />;
  } else if (tab === 'trips') {
    screen = <Trips isDesktop={isDesktop} onBookAgain={(id) => setView({ type: 'room', id })} />;
  } else {
    screen = <Profile isDesktop={isDesktop} />;
  }

  if (isDesktop) {
    const title = view ? 'Reservation' : NAV_ITEMS.find(item => item.id === tab)?.label;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#eef1f6', fontFamily: TI.ui }}>
        <CustomerSidebar activeTab={tab} hasDetailView={Boolean(view)}
          compact={sidebarCollapsed} onSelect={openTab}
          onToggle={() => setSidebarCollapsed(value => !value)} />
        <main style={{ flex: 1, minWidth: 0, height: '100vh', overflow: 'auto' }}>
          <header style={{ height: 64, background: '#fff', borderBottom: `1px solid ${TI.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TI.ink }}>{title}</div>
            <div style={{ fontSize: 12.5, color: TI.sub }}>Book direct by the bay</div>
          </header>
          <div key={view ? view.type + (view.id || '') : tab} className="ti-fade"
            style={{ minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
            {screen}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#f2f3f7', fontFamily: TI.ui, color: TI.ink }}>
      <CustomerSidebar activeTab={tab} hasDetailView={Boolean(view)}
        compact={sidebarCollapsed} fixed onSelect={openTab}
        onToggle={() => setSidebarCollapsed(value => !value)} />
      <main key={view ? view.type + (view.id || '') : tab} className="ti-fade"
        style={{ flex: 1, minWidth: 0, marginLeft: sidebarCollapsed ? SIDEBAR_COMPACT : SIDEBAR_WIDE,
          minHeight: '100dvh', background: '#f2f3f7', transition: 'margin-left .18s ease' }}>
        {screen}
      </main>
    </div>
  );
}
