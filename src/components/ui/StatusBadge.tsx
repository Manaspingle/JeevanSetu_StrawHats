import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Clock, XCircle } from 'lucide-react';

export type BloodStatus = 'available' | 'low' | 'critical' | 'expiring' | 'quarantined' | 'expired';

interface StatusBadgeProps {
  status: BloodStatus;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  switch (status) {
    case 'available':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${className}`}
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-success-text)',
            borderColor: 'var(--color-success-fill)'
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label || 'Available'}</span>
        </span>
      );

    case 'low':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${className}`}
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-warning-text)',
            borderColor: 'var(--color-warning-fill)'
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label || 'Low Stock'}</span>
        </span>
      );

    case 'critical':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${className}`}
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-danger)',
            borderColor: 'var(--color-danger)'
          }}
        >
          <AlertOctagon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label || 'Critical'}</span>
        </span>
      );

    case 'expiring':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${className}`}
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-warning-text)',
            borderColor: 'var(--color-warning-fill)'
          }}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label || 'Expiring in ≤3d'}</span>
        </span>
      );

    case 'quarantined':
    case 'expired':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${className}`}
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-danger)',
            borderColor: 'var(--color-danger)'
          }}
        >
          <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label || (status === 'quarantined' ? 'Quarantined' : 'Expired')}</span>
        </span>
      );

    default:
      return null;
  }
};
