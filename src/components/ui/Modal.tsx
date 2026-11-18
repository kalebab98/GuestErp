import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog (Bottom sheet on mobile, centered machined card on desktop) */}
      <div
        className={cn(
          'animate-sheet-up relative w-full rounded-t-[1.75rem] sm:rounded-2xl bg-white px-4 pt-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6 ring-1 ring-slate-900/[0.08] shadow-[0_24px_64px_-16px_rgba(15,23,42,0.28)] z-10 max-h-[88dvh] sm:max-h-[90dvh] flex flex-col',
          sizes[size],
          className
        )}
      >
        {/* Subtle drag indicator on mobile */}
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-slate-200/90 sm:hidden" />

        <div className="flex items-start justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
          <div className="min-w-0 text-left">
            {title && (
              <h2 className="text-[15px] sm:text-[17px] font-semibold tracking-[-0.02em] text-slate-900 leading-snug">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 active:scale-95 transition-all"
          >
            <X className="h-4 w-4 stroke-[1.75]" />
          </button>
        </div>

        <div className="overflow-y-auto pt-3.5 sm:py-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

