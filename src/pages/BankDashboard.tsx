import React, { useState, useEffect } from 'react';
import { bloodService } from '@/services/bloodService';
import type { BloodBank, BloodUnit, StockSummary, BloodGroup, ExpiryAlert } from '@/types/blood';
import {
  Building2, ShieldCheck, AlertCircle, AlertTriangle, Clock, Plus,
  Trash2, ShieldAlert, CheckCircle2, MapPin, Phone
} from 'lucide-react';

export default function BankDashboard() {
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<BloodBank | null>(null);
  const [stockSummaries, setStockSummaries] = useState<Record<string, StockSummary>>({});
  const [units, setUnits] = useState<BloodUnit[]>([]);
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);

  // Intake Form
  const [intakeGroup, setIntakeGroup] = useState<BloodGroup>('O-');
  const [intakeComponent, setIntakeComponent] = useState<'RBC' | 'whole'>('RBC');
  const [intakeExpiryDays, setIntakeExpiryDays] = useState<number>(35);
  const [shelfLocation, setShelfLocation] = useState<string>('Vault-A-01');

  // Quarantine Modal
  const [quarantineUnitId, setQuarantineUnitId] = useState<string | null>(null);
  const [quarantineReason, setQuarantineReason] = useState<string>('Temperature excursion above 6°C during storage inspection');

  useEffect(() => {
    const sync = () => {
      const allBanks = bloodService.getBanks();
      setBanks(allBanks);
      if (!selectedBank && allBanks.length > 0) {
        setSelectedBank(allBanks[0]);
      }
      setStockSummaries(bloodService.getStockSummaries());
      if (selectedBank) {
        setUnits(bloodService.getUnits(selectedBank.id));
      } else if (allBanks.length > 0) {
        setUnits(bloodService.getUnits(allBanks[0].id));
      }
      const { alerts: liveAlerts } = bloodService.runExpiryCheck();
      setAlerts(liveAlerts);
    };
    sync();
    return bloodService.subscribe(sync);
  }, [selectedBank]);

  const bank = selectedBank || banks[0];
  const currentStock = bank ? stockSummaries[bank.id]?.counts : null;

  const handleIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank) return;
    bloodService.intakeBloodUnit({
      bankId: bank.id,
      bloodGroup: intakeGroup,
      component: intakeComponent,
      expiresInDays: intakeExpiryDays,
      shelfLocation
    });
    setUnits(bloodService.getUnits(bank.id));
    setStockSummaries(bloodService.getStockSummaries());
  };

  const handleQuarantine = async () => {
    if (!quarantineUnitId || !bank) return;
    await bloodService.quarantineUnit(quarantineUnitId, quarantineReason, bank.id);
    setQuarantineUnitId(null);
    setUnits(bloodService.getUnits(bank.id));
    setStockSummaries(bloodService.getStockSummaries());
  };

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Bank Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 font-bold">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{bank?.name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Blood Bank
                </span>
                {bank?.isRaceTarget && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Race Demo Target (1 Sole O- Unit)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {bank?.city} &bull; {bank?.address}</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {bank?.phone}</span>
                <span>Response Rate: <strong>{Math.round((bank?.responseRate || 0.9) * 100)}%</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Bank Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="facility-select" className="text-xs font-semibold text-slate-500">Facility:</label>
            <select
              id="facility-select"
              value={bank?.id}
              onChange={(e) => {
                const found = banks.find(b => b.id === e.target.value);
                if (found) setSelectedBank(found);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-medium"
            >
              {banks.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stock Summary Grid by Blood Group with FEFO alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              Real-Time Shelf Stock by Blood Group (FEFO Tracked)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Synchronized atomically with unit collection. Zero negative stock guaranteed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {bloodGroups.map(bg => {
            const count = currentStock ? currentStock[bg] || 0 : 0;
            const isCritical = count === 0;
            const isLow = count === 1;

            return (
              <div
                key={bg}
                className={`rounded-2xl p-4 border text-center transition ${
                  isCritical
                    ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    : isLow
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <span className="text-sm font-black text-slate-900 dark:text-white block">{bg}</span>
                <span className={`text-3xl font-extrabold my-2 block ${
                  isCritical ? 'text-rose-600' : isLow ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {count}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block ${
                  isCritical
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
                    : isLow
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                }`}>
                  {isCritical ? 'Out of Stock' : isLow ? 'Sole Unit (Alert)' : 'Sufficient'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unit Level Shelf Management & Intake */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Intake Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-rose-500" />
            New Unit Intake
          </h3>
          <form onSubmit={handleIntake} className="space-y-4">
            <div>
              <label htmlFor="intake-blood-group" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Blood Group</label>
              <select
                id="intake-blood-group"
                value={intakeGroup}
                onChange={(e) => setIntakeGroup(e.target.value as BloodGroup)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="intake-component" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Component Type</label>
              <select
                id="intake-component"
                value={intakeComponent}
                onChange={(e) => setIntakeComponent(e.target.value as 'RBC' | 'whole')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="RBC">Packed Red Blood Cells (RBC)</option>
                <option value="whole">Whole Blood</option>
              </select>
            </div>

            <div>
              <label htmlFor="intake-shelf-life" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Shelf Life (Days)</label>
              <input
                id="intake-shelf-life"
                type="number"
                min="1"
                max="42"
                value={intakeExpiryDays}
                onChange={(e) => setIntakeExpiryDays(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="intake-vault-slot" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Vault / Shelf Slot</label>
              <input
                id="intake-vault-slot"
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-900/20"
            >
              Add Unit to Inventory
            </button>
          </form>
        </div>

        {/* Units Table with Quarantine Action */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Shelf Units ({units.length} Registered)
            </h3>
            <span className="text-xs text-slate-400">Sorted by FEFO (Earliest Expiry First)</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Unit ID</th>
                  <th className="p-3">Group</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {units.slice(0, 15).map(unit => {
                  const isAvail = unit.status === 'available';
                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-medium text-slate-700 dark:text-slate-300">{unit.id}</td>
                      <td className="p-3 font-bold text-rose-600">{unit.bloodGroup}</td>
                      <td className="p-3 uppercase">{unit.component}</td>
                      <td className="p-3 text-slate-500">{new Date(unit.expiresAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isAvail ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {unit.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {isAvail && (
                          <button
                            onClick={() => setQuarantineUnitId(unit.id)}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded text-[11px] font-semibold transition"
                          >
                            Quarantine
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quarantine Modal */}
      {quarantineUnitId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Quarantine Unit ({quarantineUnitId})
            </h3>
            <p className="text-xs text-slate-500">
              Quarantining immediately decrements the stock counter and records an immutable entry in the audit log.
            </p>
            <div>
              <label htmlFor="quarantine-reason" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Reason for Quarantine</label>
              <textarea
                id="quarantine-reason"
                value={quarantineReason}
                onChange={(e) => setQuarantineReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setQuarantineUnitId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleQuarantine}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
              >
                Confirm Quarantine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
