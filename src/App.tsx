import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/ui/ToastRegion';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import DonorDashboard from '@/pages/DonorDashboard';
import HospitalDashboard from '@/pages/HospitalDashboard';
import BankDashboard from '@/pages/BankDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* The Four Core Role Dashboards (Protected after Login/Signup) */}
      <Route element={<Layout />}>
        <Route
          path="/donor"
          element={
            <ProtectedRoute requiredRole="donor">
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital"
          element={
            <ProtectedRoute requiredRole="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank"
          element={
            <ProtectedRoute requiredRole="bank">
              <BankDashboard />
            </ProtectedRoute>
          }
        />
        {/* Admin redirect */}
        <Route path="/admin" element={<Navigate to="/hospital" replace />} />

        {/* Compatibility Redirects */}
        <Route path="/dashboard" element={<Navigate to="/donor" replace />} />
        <Route path="/hospital-dashboard" element={<Navigate to="/hospital" replace />} />
        <Route path="/bank-dashboard" element={<Navigate to="/bank" replace />} />
        <Route path="/donor-directory" element={<Navigate to="/donor" replace />} />
        <Route path="/matching-engine" element={<Navigate to="/hospital" replace />} />
        <Route path="/create-request" element={<Navigate to="/hospital" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
