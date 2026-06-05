import { useEffect, useState } from 'react';
import api from '../api/client';
import { INN_CONTACT } from '../config/contact';

export default function useInnContact() {
  const [contact, setContact] = useState(INN_CONTACT);

  useEffect(() => {
    let live = true;
    api.get('/contact/')
      .then(({ data }) => {
        if (live) setContact({ ...INN_CONTACT, ...data });
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  return contact;
}
