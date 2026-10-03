import React, { useState, useEffect } from 'react';
import { bloodService } from '@/services/bloodService';
import { parseEmergencyWithGemini } from '@/domain/ai';
import type { EmergencyRequest, BloodGroup, UrgencyLevel, HospitalEntity } from '@/types/blood';
import {
  Siren, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck,
  Sparkles, Send, MapPin, Building2, ChevronRight, UserCheck
} from 'lucide-react';

export default function HospitalDashboard() {
  const [hospitals, setHospitals] = useState<HospitalEntity[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalEntity | null>(null);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [units, setUnits] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Critical');
  const [patientRef, setPatientRef] = useState<string>('PAT-ICU-882');
  const [aiInputText, setAiInputText] = useState<string>('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiParsedNotice, setAiParsedNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sync = () => {
      const allHospitals = bloodService.getHospitals();
      setHospitals(allHospitals);
      if (!selectedHospital && allHospitals.length > 0) {
        setSelectedHospital(allHospitals[0]);
      }
      setRequests(bloodService.getRequests());
    };
    sync();
    return bloodService.subscribe(sync);
  }, [selectedHospital]);

  const currentHospital = selectedHospital || hospitals[0];

  const handleAiIntake = async () => {
    if (!aiInputText.trim()) return;
    setIsAiParsing(true);
    setAiParsedNotice(null);

    const parsed = await parseEmergencyWithGemini(aiInputText);
    setBloodGroup(parsed.bloodGroup);
    setUnits(parsed.units);
    setUrgency(parsed.urgency);
    setAiParsedNotice(`Parsed via ${parsed.source === 'gemini_ai' ? 'Gemini 1.5' : 'Regex Medical Engine'}: ${parsed.units} units of ${parsed.bloodGroup} (${parsed.urgency})`);
    setIsAiParsing(false);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHospital) return;
    setIsSubmitting(true);

    await bloodService.createEmergencyRequest({
      hospitalId: currentHospital.id,
      patientRef,
      bloodGroup,
      units,
      urgency
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setAiInputText('');
    setAiParsedNotice(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Hospital Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentHospital?.name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Hospital
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {currentHospital?.city}</span>
                <span>License: <strong>{currentHospital?.licenseNumber}</strong></span>
                <span>Trust Score: <strong className="text-emerald-600">{currentHospital?.reputation}%</strong></span>
              </div>
            </div>
          </div>

          {/* Emergency CTA */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-900/20 flex items-center gap-2 transition transform active:scale-95"
          >
            <Siren className="w-5 h-5 animate-pulse" />
            Post Emergency Blood Request
          </button>
        </div>
      </div>

      {/* Live Dispatch Tracker & Request Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              Live Emergency Dispatches & Allocation Tracker
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active blood requests with real-time routing status, ETA, and fallback protection.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {requests.map(req => {
            const isAllocated = req.status === 'allocated';
            const isReview = req.status === 'review_required';

            return (
              <div
                key={req.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-800/40 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-xl bg-rose-600 text-white font-black text-lg flex items-center justify-center">
                      {req.bloodGroup}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {req.hospitalName} &bull; {req.units} Unit(s)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Patient Ref Hash: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">{req.patientRefHash.slice(0, 16)}...</code>
                        <span className="ml-2 font-semibold text-rose-600">[{req.urgency} Urgency]</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                      isAllocated
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isReview
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                    }`}>
                      {isAllocated && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isReview && <AlertTriangle className="w-3.5 h-3.5" />}
                      {isAllocated ? 'ALLOCATED & HELD' : isReview ? 'SECURITY REVIEW' : req.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Timeline / Notes */}
                <div className="bg-white dark:bg-slate-900/80 rounded-lg p-3 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1">
                  {req.timeline.map((evt, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400 font-mono text-[10px]">[{new Date(evt.timestamp).toLocaleTimeString()}]</span>
                      <span>{evt.note}</span>
                    </div>
                  ))}
                  {req.allocatedUnitIds && req.allocatedUnitIds.length > 0 && (
                    <div className="pt-2 text-emerald-600 dark:text-emerald-400 font-medium">
                      Held Shelf Unit(s): {req.allocatedUnitIds.join(', ')} (15-min reservation hold)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Request Modal with Gemini AI Structured Intake */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Siren className="w-5 h-5 text-rose-500 animate-pulse" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Emergency Blood Request</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>

            {/* Gemini Intake Assistant */}
            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl p-4 space-y-2">
              <label htmlFor="ai-transcript" className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Gemini AI Emergency Voice / Dictation Parser
              </label>
              <div className="flex gap-2">
                <input
                  id="ai-transcript"
                  type="text"
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  placeholder="e.g., 'Need 2 units B negative, ICU trauma case urgent'"
                  className="flex-1 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAiIntake}
                  disabled={isAiParsing}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  {isAiParsing ? 'Parsing...' : 'Extract'}
                </button>
              </div>
              {aiParsedNotice && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{aiParsedNotice}</p>
              )}
            </div>

            {/* Manual Confirmation Form */}
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="blood-group" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Blood Group
                  </label>
                  <select
                    id="blood-group"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="units-count" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Units Required
                  </label>
                  <input
                    id="units-count"
                    type="number"
                    min="1"
                    max="10"
                    value={units}
                    onChange={(e) => setUnits(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="urgency-level" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Urgency Level
                  </label>
                  <select
                    id="urgency-level"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Critical">Critical (Immediate Triage)</option>
                    <option value="High">High (Within 2 Hours)</option>
                    <option value="Moderate">Moderate (Elective Buffer)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="patient-ref" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Patient Reference ID
                  </label>
                  <input
                    id="patient-ref"
                    type="text"
                    value={patientRef}
                    onChange={(e) => setPatientRef(e.target.value)}
                    placeholder="e.g. PAT-ICU-882"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                🔒 Protected by cryptographic deduplication and multi-factor FEFO matching.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Routing Request...' : 'Confirm & Dispatch Emergency Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
