export interface DonorEligibilityAnswers {
  age: number;
  weightKg: number;
  gender: 'male' | 'female' | 'other';
  lastDonationDate?: string | null;
  hasRecentTattooOrPiercing: boolean; // within 6 months
  hasMajorSurgery: boolean;           // within 6 months
  hasActiveInfectionOrFever: boolean;
  isTakingAntibiotics: boolean;
  isPregnantOrLactating?: boolean;
}

export interface EligibilityResult {
  isEligible: boolean;
  daysRemainingInCooldown: number;
  reasons: string[];
}

export const ELIGIBILITY_RULES = {
  minAge: 18,
  maxAge: 65,
  minWeightKg: 50,
  maleCooldownDays: 90,
  femaleCooldownDays: 120,
};

/**
 * Pure rule-based donor eligibility check
 */
export function checkDonorEligibility(answers: DonorEligibilityAnswers): EligibilityResult {
  const reasons: string[] = [];
  let daysRemainingInCooldown = 0;

  // 1. Age check
  if (answers.age < ELIGIBILITY_RULES.minAge) {
    reasons.push(`Minimum donor age is ${ELIGIBILITY_RULES.minAge} years (current: ${answers.age}).`);
  } else if (answers.age > ELIGIBILITY_RULES.maxAge) {
    reasons.push(`Maximum donor age for regular donation is ${ELIGIBILITY_RULES.maxAge} years (current: ${answers.age}).`);
  }

  // 2. Weight check
  if (answers.weightKg < ELIGIBILITY_RULES.minWeightKg) {
    reasons.push(`Minimum body weight required is ${ELIGIBILITY_RULES.minWeightKg} kg (current: ${answers.weightKg} kg).`);
  }

  // 3. Clinical screening
  if (answers.hasActiveInfectionOrFever) {
    reasons.push('Active fever or infection detected; must be symptom-free for 14 days.');
  }
  if (answers.isTakingAntibiotics) {
    reasons.push('Currently on antibiotic therapy; defer until 7 days post-treatment.');
  }
  if (answers.hasRecentTattooOrPiercing) {
    reasons.push('Tattoo or body piercing within past 6 months requires statutory deferral.');
  }
  if (answers.hasMajorSurgery) {
    reasons.push('Major surgical procedure within past 6 months requires physician clearance.');
  }
  if (answers.gender === 'female' && answers.isPregnantOrLactating) {
    reasons.push('Temporary deferral during pregnancy and lactation period.');
  }

  // 4. Donation Interval Cooldown
  if (answers.lastDonationDate) {
    const lastTime = new Date(answers.lastDonationDate).getTime();
    const daysSince = Math.floor((Date.now() - lastTime) / (1000 * 3600 * 24));
    const requiredDays = answers.gender === 'female'
      ? ELIGIBILITY_RULES.femaleCooldownDays
      : ELIGIBILITY_RULES.maleCooldownDays;

    if (daysSince < requiredDays) {
      daysRemainingInCooldown = requiredDays - daysSince;
      reasons.push(`Statutory interval not reached: ${daysRemainingInCooldown} days remaining until eligible (required: ${requiredDays} days).`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    daysRemainingInCooldown,
    reasons
  };
}
