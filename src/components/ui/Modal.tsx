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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog (Bottom sheet on mobile, centered card on desktop) */}
      <div
        className={cn(
          'relative w-full rounded-t-3xl sm:rounded-2xl bg-white px-4 pt-4 pb-5 sm:p-6 shadow-2xl transition-all z-10 max-h-[88vh] sm:max-h-[90vh] flex flex-col',
          sizes[size],
          className
        )}
      >
        {/* Subtle drag indicator on mobile */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="flex items-start justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
          <div className="min-w-0 text-left">
            {title && <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{title}</h2>}
            {description && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-snug">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="overflow-y-auto pt-3 sm:py-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

