import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenService } from '@/lib/tokenService';
import { Button } from '@/components/ui/Button';
import {
  Smartphone,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  Activity,
  Layers,
  Building,
  Wifi,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingRes, setLoadingRes] = useState<string | null>(null);

  const demoRooms = [
    {
      id: 'RES-89211',
      unit: 'Penthouse 402',
      guest: 'Sarah Jenkins',
      statusTag: 'In Progress Ticket',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Master bedroom air conditioning humming loudly and blowing room temperature air.',
    },
    {
      id: 'RES-89212',
      unit: 'Studio 105',
      guest: 'David Zhao',
      statusTag: 'New Request',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      description: '2 extra plush bath sheets and hypoallergenic down pillows requested.',
    },
    {
      id: 'RES-89213',
      unit: 'Residence 304',
      guest: 'Elena Rostova',
      statusTag: 'Resolved (Awaiting Guest)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Smart TV Wi-Fi adapter reset; awaiting guest satisfaction confirmation.',
    },
  ];

  const handleLaunchGuestPortal = async (resId: string) => {
    setLoadingRes(resId);
    try {
      const generated = await tokenService.createPortalSession(resId);
      sessionStorage.setItem('guestcare_token', generated.rawToken);
      navigate(`/portal?token=${generated.rawToken}`);
    } catch (err: any) {
      alert(err.message || 'Failed to initialize session');
    } finally {
      setLoadingRes(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#071715] text-white flex flex-col justify-between selection:bg-[#C5A880] selection:text-[#071715] font-sans">
      {/* Top Luxury Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#143B36] bg-[#071715]/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0D3B36] border border-[#C5A880]/30 text-[#E8DCC8] font-serif font-black text-base shadow-sm">
              GC
            </span>
            <div className="text-left">
              <span className="font-serif text-lg font-bold text-white tracking-tight leading-none block">
                GuestCare
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] block mt-0.5">
                Hospitality Experience Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-[#1E574F] bg-[#0A2420] text-teal-200 hover:bg-[#113832] hover:text-white"
              onClick={() => navigate('/staff')}
            >
              <LayoutDashboard className="h-3.5 w-3.5 mr-1.5 text-[#C5A880]" />
              <span>Staff Command Center</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20 space-y-16">
        <div className="mx-auto max-w-3xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#113832] px-4 py-1.5 text-xs font-semibold text-[#E8DCC8] border border-[#C5A880]/30 backdrop-blur-sm shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#C5A880]" />
            <span>QR-Based In-Stay Guest Experience & Service Management</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Resolve Guest Dissatisfaction <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8DCC8] via-[#C5A880] to-[#38A197]">
              Before Checkout, Not Online.
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Zero-friction, reservation-specific QR access for apartment guests to request maintenance, extra linens,
            pillow choices, and private feedback—paired with deterministic guest health monitoring for operators.
          </p>
        </div>

        {/* Dual Interfaces Grid (Guest Mobile Portal & Staff Command) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Guest Mobile Experience (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-[#184640] bg-gradient-to-b from-[#09221F] to-[#0A1A18] p-6 md:p-8 shadow-2xl text-left space-y-6">
            <div className="flex items-center justify-between border-b border-[#143B36] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880]">
                    Guest Experience Interface
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white">
                    Guest Mobile Portal
                  </h2>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>No App Download Required</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Guests scan an in-room QR code containing a secure cryptographic token. The portal instantly validates
              against the external PMS stay window and presents tailored service options:
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-teal-100">
              <div className="rounded-xl bg-[#0F2D28] p-3 border border-[#184640] space-y-1">
                <span className="font-bold text-[#E8DCC8] block">Multi-Option Services</span>
                <p className="text-[11px] text-slate-400">Pillow menus, towels, AC, repairs, quiet intervention</p>
              </div>
              <div className="rounded-xl bg-[#0F2D28] p-3 border border-[#184640] space-y-1">
                <span className="font-bold text-[#E8DCC8] block">Two-Way Resolution</span>
                <p className="text-[11px] text-slate-400">Guest confirms satisfied or automatically reopens</p>
              </div>
              <div className="rounded-xl bg-[#0F2D28] p-3 border border-[#184640] space-y-1">
                <span className="font-bold text-[#E8DCC8] block">Private In-Stay Rating</span>
                <p className="text-[11px] text-slate-400">Direct feedback to GM before public checkout reviews</p>
              </div>
            </div>

            {/* Interactive Room Simulator Selector */}
            <div className="rounded-2xl bg-[#071917] p-4.5 border border-[#184640] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#C5A880] font-bold">
                  Simulate Live Room QR Scans
                </span>
                <span className="text-[10px] text-slate-400">Tap room to test experience</span>
              </div>

              <div className="space-y-2">
                {demoRooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => handleLaunchGuestPortal(room.id)}
                    disabled={loadingRes === room.id}
                    className="w-full flex items-center justify-between rounded-xl bg-[#0C2421] p-3 border border-[#1A4B44] hover:border-[#C5A880] hover:bg-[#123631] transition-all text-left group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-white text-sm">{room.unit}</span>
                        <span className="text-xs text-slate-300">({room.guest})</span>
                        <span className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold border ${room.badgeColor}`}>
                          {room.statusTag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-1">{room.description}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-[#C5A880] shrink-0 ml-3 group-hover:translate-x-1 transition-transform">
                      <span>Launch</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-[#C5A880] hover:bg-[#B89758] text-[#071715] font-bold py-3 text-sm rounded-xl shadow-lg"
              onClick={() => handleLaunchGuestPortal('RES-89211')}
            >
              <span>Open Guest Mobile Portal (Penthouse 402)</span>
              <ExternalLink className="h-4 w-4 ml-1.5" />
            </Button>
          </div>

          {/* Right Column: Staff Command Center (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-[#184640] bg-gradient-to-b from-[#09221F] to-[#0A1A18] p-6 md:p-8 shadow-2xl text-left space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-[#143B36] pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400">
                    Operations Suite
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white">
                    Staff Command Center
                  </h2>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Internal management hub for Front Desk, Engineering, Housekeeping, and Management with strict
                SLA tracking and guest health alerts:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-[#0C2421] p-3.5 border border-[#184640]">
                  <Activity className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-white block">Rule-Based Health Engine</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Deterministic 0-100 scoring based on unresolved complaints, overdue targets, and low ratings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-[#0C2421] p-3.5 border border-[#184640]">
                  <QrCode className="h-5 w-5 text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-white block">PMS QR Pass Generator</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Generates print-ready QR room cards linked to verified reservations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-[#0C2421] p-3.5 border border-[#184640]">
                  <Lock className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-white block">Internal Notes & History</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Segregated internal staff notes and immutable status audit trails.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-teal-500/40 text-teal-100 hover:bg-[#113832] hover:text-white py-3 text-sm rounded-xl mt-4"
              onClick={() => navigate('/staff')}
            >
              <span>Enter Staff Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#143B36] py-8 text-center text-xs text-slate-500 font-sans">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-300">GuestCare</span>
            <span>—</span>
            <span>QR-Based Guest Experience & Service Management</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Grand Marina Residences & Suites. Production Ready.</p>
        </div>
      </footer>
    </div>
  );
};
