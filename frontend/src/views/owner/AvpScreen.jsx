import { useState, useEffect } from 'react';
import api from '../../api/client';
import Card from '../../components/Card';
import SectionTitle from '../../components/SectionTitle';
import AvpChart from '../../charts/AvpChart';
import { TI } from '../../theme';

function Legend({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 16, height: 0, borderTop: `2.5px ${dashed ? 'dashed' : 'solid'} ${color}` }} />
      <span style={{ fontSize: 11.5, color: TI.sub }}>{label}</span>
    </div>
  );
}

export default function AvpScreen() {
  const [accuracy, setAccuracy] = useState([]);
  const [avp, setAvp] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    api.get('/analytics/accuracy/').then(r => setAccuracy(r.data));
    api.get('/analytics/avp/').then(r => setAvp(r.data));
    api.get('/analytics/trends/').then(r => setTrends(r.data));
  }, []);

  const table = trends?.avp_table || [];
  return (
    <div>
      <SectionTitle kicker="Model Performance" title="Actual vs. Predicted"
        sub="How closely the forecast tracked reality — in plain language" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
        {accuracy.map((a, i) => (
          <Card key={i}>
            <div style={{ fontSize: 12, color: TI.sub, fontWeight: 500, marginBottom: 8 }}>{a.metric}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: TI.ink, letterSpacing: '-0.02em' }}>{a.value}</span>
              <span style={{ fontSize: 12, color: TI.sub, fontFamily: TI.mono }}>{a.unit}</span>
            </div>
            <div style={{ fontSize: 12, color: TI.sub, marginTop: 9, lineHeight: 1.45 }}>{a.plain}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink }}>Forecast vs. Reality</div>
            <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 3 }}>Solid = what happened · dashed = what the model predicted</div>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Legend color={TI.accent} label="Actual" />
            <Legend color={TI.accent2} label="Predicted" dashed />
          </div>
        </div>
        <AvpChart data={avp} height={280} />
      </Card>

      <Card pad={0}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TI.border}`, fontSize: 15, fontWeight: 700 }}>
          Period-by-period comparison
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: TI.sub, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: .5 }}>
              {['Period', 'Predicted', 'Actual', 'Diff', 'Occ. pred', 'Occ. actual'].map(h => (
                <th key={h} style={{ textAlign: h === 'Period' ? 'left' : 'right', padding: '12px 20px', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((r, i) => {
              const diff = r.actual - r.predicted;
              return (
                <tr key={i} style={{ borderTop: `1px solid ${TI.border}` }}>
                  <td style={{ padding: '13px 20px', fontWeight: 600 }}>{r.period}</td>
                  <td style={{ padding: '13px 20px', textAlign: 'right', fontFamily: TI.mono }}>{r.predicted}</td>
                  <td style={{ padding: '13px 20px', textAlign: 'right', fontFamily: TI.mono, fontWeight: 700 }}>{r.actual}</td>
                  <td style={{ padding: '13px 20px', textAlign: 'right', fontFamily: TI.mono, color: diff >= 0 ? TI.pos : TI.neg }}>
                    {diff >= 0 ? '+' : ''}{diff}
                  </td>
                  <td style={{ padding: '13px 20px', textAlign: 'right', color: TI.sub }}>{r.occP}</td>
                  <td style={{ padding: '13px 20px', textAlign: 'right', fontWeight: 600 }}>{r.occA}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
