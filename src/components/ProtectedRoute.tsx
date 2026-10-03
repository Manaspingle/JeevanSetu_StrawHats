import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, LogIn, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'donor' | 'hospital' | 'bank';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { session, profile, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Verifying national registry credentials...
        </p>
      </div>
    );
  }

  // Not logged in -> Redirect to /auth
  if (!session && !profile) {
    return (
      <Navigate 
        to={`/auth?redirect=${encodeURIComponent(location.pathname)}&role=${requiredRole || 'donor'}&notice=auth_required`} 
        replace 
      />
    );
  }

  return children;
}
