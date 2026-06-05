import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './views/Landing';
import OwnerApp from './views/owner/OwnerApp';
import AdminApp from './views/admin/AdminApp';
import CustomerApp from './views/customer/CustomerApp';
import { TI } from './theme';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: TI.ui, fontSize: 14, color: TI.sub }}>Loading…</div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/bookings" replace />;
  return <Navigate to="/customer/explore" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<RoleRedirect />} />

      <Route path="/owner/*" element={
        <ProtectedRoute roles={['owner']}>
          <OwnerApp />
        </ProtectedRoute>
      } />

      <Route path="/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <AdminApp />
        </ProtectedRoute>
      } />

      <Route path="/customer/*" element={
        <ProtectedRoute roles={['customer']}>
          <CustomerApp />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
