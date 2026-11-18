import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { requestService } from '@/features/requests/requestService';
import { GuestRequest, Department, RequestStatus, Priority } from '@/types/guestcare';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { RequestDetailDrawer } from '../components/RequestDetailDrawer';
import { AssignStaffModal } from '../components/AssignStaffModal';
import { StatusChangeModal } from '../components/StatusChangeModal';
import { Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatDate, formatTimeAgo } from '@/lib/utils';

interface AllRequestsPageProps {
  fixedDepartment?: Department;
  title?: string;
  subtitle?: string;
}

export const AllRequestsPage: React.FC<AllRequestsPageProps> = ({
  fixedDepartment,
  title = 'All Service Requests',
  subtitle = 'Full tickets inventory, triage, and assignment management',
}) => {
  const [searchParams] = useSearchParams();
  const deptParam = searchParams.get('dept') as Department | null;
  const searchParam = searchParams.get('search') || '';

  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [search, setSearch] = useState(searchParam);
  const [department, setDepartment] = useState<Department | 'all'>(fixedDepartment || deptParam || 'all');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
  const [assignModalReq, setAssignModalReq] = useState<GuestRequest | null>(null);
  const [statusModalReq, setStatusModalReq] = useState<GuestRequest | null>(null);

  const loadData = () => {
    setRequests(requestService.listRequests());
  };

  useEffect(() => {
    loadData();
    return requestService.subscribe(loadData);
  }, []);

  const filteredRequests = requests.filter(req => {
    if (fixedDepartment && req.assignedDepartment !== fixedDepartment) return false;
    if (department !== 'all' && req.assignedDepartment !== department) return false;
    if (status !== 'all' && req.status !== status) return false;
    if (priority !== 'all' && req.priority !== priority) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        req.ticketNumber.toLowerCase().includes(q) ||
        req.reservationRef.toLowerCase().includes(q) ||
        req.title.toLowerCase().includes(q) ||
        req.description.toLowerCase().includes(q) ||
        req.guestName.toLowerCase().includes(q) ||
        req.apartmentRef.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  filteredRequests.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'priority') {
      const pWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    }
    return 0;
  });

  return (
    <div className="space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[-0.025em] text-slate-900">
            {title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadData}
          className="gap-1.5 text-xs rounded-full self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#0F4C40]" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Porcelain Filter and Search Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/75 p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-16px_rgba(15,23,42,0.08)] space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket #, apartment, guest name, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-[#F6F8FA] pl-9 pr-4 h-9 text-xs text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-900/[0.06] focus:ring-2 focus:ring-[#0F4C40]/35 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {!fixedDepartment && (
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as any)}
                className="rounded-xl ring-1 ring-slate-900/[0.07] bg-[#F6F8FA] px-3 h-9 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#0F4C40]/35 focus:bg-white focus:outline-none"
              >
                <option value="all">All Departments</option>
                <option value="maintenance">Maintenance</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="reception">Front Desk</option>
                <option value="management">Management</option>
              </select>
            )}

            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="rounded-xl ring-1 ring-slate-900/[0.07] bg-[#F6F8FA] px-3 h-9 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#0F4C40]/35 focus:bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="reopened">Reopened</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="rounded-xl ring-1 ring-slate-900/[0.07] bg-[#F6F8FA] px-3 h-9 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#0F4C40]/35 focus:bg-white focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="rounded-xl ring-1 ring-slate-900/[0.07] bg-[#F6F8FA] px-3 h-9 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#0F4C40]/35 focus:bg-white focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200/70 p-8 text-center text-xs text-slate-400">
            No requests matched your filters.
          </div>
        ) : (
          filteredRequests.map(req => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="rounded-2xl bg-white border border-slate-200/70 p-4 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={req.status} />
                  <PriorityBadge priority={req.priority} />
                </div>
                <span className="font-mono text-[11px] text-slate-400">{formatTimeAgo(req.createdAt)}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{req.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{req.apartmentRef} • {req.guestName}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                <span className="font-mono text-[11px] text-slate-400">{req.ticketNumber}</span>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 rounded-lg" onClick={() => setAssignModalReq(req)}>
                    Assign
                  </Button>
                  <Button size="sm" className="h-7 text-xs px-2.5 rounded-lg bg-[#11574A] text-white" onClick={() => setStatusModalReq(req)}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Data Table (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-2xs border border-slate-200/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F8] border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Ticket / Apt</th>
                <th className="py-3.5 px-4">Subject & Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No requests matched the specified filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`hover:bg-[#FAFBFB] transition-colors cursor-pointer ${
                      req.status === 'reopened' ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-mono font-bold text-[#11574A]">{req.ticketNumber}</p>
                      <p className="text-[11px] text-slate-900 font-semibold">{req.apartmentRef.split(' - ')[0]}</p>
                      <p className="text-[10px] text-slate-400">{req.guestName}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{req.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{req.description}</p>
                      {req.reopenCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-bold mt-0.5">
                          <AlertTriangle className="h-3 w-3" /> Reopened ({req.reopenCount}x)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block rounded-lg bg-[#F0F7F5] px-2.5 py-1 text-[11px] font-semibold text-[#11574A]">
                        {req.category?.shortName || req.category?.name || req.categoryId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-800 capitalize">{req.assignedDepartment}</p>
                      <p className="text-[11px] text-slate-400">{req.assignedStaffName || 'Unassigned'}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      <p className="font-medium text-slate-700">{formatTimeAgo(req.createdAt)}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(req.createdAt)}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7.5 text-xs px-2.5 rounded-lg border-slate-200"
                          onClick={() => setAssignModalReq(req)}
                        >
                          Assign
                        </Button>
                        <Button
                          size="sm"
                          className="h-7.5 text-xs px-2.5 rounded-lg bg-[#11574A] hover:bg-[#0D443A] text-white"
                          onClick={() => setStatusModalReq(req)}
                        >
                          Update
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
