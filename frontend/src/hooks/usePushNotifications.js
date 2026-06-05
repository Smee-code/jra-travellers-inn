import { useEffect, useState } from 'react';
import api from '../api/client';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function supported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export default function usePushNotifications() {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supported()) {
      setStatus('unsupported');
      setMessage('This browser does not support push notifications.');
      return;
    }
    setStatus(Notification.permission === 'granted' ? 'enabled' : 'idle');
  }, []);

  const enable = async () => {
    if (!supported()) {
      setStatus('unsupported');
      setMessage('This browser does not support push notifications.');
      return;
    }

    setStatus('enabling');
    try {
      const { data } = await api.get('/push/public-key/');
      if (!data.configured || !data.public_key) {
        setStatus('setup-missing');
        setMessage('Push keys are not configured on the server yet.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        setMessage('Notifications were not allowed on this device.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.public_key),
      });

      await api.post('/push/subscribe/', subscription.toJSON());
      setStatus('enabled');
      setMessage('Booking notifications are enabled on this device.');
    } catch (e) {
      setStatus('error');
      setMessage(e.response?.data?.detail || 'Notifications could not be enabled.');
    }
  };

  return {
    enable,
    message,
    status,
    isEnabled: status === 'enabled',
    isUnsupported: status === 'unsupported',
  };
}
