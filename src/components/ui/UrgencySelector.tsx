import React from 'react';
import type { UrgencyLevel } from '@/types/blood';
import { AlertOctagon, AlertTriangle, Clock } from 'lucide-react';

interface UrgencySelectorProps {
  value: UrgencyLevel;
  onChange: (level: UrgencyLevel) => void;
  id?: string;
}

export const UrgencySelector: React.FC<UrgencySelectorProps> = ({
  value,
  onChange,
  id = 'urgency-selector'
}) => {
  const levels: { level: UrgencyLevel; icon: any; desc: string }[] = [
    { level: 'Critical', icon: AlertOctagon, desc: 'Immediate (<30m)' },
    { level: 'High', icon: AlertTriangle, desc: 'Urgent (<2h)' },
    { level: 'Moderate', icon: Clock, desc: 'Elective (<6h)' }
  ];

  return (
    <div className="space-y-1.5">
      <span id={`${id}-label`} className="block text-xs font-bold" style={{ color: 'var(--color-navy)' }}>
        Urgency Level (Clinical Triage)
      </span>
      <div 
        role="radiogroup" 
        aria-labelledby={`${id}-label`}
        className="grid grid-cols-1 sm:grid-cols-3 gap-2"
      >
        {levels.map(({ level, icon: Icon, desc }) => {
          const isSelected = value === level;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(level)}
              className="min-h-[44px] p-3 rounded-xl border flex items-center gap-2.5 transition text-left js-focus-ring"
              style={{
                backgroundColor: isSelected ? 'var(--color-surface)' : 'var(--color-bg)',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                borderWidth: isSelected ? '2px' : '1px'
              }}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold"
                style={{
                  backgroundColor: level === 'Critical' ? 'var(--color-danger)' : level === 'High' ? 'var(--color-warning-fill)' : 'var(--color-success-fill)',
                  color: level === 'High' ? 'var(--color-navy)' : '#FFFFFF'
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--color-navy)' }}>{level}</p>
                <p className="text-[11px] opacity-75" style={{ color: 'var(--color-navy)' }}>{desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
