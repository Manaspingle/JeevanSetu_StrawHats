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

export interface DonorRegistration {
  id: string;
  donorId: string;
  rfidUid: string;
  aadhaarNumber: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  weightKg: number;
  bloodGroup: BloodGroup;
  city: 'Nagpur' | 'Mumbai' | 'Pune';
  phone: string;
  email: string;
  lastDonationDate: string | null;
  isEligible: boolean;
  eligibleQuantity: string;
  daysCooldown: number;
  cooldownPeriodMonths: number;
  ineligibilityReason?: string;
  medicalConditions: string;
  points: number;
  donorLevel: string;
  status: 'registered' | 'contacted' | 'arrived' | 'verified_at_hospital' | 'completed';
  createdAt: string;
}

export interface PeerHospitalRequest {
  id: string;
  fromHospitalId: string;
  fromHospitalName: string;
  fromCity: 'Nagpur' | 'Mumbai' | 'Pune';
  toHospitalId: string;
  toHospitalName: string;
  toCity: 'Nagpur' | 'Mumbai' | 'Pune';
  category: 'blood' | 'organ';
  item: string;
  units: number;
  urgency: 'Critical' | 'Urgent' | 'Standard';
  patientRef: string;
  reason: string;
  status: 'requested' | 'approved' | 'dispatched' | 'received' | 'declined';
  createdAt: string;
  updatedAt: string;
}

interface JeevanSetuState {
  banks: BloodBank[];
  hospitals: HospitalEntity[];
  donors: DonorEntity[];
  units: BloodUnit[];
  stockSummaries: Record<string, StockSummary>;
  requests: EmergencyRequest[];
  donorRegistrations: DonorRegistration[];
  peerHospitalRequests: PeerHospitalRequest[];
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
          const parsed = JSON.parse(saved);
          if (!parsed.donorRegistrations || parsed.donorRegistrations.length === 0) {
            parsed.donorRegistrations = this.getSeedDonorRegistrations();
          }
          if (!parsed.peerHospitalRequests || parsed.peerHospitalRequests.length === 0) {
            parsed.peerHospitalRequests = this.getSeedPeerHospitalRequests();
          }
          return parsed;
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
      donorRegistrations: this.getSeedDonorRegistrations(),
      peerHospitalRequests: this.getSeedPeerHospitalRequests(),
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

  private getSeedDonorRegistrations(): DonorRegistration[] {
    return [
      {
        id: 'reg_nagpur_01',
        donorId: 'JS-DON-94821',
        rfidUid: 'A4:8B:2F:10',
        aadhaarNumber: 'XXXX-XXXX-8421',
        fullName: 'Rahul Sharma',
        gender: 'Male',
        age: 27,
        weightKg: 68,
        bloodGroup: 'O+',
        city: 'Nagpur',
        phone: '+91 98230 45678',
        email: 'rahul.sharma@example.com',
        lastDonationDate: new Date(Date.now() - 110 * 24 * 3600 * 1000).toISOString().split('T')[0],
        isEligible: true,
        eligibleQuantity: '450 ml',
        daysCooldown: 0,
        cooldownPeriodMonths: 3,
        medicalConditions: 'Healthy, no surgery or recent tattoos',
        points: 250,
        donorLevel: 'Silver Guardian',
        status: 'registered',
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'reg_mumbai_02',
        donorId: 'JS-DON-58219',
        rfidUid: '7B:3E:91:A2',
        aadhaarNumber: 'XXXX-XXXX-9912',
        fullName: 'Sneha Patil',
        gender: 'Female',
        age: 24,
        weightKg: 54,
        bloodGroup: 'B+',
        city: 'Mumbai',
        phone: '+91 97654 32109',
        email: 'sneha.patil@example.com',
        lastDonationDate: new Date(Date.now() - 140 * 24 * 3600 * 1000).toISOString().split('T')[0],
        isEligible: true,
        eligibleQuantity: '350 ml',
        daysCooldown: 0,
        cooldownPeriodMonths: 4,
        medicalConditions: 'Normal vitals, eligible for whole blood donation',
        points: 400,
        donorLevel: 'Gold Lifesaver',
        status: 'contacted',
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'reg_pune_03',
        donorId: 'JS-DON-31804',
        rfidUid: '5C:1D:8E:44',
        aadhaarNumber: 'XXXX-XXXX-3345',
        fullName: 'Amit Verma',
        gender: 'Male',
        age: 31,
        weightKg: 72,
        bloodGroup: 'A-',
        city: 'Pune',
        phone: '+91 98901 23456',
        email: 'amit.verma@example.com',
        lastDonationDate: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
        isEligible: false,
        eligibleQuantity: '450 ml',
        daysCooldown: 65,
        cooldownPeriodMonths: 3,
        ineligibilityReason: 'Men must wait 3 months (90 days) between blood donations. 65 days remaining in cooldown.',
        medicalConditions: 'Healthy, active cooldown',
        points: 150,
        donorLevel: 'Bronze Donor',
        status: 'registered',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'reg_nagpur_04',
        donorId: 'JS-DON-77312',
        rfidUid: '9D:4A:2C:77',
        aadhaarNumber: 'XXXX-XXXX-6789',
        fullName: 'Priya Deshmukh',
        gender: 'Female',
        age: 29,
        weightKg: 58,
        bloodGroup: 'AB+',
        city: 'Nagpur',
        phone: '+91 94221 87654',
        email: 'priya.deshmukh@example.com',
        lastDonationDate: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString().split('T')[0],
        isEligible: false,
        eligibleQuantity: '350 ml',
        daysCooldown: 80,
        cooldownPeriodMonths: 4,
        ineligibilityReason: 'Women must wait 4 months (120 days) between blood donations. 80 days remaining in cooldown.',
        medicalConditions: 'Normal vitals, active cooldown',
        points: 100,
        donorLevel: 'Bronze Donor',
        status: 'registered',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
      }
    ];
  }

  private getSeedPeerHospitalRequests(): PeerHospitalRequest[] {
    return [
      {
        id: 'peer_req_01',
        fromHospitalId: 'hosp_nagpur_aiims',
        fromHospitalName: 'AIIMS Nagpur Super Specialty',
        fromCity: 'Nagpur',
        toHospitalId: 'hosp_nagpur_alexis',
        toHospitalName: 'Alexis Multispecialty Hospital',
        toCity: 'Nagpur',
        category: 'blood',
        item: 'PRBC B+ (Packed Red Blood Cells)',
        units: 3,
        urgency: 'Critical',
        patientRef: 'PAT-TRAUMA-991',
        reason: 'Multiple vehicle collision victim requiring urgent crossmatched transfusion.',
        status: 'dispatched',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      },
      {
        id: 'peer_req_02',
        fromHospitalId: 'hosp_mumbai_kem',
        fromHospitalName: 'KEM Hospital & Research Center',
        fromCity: 'Mumbai',
        toHospitalId: 'hosp_mumbai_lilavati',
        toHospitalName: 'Lilavati Hospital & Research Centre',
        toCity: 'Mumbai',
        category: 'organ',
        item: 'Kidney (Organ Transplant)',
        units: 1,
        urgency: 'Critical',
        patientRef: 'PAT-TX-8402',
        reason: 'NOTTO-approved organ sharing protocol for brain-stem donor compatibility.',
        status: 'approved',
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: 'peer_req_03',
        fromHospitalId: 'hosp_pune_ruby',
        fromHospitalName: 'Ruby Hall Clinic',
        fromCity: 'Pune',
        toHospitalId: 'hosp_pune_sassoon',
        toHospitalName: 'Sassoon General Hospital',
        toCity: 'Pune',
        category: 'blood',
        item: 'Platelets (Apheresis Unit) O-',
        units: 4,
        urgency: 'Urgent',
        patientRef: 'PAT-ONCO-412',
        reason: 'Dengue hemorrhagic / leukemia support protocol.',
        status: 'requested',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      }
    ];
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

  // --- Real-time Donor Registrations ---
  public getDonorRegistrations(): DonorRegistration[] {
    return this.state.donorRegistrations || [];
  }

  public addDonorRegistration(reg: Omit<DonorRegistration, 'id' | 'createdAt'> & { id?: string }): DonorRegistration {
    const id = reg.id || `reg_${Date.now()}`;
    const newReg: DonorRegistration = {
      ...reg,
      id,
      createdAt: new Date().toISOString()
    };
    if (!this.state.donorRegistrations) {
      this.state.donorRegistrations = [];
    }
    this.state.donorRegistrations.unshift(newReg);

    // Also register or update in donor directory
    this.addOrUpdateDonor({
      id: newReg.id,
      name: newReg.fullName,
      bloodGroup: newReg.bloodGroup,
      city: newReg.city,
      phone: newReg.phone,
      gender: newReg.gender,
      available: newReg.isEligible,
      verified: true
    });

    this.saveState(this.state);
    return newReg;
  }

  public updateDonorRegistration(id: string, updates: Partial<DonorRegistration>): void {
    if (!this.state.donorRegistrations) return;
    const idx = this.state.donorRegistrations.findIndex(r => r.id === id || r.donorId === id);
    if (idx >= 0) {
      this.state.donorRegistrations[idx] = {
        ...this.state.donorRegistrations[idx],
        ...updates
      };
      this.saveState(this.state);
    }
  }

  // --- Real-time Peer-to-Peer Inter-Hospital Requests ---
  public getPeerHospitalRequests(): PeerHospitalRequest[] {
    return this.state.peerHospitalRequests || [];
  }

  public createPeerHospitalRequest(req: Omit<PeerHospitalRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): PeerHospitalRequest {
    const id = `peer_req_${Date.now()}`;
    const newReq: PeerHospitalRequest = {
      ...req,
      id,
      status: 'requested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!this.state.peerHospitalRequests) {
      this.state.peerHospitalRequests = [];
    }
    this.state.peerHospitalRequests.unshift(newReq);
    this.saveState(this.state);
    return newReq;
  }

  public updatePeerHospitalRequest(id: string, status: PeerHospitalRequest['status'], note?: string): void {
    if (!this.state.peerHospitalRequests) return;
    const req = this.state.peerHospitalRequests.find(r => r.id === id);
    if (!req) return;
    req.status = status;
    req.updatedAt = new Date().toISOString();
    this.saveState(this.state);
  }

  // --- Hardware IoT RFID Verifier Simulator / Logic ---
  public verifyHardwareRfid(rfidInput: string): {
    success: boolean;
    authorized: boolean;
    donor?: DonorRegistration;
    message: string;
    oledLines: string[];
  } {
    const cleanRfid = rfidInput.trim().toUpperCase();
    const donor = (this.state.donorRegistrations || []).find(
      d => d.rfidUid.toUpperCase() === cleanRfid || 
           d.donorId.toUpperCase() === cleanRfid ||
           d.aadhaarNumber.includes(cleanRfid)
    );

    if (!donor) {
      return {
        success: false,
        authorized: false,
        message: 'RFID Card not registered in JeevanSetu database. Access Denied.',
        oledLines: [
          'STATUS: ACCESS DENIED',
          'NOT REGISTERED',
          'Scan Authorized Card',
          'Emergency Hotline: 108'
        ]
      };
    }

    if (!donor.isEligible || donor.daysCooldown > 0) {
      return {
        success: false,
        authorized: false,
        donor,
        message: `Donor ${donor.fullName} is currently in statutory cooldown (${donor.daysCooldown} days remaining).`,
        oledLines: [
          'STATUS: COOLDOWN ACTIVE',
          `Donor: ${donor.fullName.slice(0, 16)}`,
          `Days Left: ${donor.daysCooldown} Days`,
          `Rule: ${donor.gender === 'Female' ? '4 Mo (120d)' : '3 Mo (90d)'}`
        ]
      };
    }

    // Mark as arrived & verified at hospital
    this.updateDonorRegistration(donor.id, { status: 'verified_at_hospital' });

    return {
      success: true,
      authorized: true,
      donor,
      message: `Verified: ${donor.fullName} (${donor.bloodGroup}) is authorized & eligible to donate ${donor.eligibleQuantity}!`,
      oledLines: [
        '** VERIFIED DONOR **',
        `Name: ${donor.fullName.slice(0, 16)}`,
        `Blood: ${donor.bloodGroup} | ${donor.eligibleQuantity}`,
        `Last Don: ${donor.lastDonationDate || 'First Time'}`
      ]
    };
  }
}

export const bloodService = new BloodService();
