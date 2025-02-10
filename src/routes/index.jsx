import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import VehiclesPage from '../pages/vehicles/VehiclesPage';
import ProfilePage from '../pages/profile/ProfilePage';
import SubscriptionPage from '../pages/subscription/SubscriptionPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Import des composants de contrats
import ContractsPage from '../pages/contracts/ContractsPage';
import AddContractDialog from '../pages/contracts/AddContractDialog';
import DocumentUpload from '../pages/contracts/DocumentUpload';
import SignatureCanvas from '../pages/contracts/SignatureCanvas';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Routes protégées avec Layout */}
      <Route path="/" element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        
        {/* Routes pour les contrats */}
        <Route path="contracts">
          <Route index element={<ContractsPage />} />
          <Route path="new" element={<AddContractDialog />} />
          <Route path=":id/documents" element={<DocumentUpload />} />
          <Route path=":id/signature" element={<SignatureCanvas />} />
        </Route>
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;