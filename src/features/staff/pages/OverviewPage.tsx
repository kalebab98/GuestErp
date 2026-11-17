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
      {/* Signature Deep Forest Teal Hero Banner (aligned with Guest Center) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4F43] via-[#11574A] to-[#156758] p-5 sm:p-7 text-white shadow-lg">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <span className="inline-block text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-teal-200">
              Staff Command Center
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              OPERATIONS OVERVIEW
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-light">
              Monitor live guest requests, assign department staff, track guest health scores, and manage Guest Portal items & FAQs in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              onClick={() => navigate('/staff/requests')}
              className="bg-white text-[#11574A] hover:bg-teal-50 font-bold text-xs rounded-xl px-4 py-2.5 shadow-sm gap-1.5"
            >
              <span>All Tickets ({requests.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <button
              type="button"
              onClick={() => navigate('/staff/portal-config')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              <Sliders className="h-3.5 w-3.5 text-teal-200" />
              <span>Edit Portal & FAQs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean KPI Grid (Soft rounded cards matching Guest Center) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/70 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Requests</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F7F5] text-[#11574A]">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activeRequests.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{requests.length} total logged</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/70 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Urgent / Reopened</span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                urgentCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className={`text-2xl sm:text-3xl font-extrabold ${urgentCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {urgentCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Immediate attention</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/70 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Guests At Risk</span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                criticalHealthCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{criticalHealthCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pre-checkout watch</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/70 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Resolution Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{satisfactionRate}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Guest confirmed</p>
          </div>
        </div>
      </div>

      {/* Department Open Queues (Clean Guest-Portal-style Category Tiles) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Department Queues</h2>
          <span className="text-xs text-slate-400">Open tickets by team</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {deptQueues.map(dept => {
            const Icon = dept.icon;
            return (
              <button
                key={dept.label}
                type="button"
                onClick={() => navigate(dept.path)}
                className="group flex items-center justify-between gap-3 rounded-2xl bg-white hover:border-[#11574A]/35 border border-slate-200/70 p-3.5 sm:p-4 text-left shadow-2xs hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F7F5] text-[#11574A] group-hover:bg-[#11574A] group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {dept.label}
                    </span>
                    <span className="block text-[11px] font-medium text-slate-500">
                      {dept.count} open
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#11574A] group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Split: Priority Queue (Left 2 cols) + Guest Health & Feedback (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Action Queue */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Priority Action Queue</h2>
            <button
              type="button"
              onClick={() => navigate('/staff/requests')}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#11574A] hover:underline"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {priorityActionQueue.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-10 text-center space-y-2 shadow-2xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">All Priority Tickets Handled</p>
              <p className="text-xs text-slate-500">No urgent or newly unacknowledged tickets waiting right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {priorityActionQueue.map(req => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer hover:shadow-md ${
                    req.status === 'reopened'
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-slate-200/70 bg-white hover:border-[#11574A]/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-400">{req.ticketNumber}</span>
                        <StatusBadge status={req.status} />
                        <PriorityBadge priority={req.priority} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{req.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900 block">{req.apartmentRef.split(' - ')[0]}</span>
                      <span className="text-[11px] text-slate-500">{req.guestName}</span>
                      <p className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(req.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 capitalize">
                      Team: <strong className="text-slate-800">{req.assignedDepartment}</strong>{' '}
                      {req.assignedStaffName ? `• ${req.assignedStaffName}` : '• Unassigned'}
                    </span>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 px-3 rounded-xl border-slate-200"
                        onClick={() => setAssignModalReq(req)}
                      >
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs h-8 px-3 rounded-xl bg-[#11574A] hover:bg-[#0D443A] text-white"
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Guest Health Watch</h2>
              <button
                type="button"
                onClick={() => navigate('/staff/health')}
                className="text-xs font-semibold text-[#11574A] hover:underline"
              >
                All Stays
              </button>
            </div>

            <div className="space-y-2.5">
              {healthRecords.slice(0, 4).map(h => (
                <div
                  key={h.id}
                  onClick={() => navigate('/staff/health')}
                  className="rounded-2xl border border-slate-200/70 bg-white p-4 hover:border-[#11574A]/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{h.apartmentRef.split(' - ')[0]} • {h.guestName}</span>
                    <HealthStatusBadge status={h.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="truncate pr-2">{h.reasons[0]}</span>
                    <span className="font-mono font-bold text-slate-800 shrink-0">{h.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent In-Stay Feedback */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Feedback</h2>
              <button
                type="button"
                onClick={() => navigate('/staff/feedback')}
                className="text-xs font-semibold text-[#11574A] hover:underline"
              >
                View All
              </button>
            </div>

            {feedback.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5 text-center text-xs text-slate-400">
                No feedback submitted yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {feedback.slice(0, 3).map(f => (
                  <div key={f.id} className="rounded-2xl border border-slate-200/70 bg-white p-4 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: f.overallRating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{formatTimeAgo(f.createdAt)}</span>
                    </div>
                    <p className="font-bold text-slate-900 truncate">{f.apartmentRef}</p>
                    {f.comments && <p className="text-slate-600 italic leading-relaxed">"{f.comments}"</p>}
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
