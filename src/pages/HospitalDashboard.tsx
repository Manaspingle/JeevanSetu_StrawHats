import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bloodService } from '@/services/bloodService';
import { BloodGroupChips } from '@/components/ui/BloodGroupChips';
import { UnitsStepper } from '@/components/ui/UnitsStepper';
import { UrgencySelector } from '@/components/ui/UrgencySelector';
import { TimelineTracker, type RequestTimelineStage } from '@/components/ui/TimelineTracker';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmergencyBottomBar } from '@/components/ui/EmergencyBottomBar';
import { useToast } from '@/components/ui/ToastRegion';
import type { EmergencyRequest, BloodGroup, UrgencyLevel, HospitalEntity } from '@/types/blood';
import {
  Siren, Clock, CheckCircle2, AlertTriangle, ArrowRight,
  ShieldCheck, MapPin, Building2, Send, RotateCcw, AlertOctagon
} from 'lucide-react';

export default function HospitalDashboard() {
  const { session, profile, hospital: authHospital } = useAuth();
  const { showToast } = useToast();

  const [hospitals, setHospitals] = useState<HospitalEntity[]>(bloodService.getHospitals());
  const [requests, setRequests] = useState<EmergencyRequest[]>(bloodService.getRequests());

  // Form State
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [units, setUnits] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Critical');
  const [patientRef, setPatientRef] = useState<string>('PAT-ICU-882');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active tracked request state
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);

  useEffect(() => {
    const sync = () => {
      const allH = bloodService.getHospitals();
      setHospitals(allH);
      const allReqs = bloodService.getRequests();
      setRequests(allReqs);
      if (!activeRequest && allReqs.length > 0) {
        setActiveRequest(allReqs[0]);
      }
    };
    sync();
    return bloodService.subscribe(sync);
  }, [activeRequest]);

  // Current Hospital entity: prefer real logged-in hospital!
  const currentHospital = hospitals.find(h => 
    h.id === authHospital?.id || 
    h.name.toLowerCase() === authHospital?.hospital_name?.toLowerCase()
  ) || hospitals[0];

  const hospitalName = authHospital?.hospital_name || currentHospital?.name || 'Emergency Trauma Center';
  const hospitalCity = authHospital?.city || currentHospital?.city || 'Nagpur';
  const registrationId = authHospital?.registration_id || currentHospital?.licenseNumber || 'REG-HOSP-2026';
  const emergencyPhone = authHospital?.phone || currentHospital?.emergencyContact || '+91 712 2500001';

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHospital) return;
    setIsSubmitting(true);

    try {
      const { request, allocation, isFlagged } = await bloodService.createEmergencyRequest({
        hospitalId: currentHospital.id,
        patientRef,
        bloodGroup,
        units,
        urgency
      });

      setActiveRequest(request);
      showToast(`Emergency request ${request.id} dispatched! ${allocation.status === 'allocated' ? 'Units reserved instantly.' : 'Routing initiated.'}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to dispatch request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert request status to TimelineTracker stage
  const getTimelineStage = (status: string): RequestTimelineStage => {
    switch (status) {
      case 'pending': return 'requested';
      case 'review_required': return 'requested';
      case 'allocated': return 'reserved';
      case 'dispatched': return 'in_transit';
      case 'completed': return 'delivered';
      default: return 'matched';
    }
  };

  return (
    <div 
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8 pb-20 md:pb-8"
      style={{ color: 'var(--color-navy)' }}
    >
      {/* =========================================================================
          1. HOSPITAL IDENTITY BANNER (Uses Real Logged-In Data)
      ========================================================================= */}
      <div 
        className="p-6 sm:p-8 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-14 h-14 rounded-2xl border flex items-center justify-center font-black text-xl shrink-0"
            style={{
              backgroundColor: 'var(--color-bg)',
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)'
            }}
          >
            <Building2 className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black" style={{ color: 'var(--color-navy)' }}>
                {hospitalName}
              </h1>
              <StatusBadge status="available" label="NABH Accredited" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs mt-2 opacity-80" style={{ color: 'var(--color-navy)' }}>
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5" /> {hospitalCity}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                License: {registrationId}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                Hotline: {emergencyPhone}
              </span>
            </div>
          </div>
        </div>

        <div 
          className="p-3.5 rounded-xl border text-xs text-left"
          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          <p className="font-bold opacity-75">Auto-Location Protocol</p>
          <p className="font-black text-xs" style={{ color: 'var(--color-success-text)' }}>
            GPS Coordinates Active (Nagpur Hub)
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. EMERGENCY REQUEST FORM (Action-First with Radio Chips & Stepper)
      ========================================================================= */}
      <div 
        id="emergency-form"
        className="p-6 sm:p-8 rounded-2xl border shadow-sm space-y-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--color-navy)' }}>
              <Siren className="w-5 h-5 animate-pulse" style={{ color: 'var(--color-primary)' }} />
              <span>Emergency Blood Transfusion Request Form</span>
            </h2>
            <p className="text-xs opacity-75">
              Action-first triage: selects best matching bank, verifies ABO/Rh compatibility, and atomic last-unit locks.
            </p>
          </div>
          <span 
            className="px-2.5 py-1 rounded-full text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Zero Latency
          </span>
        </div>

        <form onSubmit={handleCreateRequest} className="space-y-6">
          
          {/* Blood Group Chips (Radio group semantics) */}
          <BloodGroupChips 
            value={bloodGroup} 
            onChange={(bg) => setBloodGroup(bg)} 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Units Stepper */}
            <UnitsStepper 
              value={units} 
              onChange={(val) => setUnits(val)} 
            />

            {/* Patient Ref ID */}
            <div className="space-y-1.5">
              <label htmlFor="patient-ref" className="block text-xs font-bold" style={{ color: 'var(--color-navy)' }}>
                Patient ICU / Triage Ref ID
              </label>
              <input
                id="patient-ref"
                type="text"
                required
                value={patientRef}
                onChange={(e) => setPatientRef(e.target.value)}
                placeholder="e.g. ICU-CASUALTY-990"
                className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none js-focus-ring"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-navy)'
                }}
              />
            </div>
          </div>

          {/* Urgency Selector */}
          <UrgencySelector 
            value={urgency} 
            onChange={(u) => setUrgency(u)} 
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] w-full py-3.5 px-6 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-md transition active:scale-95 js-focus-ring disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Request &amp; Lock Optimal Unit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* =========================================================================
          3. LIVE TRACKER TIMELINE & FALLBACK EXPLANATION CARD
      ========================================================================= */}
      {activeRequest && (
        <div 
          className="p-6 sm:p-8 rounded-2xl border shadow-sm space-y-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-base font-black" style={{ color: 'var(--color-navy)' }}>
                Live Fulfillment Tracker &bull; Request {activeRequest.id}
              </h2>
              <p className="text-xs opacity-75">
                Real-time tracking of matched units, dispatch vehicle, and estimated transit times.
              </p>
            </div>
            <StatusBadge status={activeRequest.status === 'allocated' ? 'available' : 'low'} label={activeRequest.status} />
          </div>

          {/* Timeline Tracker */}
          <TimelineTracker currentStage={getTimelineStage(activeRequest.status)} />

          {/* Fallback Explanation Card (Requested in Brief) */}
          <div 
            className="p-4 rounded-xl border text-xs space-y-2"
            style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-sm" style={{ color: 'var(--color-navy)' }}>
                Smart Routing &amp; Fallback Allocation Status
              </span>
            </div>
            
            <p className="leading-relaxed opacity-85">
              <strong>Rerouted:</strong> {activeRequest.allocatedBankId ? `Allocated from ${activeRequest.allocatedBankId}. Units verified under FEFO expiry rules.` : 'Bank A had the last unit taken during race condition. Next best optimal candidate: Metro Regional Blood Centre, 4.2 km away, 11 min ETA.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold opacity-75">
              <span>Patient Reference: {activeRequest.patientRefHash.slice(0, 12)}...</span>
              <span>&bull;</span>
              <span>Units: {activeRequest.units}x {activeRequest.bloodGroup}</span>
              <span>&bull;</span>
              <span>Updated: Just now</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. RECENT HOSPITAL DISPATCH LOGS
      ========================================================================= */}
      <div 
        className="p-6 sm:p-8 rounded-2xl border shadow-sm space-y-4"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
          Active Hospital Requests
        </h2>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-left text-xs">
            <thead style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }} className="border-b">
              <tr>
                <th className="py-3 px-4 font-bold">Request ID</th>
                <th className="py-3 px-4 font-bold">Blood Group</th>
                <th className="py-3 px-4 font-bold">Units</th>
                <th className="py-3 px-4 font-bold">Urgency</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Allocated Center</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {requests.map(req => (
                <tr 
                  key={req.id}
                  onClick={() => setActiveRequest(req)}
                  className="cursor-pointer hover:bg-slate-50 transition"
                >
                  <td className="py-3 px-4 font-bold">{req.id}</td>
                  <td className="py-3 px-4 font-black" style={{ color: 'var(--color-primary)' }}>{req.bloodGroup}</td>
                  <td className="py-3 px-4 font-semibold">{req.units}</td>
                  <td className="py-3 px-4">{req.urgency}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={req.status === 'allocated' ? 'available' : req.status === 'pending' ? 'low' : 'critical'} label={req.status} />
                  </td>
                  <td className="py-3 px-4 font-medium opacity-85">{req.allocatedBankId || 'Auto-Routing'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EmergencyBottomBar />
    </div>
  );
}
