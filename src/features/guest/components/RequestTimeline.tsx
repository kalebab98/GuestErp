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

  // Determine active step index
  const getStepStatus = (stepStatus: RequestStatus) => {
    if (currentStatus === 'reopened') {
      if (stepStatus === 'resolved') return 'alert';
    }

    const order: RequestStatus[] = ['new', 'acknowledged', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepStatus);

    if (currentStatus === stepStatus) return 'current';
    if (currentIndex >= stepIndex) return 'complete';
    return 'upcoming';
  };

  return (
    <div className="py-2 text-left">
      <div className="flex items-center justify-between pb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Progress Timeline
        </h4>
        <span className="text-xs text-slate-400 font-mono">
          Ticket #{request.ticketNumber}
        </span>
      </div>

      {request.status === 'reopened' && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Reopened by you</p>
            <p className="text-rose-700 mt-0.5">{request.reopenReason || 'Marked unresolved. Our team has been alerted for priority follow-up.'}</p>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((s, idx) => {
          const state = getStepStatus(s.status);
          const Icon = s.icon;

          // Find relevant history item if any
          const hist = request.statusHistory?.find(h => h.toStatus === s.status);

          let circleStyle = 'bg-slate-100 text-slate-400 border-2 border-white ring-2 ring-slate-200';
          if (state === 'complete') {
            circleStyle = 'bg-teal-600 text-white border-2 border-white ring-2 ring-teal-600';
          } else if (state === 'current') {
            circleStyle = 'bg-amber-500 text-white border-2 border-white ring-2 ring-amber-500 animate-pulse';
          } else if (state === 'alert') {
            circleStyle = 'bg-rose-500 text-white border-2 border-white ring-2 ring-rose-500';
          }

          return (
            <div key={idx} className="relative flex items-start gap-3">
              {/* Dot */}
              <div
                className={`absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${circleStyle}`}
              >
                <Icon className="h-3 w-3" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold ${state === 'upcoming' ? 'text-slate-400' : 'text-slate-800'}`}>
                    {s.label}
                  </p>
                  {hist && (
                    <span className="text-[11px] text-slate-400">
                      {formatDate(hist.createdAt)}
                    </span>
                  )}
                </div>

                {s.status === 'in_progress' && request.assignedStaffName && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Attending: {request.assignedStaffName} ({request.assignedDepartment})
                  </p>
                )}

                {s.status === 'resolved' && request.resolutionNotes && (
                  <div className="mt-1.5 rounded-md bg-emerald-50/70 p-2 text-xs text-emerald-900 border border-emerald-100">
                    <p className="font-medium text-[11px] text-emerald-800">Resolution Note:</p>
                    <p className="mt-0.5">{request.resolutionNotes}</p>
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

