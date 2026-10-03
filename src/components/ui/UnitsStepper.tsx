import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface UnitsStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label?: string;
  id?: string;
}

export const UnitsStepper: React.FC<UnitsStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  label = 'Units Needed (450ml units)',
  id = 'units-stepper'
}) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold" style={{ color: 'var(--color-navy)' }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="Decrease units count"
          className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border font-bold disabled:opacity-30 js-focus-ring"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-navy)'
          }}
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const parsed = parseInt(e.target.value);
            if (!isNaN(parsed) && parsed >= min && parsed <= max) {
              onChange(parsed);
            }
          }}
          className="min-h-[44px] w-20 text-center font-black text-lg rounded-xl border outline-none js-focus-ring"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-navy)'
          }}
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="Increase units count"
          className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border font-bold disabled:opacity-30 js-focus-ring"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-navy)'
          }}
        >
          <Plus className="w-4 h-4" />
        </button>

        <span className="text-xs font-semibold pl-2" style={{ color: 'var(--color-navy)' }}>
          {value === 1 ? '1 Unit' : `${value} Units`}
        </span>
      </div>
    </div>
  );
};
