import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Siren, ArrowRight } from 'lucide-react';

export const EmergencyBottomBar: React.FC = () => {
  const location = useLocation();

  // If already on the request screen, show quick status or don't obstruct
  const isHospital = location.pathname === '/hospital';

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-2.5 border-t shadow-lg flex items-center justify-between gap-3"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex items-center gap-2">
        <span 
          className="w-3 h-3 rounded-full animate-ping shrink-0" 
          style={{ backgroundColor: 'var(--color-primary)' }} 
        />
        <div className="text-left">
          <p className="text-xs font-black tracking-tight" style={{ color: 'var(--color-navy)' }}>
            EMERGENCY ALLOCATION
          </p>
          <p className="text-[10px] opacity-75" style={{ color: 'var(--color-navy)' }}>
            Direct Transfusion Dispatch
          </p>
        </div>
      </div>

      <Link
        to={isHospital ? '#emergency-form' : '/hospital'}
        className="min-h-[44px] px-5 py-2.5 rounded-xl font-black text-xs text-white flex items-center gap-1.5 shadow-md transition active:scale-95 js-focus-ring"
        style={{
          backgroundColor: 'var(--color-primary)'
        }}
      >
        <Siren className="w-4 h-4 animate-pulse" />
        <span>Emergency Request</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
