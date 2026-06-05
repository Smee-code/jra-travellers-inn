import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ConsoleShell from '../../layouts/ConsoleShell';
import Bookings from './Bookings';
import Customers from './Customers';
import Rooms from './Rooms';
import Reports from './AdminReports';
import Settings from './Settings';

const NAV = [
  { id: 'bookings', label: 'Bookings', icon: 'cal' },
  { id: 'customers', label: 'Users', icon: 'users' },
  { id: 'rooms', label: 'Rooms', icon: 'bed' },
  { id: 'reports', label: 'Reports', icon: 'doc' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];

export default function AdminApp() {
  const navigate = useNavigate();
  const getRoute = () => {
    const seg = window.location.pathname.split('/').pop();
    return NAV.find(n => n.id === seg)?.id || 'bookings';
  };
  const [route, setRoute] = useState(getRoute);
  const onNav = (id) => { setRoute(id); navigate(`/admin/${id}`); };

  return (
    <ConsoleShell roleTag="Admin" nav={NAV} route={route} onNav={onNav}>
      <Routes>
        <Route index element={<Navigate to="bookings" replace />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="customers" element={<Customers manageUsers />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="bookings" replace />} />
      </Routes>
    </ConsoleShell>
  );
}
