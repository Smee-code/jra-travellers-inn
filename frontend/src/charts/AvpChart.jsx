import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TI } from '../theme';

export default function AvpChart({ data, height = 250 }) {
  if (!data) return null;
  const { labels, actual, predicted, upper, lower } = data;

  const rows = labels.map((label, i) => ({
    label,
    actual: actual[i],
    predicted: predicted[i],
    upper: upper[i],
    lower: lower[i],
    band: upper[i] != null ? [lower[i], upper[i]] : null,
  }));

  const splitIdx = actual.findIndex(v => v == null);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: TI.surface, border: `1px solid ${TI.border}`, borderRadius: 8,
        padding: '8px 12px', fontSize: 12, fontFamily: TI.ui, boxShadow: TI.shadowMd }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => p.value != null && (
          <div key={i} style={{ color: p.color || TI.ink, display: 'flex', gap: 8 }}>
            <span>{p.name}:</span><span style={{ fontWeight: 700 }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={rows} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TI.accent} stopOpacity={0.15} />
            <stop offset="95%" stopColor={TI.accent} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TI.accent2} stopOpacity={0.18} />
            <stop offset="95%" stopColor={TI.accent2} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke={TI.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: TI.sub, fontFamily: TI.ui }}
          axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: TI.sub, fontFamily: TI.mono }}
          axisLine={false} tickLine={false} width={38} />
        <Tooltip content={<CustomTooltip />} />
        {splitIdx > 0 && (
          <ReferenceLine x={labels[splitIdx - 1]} stroke={TI.borderStrong}
            strokeDasharray="4 3" label={{ value: 'Forecast', position: 'insideTopRight', fontSize: 10, fill: TI.faint }} />
        )}
        <Area dataKey="band" fill="url(#bandGrad)" stroke="none" name="Confidence" />
        <Area dataKey="actual" type="monotone" fill="url(#actGrad)" stroke={TI.accent}
          strokeWidth={2.5} dot={false} name="Actual" connectNulls={false} />
        <Line dataKey="predicted" type="monotone" stroke={TI.accent2} strokeWidth={2.5}
          strokeDasharray="5 5" dot={false} name="Predicted" connectNulls={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
