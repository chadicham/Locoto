import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import LoginPage from '../components/auth/LoginPage';
import Dashboard from '../pages/Dashboard';
import VehiclesPage from '../pages/vehicles/VehiclesPage';
import ProfilePage from '../pages/profile/ProfilePage';
import SubscriptionPage from '../pages/subscription/SubscriptionPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';


const AppRoutes = () => {
  return (
    <Routes>
    <Route path="/login" element={<LoginPage />} />
    
    <Route element={<ProtectedRoute>
      <Layout />
    </ProtectedRoute>}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
    </Route>
  
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  );
};

export default AppRoutes;