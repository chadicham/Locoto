import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Composants chargés immédiatement (critiques)
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Lazy loading des pages
const LoginPage = lazy(() => import('../components/auth/LoginPage'));
const RegisterPage = lazy(() => import('../components/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const VehiclesPage = lazy(() => import('../pages/vehicles/VehiclesPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const SubscriptionPage = lazy(() => import('../pages/subscription/SubscriptionPage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));

// Lazy loading des composants de contrats
const ContractsPage = lazy(() => import('../pages/contracts/ContractsPage'));
const AddContractDialog = lazy(() => import('../pages/contracts/AddContractDialog'));
const DocumentUpload = lazy(() => import('../pages/contracts/DocumentUpload'));
const SignatureCanvas = lazy(() => import('../pages/contracts/SignatureCanvas'));

// Composant de chargement
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
  );
};

export default AppRoutes;