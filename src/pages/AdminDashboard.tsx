import React, { useState, useEffect } from 'react';
import RaceDemo from '@/components/RaceDemo';
import { bloodService } from '@/services/bloodService';
import type { EmergencyRequest, AuditLogEntry, HospitalEntity, BloodBank } from '@/types/blood';
import {
  ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, Clock,
  Building2, Users, FileText, Check, X, RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [hospitals, setHospitals] = useState<HospitalEntity[]>([]);
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'race' | 'fraud' | 'institutions' | 'audit'>('race');

  useEffect(() => {
    const sync = () => {
      setRequests(bloodService.getRequests());
      setHospitals(bloodService.getHospitals());
      setBanks(bloodService.getBanks());
      setAuditLogs(bloodService.getAuditLogs());
    };
    sync();
    return bloodService.subscribe(sync);
  }, []);

  const flaggedRequests = requests.filter(r => r.status === 'review_required');

  const handleApproveRequest = async (reqId: string) => {
    await bloodService.approveFlaggedRequest(reqId);
    setRequests(bloodService.getRequests());
  };

  const handleApproveHospital = (hospId: string) => {
    bloodService.approveHospitalOrBank('hospital', hospId);
    setHospitals(bloodService.getHospitals());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            ADMINISTRATIVE SECURITY & COMPETITION EVALUATOR CONSOLE
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">JeevanSetu Governance</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('race')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'race'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Last Unit Guard Demo
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'fraud'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Fraud Queue ({flaggedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('institutions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'institutions'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Approvals
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'audit'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Race Demo Differentiator */}
      {activeTab === 'race' && (
        <section aria-label="Race Demo Section">
          <RaceDemo />
        </section>
      )}

      {/* Tab 2: Fraud Review Queue */}
      {activeTab === 'fraud' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Automated Risk & Fraud Detection Queue
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Requests flagged by velocity spikes, rare group volume anomalies, or cryptographic mismatch.
            </p>
          </div>

          {flaggedRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Zero anomalous requests in review queue. All dispatches verified.
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedRequests.map(req => (
                <div
                  key={req.id}
                  className="border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center text-sm">
                        {req.bloodGroup}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{req.hospitalName}</h4>
                        <p className="text-xs text-slate-500">
                          {req.units} Units &bull; Risk Score: <strong className="text-rose-600">{req.riskScore || 75}/100</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveRequest(req.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve & Release Hold
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1">
                    <div className="font-semibold text-amber-800 dark:text-amber-300">
                      Gemini Security Explanation:
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {req.aiFraudSummary || 'Multiple rapid emergency requests received from this entity within 10-minute threshold.'}
                    </p>
                    {req.fraudFlags && (
                      <div className="flex gap-2 pt-1">
                        {req.fraudFlags.map(f => (
                          <span key={f} className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Institutional Approval Queue */}
      {activeTab === 'institutions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-500" />
            Accredited Facilities Directory
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Facility Name</th>
                  <th className="p-3">City</th>
                  <th className="p-3">License Number</th>
                  <th className="p-3">Regulatory Status</th>
                  <th className="p-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hospitals.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{h.name}</td>
                    <td className="p-3 text-slate-500">{h.city}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{h.licenseNumber}</td>
                    <td className="p-3">
                      {h.verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!h.verified && (
                        <button
                          onClick={() => handleApproveHospital(h.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Cryptographic Append-Only Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-500" />
              Append-Only Tamper-Proof Audit Log
            </h2>
            <span className="text-xs text-slate-400">Total Entries: {auditLogs.length}</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold text-rose-600">{log.action}</td>
                    <td className="p-3 font-semibold text-cyan-600 dark:text-cyan-400">{log.actor}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{log.entityType} ({log.entityId})</td>
                    <td className="p-3 text-slate-500 truncate max-w-xs">{JSON.stringify(log.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
