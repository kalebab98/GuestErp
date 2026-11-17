import React, { useState, useEffect } from 'react';
import { requestService, CATEGORIES } from '@/features/requests/requestService';
import { GuestRequest } from '@/types/guestcare';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [requests, setRequests] = useState<GuestRequest[]>([]);

  useEffect(() => {
    setRequests(requestService.listRequests());
  }, []);

  // 1. Requests by Category
  const categoryData = CATEGORIES.map(cat => ({
    name: cat.name.split(' & ')[0],
    count: requests.filter(r => r.categoryId === cat.id || r.category?.code === cat.code).length,
  }));

  // 2. Requests by Department
  const deptCounts: Record<string, number> = {
    Maintenance: requests.filter(r => r.assignedDepartment === 'maintenance').length,
    Housekeeping: requests.filter(r => r.assignedDepartment === 'housekeeping').length,
    Reception: requests.filter(r => r.assignedDepartment === 'reception').length,
    Management: requests.filter(r => r.assignedDepartment === 'management').length,
  };

  const departmentData = Object.entries(deptCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#0d9488', '#0284c7', '#d97706', '#64748b'];

  // 3. Requests by Apartment
  const aptCounts: Record<string, number> = {};
  requests.forEach(r => {
    const aptKey = r.apartmentRef.split(' - ')[0];
    aptCounts[aptKey] = (aptCounts[aptKey] || 0) + 1;
  });
  const apartmentData = Object.entries(aptCounts).map(([apt, count]) => ({
    apartment: `Apt ${apt}`,
    count,
  }));

  // Metrics
  const total = requests.length;
  const reopenedTotal = requests.filter(r => r.reopenCount > 0 || r.status === 'reopened').length;
  const reopenRate = total > 0 ? Math.round((reopenedTotal / total) * 100) : 0;

  const confirmedSatisfied = requests.filter(r => r.guestSatisfaction === 'satisfied').length;
  const confirmedResponses = requests.filter(r => r.guestSatisfaction !== undefined).length;
  const guestConfirmRate = confirmedResponses > 0 ? Math.round((confirmedSatisfied / confirmedResponses) * 100) : 100;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-700" />
          <span>Operations & Service Reports</span>
        </h1>
        <p className="text-xs text-slate-500">
          Aggregate analytics on response times, service categories, and guest-confirmed resolution rates
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <span className="text-xs font-semibold text-slate-500">Avg. Initial Response</span>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="h-4 w-4 text-teal-600" />
            <span className="text-xl font-bold text-slate-900">14 min</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">&darr; 4 min under SLA target</p>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-xs font-semibold text-slate-500">Avg. Resolution Time</span>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="h-4 w-4 text-sky-600" />
            <span className="text-xl font-bold text-slate-900">38 min</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all departments</p>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-xs font-semibold text-slate-500">Reopened Request Rate</span>
          <div className="flex items-center gap-1.5 mt-2">
            <RotateCcw className="h-4 w-4 text-rose-500" />
            <span className="text-xl font-bold text-slate-900">{reopenRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{reopenedTotal} ticket(s) reopened</p>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-xs font-semibold text-slate-500">Guest Confirmed Rate</span>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xl font-bold text-emerald-700">{guestConfirmRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Satisfaction on closure</p>
        </Card>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-5 bg-white">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Requests by Service Category</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    borderColor: '#e2e8f0',
                  }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Distribution */}
        <Card className="p-5 bg-white">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Workload by Department</h2>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    borderColor: '#e2e8f0',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Requests by Apartment */}
        <Card className="p-5 bg-white lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Apartment Incident Frequency</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apartmentData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="apartment" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    borderColor: '#e2e8f0',
                  }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

