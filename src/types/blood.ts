export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type ComponentType = 'whole' | 'RBC';

export type UnitStatus = 'available' | 'reserved' | 'issued' | 'expired' | 'quarantined' | 'discarded';

export type UrgencyLevel = 'Critical' | 'High' | 'Moderate';

export type RequestStatus = 'pending' | 'allocated' | 'fulfilled' | 'rerouted' | 'cancelled' | 'review_required';

export type UserRole = 'donor' | 'hospital' | 'bank' | 'admin';

export interface GeoLocation {
  lat: number;
  lng: number;
  geohash?: string;
}

export interface BloodBank {
  id: string;
  name: string;
  city: 'Mumbai' | 'Pune' | 'Nagpur' | string;
  location: GeoLocation;
  address: string;
  phone: string;
  verified: boolean;
  licenseNumber: string;
  rating: number;
  responseRate: number; // 0 to 1
  isRaceTarget?: boolean;
  createdAt: string;
}

export interface BloodUnit {
  id: string;
  bankId: string;
  bloodGroup: BloodGroup;
  component: ComponentType;
  collectedAt: string;
  expiresAt: string;
  status: UnitStatus;
  reservedBy?: string; // requestId or hospitalId
  reservationExpiresAt?: string;
  quarantineReason?: string;
  shelfLocation?: string;
}

export interface StockSummary {
  bankId: string;
  bankName: string;
  city: string;
  lastUpdated: string;
  counts: Record<BloodGroup, number>;
}

export interface CandidateBankMatch {
  bankId: string;
  bankName: string;
  city: string;
  distanceKm: number;
  estimatedMinutes: number;
  compatibilityScore: number;
  stockDepth: number;
  fefoUrgencyScore: number;
  bankReliabilityScore: number;
  totalScore: number;
  matchedBloodGroup: BloodGroup;
  availableUnits: number;
  explanation: string;
  etaSource: 'google_routes' | 'haversine_estimate';
}

export interface RequestTimelineEvent {
  status: RequestStatus | string;
  timestamp: string;
  actor: 'hospital' | 'bank' | 'system' | 'device';
  note: string;
}

export interface EmergencyRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  patientRefHash: string; // SHA-256 hash of patient identifier (PII minimization)
  bloodGroup: BloodGroup;
  units: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  idempotencyKey: string;
  hospitalLocation: GeoLocation;
  candidates: CandidateBankMatch[];
  allocatedBankId?: string;
  allocatedUnitIds?: string[];
  timeline: RequestTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  // Risk & fraud checks
  riskScore?: number; // 0 - 100
  fraudFlags?: string[];
  aiFraudSummary?: string;
  fallbackToDonors?: boolean;
}

export interface HospitalEntity {
  id: string;
  name: string;
  city: string;
  location: GeoLocation;
  licenseNumber: string;
  emergencyContact: string;
  verified: boolean;
  reputation: number; // 0 to 100
}

export interface DonorEntity {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: BloodGroup;
  city: string;
  location: GeoLocation;
  phone: string; // Masked when surfaced to third parties
  verified: boolean;
  available: boolean;
  lastDonationAt: string | null;
  donationCount: number;
  reputation: number; // 0 to 100
}

export interface AuditLogEntry {
  id: string;
  action: string;
  timestamp: string;
  actor: 'user' | 'system' | 'device';
  actorId?: string;
  entityType: 'unit' | 'stockSummary' | 'request' | 'donor' | 'bank';
  entityId: string;
  details: Record<string, unknown>;
}

export interface ExpiryAlert {
  unitId: string;
  bankId: string;
  bloodGroup: BloodGroup;
  daysRemaining: number;
  status: 'critical_1_day' | 'warning_3_days' | 'notice_7_days';
  expiresAt: string;
}
