import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold tracking-[-0.01em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#0F4C40] text-white hover:bg-[#0B3B31] focus-visible:ring-[#0F4C40] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_2px_8px_-2px_rgba(15,76,64,0.4)]',
      secondary:
        'bg-[#ECF5F2] text-[#0F4C40] hover:bg-[#DFEFEA] ring-1 ring-[#0F4C40]/10 focus-visible:ring-[#0F4C40]',
      outline:
        'border border-slate-200/90 bg-white text-slate-700 hover:bg-[#F6F8FA] hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.03)] focus-visible:ring-slate-400',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-slate-400',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600 shadow-[0_2px_8px_-2px_rgba(225,29,72,0.4)]',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-xl gap-1.5',
      md: 'h-10 px-4 text-xs sm:text-sm rounded-xl gap-2',
      lg: 'h-11 px-5 text-sm rounded-xl gap-2',
      icon: 'h-9 w-9 rounded-xl p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
