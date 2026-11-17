import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '@/features/requests/requestService';
import { GuestHealthRecord, GuestHealthStatus } from '@/types/guestcare';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HealthStatusBadge } from '@/components/ui/Badge';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Phone,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const GuestHealthPage: React.FC = () => {
  const navigate = useNavigate();
  const [healthRecords, setHealthRecords] = useState<GuestHealthRecord[]>([]);
  const [filter, setFilter] = useState<GuestHealthStatus | 'all'>('all');

  const loadData = () => {
    setHealthRecords(requestService.listAllGuestHealth());
  };

  useEffect(() => {
    loadData();
    const unsub = requestService.subscribe(loadData);
    return () => unsub();
  }, []);

  const critical = healthRecords.filter(h => h.status === 'critical');
  const atRisk = healthRecords.filter(h => h.status === 'at_risk');
  const improving = healthRecords.filter(h => h.status === 'improving');
  const good = healthRecords.filter(h => h.status === 'good');

  const filtered = healthRecords.filter(h => filter === 'all' || h.status === filter);

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-700" />
            <span>Guest Experience Health Engine</span>
          </h1>
          <p className="text-xs text-slate-500">
            Rule-based, deterministic experience scoring to catch dissatisfaction before checkout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadData} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Recalculate Stays</span>
          </Button>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
          className={`rounded-xl border p-4 text-left transition-all ${
            filter === 'critical' ? 'ring-2 ring-rose-500 bg-rose-50/50' : 'bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Critical Attention</span>
            <AlertOctagon className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2">{critical.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Score &lt; 55 / Urgent open</p>
        </button>

        <button
          onClick={() => setFilter(filter === 'at_risk' ? 'all' : 'at_risk')}
          className={`rounded-xl border p-4 text-left transition-all ${
            filter === 'at_risk' ? 'ring-2 ring-amber-500 bg-amber-50/50' : 'bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">At Risk</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{atRisk.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Score 55 - 79</p>
        </button>

        <button
          onClick={() => setFilter(filter === 'improving' ? 'all' : 'improving')}
          className={`rounded-xl border p-4 text-left transition-all ${
            filter === 'improving' ? 'ring-2 ring-sky-500 bg-sky-50/50' : 'bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">Improving (Recovered)</span>
            <TrendingUp className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-sky-700 mt-2">{improving.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Issues resolved & verified</p>
        </button>

        <button
          onClick={() => setFilter(filter === 'good' ? 'all' : 'good')}
          className={`rounded-xl border p-4 text-left transition-all ${
            filter === 'good' ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : 'bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Good</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{good.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Nominal stay experience</p>
        </button>
      </div>

      {/* Transparent Logic Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <HelpCircle className="h-4 w-4 text-teal-700" />
          <span>Rule-Based Health Logic (100% Deterministic)</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          Scores start at 100 and evaluate active unresolved tickets, ticket priority (urgent: -35pts, high: -20pts, medium: -10pts),
          guest-reopened tickets (-25pts), and in-stay private ratings (&le;2 stars: -35pts). Stays with successfully resolved issues
          and positive guest confirmation receive a recovery bonus (+10pts) and move to <strong>Improving</strong> status.
        </p>
      </div>

      {/* Guest Health List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center bg-white text-slate-400 text-xs">
            No active reservations in this health bucket.
          </Card>
        ) : (
          filtered.map(h => {
            const isSevere = h.status === 'critical' || h.status === 'at_risk';

            return (
              <Card
                key={h.id}
                className={`p-4 bg-white transition-all ${
                  h.status === 'critical'
                    ? 'border-l-4 border-l-rose-600'
                    : h.status === 'at_risk'
                    ? 'border-l-4 border-l-amber-500'
                    : h.status === 'improving'
                    ? 'border-l-4 border-l-sky-500'
                    : 'border-l-4 border-l-emerald-600'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-sm text-slate-900">{h.apartmentRef}</h3>
                      <span className="font-mono text-xs text-slate-400">({h.reservationRef})</span>
                      <HealthStatusBadge status={h.status} />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Guest: {h.guestName}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Score Gauge */}
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Health Score
                      </span>
                      <span
                        className={`text-xl font-bold font-mono ${
                          h.score >= 80 ? 'text-emerald-700' : h.score >= 55 ? 'text-amber-600' : 'text-rose-700'
                        }`}
                      >
                        {h.score}/100
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5"
                        onClick={() => navigate(`/staff/requests?search=${h.reservationRef}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Tickets</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Justification tags */}
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Triggered Evaluation Rules:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {h.reasons.map((r, i) => (
                      <span
                        key={i}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-medium border ${
                          isSevere
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

