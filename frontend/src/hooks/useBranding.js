import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

let cachedBranding = { logo_data_url: '' };
const listeners = new Set();

function notify(next) {
  cachedBranding = next;
  listeners.forEach((listener) => listener(next));
}

export default function useBranding() {
  const [branding, setBranding] = useState(cachedBranding);

  useEffect(() => {
    listeners.add(setBranding);
    api.get('/branding/')
      .then(({ data }) => notify(data))
      .catch(() => {});
    return () => listeners.delete(setBranding);
  }, []);

  const updateLogo = useCallback(async (logo_data_url) => {
    const { data } = await api.patch('/branding/', { logo_data_url });
    notify(data);
    return data;
  }, []);

  return { branding, updateLogo };
}
