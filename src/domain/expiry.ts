import type { BloodUnit, ExpiryAlert, StockSummary } from '@/types/blood';

/**
 * Classifies unit expiry horizon into 1 day, 3 days, 7 days, or expired
 */
export function classifyUnitExpiry(unit: BloodUnit, referenceTime: number = Date.now()): ExpiryAlert | null {
  const expiryTime = new Date(unit.expiresAt).getTime();
  const diffHours = (expiryTime - referenceTime) / (1000 * 3600);

  if (diffHours <= 0) {
    return {
      unitId: unit.id,
      bankId: unit.bankId,
      bloodGroup: unit.bloodGroup,
      daysRemaining: 0,
      status: 'critical_1_day',
      expiresAt: unit.expiresAt
    };
  }

  const daysRemaining = Math.ceil(diffHours / 24);

  if (daysRemaining <= 1) {
    return {
      unitId: unit.id,
      bankId: unit.bankId,
      bloodGroup: unit.bloodGroup,
      daysRemaining: 1,
      status: 'critical_1_day',
      expiresAt: unit.expiresAt
    };
  }

  if (daysRemaining <= 3) {
    return {
      unitId: unit.id,
      bankId: unit.bankId,
      bloodGroup: unit.bloodGroup,
      daysRemaining: 3,
      status: 'warning_3_days',
      expiresAt: unit.expiresAt
    };
  }

  if (daysRemaining <= 7) {
    return {
      unitId: unit.id,
      bankId: unit.bankId,
      bloodGroup: unit.bloodGroup,
      daysRemaining: 7,
      status: 'notice_7_days',
      expiresAt: unit.expiresAt
    };
  }

  return null;
}

/**
 * Lazy or scheduled pass over units to mark expired units and update stockSummary
 */
export function processUnitsExpiry(
  units: BloodUnit[],
  stockSummaries: Record<string, StockSummary>,
  referenceTime: number = Date.now()
): {
  expiredUnitsCount: number;
  alerts: ExpiryAlert[];
  updatedStockSummaries: Record<string, StockSummary>;
} {
  let expiredUnitsCount = 0;
  const alerts: ExpiryAlert[] = [];
  const updatedStock = JSON.parse(JSON.stringify(stockSummaries)) as Record<string, StockSummary>;

  for (const unit of units) {
    if (unit.status !== 'available') continue;

    const alert = classifyUnitExpiry(unit, referenceTime);
    if (alert) {
      alerts.push(alert);
      if (alert.daysRemaining <= 0) {
        // Mark expired
        unit.status = 'expired';
        expiredUnitsCount++;
        const bankSummary = updatedStock[unit.bankId];
        if (bankSummary && bankSummary.counts[unit.bloodGroup] > 0) {
          bankSummary.counts[unit.bloodGroup]--;
          bankSummary.lastUpdated = new Date(referenceTime).toISOString();
        }
      }
    }
  }

  return {
    expiredUnitsCount,
    alerts,
    updatedStockSummaries: updatedStock
  };
}
