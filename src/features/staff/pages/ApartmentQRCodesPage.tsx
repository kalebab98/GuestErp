import React, { useState, useEffect, useCallback } from 'react';
import { BUILDING_INFO, mockPMSAdapter } from '@/features/pms/mockAdapter';
import { portalConfigService, ContactAndBuildingConfig } from '@/features/config/portalConfigService';
import { tokenService } from '@/lib/tokenService';
import { generateQRCodeDataUrl } from '@/lib/crypto';
import { PMSApartment, PMSStayStatus } from '@/types/pms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
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
  Edit2,
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

  // Edit Guest / Apartment Stay modal state
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    apartmentName: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    stayStatus: 'checked_in' as PMSStayStatus,
    checkInDate: '',
    checkOutDate: '',
  });

  useEffect(() => {
    return portalConfigService.subscribe(() => {
      setContact(portalConfigService.getContact());
    });
  }, []);

  const buildQRForApartment = useCallback(
    async (apt: PMSApartment, forceRotate = false): Promise<ApartmentQRState> => {
      const res = await mockPMSAdapter.getReservationByApartmentUnit(apt.unitNumber);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

      if (res && res.stayStatus === 'checked_in') {
        try {
          const generated = await tokenService.getOrCreateUnitSession(
            apt.unitNumber,
            res.id,
            forceRotate
          );
          const fullPortalUrl = `${baseUrl}/portal?token=${generated.rawToken}&unit=${apt.unitNumber}`;
          const qrDataUrl = await generateQRCodeDataUrl(fullPortalUrl);
          return {
            apartment: apt,
            reservationId: res.id,
            guestLabel: res.primaryGuest.fullName,
            stayStatus: 'Active Stay',
            portalUrl: fullPortalUrl,
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
        guestLabel:
          res?.stayStatus === 'booked'
            ? `Arriving: ${res.primaryGuest.fullName}`
            : 'Ready for Check-in',
        stayStatus: res?.stayStatus === 'booked' ? 'Upcoming' : 'Vacant',
        portalUrl: fallbackUrl,
        qrDataUrl,
        loading: false,
      };
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    async function initAll() {
      setInitializing(true);
      const allApts = mockPMSAdapter.listAllBuildingApartments();
      const results = await Promise.all(allApts.map(apt => buildQRForApartment(apt)));
      if (!cancelled) {
        setCards(results);
        setInitializing(false);
      }
    }
    initAll();
    const unsub = mockPMSAdapter.subscribe(() => {
      void initAll();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [buildQRForApartment]);

  const openEditStayModal = async (unitNumber: string) => {
    const apt = mockPMSAdapter
      .listAllBuildingApartments()
      .find(a => a.unitNumber === unitNumber);
    const res = await mockPMSAdapter.getReservationByApartmentUnit(unitNumber);
    const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10));

    setEditForm({
      apartmentName: apt?.name || `Apartment ${unitNumber}`,
      guestName: res?.primaryGuest.fullName || `Apartment ${unitNumber} Guest`,
      guestPhone: res?.primaryGuest.phone || '',
      guestEmail: res?.primaryGuest.email || '',
      stayStatus: res?.stayStatus || 'checked_in',
      checkInDate: toDateInput(res?.checkInDate),
      checkOutDate: toDateInput(res?.checkOutDate),
    });
    setEditingUnit(unitNumber);
  };

  const handleSaveStay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    mockPMSAdapter.updateApartmentStay(editingUnit, {
      apartmentName: editForm.apartmentName,
      guestName: editForm.guestName,
      guestPhone: editForm.guestPhone,
      guestEmail: editForm.guestEmail,
      stayStatus: editForm.stayStatus,
      checkInDate: new Date(`${editForm.checkInDate}T12:00:00Z`).toISOString(),
      checkOutDate: new Date(`${editForm.checkOutDate}T12:00:00Z`).toISOString(),
    });
    setEditingUnit(null);
  };

  const handleRegenerate = async (unitNumber: string) => {
    setCards(prev =>
      prev.map(c => (c.apartment.unitNumber === unitNumber ? { ...c, loading: true } : c))
    );
    const apt = mockPMSAdapter
      .listAllBuildingApartments()
      .find(a => a.unitNumber === unitNumber);
    if (!apt) return;

    const existing = cards.find(c => c.apartment.unitNumber === unitNumber);
    if (existing?.reservationId) {
      await tokenService.revokeAllForReservation(existing.reservationId, 'Manual QR rotation by staff');
    }

    const refreshed = await buildQRForApartment(apt, true);
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
      {/* Double-Bezel Obsidian-Emerald Header Banner */}
      <div className="bezel-shell rounded-[1.75rem] p-1.5">
        <div
          className="relative overflow-hidden rounded-[1.375rem] bg-[#0B231E] p-5 sm:p-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_48px_-20px_rgba(11,35,30,0.6)]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 80% at 10% 0%, rgba(45, 212, 191, 0.2), transparent 58%), radial-gradient(ellipse 55% 65% at 95% 100%, rgba(16, 185, 129, 0.14), transparent 55%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.45) 0.75px, transparent 0.75px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] ring-1 ring-white/[0.14] px-3 py-1 text-[11px] font-medium text-teal-100">
                <Building2 className="h-3.5 w-3.5 text-teal-300" />
                <span>16 Apartments (1A – 8B) • Ground Floor Medical Store</span>
              </div>
              <h1 className="text-[22px] sm:text-[26px] font-bold tracking-[-0.03em] text-white leading-tight">
                Apartments & QR Codes
              </h1>
              <p className="text-xs sm:text-[13.5px] text-teal-100/80 max-w-xl font-normal leading-relaxed">
                Edit guest stays, download room PNGs, copy live links, print for room plaques, or rotate tokens on check-in.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="print:hidden self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-teal-50 text-[#0B231E] font-semibold text-xs px-4 h-9 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.4)] active:scale-95 transition-all shrink-0"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print All QR Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ground Floor Medical Store Card (Porcelain) */}
      <div className="porcelain-card rounded-2xl border border-slate-200/75 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 ring-1 ring-rose-200/70 text-rose-600">
            <Cross className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#F6F8FA] ring-1 ring-slate-900/[0.06] px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                Ground Floor
              </span>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-slate-900">
                {contact.medicalStoreName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{contact.medicalStoreDescription}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 shrink-0">
          <span className="inline-flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5 text-[#0F4C40]" />
            {contact.medicalStoreHours}
          </span>
          <a
            href={`tel:${contact.medicalStorePhone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#F2F7F5] px-2.5 py-1 font-mono tabular-nums font-semibold text-[#0F4C40] hover:bg-[#E5F2EE] transition-colors"
          >
            <Phone className="h-3 w-3" />
            {contact.medicalStorePhone}
          </a>
        </div>
      </div>

      {/* Floor Filter Pills (1A-8B) + Spotlight Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 print:hidden">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedFloor('all')}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedFloor === 'all'
                ? 'bg-[#0F4C40] text-white shadow-[0_2px_8px_-2px_rgba(15,76,64,0.4)]'
                : 'bg-white text-slate-600 ring-1 ring-slate-900/[0.07] hover:ring-[#0F4C40]/35'
            }`}
          >
            All (16)
          </button>
          {BUILDING_INFO.floors.map(floor => (
            <button
              key={floor}
              type="button"
              onClick={() => setSelectedFloor(floor)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums transition-all ${
                selectedFloor === floor
                  ? 'bg-[#0F4C40] text-white shadow-[0_2px_8px_-2px_rgba(15,76,64,0.4)]'
                  : 'bg-white text-slate-600 ring-1 ring-slate-900/[0.07] hover:ring-[#0F4C40]/35'
              }`}
            >
              {floor}A–{floor}B
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search apt (e.g. 3A, 6B) or guest..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-full bg-white pl-9 pr-3.5 h-9 text-xs text-slate-900 ring-1 ring-slate-900/[0.08] shadow-[0_1px_2px_rgba(15,23,42,0.03)] focus:ring-2 focus:ring-[#0F4C40]/35 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* 16 Apartment QR Code Cards Grid */}
      {initializing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200/70 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredCards.map(card => {
            const isActive = card.stayStatus === 'Active Stay';
            const isCopied = copiedUnit === card.apartment.unitNumber;

            return (
              <div
                key={card.apartment.id}
                className="porcelain-card flex flex-col justify-between rounded-2xl border border-slate-200/75 hover:border-[#0F4C40]/30 p-3.5 sm:p-4 break-inside-avoid"
              >
                {/* Top Card Info */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-bold tracking-[-0.02em] text-slate-900">
                        Apt {card.apartment.unitNumber}
                      </span>
                      <span className="rounded-md bg-[#F2F7F5] ring-1 ring-[#0F4C40]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#0F4C40] tabular-nums">
                        F{card.apartment.floor}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {typeLabel(card.apartment.type)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/20'
                          : 'bg-slate-100 text-slate-600 ring-slate-900/[0.06]'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {isActive ? 'Active' : card.stayStatus}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditStayModal(card.apartment.unitNumber)}
                      className="print:hidden inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F6F8FA] ring-1 ring-slate-900/[0.06] hover:bg-[#0F4C40] text-slate-600 hover:text-white active:scale-90 transition-all"
                      title={`Edit Apt ${card.apartment.unitNumber} Guest & Stay`}
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Machined QR Frame */}
                <div className="my-3 flex flex-col items-center justify-center rounded-2xl bg-[#F6F8FA] p-3 ring-1 ring-slate-900/[0.04]">
                  {card.loading ? (
                    <div className="h-36 w-36 flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin text-[#0F4C40]" />
                    </div>
                  ) : (
                    <img
                      src={card.qrDataUrl}
                      alt={`QR Code for Apartment ${card.apartment.unitNumber}`}
                      className="h-36 w-36 rounded-xl bg-white p-1.5 ring-1 ring-slate-900/[0.06] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] object-contain"
                    />
                  )}
                  <span className="mt-2.5 text-xs font-semibold text-slate-800 truncate max-w-full">
                    {card.guestLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Apt {card.apartment.unitNumber} Portal Pass
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-0.5 print:hidden">
                  <button
                    type="button"
                    onClick={() => handleDownload(card.apartment.unitNumber, card.qrDataUrl)}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F2F7F5] hover:bg-[#0F4C40] text-[#0F4C40] hover:text-white ring-1 ring-[#0F4C40]/10 py-1.5 text-[10px] font-semibold active:scale-95 transition-all"
                    title="Download PNG"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(card.apartment.unitNumber, card.portalUrl)}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F6F8FA] hover:bg-slate-200/70 text-slate-700 ring-1 ring-slate-900/[0.05] py-1.5 text-[10px] font-semibold active:scale-95 transition-all"
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
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F6F8FA] hover:bg-slate-200/70 text-slate-700 ring-1 ring-slate-900/[0.05] py-1.5 text-[10px] font-semibold active:scale-95 transition-all"
                    title="Open Guest Portal"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRegenerate(card.apartment.unitNumber)}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F6F8FA] hover:bg-amber-50 hover:text-amber-700 text-slate-700 ring-1 ring-slate-900/[0.05] py-1.5 text-[10px] font-semibold active:scale-95 transition-all"
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

      {/* Edit Apartment & Guest Stay Modal */}
      <Modal
        isOpen={Boolean(editingUnit)}
        onClose={() => setEditingUnit(null)}
        title={`Edit Apartment ${editingUnit || ''} & Guest Stay`}
        description="Updates guest name, stay dates, status, and apartment portal immediately across devices"
        size="md"
      >
        <form onSubmit={handleSaveStay} className="space-y-3.5 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Apartment Label"
              value={editForm.apartmentName}
              onChange={e => setEditForm({ ...editForm, apartmentName: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Stay Status</label>
              <select
                value={editForm.stayStatus}
                onChange={e => setEditForm({ ...editForm, stayStatus: e.target.value as PMSStayStatus })}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-[#11574A] focus:outline-none"
              >
                <option value="checked_in">Active Stay (Checked In)</option>
                <option value="booked">Upcoming Arrival (Booked)</option>
                <option value="checked_out">Vacant (Checked Out)</option>
              </select>
            </div>
          </div>

          <Input
            label="Guest Full Name"
            placeholder="e.g. Abebe Bikila or Apartment Guest"
            value={editForm.guestName}
            onChange={e => setEditForm({ ...editForm, guestName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Guest Phone"
              placeholder="+251 911 ..."
              value={editForm.guestPhone}
              onChange={e => setEditForm({ ...editForm, guestPhone: e.target.value })}
            />
            <Input
              label="Guest Email"
              type="email"
              placeholder="guest@email.com"
              value={editForm.guestEmail}
              onChange={e => setEditForm({ ...editForm, guestEmail: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Check-in Date"
              type="date"
              value={editForm.checkInDate}
              onChange={e => setEditForm({ ...editForm, checkInDate: e.target.value })}
              required
            />
            <Input
              label="Check-out Date"
              type="date"
              value={editForm.checkOutDate}
              onChange={e => setEditForm({ ...editForm, checkOutDate: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditingUnit(null)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              <span>Save Stay Changes</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
