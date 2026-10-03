import React from 'react';
import { Check, Clock, Truck, ShieldCheck } from 'lucide-react';

export type RequestTimelineStage = 'requested' | 'matched' | 'reserved' | 'in_transit' | 'delivered';

interface TimelineTrackerProps {
  currentStage: RequestTimelineStage;
  className?: string;
}

const STAGES: { id: RequestTimelineStage; label: string; icon: any }[] = [
  { id: 'requested', label: 'Requested', icon: Clock },
  { id: 'matched', label: 'Matched', icon: ShieldCheck },
  { id: 'reserved', label: 'Reserved', icon: Check },
  { id: 'in_transit', label: 'In Transit', icon: Truck },
];

export const TimelineTracker: React.FC<TimelineTrackerProps> = ({ currentStage, className = '' }) => {
  const getStageIndex = (stage: RequestTimelineStage) => {
    switch (stage) {
      case 'requested': return 0;
      case 'matched': return 1;
      case 'reserved': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <nav aria-label="Blood Request Fulfillment Timeline" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between relative">
        {/* Connecting Track Line */}
        <div 
          className="absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 z-0" 
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        
        {STAGES.map((st, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = st.icon;

          return (
            <li key={st.id} className="relative z-10 flex flex-col items-center">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition border-2"
                style={{
                  backgroundColor: isCompleted ? 'var(--color-success-fill)' : isCurrent ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isCompleted || isCurrent ? '#FFFFFF' : 'var(--color-navy)',
                  borderColor: isCompleted ? 'var(--color-success-fill)' : isCurrent ? 'var(--color-primary)' : 'var(--color-border)'
                }}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span 
                className={`text-[11px] mt-1.5 font-bold ${isCurrent ? 'underline' : ''}`}
                style={{ color: 'var(--color-navy)' }}
              >
                {st.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
