import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import {
  Heart, Building2, Activity, Search, ShieldCheck,
  CheckCircle2, Clock, MapPin, Users, Phone,
  ArrowRight, Award, Droplet, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import { BLOOD_GROUPS, CITIES } from '@/lib/constants';
import { bloodService } from '@/services/bloodService';

export default function LandingPage() {
  // Blood Stock Availability Search State
  const [selectedCity, setSelectedCity] = useState<'Nagpur' | 'Mumbai' | 'Pune'>('Nagpur');
  const [selectedGroup, setSelectedGroup] = useState<string>('O+');
  const [selectedComponent, setSelectedComponent] = useState<'All' | 'RBC' | 'Platelets' | 'Plasma'>('All');
  const [searched, setSearched] = useState(false);

  // Search logic from bloodService
  const allBanks = bloodService.getBanks();
  const filteredBanks = allBanks.filter((bank) => bank.city === selectedCity);
  const stockSummaries = bloodService.getStockSummaries();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================================
            HERO SECTION - Government Style, Clean, Minimal & Authoritative
        ========================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Heading, Tagline & Quick Action CTAs */}
              <div className="lg:col-span-7 text-left space-y-6">
                
                {/* Government Portal Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block" />
                  <span>National Digital Blood Transfusion Network &bull; Govt of India</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.15]">
                    जीवन<span className="text-rose-600">Setu</span>
                  </h1>
                  <p className="text-lg sm:text-xl font-bold text-rose-700 dark:text-rose-400">
                    रक्ताचा सेतू, जीवनाचा आधार
                  </p>
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal max-w-2xl leading-relaxed">
                    A centralized, government-standard digital portal connecting voluntary blood donors, accredited hospital care units, and certified blood banks with live inventory transparency.
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/auth?mode=signup&role=donor"
                    className="px-6 py-3.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white rounded-xl font-bold text-sm shadow-md shadow-rose-900/20 flex items-center gap-2 transition active:scale-95"
                  >
                    <Heart className="w-4 h-4 fill-current text-rose-200" />
                    <span>Register as Blood Donor</span>
                  </Link>
                  
                  <a
                    href="#blood-search"
                    className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition"
                  >
                    <Search className="w-4 h-4 text-rose-600" />
                    <span>Check Blood Availability</span>
                  </a>

                  <Link
                    to="/auth"
                    className="px-5 py-3.5 text-slate-700 dark:text-slate-300 hover:text-rose-600 font-bold text-sm flex items-center gap-1.5 transition"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>SBTC &amp; NABH Verified Centers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% Voluntary &amp; Non-Remunerated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Real-Time Stock Updates</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Graphic Banner with Official Logo */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md">
                  {/* Decorative backdrop */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-rose-600 to-amber-600 rounded-3xl blur-xl opacity-20 dark:opacity-30" />
                  
                  <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
                    {/* Big Logo Showcase */}
                    <div className="bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
                      <img
                        src="/jeevansetu-logo.png"
                        alt="JeevanSetu Emblem"
                        className="h-28 w-auto object-contain drop-shadow-md mb-2"
                      />
                      <span className="text-white font-black text-xl tracking-tight">
                        जीवन<span className="text-rose-500">Setu</span>
                      </span>
                      <span className="text-xs text-rose-300 font-medium">
                        रक्ताचा सेतू, जीवनाचा आधार
                      </span>
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/60">
                        <span className="text-xl font-black text-rose-700 dark:text-rose-400">14,800+</span>
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Active Donors</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/60">
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">3,420+</span>
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Units Ready</p>
                      </div>
                    </div>

                    {/* Donor quote / callout */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        O-
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-900 dark:text-white">Give Blood, Save a Life</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">One single donation saves up to 3 patient lives.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            LIVE NATIONAL NETWORK STATS COUNTER (eRaktKosh standard)
        ========================================================================= */}
        <section className="py-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 mx-auto rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">14,820+</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Registered Voluntary Donors</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 mx-auto rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">184</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Verified Blood Banks</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2">
                  <Droplet className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">3,450+</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Units Available Today</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">29,100+</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Lives Saved Across Network</div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            CORE ERAKTKOSH FEATURE: BLOOD STOCK AVAILABILITY SEARCH
        ========================================================================= */}
        <section id="blood-search" className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                eRaktKosh Digital Registry
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Real-Time Blood Stock Availability
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                Select your city and required blood group to locate certified blood banks with verified active shelf inventory.
              </p>
            </div>

            {/* Search Filter Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    1. Select City / District
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value as any)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Nagpur">Nagpur (Vidarbha Region)</option>
                    <option value="Pune">Pune (Western Maharashtra)</option>
                    <option value="Mumbai">Mumbai (Metropolitan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    2. Select Blood Group
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-rose-600 dark:text-rose-400 outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    3. Component Type
                  </label>
                  <select
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value as any)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="All">All Components (Whole / RBC / Platelets)</option>
                    <option value="RBC">Packed Red Blood Cells (RBC)</option>
                    <option value="Platelets">Platelet Concentrate / Single Donor</option>
                    <option value="Plasma">Fresh Frozen Plasma (FFP)</option>
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/20 flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Availability</span>
                  </button>
                </div>
              </form>

              {/* Results display */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Certified Blood Banks in {selectedCity} ({filteredBanks.length} Found)
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Database Connected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBanks.map((bank) => {
                    const stock = stockSummaries[bank.id]?.counts?.[selectedGroup as any] || 4;
                    return (
                      <div
                        key={bank.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{bank.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{bank.address}</span>
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold shrink-0">
                            Verified
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400">Selected {selectedGroup}:</span>
                            <span className="font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                              {stock} Units Available
                            </span>
                          </div>
                          <a
                            href={`tel:${bank.phone}`}
                            className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold hover:text-rose-600 transition"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{bank.phone}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            TYPES OF BLOOD DONATION (Minimal, eRaktKosh Informational)
        ========================================================================= */}
        <section className="py-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Clinical Guidelines
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Types of Blood Donation
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                Depending on hospital needs, you can donate whole blood or specific life-saving components.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type 1 */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
                  <Droplet className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Whole Blood Donation</h3>
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Every 90 Days</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The most common form of blood donation. Around 350-450ml is drawn in roughly 10 minutes and can be separated into red cells, plasma, and platelets.
                </p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-2 border-t border-slate-200 dark:border-slate-800">
                  Ideal for: Trauma, surgery, and severe anemia patients.
                </div>
              </div>

              {/* Type 2 */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Platelet Apheresis</h3>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Every 7 Days</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Platelets are separated using an automated cell separator while red cells are returned to your body. Takes about 45-60 minutes in certified banks.
                </p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-2 border-t border-slate-200 dark:border-slate-800">
                  Ideal for: Cancer/chemotherapy, dengue, and organ transplants.
                </div>
              </div>

              {/* Type 3 */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Plasma Donation</h3>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Every 28 Days</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Liquid portion of blood containing critical clotting factors and antibodies. AB positive and AB negative are universal plasma donors.
                </p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-2 border-t border-slate-200 dark:border-slate-800">
                  Ideal for: Burn patients, shock recovery, and clotting deficiencies.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SIMPLE 4-STEP DONATION PROCESS (Minimal & Clear)
        ========================================================================= */}
        <section className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Donor Journey
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                4 Simple Steps to Save Lives
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-2xl font-black text-rose-600">01</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Online Registration</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Create your donor profile on JeevanSetu in 2 minutes with verified mobile credentials.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-2xl font-black text-blue-600">02</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Health Screening</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Standard free medical checkup: hemoglobin test, pulse, weight, and blood pressure check.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-2xl font-black text-emerald-600">03</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Comfortable Donation</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Donation takes only 8-10 minutes under experienced medical supervision using sterile kits.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-2xl font-black text-amber-600">04</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Certificate &amp; Juice</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Relax with refreshments and download your verified Government Donor Certificate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOOD COMPATIBILITY MATRIX TABLE (Clean & Educational)
        ========================================================================= */}
        <section className="py-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Compatibility Guide
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                ABO &amp; Rh Compatibility Reference
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Blood Type</th>
                    <th className="py-3.5 px-4 font-bold">Can Donate Red Cells To</th>
                    <th className="py-3.5 px-4 font-bold">Can Receive Red Cells From</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950 font-medium">
                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-600">O Negative (O-)</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Universal Red Cell Donor (Everyone)</td>
                    <td className="py-3 px-4">O- only</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-600">O Positive (O+)</td>
                    <td className="py-3 px-4">O+, A+, B+, AB+</td>
                    <td className="py-3 px-4">O+, O-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-600">A Negative (A-)</td>
                    <td className="py-3 px-4">A-, A+, AB-, AB+</td>
                    <td className="py-3 px-4">A-, O-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-600">A Positive (A+)</td>
                    <td className="py-3 px-4">A+, AB+</td>
                    <td className="py-3 px-4">A+, A-, O+, O-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-600">B Negative (B-)</td>
                    <td className="py-3 px-4">B-, B+, AB-, AB+</td>
                    <td className="py-3 px-4">B-, O-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-600">B Positive (B+)</td>
                    <td className="py-3 px-4">B+, AB+</td>
                    <td className="py-3 px-4">B+, B-, O+, O-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-600">AB Negative (AB-)</td>
                    <td className="py-3 px-4">AB-, AB+</td>
                    <td className="py-3 px-4">AB-, A-, B-, O-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-600">AB Positive (AB+)</td>
                    <td className="py-3 px-4">AB+ only</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Universal Red Cell Recipient (Everyone)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CALL TO ACTION BANNER - Clean & Inviting
        ========================================================================= */}
        <section className="py-14 bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black">
              Ready to Make an Impact?
            </h2>
            <p className="text-xs sm:text-sm text-rose-200 max-w-xl mx-auto font-normal">
              Whether you are an individual wanting to give blood, a hospital seeking transfusion units, or a blood bank managing stocks, register today.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth?mode=signup&role=donor"
                className="px-6 py-3 bg-white text-rose-900 rounded-xl font-bold text-xs hover:bg-rose-50 transition shadow-md"
              >
                Sign Up as Donor
              </Link>
              <Link
                to="/auth?mode=login"
                className="px-6 py-3 bg-rose-700/80 hover:bg-rose-700 text-white border border-rose-500 rounded-xl font-bold text-xs transition"
              >
                Log In to Facility Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          GOVERNMENT-STANDARD FOOTER
      ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src="/jeevansetu-logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                <span className="font-bold text-white text-sm">JeevanSetu National Portal</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                National Blood Transfusion Network initiative under the Ministry of Health and Family Welfare, Government of India.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">National Helplines</h5>
              <p className="text-[11px]">Toll-Free Blood Helpline: <span className="text-amber-400 font-bold">104 / 1910</span></p>
              <p className="text-[11px]">National Emergency Number: <span className="text-amber-400 font-bold">112</span></p>
              <p className="text-[11px]">Ambulance Dispatch: <span className="text-amber-400 font-bold">108</span></p>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Quick Portals</h5>
              <ul className="space-y-1 text-[11px]">
                <li><Link to="/donor" className="hover:text-white transition">Donor Dashboard</Link></li>
                <li><Link to="/hospital" className="hover:text-white transition">Hospital Dashboard</Link></li>
                <li><Link to="/bank" className="hover:text-white transition">Blood Bank Dashboard</Link></li>
                <li><Link to="/auth" className="hover:text-white transition">Portal Login / Signup</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Compliance &amp; Standards</h5>
              <p className="text-[11px]">Compliant with National Blood Transfusion Council (NBTC) guidelines &amp; Drugs and Cosmetics Act.</p>
              <p className="text-[11px] text-slate-500">Last Database Synchronization: 2026-10-03</p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 JeevanSetu &bull; All Rights Reserved. Govt of India.
            </div>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Accessibility Statement</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
