import { useState, useEffect } from 'react';
import api from '../../api/client';
import Card from '../../components/Card';
import Ico from '../../components/Ico';
import SectionTitle from '../../components/SectionTitle';
import OccupancyChart from '../../charts/OccupancyChart';
import BookingsBarChart from '../../charts/BookingsBarChart';
import Heatmap from '../../charts/Heatmap';
import { TI } from '../../theme';

export default function Trends() {
  const [trends, setTrends] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [bbm, setBbm] = useState(null);
  const [heatmap, setHeatmap] = useState(null);

  useEffect(() => {
    api.get('/analytics/trends/').then(r => setTrends(r.data));
    api.get('/analytics/occupancy/').then(r => setOccupancy(r.data));
    api.get('/analytics/bookings-by-month/').then(r => setBbm(r.data));
    api.get('/analytics/heatmap/').then(r => setHeatmap(r.data));
  }, []);

  const flags = trends?.flags || [];
  return (
    <div>
      <SectionTitle kicker="Trend Analysis" title="Seasonal Patterns & Trends"
        sub="Automatically flagged peaks, dips and year-over-year shifts" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
        {flags.map((x, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Ico name={x.ic} size={16} color={x.c} />
              <span style={{ fontSize: 11.5, fontFamily: TI.mono, letterSpacing: .5, color: TI.sub, textTransform: 'uppercase' }}>{x.t}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: TI.ink, letterSpacing: '-0.02em' }}>{x.v}</div>
            <div style={{ fontSize: 12.5, color: TI.sub, marginTop: 8, lineHeight: 1.45 }}>{x.d}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        {/* ── Card header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink, marginBottom: 3 }}>Peak Season Heatmap</div>
            <div style={{ fontSize: 11.5, color: TI.sub }}>Demand intensity by month &amp; week — current year</div>
          </div>
          {/* Color scale legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: TI.sub, fontFamily: TI.mono }}>Low</span>
            <div style={{ width: 140, height: 10, borderRadius: 5,
              background: 'linear-gradient(90deg,#eef2ff,#4338ca)' }} />
            <span style={{ fontSize: 11, color: TI.sub, fontFamily: TI.mono }}>High</span>
          </div>
        </div>

        {/* ── Full-width heatmap ── */}
        <Heatmap matrix={heatmap} />

        {/* ── Insight footer ── */}
        {flags.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${TI.border}`,
            display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {flags.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8,
                flex: '1 1 240px', minWidth: 0 }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, flex: '0 0 auto',
                  background: f.ic === 'up' ? TI.posSoft : f.ic === 'star' ? TI.accentSoft : TI.warnSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ico name={f.ic} size={14} color={f.c} />
                </span>
                <div>
                  <div style={{ fontSize: 11, fontFamily: TI.mono, color: TI.faint,
                    textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>{f.t}</div>
                  <div style={{ fontSize: 13, color: TI.ink, fontWeight: 600 }}>{f.v}</div>
                </div>
                <div style={{ fontSize: 12, color: TI.sub, lineHeight: 1.4, flex: 1, minWidth: 0 }}>
                  — {f.d}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink, marginBottom: 3 }}>Month-over-Month</div>
          <div style={{ fontSize: 11.5, color: TI.sub, marginBottom: 12 }}>bookings vs. previous month</div>
          <BookingsBarChart data={bbm} height={170} />
        </Card>
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink, marginBottom: 3 }}>Year-over-Year</div>
          <div style={{ fontSize: 11.5, color: TI.sub, marginBottom: 12 }}>occupancy %, this year</div>
          <OccupancyChart data={occupancy} height={170} />
        </Card>
      </div>
    </div>
  );
}
