import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  isDestructive = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: isDestructive ? 'var(--color-bg)' : 'var(--color-bg)',
                color: isDestructive ? 'var(--color-danger)' : 'var(--color-primary)'
              }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="confirm-modal-title" className="text-base font-bold" style={{ color: 'var(--color-navy)' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg opacity-60 hover:opacity-100 transition js-focus-ring"
            style={{ color: 'var(--color-navy)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs leading-relaxed opacity-85" style={{ color: 'var(--color-navy)' }}>
          {description}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border transition js-focus-ring"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-navy)'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold text-white transition js-focus-ring"
            style={{
              backgroundColor: isDestructive ? 'var(--color-danger)' : 'var(--color-primary)'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
