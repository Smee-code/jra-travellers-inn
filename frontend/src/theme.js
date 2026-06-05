export const TI = {
  bg: '#f4f6f9', surface: '#ffffff', surfaceAlt: '#f8fafc', navBg: '#ffffff',
  ink: '#0f172a', ink2: '#334155', sub: '#64748b', faint: '#94a3b8',
  border: '#e6eaf0', borderStrong: '#d6dce5', grid: '#eef1f6',
  accent: '#4f46e5', accentSoft: '#eef2ff', accentDeep: '#4338ca',
  accent2: '#f59e0b', band: '#fce2bf', onAccent: '#ffffff',
  pos: '#059669', posSoft: '#ecfdf5', neg: '#dc2626', negSoft: '#fef2f2',
  warn: '#d97706', warnSoft: '#fffbeb', info: '#0284c7', infoSoft: '#eff6ff',
  radius: 12, radiusSm: 8, radiusLg: 16, radiusXl: 22,
  shadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.05)',
  shadowMd: '0 4px 16px rgba(15,23,42,.08)',
  shadowLg: '0 18px 50px rgba(15,23,42,.18)',
  ui: "'Plus Jakarta Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  donut: ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff'],
};

export const STATUS_STYLES = {
  Pending:   { bg: '#fffbeb', ink: '#d97706', dot: '#f59e0b' },
  Confirmed: { bg: '#ecfdf5', ink: '#059669', dot: '#10b981' },
  Cancelled: { bg: '#fef2f2', ink: '#dc2626', dot: '#ef4444' },
  Completed: { bg: '#f1f5f9', ink: '#475569', dot: '#94a3b8' },
  Active:    { bg: '#ecfdf5', ink: '#059669', dot: '#10b981' },
  Inactive:  { bg: '#f1f5f9', ink: '#64748b', dot: '#94a3b8' },
};

export const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { margin: 0; padding: 0; height: 100%; scroll-behavior: smooth; }
  body { font-family: ${TI.ui}; background: ${TI.bg}; color: ${TI.ink}; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; border: 2px solid ${TI.bg}; }
  ::-webkit-scrollbar-track { background: transparent; }
  .ti-btn { transition: filter .15s, transform .05s; }
  .ti-btn:hover { filter: brightness(.97); }
  .ti-btn:active { transform: translateY(1px); }
  .ti-card-h { transition: box-shadow .18s, transform .18s, border-color .18s; cursor: pointer; }
  .ti-card-h:hover { box-shadow: ${TI.shadowMd}; border-color: ${TI.borderStrong}; transform: translateY(-2px); }
  .ti-nav { transition: background .14s, color .14s; }
  .ti-row:hover { background: ${TI.surfaceAlt}; }
  input::placeholder { color: ${TI.faint}; }
  @keyframes ti-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .ti-fade { animation: ti-fade .35s ease both; }
  button { font-family: ${TI.ui}; }
  .customer-bottom-nav {
    display: none;
  }
  @media (max-width: 768px) {
    .customer-mobile-layout > main {
      padding-bottom: calc(92px + env(safe-area-inset-bottom)) !important;
    }
    nav.customer-bottom-nav {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      width: 100%;
      min-height: calc(72px + env(safe-area-inset-bottom));
      padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
      border-top: 1px solid ${TI.border};
      background: #fff;
      box-shadow: 0 -10px 30px rgba(15,23,42,.10);
      display: flex !important;
      align-items: stretch;
      justify-content: space-around;
    }
    nav.customer-bottom-nav button {
      flex: 1 1 0;
      min-width: 0;
      border: 0;
      background: transparent;
      color: ${TI.faint};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      font-family: ${TI.ui};
      font-size: 10.5px;
      font-weight: 700;
      line-height: 1;
    }
    nav.customer-bottom-nav button.active {
      color: ${TI.accent};
    }
    nav.customer-bottom-nav button span {
      display: block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  @media (min-width: 769px) {
    nav.customer-bottom-nav {
      display: none !important;
    }
  }
  @media (max-width: 820px) {
    .ti-responsive-scope h1 {
      font-size: clamp(22px, 7vw, 28px) !important;
      line-height: 1.08 !important;
    }
    .ti-responsive-scope [style*="display: grid"] {
      gap: 12px !important;
    }
    .ti-responsive-scope [style*="grid-template-columns: repeat(4"],
    .ti-responsive-scope [style*="grid-template-columns: repeat(3"],
    .ti-responsive-scope [style*="grid-template-columns: repeat(2"],
    .ti-responsive-scope [style*="grid-template-columns: 1fr 1fr"],
    .ti-responsive-scope [style*="grid-template-columns: 1.1fr"],
    .ti-responsive-scope [style*="grid-template-columns: 1.3fr"],
    .ti-responsive-scope [style*="grid-template-columns: 1.62fr"],
    .ti-responsive-scope [style*="grid-template-columns: 320px"],
    .ti-responsive-scope [style*="grid-template-columns: minmax"] {
      grid-template-columns: 1fr !important;
    }
    .ti-responsive-scope [style*="padding: 18px 24px"],
    .ti-responsive-scope [style*="padding: 20px"] {
      padding: 14px !important;
    }
    .ti-responsive-scope table {
      min-width: 720px !important;
    }
  }
  .landing-page { min-height: 100vh; background: #f4f7fb; color: ${TI.ink}; }
  .landing-hero { min-height: 92vh; padding: 22px clamp(18px, 4vw, 58px) 42px; color: #fff; background: linear-gradient(90deg, rgba(49,38,142,.88) 0%, rgba(55,48,163,.78) 42%, rgba(55,48,163,.36) 100%), url('/landing-hero.png') center/cover no-repeat, #3730a3; position: relative; overflow: hidden; display: flex; flex-direction: column; }
  .landing-hero::before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 24% 42%, rgba(79,70,229,.38), transparent 34%), linear-gradient(180deg, rgba(15,23,42,.08), rgba(15,23,42,.2)); z-index: 0; pointer-events: none; }
  .landing-hero::after { content: ""; position: absolute; inset: auto -8% -22% -8%; height: 46%; background: #f4f7fb; border-radius: 55% 55% 0 0; z-index: 0; }
  .landing-nav { position: relative; z-index: 2; height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
  .landing-brand { display: inline-flex; align-items: center; gap: 11px; color: #fff; text-decoration: none; font-size: 19px; font-weight: 800; }
  .landing-brand span { width: 42px; height: 42px; border-radius: 12px; background: ${TI.accent}; box-shadow: 0 12px 34px rgba(15,23,42,.25); display: inline-flex; align-items: center; justify-content: center; }
  .landing-nav div { display: flex; align-items: center; gap: 8px; }
  .landing-nav a, .landing-nav button { color: rgba(255,255,255,.82); text-decoration: none; font-size: 14px; font-weight: 700; padding: 10px 13px; border-radius: 999px; transition: background .22s ease, color .22s ease, transform .22s ease, box-shadow .22s ease; border: none; background: transparent; cursor: pointer; }
  .landing-nav a:hover, .landing-nav button:hover { background: rgba(255,255,255,.12); color: #fff; }
  .landing-nav .landing-login { background: #fff; color: ${TI.accentDeep}; box-shadow: 0 10px 28px rgba(15,23,42,.18); }
  .landing-hero-grid { position: relative; z-index: 1; flex: 1; display: grid; grid-template-columns: minmax(320px, 560px); align-items: center; max-width: 1160px; width: 100%; margin: 0 auto; padding: 42px 0 72px; }
  .landing-copy { max-width: 560px; }
  .landing-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.92); color: ${TI.ink}; padding: 8px 13px; border-radius: 999px; font-size: 13px; box-shadow: 0 16px 36px rgba(15,23,42,.18); }
  .landing-pill span { color: ${TI.sub}; }
  .landing-copy h1 { margin: 22px 0 14px; font-size: clamp(46px, 8vw, 86px); line-height: .9; letter-spacing: 0; font-weight: 900; }
  .landing-copy p { max-width: 510px; margin: 0; color: rgba(255,255,255,.86); font-size: clamp(16px, 2vw, 20px); line-height: 1.55; }
  .landing-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
  .landing-actions button { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; padding: 0 22px; border-radius: 999px; text-decoration: none; font-weight: 800; transition: transform .22s ease, box-shadow .22s ease, background .22s ease, border-color .22s ease; cursor: pointer; font-size: 15px; }
  .landing-actions button:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(15,23,42,.2); }
  .landing-actions button:first-child { background: #fff; color: ${TI.accentDeep}; border: 1px solid #fff; }
  .landing-actions button:last-child { color: #fff; border: 1px solid rgba(255,255,255,.32); background: rgba(255,255,255,.08); }
  .landing-stats { position: relative; z-index: 2; max-width: 980px; width: min(980px, calc(100% - 28px)); margin: -36px auto 0; display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  .landing-stat { min-height: 96px; border-radius: 18px; background: #fff; color: ${TI.ink}; box-shadow: ${TI.shadowLg}; display: flex; flex-direction: column; justify-content: center; padding: 18px 20px; }
  .landing-stat strong { font-size: clamp(24px, 4vw, 34px); line-height: 1; font-weight: 900; }
  .landing-stat span { margin-top: 8px; color: ${TI.sub}; font-size: 13px; font-weight: 700; }
  .landing-section { max-width: 1160px; margin: 0 auto; padding: 78px clamp(18px, 4vw, 28px) 0; animation: ti-fade .55s ease both; }
  .landing-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 26px; margin-bottom: 24px; }
  .landing-section-head span { color: ${TI.accent}; text-transform: uppercase; letter-spacing: 1.8px; font-family: ${TI.mono}; font-size: 12px; font-weight: 800; }
  .landing-section-head h2 { margin: 8px 0 0; font-size: clamp(28px, 4vw, 42px); line-height: 1.04; letter-spacing: 0; }
  .landing-section-head p { max-width: 360px; margin: 0; color: ${TI.sub}; line-height: 1.5; font-size: 14px; }
  .landing-room-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
  .landing-room { border: 1px solid ${TI.border}; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: ${TI.shadow}; transition: transform .24s ease, box-shadow .24s ease, border-color .24s ease; }
  .landing-room:hover { transform: translateY(-4px); box-shadow: ${TI.shadowMd}; border-color: ${TI.borderStrong}; }
  .landing-room-media { position: relative; aspect-ratio: 1.8; display: flex; align-items: center; justify-content: center; }
  .landing-room-media span { position: absolute; top: 12px; left: 12px; padding: 5px 9px; border-radius: 999px; background: rgba(15,23,42,.42); color: #fff; font-family: ${TI.mono}; font-size: 11px; font-weight: 800; }
  .landing-room-body { padding: 16px; }
  .landing-room h3 { margin: 0; font-size: 17px; }
  .landing-room p { margin: 5px 0 0; color: ${TI.sub}; font-size: 13px; }
  .landing-room-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 18px; }
  .landing-room-foot span { display: flex; align-items: center; gap: 4px; color: ${TI.ink2}; font-size: 13px; font-weight: 800; }
  .landing-room-foot strong { font-size: 18px; }
  .landing-room-foot small { color: ${TI.sub}; font-size: 12px; font-weight: 500; margin-left: 2px; }
  .landing-types { padding-bottom: 90px; }
  .landing-type-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .landing-type { border: 1px solid ${TI.border}; background: #fff; border-radius: 8px; padding: 18px; box-shadow: ${TI.shadow}; transition: transform .24s ease, box-shadow .24s ease, border-color .24s ease; }
  .landing-type:hover { transform: translateY(-3px); box-shadow: ${TI.shadowMd}; border-color: ${TI.borderStrong}; }
  .landing-type h3 { margin: 14px 0 6px; }
  .landing-type p { margin: 0 0 15px; color: ${TI.sub}; font-size: 13px; }
  .landing-type strong { font-size: 14px; }
  .landing-footer { background: #fff; border-top: 1px solid ${TI.border}; padding: 56px clamp(18px, 4vw, 28px) 40px; }
  .landing-footer-grid { max-width: 1160px; margin: 0 auto; display: grid; grid-template-columns: 1.35fr .8fr .9fr .75fr; gap: clamp(28px, 5vw, 76px); }
  .landing-footer-logo { display: inline-flex; align-items: center; gap: 11px; color: ${TI.ink}; text-decoration: none; font-size: 18px; font-weight: 900; }
  .landing-footer-logo span { width: 36px; height: 36px; border-radius: 10px; background: ${TI.accent}; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 10px 22px rgba(79,70,229,.22); }
  .landing-footer-brand p { max-width: 330px; margin: 17px 0 18px; color: ${TI.sub}; line-height: 1.55; font-size: 14px; }
  .landing-footer-contact { display: flex; flex-wrap: wrap; gap: 17px; color: ${TI.sub}; font-size: 13px; }
  .landing-footer-contact span { display: inline-flex; align-items: center; gap: 7px; }
  .landing-footer-col { display: flex; flex-direction: column; gap: 12px; }
  .landing-footer-col span { color: ${TI.faint}; text-transform: uppercase; letter-spacing: 1.8px; font-family: ${TI.mono}; font-size: 11px; font-weight: 800; margin-bottom: 3px; }
  .landing-footer a, .landing-footer button { color: ${TI.ink2}; text-decoration: none; font-size: 14px; transition: color .2s ease, transform .2s ease; border: none; background: transparent; padding: 0; text-align: left; cursor: pointer; font-family: ${TI.ui}; }
  .landing-footer a:hover, .landing-footer button:hover { color: ${TI.accent}; transform: translateX(2px); }
  .landing-footer-bottom { max-width: 1160px; margin: 42px auto 0; padding-top: 24px; border-top: 1px solid ${TI.border}; display: flex; justify-content: space-between; align-items: center; gap: 20px; color: ${TI.faint}; font-size: 13px; }
  .landing-footer-bottom div { display: flex; gap: 24px; }
  .landing-footer-bottom a { color: ${TI.faint}; }
  .landing-modal-wrap { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 18px; animation: ti-fade .22s ease both; }
  .landing-modal-backdrop { position: absolute; inset: 0; border: none; background: rgba(15,23,42,.55); backdrop-filter: blur(8px); cursor: pointer; }
  .landing-modal { position: relative; width: min(440px, 100%); max-height: calc(100vh - 36px); overflow-y: auto; background: #fff; border: 1px solid ${TI.border}; border-radius: 18px; box-shadow: ${TI.shadowLg}; padding: 28px; animation: ti-fade .28s ease both; }
  .landing-modal-x { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 10px; border: 1px solid ${TI.border}; background: #fff; color: ${TI.sub}; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .landing-modal-head span { color: ${TI.accent}; text-transform: uppercase; letter-spacing: 1.6px; font-family: ${TI.mono}; font-size: 11px; font-weight: 800; }
  .landing-modal-head h2 { margin: 8px 44px 6px 0; font-size: 25px; line-height: 1.05; }
  .landing-modal-head p { margin: 0 0 20px; color: ${TI.sub}; font-size: 13.5px; line-height: 1.5; }
  .landing-auth-error { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding: 10px 12px; border-radius: 10px; background: ${TI.negSoft}; color: ${TI.neg}; font-size: 13px; }
  .landing-auth-form { display: flex; flex-direction: column; gap: 13px; }
  .landing-auth-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .landing-auth-form label { display: flex; flex-direction: column; gap: 6px; }
  .landing-auth-form label span { font-size: 12px; font-weight: 800; color: ${TI.ink2}; }
  .landing-auth-form input { height: 44px; border-radius: 10px; border: 1px solid ${TI.border}; background: ${TI.surfaceAlt}; padding: 0 12px; font: 14px ${TI.ui}; color: ${TI.ink}; outline: none; transition: border-color .18s ease, box-shadow .18s ease, background .18s ease; }
  .landing-auth-form input:focus { border-color: ${TI.accent}; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,.12); }
  .landing-auth-form > button { height: 46px; border: none; border-radius: 999px; background: ${TI.accent}; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 4px; transition: transform .18s ease, filter .18s ease; }
  .landing-auth-form > button:hover { transform: translateY(-1px); filter: brightness(.98); }
  .landing-auth-form > button:disabled { opacity: .7; cursor: wait; transform: none; }
  .landing-auth-switch { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; color: ${TI.sub}; font-size: 13px; }
  .landing-auth-switch button { border: none; background: transparent; color: ${TI.accent}; font-weight: 800; cursor: pointer; padding: 0; }
  .jra-site {
    --ink: #2a211a; --ink2: #5c4a3b; --sub: #7d6d61; --faint: #a29388;
    --sand: #fbf6ee; --sand-deep: #f7f0e4; --line: #eadfd1; --line-strong: #dccbb7;
    --terra: #d2603a; --terra-deep: #b94f2f; --amber: #e8951c; --forest: #3c6b40; --forest-soft: #ecf5e9;
    --r: 14px; --r-lg: 22px; --r-xl: 30px;
    --shadow: 0 1px 2px rgba(42,33,26,.05), 0 6px 18px rgba(42,33,26,.06);
    --shadow-md: 0 12px 32px rgba(42,33,26,.12);
    --shadow-lg: 0 24px 70px rgba(42,33,26,.18);
    --mono: ${TI.mono};
    min-height: 100vh; background: var(--sand); color: var(--ink); font-family: ${TI.ui};
  }
  @keyframes jra-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes jra-pop { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
  .jra-eyebrow { display: block; font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: var(--terra); }
  .jra-hero { position: relative; background: linear-gradient(180deg,#fbf6ee 0%,#f7f0e4 100%); padding: 0 clamp(18px,4vw,56px); overflow: hidden; }
  .jra-hero::after { content: ""; position: absolute; right: -6%; top: -18%; width: 540px; height: 540px; border-radius: 50%; background: radial-gradient(circle,rgba(232,149,28,.16),transparent 68%); pointer-events: none; }
  .jra-nav { position: relative; z-index: 3; max-width: 1180px; margin: 0 auto; height: 78px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
  .jra-brand { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; }
  .jra-brand-mark { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(150deg,var(--terra),var(--amber)); display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(210,96,58,.34); }
  .jra-brand-name { display: flex; flex-direction: column; justify-content: center; line-height: 1; }
  .jra-brand-name b { font-size: 17px; font-weight: 800; color: var(--ink); letter-spacing: 0; white-space: nowrap; }
  .jra-brand-name small { font-family: var(--mono); font-size: 9.5px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: var(--forest); margin-top: 4px; white-space: nowrap; }
  .jra-nav-links { display: flex; align-items: center; gap: 6px; }
  .jra-nav-links a, .jra-nav-links .jra-link-btn { color: var(--ink2); text-decoration: none; font-size: 14.5px; font-weight: 600; white-space: nowrap; padding: 9px 14px; border-radius: 999px; border: none; background: transparent; cursor: pointer; font-family: inherit; transition: background .16s, color .16s, transform .16s; }
  .jra-nav-links a:hover, .jra-nav-links .jra-link-btn:hover { background: #fff; color: var(--terra); transform: translateY(-1px); }
  .jra-nav-signin { background: var(--ink) !important; color: #fff !important; box-shadow: var(--shadow-md); }
  .jra-nav-signin:hover { background: #15100b !important; color: #fff !important; }
  .jra-hero-inner { position: relative; z-index: 2; max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.04fr; gap: clamp(28px,4vw,60px); align-items: center; padding: clamp(26px,4vw,52px) 0 clamp(70px,8vw,104px); }
  .jra-hero-copy { max-width: 540px; animation: jra-fade .42s ease both; }
  .jra-rating-pill { display: inline-flex; align-items: center; gap: 9px; background: #fff; border: 1px solid var(--line); padding: 7px 14px 7px 11px; border-radius: 999px; font-size: 13.5px; color: var(--ink2); box-shadow: var(--shadow); margin-bottom: 24px; }
  .jra-rating-pill b { color: var(--ink); font-weight: 800; }
  .jra-rating-pill .jra-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--faint); }
  .jra-hero-copy h1 { margin: 0; font-size: clamp(44px,6vw,76px); line-height: 1.04; letter-spacing: 0; font-weight: 800; color: var(--ink); }
  .jra-hero-copy h1 em { display: block; font-style: normal; color: var(--terra); }
  .jra-hero-copy p { margin: 22px 0 0; max-width: 480px; font-size: clamp(16px,1.4vw,18.5px); line-height: 1.6; color: var(--ink2); }
  .jra-tagline { margin-top: 18px !important; font-family: var(--mono); font-size: 13px !important; color: var(--forest) !important; font-weight: 600; letter-spacing: .2px; }
  .jra-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
  .jra-btn { min-height: 52px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; white-space: nowrap; padding: 0 26px; border-radius: 999px; font-size: 15.5px; font-weight: 700; cursor: pointer; font-family: inherit; border: 1px solid transparent; transition: transform .16s, box-shadow .16s, background .16s, border-color .16s; }
  .jra-btn-primary { background: var(--terra); color: #fff; border-color: var(--terra); box-shadow: 0 12px 26px rgba(210,96,58,.30); }
  .jra-btn-primary:hover { background: var(--terra-deep); border-color: var(--terra-deep); transform: translateY(-2px); box-shadow: 0 16px 32px rgba(210,96,58,.36); }
  .jra-btn-ghost { background: #fff; color: var(--ink); border-color: var(--line-strong); }
  .jra-btn-ghost:hover { border-color: var(--ink); transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .jra-hero-media { position: relative; animation: jra-fade .5s ease .08s both; }
  .jra-hero-photo { position: relative; aspect-ratio: 4 / 3.2; min-height: 360px; border-radius: var(--r-xl); background: var(--sand-deep) url('/landing-hero.png') 68% center / cover no-repeat; box-shadow: var(--shadow-lg); border: 6px solid #fff; }
  .jra-hero-photo::after { content: ""; position: absolute; inset: 0; border-radius: 22px; box-shadow: inset 0 0 0 1px rgba(58,42,24,.08); background: linear-gradient(180deg,transparent 60%,rgba(42,33,26,.14)); }
  .jra-hero-float { position: absolute; left: -22px; bottom: 30px; z-index: 2; background: #fff; border-radius: var(--r); padding: 14px 18px; box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 13px; border: 1px solid var(--line); }
  .jra-hero-float-ic { width: 42px; height: 42px; border-radius: 11px; flex: 0 0 auto; background: var(--forest-soft); color: var(--forest); display: flex; align-items: center; justify-content: center; }
  .jra-hero-float b { display: block; font-size: 15px; color: var(--ink); font-weight: 800; }
  .jra-hero-float small { display: block; font-size: 12px; color: var(--sub); margin-top: 2px; }
  .jra-stats { position: relative; z-index: 4; max-width: 1100px; width: min(1100px,calc(100% - 36px)); margin: -52px auto 0; display: grid; grid-template-columns: repeat(4,1fr); gap: 0; background: #fff; border: 1px solid var(--line); border-radius: var(--r-lg); box-shadow: var(--shadow-lg); overflow: hidden; }
  .jra-stat { padding: 24px clamp(16px,2vw,28px); position: relative; }
  .jra-stat + .jra-stat::before { content: ""; position: absolute; left: 0; top: 22px; bottom: 22px; width: 1px; background: var(--line); }
  .jra-stat strong { display: block; font-size: clamp(26px,3vw,34px); font-weight: 800; color: var(--ink); letter-spacing: 0; line-height: 1; }
  .jra-stat span { display: block; margin-top: 9px; font-size: 13px; font-weight: 600; color: var(--sub); }
  .jra-section { max-width: 1180px; margin: 0 auto; padding: clamp(64px,8vw,96px) clamp(18px,4vw,28px) 0; animation: jra-fade .55s ease both; }
  .jra-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; margin-bottom: 30px; }
  .jra-head h2 { margin: 14px 0 0; font-size: clamp(28px,4vw,42px); line-height: 1.05; letter-spacing: 0; color: var(--ink); }
  .jra-head p { max-width: 360px; margin: 0; color: var(--sub); line-height: 1.55; font-size: 14.5px; }
  .jra-rooms { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .jra-room { background: #fff; border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--shadow); transition: transform .22s, box-shadow .22s, border-color .22s; }
  .jra-room:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--line-strong); }
  .jra-room-media { position: relative; aspect-ratio: 1.7; display: flex; align-items: center; justify-content: center; background-size: cover !important; background-position: center !important; }
  .jra-room-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg,transparent 55%,rgba(42,33,26,.22)); }
  .jra-room-tag { position: absolute; z-index: 1; top: 12px; left: 12px; padding: 5px 10px; border-radius: 999px; background: rgba(255,255,255,.92); color: var(--ink); font-family: var(--mono); font-size: 11px; font-weight: 700; backdrop-filter: blur(4px); }
  .jra-room-body { padding: 18px; }
  .jra-room-body h3 { margin: 0; font-size: 17.5px; font-weight: 800; color: var(--ink); letter-spacing: 0; }
  .jra-room-body > p { margin: 5px 0 0; color: var(--sub); font-size: 13px; }
  .jra-room-foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: 18px; }
  .jra-stars { display: inline-flex; align-items: center; gap: 4px; color: var(--ink2); font-size: 13px; font-weight: 800; }
  .jra-room-rate strong { font-size: 20px; font-weight: 800; color: var(--ink); }
  .jra-room-rate small { color: var(--sub); font-size: 12.5px; font-weight: 500; margin-left: 2px; }
  .jra-types { padding-bottom: 0; }
  .jra-type-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .jra-type { background: #fff; border: 1px solid var(--line); border-radius: var(--r); padding: 20px; box-shadow: var(--shadow); color: var(--forest); transition: transform .2s, box-shadow .2s, border-color .2s; }
  .jra-type:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--line-strong); }
  .jra-type h3 { margin: 14px 0 6px; color: var(--ink); font-size: 18px; }
  .jra-type p { margin: 0 0 15px; color: var(--sub); font-size: 13px; }
  .jra-type strong { color: var(--ink); font-size: 14px; }
  .jra-cta { max-width: 1180px; margin: clamp(64px,8vw,96px) auto 0; padding: 28px clamp(22px,4vw,36px); border-radius: var(--r-lg); background: linear-gradient(135deg,var(--ink),#4d3929); color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 24px; box-shadow: var(--shadow-lg); }
  .jra-cta h2 { margin: 8px 0; font-size: clamp(26px,4vw,38px); color: #fff; letter-spacing: 0; }
  .jra-cta p { margin: 0; color: rgba(255,255,255,.76); max-width: 560px; line-height: 1.55; }
  .jra-footer { margin-top: clamp(64px,8vw,96px); background: #fff; border-top: 1px solid var(--line); padding: 56px clamp(18px,4vw,28px) 38px; }
  .jra-footer-grid { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1.4fr .8fr .9fr .8fr; gap: clamp(28px,5vw,72px); }
  .jra-footer-brand p { max-width: 320px; margin: 18px 0; color: var(--sub); line-height: 1.6; font-size: 14px; }
  .jra-footer-contact { display: flex; flex-wrap: wrap; gap: 16px; color: var(--ink2); font-size: 13.5px; }
  .jra-footer-contact span { display: inline-flex; align-items: center; gap: 7px; }
  .jra-footer-col { display: flex; flex-direction: column; gap: 12px; }
  .jra-footer-col > span { font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: var(--faint); margin-bottom: 3px; }
  .jra-footer a, .jra-footer-col button { color: var(--ink2); text-decoration: none; font-size: 14px; border: none; background: transparent; padding: 0; text-align: left; cursor: pointer; font-family: inherit; transition: color .16s, transform .16s; }
  .jra-footer a:hover, .jra-footer-col button:hover { color: var(--terra); transform: translateX(2px); }
  .jra-footer-bottom { max-width: 1180px; margin: 44px auto 0; padding-top: 24px; border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 20px; color: var(--faint); font-size: 13px; }
  .jra-footer-bottom div { display: flex; gap: 24px; }
  .jra-footer-bottom a { color: var(--faint); }
  .jra-modal-wrap { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 18px; animation: jra-fade .22s ease both; }
  .jra-modal-backdrop { position: absolute; inset: 0; border: none; background: rgba(42,33,26,.55); backdrop-filter: blur(7px); cursor: pointer; }
  .jra-modal { position: relative; width: min(440px,100%); max-height: calc(100vh - 36px); overflow-y: auto; background: #fff; border: 1px solid var(--line); border-radius: var(--r-lg); box-shadow: var(--shadow-lg); padding: 30px; animation: jra-pop .26s cubic-bezier(.2,.9,.3,1.1) both; }
  .jra-modal-x { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: #fff; color: var(--sub); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s, color .15s; }
  .jra-modal-x:hover { background: var(--sand); color: var(--ink); }
  .jra-modal-head h2 { margin: 10px 44px 6px 0; font-size: 26px; line-height: 1.05; letter-spacing: 0; color: var(--ink); }
  .jra-modal-head p { margin: 0 0 22px; color: var(--sub); font-size: 14px; line-height: 1.5; }
  .jra-auth-error { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding: 10px 12px; border-radius: 10px; background: #fdecea; color: #c0392b; font-size: 13px; }
  .jra-auth-form { display: flex; flex-direction: column; gap: 14px; }
  .jra-auth-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .jra-auth-form label { display: flex; flex-direction: column; gap: 6px; }
  .jra-auth-form label > span { font-size: 12px; font-weight: 700; color: var(--ink2); }
  .jra-auth-form input { height: 46px; border-radius: 11px; border: 1px solid var(--line-strong); background: var(--sand); padding: 0 13px; font: 14.5px ${TI.ui}; color: var(--ink); outline: none; transition: border-color .16s, box-shadow .16s, background .16s; }
  .jra-auth-form input:focus { border-color: var(--terra); background: #fff; box-shadow: 0 0 0 3px rgba(210,96,58,.14); }
  .jra-auth-form > button { height: 48px; border: none; border-radius: 999px; background: var(--terra); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 4px; transition: transform .16s, filter .16s; }
  .jra-auth-form > button:hover { transform: translateY(-1px); filter: brightness(.98); }
  .jra-auth-form > button:disabled { opacity: .7; cursor: wait; transform: none; }
  .jra-auth-switch { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; color: var(--sub); font-size: 13px; }
  .jra-auth-switch button { border: none; background: transparent; color: var(--terra); font-weight: 800; cursor: pointer; padding: 0; }
  @media (max-width: 940px) {
    .jra-hero-inner { grid-template-columns: 1fr; gap: 36px; padding-bottom: 64px; }
    .jra-hero-media { max-width: 560px; }
    .jra-stats { grid-template-columns: repeat(2,1fr); }
    .jra-stat:nth-child(3)::before { display: none; }
    .jra-stat:nth-child(3), .jra-stat:nth-child(4) { border-top: 1px solid var(--line); }
    .jra-rooms { grid-template-columns: repeat(2,1fr); }
    .jra-type-grid { grid-template-columns: repeat(2,1fr); }
    .jra-head { flex-direction: column; align-items: flex-start; }
    .jra-footer-grid { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 560px) {
    .jra-site { overflow-x: hidden; }
    .jra-hero { padding: 0 16px; }
    .jra-hero::after { width: 300px; height: 300px; right: -120px; top: 84px; }
    .jra-nav { height: auto; min-height: 70px; gap: 12px; padding: 12px 0; align-items: center; }
    .jra-brand { min-width: 0; gap: 9px; }
    .jra-brand-name { min-width: 0; }
    .jra-brand-name b { font-size: 14.5px; max-width: 170px; overflow: hidden; text-overflow: ellipsis; }
    .jra-brand-name small { font-size: 8px; letter-spacing: 1.7px; }
    .jra-nav-links { flex: 0 0 auto; gap: 0; }
    .jra-nav-links a,
    .jra-nav-links .jra-link-btn:not(.jra-nav-signin) { display: none; }
    .jra-nav-signin { padding: 8px 13px !important; font-size: 13px !important; }
    .jra-hero-inner { gap: 24px; padding: 22px 0 58px; }
    .jra-rating-pill { margin-bottom: 16px; max-width: 100%; font-size: 12.5px; }
    .jra-hero-copy h1 { font-size: clamp(36px, 12vw, 42px); line-height: 1.02; }
    .jra-hero-copy p { font-size: 15.5px; line-height: 1.55; margin-top: 16px; }
    .jra-tagline { font-size: 11.5px !important; line-height: 1.45; }
    .jra-actions { margin-top: 22px; display: grid; grid-template-columns: 1fr; gap: 10px; }
    .jra-btn { width: 100%; min-height: 48px; padding: 0 18px; font-size: 14.5px; }
    .jra-hero-media { max-width: none; width: 100%; }
    .jra-hero-photo { min-height: 230px; aspect-ratio: 1.05; border-width: 4px; border-radius: 20px; background-position: 60% center; }
    .jra-hero-photo::after { border-radius: 16px; }
    .jra-hero-float { left: 12px; right: 12px; bottom: 12px; padding: 11px 12px; gap: 10px; }
    .jra-hero-float-ic { width: 36px; height: 36px; border-radius: 10px; }
    .jra-hero-float b { font-size: 13.5px; }
    .jra-hero-float small { font-size: 11px; }
    .jra-stats { grid-template-columns: 1fr; width: calc(100% - 32px); margin-top: -32px; border-radius: 18px; }
    .jra-stat { padding: 18px 20px; }
    .jra-stat + .jra-stat::before { display: none; }
    .jra-stat + .jra-stat { border-top: 1px solid var(--line); }
    .jra-section { padding: 54px 16px 0; }
    .jra-head { gap: 12px; margin-bottom: 18px; }
    .jra-head h2 { font-size: clamp(26px, 9vw, 34px); }
    .jra-head p { font-size: 13.5px; }
    .jra-rooms, .jra-type-grid { grid-template-columns: 1fr; }
    .jra-room { border-radius: 16px; }
    .jra-room-media { aspect-ratio: 1.35; }
    .jra-room-body { padding: 15px; }
    .jra-room-foot { align-items: flex-start; flex-direction: column; gap: 8px; }
    .jra-room-rate strong { font-size: 18px; }
    .jra-type { padding: 17px; }
    .jra-cta { flex-direction: column; align-items: stretch; margin: 56px 16px 0; padding: 22px 18px; border-radius: 18px; }
    .jra-cta h2 { font-size: 27px; }
    .jra-footer { margin-top: 56px; padding: 36px 16px 28px; }
    .jra-footer-grid { grid-template-columns: 1fr; }
    .jra-footer-brand p { max-width: none; }
    .jra-footer-contact { flex-direction: column; gap: 10px; }
    .jra-footer-bottom { flex-direction: column; align-items: flex-start; }
    .jra-footer-bottom div { flex-wrap: wrap; gap: 14px; }
    .jra-modal-wrap { align-items: flex-end; padding: 0; }
    .jra-modal { width: 100%; max-height: min(92dvh, 760px); border-radius: 22px 22px 0 0; padding: 24px 18px 28px; }
    .jra-modal-head h2 { font-size: 24px; margin-right: 44px; }
    .jra-auth-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 380px) {
    .jra-brand-name b { max-width: 135px; }
    .jra-hero-copy h1 { font-size: 34px; }
    .jra-nav-signin { padding: 8px 11px !important; }
    .jra-hero-photo { min-height: 210px; }
  }
  @media (max-width: 900px) {
    .landing-hero { min-height: auto; }
    .landing-hero-grid { grid-template-columns: 1fr; padding-bottom: 58px; }
    .landing-stats, .landing-room-grid, .landing-type-grid { grid-template-columns: repeat(2,1fr); }
    .landing-section-head { align-items: flex-start; flex-direction: column; }
    .landing-footer-grid { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 620px) {
    .landing-nav { height: auto; align-items: flex-start; }
    .landing-nav div a:not(.landing-login) { display: none; }
    .landing-hero-grid { padding-top: 34px; }
    .landing-stats, .landing-room-grid, .landing-type-grid { grid-template-columns: 1fr; }
    .landing-stat { min-height: 82px; }
    .landing-footer-grid { grid-template-columns: 1fr; }
    .landing-footer-bottom { align-items: flex-start; flex-direction: column; }
    .landing-footer-bottom div { flex-wrap: wrap; gap: 14px; }
    .landing-auth-row { grid-template-columns: 1fr; }
  }
`;
