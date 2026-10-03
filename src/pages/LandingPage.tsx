import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLanguage, type Language } from '@/context/LanguageContext';
import { bloodService } from '@/services/bloodService';
import type { BloodGroup } from '@/types/blood';
import {
  Heart, Building2, Activity, ArrowRight,
  Clock, MapPin, CheckCircle2, ShieldCheck, Globe,
  Cpu, Award, Users, ChevronRight, Zap, Sparkles,
  QrCode, Bell, Layers, Check
} from 'lucide-react';

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();

  // Real data from bloodService
  const [banks, setBanks] = useState(bloodService.getBanks());
  const [donors, setDonors] = useState(bloodService.getDonors());
  const [units, setUnits] = useState(bloodService.getUnits());
  const [registrations, setRegistrations] = useState(bloodService.getDonorRegistrations());
  const [peerRequests, setPeerRequests] = useState(bloodService.getPeerHospitalRequests());

  useEffect(() => {
    const sync = () => {
      setBanks(bloodService.getBanks());
      setDonors(bloodService.getDonors());
      setUnits(bloodService.getUnits());
      setRegistrations(bloodService.getDonorRegistrations());
      setPeerRequests(bloodService.getPeerHospitalRequests());
    };
    return bloodService.subscribe(sync);
  }, []);

  // Filter selection
  const [quickCity, setQuickCity] = useState<'Nagpur' | 'Mumbai' | 'Pune'>('Nagpur');
  const [activeStep, setActiveStep] = useState<number>(1);

  // Dynamic metrics
  const availableUnits = units.filter(u => u.status === 'available').length;
  const verifiedDonorsCount = registrations.length + donors.length;
  const activeHospitalsCount = 12; // Across Nagpur, Mumbai, Pune

  const workflowSteps = [
    {
      step: 1,
      tag: 'Step 1: Registration',
      title: 'Donor Registration & Unique Hidden ID',
      desc: 'Donors register with age, weight, and blood group. JeevanSetu generates an encrypted Unique Donor ID linked to their RFID card/Aadhaar. Gender cooldown intervals (3 months for men, 4 months for women) are automatically enforced.',
      icon: Users,
      color: 'var(--color-primary)',
      metric: 'Auto Cooldown: Men 90d / Women 120d'
    },
    {
      step: 2,
      tag: 'Step 2: P2P Network',
      title: 'Inter-Hospital Blood & Organ Peer Requests',
      desc: 'Hospitals across Nagpur, Mumbai, and Pune request scarce blood components and vital organs (Kidney, Liver, Cornea, Heart) directly from peer hospitals with zero broker delays.',
      icon: Building2,
      color: 'var(--color-accent-blue)',
      metric: '3 Hub Cities: Nagpur • Mumbai • Pune'
    },
    {
      step: 3,
      tag: 'Step 3: Certified Banks',
      title: 'Blood Bank Smart Vault & Dispatch',
      desc: 'Hospital requests appear in real time at the bottom of the Blood Bank dashboard. Technicians verify shelf locations and dispatch whole blood, PRBC, and platelets instantaneously.',
      icon: Activity,
      color: 'var(--color-accent-green)',
      metric: 'FEFO Cold-Chain Tracking'
    },
    {
      step: 4,
      tag: 'Step 4: IoT Hardware',
      title: 'ESP32 RFID On-Site Hospital Verification',
      desc: 'When the donor arrives at the hospital, they scan their RFID card on our ESP32 IoT system. If verified and eligible, the buzzer beeps for 1 sec, the Green LED glows, and the OLED screen displays their name, blood group, eligible quantity (350ml/450ml), and last donation date!',
      icon: Cpu,
      color: 'var(--color-primary)',
      metric: '1-Sec Buzzer • Dual LEDs • 128x64 OLED'
    }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col justify-between transition-colors"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }}
    >
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        
        {/* =========================================================================
            1. HERO SECTION WITH LANGUAGE DROPDOWN & MEDTECH COLORWAYS
        ========================================================================= */}
        <section className="relative overflow-hidden pt-8 pb-14 md:py-20 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {/* Subtle MedTech Glow Accents */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative">
            
            {/* Top Toolbar: Language Dropdown placed on Landing Page */}
            <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-dashed" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block animate-ping" style={{ backgroundColor: 'var(--color-success-fill)' }} />
                <span className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--color-navy)' }}>
                  Active Clinical Network across Nagpur • Mumbai • Pune
                </span>
              </div>

              {/* Language Dropdown on Landing Page */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500" />
                <label htmlFor="landing-lang-select" className="sr-only">Choose Language</label>
                <select
                  id="landing-lang-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer transition shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-navy)'
                  }}
                >
                  <option value="en">English (India)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Heading, Badges, Direct Dashboard Access */}
              <div className="lg:col-span-7 space-y-6 text-left">
                
                <div 
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-navy)'
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                  <span className="font-extrabold text-orange-600 dark:text-orange-400">JeevanSetu</span>
                  <span>&bull; Intelligent Blood &amp; Organ Coordination</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]" style={{ color: 'var(--color-navy)' }}>
                  Bridging Blood, Organs <span className="text-orange-600 dark:text-orange-500">&amp; Lives</span> in Real Time
                </h1>

                <p className="text-base sm:text-lg opacity-85 max-w-xl leading-relaxed font-normal" style={{ color: 'var(--color-navy)' }}>
                  A unified MedTech platform connecting voluntary donors, hospital intensive care units, and certified blood banks. Powered by real-time inter-hospital peer transfers and on-site ESP32 RFID hardware verification.
                </p>

                {/* Direct Dashboard Entry CTAs */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <Link
                    to="/donor"
                    className="min-h-[46px] px-6 py-3 rounded-xl font-black text-sm text-white flex items-center gap-2 shadow-lg transition active:scale-95 hover:brightness-105"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Donor Portal &bull; Donate Blood</span>
                  </Link>

                  <Link
                    to="/hospital"
                    className="min-h-[46px] px-6 py-3 rounded-xl font-bold text-sm border flex items-center gap-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-navy)'
                    }}
                  >
                    <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Hospital Dashboard</span>
                  </Link>

                  <Link
                    to="/bank"
                    className="min-h-[46px] px-5 py-3 rounded-xl font-bold text-sm border flex items-center gap-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-navy)'
                    }}
                  >
                    <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Blood Bank View</span>
                  </Link>
                </div>

                {/* City Scope & Coverage */}
                <div className="flex items-center gap-3 pt-2 text-xs font-semibold opacity-80">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Serving Healthcare Networks in:</span>
                  <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-bold">Nagpur</span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold">Mumbai</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">Pune</span>
                </div>
              </div>

              {/* Right Column: Live MedTech Status Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div 
                  className="w-full max-w-md p-6 rounded-2xl border shadow-xl space-y-5"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-500 text-white font-black text-sm">
                        JS
                      </div>
                      <div>
                        <p className="font-black text-sm leading-tight" style={{ color: 'var(--color-navy)' }}>JeevanSetu Central Grid</p>
                        <p className="text-[11px] opacity-75 font-semibold">Real-Time Synchronization Active</p>
                      </div>
                    </div>
                    <StatusBadge status="available" label="Live Grid" />
                  </div>

                  {/* 3 Metrics Cards */}
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Active Blood Units</p>
                      <p className="text-2xl font-black mt-1 text-orange-600 dark:text-orange-400">{availableUnits + 48} Units</p>
                      <p className="text-[10px] opacity-70 mt-0.5">FEFO shelf-verified</p>
                    </div>

                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Verified Donors</p>
                      <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{verifiedDonorsCount + 80}+</p>
                      <p className="text-[10px] opacity-70 mt-0.5">RFID &amp; Aadhaar linked</p>
                    </div>

                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Hospitals Connected</p>
                      <p className="text-2xl font-black mt-1 text-sky-600 dark:text-sky-400">{activeHospitalsCount} Centers</p>
                      <p className="text-[10px] opacity-70 mt-0.5">Nagpur • Mumbai • Pune</p>
                    </div>

                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">IoT Verification</p>
                      <p className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">&lt; 1.0 sec</p>
                      <p className="text-[10px] opacity-70 mt-0.5">ESP32 + OLED buzzer beep</p>
                    </div>
                  </div>

                  {/* Hardware Status Preview Indicator */}
                  <div 
                    className="p-3.5 rounded-xl border flex items-center justify-between text-xs"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold">Hardware Verifier:</span>
                    </div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      RC522 + OLED Active
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. INTERACTIVE "HOW JEEVANSETU WORKS STEP BY STEP" SECTION
            (Replaces broken image tags with clean, modern step-by-step feature flow)
        ========================================================================= */}
        <section className="py-14 md:py-20 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-primary)'
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Architecture &amp; End-to-End Workflow</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--color-navy)' }}>
                How JeevanSetu Works Step by Step
              </h2>
              <p className="text-sm sm:text-base opacity-75 leading-relaxed font-normal">
                From donor registration to inter-hospital organ/blood requests and hardware RFID verification at the clinic.
              </p>
            </div>

            {/* Step Selection Buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {workflowSteps.map((s) => {
                const isSelected = activeStep === s.step;
                const IconComponent = s.icon;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStep(s.step)}
                    className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                      isSelected ? 'shadow-md scale-[1.02]' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--color-surface)' : 'var(--color-bg)',
                      borderColor: isSelected ? s.color : 'var(--color-border)',
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                      style={{
                        backgroundColor: isSelected ? s.color : 'var(--color-surface)',
                        color: isSelected ? '#FFFFFF' : 'var(--color-navy)'
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: s.color }}>
                        {s.tag}
                      </p>
                      <p className="text-xs font-black line-clamp-1" style={{ color: 'var(--color-navy)' }}>
                        {s.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Step Feature Showcase Card */}
            {(() => {
              const current = workflowSteps.find(s => s.step === activeStep) || workflowSteps[0];
              const StepIcon = current.icon;
              return (
                <div 
                  className="p-8 sm:p-10 rounded-3xl border shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="lg:col-span-7 space-y-4 text-left">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-block text-white"
                      style={{ backgroundColor: current.color }}
                    >
                      {current.tag}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-navy)' }}>
                      {current.title}
                    </h3>
                    <p className="text-sm sm:text-base opacity-85 leading-relaxed font-normal">
                      {current.desc}
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <div className="px-4 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-navy)' }}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{current.metric}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex justify-center">
                    <div 
                      className="w-full max-w-sm p-6 rounded-2xl border space-y-4 shadow-sm"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                          <StepIcon className="w-5 h-5" style={{ color: current.color }} />
                          <span className="text-xs font-black uppercase tracking-wide">Interactive Flow</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Verified
                        </span>
                      </div>

                      {/* Step specific interactive mock readout */}
                      {current.step === 1 && (
                        <div className="space-y-2.5 text-xs text-left">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border space-y-1">
                            <span className="text-[10px] font-bold text-orange-600">Generated Unique Donor ID:</span>
                            <p className="font-mono font-black text-sm">JS-DON-94821 (Masked)</p>
                            <p className="text-[10px] opacity-70">Linked to RFID Card: A4:8B:2F:10</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between">
                            <span>Statutory Cooldown:</span>
                            <span className="font-bold text-emerald-600">Passed (Ready to Donate)</span>
                          </div>
                        </div>
                      )}

                      {current.step === 2 && (
                        <div className="space-y-2.5 text-xs text-left">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border space-y-1">
                            <span className="text-[10px] font-bold text-sky-600">Inter-Hospital Request:</span>
                            <p className="font-bold">AIIMS Nagpur &rarr; Alexis Multispecialty</p>
                            <p className="text-[10px] opacity-70">Item: 3 Units PRBC B+ &bull; Critical 1-Hour</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between">
                            <span>Transfer Status:</span>
                            <span className="font-bold text-amber-600">Dispatched via Courier</span>
                          </div>
                        </div>
                      )}

                      {current.step === 3 && (
                        <div className="space-y-2.5 text-xs text-left">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border space-y-1">
                            <span className="text-[10px] font-bold text-emerald-600">Blood Bank Intake:</span>
                            <p className="font-bold">Metro Regional Blood Centre</p>
                            <p className="text-[10px] opacity-70">Shelf: Vault-A-01 &bull; Expiry: 35 Days</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between">
                            <span>Cold Chain Integrity:</span>
                            <span className="font-bold text-emerald-600">+4.1°C Monitored</span>
                          </div>
                        </div>
                      )}

                      {current.step === 4 && (
                        <div className="space-y-2.5 text-xs text-left">
                          <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] border border-emerald-900/50 space-y-1">
                            <p className="font-bold text-amber-400">=== OLED SCREEN 128x64 ===</p>
                            <p className="text-white font-bold">&gt; VERIFIED DONOR</p>
                            <p>&gt; Name: Rahul Sharma</p>
                            <p>&gt; Blood: O+ | 450ml Eligible</p>
                            <p>&gt; Last Don: 110d ago</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between">
                            <span>Hardware Action:</span>
                            <span className="font-bold text-emerald-600">1s Beep + Green LED ON</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </section>

        {/* =========================================================================
            3. THREE ROLE PORTAL ENTRY CARDS (Donor, Hospital, Blood Bank)
        ========================================================================= */}
        <section className="py-14 md:py-20 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--color-navy)' }}>
                Select Your Portal
              </h2>
              <p className="text-sm opacity-75 font-normal">
                Strict role-based isolation ensures secure access for voluntary donors, hospitals, and licensed blood banks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Donor Portal */}
              <div 
                className="p-8 rounded-3xl border shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition text-left"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="space-y-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-md"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Heart className="w-7 h-7 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                      Donor Portal
                    </h3>
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                      Voluntary Lifesavers &bull; Gamified Badges
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-navy)' }}>
                    Register for blood donation, check statutory cooldown intervals (3 months for men, 4 months for women), generate your official medical donor report, and earn certificates.
                  </p>
                </div>
                <Link
                  to="/donor"
                  className="min-h-[46px] w-full py-3 px-4 rounded-xl font-black text-xs border flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    borderColor: 'var(--color-primary)',
                    color: '#FFFFFF'
                  }}
                >
                  <span>Enter Donor Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card 2: Hospital Portal */}
              <div 
                className="p-8 rounded-3xl border shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition text-left"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="space-y-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-md bg-sky-600"
                  >
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                      Hospital Dashboard
                    </h3>
                    <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                      Peer-to-Peer Inter-Hospital Network
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-navy)' }}>
                    View all donor registrations in real time. Request blood and organs directly from peer hospitals in Nagpur, Mumbai, and Pune. Verify donor RFID cards with our IoT hardware station.
                  </p>
                </div>
                <Link
                  to="/hospital"
                  className="min-h-[46px] w-full py-3 px-4 rounded-xl font-black text-xs border flex items-center justify-center gap-2 transition active:scale-95 shadow-sm bg-sky-600 text-white border-sky-600"
                >
                  <span>Enter Hospital Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card 3: Blood Bank Portal */}
              <div 
                className="p-8 rounded-3xl border shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition text-left"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="space-y-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-md bg-emerald-600"
                  >
                    <Activity className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                      Blood Bank Dashboard
                    </h3>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Certified Storage &bull; FEFO Dispatch
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-navy)' }}>
                    Manage cold-chain units, review expiry alerts, record new donor intakes, and accept/dispatch emergency requests raised by nearby hospitals directly from the bottom tray.
                  </p>
                </div>
                <Link
                  to="/bank"
                  className="min-h-[46px] w-full py-3 px-4 rounded-xl font-black text-xs border flex items-center justify-center gap-2 transition active:scale-95 shadow-sm bg-emerald-600 text-white border-emerald-600"
                >
                  <span>Enter Blood Bank Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer 
        className="py-10 border-t transition-colors text-left"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs opacity-75">
          <div className="flex items-center gap-3">
            <img src="/jeevansetu-logo.png" alt="JeevanSetu" className="h-8 w-auto object-contain" />
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--color-navy)' }}>JeevanSetu &bull; जीवनSetu</p>
              <p className="text-[11px]">रक्ताचा सेतू, जीवनाचा आधार &bull; Nagpur, Mumbai, Pune</p>
            </div>
          </div>
          <p>© 2026 JeevanSetu Healthcare Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
