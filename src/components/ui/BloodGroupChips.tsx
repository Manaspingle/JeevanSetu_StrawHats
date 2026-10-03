import React from 'react';
import type { BloodGroup } from '@/types/blood';

const ALL_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

interface BloodGroupChipsProps {
  value: BloodGroup;
  onChange: (group: BloodGroup) => void;
  label?: string;
  id?: string;
}

export const BloodGroupChips: React.FC<BloodGroupChipsProps> = ({
  value,
  onChange,
  label = 'Select Required Blood Group',
  id = 'blood-group-radiogroup'
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (index + 1) % ALL_GROUPS.length;
      onChange(ALL_GROUPS[next]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (index - 1 + ALL_GROUPS.length) % ALL_GROUPS.length;
      onChange(ALL_GROUPS[prev]);
    }
  };

  return (
    <div className="space-y-1.5">
      <span id={`${id}-label`} className="block text-xs font-bold" style={{ color: 'var(--color-navy)' }}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="grid grid-cols-4 sm:grid-cols-8 gap-2"
      >
        {ALL_GROUPS.map((bg, idx) => {
          const isSelected = value === bg;
          return (
            <button
              key={bg}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(bg)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl font-black text-sm transition border js-focus-ring"
              style={{
                backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                color: isSelected ? '#FFFFFF' : 'var(--color-navy)',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)'
              }}
            >
              {bg}
            </button>
          );
        })}
      </div>
    </div>
  );
};
