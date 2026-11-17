import React, { useState } from 'react';
import { pmsService } from '@/features/pms/pmsService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings, Shield, Bell, Check, Database, Server } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [urgentSla, setUrgentSla] = useState(15);
  const [highSla, setHighSla] = useState(45);
  const [mediumSla, setMediumSla] = useState(120);
  const [lowSla, setLowSla] = useState(240);
  const [graceHours, setGraceHours] = useState(2);
  const [receptionPhone, setReceptionPhone] = useState('+1 (555) 019-2834');
  const [whatsappPhone, setWhatsappPhone] = useState('+15550192834');
  const [saved, setSaved] = useState(false);

  const pms = pmsService.getAdapter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-teal-700" />
          <span>System Settings & Configuration</span>
        </h1>
        <p className="text-xs text-slate-500">
          SLA thresholds, notification targets, and PMS integration parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SLA Targets */}
        <Card className="p-5 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="h-4 w-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">Service Level Agreement (SLA) Targets</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Urgent Priority (min)"
              type="number"
              value={urgentSla}
              onChange={e => setUrgentSla(Number(e.target.value))}
              helperText="Target response: 15 min"
            />
            <Input
              label="High Priority (min)"
              type="number"
              value={highSla}
              onChange={e => setHighSla(Number(e.target.value))}
              helperText="Target response: 45 min"
            />
            <Input
              label="Medium Priority (min)"
              type="number"
              value={mediumSla}
              onChange={e => setMediumSla(Number(e.target.value))}
              helperText="Target response: 2 hours"
            />
            <Input
              label="Low Priority (min)"
              type="number"
              value={lowSla}
              onChange={e => setLowSla(Number(e.target.value))}
              helperText="Target response: 4 hours"
            />
          </div>
        </Card>

        {/* Guest Pass & Security */}
        <Card className="p-5 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="h-4 w-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">Guest QR Pass Security & Access</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Post-Checkout Grace Period (hours)"
              type="number"
              value={graceHours}
              onChange={e => setGraceHours(Number(e.target.value))}
              helperText="Access expires this many hours after checkout"
            />
            <Input
              label="Reception Phone"
              value={receptionPhone}
              onChange={e => setReceptionPhone(e.target.value)}
              helperText="Shown on guest portal contact bar"
            />
            <Input
              label="Reception WhatsApp"
              value={whatsappPhone}
              onChange={e => setWhatsappPhone(e.target.value)}
              helperText="International phone format"
            />
          </div>
        </Card>

        {/* PMS Integration Adapter Status */}
        <Card className="p-5 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="h-4 w-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">PMS Integration Adapter</h2>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Active PMS Adapter:</span>
              <span className="rounded bg-teal-100 px-2 py-0.5 text-teal-800 font-mono font-medium">
                {pms.adapterName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Environment Mode:</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 font-mono font-medium">
                {pms.isMock ? 'MOCK / DEMO DATA (VITE_USE_MOCK_PMS=true)' : 'PRODUCTION API'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">PostgreSQL Schema:</span>
              <span className="font-mono text-slate-600">guestcare</span>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold animate-fadeIn">
              <Check className="h-4 w-4" />
              Settings saved successfully
            </span>
          )}
          <Button type="submit">
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

