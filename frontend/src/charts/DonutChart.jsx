import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TI } from '../theme';

const COLORS = TI.donut;

export default function DonutChart({ data, size = 132 }) {
  if (!data) return null;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <PieChart width={size} height={size}>
        <Pie data={data} cx={size / 2 - 1} cy={size / 2 - 1}
          innerRadius={size * 0.31} outerRadius={size * 0.49}
          paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => [v, 'Bookings']}
          contentStyle={{ fontFamily: TI.ui, fontSize: 12, borderRadius: 8, border: `1px solid ${TI.border}` }} />
      </PieChart>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
            <span style={{ flex: 1, color: TI.ink }}>{d.name}</span>
            <span style={{ fontFamily: TI.mono, color: TI.sub, fontSize: 11.5 }}>{d.value}</span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${TI.border}`, paddingTop: 6, fontSize: 11, color: TI.sub, fontFamily: TI.mono }}>
          Total: <b style={{ color: TI.ink }}>{total.toLocaleString()}</b>
        </div>
      </div>
    </div>
  );
}
