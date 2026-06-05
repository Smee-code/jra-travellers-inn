import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ConsoleShell from '../../layouts/ConsoleShell';
import Dashboard from './Dashboard';
import Forecasts from './Forecasts';
import Trends from './Trends';
import AvpScreen from './AvpScreen';
import Reports from './Reports';
import Profile from './Profile';
import Bookings from '../admin/Bookings';
import Customers from '../admin/Customers';
import Rooms from '../admin/Rooms';
import Settings from '../admin/Settings';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'bookings', label: 'Bookings', icon: 'cal' },
  { id: 'customers', label: 'Customers', icon: 'users' },
  { id: 'rooms', label: 'Rooms', icon: 'bed' },
  { id: 'forecasts', label: 'Forecasts', icon: 'forecast' },
  { id: 'trends', label: 'Trends', icon: 'trend' },
  { id: 'avp', label: 'Actual vs Predicted', icon: 'chart' },
  { id: 'reports', label: 'Reports', icon: 'doc' },
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];

export default function OwnerApp() {
  const navigate = useNavigate();

  const getRoute = () => {
    const seg = window.location.pathname.split('/').pop();
    return NAV.find(n => n.id === seg)?.id || 'dashboard';
  };
  const [route, setRoute] = useState(getRoute);

  const onNav = (id) => { setRoute(id); navigate(`/owner/${id}`); };

  return (
    <ConsoleShell roleTag="Owner" nav={NAV} route={route} onNav={onNav}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="customers" element={<Customers />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="forecasts" element={<Forecasts />} />
        <Route path="trends" element={<Trends />} />
        <Route path="avp" element={<AvpScreen />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings logoOnly />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </ConsoleShell>
  );
}
