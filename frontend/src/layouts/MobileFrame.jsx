import { TI } from '../theme';

function StatusBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 22px 6px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
      pointerEvents: 'none' }}>
      <span style={{ fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 15, color: '#000' }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {/* signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#000"/>
          <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="#000"/>
          <rect x="9" y="2" width="3" height="10" rx="0.5" fill="#000"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#000"/>
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#000" strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill="#000"/>
          <path d="M23 4v4c.8-.3 1.4-1.2 1.4-2 0-.8-.6-1.7-1.4-2z" fill="#000" fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

export default function MobileFrame({ children, footer, width = 390, height = 844 }) {
  return (
    <div style={{ width: `min(${width}px, 100vw)`, height: `min(${height}px, 100dvh)`,
      borderRadius: 'clamp(0px, 10vw, 48px)', overflow: 'hidden', position: 'relative',
      background: '#F2F2F7', boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      {/* dynamic island */}
      <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 34, borderRadius: 24, background: '#000', zIndex: 50,
        pointerEvents: 'none' }} />
      <StatusBar />
      {/* scrollable content */}
      <div style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
        {children}
      </div>
      {footer && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 55,
          pointerEvents: 'none' }}>
          {footer}
        </div>
      )}
      {/* home indicator */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 32, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingBottom: 8, pointerEvents: 'none' }}>
        <div style={{ width: 134, height: 5, borderRadius: 100, background: 'rgba(0,0,0,0.25)' }} />
      </div>
    </div>
  );
}
