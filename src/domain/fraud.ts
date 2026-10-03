import type { BloodGroup, UrgencyLevel } from '@/types/blood';

export interface RequestRiskAssessment {
  riskScore: number; // 0 - 100
  isFlagged: boolean;
  flags: string[];
  explanation: string;
  recommendation: 'auto_approve' | 'admin_review' | 'reject';
}

export interface EmergencyRequestInput {
  hospitalId: string;
  isHospitalVerified: boolean;
  hospitalReputation: number;
  patientRef: string;
  bloodGroup: BloodGroup;
  units: number;
  urgency: UrgencyLevel;
  distanceToHospitalKm?: number;
  recentRequestsInWindow?: number;
}

/**
 * Deterministic hash of (patientRef + bloodGroup + hospitalId + timeWindow)
 * Uses native subtle crypto or fast hashing for duplicate detection
 */
export async function computeRequestDeduplicationHash(
  patientRef: string,
  bloodGroup: BloodGroup,
  hospitalId: string,
  windowMinutes: number = 30
): Promise<string> {
  const windowBucket = Math.floor(Date.now() / (windowMinutes * 60 * 1000));
  const normalized = `${patientRef.trim().toUpperCase()}|${bloodGroup}|${hospitalId}|${windowBucket}`;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for non-subtle crypto environments
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Pure Rule-Based Request Risk Engine
 */
export function assessRequestRisk(input: EmergencyRequestInput): RequestRiskAssessment {
  let score = 0;
  const flags: string[] = [];
  const reasons: string[] = [];

  // Rule 1: Hospital verification
  if (!input.isHospitalVerified) {
    score += 45;
    flags.push('UNVERIFIED_HOSPITAL');
    reasons.push('Hospital account has not completed official health regulatory license verification.');
  }

  // Rule 2: Low hospital reputation
  if (input.hospitalReputation < 80) {
    score += 20;
    flags.push('LOW_REPUTATION_TIER');
    reasons.push(`Hospital historical reliability rating is below standard (${input.hospitalReputation}%).`);
  }

  // Rule 3: Velocity check (burst requests)
  if ((input.recentRequestsInWindow || 0) >= 3) {
    score += 35;
    flags.push('HIGH_VELOCITY_BURST');
    reasons.push(`Velocity spike detected: ${input.recentRequestsInWindow} requests logged within 10 minutes.`);
  }

  // Rule 4: High volume request for scarce/negative blood groups
  const isRareGroup = ['O-', 'A-', 'B-', 'AB-'].includes(input.bloodGroup);
  if (isRareGroup && input.units > 3) {
    score += 30;
    flags.push('ANOMALOUS_QUANTITY_RARE_GROUP');
    reasons.push(`Unusually large volume requested (${input.units} units) for rare negative group ${input.bloodGroup}.`);
  } else if (input.units > 8) {
    score += 25;
    flags.push('HIGH_VOLUME_BATCH');
    reasons.push(`Request exceeds single-patient standard emergency protocol threshold (${input.units} units).`);
  }

  // Rule 5: Geographic anomaly
  if (input.distanceToHospitalKm && input.distanceToHospitalKm > 150) {
    score += 25;
    flags.push('GEO_MISMATCH');
    reasons.push(`Geographical anomaly: dispatch coordinates are ${input.distanceToHospitalKm}km away from registered facility.`);
  }

  const finalScore = Math.min(100, score);
  const isFlagged = finalScore >= 50;
  const recommendation = finalScore >= 70 ? 'admin_review' : finalScore >= 50 ? 'admin_review' : 'auto_approve';

  const explanation = reasons.length > 0
    ? reasons.join(' ')
    : 'All cryptographic, velocity, and institutional authenticity criteria satisfied.';

  return {
    riskScore: finalScore,
    isFlagged,
    flags,
    explanation,
    recommendation
  };
}

/**
 * In-Memory Request Velocity Tracker
 */
export class RequestVelocityTracker {
  private requestsByHospital: Map<string, number[]> = new Map();

  public recordRequest(hospitalId: string): number {
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const history = (this.requestsByHospital.get(hospitalId) || []).filter(ts => ts > tenMinutesAgo);
    history.push(now);
    this.requestsByHospital.set(hospitalId, history);
    return history.length;
  }

  public getCount(hospitalId: string): number {
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const history = (this.requestsByHospital.get(hospitalId) || []).filter(ts => ts > tenMinutesAgo);
    return history.length;
  }

  public clear(): void {
    this.requestsByHospital.clear();
  }
}
