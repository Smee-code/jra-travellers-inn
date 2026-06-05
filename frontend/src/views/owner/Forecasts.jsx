import { useState, useEffect } from 'react';
import api from '../../api/client';
import Card from '../../components/Card';
import Ico from '../../components/Ico';
import Btn from '../../components/Btn';
import SectionTitle from '../../components/SectionTitle';
import AvpChart from '../../charts/AvpChart';
import { TI } from '../../theme';

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

export default function Forecasts() {
  const [forecasts, setForecasts] = useState([]);
  const [avp, setAvp] = useState(null);
  const [sel, setSel] = useState(1);

  useEffect(() => {
    api.get('/analytics/forecasts/').then(r => setForecasts(r.data));
    api.get('/analytics/avp/').then(r => setAvp(r.data));
  }, []);

  const f = forecasts[sel] || {};
  return (
    <div>
      <SectionTitle kicker="Predictive Analytics" title="Booking Forecast"
        sub="Prophet model · retrained nightly on all booking history"
        right={<Btn variant="outline" icon="refresh">Retrain now</Btn>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 18 }}>
        {forecasts.map((x, i) => (
          <Card key={x.range} hover onClick={() => setSel(i)} style={{
            borderColor: i === sel ? TI.accent : TI.border, borderWidth: i === sel ? 2 : 1,
            background: i === sel ? TI.accentSoft : TI.surface }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: TI.ink }}>{x.range}</span>
              {i === sel && <span style={{ fontSize: 10, fontFamily: TI.mono, color: TI.accent, fontWeight: 700 }}>SELECTED</span>}
            </div>
            <div style={{ fontSize: 38, fontWeight: 800, color: TI.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{x.bookings}</div>
            <div style={{ fontSize: 12, color: TI.sub, marginTop: 4 }}>predicted bookings · {x.conf}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 13,
              borderTop: `1px solid ${i === sel ? TI.accent + '30' : TI.border}` }}>
              <div><div style={{ fontSize: 17, fontWeight: 700, color: TI.ink }}>{x.occ}</div><div style={{ fontSize: 10.5, color: TI.sub }}>occupancy</div></div>
              <div><div style={{ fontSize: 17, fontWeight: 700, color: TI.ink }}>{x.rev}</div><div style={{ fontSize: 10.5, color: TI.sub }}>est. revenue</div></div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink }}>Forecast detail · {f.range}</div>
            <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 3 }}>Shaded band shows the 90% confidence interval — wider = less certain</div>
          </div>
          <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
            <Legend color={TI.accent} label="Actual" />
            <Legend color={TI.accent2} label="Predicted" dashed />
            <Legend color={TI.band} label="90% interval" block />
          </div>
        </div>
        <AvpChart data={avp} height={300} />
      </Card>

      <Card style={{ display: 'flex', gap: 16, alignItems: 'center', background: TI.accentSoft, borderColor: TI.accent + '30' }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: TI.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <Ico name="shield" size={20} color="#fff" />
        </div>
        <div style={{ fontSize: 13, color: TI.ink2, lineHeight: 1.5 }}>
          <b style={{ color: TI.ink }}>How to read confidence:</b> the model is 90% sure the real number will fall inside the shaded band. As more bookings accumulate, the band narrows and forecasts get sharper — the system literally gets smarter the longer you use it.
        </div>
      </Card>
    </div>
  );
}
