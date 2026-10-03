import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Heart, Building2, Activity, Sun, Moon,
  LogIn, LogOut, Menu, X, UserCheck, FileText
} from 'lucide-react';

export default function Navbar() {
  const { themeMode, toggleThemeMode, isDark } = useTheme();
  const { session, profile, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/donor', label: 'Donor Dashboard', icon: Heart },
    { to: '/hospital', label: 'Hospital Dashboard', icon: Building2 },
    { to: '/bank', label: 'Blood Bank Dashboard', icon: Activity },
  ];

  const isDonorView = location.pathname.startsWith('/donor');

  const triggerReportGeneration = () => {
    window.dispatchEvent(new CustomEvent('jeevansetu:generate-donor-report'));
  };

  return (
    <header 
      className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Left Corner: Logo + Name JeevanSetu + Tagline */}
          <Link 
            to="/" 
            className="flex items-center gap-3.5 group rounded-xl p-1 focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src="/jeevansetu-logo.png"
              alt="JeevanSetu Logo"
              className="h-12 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col text-left">
              <span className="font-black text-2xl tracking-tight leading-tight flex items-center gap-1" style={{ color: 'var(--color-navy)' }}>
                जीवन<span style={{ color: 'var(--color-primary)' }}>Setu</span>
              </span>
              <span className="text-[11px] font-semibold leading-none tracking-wide opacity-80" style={{ color: 'var(--color-navy)' }}>
                रक्ताचा सेतू, जीवनाचा आधार
              </span>
            </div>
          </Link>

          {/* Desktop Navigation: Donor, Hospital, Blood Bank, Light/Dark, Login/Signup */}
          <nav className="hidden lg:flex items-center gap-2.5" aria-label="Main Navigation">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                    isActive ? 'shadow-sm' : 'hover:border-orange-300 dark:hover:border-orange-500'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-bg)' : 'var(--color-surface)',
                    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-navy)'
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }} />
                  <span>{label}</span>
                </Link>
              );
            })}

            {/* Donor Report Generation Button (Visible in Donor view) */}
            {isDonorView && (
              <button
                type="button"
                onClick={triggerReportGeneration}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-sm active:scale-95"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-accent-blue)',
                  color: 'var(--color-accent-blue)'
                }}
                title="Generate and Download Official Donor Medical Report"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            )}

            {/* Light / Dark Theme Toggle Button */}
            <button
              onClick={toggleThemeMode}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border transition flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-navy)'
              }}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Light/Dark Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Login / Signup or User Profile */}
            {session || profile ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l" style={{ borderColor: 'var(--color-border)' }}>
                <div 
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-navy)'
                  }}
                >
                  <UserCheck className="w-4 h-4" style={{ color: 'var(--color-success-text)' }} />
                  <span className="capitalize">{role || 'User'}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-danger)'
                  }}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="min-h-[44px] px-5 py-2 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition active:scale-95 ml-2"
                style={{
                  backgroundColor: 'var(--color-primary)'
                }}
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Signup</span>
              </Link>
            )}
          </nav>

          {/* Mobile Actions: Theme Toggle + Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleThemeMode}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl border flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-navy)'
              }}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-navy)'
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden border-t px-4 py-5 space-y-3 shadow-xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--color-navy)' }}>
            Portal Dashboards
          </div>

          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border"
              style={{
                backgroundColor: location.pathname === to ? 'var(--color-bg)' : 'var(--color-surface)',
                borderColor: location.pathname === to ? 'var(--color-primary)' : 'var(--color-border)',
                color: location.pathname === to ? 'var(--color-primary)' : 'var(--color-navy)'
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}

          {isDonorView && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                triggerReportGeneration();
              }}
              className="min-h-[44px] w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-accent-blue)',
                color: 'var(--color-accent-blue)'
              }}
            >
              <FileText className="w-5 h-5" />
              <span>Generate Medical Report</span>
            </button>
          )}

          <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {session || profile ? (
              <div className="space-y-2">
                <div 
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }}
                >
                  <span>Logged in as:</span>
                  <span className="font-bold capitalize">{role || 'User'}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="min-h-[44px] w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-danger)'
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] w-full py-3 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Signup</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
