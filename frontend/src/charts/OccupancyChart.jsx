import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TI } from '../theme';

export default function OccupancyChart({ data, height = 170, color }) {
  if (!data) return null;
  const rows = data.labels.map((label, i) => ({ label, value: data.values[i] }));
  const col = color || TI.accent;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={`occGrad${col.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={col} stopOpacity={0.18} />
            <stop offset="95%" stopColor={col} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke={TI.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: TI.sub, fontFamily: TI.ui }}
          axisLine={false} tickLine={false} interval={1} />
        <YAxis tick={{ fontSize: 10, fill: TI.sub, fontFamily: TI.mono }}
          axisLine={false} tickLine={false} width={32} />
        <Tooltip formatter={(v) => [`${v}%`, 'Occupancy']}
          contentStyle={{ fontFamily: TI.ui, fontSize: 12, borderRadius: 8, border: `1px solid ${TI.border}` }} />
        <Area type="monotone" dataKey="value" stroke={col} strokeWidth={2.5}
          fill={`url(#occGrad${col.replace('#','')})`} dot={false} name="Occupancy" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
