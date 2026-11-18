import React from 'react';
import { GuestRequest, RequestStatus } from '@/types/guestcare';
import { CheckCircle2, Clock, Wrench, AlertTriangle, UserCheck, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface RequestTimelineProps {
  request: GuestRequest;
}

const steps: Array<{ status: RequestStatus; label: string; icon: React.FC<{ className?: string }> }> = [
  { status: 'new', label: 'Received', icon: Clock },
  { status: 'assigned', label: 'Assigned', icon: UserCheck },
  { status: 'in_progress', label: 'In Progress', icon: Wrench },
  { status: 'resolved', label: 'Resolved', icon: CheckCircle2 },
  { status: 'closed', label: 'Confirmed Closed', icon: Check },
];

export const RequestTimeline: React.FC<RequestTimelineProps> = ({ request }) => {
  const currentStatus = request.status;

  const getStepStatus = (stepStatus: RequestStatus) => {
    if (currentStatus === 'reopened' && stepStatus === 'resolved') {
      return 'alert';
    }

    const order: RequestStatus[] = [
      'new',
      'acknowledged',
      'assigned',
      'in_progress',
      'waiting',
      'resolved',
      'closed',
    ];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepStatus);

    if (currentStatus === stepStatus) return 'current';
    if (currentIndex >= stepIndex) return 'complete';
    return 'upcoming';
  };

  return (
    <div className="py-1 text-left">
      <div className="flex items-center justify-between pb-3.5">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
          Progress Timeline
        </h4>
        <span className="text-[11px] text-slate-400 font-mono tabular-nums">
          #{request.ticketNumber}
        </span>
      </div>

      {request.status === 'reopened' && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50/90 p-3 text-xs text-rose-800 ring-1 ring-rose-200/80">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Reopened by you</p>
            <p className="text-rose-700 text-[11px] mt-0.5">
              {request.reopenReason || 'Marked unresolved. Our team has been alerted for priority follow-up.'}
            </p>
          </div>
        </div>
      )}

      {/* Hairline Vertical Stepper */}
      <div className="relative pl-7 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
        {steps.map((s, idx) => {
          const state = getStepStatus(s.status);
          const Icon = s.icon;
          const hist = request.statusHistory?.find(h => h.toStatus === s.status);

          let circleStyle = 'bg-white text-slate-400 ring-1 ring-slate-200';
          if (state === 'complete') {
            circleStyle = 'bg-[#0F4C40] text-white ring-2 ring-[#0F4C40]/20';
          } else if (state === 'current') {
            circleStyle = 'bg-amber-500 text-white ring-4 ring-amber-500/20';
          } else if (state === 'alert') {
            circleStyle = 'bg-rose-500 text-white ring-4 ring-rose-500/20';
          }

          return (
            <div key={idx} className="relative flex items-start gap-3">
              <div
                className={`absolute -left-7 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${circleStyle}`}
              >
                <Icon className="h-2.5 w-2.5 stroke-[2.2]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs font-semibold ${
                      state === 'upcoming' ? 'text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {s.label}
                  </p>
                  {hist && (
                    <span className="text-[10.5px] font-mono tabular-nums text-slate-400">
                      {formatDate(hist.createdAt)}
                    </span>
                  )}
                </div>

                {s.status === 'in_progress' && request.assignedStaffName && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Attending: <span className="font-medium text-slate-700">{request.assignedStaffName}</span> ({request.assignedDepartment})
                  </p>
                )}

                {s.status === 'resolved' && request.resolutionNotes && (
                  <div className="mt-1.5 rounded-xl bg-emerald-50/75 p-2.5 text-xs text-emerald-900 ring-1 ring-emerald-200/70">
                    <p className="font-semibold text-[10.5px] uppercase tracking-wider text-emerald-700">
                      Resolution Note
                    </p>
                    <p className="mt-0.5 leading-relaxed">{request.resolutionNotes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
