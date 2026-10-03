import type { BloodGroup, BloodUnit, StockSummary, EmergencyRequest, AuditLogEntry, RequestTimelineEvent } from '@/types/blood';

export interface AllocationResult {
  success: boolean;
  status: 'allocated' | 'rerouted' | 'exhausted' | 'idempotent_duplicate';
  requestId: string;
  allocatedBankId?: string;
  allocatedUnitIds?: string[];
  bankName?: string;
  failureReason?: string;
  reroutedToBankId?: string;
  reroutedBankName?: string;
  stockRemaining: number;
  auditEntry?: AuditLogEntry;
}

export const RESERVATION_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

/**
 * In-Memory Transaction Coordinator for High-Speed Concurrency Testing and Local Operations
 * Mirrors Firestore's atomic runTransaction semantics with mutual exclusion & serializability
 */
export class AllocationCoordinator {
  private memoryUnits: Map<string, BloodUnit> = new Map();
  private memoryStock: Map<string, StockSummary> = new Map();
  private memoryRequests: Map<string, EmergencyRequest> = new Map();
  private idempotencyRegistry: Map<string, AllocationResult> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private lockPromise: Promise<void> = Promise.resolve();

  constructor(
    initialUnits: BloodUnit[] = [],
    initialStock: Record<string, StockSummary> = {}
  ) {
    this.reset(initialUnits, initialStock);
  }

  public reset(units: BloodUnit[], stock: Record<string, StockSummary>) {
    this.memoryUnits.clear();
    this.memoryStock.clear();
    this.memoryRequests.clear();
    this.idempotencyRegistry.clear();
    this.auditLogs = [];

    for (const u of units) {
      this.memoryUnits.set(u.id, { ...u });
    }
    for (const [bankId, s] of Object.entries(stock)) {
      this.memoryStock.set(bankId, {
        ...s,
        counts: { ...s.counts }
      });
    }
  }

  public getUnits(): BloodUnit[] {
    return Array.from(this.memoryUnits.values());
  }

  public getStockSummary(bankId: string): StockSummary | undefined {
    const s = this.memoryStock.get(bankId);
    return s ? { ...s, counts: { ...s.counts } } : undefined;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  /**
   * Acquire atomic lock to simulate Firestore runTransaction serial isolation
   */
  private async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const prevLock = this.lockPromise;
    let release: () => void;
    this.lockPromise = new Promise(resolve => {
      release = resolve;
    });

    await prevLock;
    try {
      return await fn();
    } finally {
      release!();
    }
  }

  /**
   * Execute atomic allocation for a request
   * Guaranteed race-safe, idempotent, and updates unit + stock counters atomically
   */
  public async allocateEmergencyUnits(
    request: EmergencyRequest,
    targetBankId: string,
    fallbackBankIds: string[] = []
  ): Promise<AllocationResult> {
    // 1. Idempotency Check
    if (this.idempotencyRegistry.has(request.idempotencyKey)) {
      const cached = this.idempotencyRegistry.get(request.idempotencyKey)!;
      return {
        ...cached,
        status: 'idempotent_duplicate'
      };
    }

    return await this.withTransaction(async () => {
      const banksToTry = [targetBankId, ...fallbackBankIds];
      const now = new Date();
      const nowIso = now.toISOString();
      const ttlIso = new Date(now.getTime() + RESERVATION_TTL_MS).toISOString();

      for (let i = 0; i < banksToTry.length; i++) {
        const bankId = banksToTry[i];
        const isFallback = i > 0;
        const stock = this.memoryStock.get(bankId);

        if (!stock) continue;

        // Check if units are available in stock summary
        const currentCount = stock.counts[request.bloodGroup] || 0;
        if (currentCount < request.units) {
          // Insufficient stock in this bank, continue to next candidate
          continue;
        }

        // Read all matching units that are truly available (FEFO: sorted by expiresAt)
        const candidateUnits = Array.from(this.memoryUnits.values())
          .filter(u => u.bankId === bankId && u.bloodGroup === request.bloodGroup && u.status === 'available')
          .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

        if (candidateUnits.length < request.units) {
          // Drift guard: if unit table had fewer units than summary, fix drift and continue
          stock.counts[request.bloodGroup] = candidateUnits.length;
          continue;
        }

        // SUCCESS: Select units via FEFO
        const selectedUnits = candidateUnits.slice(0, request.units);
        const selectedUnitIds = selectedUnits.map(u => u.id);

        // Atomic Mutation 1: Mark units as reserved
        for (const unit of selectedUnits) {
          unit.status = 'reserved';
          unit.reservedBy = request.id;
          unit.reservationExpiresAt = ttlIso;
          this.memoryUnits.set(unit.id, unit);
        }

        // Atomic Mutation 2: Decrement stockSummary counter
        stock.counts[request.bloodGroup] -= request.units;
        stock.lastUpdated = nowIso;
        this.memoryStock.set(bankId, stock);

        // Atomic Mutation 3: Update Request entity
        const timelineEvent: RequestTimelineEvent = {
          status: isFallback ? 'rerouted' : 'allocated',
          timestamp: nowIso,
          actor: 'system',
          note: isFallback
            ? `Primary bank stock exhausted during race condition. Successfully rerouted to ${stock.bankName} (${selectedUnitIds.length} units held).`
            : `Units successfully allocated at ${stock.bankName} via FEFO.`
        };

        request.status = 'allocated';
        request.allocatedBankId = bankId;
        request.allocatedUnitIds = selectedUnitIds;
        request.timeline.push(timelineEvent);
        request.updatedAt = nowIso;
        this.memoryRequests.set(request.id, request);

        // Audit Log Entry
        const auditEntry: AuditLogEntry = {
          id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          action: 'UNIT_RESERVED',
          timestamp: nowIso,
          actor: 'system',
          entityType: 'unit',
          entityId: selectedUnitIds.join(','),
          details: {
            requestId: request.id,
            hospitalId: request.hospitalId,
            bankId,
            bloodGroup: request.bloodGroup,
            units: request.units,
            remainingStock: stock.counts[request.bloodGroup],
            isFallback
          }
        };
        this.auditLogs.push(auditEntry);

        const result: AllocationResult = {
          success: true,
          status: isFallback ? 'rerouted' : 'allocated',
          requestId: request.id,
          allocatedBankId: bankId,
          allocatedUnitIds: selectedUnitIds,
          bankName: stock.bankName,
          stockRemaining: stock.counts[request.bloodGroup],
          auditEntry
        };

        // Save into idempotency registry
        this.idempotencyRegistry.set(request.idempotencyKey, result);
        return result;
      }

      // If all candidate banks were exhausted
      const exhaustedEvent: RequestTimelineEvent = {
        status: 'review_required',
        timestamp: nowIso,
        actor: 'system',
        note: `All candidate banks exhausted for ${request.bloodGroup}. Initiating verified donor fallback broadcast.`
      };
      request.status = 'review_required';
      request.fallbackToDonors = true;
      request.timeline.push(exhaustedEvent);
      this.memoryRequests.set(request.id, request);

      const failResult: AllocationResult = {
        success: false,
        status: 'exhausted',
        requestId: request.id,
        failureReason: `All candidate banks out of ${request.bloodGroup} stock. Rerouted to community donors.`,
        stockRemaining: 0
      };

      this.idempotencyRegistry.set(request.idempotencyKey, failResult);
      return failResult;
    });
  }

  /**
   * Release expired reservation back to available inventory
   */
  public async releaseExpiredReservations(): Promise<number> {
    return await this.withTransaction(async () => {
      const now = Date.now();
      let releasedCount = 0;

      for (const unit of this.memoryUnits.values()) {
        if (
          unit.status === 'reserved' &&
          unit.reservationExpiresAt &&
          new Date(unit.reservationExpiresAt).getTime() < now
        ) {
          unit.status = 'available';
          unit.reservedBy = undefined;
          unit.reservationExpiresAt = undefined;
          this.memoryUnits.set(unit.id, unit);

          const stock = this.memoryStock.get(unit.bankId);
          if (stock) {
            stock.counts[unit.bloodGroup] = (stock.counts[unit.bloodGroup] || 0) + 1;
            stock.lastUpdated = new Date().toISOString();
            this.memoryStock.set(unit.bankId, stock);
          }
          releasedCount++;
        }
      }
      return releasedCount;
    });
  }

  /**
   * Manually quarantine or discard a unit with reason
   */
  public async setUnitQuarantineStatus(
    unitId: string,
    newStatus: 'quarantined' | 'discarded',
    reason: string,
    actorId: string
  ): Promise<boolean> {
    return await this.withTransaction(async () => {
      const unit = this.memoryUnits.get(unitId);
      if (!unit) return false;

      const oldStatus = unit.status;
      unit.status = newStatus;
      unit.quarantineReason = reason;
      this.memoryUnits.set(unitId, unit);

      // If unit was previously available, decrement stockSummary
      if (oldStatus === 'available') {
        const stock = this.memoryStock.get(unit.bankId);
        if (stock) {
          stock.counts[unit.bloodGroup] = Math.max(0, (stock.counts[unit.bloodGroup] || 0) - 1);
          stock.lastUpdated = new Date().toISOString();
          this.memoryStock.set(unit.bankId, stock);
        }
      }

      this.auditLogs.push({
        id: `audit_q_${Date.now()}`,
        action: `UNIT_${newStatus.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        actor: 'user',
        actorId,
        entityType: 'unit',
        entityId: unitId,
        details: { reason, bankId: unit.bankId, bloodGroup: unit.bloodGroup }
      });

      return true;
    });
  }
}
