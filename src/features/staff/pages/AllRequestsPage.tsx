import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { requestService } from '@/features/requests/requestService';
import { GuestRequest, Department, RequestStatus, Priority } from '@/types/guestcare';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { RequestDetailDrawer } from '../components/RequestDetailDrawer';
import { AssignStaffModal } from '../components/AssignStaffModal';
import { StatusChangeModal } from '../components/StatusChangeModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
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

  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [search, setSearch] = useState('');
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
    const unsub = requestService.subscribe(loadData);
    return () => unsub();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (fixedDepartment && req.assignedDepartment !== fixedDepartment) return false;
    if (department !== 'all' && req.assignedDepartment !== department) return false;
    if (status !== 'all' && req.status !== status) return false;
    if (priority !== 'all' && req.priority !== priority) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        req.ticketNumber.toLowerCase().includes(q) ||
        req.title.toLowerCase().includes(q) ||
        req.description.toLowerCase().includes(q) ||
        req.guestName.toLowerCase().includes(q) ||
        req.apartmentRef.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Sort
  filteredRequests.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'priority') {
      const pWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    }
    return 0;
  });

  return (
    <div className="space-y-4 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadData} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket #, apartment, guest name, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {!fixedDepartment && (
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-teal-600 focus:outline-none"
              >
                <option value="all">All Departments</option>
                <option value="maintenance">Maintenance</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="reception">Reception</option>
                <option value="management">Management</option>
              </select>
            )}

            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-teal-600 focus:outline-none"
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
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-teal-600 focus:outline-none"
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
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-teal-600 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: Priority</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests Data Table */}
      <Card className="overflow-hidden bg-white shadow-2xs border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket / Apt</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      req.status === 'reopened' ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Ticket & Apt */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-mono font-bold text-slate-700">{req.ticketNumber}</p>
                      <p className="text-[11px] text-slate-900 font-medium">{req.apartmentRef}</p>
                      <p className="text-[10px] text-slate-400">{req.guestName}</p>
                    </td>

                    {/* Subject */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{req.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{req.description}</p>
                      {req.reopenCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-bold mt-0.5">
                          <AlertTriangle className="h-3 w-3" /> Reopened ({req.reopenCount}x)
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {req.category?.name || req.categoryId}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    {/* Assigned */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800 capitalize">{req.assignedDepartment}</p>
                      <p className="text-[11px] text-slate-400">{req.assignedStaffName || 'Unassigned'}</p>
                    </td>

                    {/* Created */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      <p>{formatTimeAgo(req.createdAt)}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(req.createdAt)}</p>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() => setAssignModalReq(req)}
                        >
                          Assign
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => setStatusModalReq(req)}
                        >
                          Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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

