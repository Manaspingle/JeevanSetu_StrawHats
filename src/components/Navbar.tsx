import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Heart, Building2, Activity, Sun, Moon,
  LogIn, LogOut, Menu, X, UserCheck, Shield
} from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { session, profile, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navButtons = [
    { 
      to: '/donor', 
      label: 'Donor Dashboard', 
      icon: Heart,
      accentColor: 'hover:text-rose-600 hover:border-rose-500'
    },
    { 
      to: '/hospital', 
      label: 'Hospital Dashboard', 
      icon: Building2,
      accentColor: 'hover:text-blue-600 hover:border-blue-500'
    },
    { 
      to: '/bank', 
      label: 'Blood Bank Dashboard', 
      icon: Activity,
      accentColor: 'hover:text-emerald-600 hover:border-emerald-500'
    }
  ];

  return (
    <>
      {/* Top Government Portal Identifier Stripe (eRaktKosh inspired) */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-medium py-1 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-white">Ministry of Health &amp; Family Welfare Network</span>
            <span className="hidden sm:inline text-slate-400">| National Blood Transfusion Initiative</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Toll-Free Blood Helpline:</span>
            <span className="font-bold text-amber-400 tracking-wide">104 / 1910</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Left Corner: Uploaded Logo + JeevanSetu Name + Tagline */}
            <Link 
              to="/" 
              className="flex items-center gap-3.5 group focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-xl p-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <img
                src="/jeevansetu-logo.png"
                alt="JeevanSetu Logo"
                className="h-12 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col text-left">
                <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                  जीवन<span className="text-rose-600">Setu</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-none tracking-wide">
                  रक्ताचा सेतू, जीवनाचा आधार
                </span>
              </div>
            </Link>

            {/* Desktop Navigation: Ordered exactly from left to right as specified:
                1. Donor Dashboard button
                2. Hospital Dashboard button
                3. Blood Bank Dashboard button
                4. Light/Dark theme option
                5. Login/Signup option
            */}
            <nav className="hidden lg:flex items-center gap-2" aria-label="Main Navigation">
              {navButtons.map(({ to, label, icon: Icon, accentColor }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                      isActive
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 shadow-sm'
                        : `bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 ${accentColor}`
                    }`}
                  >
                    <Icon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>{label}</span>
                  </Link>
                );
              })}

              {/* 4. Light/Dark theme option */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle visual theme"
                className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 ml-1"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* 5. Login / Signup option */}
              {session || profile ? (
                <div className="flex items-center gap-2 ml-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="capitalize">{role || 'User'}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition flex items-center gap-1.5"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden xl:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="min-h-[42px] px-4 py-2 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 ml-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Signup</span>
                </Link>
              )}
            </nav>

            {/* Mobile Menu & Theme Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-5 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200 shadow-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Select Portal Dashboard
            </div>
            
            {/* 1. Donor Dashboard */}
            <Link
              to="/donor"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border ${
                location.pathname === '/donor'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 dark:border-rose-900'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Heart className="w-5 h-5 text-rose-600" />
              <span>Donor Dashboard</span>
            </Link>

            {/* 2. Hospital Dashboard */}
            <Link
              to="/hospital"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border ${
                location.pathname === '/hospital'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 border-blue-300 dark:border-blue-900'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Hospital Dashboard</span>
            </Link>

            {/* 3. Blood Bank Dashboard */}
            <Link
              to="/bank"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border ${
                location.pathname === '/bank'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-300 dark:border-emerald-900'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>Blood Bank Dashboard</span>
            </Link>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {session || profile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Logged in as:</span>
                    <span className="font-bold text-slate-800 dark:text-white capitalize">{role || 'User'}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-rose-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-900/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Signup</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
