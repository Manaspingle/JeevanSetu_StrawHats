import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { EmergencyBottomBar } from '@/components/ui/EmergencyBottomBar';
import { BloodGroupChips } from '@/components/ui/BloodGroupChips';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';
import { bloodService } from '@/services/bloodService';
import type { BloodGroup } from '@/types/blood';
import {
  Heart, Building2, Activity, ShieldCheck, Siren, ArrowRight,
  Clock, MapPin, Search, CheckCircle2, AlertOctagon, Phone,
  Sparkles, Award, FileCheck, Users, Droplet
} from 'lucide-react';

export default function LandingPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Real data from bloodService
  const [banks, setBanks] = useState(bloodService.getBanks());
  const [donors, setDonors] = useState(bloodService.getDonors());
  const [units, setUnits] = useState(bloodService.getUnits());
  const [stockSummaries, setStockSummaries] = useState(bloodService.getStockSummaries());

  useEffect(() => {
    const sync = () => {
      setBanks(bloodService.getBanks());
      setDonors(bloodService.getDonors());
      setUnits(bloodService.getUnits());
      setStockSummaries(bloodService.getStockSummaries());
    };
    return bloodService.subscribe(sync);
  }, []);

  // Action-First Reserve & Route quick filter
  const [quickGroup, setQuickGroup] = useState<BloodGroup>('O-');
  const [quickCity, setQuickCity] = useState<'Nagpur' | 'Mumbai' | 'Pune'>('Nagpur');
  const [quickComponent, setQuickComponent] = useState<'RBC' | 'whole'>('RBC');

  // Real stats
  const availableUnits = units.filter(u => u.status === 'available').length;
  const onlineBanksCount = banks.length;
  const expiringSoonCount = units.filter(u => {
    if (u.status !== 'available') return false;
    const diffDays = (new Date(u.expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  // Filtered available units by group and city
  const cityBanks = banks.filter(b => b.city === quickCity);

  return (
    <div 
      className="min-h-screen flex flex-col justify-between transition-colors pb-16 md:pb-0"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }}
    >
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        
        {/* =========================================================================
            1. ACTION-FIRST HERO SECTION
        ========================================================================= */}
        <section className="py-10 md:py-16 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Mission, Branding & Direct Action */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-navy)'
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--color-primary)' }} />
                  <span>Action-First Blood Logistics &bull; Request, Reserve, Route</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]" style={{ color: 'var(--color-navy)' }}>
                  Save Precious Time in Blood Transfusions
                </h1>

                <p className="text-base sm:text-lg opacity-85 max-w-xl leading-relaxed" style={{ color: 'var(--color-navy)' }}>
                  JeevanSetu replaces slow search loops with instantaneous reservation and auto-routing. Verified donor registry, live shelf stocks, and atomic last-unit protection.
                </p>

                {/* Direct Action Primary Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/hospital"
                    className="min-h-[44px] px-6 py-3 rounded-xl font-black text-sm text-white flex items-center gap-2 shadow-md transition active:scale-95 js-focus-ring"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Siren className="w-4 h-4 animate-pulse" />
                    <span>Emergency Hospital Request</span>
                  </Link>

                  <Link
                    to="/donor"
                    className="min-h-[44px] px-5 py-3 rounded-xl font-bold text-sm border flex items-center gap-2 transition js-focus-ring"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-navy)'
                    }}
                  >
                    <Heart className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    <span>I Want to Donate</span>
                  </Link>

                  <Link
                    to="/bank"
                    className="min-h-[44px] px-4 py-3 rounded-xl font-bold text-sm opacity-80 hover:opacity-100 transition flex items-center gap-1.5"
                    style={{ color: 'var(--color-navy)' }}
                  >
                    <span>Blood Bank Intake</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Visual Graphic */}
              <div className="lg:col-span-5 flex justify-center">
                <div 
                  className="w-full max-w-md p-6 rounded-2xl border shadow-md space-y-4"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <img src="/jeevansetu-logo.png" alt="JeevanSetu" className="h-10 w-auto object-contain" />
                      <div>
                        <p className="font-black text-base leading-tight" style={{ color: 'var(--color-navy)' }}>जीवनSetu</p>
                        <p className="text-[11px] opacity-75 font-semibold" style={{ color: 'var(--color-navy)' }}>रक्ताचा सेतू, जीवनाचा आधार</p>
                      </div>
                    </div>
                    <StatusBadge status="available" label="Active Grid" />
                  </div>

                  {/* Clean Visual Image of Doctor / Clinical Care */}
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                    <img 
                      src="/doctor-care.svg" 
                      alt="Clinical Triage & Transfusion"
                      className="w-full h-44 object-contain bg-slate-50"
                    />
                  </div>

                  <div className="p-3 rounded-xl border flex items-center justify-between text-xs" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                    <span className="font-semibold" style={{ color: 'var(--color-navy)' }}>Atomic Concurrency Protocol:</span>
                    <span className="font-black" style={{ color: 'var(--color-success-text)' }}>Race-Safe Last Unit</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. LIVE STATS STRIP (Connected to Real Data)
        ========================================================================= */}
        <section 
          className="py-6 border-b"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-primary)' }}>
                  {availableUnits}
                </p>
                <p className="text-xs font-bold mt-1 opacity-75" style={{ color: 'var(--color-navy)' }}>
                  Units Available in Demo
                </p>
              </div>

              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-navy)' }}>
                  {onlineBanksCount}
                </p>
                <p className="text-xs font-bold mt-1 opacity-75" style={{ color: 'var(--color-navy)' }}>
                  Blood Banks Online
                </p>
              </div>

              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-warning-text)' }}>
                  {expiringSoonCount}
                </p>
                <p className="text-xs font-bold mt-1 opacity-75" style={{ color: 'var(--color-navy)' }}>
                  Units Expiring Soon (≤3d)
                </p>
              </div>

              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-success-text)' }}>
                  {donors.length}
                </p>
                <p className="text-xs font-bold mt-1 opacity-75" style={{ color: 'var(--color-navy)' }}>
                  Registered Donors
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            3. THREE LARGE INTENT-BASED ENTRY CARDS
        ========================================================================= */}
        <section className="py-12 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-navy)' }}>
                Select Your Direct Action
              </h2>
              <p className="text-xs sm:text-sm mt-1.5 opacity-80" style={{ color: 'var(--color-navy)' }}>
                Instant access based on your immediate healthcare requirement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: I need blood */}
              <div 
                className="p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="space-y-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-primary)' }}
                  >
                    <Siren className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                    I Need Blood
                  </h3>
                  <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-navy)' }}>
                    For hospital ER, ICU, and trauma attendants. Create an urgent request with blood group chips, units stepper, and auto-routing.
                  </p>
                </div>
                <Link
                  to="/hospital"
                  className="min-h-[44px] w-full py-3 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-sm transition active:scale-95 js-focus-ring"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <span>Request Emergency Allocation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card 2: I want to donate */}
              <div 
                className="p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="space-y-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-success-text)' }}
                  >
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                    I Want to Donate
                  </h3>
                  <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-navy)' }}>
                    Register as a voluntary lifesaver. Check eligibility countdown, complete official ID verification, and view nearby urgent requests.
                  </p>
                </div>
                <Link
                  to="/donor"
                  className="min-h-[44px] w-full py-3 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition active:scale-95 js-focus-ring"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)'
                  }}
                >
                  <span>Open Donor Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card 3: Blood bank / hospital login */}
              <div 
                className="p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="space-y-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }}
                  >
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                    Blood Bank / Hospital Login
                  </h3>
                  <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-navy)' }}>
                    Certified storage facilities and hospitals. Manage component inventories, FEFO dispatch, quarantine logs, and unit intake.
                  </p>
                </div>
                <Link
                  to="/bank"
                  className="min-h-[44px] w-full py-3 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition active:scale-95 js-focus-ring"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-navy)'
                  }}
                >
                  <span>Facility Portal Access</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            4. VISUAL SHOWCASE: VERIFICATION & COMMUNITY BANNERS
        ========================================================================= */}
        <section className="py-12 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
            
            {/* Top row: 2 cards with clean SVG illustrations (ID verification + Blood donation) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div 
                className="p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-6"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <img 
                  src="/id-verification.svg" 
                  alt="Official ID Verification" 
                  className="w-36 h-36 object-contain shrink-0" 
                />
                <div className="space-y-2 text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-success-text)' }}>
                    Anti-Fraud Guard
                  </span>
                  <h3 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
                    Official ID Verification
                  </h3>
                  <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-navy)' }}>
                    Donors authenticate with photo ID. Ensures verified medical safety, non-remunerated voluntary standards, and fraud deduplication.
                  </p>
                </div>
              </div>

              <div 
                className="p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-6"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <img 
                  src="/blood-donation.svg" 
                  alt="Blood Donation Process" 
                  className="w-36 h-36 object-contain shrink-0" 
                />
                <div className="space-y-2 text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                    Safe &amp; Clean
                  </span>
                  <h3 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
                    Component Apheresis
                  </h3>
                  <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-navy)' }}>
                    Whole blood, platelets, and plasma donation. Each bag is barcoded, temperature monitored, and logged with immutable SHA-256 hashes.
                  </p>
                </div>
              </div>

            </div>

            {/* Clean Community & Pledge Banners (NO government text/emblems) */}
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
                <img 
                  src="/donation-pledge.svg" 
                  alt="Voluntary Blood Donation Pledge"
                  className="w-full h-auto object-cover" 
                />
              </div>

              <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
                <img 
                  src="/community-life.svg" 
                  alt="One Drop of Humanity Community Life"
                  className="w-full h-auto object-cover" 
                />
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            5. ACTION-FIRST REAL-TIME STOCK & ROUTE MATRIX
        ========================================================================= */}
        <section className="py-12 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-navy)' }}>
                Live Blood Bank Shelf Availability
              </h2>
              <p className="text-xs sm:text-sm mt-1.5 opacity-80" style={{ color: 'var(--color-navy)' }}>
                Select a group to see exact real-time units ready for emergency reservation.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl border shadow-sm space-y-6"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {/* Radio Group Chips */}
              <BloodGroupChips 
                value={quickGroup} 
                onChange={(bg) => setQuickGroup(bg)} 
              />

              {/* City Filter & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold" style={{ color: 'var(--color-navy)' }}>Filter by Region:</span>
                  <div className="flex items-center gap-2">
                    {(['Nagpur', 'Pune', 'Mumbai'] as const).map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setQuickCity(city)}
                        className="min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold border transition js-focus-ring"
                        style={{
                          backgroundColor: quickCity === city ? 'var(--color-navy)' : 'var(--color-surface)',
                          borderColor: quickCity === city ? 'var(--color-navy)' : 'var(--color-border)',
                          color: quickCity === city ? '#FFFFFF' : 'var(--color-navy)'
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  to="/hospital"
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition js-focus-ring"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <span>Reserve {quickGroup} in {quickCity}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {cityBanks.map(bank => {
                  const count = stockSummaries[bank.id]?.counts[quickGroup] || 0;
                  const status = count > 5 ? 'available' : count > 0 ? 'low' : 'critical';

                  return (
                    <div 
                      key={bank.id}
                      className="p-4 rounded-xl border flex items-center justify-between gap-4"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold" style={{ color: 'var(--color-navy)' }}>{bank.name}</p>
                        <p className="text-xs opacity-70 flex items-center gap-1" style={{ color: 'var(--color-navy)' }}>
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{bank.address}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-lg font-black" style={{ color: 'var(--color-primary)' }}>
                          {count} Units
                        </div>
                        <StatusBadge status={status} />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Sticky Mobile Emergency Button */}
      <EmergencyBottomBar />

      {/* Clean Footer */}
      <footer 
        className="py-8 border-t text-xs text-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-navy)'
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 space-y-2">
          <p className="font-bold">
            जीवनSetu &bull; रक्ताचा सेतू, जीवनाचा आधार
          </p>
          <p className="opacity-70 text-[11px]">
            Action-First Clinical Blood Transfusion, Cold-Chain Safety &amp; Verified Donor Registry
          </p>
        </div>
      </footer>
    </div>
  );
}
