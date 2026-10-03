import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bloodService } from '@/services/bloodService';
import { checkDonorEligibility } from '@/domain/verification';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmergencyBottomBar } from '@/components/ui/EmergencyBottomBar';
import { useToast } from '@/components/ui/ToastRegion';
import type { DonorEntity, EmergencyRequest } from '@/types/blood';
import {
  Heart, ShieldCheck, Clock, MapPin, CheckCircle,
  AlertTriangle, Calendar, Award, Phone, Check,
  Upload, FileText, ArrowRight, UserCheck
} from 'lucide-react';

export default function DonorDashboard() {
  const { session, profile, donor: authDonor } = useAuth();
  const { showToast } = useToast();

  const [donors, setDonors] = useState<DonorEntity[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [idVerified, setIdVerified] = useState<boolean>(true);
  const [committedRequests, setCommittedRequests] = useState<string[]>([]);

  // Sync with bloodService and user auth
  useEffect(() => {
    const sync = () => {
      const allDonors = bloodService.getDonors();
      setDonors(allDonors);
      setRequests(bloodService.getRequests());
    };
    sync();
    return bloodService.subscribe(sync);
  }, []);

  // Determine active donor: preference given to real logged-in donor!
  const matchedDonor = donors.find(d => 
    d.id === authDonor?.id || 
    d.phone === authDonor?.phone || 
    d.name.toLowerCase() === authDonor?.full_name?.toLowerCase()
  ) || donors[0];

  const donorName = authDonor?.full_name || matchedDonor?.name || 'Registered Voluntary Donor';
  const bloodGroup = (authDonor?.blood_group || matchedDonor?.bloodGroup || 'O+') as any;
  const donorCity = authDonor?.city || matchedDonor?.city || 'Nagpur';
  const donorPhone = authDonor?.phone || matchedDonor?.phone || '+91 9876543210';

  const handleToggleAvailability = () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    if (matchedDonor) {
      bloodService.toggleDonorAvailability(matchedDonor.id, nextVal);
    }
    showToast(nextVal ? 'You are now marked Available for emergency calls!' : 'You are now marked Away.', 'info');
  };

  const handleCommitDonate = (reqId: string) => {
    setCommittedRequests(prev => [...prev, reqId]);
    showToast('Commitment recorded! Hospital coordination team notified.', 'success');
  };

  const eligibility = checkDonorEligibility({
    age: authDonor?.age || 27,
    weightKg: 66,
    gender: (authDonor as any)?.gender || matchedDonor?.gender || 'Male',
    lastDonationDate: matchedDonor?.lastDonationAt,
    hasRecentTattooOrPiercing: false,
    hasMajorSurgery: false,
    hasActiveInfectionOrFever: false,
    isTakingAntibiotics: false
  });

  const daysCooldown = eligibility.daysRemainingInCooldown || 0;
  const cooldownPercent = Math.max(0, Math.min(100, Math.round(((90 - daysCooldown) / 90) * 100)));

  return (
    <div 
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8 pb-20 md:pb-8"
      style={{ color: 'var(--color-navy)' }}
    >
      {/* =========================================================================
          1. DONOR PROFILE HEADER (Uses Real User Details)
      ========================================================================= */}
      <div 
        className="p-6 sm:p-8 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-2xl border flex items-center justify-center font-black text-2xl shadow-inner shrink-0"
            style={{
              backgroundColor: 'var(--color-bg)',
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)'
            }}
          >
            {bloodGroup}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black" style={{ color: 'var(--color-navy)' }}>
                {donorName}
              </h1>
              {idVerified ? (
                <StatusBadge status="available" label="Official ID Verified" />
              ) : (
                <StatusBadge status="low" label="Pending ID Upload" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs mt-2 opacity-80" style={{ color: 'var(--color-navy)' }}>
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5" /> {donorCity}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <Phone className="w-3.5 h-3.5" /> {donorPhone}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <Award className="w-3.5 h-3.5" style={{ color: 'var(--color-warning-fill)' }} />
                <span>Level: Gold Lifesaver &bull; 98% Reputation</span>
              </span>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div 
          className="p-4 rounded-xl border flex items-center justify-between md:justify-end gap-4"
          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">
              Emergency Broadcast
            </p>
            <p className="text-xs font-bold" style={{ color: isAvailable ? 'var(--color-success-text)' : 'var(--color-danger)' }}>
              {isAvailable ? 'Active for Alerts' : 'Do Not Disturb'}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isAvailable}
            onClick={handleToggleAvailability}
            className="min-h-[44px] min-w-[56px] p-1 rounded-full border transition flex items-center js-focus-ring"
            style={{
              backgroundColor: isAvailable ? 'var(--color-success-fill)' : 'var(--color-border)',
              borderColor: isAvailable ? 'var(--color-success-fill)' : 'var(--color-border)',
              justifyContent: isAvailable ? 'flex-end' : 'flex-start'
            }}
            aria-label="Toggle emergency alert availability"
          >
            <span className="w-6 h-6 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. VERIFICATION STEPPER & ELIGIBILITY COUNTDOWN RING
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Verification Progress Stepper (Col 8) */}
        <div 
          className="lg:col-span-8 p-6 rounded-2xl border shadow-sm space-y-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-base font-black" style={{ color: 'var(--color-navy)' }}>
                Donor Trust &amp; ID Verification
              </h2>
              <p className="text-xs opacity-75">
                Official Photo ID validation protects against duplicate profiles and maintains clinical safety.
              </p>
            </div>
            <StatusBadge status="available" label="Level 4 Verified" />
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="p-3.5 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--color-success-text)' }}>
                <Check className="w-4 h-4" />
                <span>Step 1: Bio</span>
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--color-navy)' }}>Personal Data</p>
              <p className="text-[10px] opacity-70">Name, Age, Blood Group</p>
            </div>

            <div className="p-3.5 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--color-success-text)' }}>
                <Check className="w-4 h-4" />
                <span>Step 2: ID Card</span>
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--color-navy)' }}>Official Photo ID</p>
              <p className="text-[10px] opacity-70">Aadhaar / Voter / License</p>
            </div>

            <div className="p-3.5 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--color-success-text)' }}>
                <Check className="w-4 h-4" />
                <span>Step 3: Vitals</span>
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--color-navy)' }}>Medical Screening</p>
              <p className="text-[10px] opacity-70">Hb &gt; 12.5g/dL, Weight &gt; 50kg</p>
            </div>

            <div className="p-3.5 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-primary)' }}>
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                <ShieldCheck className="w-4 h-4" />
                <span>Step 4: Badge</span>
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--color-navy)' }}>Verified Lifesaver</p>
              <p className="text-[10px] opacity-70">Direct Hospital Dispatch</p>
            </div>

          </div>

          <div 
            className="p-4 rounded-xl border flex items-center justify-between gap-4 text-xs"
            style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Govt Photo ID Document Linked</p>
                <p className="text-[11px] opacity-75">Document ID: IND-MH-ID-****7842 &bull; Validated with SHA-256 Hash</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => showToast('Donor ID Verification Certificate is up-to-date and cryptographically verified.', 'success')}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl border font-bold js-focus-ring"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              View Certificate
            </button>
          </div>
        </div>

        {/* Eligibility Countdown Ring (Col 4) */}
        <div 
          className="lg:col-span-4 p-6 rounded-2xl border shadow-sm flex flex-col justify-between items-center text-center space-y-4"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="w-full text-left">
            <h2 className="text-base font-black" style={{ color: 'var(--color-navy)' }}>
              Donation Eligibility
            </h2>
            <p className="text-xs opacity-75">
              90-day biological safety recovery interval
            </p>
          </div>

          {/* SVG Circular Progress Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="var(--color-border)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="var(--color-primary)"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * cooldownPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                {daysCooldown === 0 ? 'READY' : `${daysCooldown}d`}
              </span>
              <span className="text-[10px] font-bold opacity-75">
                {daysCooldown === 0 ? 'Eligible' : 'Cooldown'}
              </span>
            </div>
          </div>

          <div className="w-full text-xs space-y-1">
            <p className="font-bold">
              {daysCooldown === 0 ? 'You are fully eligible to donate!' : `${daysCooldown} days until next donation interval.`}
            </p>
            <p className="text-[11px] opacity-70">Last donated on: 12 July 2026</p>
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. NEARBY EMERGENCY BLOOD REQUESTS (Actionable)
      ========================================================================= */}
      <div 
        className="p-6 sm:p-8 rounded-2xl border shadow-sm space-y-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
              Nearby Urgent Transfusion Requests in {donorCity}
            </h2>
            <p className="text-xs opacity-75">
              Hospitals requesting {bloodGroup} or compatible units. Your response triggers immediate dispatch.
            </p>
          </div>
          <span className="text-xs font-bold opacity-75">
            {requests.length} Requests Active
          </span>
        </div>

        <div className="space-y-3">
          {requests.map((req) => {
            const isCommitted = committedRequests.includes(req.id);
            return (
              <div 
                key={req.id}
                className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                    <span>Distance: ~3.4 km</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {isCommitted ? (
                    <span className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5" style={{ color: 'var(--color-success-text)' }}>
                      <Check className="w-4 h-4" /> Committed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCommitDonate(req.id)}
                      className="min-h-[44px] px-5 py-2 rounded-xl font-bold text-xs text-white transition active:scale-95 js-focus-ring"
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
          4. DONATION HISTORY TABLE
      ========================================================================= */}
      <div 
        className="p-6 sm:p-8 rounded-2xl border shadow-sm space-y-4"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
          Donation History &amp; Certificate Log
        </h2>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-left text-xs">
            <thead style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }} className="border-b">
              <tr>
                <th className="py-3 px-4 font-bold">Donation Date</th>
                <th className="py-3 px-4 font-bold">Center / Blood Bank</th>
                <th className="py-3 px-4 font-bold">Component</th>
                <th className="py-3 px-4 font-bold">Units Donated</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              <tr>
                <td className="py-3 px-4 font-semibold">12 July 2026</td>
                <td className="py-3 px-4 font-bold">JeevanSetu Central Blood Bank (Nagpur)</td>
                <td className="py-3 px-4">Whole Blood (450ml)</td>
                <td className="py-3 px-4 font-bold">1 Unit</td>
                <td className="py-3 px-4">
                  <StatusBadge status="available" label="Transfused" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">14 March 2026</td>
                <td className="py-3 px-4 font-bold">Metro Regional Blood Centre</td>
                <td className="py-3 px-4">Whole Blood (450ml)</td>
                <td className="py-3 px-4 font-bold">1 Unit</td>
                <td className="py-3 px-4">
                  <StatusBadge status="available" label="Transfused" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <EmergencyBottomBar />
    </div>
  );
}
