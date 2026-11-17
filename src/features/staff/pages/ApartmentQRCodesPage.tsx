import React, { useState, useEffect, useCallback } from 'react';
import { BUILDING_16_APARTMENTS, BUILDING_INFO, mockPMSAdapter } from '@/features/pms/mockAdapter';
import { portalConfigService, ContactAndBuildingConfig } from '@/features/config/portalConfigService';
import { tokenService } from '@/lib/tokenService';
import { generateQRCodeDataUrl } from '@/lib/crypto';
import { PMSApartment } from '@/types/pms';
import { Button } from '@/components/ui/Button';
import {
  Download,
  Copy,
  Check,
  Printer,
  RefreshCw,
  ExternalLink,
  Search,
  Building2,
  Cross,
  Phone,
  Clock,
} from 'lucide-react';

interface ApartmentQRState {
  apartment: PMSApartment;
  reservationId: string;
  guestLabel: string;
  stayStatus: string;
  portalUrl: string;
  qrDataUrl: string;
  loading: boolean;
}

export const ApartmentQRCodesPage: React.FC = () => {
  const [cards, setCards] = useState<ApartmentQRState[]>([]);
  const [contact, setContact] = useState<ContactAndBuildingConfig>(portalConfigService.getContact());
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [copiedUnit, setCopiedUnit] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return portalConfigService.subscribe(() => {
      setContact(portalConfigService.getContact());
    });
  }, []);

  const buildQRForApartment = useCallback(async (apt: PMSApartment): Promise<ApartmentQRState> => {
    const res = await mockPMSAdapter.getReservationByApartmentUnit(apt.unitNumber);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    if (res && res.stayStatus === 'checked_in') {
      try {
        const generated = await tokenService.createPortalSession(res.id);
        const qrDataUrl = await generateQRCodeDataUrl(generated.portalUrl);
        return {
          apartment: apt,
          reservationId: res.id,
          guestLabel: res.primaryGuest.fullName,
          stayStatus: 'Active Stay',
          portalUrl: generated.portalUrl,
          qrDataUrl,
          loading: false,
        };
      } catch {
        // Fallback below
      }
    }

    const fallbackUrl = `${baseUrl}/portal?unit=${apt.unitNumber}`;
    const qrDataUrl = await generateQRCodeDataUrl(fallbackUrl);
    return {
      apartment: apt,
      reservationId: res?.id || `UNIT-${apt.unitNumber}`,
      guestLabel: res?.stayStatus === 'booked' ? `Arriving: ${res.primaryGuest.fullName}` : 'Ready for Check-in',
      stayStatus: res?.stayStatus === 'booked' ? 'Upcoming' : 'Vacant',
      portalUrl: fallbackUrl,
      qrDataUrl,
      loading: false,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initAll() {
      setInitializing(true);
      const results = await Promise.all(BUILDING_16_APARTMENTS.map(apt => buildQRForApartment(apt)));
      if (!cancelled) {
        setCards(results);
        setInitializing(false);
      }
    }
    initAll();
    return () => {
      cancelled = true;
    };
  }, [buildQRForApartment]);

  const handleRegenerate = async (unitNumber: string) => {
    setCards(prev =>
      prev.map(c => (c.apartment.unitNumber === unitNumber ? { ...c, loading: true } : c))
    );
    const apt = BUILDING_16_APARTMENTS.find(a => a.unitNumber === unitNumber);
    if (!apt) return;

    const existing = cards.find(c => c.apartment.unitNumber === unitNumber);
    if (existing?.reservationId) {
      await tokenService.revokeAllForReservation(existing.reservationId, 'Manual QR rotation by staff');
    }

    const refreshed = await buildQRForApartment(apt);
    setCards(prev =>
      prev.map(c => (c.apartment.unitNumber === unitNumber ? refreshed : c))
    );
  };

  const handleCopy = (unitNumber: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUnit(unitNumber);
    setTimeout(() => setCopiedUnit(null), 2000);
  };

  const handleDownload = (unitNumber: string, qrDataUrl: string) => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `guestcare-apartment-${unitNumber}-qr.png`;
    a.click();
  };

  const filteredCards = cards.filter(c => {
    if (selectedFloor !== 'all' && c.apartment.floor !== selectedFloor) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        c.apartment.unitNumber.toLowerCase().includes(q) ||
        c.apartment.name.toLowerCase().includes(q) ||
        c.guestLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const typeLabel = (type: PMSApartment['type']) => {
    switch (type) {
      case 'studio':
        return 'Studio';
      case 'one_bedroom':
        return '1 Bedroom';
      case 'two_bedroom':
        return '2 Bedroom';
      case 'penthouse':
        return 'Penthouse';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4F43] via-[#11574A] to-[#156758] p-5 sm:p-7 text-white shadow-lg">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-teal-200">
              <Building2 className="h-3.5 w-3.5" />
              <span>16 Apartments (1A – 8B) • Ground Floor Medical Store</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Apartment QR Codes
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-xl font-light">
              Every apartment from 1A to 8B has its own secure QR pass. Download PNGs, copy guest links, print for room frames, or reset tokens on new check-ins.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => window.print()}
            className="bg-white text-[#11574A] hover:bg-teal-50 font-bold text-xs rounded-xl px-4 py-2.5 gap-1.5 shadow-sm shrink-0 print:hidden"
          >
            <Printer className="h-4 w-4" />
            <span>Print All QR Cards</span>
          </Button>
        </div>
      </div>

      {/* Ground Floor Building Info Strip (Live Editable in Settings) */}
      <div className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <Cross className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                Ground Floor
              </span>
              <h2 className="text-sm font-bold text-slate-900">{contact.medicalStoreName}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{contact.medicalStoreDescription}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 shrink-0">
          <span className="inline-flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5 text-[#11574A]" />
            {contact.medicalStoreHours}
          </span>
          <a
            href={`tel:${contact.medicalStorePhone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1 font-mono font-semibold text-[#11574A] hover:underline"
          >
            <Phone className="h-3.5 w-3.5" />
            {contact.medicalStorePhone}
          </a>
        </div>
      </div>

      {/* Floor Filter Pills (1A-8B) + Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedFloor('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
              selectedFloor === 'all'
                ? 'bg-[#11574A] text-white border-[#11574A]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#11574A]/40'
            }`}
          >
            All (16)
          </button>
          {BUILDING_INFO.floors.map(floor => (
            <button
              key={floor}
              type="button"
              onClick={() => setSelectedFloor(floor)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
                selectedFloor === floor
                  ? 'bg-[#11574A] text-white border-[#11574A]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#11574A]/40'
              }`}
            >
              {floor}A–{floor}B
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search apt (e.g. 3A, 6B)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl bg-white pl-9 pr-3 py-2 text-xs text-slate-900 border border-slate-200 focus:border-[#11574A] focus:outline-none"
          />
        </div>
      </div>

      {/* 16 Apartment QR Code Cards Grid */}
      {initializing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200/70 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCards.map(card => {
            const isActive = card.stayStatus === 'Active Stay';
            const isCopied = copiedUnit === card.apartment.unitNumber;

            return (
              <div
                key={card.apartment.id}
                className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-[#11574A]/35 transition-all break-inside-avoid"
              >
                {/* Top Card Info */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-extrabold text-slate-900">
                        Apt {card.apartment.unitNumber}
                      </span>
                      <span className="rounded-md bg-[#F0F7F5] px-1.5 py-0.5 text-[10px] font-bold text-[#11574A]">
                        Floor {card.apartment.floor}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {typeLabel(card.apartment.type)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {card.stayStatus}
                  </span>
                </div>

                {/* Live QR Code Display */}
                <div className="my-3 flex flex-col items-center justify-center rounded-2xl bg-[#F6F8F8] p-3 border border-slate-100">
                  {card.loading ? (
                    <div className="h-36 w-36 flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-[#11574A]" />
                    </div>
                  ) : (
                    <img
                      src={card.qrDataUrl}
                      alt={`QR Code for Apartment ${card.apartment.unitNumber}`}
                      className="h-36 w-36 rounded-xl bg-white p-1.5 shadow-2xs object-contain"
                    />
                  )}
                  <span className="mt-2 text-[11px] font-semibold text-slate-700 truncate max-w-full">
                    {card.guestLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Scan for Apt {card.apartment.unitNumber} Portal
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 print:hidden">
                  <button
                    type="button"
                    onClick={() => handleDownload(card.apartment.unitNumber, card.qrDataUrl)}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F0F7F5] hover:bg-[#11574A] text-[#11574A] hover:text-white py-2 text-[10px] font-semibold transition-colors"
                    title="Download PNG"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(card.apartment.unitNumber, card.portalUrl)}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F6F8F8] hover:bg-slate-200/70 text-slate-700 py-2 text-[10px] font-semibold transition-colors"
                    title="Copy Guest Link"
                  >
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{isCopied ? 'Copied' : 'Link'}</span>
                  </button>

                  <a
                    href={card.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F6F8F8] hover:bg-slate-200/70 text-slate-700 py-2 text-[10px] font-semibold transition-colors"
                    title="Open Guest Portal"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRegenerate(card.apartment.unitNumber)}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F6F8F8] hover:bg-amber-50 hover:text-amber-700 text-slate-700 py-2 text-[10px] font-semibold transition-colors"
                    title="Rotate QR Token"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${card.loading ? 'animate-spin' : ''}`} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
