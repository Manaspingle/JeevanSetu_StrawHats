import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bloodService } from '@/services/bloodService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmergencyBottomBar } from '@/components/ui/EmergencyBottomBar';
import { useToast } from '@/components/ui/ToastRegion';
import type { BloodBank, BloodUnit, StockSummary, BloodGroup, ExpiryAlert, EmergencyRequest } from '@/types/blood';
import {
  Building2, ShieldCheck, AlertCircle, AlertTriangle, Clock, Plus,
  Trash2, ShieldAlert, CheckCircle2, MapPin, Phone, Check, X,
  FileText, Shield
} from 'lucide-react';

const ALL_BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function BankDashboard() {
  const { session, profile, bank: authBank } = useAuth();
  const { showToast } = useToast();

  const [banks, setBanks] = useState<BloodBank[]>(bloodService.getBanks());
  const [stockSummaries, setStockSummaries] = useState<Record<string, StockSummary>>(bloodService.getStockSummaries());
  const [units, setUnits] = useState<BloodUnit[]>([]);
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>(bloodService.getRequests());

  // Unit Intake Form State
  const [intakeGroup, setIntakeGroup] = useState<BloodGroup>('O-');
  const [intakeComponent, setIntakeComponent] = useState<'RBC' | 'whole'>('RBC');
  const [intakeExpiryDays, setIntakeExpiryDays] = useState<number>(35);
  const [shelfLocation, setShelfLocation] = useState<string>('Vault-A-01');

  // Quarantine / Discard Modal State
  const [quarantineUnitId, setQuarantineUnitId] = useState<string | null>(null);
  const [quarantineReason, setQuarantineReason] = useState<string>('Cold-chain deviation during storage check');
  const [isQuarantineOpen, setIsQuarantineOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const allBanks = bloodService.getBanks();
      setBanks(allBanks);
      setStockSummaries(bloodService.getStockSummaries());
      setRequests(bloodService.getRequests());
      const { alerts: liveAlerts } = bloodService.runExpiryCheck();
      setAlerts(liveAlerts);
    };
    sync();
    return bloodService.subscribe(sync);
  }, []);

  // Determine active bank: prefer real logged-in blood bank!
  const currentBank = banks.find(b => 
    b.id === authBank?.id || 
    b.name.toLowerCase() === authBank?.name?.toLowerCase()
  ) || banks[0];

  const bankName = authBank?.name || currentBank?.name || 'Regional Certified Blood Center';
  const licenseNumber = authBank?.license_number || currentBank?.licenseNumber || 'BB-MH-2026';
  const bankPhone = authBank?.phone || currentBank?.phone || '+91 712 2548901';
  const bankCity = authBank?.city || currentBank?.city || 'Nagpur';

  useEffect(() => {
    if (currentBank) {
      setUnits(bloodService.getUnits(currentBank.id));
    }
  }, [currentBank]);

  const currentStock = currentBank ? stockSummaries[currentBank.id]?.counts : null;

  // Handle unit intake
  const handleIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBank) return;

    bloodService.intakeBloodUnit({
      bankId: currentBank.id,
      bloodGroup: intakeGroup,
      component: intakeComponent,
      expiresInDays: intakeExpiryDays,
      shelfLocation
    });

    setUnits(bloodService.getUnits(currentBank.id));
    setStockSummaries(bloodService.getStockSummaries());
    showToast(`Intake successful: 1 unit of ${intakeGroup} added to ${shelfLocation}.`, 'success');
  };

  // Handle quarantine / discard confirmation
  const handleConfirmQuarantine = () => {
    if (!quarantineUnitId) return;
    bloodService.discardUnit(quarantineUnitId, quarantineReason);
    if (currentBank) {
      setUnits(bloodService.getUnits(currentBank.id));
      setStockSummaries(bloodService.getStockSummaries());
    }
    showToast(`Unit ${quarantineUnitId} quarantined and logged to audit ledger.`, 'error');
    setQuarantineUnitId(null);
  };

  // Handle request status update
  const handleRequestAction = (reqId: string, action: 'accept' | 'decline') => {
    if (action === 'accept') {
      bloodService.updateRequestStatus(reqId, 'dispatched', 'Accepted by Blood Bank; dispatched via emergency courier.');
      showToast(`Request ${reqId} accepted and dispatched!`, 'success');
    } else {
      bloodService.updateRequestStatus(reqId, 'cancelled', 'Declined by Blood Bank due to component hold.');
      showToast(`Request ${reqId} declined.`, 'info');
    }
  };

  // Expiring units sorted by days left
  const expiringUnits = units
    .filter(u => u.status === 'available')
    .map(u => {
      const daysLeft = Math.round((new Date(u.expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24));
      return { ...u, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  return (
    <div 
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8 pb-20 md:pb-8"
      style={{ color: 'var(--color-navy)' }}
    >
      {/* =========================================================================
          1. BLOOD BANK FACILITY HEADER (Uses Real Logged-In Data)
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
                {bankName}
              </h1>
              <StatusBadge status="available" label="Drug Controller Licensed" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs mt-2 opacity-80" style={{ color: 'var(--color-navy)' }}>
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5" /> {bankCity}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                License: {licenseNumber}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <Phone className="w-3.5 h-3.5" /> {bankPhone}
              </span>
            </div>
          </div>
        </div>

        <div 
          className="p-3.5 rounded-xl border text-xs text-left"
          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          <p className="font-bold opacity-75">Cold-Chain Temperature</p>
          <p className="font-black text-xs" style={{ color: 'var(--color-success-text)' }}>
            +4.1°C Optimal &bull; Vault Active
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. STOCK GRID (8 Blood Groups as Cards with Count, Status & Sparkline)
      ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black" style={{ color: 'var(--color-navy)' }}>
              Live Blood Group Stock Grid (8 Groups)
            </h2>
            <p className="text-xs opacity-75">
              Atomic unit counts with FEFO dispatch tracking and color + icon status pairings.
            </p>
          </div>
          <span className="text-xs font-bold opacity-75">
            Auto-Refreshed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {ALL_BLOOD_GROUPS.map((bg) => {
            const count = currentStock ? (currentStock[bg] ?? 0) : 0;
            const status = count > 5 ? 'available' : count > 0 ? 'low' : 'critical';

            return (
              <div 
                key={bg}
                className="p-3.5 rounded-xl border shadow-sm flex flex-col justify-between space-y-3"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm" style={{ color: 'var(--color-primary)' }}>{bg}</span>
                  <StatusBadge status={status} label={count.toString()} />
                </div>

                <div>
                  <p className="text-2xl font-black" style={{ color: 'var(--color-navy)' }}>
                    {count}
                  </p>
                  <p className="text-[10px] opacity-70 font-semibold">Available Units</p>
                </div>

                {/* Expiry mini-bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, count * 10)}%`,
                      backgroundColor: count > 3 ? 'var(--color-success-fill)' : 'var(--color-warning-fill)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. EXPIRING-SOON QUEUE & UNIT INTAKE FORM
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Expiring-Soon Queue (Col 7) */}
        <div 
          className="lg:col-span-7 p-6 rounded-2xl border shadow-sm space-y-4"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h3 className="text-base font-black flex items-center gap-2" style={{ color: 'var(--color-navy)' }}>
                <Clock className="w-4 h-4" style={{ color: 'var(--color-warning-text)' }} />
                <span>Expiring-Soon Queue (FEFO Priority)</span>
              </h3>
              <p className="text-xs opacity-75">
                Units ordered by earliest expiration date.
              </p>
            </div>
            <StatusBadge status="expiring" label={`${expiringUnits.length} Units`} />
          </div>

          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-left text-xs">
              <thead style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-navy)' }} className="border-b">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Unit ID</th>
                  <th className="py-2.5 px-3 font-bold">Group</th>
                  <th className="py-2.5 px-3 font-bold">Shelf</th>
                  <th className="py-2.5 px-3 font-bold">Expires In</th>
                  <th className="py-2.5 px-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {expiringUnits.map(unit => (
                  <tr key={unit.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[11px]">{unit.id.slice(0, 14)}</td>
                    <td className="py-2.5 px-3 font-black" style={{ color: 'var(--color-primary)' }}>{unit.bloodGroup}</td>
                    <td className="py-2.5 px-3 opacity-80">{unit.shelfLocation || 'Vault-A'}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold" style={{ color: unit.daysLeft <= 3 ? 'var(--color-danger)' : 'var(--color-warning-text)' }}>
                        {unit.daysLeft} days
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => {
                          setQuarantineUnitId(unit.id);
                          setIsQuarantineOpen(true);
                        }}
                        className="p-1 rounded text-red-600 hover:bg-red-50 transition js-focus-ring"
                        title="Quarantine or Discard Unit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unit Intake Form (Col 5) */}
        <div 
          className="lg:col-span-5 p-6 rounded-2xl border shadow-sm space-y-4"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-base font-black flex items-center gap-2" style={{ color: 'var(--color-navy)' }}>
              <Plus className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span>Blood Unit Intake</span>
            </h3>
            <p className="text-xs opacity-75">
              Add verified unit to real shelf inventory.
            </p>
          </div>

          <form onSubmit={handleIntake} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>
                Blood Group
              </label>
              <select
                value={intakeGroup}
                onChange={(e) => setIntakeGroup(e.target.value as BloodGroup)}
                className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none js-focus-ring"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-navy)'
                }}
              >
                {ALL_BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>
                  Component
                </label>
                <select
                  value={intakeComponent}
                  onChange={(e) => setIntakeComponent(e.target.value as any)}
                  className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none js-focus-ring"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-navy)'
                  }}
                >
                  <option value="RBC">Packed RBC</option>
                  <option value="whole">Whole Blood</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={42}
                  value={intakeExpiryDays}
                  onChange={(e) => setIntakeExpiryDays(parseInt(e.target.value) || 35)}
                  className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none js-focus-ring"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-navy)'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-navy)' }}>
                Shelf / Vault Code
              </label>
              <input
                type="text"
                required
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Vault-A-01"
                className="min-h-[44px] w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none js-focus-ring"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-navy)'
                }}
              />
            </div>

            <button
              type="submit"
              className="min-h-[44px] w-full py-3 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition active:scale-95 js-focus-ring shadow-sm"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Plus className="w-4 h-4" />
              <span>Record &amp; Stock Unit</span>
            </button>
          </form>
        </div>

      </div>

      {/* =========================================================================
          4. INCOMING REQUESTS (Accept / Decline Actions)
      ========================================================================= */}
      <div 
        className="p-6 sm:p-8 rounded-2xl border shadow-sm space-y-4"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h3 className="text-base font-black" style={{ color: 'var(--color-navy)' }}>
              Incoming Emergency Hospital Requests
            </h3>
            <p className="text-xs opacity-75">
              Review and dispatch requested units to nearby care units.
            </p>
          </div>
          <span className="text-xs font-bold opacity-75">{requests.length} Requests Active</span>
        </div>

        <div className="space-y-3">
          {requests.map(req => (
            <div 
              key={req.id}
              className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: 'var(--color-navy)' }}>{req.hospitalName}</span>
                  <StatusBadge status={req.status === 'allocated' ? 'available' : req.status === 'pending' ? 'low' : 'critical'} label={req.status} />
                </div>
                <p className="text-xs opacity-75">
                  Requested: <strong>{req.units} units of {req.bloodGroup}</strong> &bull; Triage: {req.urgency}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRequestAction(req.id, 'accept')}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition active:scale-95 js-focus-ring"
                  style={{ backgroundColor: 'var(--color-success-fill)' }}
                >
                  <Check className="w-4 h-4" />
                  <span>Accept &amp; Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestAction(req.id, 'decline')}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition active:scale-95 js-focus-ring"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-danger)'
                  }}
                >
                  <X className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog for Destructive Quarantine Action */}
      <ConfirmModal
        isOpen={isQuarantineOpen}
        onClose={() => setIsQuarantineOpen(false)}
        onConfirm={handleConfirmQuarantine}
        title="Confirm Unit Quarantine / Discard"
        description={`Are you sure you want to quarantine unit ${quarantineUnitId}? Reason: "${quarantineReason}". This will subtract the unit from active shelf inventory and log to the audit ledger.`}
        confirmLabel="Quarantine Unit"
        isDestructive={true}
      />

      <EmergencyBottomBar />
    </div>
  );
}
