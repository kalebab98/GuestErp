import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '@/features/requests/requestService';
import { GuestRequest, GuestHealthRecord, GuestFeedback } from '@/types/guestcare';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge, HealthStatusBadge } from '@/components/ui/Badge';
import { RequestDetailDrawer } from '../components/RequestDetailDrawer';
import { AssignStaffModal } from '../components/AssignStaffModal';
import { StatusChangeModal } from '../components/StatusChangeModal';
import {
  Inbox,
  AlertTriangle,
  Activity,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Star,
  User,
  Wrench,
  Sparkles,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [healthRecords, setHealthRecords] = useState<GuestHealthRecord[]>([]);
  const [feedback, setFeedback] = useState<GuestFeedback[]>([]);

  const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
  const [assignModalReq, setAssignModalReq] = useState<GuestRequest | null>(null);
  const [statusModalReq, setStatusModalReq] = useState<GuestRequest | null>(null);

  const loadData = () => {
    setRequests(requestService.listRequests());
    setHealthRecords(requestService.listAllGuestHealth());
    setFeedback(requestService.listFeedback());
  };

  useEffect(() => {
    loadData();
    return requestService.subscribe(loadData);
  }, []);

  // Metrics
  const activeRequests = requests.filter(r => !['closed', 'cancelled'].includes(r.status));
  const urgentCount = activeRequests.filter(r => r.priority === 'urgent' || r.status === 'reopened').length;
  const criticalHealthCount = healthRecords.filter(h => h.status === 'critical' || h.status === 'at_risk').length;
  const confirmedSatisfied = requests.filter(r => r.guestSatisfaction === 'satisfied').length;
  const confirmedTotal = requests.filter(r => r.guestSatisfaction !== undefined).length;
  const satisfactionRate = confirmedTotal > 0 ? Math.round((confirmedSatisfied / confirmedTotal) * 100) : 100;

  const priorityActionQueue = requests
    .filter(r => r.status === 'reopened' || r.priority === 'urgent' || r.status === 'new')
    .slice(0, 5);

  const deptQueues = [
    {
      label: 'Maintenance',
      count: requests.filter(r => r.assignedDepartment === 'maintenance' && !['closed', 'cancelled'].includes(r.status)).length,
      icon: Wrench,
      path: '/staff/maintenance',
    },
    {
      label: 'Housekeeping',
      count: requests.filter(r => r.assignedDepartment === 'housekeeping' && !['closed', 'cancelled'].includes(r.status)).length,
      icon: Sparkles,
      path: '/staff/housekeeping',
    },
    {
      label: 'Front Desk',
      count: requests.filter(r => r.assignedDepartment === 'reception' && !['closed', 'cancelled'].includes(r.status)).length,
      icon: User,
      path: '/staff/requests?dept=reception',
    },
    {
      label: 'Management',
      count: requests.filter(r => r.assignedDepartment === 'management' && !['closed', 'cancelled'].includes(r.status)).length,
      icon: ShieldAlert,
      path: '/staff/requests?dept=management',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7 text-left">
      {/* Double-Bezel Machined Obsidian-Emerald Hero Banner */}
      <div className="bezel-shell rounded-[1.75rem] p-1.5">
        <div
          className="relative overflow-hidden rounded-[1.375rem] bg-[#0B231E] p-5 sm:p-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_48px_-20px_rgba(11,35,30,0.6)]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 80% at 10% 0%, rgba(45, 212, 191, 0.2), transparent 58%), radial-gradient(ellipse 55% 65% at 95% 100%, rgba(16, 185, 129, 0.14), transparent 55%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.45) 0.75px, transparent 0.75px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] ring-1 ring-white/[0.14] px-3 py-1 text-[11px] font-medium text-teal-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Staff Command Center • Live</span>
              </div>
              <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold tracking-[-0.03em] text-white leading-[1.12]">
                Operations overview
              </h1>
              <p className="text-xs sm:text-[13.5px] text-teal-100/80 leading-relaxed font-normal">
                Monitor live guest requests, assign department staff, track guest health scores, and control all Guest Portal content in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/staff/requests')}
                className="group inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-teal-50 text-[#0B231E] font-semibold text-xs px-4 h-9 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.4)] active:scale-95 transition-all tabular-nums"
              >
                <span>All Tickets ({requests.length})</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/staff/portal-config')}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] ring-1 ring-white/[0.16] px-4 h-9 text-xs font-semibold text-white active:scale-95 transition-all"
              >
                <Sliders className="h-3.5 w-3.5 text-teal-300" />
                <span>Edit Portal Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Porcelain KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        <div className="porcelain-card rounded-2xl border border-slate-200/75 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Requests</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F2F7F5] ring-1 ring-[#0F4C40]/10 text-[#0F4C40]">
              <Inbox className="h-4 w-4 stroke-[1.7]" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] tabular-nums text-slate-900">
              {activeRequests.length}
            </p>
            <p className="text-[11px] font-mono tabular-nums text-slate-400 mt-0.5">
              {requests.length} total logged
            </p>
          </div>
        </div>

        <div className="porcelain-card rounded-2xl border border-slate-200/75 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Urgent / Reopened</span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${
                urgentCount > 0
                  ? 'bg-rose-50 ring-rose-200/80 text-rose-600'
                  : 'bg-slate-100/80 ring-slate-900/[0.05] text-slate-400'
              }`}
            >
              <AlertTriangle className="h-4 w-4 stroke-[1.7]" />
            </div>
          </div>
          <div>
            <p
              className={`text-2xl sm:text-3xl font-bold tracking-[-0.03em] tabular-nums ${
                urgentCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {urgentCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Immediate attention</p>
          </div>
        </div>

        <div className="porcelain-card rounded-2xl border border-slate-200/75 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Guests At Risk</span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${
                criticalHealthCount > 0
                  ? 'bg-amber-50 ring-amber-200/80 text-amber-600'
                  : 'bg-emerald-50 ring-emerald-200/80 text-emerald-600'
              }`}
            >
              <Activity className="h-4 w-4 stroke-[1.7]" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] tabular-nums text-slate-900">
              {criticalHealthCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pre-checkout watch</p>
          </div>
        </div>

        <div className="porcelain-card rounded-2xl border border-slate-200/75 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Resolution Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200/80 text-emerald-600">
              <CheckCircle2 className="h-4 w-4 stroke-[1.7]" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] tabular-nums text-emerald-700">
              {satisfactionRate}%
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Guest confirmed</p>
          </div>
        </div>
      </div>

      {/* Department Open Queues (Matched Porcelain Tiles) */}
      <section className="space-y-3">
        <div className="flex items-end justify-between px-0.5">
          <h2 className="text-[15px] font-semibold text-slate-900 tracking-[-0.02em]">
            Department Queues
          </h2>
          <span className="text-[11px] text-slate-400">Open tickets by team</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {deptQueues.map(dept => {
            const Icon = dept.icon;
            return (
              <button
                key={dept.label}
                type="button"
                onClick={() => navigate(dept.path)}
                className="porcelain-card group flex items-center justify-between gap-2.5 rounded-2xl border border-slate-200/75 hover:border-[#0F4C40]/30 p-3.5 text-left hover:-translate-y-0.5 active:scale-[0.985]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F2F7F5] ring-1 ring-[#0F4C40]/10 text-[#0F4C40] group-hover:bg-[#0F4C40] group-hover:text-white transition-all duration-200">
                    <Icon className="h-[18px] w-[18px] stroke-[1.6]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[13px] font-semibold tracking-[-0.01em] text-slate-900 truncate">
                      {dept.label}
                    </span>
                    <span className="block text-[11px] font-mono tabular-nums text-slate-400 mt-0.5">
                      {dept.count} open
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-[#0F4C40] group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Split: Priority Queue (Left 2 cols) + Guest Health & Feedback (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Action Queue */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[15px] font-semibold text-slate-900 tracking-[-0.02em]">
              Priority Action Queue
            </h2>
            <button
              type="button"
              onClick={() => navigate('/staff/requests')}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#0F4C40] hover:underline"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {priorityActionQueue.length === 0 ? (
            <div className="bezel-shell rounded-[1.5rem] p-1.5">
              <div className="bezel-core rounded-[1.15rem] p-10 text-center space-y-2">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200/80 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">All Priority Tickets Handled</p>
                <p className="text-xs text-slate-500">
                  No urgent or newly unacknowledged tickets waiting right now.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {priorityActionQueue.map(req => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`porcelain-card rounded-2xl border p-4 sm:p-5 cursor-pointer ${
                    req.status === 'reopened'
                      ? 'border-rose-300/90 bg-rose-50/25'
                      : 'border-slate-200/75 hover:border-[#0F4C40]/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono tabular-nums text-[11px] font-semibold text-slate-400">
                          {req.ticketNumber}
                        </span>
                        <StatusBadge status={req.status} />
                        <PriorityBadge priority={req.priority} />
                      </div>
                      <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-slate-900 leading-snug">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-slate-900 block">
                        Apt {req.apartmentRef.split(' - ')[0]}
                      </span>
                      <span className="text-[11px] text-slate-500">{req.guestName}</span>
                      <p className="text-[10.5px] font-mono tabular-nums text-slate-400 mt-1">
                        {formatTimeAgo(req.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 capitalize">
                      Team: <strong className="text-slate-800">{req.assignedDepartment}</strong>{' '}
                      {req.assignedStaffName ? `• ${req.assignedStaffName}` : '• Unassigned'}
                    </span>
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 px-3 rounded-full"
                        onClick={() => setAssignModalReq(req)}
                      >
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs h-8 px-3 rounded-full"
                        onClick={() => setStatusModalReq(req)}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Guest Health Watch & In-Stay Feedback */}
        <div className="space-y-5">
          {/* Guest Health Watch */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-[15px] font-semibold text-slate-900 tracking-[-0.02em]">
                Guest Health Watch
              </h2>
              <button
                type="button"
                onClick={() => navigate('/staff/health')}
                className="text-xs font-semibold text-[#0F4C40] hover:underline"
              >
                All Stays
              </button>
            </div>

            <div className="space-y-2">
              {healthRecords.slice(0, 4).map(h => (
                <div
                  key={h.id}
                  onClick={() => navigate('/staff/health')}
                  className="porcelain-card rounded-2xl border border-slate-200/75 hover:border-[#0F4C40]/30 p-3.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      Apt {h.apartmentRef.split(' - ')[0]} • {h.guestName}
                    </span>
                    <HealthStatusBadge status={h.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span className="truncate pr-2">{h.reasons[0]}</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800 shrink-0">
                      {h.score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent In-Stay Feedback */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-[15px] font-semibold text-slate-900 tracking-[-0.02em]">
                Recent Feedback
              </h2>
              <button
                type="button"
                onClick={() => navigate('/staff/feedback')}
                className="text-xs font-semibold text-[#0F4C40] hover:underline"
              >
                View All
              </button>
            </div>

            {feedback.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/75 bg-white p-5 text-center text-xs text-slate-400">
                No feedback submitted yet.
              </div>
            ) : (
              <div className="space-y-2">
                {feedback.slice(0, 3).map(f => (
                  <div
                    key={f.id}
                    className="porcelain-card rounded-2xl border border-slate-200/75 p-3.5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: f.overallRating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10.5px] font-mono tabular-nums text-slate-400">
                        {formatTimeAgo(f.createdAt)}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 truncate">{f.apartmentRef}</p>
                    {f.comments && (
                      <p className="text-slate-500 leading-relaxed line-clamp-2">"{f.comments}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Drawer */}
      <RequestDetailDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onOpenAssign={req => setAssignModalReq(req)}
        onOpenStatusChange={req => setStatusModalReq(req)}
        onAddComment={async ({ requestId, content, isInternal }) => {
          await requestService.addComment({
            requestId,
            authorType: 'staff',
            authorName: 'Front Desk Duty Officer',
            content,
            isInternal,
          });
          setSelectedRequest(requestService.getRequestById(requestId) || null);
        }}
      />

      {/* Modals */}
      <AssignStaffModal
        isOpen={Boolean(assignModalReq)}
        onClose={() => {
          setAssignModalReq(null);
          loadData();
        }}
        request={assignModalReq}
        onAssign={async params => {
          await requestService.assignRequest({
            ...params,
            assignedBy: 'Duty Manager',
          });
          if (selectedRequest?.id === params.requestId) {
            setSelectedRequest(requestService.getRequestById(params.requestId) || null);
          }
        }}
      />

      <StatusChangeModal
        isOpen={Boolean(statusModalReq)}
        onClose={() => {
          setStatusModalReq(null);
          loadData();
        }}
        request={statusModalReq}
        onUpdateStatus={async params => {
          await requestService.updateStatus({
            ...params,
            changedByName: 'Duty Manager',
            actorType: 'staff',
          });
          if (selectedRequest?.id === params.requestId) {
            setSelectedRequest(requestService.getRequestById(params.requestId) || null);
          }
        }}
      />
    </div>
  );
};
