import { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Ico from '../../components/Ico';
import Btn from '../../components/Btn';
import SectionTitle from '../../components/SectionTitle';
import AvpChart from '../../charts/AvpChart';
import OccupancyChart from '../../charts/OccupancyChart';
import BookingsBarChart from '../../charts/BookingsBarChart';
import DonutChart from '../../charts/DonutChart';
import { TI } from '../../theme';

// ── Period helpers ────────────────────────────────────────────────────────────

const PERIODS = [
  { key: '12m', label: '12M' },
  { key: 'ytd', label: 'YTD' },
  { key: 'qtd', label: 'QTD' },
];

function greetingFor(name) {
  const h = new Date().getHours();
  const time = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${time}, ${(name || 'there').split(' ')[0]}`;
}

function dateRangeLabel(period) {
  const now = new Date();
  const fmt = (d) => d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

  if (period === 'ytd') {
    return `Jan ${now.getFullYear()} – ${fmt(now)}`;
  }
  if (period === 'qtd') {
    const q = Math.floor(now.getMonth() / 3);
    const qStart = new Date(now.getFullYear(), q * 3, 1);
    return `${qStart.toLocaleString('en-US', { month: 'short' })} – ${fmt(now)} · Q${q + 1} ${now.getFullYear()}`;
  }
  // 12m
  const start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  return `${fmt(start)} – ${fmt(now)}`;
}

function chartSubtitle(period) {
  if (period === 'ytd') return 'monthly %, year to date';
  if (period === 'qtd') return 'monthly %, this quarter';
  return 'monthly %, last 12 months';
}

function barSubtitle(period) {
  if (period === 'ytd') return 'volume, year to date';
  if (period === 'qtd') return 'volume, this quarter';
  return 'volume, last 8 months';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KPI({ m, loading }) {
  return (
    <Card pad="16px 18px" style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}>
      <div style={{ fontSize: 12, color: TI.sub, fontWeight: 500, marginBottom: 10 }}>{m.label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 27, fontWeight: 800, color: TI.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>{m.value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 700,
          fontFamily: TI.mono, color: m.up ? TI.pos : TI.neg }}>
          <Ico name={m.up ? 'up' : 'down'} size={13} sw={2.3} color={m.up ? TI.pos : TI.neg} />{m.delta}
        </div>
      </div>
      <div style={{ fontSize: 11, color: TI.sub, marginTop: 7 }}>{m.sub}</div>
    </Card>
  );
}

function Legend({ color, label, dashed, block }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {block
        ? <span style={{ width: 16, height: 10, borderRadius: 2, background: color, opacity: .55 }} />
        : <span style={{ width: 16, height: 0, borderTop: `2.5px ${dashed ? 'dashed' : 'solid'} ${color}` }} />}
      <span style={{ fontSize: 11.5, color: TI.sub }}>{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('12m');
  const [loading, setLoading] = useState(false);

  const [metrics,   setMetrics]   = useState([]);
  const [avp,       setAvp]       = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [bbm,       setBbm]       = useState(null);
  const [roomMix,   setRoomMix]   = useState(null);
  const [insights,  setInsights]  = useState([]);

  const fetchAll = useCallback((p) => {
    setLoading(true);
    const q = `?period=${p}`;
    Promise.all([
      api.get(`/analytics/metrics/${q}`).then(r => setMetrics(r.data)),
      // AVP and forecasts are period-independent (always 12+2 window / forward-looking)
      api.get('/analytics/avp/').then(r => setAvp(r.data)),
      api.get('/analytics/forecasts/').then(r => setForecasts(r.data)),
      api.get(`/analytics/occupancy/${q}`).then(r => setOccupancy(r.data)),
      api.get(`/analytics/bookings-by-month/${q}`).then(r => setBbm(r.data)),
      api.get(`/analytics/room-mix/${q}`).then(r => setRoomMix(r.data)),
      api.get(`/analytics/trends/${q}`).then(r => setInsights(r.data.insights || [])),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(period); }, [period, fetchAll]);

  return (
    <div>
      <SectionTitle
        kicker="Performance & Forecasts"
        title={greetingFor(user?.name)}
        sub={`${dateRangeLabel(period)} · live data`}
        right={<>
          {/* ── Period filter ── */}
          <div style={{ display: 'flex', background: TI.surface, border: `1px solid ${TI.border}`, borderRadius: 999, padding: 3 }}>
            {PERIODS.map(({ key, label }) => {
              const active = key === period;
              return (
                <button key={key} onClick={() => setPeriod(key)} style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                  fontFamily: TI.ui, border: 'none', cursor: 'pointer',
                  background: active ? TI.accent : 'transparent',
                  color: active ? '#fff' : TI.sub,
                  transition: 'background .15s, color .15s',
                }}>
                  {label}
                </button>
              );
            })}
          </div>
          <Btn variant="outline" icon="download">Export</Btn>
        </>}
      />

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        {metrics.map(m => <KPI key={m.label} m={m} loading={loading} />)}
      </div>

      {/* ── AVP chart + forecast panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.62fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink }}>Actual vs. Predicted Bookings</div>
              <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 3 }}>Forecast region with 90% confidence interval</div>
            </div>
            <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
              <Legend color={TI.accent} label="Actual" />
              <Legend color={TI.accent2} label="Predicted" dashed />
              <Legend color={TI.band} label="Confidence" block />
            </div>
          </div>
          <AvpChart data={avp} height={244} />
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Ico name="forecast" size={17} color={TI.accent} />
            <span style={{ fontSize: 16, fontWeight: 700, color: TI.ink }}>Booking Forecast</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {forecasts.map((f, i) => (
              <div key={f.range} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 13px', borderRadius: 10,
                background: i === 0 ? TI.accentSoft : TI.surfaceAlt,
                border: `1px solid ${i === 0 ? TI.accent + '40' : TI.border}`,
              }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: TI.ink }}>{f.range}</div>
                  <div style={{ fontSize: 11, color: TI.sub, marginTop: 2 }}>{f.occ} projected occupancy</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 21, fontWeight: 800, color: TI.ink, lineHeight: 1 }}>{f.bookings}</div>
                  <div style={{ fontSize: 10.5, color: TI.sub, fontFamily: TI.mono, marginTop: 2 }}>{f.conf} bookings</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${TI.border}`,
            display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10.5, fontFamily: TI.mono, color: TI.pos, fontWeight: 700 }}>±3</span>
            <span style={{ fontSize: 11.5, color: TI.sub, lineHeight: 1.4 }}>avg error last quarter — predictions are tracking closely.</span>
          </div>
        </Card>
      </div>

      {/* ── Insight tags ── */}
      {insights.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
          {insights.map(ins => (
            <Card key={ins.tag} pad="14px 16px"
              style={{ display: 'flex', gap: 12, alignItems: 'flex-start',
                opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}>
              <span style={{ fontSize: 9.5, fontFamily: TI.mono, fontWeight: 700, letterSpacing: 1,
                padding: '4px 8px', borderRadius: 5, flex: '0 0 auto',
                background: ins.tag === 'PEAK' ? TI.accentSoft : ins.tag === 'ACCURACY' ? TI.posSoft : TI.warnSoft,
                color: ins.tag === 'PEAK' ? TI.accentDeep : ins.tag === 'ACCURACY' ? TI.pos : TI.warn }}>
                {ins.tag}
              </span>
              <span style={{ fontSize: 12.5, color: TI.ink, lineHeight: 1.45 }}>{ins.text}</span>
            </Card>
          ))}
        </div>
      )}

      {/* ── Bottom charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.3fr 1fr', gap: 16 }}>
        <Card style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink, marginBottom: 3 }}>Occupancy Rate</div>
          <div style={{ fontSize: 11.5, color: TI.sub, marginBottom: 12 }}>{chartSubtitle(period)}</div>
          <OccupancyChart data={occupancy} height={158} />
        </Card>
        <Card style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink, marginBottom: 3 }}>Bookings by Month</div>
          <div style={{ fontSize: 11.5, color: TI.sub, marginBottom: 12 }}>{barSubtitle(period)}</div>
          <BookingsBarChart data={bbm} height={158} />
        </Card>
        <Card style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink, marginBottom: 3 }}>Room Type Mix</div>
          <div style={{ fontSize: 11.5, color: TI.sub, marginBottom: 12 }}>share of bookings</div>
          <DonutChart data={roomMix} size={120} />
        </Card>
      </div>
    </div>
  );
}
