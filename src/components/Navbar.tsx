import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, type Language } from '@/context/LanguageContext';
import {
  Heart, Building2, Activity, ShieldCheck, Sun, Moon,
  LogIn, LogOut, Menu, X, UserCheck, Eye, Type, Globe, Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { themeMode, toggleThemeMode, highContrast, toggleHighContrast, textSize, setTextSize } = useTheme();
  const { language, setLanguage, t } = useLanguage();
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
    { to: '/donor', label: language === 'mr' ? 'रक्तदाता' : language === 'hi' ? 'रक्तदाता' : 'Donor View', icon: Heart },
    { to: '/hospital', label: language === 'mr' ? 'रुग्णालय' : language === 'hi' ? 'अस्पताल' : 'Hospital View', icon: Building2 },
    { to: '/bank', label: language === 'mr' ? 'रक्तपेढी' : language === 'hi' ? 'रक्त बैंक' : 'Blood Bank View', icon: Activity },
    { to: '/admin', label: language === 'mr' ? 'प्रशासन व डेमो' : language === 'hi' ? 'प्रशासन व डेमो' : 'Admin & Demo', icon: ShieldCheck, highlight: true }
  ];

  return (
    <>
      {/* WCAG 2.2 AA Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg js-focus-ring"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF'
        }}
      >
        Skip to main content
      </a>

      {/* Top Accessibility & Language Header Bar */}
      <div 
        className="text-xs py-1.5 px-4 border-b transition-colors"
        style={{
          backgroundColor: 'var(--color-navy)',
          borderColor: 'var(--color-border)',
          color: '#FFFFFF'
        }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: 'var(--color-success-fill)' }}
            />
            <span className="font-semibold text-[11px] sm:text-xs">
              JeevanSetu Action-First Blood &amp; Transfusion Network
            </span>
          </div>

          {/* Accessibility Controls Toolbar */}
          <div className="flex items-center gap-3">
            {/* Language Selector (EN / HI / MR) */}
            <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-lg border border-white/20">
              <Globe className="w-3.5 h-3.5 text-white/80" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${language === 'en' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'}`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${language === 'hi' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'}`}
                aria-label="हिंदी में बदलें"
              >
                HI
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${language === 'mr' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'}`}
                aria-label="मराठीत बदला"
              >
                MR
              </button>
            </div>

            {/* Text Size Controls (A- A A+) */}
            <div className="flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-lg border border-white/20">
              <button
                onClick={() => setTextSize('sm')}
                className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${textSize === 'sm' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'}`}
                aria-label="Smaller text size"
                title="Text Size: Small (14px)"
              >
                A-
              </button>
              <button
                onClick={() => setTextSize('base')}
                className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${textSize === 'base' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'}`}
                aria-label="Default text size"
                title="Text Size: Default (16px)"
              >
                A
              </button>
              <button
                onClick={() => setTextSize('lg')}
                className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${textSize === 'lg' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'}`}
                aria-label="Larger text size"
                title="Text Size: Large (18px)"
              >
                A+
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              aria-label="Toggle high contrast mode"
              title={highContrast ? 'Disable High Contrast' : 'Enable High Contrast'}
              className={`p-1 rounded-lg border transition ${highContrast ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-white/10 text-white/80 border-white/20 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Clinical Trust vs Life & Care Theme Switch */}
            <button
              onClick={toggleThemeMode}
              aria-label="Toggle Clinical Trust vs Life & Care theme"
              title={themeMode === 'clinical' ? 'Switch to Life & Care Theme' : 'Switch to Clinical Trust Theme'}
              className="p-1 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:text-white transition flex items-center gap-1 text-[11px] font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">{themeMode === 'clinical' ? 'Clinical' : 'Life & Care'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header 
        className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-20">
            
            {/* Left Corner: Uploaded Logo + JeevanSetu Name + Tagline */}
            <Link 
              to="/" 
              className="flex items-center gap-3.5 group js-focus-ring rounded-xl p-1"
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

            {/* Desktop Navigation: 4 Role Views */}
            <nav className="hidden lg:flex items-center gap-2" aria-label="Main Role Portals">
              {navLinks.map(({ to, label, icon: Icon, highlight }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border js-focus-ring ${
                      isActive
                        ? 'shadow-sm'
                        : ''
                    }`}
                    style={{
                      backgroundColor: isActive ? 'var(--color-bg)' : 'var(--color-surface)',
                      borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-navy)'
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: highlight ? 'var(--color-primary)' : 'inherit' }} />
                    <span>{label}</span>
                  </Link>
                );
              })}

              {/* Login / Signup / Profile */}
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
                    className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 js-focus-ring"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-navy)'
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
                  className="min-h-[44px] px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 ml-2 js-focus-ring"
                  style={{
                    backgroundColor: 'var(--color-primary)'
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Register</span>
                </Link>
              )}
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border js-focus-ring"
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden border-t px-4 py-5 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-4"
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
                className="min-h-[44px] flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border js-focus-ring"
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
                    className="min-h-[44px] w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 js-focus-ring"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-navy)'
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
                  className="min-h-[44px] w-full py-3 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md js-focus-ring"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
