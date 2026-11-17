import React, { useState, useEffect } from 'react';
import { pmsService } from '@/features/pms/pmsService';
import { tokenService, GeneratedTokenResult } from '@/lib/tokenService';
import { PMSReservation } from '@/types/pms';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { generateQRCodeDataUrl } from '@/lib/crypto';
import { QrCode, Copy, Check, Printer, Download, Sparkles, AlertCircle } from 'lucide-react';

interface QRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [reservations, setReservations] = useState<PMSReservation[]>([]);
  const [selectedResId, setSelectedResId] = useState<string>('');
  const [generated, setGenerated] = useState<GeneratedTokenResult | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPMS() {
      const pms = pmsService.getAdapter();
      const list = await pms.listActiveReservations();
      setReservations(list);
      if (list.length > 0) {
        setSelectedResId(list[0].id);
      }
    }
    if (isOpen) {
      loadPMS();
      setGenerated(null);
      setQrDataUrl(null);
      setError(null);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!selectedResId) return;
    setLoading(true);
    setError(null);

    try {
      const result = await tokenService.createPortalSession(selectedResId);
      setGenerated(result);

      const qr = await generateQRCodeDataUrl(result.portalUrl);
      setQrDataUrl(qr);
    } catch (err: any) {
      setError(err.message || 'Failed to generate token.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(generated.portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl || !generated) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `guestcare-qr-${generated.session.reservationRef}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const activeRes = reservations.find(r => r.id === selectedResId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Guest QR Pass"
      description="Create a cryptographically verified stay pass for room cards or check-in slips"
      size="md"
    >
      <div className="space-y-4 text-left">
        <div>
          <Select
            label="Select Active PMS Reservation"
            value={selectedResId}
            onChange={e => {
              setSelectedResId(e.target.value);
              setGenerated(null);
              setQrDataUrl(null);
            }}
            options={reservations.map(r => ({
              value: r.id,
              label: `${r.apartment.unitNumber} - ${r.primaryGuest.fullName} (${r.id})`,
            }))}
          />
        </div>

        {activeRes && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-900">{activeRes.apartment.name}</span>
              <span className="font-mono text-slate-500">{activeRes.stayStatus.toUpperCase()}</span>
            </div>
            <p>
              Guest: <strong>{activeRes.primaryGuest.fullName}</strong> ({activeRes.primaryGuest.email})
            </p>
            <p className="text-slate-500">
              Stay: {new Date(activeRes.checkInDate).toLocaleDateString()} to{' '}
              {new Date(activeRes.checkOutDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!generated ? (
          <Button
            type="button"
            className="w-full gap-2"
            loading={loading}
            onClick={handleGenerate}
          >
            <QrCode className="h-4 w-4" />
            <span>Generate Secure QR Code</span>
          </Button>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-200 text-center animate-fadeIn">
            {/* Visual Printable Card */}
            <div className="mx-auto max-w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-teal-800 font-bold text-sm">
                <span className="h-2 w-2 rounded-full bg-teal-600" />
                <span>GuestCare Digital Concierge</span>
              </div>

              {qrDataUrl && (
                <div className="mx-auto p-2 bg-white rounded-xl shadow-2xs border border-slate-100 inline-block">
                  <img src={qrDataUrl} alt="Guest Access QR" className="h-48 w-48 object-contain" />
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-900 uppercase">
                  {generated.session.apartmentRef}
                </p>
                <p className="text-[11px] text-slate-500">
                  Welcome, {generated.session.guestName}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Scan camera over code for instant service requests & room assistance
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs">
                {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload} className="text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>Download</span>
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint} className="text-xs">
                <Printer className="h-3.5 w-3.5 mr-1" />
                <span>Print Slip</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

