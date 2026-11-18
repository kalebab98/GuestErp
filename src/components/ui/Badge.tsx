import React from 'react';
import { cn } from '@/lib/utils';
import { RequestStatus, Priority, GuestHealthStatus } from '@/types/guestcare';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 font-semibold tracking-[-0.01em] rounded-full';

  const variants = {
    default: 'bg-slate-100/90 text-slate-700 ring-1 ring-slate-900/[0.06]',
    outline: 'bg-white text-slate-600 ring-1 ring-slate-200',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20',
    warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-500/25',
    danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/25',
    info: 'bg-[#ECF5F2] text-[#0F4C40] ring-1 ring-[#0F4C40]/15',
  };

  const dotColors = {
    default: 'bg-slate-400',
    outline: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-[#0F4C40]',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config: Record<RequestStatus, { label: string; variant: BadgeProps['variant'] }> = {
    new: { label: 'New', variant: 'warning' },
    acknowledged: { label: 'Acknowledged', variant: 'info' },
    assigned: { label: 'Assigned', variant: 'info' },
    in_progress: { label: 'In Progress', variant: 'warning' },
    waiting: { label: 'Waiting', variant: 'default' },
    resolved: { label: 'Resolved', variant: 'success' },
    reopened: { label: 'Reopened', variant: 'danger' },
    closed: { label: 'Closed', variant: 'default' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
  };

  const item = config[status] || { label: status, variant: 'default' };
  return (
    <Badge variant={item.variant} dot>
      {item.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config: Record<Priority, { label: string; variant: BadgeProps['variant'] }> = {
    low: { label: 'Low', variant: 'default' },
    medium: { label: 'Medium', variant: 'info' },
    high: { label: 'High', variant: 'warning' },
    urgent: { label: 'Urgent', variant: 'danger' },
  };

  const item = config[priority] || { label: priority, variant: 'default' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function HealthStatusBadge({ status }: { status: GuestHealthStatus }) {
  const config: Record<GuestHealthStatus, { label: string; variant: BadgeProps['variant'] }> = {
    good: { label: 'Good', variant: 'success' },
    improving: { label: 'Improving', variant: 'info' },
    at_risk: { label: 'At Risk', variant: 'warning' },
    critical: { label: 'Critical', variant: 'danger' },
  };

  const item = config[status] || { label: status, variant: 'default' };
  return (
    <Badge variant={item.variant} size="sm" dot>
      {item.label}
    </Badge>
  );
}
