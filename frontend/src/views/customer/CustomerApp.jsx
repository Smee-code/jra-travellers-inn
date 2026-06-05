import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Explore from './Explore';
import RoomDetail from './RoomDetail';
import BookingScreen from './BookingScreen';
import Success from './Success';
import Trips from './Trips';
import Profile from './Profile';
import Ico from '../../components/Ico';
import BrandMark from '../../components/BrandMark';
import { TI } from '../../theme';

const M = { accent: TI.accent, faint: TI.faint, border: TI.border, surface: '#fff', ui: TI.ui };
const TABS = [
  { id: 'explore', icon: 'bed', label: 'Rooms' },
  { id: 'trips', icon: 'cal', label: 'Trips' },
  { id: 'profile', icon: 'user', label: 'Profile' },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 900px)').matches);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px)');
    const update = () => setIsDesktop(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

function TabBar({ tab, setTab, onSelect }) {
  return (
    <nav aria-label="Customer navigation" style={{ height: 'calc(72px + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)', background: '#fff',
      borderTop: `1px solid ${M.border}`, boxShadow: '0 -10px 30px rgba(15,23,42,.10)',
      display: 'flex', pointerEvents: 'auto' }}>
      {TABS.map(t => {
        const on = t.id === tab;
        return (
          <button key={t.id} onClick={() => onSelect ? onSelect(t.id) : setTab(t.id)} style={{ flex: 1, border: 'none',
            background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4, paddingTop: 9, color: on ? M.accent : M.faint }}>
            <Ico name={t.icon} size={22} sw={on ? 2.2 : 1.8} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 500, fontFamily: M.ui }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function CustomerApp() {
  const [tab, setTab] = useState('explore');
  const [view, setView] = useState(null);
  const isDesktop = useIsDesktop();
  const showTabs = true;
  const openTab = (nextTab) => {
    setView(null);
    setTab(nextTab);
  };

  let screen;
  if (view?.type === 'room') screen = <RoomDetail id={view.id} dates={view.dates} isDesktop={isDesktop} onBack={() => setView(null)} onReserve={(id, dates) => setView({ type: 'book', id, dates })} />;
  else if (view?.type === 'book') screen = <BookingScreen id={view.id} dates={view.dates} isDesktop={isDesktop} onBack={() => setView({ type: 'room', id: view.id, dates: view.dates })} onConfirm={(b) => setView({ type: 'success', booking: b })} />;
  else if (view?.type === 'success') screen = <Success booking={view.booking} onDone={() => { setView(null); setTab('trips'); }} />;
  else if (tab === 'explore') screen = <Explore isDesktop={isDesktop} onOpen={(id, dates) => setView({ type: 'room', id, dates })} />;
  else if (tab === 'trips') screen = <Trips isDesktop={isDesktop} onBookAgain={(id) => setView({ type: 'room', id })} />;
  else screen = <Profile isDesktop={isDesktop} />;

  if (isDesktop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#eef1f6', fontFamily: TI.ui }}>
        <aside style={{ width: 248, flex: '0 0 248px', background: '#fff', borderRight: `1px solid ${TI.border}`,
          padding: '22px 16px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 6px' }}>
            <BrandMark size={46} radius={13} iconSize={24} />
            <div style={{ lineHeight: 1.12 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: TI.ink }}>Traveller's Inn</div>
              <div style={{ fontSize: 10, color: TI.sub, fontFamily: TI.mono, letterSpacing: 1.4, textTransform: 'uppercase' }}>Guest</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {TABS.map(t => {
              const on = t.id === tab && !view;
              return (
                <button key={t.id} onClick={() => { setView(null); setTab(t.id); }} style={{
                  height: 42, border: 'none', borderRadius: 10, background: on ? TI.accentSoft : 'transparent',
                  color: on ? TI.accent : TI.ink2, display: 'flex', alignItems: 'center', gap: 11,
                  padding: '0 12px', cursor: 'pointer', fontFamily: TI.ui, fontSize: 13.5,
                  fontWeight: on ? 700 : 500,
                }}>
                  <Ico name={t.icon} size={17} />{t.label}
                </button>
              );
            })}
          </nav>
        </aside>
        <main style={{ flex: 1, minWidth: 0, height: '100vh', overflow: 'auto' }}>
          <header style={{ height: 64, background: '#fff', borderBottom: `1px solid ${TI.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TI.ink }}>
              {view ? 'Reservation' : TABS.find(t => t.id === tab)?.label}
            </div>
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
    <div style={{ minHeight: '100dvh', background: '#f2f3f7', fontFamily: TI.ui,
      color: TI.ink, overflowX: 'hidden' }}>
      <main key={view ? view.type + (view.id || '') : tab} className="ti-fade"
        style={{ minHeight: '100dvh', background: '#f2f3f7', paddingBottom: 104 }}>
        {screen}
      </main>
      {showTabs && createPortal(
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 2147483000,
          display: isDesktop ? 'none' : 'block', pointerEvents: 'auto' }}>
          <TabBar tab={tab} setTab={setTab} onSelect={openTab} />
        </div>,
        document.body
      )}
    </div>
  );
}
