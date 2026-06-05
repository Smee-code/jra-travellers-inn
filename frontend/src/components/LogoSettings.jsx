import { useRef, useState } from 'react';
import Btn from './Btn';
import Card from './Card';
import BrandMark from './BrandMark';
import Ico from './Ico';
import { TI } from '../theme';
import useBranding from '../hooks/useBranding';

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LogoSettings({ onToast }) {
  const inputRef = useRef(null);
  const { branding, updateLogo } = useBranding();
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const current = preview ?? branding.logo_data_url;

  const choose = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onToast?.('Please choose an image file.', 'neg');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      onToast?.('Logo must be under 5 MB.', 'neg');
      return;
    }
    setPreview(await readFile(file));
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateLogo(current || '');
      setPreview(null);
      onToast?.(current ? 'System logo updated' : 'System logo removed');
    } catch (e) {
      onToast?.(e.response?.data?.detail || 'Logo could not be saved.', 'neg');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: TI.ink }}>System logo</div>
          <div style={{ fontSize: 12.5, color: TI.sub, marginTop: 4 }}>Shown on the landing page, customer app, owner side, and admin side.</div>
        </div>
        <BrandMark size={58} radius={15} iconSize={28} style={current ? { background: TI.surfaceAlt } : {}} />
      </div>

      <div style={{ marginTop: 18, minHeight: 130, border: `1px dashed ${TI.border}`, borderRadius: TI.radius,
        background: TI.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden' }}>
        {current ? (
          <img src={current} alt="System logo preview" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain' }} />
        ) : (
          <div style={{ textAlign: 'center', color: TI.sub, fontSize: 13 }}>
            <Ico name="home" size={30} color={TI.faint} />
            <div style={{ marginTop: 8 }}>Default icon is currently used.</div>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => choose(e.target.files?.[0])} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
        <Btn variant="outline" icon="upload" onClick={() => inputRef.current?.click()}>Choose image</Btn>
        <Btn variant="danger" icon="trash" onClick={() => setPreview('')} disabled={!current}>Remove</Btn>
        <Btn icon="check" onClick={save} disabled={saving || preview === null}>{saving ? 'Saving...' : 'Save logo'}</Btn>
      </div>
    </Card>
  );
}
