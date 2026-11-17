import React, { useState } from 'react';
import { PortalSession } from '@/types/guestcare';
import {
  Wifi,
  Copy,
  Check,
  Calendar,
  MapPin,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Clock,
} from 'lucide-react';

interface StayPassportCardProps {
  session: PortalSession;
  onCallDesk?: () => void;
}

export const StayPassportCard: React.FC<StayPassportCardProps> = ({ session, onCallDesk }) => {
  const [wifiCopied, setWifiCopied] = useState(false);

  const checkIn = new Date(session.checkInDate);
  const checkOut = new Date(session.checkOutDate);
  const diffDays = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

  const handleCopyWifi = () => {
    navigator.clipboard.writeText('residenceguest');
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2200);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#091F1C] border border-[#1C4E47]/70 p-5 md:p-6 text-white shadow-2xl">
      {/* Subtle luxury watermark / ambient glow */}
      <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#38A197]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#C5A880]/10 blur-3xl pointer-events-none" />

      {/* Top Bar: Property Crest & Verified Badge */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-[#184640]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#E8DCC8]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-serif tracking-widest text-[11px] uppercase text-[#E8DCC8] block leading-none">
              Grand Marina
            </span>
            <span className="text-[9px] uppercase tracking-wider text-teal-300/70 font-sans">
              Serviced Residences & Suites
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-teal-300 border border-teal-500/25">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Verified In-Stay Pass</span>
        </div>
      </div>

      {/* Main Suite Identity */}
      <div className="relative z-10 pt-4 pb-3 space-y-1 text-left">
        <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-semibold font-mono">
          Residence Suite
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
          {session.apartmentRef.split(' - ')[0]}
        </h1>
        <p className="text-xs text-slate-300 font-sans font-light">
          {session.apartmentRef.split(' - ')[1] || session.apartmentRef}
        </p>
      </div>

      {/* Guest Name & Dates Row */}
      <div className="relative z-10 grid grid-cols-2 gap-3 py-3 border-t border-b border-[#184640] text-left">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-teal-300/70 block">Primary Guest</span>
          <p className="text-sm font-semibold text-white truncate mt-0.5">{session.guestName}</p>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-teal-300/70 block">Stay Duration</span>
          <p className="text-xs font-semibold text-white mt-0.5">
            {checkIn.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
            {checkOut.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{' '}
            <span className="text-teal-300 font-normal">({diffDays} nights)</span>
          </p>
        </div>
      </div>

      {/* Wi-Fi Quick Access Pill */}
      <div className="relative z-10 mt-3.5 flex items-center justify-between rounded-2xl bg-[#0D2E2A]/90 p-2.5 pl-3 border border-[#1E574F]/80 text-xs">
        <div className="flex items-center gap-2.5 text-left">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
            <Wifi className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-[11px]">Wi-Fi: GrandMarina-5G</span>
            </div>
            <span className="text-[10px] text-teal-200/80 font-mono">Password: residenceguest</span>
          </div>
        </div>

        <button
          onClick={handleCopyWifi}
          className="flex items-center gap-1 rounded-xl bg-[#174640] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#205E56] active:scale-95 transition-all border border-teal-500/30"
        >
          {wifiCopied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-teal-300" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
