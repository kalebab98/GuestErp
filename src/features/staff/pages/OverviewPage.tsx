import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '@/features/requests/requestService';
import { GuestRequest, GuestHealthRecord, GuestFeedback } from '@/types/guestcare';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge, HealthStatusBadge } from '@/components/ui/Badge';
import { RequestDetailDrawer } from '../components/RequestDetailDrawer';
import { AssignStaffModal } from '../components/AssignStaffModal';
import { StatusChangeModal } from '../components/StatusChangeModal';
import {
  Inbox,
  AlertTriangle,
  Clock,
  Activity,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Star,
  User,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { formatTimeAgo, formatDate } from '@/lib/utils';

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
    const unsub = requestService.subscribe(loadData);
    return () => unsub();
  }, []);

  // Compute metrics
  const activeRequests = requests.filter(r => !['closed', 'cancelled'].includes(r.status));
  const urgentCount = activeRequests.filter(r => r.priority === 'urgent' || r.status === 'reopened').length;
  const criticalHealthCount = healthRecords.filter(h => h.status === 'critical' || h.status === 'at_risk').length;
  const resolvedCount = requests.filter(r => r.status === 'closed' || r.status === 'resolved').length;
  const confirmedSatisfied = requests.filter(r => r.guestSatisfaction === 'satisfied').length;
  const confirmedTotal = requests.filter(r => r.guestSatisfaction !== undefined).length;
  const satisfactionRate = confirmedTotal > 0 ? Math.round((confirmedSatisfied / confirmedTotal) * 100) : 100;

  // Requests needing immediate action (urgent, reopened, or unacknowledged)
  const priorityActionQueue = requests
    .filter(r => r.status === 'reopened' || r.priority === 'urgent' || r.status === 'new')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Operations Overview</h1>
          <p className="text-xs text-slate-500">Live operational status and in-stay guest experience metrics</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/staff/requests')}>
            <span>View All Tickets ({requests.length})</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-teal-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Requests</span>
              <Inbox className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{activeRequests.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{requests.length} total logged</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${urgentCount > 0 ? 'border-l-rose-600 bg-rose-50/20' : 'border-l-slate-400'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Urgent / Reopened</span>
              <AlertTriangle className={`h-4 w-4 ${urgentCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            </div>
            <p className={`text-2xl font-bold mt-2 ${urgentCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {urgentCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Immediate attention required</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${criticalHealthCount > 0 ? 'border-l-amber-500 bg-amber-50/20' : 'border-l-emerald-600'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Guests At Risk</span>
              <Activity className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{criticalHealthCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pre-checkout monitoring</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Guest Resolution Rate</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-2">{satisfactionRate}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Confirmed satisfied</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Action Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Priority Action Queue</span>
            </h2>
            <span className="text-xs text-slate-500">Requires triage or dispatch</span>
          </div>

          {priorityActionQueue.length === 0 ? (
            <Card className="p-8 text-center bg-white">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">All Priority Tickets Handled</p>
              <p className="text-xs text-slate-500 mt-1">No unhandled urgent tickets or reopened issues currently pending.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {priorityActionQueue.map(req => (
                <Card
                  key={req.id}
                  className={`p-4 hover:shadow-md transition-all cursor-pointer ${
                    req.status === 'reopened' ? 'border-rose-300 bg-rose-50/30' : 'bg-white'
                  }`}
                  onClick={() => setSelectedRequest(req)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{req.ticketNumber}</span>
                        <StatusBadge status={req.status} />
                        <PriorityBadge priority={req.priority} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-1">{req.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-slate-800 block">{req.apartmentRef}</span>
                      <span className="text-[11px] text-slate-400">{req.guestName}</span>
                      <p className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(req.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 capitalize">
                      Dept: <strong>{req.assignedDepartment}</strong>{' '}
                      {req.assignedStaffName ? `(${req.assignedStaffName})` : '(Unassigned)'}
                    </span>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2.5"
                        onClick={() => setAssignModalReq(req)}
                      >
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs h-7 px-2.5"
                        onClick={() => setStatusModalReq(req)}
                      >
                        Status
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Department Workload Summary */}
          <Card className="p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Department Open Queue
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div
                onClick={() => navigate('/staff/maintenance')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/70"
              >
                <Wrench className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                <span className="text-xs text-slate-500">Maintenance</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {requests.filter(r => r.assignedDepartment === 'maintenance' && !['closed', 'cancelled'].includes(r.status)).length}
                </p>
              </div>

              <div
                onClick={() => navigate('/staff/housekeeping')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/70"
              >
                <Sparkles className="h-4 w-4 text-teal-600 mx-auto mb-1" />
                <span className="text-xs text-slate-500">Housekeeping</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {requests.filter(r => r.assignedDepartment === 'housekeeping' && !['closed', 'cancelled'].includes(r.status)).length}
                </p>
              </div>

              <div
                onClick={() => navigate('/staff/requests?dept=reception')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/70"
              >
                <User className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                <span className="text-xs text-slate-500">Reception</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {requests.filter(r => r.assignedDepartment === 'reception' && !['closed', 'cancelled'].includes(r.status)).length}
                </p>
              </div>

              <div
                onClick={() => navigate('/staff/requests?dept=management')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/70"
              >
                <ShieldAlert className="h-4 w-4 text-slate-700 mx-auto mb-1" />
                <span className="text-xs text-slate-500">Management</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {requests.filter(r => r.assignedDepartment === 'management' && !['closed', 'cancelled'].includes(r.status)).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Guest Health Watch & Feedback */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600" />
              <span>Guest Health Watch</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-teal-800"
              onClick={() => navigate('/staff/health')}
            >
              All Stays
            </Button>
          </div>

          <div className="space-y-2.5">
            {healthRecords.slice(0, 4).map(h => (
              <Card
                key={h.id}
                className="p-3.5 bg-white hover:border-slate-300 transition-colors cursor-pointer"
                onClick={() => navigate('/staff/health')}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-slate-900">{h.apartmentRef}</span>
                  <HealthStatusBadge status={h.status} />
                </div>
                <p className="text-xs text-slate-600">Guest: {h.guestName}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[200px]">{h.reasons[0]}</span>
                  <span className="font-bold text-slate-700">{h.score}/100</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Private Feedback Feed */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>In-Stay Feedback</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-teal-800"
                onClick={() => navigate('/staff/feedback')}
              >
                View
              </Button>
            </div>

            {feedback.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No feedback submitted yet.</p>
            ) : (
              <div className="space-y-2">
                {feedback.slice(0, 3).map(f => (
                  <Card key={f.id} className="p-3 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: f.overallRating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{formatTimeAgo(f.createdAt)}</span>
                    </div>
                    <p className="font-medium text-slate-800 truncate">{f.apartmentRef}</p>
                    {f.comments && <p className="text-slate-600 italic">"{f.comments}"</p>}
                  </Card>
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
          // Update selected request in place
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

