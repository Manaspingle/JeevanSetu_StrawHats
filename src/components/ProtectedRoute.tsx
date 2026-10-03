import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
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
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Verifying national registry credentials...
        </p>
      </div>
    );
  }

  // 1. Not logged in -> Redirect to /auth
  if (!session && !profile) {
    return (
      <Navigate 
        to={`/auth?redirect=${encodeURIComponent(location.pathname)}&role=${requiredRole || 'donor'}&notice=auth_required`} 
        replace 
      />
    );
  }

  // 2. Strict Role Isolation: Donors cannot enter hospital or blood bank, hospitals cannot enter donor or blood bank, etc.
  if (requiredRole && role && role !== requiredRole) {
    const userHome = role === 'hospital' ? '/hospital' : role === 'bank' ? '/bank' : '/donor';
    const roleName = role === 'donor' ? 'Donor' : role === 'hospital' ? 'Hospital' : 'Blood Bank';
    const requiredName = requiredRole === 'donor' ? 'Donor' : requiredRole === 'hospital' ? 'Hospital' : 'Blood Bank';

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div 
          className="max-w-md w-full p-8 rounded-2xl border shadow-lg space-y-5 text-left"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-navy)' }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black">Portal Access Restricted</h2>
            <p className="text-xs opacity-75 mt-1 leading-relaxed">
              Your account is registered as a <strong>{roleName}</strong>. Access to the <strong>{requiredName} Portal</strong> is strictly restricted to certified {requiredName.toLowerCase()} credentials to ensure clinical data integrity.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              to={userHome}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white text-center shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to My {roleName} Portal</span>
            </Link>
            <Link
              to={`/auth?role=${requiredRole}`}
              className="py-2.5 px-4 rounded-xl text-xs font-bold border text-center transition"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-navy)' }}
            >
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
