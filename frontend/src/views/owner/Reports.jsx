import { useEffect, useState } from 'react';
import api from '../../api/client';
import Card from '../../components/Card';
import Btn from '../../components/Btn';
import Field from '../../components/Field';
import SectionTitle from '../../components/SectionTitle';
import Ico from '../../components/Ico';
import { TI } from '../../theme';

const SECTIONS = ['Occupancy', 'Revenue', 'Booking volume', 'Trends & seasonality', 'Top-performing periods'];

export default function Reports() {
  const [types, setTypes] = useState({ Occupancy: true, Revenue: true, 'Booking volume': true, 'Trends & seasonality': false, 'Top-performing periods': false });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOptions = () => {
    api.get('/reports/options/').then(r => {
      setFrom(r.data.default_from);
      setTo(r.data.default_to);
      setRecent(r.data.recent || []);
    });
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const download = async (fmt) => {
    setLoading(true);
    try {
      const res = await api.post('/reports/generate/', { format: fmt, from, to }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url;
      a.download = `bookings_report.${fmt === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click(); URL.revokeObjectURL(url);
      loadOptions();
    } catch (e) { alert('Export failed: ' + (e.response?.data?.detail || e.message)); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <SectionTitle kicker="Reports" title="Generate & Export"
        sub="Summary reports by date range — download as PDF or Excel" />

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, color: TI.ink, marginBottom: 14 }}>Build a report</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label="From" value={from} onChange={e => setFrom(e.target.value)} icon="cal" type="date" />
            <Field label="To" value={to} onChange={e => setTo(e.target.value)} icon="cal" type="date" />
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TI.ink2, marginBottom: 9 }}>Include sections</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
            {SECTIONS.map(k => (
              <label key={k} className="ti-row" onClick={() => setTypes(t => ({ ...t, [k]: !t[k] }))}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 8, cursor: 'pointer' }}>
                <span style={{ width: 19, height: 19, borderRadius: 5, flex: '0 0 auto',
                  border: `1.5px solid ${types[k] ? TI.accent : TI.borderStrong}`,
                  background: types[k] ? TI.accent : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {types[k] && <Ico name="check" size={13} color="#fff" sw={3} />}
                </span>
                <span style={{ fontSize: 13.5, color: TI.ink }}>{k}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn icon="doc" full onClick={() => download('pdf')} disabled={loading}>Export PDF</Btn>
            <Btn variant="outline" icon="download" full onClick={() => download('excel')} disabled={loading}>Export Excel</Btn>
          </div>
        </Card>

        <Card pad={0}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TI.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Recent reports</span>
            <span style={{ fontSize: 12, color: TI.sub }}>{recent.length} files</span>
          </div>
          {recent.length === 0 && (
            <div style={{ padding: '22px 20px', fontSize: 13, color: TI.sub }}>
              Generated reports will appear here.
            </div>
          )}
          {recent.map((r, i) => (
            <div key={i} className="ti-row" style={{ display: 'flex', alignItems: 'center', gap: 13,
              padding: '14px 20px', borderTop: i ? `1px solid ${TI.border}` : 'none', cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9,
                background: r.fmt === 'PDF' ? TI.negSoft : TI.posSoft,
                color: r.fmt === 'PDF' ? TI.neg : TI.pos,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                <Ico name="doc" size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: TI.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                <div style={{ fontSize: 11.5, color: TI.sub, marginTop: 2 }}>{r.date} · {r.fmt} · {r.size}</div>
              </div>
              <Ico name="download" size={17} color={TI.faint} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
