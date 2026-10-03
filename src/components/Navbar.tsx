import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Heart, Building2, ShieldAlert, Users, Sun, Moon,
  Activity, Siren, CheckCircle2, Menu, X
} from 'lucide-react';

export default function Navbar() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/hospital', label: 'Hospital View', icon: Building2 },
    { to: '/bank', label: 'Blood Bank View', icon: Activity },
    { to: '/donor', label: 'Donor View', icon: Users },
    { to: '/admin', label: 'Admin & Race Demo', icon: ShieldAlert, highlight: true }
  ];

  return (
    <>
      {/* Skip link for WCAG 2.2 AA accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-rose-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Logo & Tagline */}
            <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-xl p-1">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-900/20 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  JeevanSetu
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                </span>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 -mt-0.5 tracking-wider uppercase">
                  Connecting People, Saving lives
                </p>
              </div>
            </Link>

            {/* Desktop Navigation: 4 Role Views */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60" aria-label="Main Navigation">
              {navLinks.map(({ to, label, icon: Icon, highlight }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                        : highlight
                          ? 'text-purple-600 dark:text-purple-400 hover:text-purple-700'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions: Theme Toggle & Role Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle visual theme"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>

              <Link
                to="/hospital"
                className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-900/20 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                <Siren className="w-4 h-4 animate-pulse" />
                <span className="hidden sm:inline">Emergency</span> Request
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold ${
                  location.pathname === to
                    ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
