import type { BloodGroup, BloodBank, BloodUnit, StockSummary, CandidateBankMatch, DonorEntity, GeoLocation } from '@/types/blood';
import { getCompatibilityScore, getCompatibleGroupsByPreference } from './compatibility';

export interface RoutingWeightsConfig {
  compatibilityWeight: number; // e.g. 0.35
  distanceWeight: number;      // e.g. 0.25
  fefoUrgencyWeight: number;   // e.g. 0.20
  stockDepthWeight: number;    // e.g. 0.10
  bankResponseWeight: number;  // e.g. 0.10
  maxDistanceThresholdKm: number;
}

export const DEFAULT_ROUTING_CONFIG: RoutingWeightsConfig = {
  compatibilityWeight: 0.35,
  distanceWeight: 0.25,
  fefoUrgencyWeight: 0.20,
  stockDepthWeight: 0.10,
  bankResponseWeight: 0.10,
  maxDistanceThresholdKm: 100, // Search within 100km radius
};

export const DONOR_COOLDOWN_DAYS = {
  male: 90,
  female: 120,
  other: 90,
};

/**
 * Pure Haversine distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Estimate transit time based on distance (assuming urban average 30 km/h)
 */
export function estimateTransitMinutes(distanceKm: number): number {
  const avgSpeedKmH = 35;
  const minutes = (distanceKm / avgSpeedKmH) * 60 + 10; // 10 min dispatch preparation buffer
  return Math.round(minutes);
}

/**
 * Calculate FEFO urgency score (0 - 100)
 * Higher score = expiring sooner (should be dispatched first to prevent wastage)
 */
export function calculateFefoScore(earliestExpiryIso?: string): number {
  if (!earliestExpiryIso) return 50;
  const now = Date.now();
  const expiryTime = new Date(earliestExpiryIso).getTime();
  const hoursUntilExpiry = (expiryTime - now) / (1000 * 3600);

  if (hoursUntilExpiry <= 0) return 0; // Expired, cannot issue
  if (hoursUntilExpiry <= 24) return 100; // Critical 1 day
  if (hoursUntilExpiry <= 72) return 85;  // 3 days
  if (hoursUntilExpiry <= 168) return 70; // 7 days
  if (hoursUntilExpiry <= 360) return 50; // 15 days
  return 30; // Fresh stock
}

/**
 * Multi-factor ranking engine for matching emergency blood requests to Blood Banks
 */
export function rankCandidateBanks(
  hospitalLocation: GeoLocation,
  requestedGroup: BloodGroup,
  requestedUnits: number,
  banks: BloodBank[],
  stockSummaries: Record<string, StockSummary>,
  unitsMapByBank: Record<string, BloodUnit[]>,
  config: RoutingWeightsConfig = DEFAULT_ROUTING_CONFIG
): CandidateBankMatch[] {
  const preferredGroups = getCompatibleGroupsByPreference(requestedGroup);
  const candidates: CandidateBankMatch[] = [];

  for (const bank of banks) {
    const summary = stockSummaries[bank.id];
    if (!summary) continue;

    // Check availability across compatible groups
    let matchedGroup: BloodGroup | null = null;
    let availableCount = 0;

    for (const group of preferredGroups) {
      const count = summary.counts[group] || 0;
      if (count > 0) {
        matchedGroup = group;
        availableCount = count;
        break; // Pick the highest preferred compatible group available
      }
    }

    if (!matchedGroup || availableCount === 0) {
      continue; // No compatible stock in this bank
    }

    // 1. Compatibility Score (Exact = 100, Universal substitute = 75)
    const { score: compatibilityScore, isExact } = getCompatibilityScore(matchedGroup, requestedGroup);

    // 2. Distance & Proximity Score
    const distanceKm = calculateHaversineDistance(
      hospitalLocation.lat,
      hospitalLocation.lng,
      bank.location.lat,
      bank.location.lng
    );

    // Proximity score: 100 at 0km down to 0 at maxDistanceThresholdKm
    const proximityScore = Math.max(0, 100 - (distanceKm / config.maxDistanceThresholdKm) * 100);

    // 3. FEFO Urgency Score
    const bankUnits = unitsMapByBank[bank.id] || [];
    const availableUnitsForGroup = bankUnits
      .filter(u => u.bloodGroup === matchedGroup && u.status === 'available')
      .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

    const earliestExpiry = availableUnitsForGroup[0]?.expiresAt;
    const fefoUrgencyScore = calculateFefoScore(earliestExpiry);

    // 4. Stock Depth Score (Ability to fulfill full request units)
    const stockDepthScore = Math.min(100, (availableCount / Math.max(1, requestedUnits)) * 100);

    // 5. Bank Reliability / Response Score
    const bankReliabilityScore = Math.round((bank.responseRate || 0.9) * 100);

    // Weighted composite score
    const totalScore = Math.round(
      compatibilityScore * config.compatibilityWeight +
      proximityScore * config.distanceWeight +
      fefoUrgencyScore * config.fefoUrgencyWeight +
      stockDepthScore * config.stockDepthWeight +
      bankReliabilityScore * config.bankResponseWeight
    );

    // Generate human-readable explanation
    const reasons: string[] = [];
    if (isExact) {
      reasons.push(`Exact blood match (${matchedGroup})`);
    } else {
      reasons.push(`Compatible red cells (${matchedGroup}) preserving rare universal stock`);
    }
    reasons.push(`${distanceKm} km away (~${estimateTransitMinutes(distanceKm)} min transit)`);
    if (fefoUrgencyScore >= 80) {
      reasons.push(`FEFO priority: unit near expiry horizon`);
    }
    if (availableCount >= requestedUnits) {
      reasons.push(`Full unit fulfillment available (${availableCount} in stock)`);
    } else {
      reasons.push(`Partial fulfillment (${availableCount} of ${requestedUnits} units)`);
    }

    candidates.push({
      bankId: bank.id,
      bankName: bank.name,
      city: bank.city,
      distanceKm,
      estimatedMinutes: estimateTransitMinutes(distanceKm),
      compatibilityScore,
      stockDepth: availableCount,
      fefoUrgencyScore,
      bankReliabilityScore,
      totalScore,
      matchedBloodGroup: matchedGroup,
      availableUnits: availableCount,
      explanation: reasons.join(' • '),
      etaSource: 'haversine_estimate'
    });
  }

  // Sort by totalScore descending
  return candidates.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Filter and rank donors when bank inventory is exhausted
 * Applies ABO/Rh compatibility, cooldown check (90d M, 120d F), and contact masking
 */
export function findEligibleDonors(
  hospitalLocation: GeoLocation,
  requestedGroup: BloodGroup,
  donors: DonorEntity[],
  maxDistanceKm: number = 30
): Array<DonorEntity & { distanceKm: number; etaMinutes: number; maskedPhone: string }> {
  const now = Date.now();
  const DAY_MS = 24 * 3600 * 1000;

  return donors
    .filter(donor => {
      if (!donor.available) return false;
      const { isCompatible } = getCompatibilityScore(donor.bloodGroup, requestedGroup);
      if (!isCompatible) return false;

      // Cooldown rule check
      if (donor.lastDonationAt) {
        const lastDonationTime = new Date(donor.lastDonationAt).getTime();
        const daysSinceLast = (now - lastDonationTime) / DAY_MS;
        const requiredCooldown = DONOR_COOLDOWN_DAYS[donor.gender] || 90;
        if (daysSinceLast < requiredCooldown) {
          return false;
        }
      }
      return true;
    })
    .map(donor => {
      const distanceKm = calculateHaversineDistance(
        hospitalLocation.lat,
        hospitalLocation.lng,
        donor.location.lat,
        donor.location.lng
      );
      // PII masking for donor phone: e.g. +91 98221 11001 -> +91 9822X XXX01
      const maskedPhone = maskPhoneNumber(donor.phone);
      return {
        ...donor,
        distanceKm,
        etaMinutes: estimateTransitMinutes(distanceKm),
        maskedPhone
      };
    })
    .filter(d => d.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return '***-***-****';
  const clean = phone.trim();
  const prefix = clean.slice(0, 7);
  const suffix = clean.slice(-2);
  return `${prefix}***${suffix}`;
}
