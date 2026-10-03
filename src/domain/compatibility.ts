import type { BloodGroup } from '@/types/blood';

/**
 * Complete ABO & Rh Red Blood Cell Compatibility Matrix
 * Key: Recipient Blood Group
 * Value: Array of compatible Donor Blood Groups
 */
export const RBC_COMPATIBILITY_TABLE: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

/**
 * Check if a donor's blood group is red-cell compatible with the recipient.
 */
export function isRbcCompatible(donor: BloodGroup, recipient: BloodGroup): boolean {
  const allowed = RBC_COMPATIBILITY_TABLE[recipient];
  return allowed ? allowed.includes(donor) : false;
}

/**
 * Compatibility score calculation:
 * - Incompatible: 0
 * - Exact Match: 100 (Preserves universal stock like O-)
 * - Compatible Alternative: 75 (e.g., O- given to A+, acceptable but penalized to preserve O-)
 */
export function getCompatibilityScore(donor: BloodGroup, recipient: BloodGroup): { score: number; isExact: boolean; isCompatible: boolean } {
  if (!isRbcCompatible(donor, recipient)) {
    return { score: 0, isExact: false, isCompatible: false };
  }
  if (donor === recipient) {
    return { score: 100, isExact: true, isCompatible: true };
  }
  // Universal or cross-compatible donor, but not exact
  // If recipient is not O- but receiving O-, score is 75 to prioritize exact match first
  return { score: 75, isExact: false, isCompatible: true };
}

/**
 * Returns all compatible blood groups ordered by preference (Exact match first, then alternatives)
 */
export function getCompatibleGroupsByPreference(recipient: BloodGroup): BloodGroup[] {
  const allowed = [...(RBC_COMPATIBILITY_TABLE[recipient] || [])];
  // Sort so recipient's exact group is first
  return allowed.sort((a, b) => {
    if (a === recipient) return -1;
    if (b === recipient) return 1;
    // Keep O- as last fallback if recipient is not O-
    if (a === 'O-') return 1;
    if (b === 'O-') return -1;
    return 0;
  });
}
