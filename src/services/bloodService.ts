import { SEED_BANKS, SEED_HOSPITALS, SEED_DONORS, generateSeedUnitsAndStock } from '@/lib/seedData';
import { AllocationCoordinator, type AllocationResult } from '@/domain/allocation';
import { rankCandidateBanks, findEligibleDonors } from '@/domain/routing';
import { assessRequestRisk, computeRequestDeduplicationHash, RequestVelocityTracker } from '@/domain/fraud';
import { processUnitsExpiry } from '@/domain/expiry';
import type {
  ExpiryAlert,
  BloodBank,
  HospitalEntity,
  DonorEntity,
  BloodUnit,
  StockSummary,
  EmergencyRequest,
  AuditLogEntry,
  BloodGroup,
  UrgencyLevel
} from '@/types/blood';

const STORAGE_KEY = 'jeevansetu_state_v1';

interface JeevanSetuState {
  banks: BloodBank[];
  hospitals: HospitalEntity[];
  donors: DonorEntity[];
  units: BloodUnit[];
  stockSummaries: Record<string, StockSummary>;
  requests: EmergencyRequest[];
  auditLogs: AuditLogEntry[];
}

class BloodService {
  private state: JeevanSetuState;
  private coordinator: AllocationCoordinator;
  private velocityTracker: RequestVelocityTracker;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.velocityTracker = new RequestVelocityTracker();
    this.state = this.loadInitialState();
    this.coordinator = new AllocationCoordinator(this.state.units, this.state.stockSummaries);
    // Process on-start expiry checks
    this.runExpiryCheck();
  }

  private loadInitialState(): JeevanSetuState {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback to fresh seed
        }
      }
    }

    const { units, stockSummaries } = generateSeedUnitsAndStock();
    const initialState: JeevanSetuState = {
      banks: [...SEED_BANKS],
      hospitals: [...SEED_HOSPITALS],
      donors: [...SEED_DONORS],
      units,
      stockSummaries,
      requests: [
        {
          id: 'req_seed_01',
          hospitalId: 'hosp_nagpur_aiims',
          hospitalName: 'AIIMS Nagpur Super Specialty',
          patientRefHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          bloodGroup: 'B+',
          units: 2,
          urgency: 'Critical',
          status: 'allocated',
          idempotencyKey: 'seed_idem_01',
          hospitalLocation: { lat: 21.065, lng: 79.032 },
          candidates: [],
          allocatedBankId: 'bank_nagpur_metro',
          allocatedUnitIds: ['unit_bank_nagpur_metro_B_pos_1', 'unit_bank_nagpur_metro_B_pos_2'],
          timeline: [
            {
              status: 'pending',
              timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
              actor: 'hospital',
              note: 'Emergency ICU request initiated'
            },
            {
              status: 'allocated',
              timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
              actor: 'system',
              note: 'FEFO match allocated at Metro Regional Blood Centre'
            }
          ],
          createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
        }
      ],
      auditLogs: [
        {
          id: 'audit_init_01',
          action: 'SYSTEM_BOOT',
          timestamp: new Date().toISOString(),
          actor: 'system',
          entityType: 'stockSummary',
          entityId: 'global',
          details: { message: 'JeevanSetu core domain initialized with 6 blood banks and 8 hospitals' }
        }
      ]
    };

    this.saveState(initialState);
    return initialState;
  }

  private saveState(state: JeevanSetuState) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // quota safety
      }
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public resetToSeed(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.state = this.loadInitialState();
    this.coordinator.reset(this.state.units, this.state.stockSummaries);
    this.notify();
  }

  // Getters
  public getBanks(): BloodBank[] {
    return [...this.state.banks];
  }

  public getHospitals(): HospitalEntity[] {
    return [...this.state.hospitals];
  }

  public getDonors(): DonorEntity[] {
    return [...this.state.donors];
  }

  public getUnits(bankId?: string): BloodUnit[] {
    if (bankId) {
      return this.state.units.filter(u => u.bankId === bankId);
    }
    return [...this.state.units];
  }

  public getStockSummaries(): Record<string, StockSummary> {
    return { ...this.state.stockSummaries };
  }

  public getRequests(): EmergencyRequest[] {
    return [...this.state.requests];
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.state.auditLogs, ...this.coordinator.getAuditLogs()];
  }

  public getCoordinator(): AllocationCoordinator {
    return this.coordinator;
  }

  // Core Actions
  public async createEmergencyRequest(input: {
    hospitalId: string;
    patientRef: string;
    bloodGroup: BloodGroup;
    units: number;
    urgency: UrgencyLevel;
  }): Promise<{ request: EmergencyRequest; allocation: AllocationResult; isFlagged: boolean }> {
    const hospital = this.state.hospitals.find(h => h.id === input.hospitalId) || {
      id: input.hospitalId,
      name: 'Registered Emergency Hospital',
      city: 'Nagpur',
      location: { lat: 21.140, lng: 79.080 },
      licenseNumber: 'HOSP-GEN-001',
      emergencyContact: '+91 99999 99999',
      verified: true,
      reputation: 95
    };

    // 1. Deduplication Hash
    const patientRefHash = await computeRequestDeduplicationHash(
      input.patientRef,
      input.bloodGroup,
      hospital.id,
      30
    );

    // 2. Velocity Tracking
    const recentVelocity = this.velocityTracker.recordRequest(hospital.id);

    // 3. Fraud / Risk Scoring
    const riskAssessment = assessRequestRisk({
      hospitalId: hospital.id,
      isHospitalVerified: hospital.verified,
      hospitalReputation: hospital.reputation,
      patientRef: input.patientRef,
      bloodGroup: input.bloodGroup,
      units: input.units,
      urgency: input.urgency,
      recentRequestsInWindow: recentVelocity
    });

    // 4. Multi-factor Candidate Ranking
    const unitsMapByBank: Record<string, BloodUnit[]> = {};
    for (const b of this.state.banks) {
      unitsMapByBank[b.id] = this.state.units.filter(u => u.bankId === b.id);
    }

    const candidates = rankCandidateBanks(
      hospital.location,
      input.bloodGroup,
      input.units,
      this.state.banks,
      this.state.stockSummaries,
      unitsMapByBank
    );

    const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    const newRequest: EmergencyRequest = {
      id: `req_${Date.now()}`,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      patientRefHash,
      bloodGroup: input.bloodGroup,
      units: input.units,
      urgency: input.urgency,
      status: riskAssessment.isFlagged ? 'review_required' : 'pending',
      idempotencyKey,
      hospitalLocation: hospital.location,
      candidates,
      timeline: [
        {
          status: 'pending',
          timestamp: nowIso,
          actor: 'hospital',
          note: `Emergency request for ${input.units} unit(s) of ${input.bloodGroup} initiated.`
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
      riskScore: riskAssessment.riskScore,
      fraudFlags: riskAssessment.flags,
      aiFraudSummary: riskAssessment.explanation
    };

    let allocationResult: AllocationResult;

    if (riskAssessment.isFlagged) {
      // Flagged for admin review
      newRequest.timeline.push({
        status: 'review_required',
        timestamp: nowIso,
        actor: 'system',
        note: `Flagged by Fraud Prevention Engine (Risk Score: ${riskAssessment.riskScore}/100). Sent to Admin Review Queue.`
      });

      allocationResult = {
        success: false,
        status: 'exhausted',
        requestId: newRequest.id,
        failureReason: `Request held for admin verification: ${riskAssessment.explanation}`,
        stockRemaining: 0
      };
    } else if (candidates.length > 0) {
      // Auto-allocate via Coordinator
      const topBankId = candidates[0].bankId;
      const fallbackBankIds = candidates.slice(1).map(c => c.bankId);

      allocationResult = await this.coordinator.allocateEmergencyUnits(newRequest, topBankId, fallbackBankIds);

      // Sync coordinator changes back into persistent state
      this.state.units = this.coordinator.getUnits();
      for (const b of this.state.banks) {
        const updatedStock = this.coordinator.getStockSummary(b.id);
        if (updatedStock) {
          this.state.stockSummaries[b.id] = updatedStock;
        }
      }
    } else {
      newRequest.status = 'review_required';
      newRequest.fallbackToDonors = true;
      newRequest.timeline.push({
        status: 'review_required',
        timestamp: nowIso,
        actor: 'system',
        note: 'No blood banks in range with matching stock. Escalating to verified community donors.'
      });

      allocationResult = {
        success: false,
        status: 'exhausted',
        requestId: newRequest.id,
        failureReason: 'No matching stock across candidate blood banks. Escalated to nearby donors.',
        stockRemaining: 0
      };
    }

    this.state.requests.unshift(newRequest);
    this.saveState(this.state);

    return {
      request: newRequest,
      allocation: allocationResult,
      isFlagged: riskAssessment.isFlagged
    };
  }

  // Bank Actions
  public intakeBloodUnit(data: {
    bankId: string;
    bloodGroup: BloodGroup;
    component: 'whole' | 'RBC';
    expiresInDays: number;
    shelfLocation?: string;
  }): BloodUnit {
    const now = Date.now();
    const newUnit: BloodUnit = {
      id: `unit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      bankId: data.bankId,
      bloodGroup: data.bloodGroup,
      component: data.component,
      collectedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + data.expiresInDays * 24 * 3600 * 1000).toISOString(),
      status: 'available',
      shelfLocation: data.shelfLocation || `Rack-${data.bloodGroup}-New`
    };

    this.state.units.unshift(newUnit);

    const summary = this.state.stockSummaries[data.bankId];
    if (summary) {
      summary.counts[data.bloodGroup] = (summary.counts[data.bloodGroup] || 0) + 1;
      summary.lastUpdated = new Date().toISOString();
    }

    this.state.auditLogs.unshift({
      id: `audit_intake_${Date.now()}`,
      action: 'UNIT_INTAKE',
      timestamp: new Date().toISOString(),
      actor: 'user',
      entityType: 'unit',
      entityId: newUnit.id,
      details: { bankId: data.bankId, bloodGroup: data.bloodGroup, component: data.component }
    });

    this.coordinator.reset(this.state.units, this.state.stockSummaries);
    this.saveState(this.state);
    return newUnit;
  }

  public async quarantineUnit(unitId: string, reason: string, actorId: string): Promise<boolean> {
    const success = await this.coordinator.setUnitQuarantineStatus(unitId, 'quarantined', reason, actorId);
    if (success) {
      this.state.units = this.coordinator.getUnits();
      for (const b of this.state.banks) {
        const updated = this.coordinator.getStockSummary(b.id);
        if (updated) this.state.stockSummaries[b.id] = updated;
      }
      this.saveState(this.state);
    }
    return success;
  }

  public async discardUnit(unitId: string, reason: string, actorId: string = 'blood_bank'): Promise<boolean> {
    const success = await this.coordinator.setUnitQuarantineStatus(unitId, 'discarded', reason, actorId);
    if (success) {
      this.state.units = this.coordinator.getUnits();
      for (const b of this.state.banks) {
        const updated = this.coordinator.getStockSummary(b.id);
        if (updated) this.state.stockSummaries[b.id] = updated;
      }
      this.saveState(this.state);
    }
    return success;
  }

  // Donor Actions
  public toggleDonorAvailability(donorId: string, available: boolean): void {
    const donor = this.state.donors.find(d => d.id === donorId);
    if (donor) {
      donor.available = available;
      this.saveState(this.state);
    }
  }

  public attestDonation(bankId: string, donorId: string): void {
    const donor = this.state.donors.find(d => d.id === donorId);
    if (donor) {
      donor.lastDonationAt = new Date().toISOString();
      donor.donationCount = (donor.donationCount || 0) + 1;
      donor.verified = true;
      donor.reputation = Math.min(100, donor.reputation + 2);

      this.state.auditLogs.unshift({
        id: `audit_attest_${Date.now()}`,
        action: 'DONATION_ATTESTED',
        timestamp: new Date().toISOString(),
        actor: 'user',
        actorId: bankId,
        entityType: 'donor',
        entityId: donorId,
        details: { bankId, newDonationCount: donor.donationCount }
      });

      this.saveState(this.state);
    }
  }

  // Admin Actions
  public approveHospitalOrBank(type: 'hospital' | 'bank', id: string): void {
    if (type === 'hospital') {
      const h = this.state.hospitals.find(item => item.id === id);
      if (h) h.verified = true;
    } else {
      const b = this.state.banks.find(item => item.id === id);
      if (b) b.verified = true;
    }
    this.saveState(this.state);
  }

  public approveFlaggedRequest(requestId: string): Promise<AllocationResult> {
    const req = this.state.requests.find(r => r.id === requestId);
    if (!req) return Promise.resolve({ success: false, status: 'exhausted', requestId, stockRemaining: 0 });

    req.status = 'pending';
    req.timeline.push({
      status: 'pending',
      timestamp: new Date().toISOString(),
      actor: 'system',
      note: 'Admin approved request after identity & license verification.'
    });

    const topBank = req.candidates[0]?.bankId || this.state.banks[0].id;
    const fallbacks = req.candidates.slice(1).map(c => c.bankId);

    return this.coordinator.allocateEmergencyUnits(req, topBank, fallbacks).then(res => {
      this.state.units = this.coordinator.getUnits();
      for (const b of this.state.banks) {
        const updated = this.coordinator.getStockSummary(b.id);
        if (updated) this.state.stockSummaries[b.id] = updated;
      }
      this.saveState(this.state);
      return res;
    });
  }

  // Expiry scheduled job / lazy pass
  public runExpiryCheck(): { expiredCount: number; alerts: ExpiryAlert[] } {
    const { expiredUnitsCount, alerts, updatedStockSummaries } = processUnitsExpiry(
      this.state.units,
      this.state.stockSummaries
    );
    if (expiredUnitsCount > 0) {
      this.state.stockSummaries = updatedStockSummaries;
      this.coordinator.reset(this.state.units, this.state.stockSummaries);
      this.saveState(this.state);
    }
    return { expiredCount: expiredUnitsCount, alerts };
  }

  // Registration & Real Profile Synchronization
  public addOrUpdateDonor(donor: Partial<DonorEntity> & { id: string; name: string; bloodGroup: BloodGroup; phone: string; city: 'Mumbai' | 'Pune' | 'Nagpur' }) {
    const existingIdx = this.state.donors.findIndex(d => d.id === donor.id || d.phone === donor.phone);
    const donorObj: DonorEntity = {
      id: donor.id,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      location: donor.location || { lat: 21.145, lng: 79.088 },
      phone: donor.phone,
      gender: donor.gender || 'Male',
      available: donor.available ?? true,
      verified: donor.verified ?? true,
      lastDonationAt: donor.lastDonationAt || new Date(Date.now() - 95 * 24 * 3600 * 1000).toISOString(),
      totalDonations: donor.totalDonations ?? 1,
      reputation: donor.reputation ?? 95
    };
    if (existingIdx >= 0) {
      this.state.donors[existingIdx] = { ...this.state.donors[existingIdx], ...donorObj };
    } else {
      this.state.donors.unshift(donorObj);
    }
    this.saveState(this.state);
    return donorObj;
  }

  public addOrUpdateHospital(hospital: Partial<HospitalEntity> & { id: string; name: string; city: 'Mumbai' | 'Pune' | 'Nagpur'; emergencyContact: string }) {
    const existingIdx = this.state.hospitals.findIndex(h => h.id === hospital.id || h.name.toLowerCase() === hospital.name.toLowerCase());
    const hospObj: HospitalEntity = {
      id: hospital.id,
      name: hospital.name,
      city: hospital.city,
      location: hospital.location || { lat: 21.140, lng: 79.080 },
      licenseNumber: hospital.licenseNumber || 'HOSP-MAH-2026',
      emergencyContact: hospital.emergencyContact,
      verified: hospital.verified ?? true,
      reputation: hospital.reputation ?? 95
    };
    if (existingIdx >= 0) {
      this.state.hospitals[existingIdx] = { ...this.state.hospitals[existingIdx], ...hospObj };
    } else {
      this.state.hospitals.unshift(hospObj);
    }
    this.saveState(this.state);
    return hospObj;
  }

  public addOrUpdateBank(bank: Partial<BloodBank> & { id: string; name: string; city: 'Mumbai' | 'Pune' | 'Nagpur'; phone: string }) {
    const existingIdx = this.state.banks.findIndex(b => b.id === bank.id || b.name.toLowerCase() === bank.name.toLowerCase());
    const bankObj: BloodBank = {
      id: bank.id,
      name: bank.name,
      city: bank.city,
      location: bank.location || { lat: 21.146, lng: 79.088 },
      address: bank.address || `${bank.city} Regional Center`,
      phone: bank.phone,
      verified: bank.verified ?? true,
      licenseNumber: bank.licenseNumber || 'BB-MH-2026',
      rating: bank.rating ?? 4.8,
      responseRate: bank.responseRate ?? 0.95,
      createdAt: bank.createdAt || new Date().toISOString()
    };
    if (existingIdx >= 0) {
      this.state.banks[existingIdx] = { ...this.state.banks[existingIdx], ...bankObj };
    } else {
      this.state.banks.unshift(bankObj);
      if (!this.state.stockSummaries[bank.id]) {
        this.state.stockSummaries[bank.id] = {
          bankId: bank.id,
          counts: { 'O-': 4, 'O+': 8, 'A-': 5, 'A+': 10, 'B-': 4, 'B+': 12, 'AB-': 3, 'AB+': 6 },
          lastUpdated: new Date().toISOString()
        };
      }
    }
    this.saveState(this.state);
    return bankObj;
  }

  public updateRequestStatus(requestId: string, status: 'allocated' | 'dispatched' | 'completed' | 'cancelled', note?: string) {
    const req = this.state.requests.find(r => r.id === requestId);
    if (!req) return;
    req.status = status;
    req.updatedAt = new Date().toISOString();
    req.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      actor: 'system',
      note: note || `Status transitioned to ${status}`
    });
    this.saveState(this.state);
  }

  public getNearbyDonorsForRequest(req: EmergencyRequest): Array<DonorEntity & { distanceKm: number; etaMinutes: number; maskedPhone: string }> {
    return findEligibleDonors(req.hospitalLocation, req.bloodGroup, this.state.donors);
  }
}

export const bloodService = new BloodService();
