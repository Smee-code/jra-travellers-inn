import Ico from './Ico';
import { TI } from '../theme';
import useBranding from '../hooks/useBranding';

export default function BrandMark({ size = 38, radius = 11, iconSize = 20, bg = TI.accent, color = '#fff', shadow = true, className, style = {} }) {
  const { branding } = useBranding();
  const hasLogo = Boolean(branding.logo_data_url);
  return (
    <span className={className} style={{
      width: size, height: size, borderRadius: radius, background: hasLogo ? 'transparent' : bg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flex: '0 0 auto',
      boxShadow: shadow && !hasLogo ? '0 8px 18px rgba(79,70,229,.24)' : 'none',
      ...style,
    }}>
      {hasLogo ? (
        <img src={branding.logo_data_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Ico name="home" size={iconSize} color={color} sw={2} />
      )}
    </span>
  );
}
