import { useState } from 'react';
import api from '../../api/client';
import Card from '../../components/Card';
import Btn from '../../components/Btn';
import SectionTitle from '../../components/SectionTitle';
import Ico from '../../components/Ico';
import { TI } from '../../theme';

function Toast({ msg, kind = 'pos' }) {
  if (!msg) return null;
  return (
    <div className="ti-fade" style={{
      position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 20px', borderRadius: 999, background: TI.ink, color: '#fff',
      fontSize: 13.5, fontWeight: 600, boxShadow: TI.shadowLg,
    }}>
      <Ico name={kind === 'neg' ? 'x' : 'check'} size={16}
        color={kind === 'neg' ? '#fca5a5' : '#6ee7b7'} sw={2.5} />
      {msg}
    </div>
  );
}

export default function UploadHistory() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState(null);
  const [toastKind, setToastKind] = useState('pos');

  const fire = (msg, kind = 'pos') => {
    setToast(msg);
    setToastKind(kind);
    setTimeout(() => setToast(null), 2800);
  };

  const upload = async () => {
    if (!file) {
      setErr('Choose a CSV or Excel file first.');
      return;
    }
    setBusy(true);
    setErr('');
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/bookings/import-history/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      fire(`History import complete: ${data.created} added, ${data.skipped} skipped`);
    } catch (e) {
      const msg = e.response?.data?.detail || 'Upload failed.';
      setErr(msg);
      fire(msg, 'neg');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <SectionTitle
        kicker="Forecast Data"
        title="Upload Booking History"
        sub="Import CSV or Excel booking records for analytics, forecasting and prediction"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: TI.accentSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="upload" size={20} color={TI.accent} />
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: TI.ink }}>History file</div>
              <div style={{ fontSize: 12.5, color: TI.sub, marginTop: 2 }}>Accepted formats: .csv, .xlsx</div>
            </div>
          </div>

          <label style={{ display: 'block', border: `1px dashed ${TI.borderStrong}`, borderRadius: TI.radius,
            padding: 28, background: TI.surfaceAlt, cursor: 'pointer', textAlign: 'center' }}>
            <Ico name="upload" size={28} color={TI.accent} />
            <div style={{ fontSize: 14.5, fontWeight: 800, color: TI.ink, marginTop: 10 }}>
              {file ? file.name : 'Choose CSV or Excel file'}
            </div>
            <div style={{ fontSize: 12.5, color: TI.sub, marginTop: 4 }}>
              Imported records are added to booking history and used by forecast calculations.
            </div>
            <input type="file" accept=".csv,.xlsx" onChange={e => setFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }} />
          </label>

          {err && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: TI.radiusSm,
              background: TI.negSoft, color: TI.neg, fontSize: 13 }}>
              {err}
            </div>
          )}

          {result && (
            <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: TI.radiusSm,
              background: TI.posSoft, color: TI.pos, fontSize: 13.5, fontWeight: 700 }}>
              Imported {result.created} booking(s), skipped {result.skipped}.
            </div>
          )}

          {result?.errors?.length > 0 && (
            <div style={{ marginTop: 12, maxHeight: 180, overflow: 'auto',
              border: `1px solid ${TI.border}`, borderRadius: TI.radiusSm, padding: 12,
              fontSize: 12, color: TI.sub, background: TI.surface }}>
              {result.errors.map(e => <div key={`${e.row}-${e.error}`}>Row {e.row}: {e.error}</div>)}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <Btn variant="outline" onClick={() => { setFile(null); setResult(null); setErr(''); }}>Clear</Btn>
            <Btn icon="upload" onClick={upload} disabled={busy}>{busy ? 'Uploading...' : 'Upload history'}</Btn>
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 16, fontWeight: 800, color: TI.ink, marginBottom: 10 }}>Required columns</div>
          <div style={{ fontSize: 12.5, color: TI.sub, lineHeight: 1.6, marginBottom: 14 }}>
            Use these headers in your CSV or first Excel row.
          </div>
          <div style={{ fontFamily: TI.mono, fontSize: 12.5, color: TI.ink, lineHeight: 1.9,
            background: TI.surfaceAlt, border: `1px solid ${TI.border}`, borderRadius: TI.radiusSm,
            padding: 14 }}>
            booking_id<br />
            guest_name<br />
            guest_email<br />
            room_id<br />
            check_in<br />
            check_out<br />
            nights<br />
            guests_count<br />
            amount<br />
            status
          </div>
          <div style={{ marginTop: 14, fontSize: 12.5, color: TI.sub, lineHeight: 1.55 }}>
            Valid status values: Pending, Confirmed, Cancelled, Completed.
          </div>
        </Card>
      </div>

      <Toast msg={toast} kind={toastKind} />
    </div>
  );
}
