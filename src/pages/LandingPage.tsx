import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import {
  Heart, Building2, ShieldCheck, ShieldAlert, Activity, ArrowRight,
  Zap, Clock, MapPin, Users, CheckCircle2, Siren, Sparkles, AlertTriangle
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Connecting People, Saving lives &bull; Live in Nagpur, Pune &amp; Mumbai
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto text-slate-900 dark:text-white">
            Real-Time Blood Bank Inventory &amp;{' '}
            <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Race-Safe Allocation
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal">
            Eliminating shortages and wastage by making stock and donor availability visible in real time. Features FEFO expiry alerts, distance routing, fraud prevention, and atomic isolation for competing requests.
          </p>

          {/* Quick CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/admin"
              className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-rose-900/20 flex items-center gap-2 transition transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current text-amber-300" />
              Launch Live Race Demo (Evaluator Screen)
            </Link>
            <Link
              to="/hospital"
              className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition"
            >
              <Building2 className="w-4 h-4 text-rose-500" />
              Hospital Emergency Request
            </Link>
            <Link
              to="/bank"
              className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition"
            >
              <Activity className="w-4 h-4 text-emerald-500" />
              Blood Bank Shelf Stock
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pillars Mapped to the Problem Statement */}
      <section className="py-20 bg-white dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2">
              Demonstrable Technical Rigor
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Built to Solve the 4 Core Hackathon Requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Req 1: Stock & Expiry */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">1. Stock &amp; Expiry Alerts</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Unit-level inventory with FEFO (First-Expiring-First-Out) dispatch order. Automated alerts at 7, 3, and 1 day horizons prevent shelf wastage.
              </p>
              <div className="pt-2">
                <Link to="/bank" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline">
                  Inspect Bank Stock Grid <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Req 2: Compatibility & Routing */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">2. Compatibility &amp; Routing</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Complete 8x8 ABO/Rh red cell matrix. Multi-factor scoring preserves universal O- stock, computes Haversine/Google Routes ETA, and falls back to nearby donors.
              </p>
              <div className="pt-2">
                <Link to="/hospital" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 inline-flex items-center gap-1 hover:underline">
                  Test Routing Engine <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Req 3: Race-Safe Allocation */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 space-y-3 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">3. Race-Safe Allocation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Server-authoritative atomic transactions guarantee zero overselling when multiple hospitals compete for the last unit. Non-winners gracefully reroute.
              </p>
              <div className="pt-2">
                <Link to="/admin" className="text-xs font-bold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 hover:underline">
                  Run Concurrency Race <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Req 4: Verification & Anti-Fraud */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">4. Donor Verification &amp; Fraud</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cryptographic request deduplication, velocity rate limiting, risk scoring with Gemini AI reasoning, and cooldown eligibility (90d M / 120d F).
              </p>
              <div className="pt-2">
                <Link to="/donor" className="text-xs font-bold text-purple-600 dark:text-purple-400 inline-flex items-center gap-1 hover:underline">
                  View Donor Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Navigation Hub */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-rose-900/90 to-slate-900 border border-rose-800/50 rounded-3xl p-8 lg:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-rose-400">Evaluator Walkthrough</span>
              <h3 className="text-2xl sm:text-3xl font-bold">Switch Between Dedicated Role Views</h3>
              <p className="text-slate-300 text-sm">
                Experience the system from the perspective of an Emergency Physician, Blood Bank Officer, Verified Donor, or Administrative Auditor.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/hospital" className="px-5 py-3 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition">
                Hospital View
              </Link>
              <Link to="/bank" className="px-5 py-3 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition">
                Bank View
              </Link>
              <Link to="/donor" className="px-5 py-3 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition">
                Donor View
              </Link>
              <Link to="/admin" className="px-5 py-3 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-500 transition shadow-lg shadow-rose-950">
                Admin Console
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
