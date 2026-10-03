import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Layout from '@/components/Layout';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import DonorDashboard from '@/pages/DonorDashboard';
import HospitalDashboard from '@/pages/HospitalDashboard';
import BankDashboard from '@/pages/BankDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<Layout />}>
        {/* Core 4 Role-Based Routes */}
        <Route path="/donor" element={<DonorDashboard />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/bank" element={<BankDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Scaffolding Compatibility Redirects */}
        <Route path="/dashboard" element={<Navigate to="/donor" replace />} />
        <Route path="/hospital-dashboard" element={<Navigate to="/hospital" replace />} />
        <Route path="/donor-directory" element={<Navigate to="/donor" replace />} />
        <Route path="/matching-engine" element={<Navigate to="/hospital" replace />} />
        <Route path="/create-request" element={<Navigate to="/hospital" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
