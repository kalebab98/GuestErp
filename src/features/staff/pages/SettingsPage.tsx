import React, { useState, useEffect } from 'react';
import { pmsService } from '@/features/pms/pmsService';
import { portalConfigService } from '@/features/config/portalConfigService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings, Shield, Bell, Check, Server, Phone, Building2, Wifi } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const initialContact = portalConfigService.getContact();
  const initialWifi = portalConfigService.getWifi();

  const [propertyName, setPropertyName] = useState(initialContact.propertyName);
  const [frontDeskPhone, setFrontDeskPhone] = useState(initialContact.frontDeskPhone);
  const [frontDeskWhatsapp, setFrontDeskWhatsapp] = useState(initialContact.frontDeskWhatsapp);

  const [medicalStoreName, setMedicalStoreName] = useState(initialContact.medicalStoreName);
  const [medicalStorePhone, setMedicalStorePhone] = useState(initialContact.medicalStorePhone);
  const [medicalStoreHours, setMedicalStoreHours] = useState(initialContact.medicalStoreHours);
  const [medicalStoreDescription, setMedicalStoreDescription] = useState(initialContact.medicalStoreDescription);

  const [wifiNetwork, setWifiNetwork] = useState(initialWifi.networkName);
  const [wifiPassword, setWifiPassword] = useState(initialWifi.password);

  const [urgentSla, setUrgentSla] = useState(initialContact.slaUrgentMinutes);
  const [highSla, setHighSla] = useState(initialContact.slaHighMinutes);
  const [mediumSla, setMediumSla] = useState(initialContact.slaMediumMinutes);
  const [lowSla, setLowSla] = useState(initialContact.slaLowMinutes);
  const [graceHours, setGraceHours] = useState(initialContact.tokenGracePeriodHours);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    return portalConfigService.subscribe(() => {
      const c = portalConfigService.getContact();
      const w = portalConfigService.getWifi();
      setPropertyName(c.propertyName);
      setFrontDeskPhone(c.frontDeskPhone);
      setFrontDeskWhatsapp(c.frontDeskWhatsapp);
      setMedicalStoreName(c.medicalStoreName);
      setMedicalStorePhone(c.medicalStorePhone);
      setMedicalStoreHours(c.medicalStoreHours);
      setMedicalStoreDescription(c.medicalStoreDescription);
      setUrgentSla(c.slaUrgentMinutes);
      setHighSla(c.slaHighMinutes);
      setMediumSla(c.slaMediumMinutes);
      setLowSla(c.slaLowMinutes);
      setGraceHours(c.tokenGracePeriodHours);
      setWifiNetwork(w.networkName);
      setWifiPassword(w.password);
    });
  }, []);

  const pms = pmsService.getAdapter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    portalConfigService.updateContact({
      propertyName: propertyName.trim(),
      frontDeskPhone: frontDeskPhone.trim(),
      frontDeskWhatsapp: frontDeskWhatsapp.trim(),
      medicalStoreName: medicalStoreName.trim(),
      medicalStorePhone: medicalStorePhone.trim(),
      medicalStoreHours: medicalStoreHours.trim(),
      medicalStoreDescription: medicalStoreDescription.trim(),
      slaUrgentMinutes: Number(urgentSla) || 15,
      slaHighMinutes: Number(highSla) || 45,
      slaMediumMinutes: Number(mediumSla) || 120,
      slaLowMinutes: Number(lowSla) || 240,
      tokenGracePeriodHours: Number(graceHours) || 2,
    });
    portalConfigService.updateWifi({
      networkName: wifiNetwork.trim(),
      password: wifiPassword.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-[-0.025em] text-slate-900 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#F2F7F5] ring-1 ring-[#0F4C40]/12 text-[#0F4C40]">
            <Settings className="h-4 w-4 stroke-[1.8]" />
          </span>
          <span>System Settings & Contact Info</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          All phone numbers, Wi-Fi credentials, building info, and SLA targets save live across the Guest Portal and Staff Dashboard.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Phone Numbers & Property Name */}
        <Card className="p-5 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="h-4 w-4 text-[#11574A]" />
            <h2 className="text-sm font-bold text-slate-900">Property & Front Desk Phone Numbers</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Building / Residence Name"
              value={propertyName}
              onChange={e => setPropertyName(e.target.value)}
            />
            <Input
              label="Front Desk Phone Number"
              value={frontDeskPhone}
              onChange={e => setFrontDeskPhone(e.target.value)}
              helperText="Used for all Call Desk buttons"
            />
            <Input
              label="Front Desk WhatsApp"
              value={frontDeskWhatsapp}
              onChange={e => setFrontDeskWhatsapp(e.target.value)}
              helperText="International format (e.g. +251...)"
            />
          </div>
        </Card>

        {/* Wi-Fi Credentials */}
        <Card className="p-5 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Wifi className="h-4 w-4 text-[#11574A]" />
            <h2 className="text-sm font-bold text-slate-900">Apartment Wi-Fi Credentials</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Wi-Fi Network Name"
              value={wifiNetwork}
              onChange={e => setWifiNetwork(e.target.value)}
            />
            <Input
              label="Wi-Fi Password"
              value={wifiPassword}
              onChange={e => setWifiPassword(e.target.value)}
            />
          </div>
        </Card>

        {/* Ground Floor Medical Store Details */}
        <Card className="p-5 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="h-4 w-4 text-[#11574A]" />
            <h2 className="text-sm font-bold text-slate-900">Ground Floor Medical Store Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Store Title"
              value={medicalStoreName}
              onChange={e => setMedicalStoreName(e.target.value)}
            />
            <Input
              label="Medical Store Phone"
              value={medicalStorePhone}
              onChange={e => setMedicalStorePhone(e.target.value)}
            />
            <Input
              label="Opening Hours"
              value={medicalStoreHours}
              onChange={e => setMedicalStoreHours(e.target.value)}
            />
          </div>
          <Input
            label="Short Description"
            value={medicalStoreDescription}
            onChange={e => setMedicalStoreDescription(e.target.value)}
          />
        </Card>

        {/* SLA Targets & Token Grace */}
        <Card className="p-5 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="h-4 w-4 text-[#11574A]" />
            <h2 className="text-sm font-bold text-slate-900">Response Targets (SLA) & Session Grace</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Input
              label="Urgent (min)"
              type="number"
              value={urgentSla}
              onChange={e => setUrgentSla(Number(e.target.value))}
            />
            <Input
              label="High (min)"
              type="number"
              value={highSla}
              onChange={e => setHighSla(Number(e.target.value))}
            />
            <Input
              label="Medium (min)"
              type="number"
              value={mediumSla}
              onChange={e => setMediumSla(Number(e.target.value))}
            />
            <Input
              label="Low (min)"
              type="number"
              value={lowSla}
              onChange={e => setLowSla(Number(e.target.value))}
            />
            <Input
              label="QR Grace (hrs)"
              type="number"
              value={graceHours}
              onChange={e => setGraceHours(Number(e.target.value))}
            />
          </div>
        </Card>

        {/* PMS Adapter Status */}
        <Card className="p-5 bg-white space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="h-4 w-4 text-[#11574A]" />
            <h2 className="text-sm font-bold text-slate-900">System Integration Status</h2>
          </div>

          <div className="rounded-xl bg-[#F6F8F8] p-4 border border-slate-200/70 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">PMS Adapter:</span>
              <span className="rounded bg-[#F0F7F5] px-2 py-0.5 text-[#11574A] font-mono font-semibold">
                {pms.adapterName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Building Layout:</span>
              <span className="font-mono text-slate-700">16 Apartments (1A – 8B) + Ground Floor Medical Store</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">PostgreSQL Schema:</span>
              <span className="font-mono text-slate-700">guestcare</span>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-1">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold animate-fadeIn">
              <Check className="h-4 w-4" />
              All settings saved live
            </span>
          )}
          <Button type="submit" className="px-6">
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
