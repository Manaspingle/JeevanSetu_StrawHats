import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bloodService, type DonorRegistration } from '@/services/bloodService';
import { checkDonorEligibility } from '@/domain/verification';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/ToastRegion';
import type { BloodGroup, EmergencyRequest } from '@/types/blood';
import {
  Heart, ShieldCheck, Clock, MapPin, CheckCircle,
  AlertTriangle, Calendar, Award, Phone, Check,
  FileText, Download, Printer, PlusCircle, User,
  Sparkles, Trophy, QrCode, X, Layers, Cpu, ShieldAlert
} from 'lucide-react';

export default function DonorDashboard() {
  const { session, profile, donor: authDonor } = useAuth();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState<DonorRegistration[]>(bloodService.getDonorRegistrations());
  const [requests, setRequests] = useState<EmergencyRequest[]>(bloodService.getRequests());
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [committedRequests, setCommittedRequests] = useState<string[]>([]);

  // Modals
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Registration Form State
  const [formName, setFormName] = useState(authDonor?.full_name || 'Rahul Sharma');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formAge, setFormAge] = useState<number>(27);
  const [formWeight, setFormWeight] = useState<number>(68);
  const [formBloodGroup, setFormBloodGroup] = useState<BloodGroup>((authDonor?.blood_group as any) || 'O+');
  const [formCity, setFormCity] = useState<'Nagpur' | 'Mumbai' | 'Pune'>((authDonor?.city as any) || 'Nagpur');
  const [formPhone, setFormPhone] = useState(authDonor?.phone || '+91 98230 45678');
  const [formEmail, setFormEmail] = useState(authDonor?.email || profile?.email || 'donor@jeevansetu.gov.in');
  const [formIsFirstTime, setFormIsFirstTime] = useState<boolean>(false);
  const [formLastDate, setFormLastDate] = useState<string>(
    new Date(Date.now() - 110 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [formAadhaar, setFormAadhaar] = useState('XXXX-XXXX-8421');
  const [formRfid, setFormRfid] = useState('A4:8B:2F:10');
  const [formConditions, setFormConditions] = useState('Healthy, no chronic medical illness');

  // Sync with bloodService
  useEffect(() => {
    const sync = () => {
      setRegistrations(bloodService.getDonorRegistrations());
      setRequests(bloodService.getRequests());
    };
    sync();
    return bloodService.subscribe(sync);
  }, []);

  // Listen for Navbar "Generate Report" custom event
  useEffect(() => {
    const handleTriggerReport = () => setShowReportModal(true);
    window.addEventListener('jeevansetu:generate-donor-report', handleTriggerReport);
    return () => window.removeEventListener('jeevansetu:generate-donor-report', handleTriggerReport);
  }, []);

  // Find active donor registration for logged in user
  const activeReg = registrations.find(
    r => r.phone === formPhone || r.email.toLowerCase() === formEmail.toLowerCase()
  ) || registrations[0];

  const donorName = activeReg?.fullName || authDonor?.full_name || 'Rahul Sharma';
  const bloodGroup = activeReg?.bloodGroup || ((authDonor?.blood_group as any) || 'O+');
  const donorCity = activeReg?.city || authDonor?.city || 'Nagpur';
  const donorGender = activeReg?.gender || 'Male';
  const donorPoints = activeReg?.points || 250;
  const donorLevel = activeReg?.donorLevel || 'Silver Guardian';
  const hiddenDonorId = activeReg?.donorId || 'JS-DON-94821';
  const donorRfid = activeReg?.rfidUid || 'A4:8B:2F:10';

  // Real-Time Gender Cooldown Rule:
  // Men: 3 months (90 days)
  // Women: 4 months (120 days)
  const calculateCooldown = (lastDateStr: string | null, gender: 'Male' | 'Female' | 'Other') => {
    if (!lastDateStr) return { isEligible: true, daysRemaining: 0, requiredDays: gender === 'Female' ? 120 : 90 };
    const requiredDays = gender === 'Female' ? 120 : 90;
    const diffMs = Date.now() - new Date(lastDateStr).getTime();
    const daysSince = Math.floor(diffMs / (1000 * 3600 * 24));
    const daysRemaining = Math.max(0, requiredDays - daysSince);
    return {
      isEligible: daysRemaining === 0,
      daysRemaining,
      requiredDays
    };
  };

  const cooldownStatus = calculateCooldown(activeReg?.lastDonationDate || null, donorGender);
  const eligibleQty = (activeReg?.weightKg || formWeight) >= 60 ? '450 ml' : '350 ml';

  // Gamification Levels
  const getBadgeClass = (points: number) => {
    if (points >= 500) return { title: 'Platinum Legend', color: 'text-cyan-500', next: 1000, pct: 100 };
    if (points >= 300) return { title: 'Gold Lifesaver', color: 'text-amber-500', next: 500, pct: Math.round(((points - 300) / 200) * 100) };
    if (points >= 150) return { title: 'Silver Guardian', color: 'text-slate-400', next: 300, pct: Math.round(((points - 150) / 150) * 100) };
    return { title: 'Bronze Donor', color: 'text-orange-600', next: 150, pct: Math.round((points / 150) * 100) };
  };

  const currentTier = getBadgeClass(donorPoints);

  // Submit Blood Donation Registration Form
  const handleRegisterDonation = (e: React.FormEvent) => {
    e.preventDefault();

    // Check Weight >= 50kg
    if (formWeight < 50) {
      showToast('Minimum weight required for voluntary blood donation is 50 kg.', 'error');
      return;
    }

    const { isEligible, daysRemaining, requiredDays } = calculateCooldown(formIsFirstTime ? null : formLastDate, formGender);

    const generatedDonorId = `JS-DON-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRegistration = bloodService.addDonorRegistration({
      donorId: generatedDonorId,
      rfidUid: formRfid || `RFID-${Math.floor(1000 + Math.random() * 9000)}`,
      aadhaarNumber: formAadhaar,
      fullName: formName,
      gender: formGender,
      age: Number(formAge),
      weightKg: Number(formWeight),
      bloodGroup: formBloodGroup,
      city: formCity,
      phone: formPhone,
      email: formEmail,
      lastDonationDate: formIsFirstTime ? null : formLastDate,
      isEligible,
      eligibleQuantity: formWeight >= 60 ? '450 ml' : '350 ml',
      daysCooldown: daysRemaining,
      cooldownPeriodMonths: formGender === 'Female' ? 4 : 3,
      ineligibilityReason: !isEligible ? `${formGender === 'Female' ? 'Women' : 'Men'} must wait ${formGender === 'Female' ? '4 months (120 days)' : '3 months (90 days)'} between donations. ${daysRemaining} days remaining in cooldown.` : undefined,
      medicalConditions: formConditions,
      points: (activeReg?.points || 150) + 100,
      donorLevel: formWeight >= 60 ? 'Gold Lifesaver' : 'Silver Guardian',
      status: 'registered'
    });

    setShowRegModal(false);
    showToast(
      isEligible 
        ? `Registration Successful! Unique Donor ID generated and synced to Hospital Dashboard. +100 Points earned!`
        : `Registration Recorded. Cooldown active: ${daysRemaining} days remaining until eligible. Details synced to Hospital Dashboard.`,
      isEligible ? 'success' : 'info'
    );
  };

  const handleCommitDonate = (reqId: string) => {
    setCommittedRequests(prev => [...prev, reqId]);
    showToast('Commitment recorded! Casualty ward has been alerted.', 'success');
  };

  return (
    <div 
      className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-8 pb-20 md:pb-8 text-left"
      style={{ color: 'var(--color-navy)' }}
    >
      {/* =========================================================================
          1. DONOR PROFILE BANNER & QUICK ACTIONS
      ========================================================================= */}
      <div 
        className="p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-2xl border flex items-center justify-center font-black text-2xl shadow-inner shrink-0"
            style={{
              backgroundColor: 'var(--color-primary-light)',
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)'
            }}
          >
            {bloodGroup}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black" style={{ color: 'var(--color-navy)' }}>
                {donorName}
              </h1>
              {cooldownStatus.isEligible ? (
                <StatusBadge status="available" label="Eligible to Donate" />
              ) : (
                <StatusBadge status="low" label={`In Cooldown (${cooldownStatus.daysRemaining}d left)`} />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs mt-1.5 opacity-80" style={{ color: 'var(--color-navy)' }}>
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> {donorCity}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <Phone className="w-3.5 h-3.5 text-sky-500" /> {activeReg?.phone || formPhone}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Rank: {donorLevel} &bull; {donorPoints} Lifesaver Points</span>
              </span>
            </div>

            {/* Hidden Encrypted Donor ID (Masked) */}
            <div className="pt-1 flex items-center gap-2 text-xs">
              <span className="opacity-70">Unique Donor ID (Linked to RFID):</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border" style={{ borderColor: 'var(--color-border)' }}>
                {hiddenDonorId}
              </span>
              <span className="text-[10px] opacity-60">(Protected / Encrypted)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Register for Donation + Download Certificate + Generate Report */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowRegModal(true)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 shadow-md transition active:scale-95"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register for Blood Donation</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCertModal(true)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-navy)'
            }}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Certificate</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-accent-blue)'
            }}
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. STATUTORY COOLDOWN GAUGE & GAMIFICATION POINTS SECTION
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gender Cooldown Countdown (Col 6) */}
        <div 
          className="lg:col-span-6 p-6 rounded-3xl border shadow-sm space-y-5"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-base font-black" style={{ color: 'var(--color-navy)' }}>
                Biological Donation Cooldown
              </h2>
              <p className="text-xs opacity-75">
                Statutory interval: Men must wait <strong>3 months (90 days)</strong> and Women <strong>4 months (120 days)</strong> between donations.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border">
              Gender: {donorGender}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-border)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke={cooldownStatus.isEligible ? 'var(--color-success-fill)' : 'var(--color-primary)'}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={cooldownStatus.isEligible ? 0 : (251.2 * cooldownStatus.daysRemaining) / cooldownStatus.requiredDays}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black" style={{ color: cooldownStatus.isEligible ? 'var(--color-success-text)' : 'var(--color-primary)' }}>
                  {cooldownStatus.isEligible ? 'READY' : `${cooldownStatus.daysRemaining}d`}
                </span>
                <span className="text-[10px] font-bold opacity-75">
                  {cooldownStatus.isEligible ? 'Eligible' : 'Cooldown'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs flex-1">
              <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="font-bold flex items-center gap-1.5" style={{ color: cooldownStatus.isEligible ? 'var(--color-success-text)' : 'var(--color-danger)' }}>
                  {cooldownStatus.isEligible ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{cooldownStatus.isEligible ? 'Fully Eligible to Donate!' : `Cooldown Active: ${cooldownStatus.daysRemaining} days remaining`}</span>
                </p>
                <p className="text-[11px] opacity-75">
                  Eligible Volume: <strong>{eligibleQty}</strong> &bull; Last Date: {activeReg?.lastDonationDate || 'None on record'}
                </p>
              </div>

              <p className="text-[11px] opacity-70">
                Attempting to donate within {cooldownStatus.requiredDays} days is biologically restricted by JeevanSetu safety protocol.
              </p>
            </div>
          </div>
        </div>

        {/* Gamification & Lifesaver Badges (Col 6) */}
        <div 
          className="lg:col-span-6 p-6 rounded-3xl border shadow-sm space-y-5"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-base font-black" style={{ color: 'var(--color-navy)' }}>
                Lifesaver Rewards &amp; Gamification
              </h2>
              <p className="text-xs opacity-75">
                Earn points with every donation and unlock certified recognition.
              </p>
            </div>
            <span className="text-xs font-black text-amber-500 flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>{donorPoints} Pts</span>
            </span>
          </div>

          <div className="space-y-3">
            {/* Tier Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>Current Tier: <strong className={currentTier.color}>{donorLevel}</strong></span>
                <span className="opacity-75">{currentTier.pct}% to Next Tier</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentTier.pct}%`, backgroundColor: 'var(--color-primary)' }}
                />
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl border text-center space-y-1" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <Award className="w-5 h-5 mx-auto text-amber-500" />
                <p className="text-[11px] font-bold">First Pledge</p>
                <span className="text-[9px] font-semibold text-emerald-600">Unlocked</span>
              </div>

              <div className="p-2.5 rounded-xl border text-center space-y-1" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <Heart className="w-5 h-5 mx-auto text-rose-500 fill-rose-500" />
                <p className="text-[11px] font-bold">Blood Hero</p>
                <span className="text-[9px] font-semibold text-emerald-600">Unlocked</span>
              </div>

              <div className="p-2.5 rounded-xl border text-center space-y-1" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <Sparkles className="w-5 h-5 mx-auto text-sky-500" />
                <p className="text-[11px] font-bold">City Lifesaver</p>
                <span className="text-[9px] font-semibold text-emerald-600">Unlocked</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. NEARBY URGENT TRANSFUSION REQUESTS IN DONOR'S CITY
      ========================================================================= */}
      <div 
        className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-5"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
              Urgent Hospital Blood Requests in {donorCity}
            </h2>
            <p className="text-xs opacity-75">
              Hospitals requesting {bloodGroup} units. Your commitment alerts hospital casualty coordinators.
            </p>
          </div>
          <span className="text-xs font-bold opacity-75">{requests.length} Active Requests</span>
        </div>

        <div className="space-y-3">
          {requests.map((req) => {
            const isCommitted = committedRequests.includes(req.id);
            return (
              <div 
                key={req.id}
                className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2.5 py-0.5 rounded-md font-black text-xs text-white"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {req.bloodGroup}
                    </span>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--color-navy)' }}>
                      {req.hospitalName}
                    </h3>
                    <StatusBadge status={req.urgency === 'Critical' ? 'critical' : 'low'} label={req.urgency} />
                  </div>
                  <p className="text-xs opacity-75 flex items-center gap-3">
                    <span>Units Required: <strong>{req.units} units</strong></span>
                    <span>&bull;</span>
                    <span>Distance: ~2.8 km in {donorCity}</span>
                  </p>
                </div>

                <div>
                  {isCommitted ? (
                    <span className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5" style={{ color: 'var(--color-success-text)' }}>
                      <Check className="w-4 h-4" /> Committed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCommitDonate(req.id)}
                      className="min-h-[44px] px-5 py-2 rounded-xl font-bold text-xs text-white transition active:scale-95 shadow-sm"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      Commit to Donate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          4. REGISTRATION MODAL: TAKE ALL DONOR DETAILS
      ========================================================================= */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                  Register for Blood Donation
                </h3>
                <p className="text-xs opacity-75">
                  Details are securely registered, bound to an RFID token, and synchronized directly with the Hospital Dashboard.
                </p>
              </div>
              <button 
                onClick={() => setShowRegModal(false)}
                className="p-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDonation} className="space-y-4 text-xs font-bold">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 opacity-80">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-80">Biological Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  >
                    <option value="Male">Male (3 Months / 90 Days Cooldown)</option>
                    <option value="Female">Female (4 Months / 120 Days Cooldown)</option>
                    <option value="Other">Other (3 Months Cooldown)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 opacity-80">Age (18 - 65 yrs)</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    required
                    value={formAge}
                    onChange={(e) => setFormAge(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-80">Body Weight in kg (Min 50 kg)</label>
                  <input
                    type="number"
                    min="45"
                    max="150"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  />
                  {formWeight < 50 && (
                    <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                      Must be at least 50 kg to donate blood safely.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block mb-1 opacity-80">Blood Group</label>
                  <select
                    value={formBloodGroup}
                    onChange={(e) => setFormBloodGroup(e.target.value as BloodGroup)}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-bold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 opacity-80">City of Residence</label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value as any)}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  >
                    <option value="Nagpur">Nagpur</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 opacity-80">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-80">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  />
                </div>
              </div>

              {/* Cooldown Section */}
              <div className="p-3.5 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <label className="font-bold">Last Blood Donation Date</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-orange-600">
                    <input
                      type="checkbox"
                      checked={formIsFirstTime}
                      onChange={(e) => setFormIsFirstTime(e.target.checked)}
                      className="rounded"
                    />
                    <span>First Time Donor</span>
                  </label>
                </div>

                {!formIsFirstTime && (
                  <input
                    type="date"
                    required={!formIsFirstTime}
                    value={formLastDate}
                    onChange={(e) => setFormLastDate(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  />
                )}

                <p className="text-[10px] opacity-70">
                  Rule Check: {formGender === 'Female' ? '120 days interval for females' : '90 days interval for males'}.
                </p>
              </div>

              {/* Government ID & Hardware RFID Card linkage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 opacity-80">Government ID (Aadhaar / Voter ID)</label>
                  <input
                    type="text"
                    required
                    value={formAadhaar}
                    onChange={(e) => setFormAadhaar(e.target.value)}
                    placeholder="XXXX-XXXX-8421"
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-80">Hardware RFID Card UID (RC522)</label>
                  <input
                    type="text"
                    required
                    value={formRfid}
                    onChange={(e) => setFormRfid(e.target.value)}
                    placeholder="A4:8B:2F:10"
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-mono font-bold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 opacity-80">Medical Declarations</label>
                <input
                  type="text"
                  value={formConditions}
                  onChange={(e) => setFormConditions(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-normal"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2.5 rounded-xl border font-bold"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-black text-white shadow-md transition active:scale-95"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Submit Registration &bull; Earn 100 Pts
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. OFFICIAL DOWNLOADABLE CERTIFICATE MODAL
      ========================================================================= */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                  Certificate of Voluntary Blood Donation
                </h3>
                <p className="text-xs opacity-75">
                  Official recognition credential for voluntary life support.
                </p>
              </div>
              <button 
                onClick={() => setShowCertModal(false)}
                className="p-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Certificate Canvas / Card */}
            <div 
              id="printable-certificate"
              className="p-8 rounded-2xl border-4 border-double text-center space-y-5 bg-gradient-to-b from-orange-50/50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
              style={{ borderColor: 'var(--color-primary)' }}
            >
              <div className="flex items-center justify-center gap-3">
                <img src="/jeevansetu-logo.png" alt="JeevanSetu" className="h-10 w-auto object-contain" />
                <span className="text-xl font-black tracking-tight" style={{ color: 'var(--color-navy)' }}>
                  जीवनSetu Network &bull; National Transfusion Grid
                </span>
              </div>

              <div>
                <p className="text-xs uppercase font-extrabold tracking-widest text-orange-600">
                  Certificate of Appreciation
                </p>
                <h2 className="text-2xl sm:text-3xl font-black my-2" style={{ color: 'var(--color-navy)' }}>
                  {donorName}
                </h2>
                <p className="text-xs opacity-80 max-w-md mx-auto">
                  For exemplary voluntary dedication to human life as a certified <strong>{bloodGroup}</strong> donor in <strong>{donorCity}</strong>. Awarded with <strong>{donorLevel}</strong> distinction.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t text-xs">
                <div>
                  <p className="text-[10px] opacity-60 uppercase font-bold">Encrypted Donor ID</p>
                  <p className="font-mono font-bold">{hiddenDonorId}</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-60 uppercase font-bold">Reward Level</p>
                  <p className="font-bold text-amber-500">{donorLevel}</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-60 uppercase font-bold">Issued Date</p>
                  <p className="font-bold">{new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl font-black text-xs text-white flex items-center gap-2 shadow-md transition active:scale-95"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Download className="w-4 h-4" />
                <span>Print / Download Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MEDICAL DONOR REPORT GENERATION MODAL
      ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                  Official Donor Medical &amp; Donation Report
                </h3>
                <p className="text-xs opacity-75">
                  Verified clinical synopsis for hospital triage and donation safety.
                </p>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="opacity-70">Donor Name:</span>
                    <p className="font-bold text-sm">{donorName}</p>
                  </div>
                  <div>
                    <span className="opacity-70">Blood Group:</span>
                    <p className="font-bold text-sm text-orange-600">{bloodGroup}</p>
                  </div>
                  <div>
                    <span className="opacity-70">Gender &amp; Age:</span>
                    <p className="font-bold">{donorGender}, {activeReg?.age || formAge} yrs</p>
                  </div>
                  <div>
                    <span className="opacity-70">Body Weight:</span>
                    <p className="font-bold">{activeReg?.weightKg || formWeight} kg</p>
                  </div>
                  <div>
                    <span className="opacity-70">City Node:</span>
                    <p className="font-bold">{donorCity}</p>
                  </div>
                  <div>
                    <span className="opacity-70">Eligible Donation Volume:</span>
                    <p className="font-bold text-emerald-600">{eligibleQty}</p>
                  </div>
                </div>
              </div>

              {/* Cooldown & Safety Status */}
              <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="font-bold text-sm">Biological Safety Protocol Status</p>
                <div className="flex items-center justify-between text-xs">
                  <span>Current Interval:</span>
                  <span className="font-bold" style={{ color: cooldownStatus.isEligible ? 'var(--color-success-text)' : 'var(--color-danger)' }}>
                    {cooldownStatus.isEligible ? 'Cooldown Passed (Eligible)' : `${cooldownStatus.daysRemaining} Days Cooldown Remaining`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Standard Rule Applied:</span>
                  <span>{donorGender === 'Female' ? '4 Months (120 Days) for Women' : '3 Months (90 Days) for Men'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Hardware RFID Binding:</span>
                  <span className="font-mono font-bold">{donorRfid}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl font-black text-xs text-white flex items-center gap-2 shadow-md transition active:scale-95"
                style={{ backgroundColor: 'var(--color-accent-blue)' }}
              >
                <Printer className="w-4 h-4" />
                <span>Print Medical Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
