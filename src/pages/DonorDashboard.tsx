import React, { useState, useEffect } from 'react';
import { bloodService } from '@/services/bloodService';
import { checkDonorEligibility } from '@/domain/verification';
import type { DonorEntity, EmergencyRequest } from '@/types/blood';
import { Heart, ShieldCheck, Clock, MapPin, CheckCircle, AlertTriangle, Calendar, Award, Phone } from 'lucide-react';

export default function DonorDashboard() {
  const [donors, setDonors] = useState<DonorEntity[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<DonorEntity | null>(null);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    const sync = () => {
      const allDonors = bloodService.getDonors();
      setDonors(allDonors);
      if (!selectedDonor && allDonors.length > 0) {
        setSelectedDonor(allDonors[0]);
      }
      setRequests(bloodService.getRequests());
    };
    sync();
    return bloodService.subscribe(sync);
  }, [selectedDonor]);

  const donor = selectedDonor || donors[0];

  const handleToggleAvailability = () => {
    if (!donor) return;
    const nextVal = !donor.available;
    bloodService.toggleDonorAvailability(donor.id, nextVal);
    setSelectedDonor({ ...donor, available: nextVal });
  };

  const eligibility = donor ? checkDonorEligibility({
    age: 28,
    weightKg: 68,
    gender: donor.gender,
    lastDonationDate: donor.lastDonationAt,
    hasRecentTattooOrPiercing: false,
    hasMajorSurgery: false,
    hasActiveInfectionOrFever: false,
    isTakingAntibiotics: false
  }) : { isEligible: true, daysRemainingInCooldown: 0, reasons: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Donor Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 font-black text-2xl">
              {donor?.bloodGroup || 'O-'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{donor?.name}</h1>
                {donor?.verified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Donor
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Pending Bank Attestation
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {donor?.city}</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {donor?.phone}</span>
                <span className="flex items-center gap-1"><Award className="w-4 h-4 text-amber-500" /> Trust Score: {donor?.reputation}%</span>
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Emergency Broadcast Status</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {donor?.available ? 'Available for Immediate Dispatch' : 'Paused / Offline'}
              </div>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                donor?.available ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
              role="switch"
              aria-checked={donor?.available}
              aria-label="Toggle donor availability"
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  donor?.available ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Eligibility & Donation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Eligibility Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              Eligibility Cooldown
            </h3>
            {eligibility.isEligible ? (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                Eligible Now
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                Cooldown Active
              </span>
            )}
          </div>
          <div className="text-center py-4">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
              {eligibility.daysRemainingInCooldown}
            </span>
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
              Days Until Next Donation Window
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            Statutory interval: 90 days for male donors, 120 days for female donors. Minimum weight 50kg.
          </p>
        </div>

        {/* Donation Records */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-rose-500" />
            Lifetime Contribution
          </h3>
          <div className="text-center py-4">
            <span className="text-4xl font-extrabold text-rose-600">
              {donor?.donationCount || 0}
            </span>
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
              Units Donated &bull; ~{(donor?.donationCount || 0) * 3} Lives Impacted
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between">
            <span>Last Donated:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {donor?.lastDonationAt ? new Date(donor.lastDonationAt).toLocaleDateString() : 'Never'}
            </span>
          </div>
        </div>

        {/* Privacy & Masking Safeguards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Privacy & Trust Tier
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              Phone number masked from third-party queries
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              Location precision fuzzified to 2km radius
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              FCM encrypted emergency dispatch alerts
            </li>
          </ul>
        </div>
      </div>

      {/* Nearby Active Hospital Emergency Requests */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              Live Emergency Demands in {donor?.city}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active critical blood requests from accredited hospitals within reach.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {requests.slice(0, 3).map(req => (
            <div
              key={req.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-rose-600 text-white font-black text-lg flex items-center justify-center">
                  {req.bloodGroup}
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{req.hospitalName}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>Units: <strong>{req.units}</strong></span>
                    <span>&bull;</span>
                    <span className="text-rose-600 font-semibold">{req.urgency} Urgency</span>
                    <span>&bull;</span>
                    <span>{new Date(req.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  req.status === 'allocated'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {req.status === 'allocated' ? 'Unit Held' : 'Community Alert'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
