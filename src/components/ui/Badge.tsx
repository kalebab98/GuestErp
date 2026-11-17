import React from 'react';
import { cn } from '@/lib/utils';
import { RequestStatus, Priority, GuestHealthStatus } from '@/types/guestcare';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-slate-100 text-slate-700',
    outline: 'border border-slate-300 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-teal-50 text-teal-800 border border-teal-200',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
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
  return <Badge variant={item.variant}>{item.label}</Badge>;
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
    good: { label: 'Good Experience', variant: 'success' },
    improving: { label: 'Improving', variant: 'info' },
    at_risk: { label: 'At Risk', variant: 'warning' },
    critical: { label: 'Critical Attention', variant: 'danger' },
  };

  const item = config[status] || { label: status, variant: 'default' };
  return <Badge variant={item.variant} size="md">{item.label}</Badge>;
}

