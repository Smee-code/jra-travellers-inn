import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { TI } from '../theme';

export default function BookingsBarChart({ data, height = 170 }) {
  if (!data) return null;
  const rows = data.labels.map((label, i) => ({ label, value: data.values[i] }));
  const max = Math.max(...data.values);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke={TI.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: TI.sub, fontFamily: TI.ui }}
          axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: TI.sub, fontFamily: TI.mono }}
          axisLine={false} tickLine={false} width={32} />
        <Tooltip formatter={(v) => [v, 'Bookings']}
          contentStyle={{ fontFamily: TI.ui, fontSize: 12, borderRadius: 8, border: `1px solid ${TI.border}` }} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]} name="Bookings">
          {rows.map((r, i) => (
            <Cell key={i} fill={r.value === max ? TI.accent : '#e2e8f0'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
