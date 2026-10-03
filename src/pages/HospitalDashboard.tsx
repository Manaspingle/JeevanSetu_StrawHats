import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bloodService, type DonorRegistration, type PeerHospitalRequest } from '@/services/bloodService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/ToastRegion';
import type { EmergencyRequest, BloodGroup, UrgencyLevel, HospitalEntity } from '@/types/blood';
import {
  Building2, Users, ArrowRight, Clock, MapPin, Send,
  Cpu, Heart, ShieldCheck, AlertTriangle, CheckCircle2,
  RefreshCw, PlusCircle, Check, X, Bell, Layers, Radio, Volume2
} from 'lucide-react';

const CITIES_HOSPITALS = {
  Nagpur: [
    { id: 'hosp_nagpur_aiims', name: 'AIIMS Nagpur Super Specialty' },
    { id: 'hosp_nagpur_alexis', name: 'Alexis Multispecialty Hospital' },
    { id: 'hosp_nagpur_gmc', name: 'Government Medical College (GMC) Nagpur' },
    { id: 'hosp_nagpur_wockhardt', name: 'Wockhardt Hospital Nagpur' }
  ],
  Mumbai: [
    { id: 'hosp_mumbai_kem', name: 'KEM Hospital & Research Center' },
    { id: 'hosp_mumbai_lilavati', name: 'Lilavati Hospital & Research Centre' },
    { id: 'hosp_mumbai_kokilaben', name: 'Kokilaben Dhirubhai Ambani Hospital' },
    { id: 'hosp_mumbai_tata', name: 'Tata Memorial Hospital' }
  ],
  Pune: [
    { id: 'hosp_pune_ruby', name: 'Ruby Hall Clinic' },
    { id: 'hosp_pune_sassoon', name: 'Sassoon General Hospital' },
    { id: 'hosp_pune_sahyadri', name: 'Sahyadri Super Specialty Hospital' },
    { id: 'hosp_pune_deenanath', name: 'Deenanath Mangeshkar Hospital' }
  ]
};

export default function HospitalDashboard() {
  const { session, profile, hospital: authHospital } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'donors' | 'peer_requests' | 'hardware' | 'bank_request'>('donors');

  // Real-time collections from bloodService
  const [registrations, setRegistrations] = useState<DonorRegistration[]>(bloodService.getDonorRegistrations());
  const [peerRequests, setPeerRequests] = useState<PeerHospitalRequest[]>(bloodService.getPeerHospitalRequests());
  const [requests, setRequests] = useState<EmergencyRequest[]>(bloodService.getRequests());

  // Inter-Hospital Peer Request Modal & Form
  const [showPeerModal, setShowPeerModal] = useState(false);
  const [peerCategory, setPeerCategory] = useState<'blood' | 'organ'>('blood');
  const [peerCity, setPeerCity] = useState<'Nagpur' | 'Mumbai' | 'Pune'>('Nagpur');
  const [peerTargetHosp, setPeerTargetHosp] = useState<string>('hosp_nagpur_alexis');
  const [peerItem, setPeerItem] = useState<string>('PRBC B+ (Packed Red Cells)');
  const [peerUnits, setPeerUnits] = useState<number>(2);
  const [peerUrgency, setPeerUrgency] = useState<'Critical' | 'Urgent' | 'Standard'>('Critical');
  const [peerPatientRef, setPeerPatientRef] = useState<string>('PAT-ICU-882');
  const [peerReason, setPeerReason] = useState<string>('Emergency trauma patient in acute hemorrhagic shock.');

  // Emergency Blood Bank Request Form
  const [bankGroup, setBankGroup] = useState<BloodGroup>('O-');
  const [bankUnits, setBankUnits] = useState<number>(2);
  const [bankUrgency, setBankUrgency] = useState<UrgencyLevel>('Critical');
  const [bankPatientRef, setBankPatientRef] = useState<string>('PAT-TRAUMA-401');

  // Hardware RFID Verifier Interactive State
  const [rfidInput, setRfidInput] = useState<string>('A4:8B:2F:10');
  const [hardwareState, setHardwareState] = useState<{
    buzzerActive: boolean;
    greenLed: boolean;
    redLed: boolean;
    oledLines: string[];
    statusMsg: string;
  }>({
    buzzerActive: false,
    greenLed: false,
    redLed: false,
    oledLines: [
      'ESP32 RFID STATION',
      'Ready to Scan Card',
      'Waiting for Donor...',
      'JeevanSetu IoT Node'
    ],
    statusMsg: 'Hardware Verifier Station Idle - Scan Card to Verify'
  });

  useEffect(() => {
    const sync = () => {
      setRegistrations(bloodService.getDonorRegistrations());
      setPeerRequests(bloodService.getPeerHospitalRequests());
      setRequests(bloodService.getRequests());
    };
    sync();
    return bloodService.subscribe(sync);
  }, []);

  const hospitalName = authHospital?.hospital_name || 'AIIMS Nagpur Super Specialty';
  const hospitalCity = (authHospital?.city as any) || 'Nagpur';
  const registrationId = authHospital?.registration_id || 'HOSP-MAH-GOV-01';
  const emergencyPhone = authHospital?.phone || '+91 712 2500001';

  // Handle Inter-Hospital Peer Request Submission
  const handleCreatePeerRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const targetHospObj = CITIES_HOSPITALS[peerCity]?.find(h => h.id === peerTargetHosp);
    const targetName = targetHospObj?.name || 'Alexis Multispecialty Hospital';

    const newReq = bloodService.createPeerHospitalRequest({
      fromHospitalId: authHospital?.id || 'hosp_nagpur_aiims',
      fromHospitalName: hospitalName,
      fromCity: hospitalCity,
      toHospitalId: peerTargetHosp,
      toHospitalName: targetName,
      toCity: peerCity,
      category: peerCategory,
      item: peerItem,
      units: Number(peerUnits),
      urgency: peerUrgency,
      patientRef: peerPatientRef,
      reason: peerReason
    });

    setShowPeerModal(false);
    showToast(`Peer Request ${newReq.id} transmitted to ${targetName} (${peerCity})!`, 'success');
  };

  // Handle Hospital Emergency Blood Bank Request
  const handleCreateBankRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { request } = await bloodService.createEmergencyRequest({
        hospitalId: authHospital?.id || 'hosp_nagpur_aiims',
        patientRef: bankPatientRef,
        bloodGroup: bankGroup,
        units: bankUnits,
        urgency: bankUrgency
      });
      showToast(`Emergency request ${request.id} dispatched! Visible at the bottom of Blood Bank Dashboard.`, 'success');
      setActiveTab('bank_request');
    } catch (err: any) {
      showToast(err?.message || 'Failed to dispatch request', 'error');
    }
  };

  // Trigger Hardware Scan Logic
  const handleTestRfidScan = (scanValue?: string) => {
    const cardUid = scanValue || rfidInput;
    const res = bloodService.verifyHardwareRfid(cardUid);

    // Audio cue: simulate 1-sec buzzer beep using HTML5 Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = res.success ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(res.success ? 880 : 320, audioCtx.currentTime); // 880Hz success or 320Hz error
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.0); // Exact 1-second beep
    } catch {}

    setHardwareState({
      buzzerActive: true,
      greenLed: res.success,
      redLed: !res.success,
      oledLines: res.oledLines,
      statusMsg: res.message
    });

    showToast(res.message, res.success ? 'success' : 'error');

    // Reset buzzer state after 1 second
    setTimeout(() => {
      setHardwareState(prev => ({
        ...prev,
        buzzerActive: false
      }));
    }, 1000);
  };

  const handleNotifyDonor = (reg: DonorRegistration) => {
    bloodService.updateDonorRegistration(reg.id, { status: 'contacted' });
    showToast(`Invitation sent to ${reg.fullName} (${reg.phone}). Donor instructed to arrive at ${hospitalName} for RFID verification.`, 'info');
  };

  return (
    <div 
      className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-8 pb-20 md:pb-8 text-left"
      style={{ color: 'var(--color-navy)' }}
    >
      {/* =========================================================================
          1. HOSPITAL IDENTITY BANNER
      ========================================================================= */}
      <div 
        className="p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-2xl border flex items-center justify-center font-black text-2xl shadow-inner shrink-0 bg-sky-50 dark:bg-sky-950 text-sky-600 border-sky-300"
          >
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black" style={{ color: 'var(--color-navy)' }}>
                {hospitalName}
              </h1>
              <StatusBadge status="available" label="Verified Hospital Node" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs mt-1.5 opacity-80" style={{ color: 'var(--color-navy)' }}>
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> City Node: <strong>{hospitalCity}</strong>
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> License: {registrationId}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <Radio className="w-3.5 h-3.5 text-sky-500" /> Emergency Casualty: {emergencyPhone}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPeerModal(true)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 shadow-md transition active:scale-95 bg-sky-600 hover:bg-sky-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Peer Hospital (Blood / Organ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-navy)'
            }}
          >
            <Cpu className="w-4 h-4 text-emerald-500" />
            <span>IoT RFID Station</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TAB NAVIGATION
      ========================================================================= */}
      <div className="flex items-center gap-2 border-b overflow-x-auto pb-2" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => setActiveTab('donors')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 border ${
            activeTab === 'donors' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'donors' ? 'var(--color-surface)' : 'transparent',
            borderColor: activeTab === 'donors' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'donors' ? 'var(--color-primary)' : 'var(--color-navy)'
          }}
        >
          <Users className="w-4 h-4" />
          <span>Donor Registrations ({registrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('peer_requests')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 border ${
            activeTab === 'peer_requests' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'peer_requests' ? 'var(--color-surface)' : 'transparent',
            borderColor: activeTab === 'peer_requests' ? 'var(--color-accent-blue)' : 'transparent',
            color: activeTab === 'peer_requests' ? 'var(--color-accent-blue)' : 'var(--color-navy)'
          }}
        >
          <Layers className="w-4 h-4" />
          <span>Inter-Hospital Peer Requests ({peerRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 border ${
            activeTab === 'hardware' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'hardware' ? 'var(--color-surface)' : 'transparent',
            borderColor: activeTab === 'hardware' ? 'var(--color-accent-green)' : 'transparent',
            color: activeTab === 'hardware' ? 'var(--color-accent-green)' : 'var(--color-navy)'
          }}
        >
          <Cpu className="w-4 h-4" />
          <span>ESP32 Hardware Verifier</span>
        </button>

        <button
          onClick={() => setActiveTab('bank_request')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 border ${
            activeTab === 'bank_request' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'bank_request' ? 'var(--color-surface)' : 'transparent',
            borderColor: activeTab === 'bank_request' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'bank_request' ? 'var(--color-primary)' : 'var(--color-navy)'
          }}
        >
          <Send className="w-4 h-4" />
          <span>Dispatch to Blood Bank</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: REAL-TIME DONOR REGISTRATIONS (Directly Visible from Donor Form)
      ========================================================================= */}
      {activeTab === 'donors' && (
        <div 
          className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-5"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
                Registered Blood Donors in Real Time
              </h2>
              <p className="text-xs opacity-75">
                Volunteers who submitted the donation registration form. Unique Donor IDs and RFID tokens are linked for on-site scanning.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border">
              Total Registered: {registrations.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-left text-xs">
              <thead style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }} className="border-b font-black uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Donor Name &amp; Contact</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Biological Eligibility</th>
                  <th className="py-3.5 px-4">Eligible Volume</th>
                  <th className="py-3.5 px-4">Last Donation</th>
                  <th className="py-3.5 px-4">RFID UID Token</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold">
                      <p className="text-sm">{reg.fullName}</p>
                      <p className="text-[11px] opacity-75 font-normal">{reg.gender}, {reg.age} yrs &bull; {reg.phone}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span 
                        className="px-2.5 py-1 rounded-lg font-black text-xs text-white"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        {reg.bloodGroup}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold">{reg.city}</td>

                    <td className="py-3 px-4">
                      {reg.isEligible ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Eligible to Donate</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Cooldown ({reg.daysCooldown}d left)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                      {reg.eligibleQuantity}
                    </td>

                    <td className="py-3 px-4 opacity-80">
                      {reg.lastDonationDate || 'First Time'}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[11px] text-sky-600 dark:text-sky-400">
                      {reg.rfidUid}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleNotifyDonor(reg)}
                        className="px-3 py-1.5 rounded-xl border text-[11px] font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        {reg.status === 'contacted' ? 'Notified' : 'Invite Donor'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRfidInput(reg.rfidUid);
                          setActiveTab('hardware');
                          handleTestRfidScan(reg.rfidUid);
                        }}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white shadow-sm transition active:scale-95 bg-emerald-600"
                      >
                        Test RFID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: INTER-HOSPITAL PEER REQUESTS (Nagpur, Mumbai, Pune)
      ========================================================================= */}
      {activeTab === 'peer_requests' && (
        <div 
          className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-5"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
                Peer-to-Peer Inter-Hospital Network
              </h2>
              <p className="text-xs opacity-75">
                Direct cross-hospital resource sharing of scarce blood units and transplant organs across Nagpur, Mumbai, and Pune.
              </p>
            </div>
            <button
              onClick={() => setShowPeerModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-md transition active:scale-95 bg-sky-600"
            >
              + Raise Peer Request
            </button>
          </div>

          <div className="space-y-3">
            {peerRequests.map((req) => (
              <div 
                key={req.id}
                className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-sky-600 dark:text-sky-400">
                      {req.fromHospitalName} ({req.fromCity}) &rarr; {req.toHospitalName} ({req.toCity})
                    </span>
                    <StatusBadge status={req.status === 'dispatched' ? 'available' : req.status === 'approved' ? 'low' : 'critical'} label={req.status} />
                  </div>
                  <p className="text-xs opacity-85">
                    Item: <strong>{req.units} units of {req.item}</strong> ({req.category.toUpperCase()}) &bull; Urgency: <span className="font-bold text-rose-500">{req.urgency}</span>
                  </p>
                  <p className="text-[11px] opacity-70">
                    Clinical Reason: {req.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'requested' && (
                    <button
                      onClick={() => {
                        bloodService.updatePeerHospitalRequest(req.id, 'approved');
                        showToast(`Request ${req.id} approved for inter-hospital courier!`, 'success');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600"
                    >
                      Approve Transfer
                    </button>
                  )}
                  {req.status === 'approved' && (
                    <button
                      onClick={() => {
                        bloodService.updatePeerHospitalRequest(req.id, 'dispatched');
                        showToast(`Units for ${req.id} dispatched via cold-chain transit!`, 'success');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600"
                    >
                      Dispatch Units
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ESP32 IOT HARDWARE RFID VERIFIER STATION (LIVE SIMULATOR & MONITOR)
      ========================================================================= */}
      {activeTab === 'hardware' && (
        <div 
          className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
                ESP32 Hardware RFID Verification Console
              </h2>
              <p className="text-xs opacity-75">
                Simulates or monitors physical scans at the casualty reception desk with RC522 RFID reader, Buzzer, Green/Red LEDs, and 128x64 OLED display.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Station ID: ESP32-MH-HOSP-01
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Visual Hardware Unit Representation (Col 7) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950 text-slate-100 border border-slate-800 space-y-5 shadow-2xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono text-sm font-bold text-white">ESP32-WROOM-32 Hardware Terminal</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Buzzer Status */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <Volume2 className={`w-4 h-4 ${hardwareState.buzzerActive ? 'text-amber-400 animate-ping' : 'text-slate-600'}`} />
                    <span className="font-mono text-[10px]">{hardwareState.buzzerActive ? 'BEEP 1s' : 'QUIET'}</span>
                  </div>

                  {/* Dual LEDs */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className={`w-3.5 h-3.5 rounded-full ${hardwareState.greenLed ? 'bg-emerald-400 shadow-lg shadow-emerald-500/80 animate-pulse' : 'bg-emerald-950 border border-emerald-800'}`} />
                      <span className="text-[10px] font-mono">GRN</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-3.5 h-3.5 rounded-full ${hardwareState.redLed ? 'bg-rose-500 shadow-lg shadow-rose-500/80 animate-pulse' : 'bg-rose-950 border border-rose-800'}`} />
                      <span className="text-[10px] font-mono">RED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical OLED 128x64 Emulation Screen */}
              <div className="p-5 rounded-2xl bg-black border-2 border-emerald-900/60 font-mono text-xs text-emerald-400 shadow-inner space-y-1">
                <div className="text-[10px] opacity-60 text-center border-b border-emerald-950 pb-1 mb-2">
                  [ SSD1306 128x64 OLED SCREEN ]
                </div>
                {hardwareState.oledLines.map((line, idx) => (
                  <p key={idx} className="leading-relaxed tracking-wider font-semibold">
                    &gt; {line}
                  </p>
                ))}
              </div>

              {/* Pin Mapping Legend from User Prompt */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono space-y-1 opacity-80">
                <p className="font-bold text-amber-300">Verified GPIO Pin Configuration:</p>
                <p>&bull; RC522: SDA(5), SCK(18), MOSI(23), MISO(19), RST(27)</p>
                <p>&bull; OLED: SDA(21), SCL(22) &bull; Green LED: GPIO 25 &bull; Red LED: GPIO 26 &bull; Buzzer: GPIO 32</p>
              </div>

            </div>

            {/* Test Controller Panel (Col 5) */}
            <div 
              className="lg:col-span-5 p-6 rounded-3xl border space-y-4"
              style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
            >
              <h3 className="font-black text-sm" style={{ color: 'var(--color-navy)' }}>
                Test RFID Card Scan
              </h3>
              <p className="text-xs opacity-75">
                Enter an RFID UID or pick one of the active registered donors to test the live authorization &amp; cooldown algorithm.
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-bold block opacity-80">RFID Card UID</label>
                <input
                  type="text"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  placeholder="A4:8B:2F:10"
                  className="w-full min-h-[42px] px-3 rounded-xl border font-mono font-bold text-xs outline-none"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold opacity-75">Quick Select Test Cards:</p>
                <div className="space-y-1">
                  {registrations.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRfidInput(r.rfidUid);
                        handleTestRfidScan(r.rfidUid);
                      }}
                      className="w-full text-left p-2 rounded-xl border text-[11px] flex items-center justify-between transition hover:border-emerald-500"
                      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                    >
                      <span className="font-bold text-emerald-600">✓ {r.fullName} ({r.bloodGroup}) [REGISTERED]</span>
                      <span className="font-mono text-emerald-600 font-bold">{r.rfidUid}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setRfidInput('7B:3E:91:A2');
                      handleTestRfidScan('7B:3E:91:A2');
                    }}
                    className="w-full text-left p-2 rounded-xl border text-[11px] flex items-center justify-between transition hover:border-rose-500"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <span className="font-bold text-rose-500">✕ Other Card (7B:3E:91:A2) [UNREGISTERED]</span>
                    <span className="font-mono text-rose-500 font-bold">7B:3E:91:A2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRfidInput('FF:FF:FF:FF');
                      handleTestRfidScan('FF:FF:FF:FF');
                    }}
                    className="w-full text-left p-2 rounded-xl border text-[11px] flex items-center justify-between transition hover:border-rose-500"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <span className="font-bold text-rose-500">✕ Fraud / Any Other UID [UNREGISTERED]</span>
                    <span className="font-mono text-rose-500 font-bold">FF:FF:FF:FF</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTestRfidScan()}
                className="w-full min-h-[44px] py-2.5 rounded-xl font-black text-xs text-white shadow-md transition active:scale-95 bg-emerald-600"
              >
                Scan RFID Card
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DISPATCH REQUEST TO BLOOD BANK
      ========================================================================= */}
      {activeTab === 'bank_request' && (
        <div 
          className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
                Dispatch Request to Certified Blood Bank
              </h2>
              <p className="text-xs opacity-75">
                Requests raised here immediately appear at the bottom of the Blood Bank Dashboard for intake &amp; dispatch.
              </p>
            </div>
            <StatusBadge status="available" label="Live Vault Bridge" />
          </div>

          <form onSubmit={handleCreateBankRequest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
            <div>
              <label className="block mb-1 opacity-80">Blood Group</label>
              <select
                value={bankGroup}
                onChange={(e) => setBankGroup(e.target.value as BloodGroup)}
                className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-bold"
                style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
              >
                {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 opacity-80">Units Required</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={bankUnits}
                onChange={(e) => setBankUnits(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 rounded-xl border outline-none"
                style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
              />
            </div>

            <div>
              <label className="block mb-1 opacity-80">Clinical Triage Level</label>
              <select
                value={bankUrgency}
                onChange={(e) => setBankUrgency(e.target.value as UrgencyLevel)}
                className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
              >
                <option value="Critical">Critical (Immediate 15m Dispatch)</option>
                <option value="Urgent">Urgent (Within 2 Hours)</option>
                <option value="Standard">Standard (Elective Surgery)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 opacity-80">Patient ICU Reference</label>
              <input
                type="text"
                required
                value={bankPatientRef}
                onChange={(e) => setBankPatientRef(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-mono"
                style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 pt-2 flex justify-end">
              <button
                type="submit"
                className="min-h-[44px] px-6 py-2.5 rounded-xl font-black text-xs text-white shadow-md transition active:scale-95"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Dispatch to Blood Bank Trays
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL: INTER-HOSPITAL PEER REQUEST
      ========================================================================= */}
      {showPeerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-xl p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="text-xl font-black" style={{ color: 'var(--color-navy)' }}>
                  Inter-Hospital Resource Request
                </h3>
                <p className="text-xs opacity-75">
                  Request blood units or transplant organs from peer hospitals across Nagpur, Mumbai, and Pune.
                </p>
              </div>
              <button 
                onClick={() => setShowPeerModal(false)}
                className="p-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePeerRequest} className="space-y-4 text-xs font-bold">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 opacity-80">Category</label>
                  <select
                    value={peerCategory}
                    onChange={(e) => {
                      const cat = e.target.value as 'blood' | 'organ';
                      setPeerCategory(cat);
                      setPeerItem(cat === 'blood' ? 'PRBC B+ (Packed Red Cells)' : 'Kidney (Organ Transplant)');
                    }}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  >
                    <option value="blood">Blood Component</option>
                    <option value="organ">Organ (Transplant)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 opacity-80">Target City</label>
                  <select
                    value={peerCity}
                    onChange={(e) => {
                      const city = e.target.value as any;
                      setPeerCity(city);
                      setPeerTargetHosp(CITIES_HOSPITALS[city][0].id);
                    }}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  >
                    <option value="Nagpur">Nagpur</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 opacity-80">Target Peer Hospital in {peerCity}</label>
                <select
                  value={peerTargetHosp}
                  onChange={(e) => setPeerTargetHosp(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                >
                  {CITIES_HOSPITALS[peerCity]?.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 opacity-80">Resource / Item</label>
                  <input
                    type="text"
                    required
                    value={peerItem}
                    onChange={(e) => setPeerItem(e.target.value)}
                    placeholder="e.g. PRBC O-, Kidney, Platelets"
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-80">Units / Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={peerUnits}
                    onChange={(e) => setPeerUnits(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 opacity-80">Urgency Level</label>
                <select
                  value={peerUrgency}
                  onChange={(e) => setPeerUrgency(e.target.value as any)}
                  className="w-full min-h-[42px] px-3 rounded-xl border outline-none font-semibold"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                >
                  <option value="Critical">Critical (Within 1 Hour)</option>
                  <option value="Urgent">Urgent (Within 4 Hours)</option>
                  <option value="Standard">Standard (Within 12 Hours)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 opacity-80">Clinical Reason &amp; Patient Note</label>
                <textarea
                  required
                  rows={2}
                  value={peerReason}
                  onChange={(e) => setPeerReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border outline-none font-normal"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPeerModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-black text-white shadow-md bg-sky-600"
                >
                  Send Peer Request
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
