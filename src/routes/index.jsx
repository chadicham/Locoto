import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import Dashboard from '../pages/Dashboard';
import VehiclesPage from '../pages/vehicles/VehiclesPage';
import ProfilePage from '../pages/profile/ProfilePage';
import SubscriptionPage from '../pages/subscription/SubscriptionPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Routes protégées avec Layout */}
      <Route path="/" element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;