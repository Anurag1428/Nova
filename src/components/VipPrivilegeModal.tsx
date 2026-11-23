import React, { useEffect, useRef, useState } from 'react';
import {
  saveCapturedLead,
  dispatchLeadNotification,
} from '../utils/leadCapture';
import { useLiveSalonSettings } from '../utils/liveSalonSettings';

interface VipPrivilegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToBooking: (clientName: string, clientPhone: string, voucherCode: string) => void;
}

const VIP_STORAGE_DISMISSED = 'nova_vip_privilege_dismissed_v1';
const VIP_STORAGE_CLAIMED = 'nova_vip_privilege_claimed_v1';

export const VipPrivilegeModal: React.FC<VipPrivilegeModalProps> = ({
  isOpen,
  onClose,
  onApplyToBooking,
}) => {
  const liveSettings = useLiveSalonSettings();
  const voucherAmount = liveSettings.voucherAmount;
  const voucherCode = liveSettings.voucherCode;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoCapturedPhoneRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const claimed = window.localStorage.getItem(VIP_STORAGE_CLAIMED);
      if (claimed) {
        setIsClaimed(true);
      }
    }
  }, [isOpen]);

  // Real-time progressive auto-capture:
  // If user enters 10 digits, dispatch to Airtable after 800ms even if they NEVER click unlock!
  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length >= 10 && autoCapturedPhoneRef.current !== cleanPhone && !isClaimed) {
      const timer = window.setTimeout(async () => {
        autoCapturedPhoneRef.current = cleanPhone;
        const clientName = name.trim() || 'Sanctuary Guest';
        const formattedPhone = cleanPhone.length === 10
          ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
          : `+${cleanPhone}`;

        const lead = saveCapturedLead({
          referenceCode: voucherCode,
          clientName,
          clientPhone: formattedPhone,
          clientEmail: '',
          ritualName: 'Signature Facial',
          categoryId: 'vip',
          duration: 'Flexible',
          examplePrice: `₹${voucherAmount} Credit`,
          preferredDate: new Date().toISOString().split('T')[0],
          preferredTime: 'Flexible',
          notes: `VIP Privilege form filled (auto-captured before clicking unlock) · Voucher ${voucherCode}`,
          status: 'vip_privilege_claimed',
          sentNotification: false,
        });

        try {
          await dispatchLeadNotification(lead);
        } catch {
          // Non-blocking
        }
      }, 800);

      return () => window.clearTimeout(timer);
    }
  }, [name, phone, isClaimed, voucherAmount, voucherCode]);

  if (!isOpen || !liveSettings.isPopupActive) return null;

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIP_STORAGE_DISMISSED, 'true');
    }
    onClose();
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const clientName = name.trim() || 'Sanctuary Guest';
    const formattedPhone = cleanPhone.length === 10
      ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
      : `+${cleanPhone}`;

    // 1. Instantly capture lead in reception ledger
    const lead = saveCapturedLead({
      referenceCode: voucherCode,
      clientName,
      clientPhone: formattedPhone,
      clientEmail: '',
      ritualName: 'Signature Facial',
      categoryId: 'vip',
      duration: 'Flexible',
      examplePrice: `₹${voucherAmount} Credit`,
      preferredDate: new Date().toISOString().split('T')[0],
      preferredTime: 'Flexible',
      notes: `Claimed ₹${voucherAmount} VIP Welcome Privilege Voucher (${voucherCode})`,
      status: 'vip_privilege_claimed',
      sentNotification: false,
    });

    // 2. Dispatch real-time alert to salon owner
    try {
      await dispatchLeadNotification(lead);
    } catch {
      // Non-blocking
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIP_STORAGE_CLAIMED, formattedPhone);
      window.localStorage.setItem(VIP_STORAGE_DISMISSED, 'true');
    }

    setIsSubmitting(false);
    setIsClaimed(true);
  };

  const handleBookWithCredit = () => {
    onApplyToBooking(name.trim(), phone.trim(), voucherCode);
    onClose();
  };

  const cleanAdminPhone = '917275256535';
  const whatsAppVoucherText = encodeURIComponent(
    `Hello NOVA Sanctuary, I would like to claim my ₹${voucherAmount} Welcome Privilege voucher (${voucherCode}) for my first ritual. Name: ${name.trim() || 'Guest'} · Phone: ${phone.trim()}`
  );
  const whatsAppVoucherUrl = `https://wa.me/${cleanAdminPhone}?text=${whatsAppVoucherText}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-privilege-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-[#18224B] animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#FBF9F5] border-2 border-[#C5B393] shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close privilege modal"
          className="absolute top-4 right-4 font-basel text-xs uppercase tracking-[0.1em] text-[#18224B]/50 hover:text-[#18224B] transition-colors p-2 cursor-pointer"
        >
          ✕ Close
        </button>

        {!isClaimed ? (
          /* CLAIM FORM */
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="font-basel inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#9E7F4F] font-semibold">
                <span>✦</span>
                <span>Exclusive Sanctuary Privilege · Lucknow</span>
              </span>
              <h2
                id="vip-privilege-title"
                className="font-serif-editorial text-3xl sm:text-4xl font-light leading-[1.1] tracking-[-0.025em] text-[#18224B]"
              >
                The ₹{voucherAmount} Welcome Privilege
              </h2>
              <p className="font-basel text-[13px] leading-[1.6] text-[#18224B]/75 pt-1">
                Receive a private <strong className="font-semibold text-[#18224B]">₹{voucherAmount} welcome credit</strong> towards your first signature ritual (Facials, Nail Artistry, Makeup, or Hair) at Kingship by Kahlon, Lucknow.
              </p>
            </div>

            <form onSubmit={handleClaim} noValidate className="space-y-4">
              {/* Full Name Input with Autofill */}
              <div>
                <label
                  htmlFor="vip-name"
                  className="block font-basel text-[10.5px] uppercase tracking-[0.12em] text-[#18224B]/65 mb-1"
                >
                  Your Name (Optional)
                </label>
                <input
                  id="vip-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  autoCapitalize="words"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#18224B]/20 px-3.5 py-2.5 font-basel text-sm text-[#18224B] placeholder:text-[#18224B]/35 focus:border-[#18224B] focus:outline-none transition-colors"
                />
              </div>

              {/* Phone Input with Autofill */}
              <div>
                <label
                  htmlFor="vip-phone"
                  className="block font-basel text-[10.5px] uppercase tracking-[0.12em] text-[#18224B]/65 mb-1"
                >
                  WhatsApp Mobile Number <span className="text-[#9E2A2B]">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-[#F0ECE1] border border-r-0 border-[#18224B]/20 font-mono-tabular text-xs text-[#18224B]/70 select-none">
                    +91
                  </span>
                  <input
                    id="vip-phone"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError(null);
                    }}
                    className="flex-1 bg-white border border-[#18224B]/20 px-3.5 py-2.5 font-mono-tabular text-sm text-[#18224B] placeholder:text-[#18224B]/35 focus:border-[#18224B] focus:outline-none transition-colors"
                  />
                </div>
                {error && (
                  <p role="alert" className="mt-1 text-xs text-[#9E2A2B]">
                    {error}
                  </p>
                )}
                <span className="text-[10px] text-[#18224B]/50 mt-1 block">
                  Autofill enabled · Your voucher is delivered instantly. No spam ever.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-basel cursor-pointer py-4 px-6 text-[12px] uppercase tracking-[0.14em] bg-[#18224B] text-[#FBF9F5] hover:bg-[#2A3772] transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Activating Privilege...' : `Unlock ₹${voucherAmount} Sanctuary Credit →`}
              </button>
            </form>

            <div className="pt-2 border-t border-[#18224B]/10 flex items-center justify-between text-[11px] font-basel text-[#18224B]/55">
              <span>Valid on all treatments</span>
              <span>Kingship by Kahlon, Lucknow</span>
            </div>
          </div>
        ) : (
          /* CLAIMED / ACTIVATED STATE */
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#10B981]/15 text-[#065F46] text-xl">
              ✓
            </div>

            <div className="space-y-1">
              <span className="font-basel text-[10.5px] uppercase tracking-[0.2em] text-[#059669] font-medium block">
                Privilege Credit Activated
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#18224B]">
                Your ₹{voucherAmount} Voucher is Ready
              </h2>
              <p className="font-basel text-xs text-[#18224B]/70 max-w-sm mx-auto">
                We have reserved your introductory credit. Present this code or tap below to apply it to your appointment.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="border border-[#C5B393] bg-[#F6F1E9] p-5 space-y-2 select-all">
              <span className="font-basel text-[10px] uppercase tracking-[0.18em] text-[#18224B]/50 block">
                VOUCHER CODE
              </span>
              <span className="font-mono-tabular text-2xl tracking-[0.1em] text-[#18224B] font-bold block">
                {voucherCode}
              </span>
              <span className="text-[11px] font-basel text-[#059669] block font-medium">
                ₹{voucherAmount} OFF · NOVA Sanctuary, Lucknow
              </span>
            </div>

            {/* Next Steps Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleBookWithCredit}
                className="w-full font-basel cursor-pointer py-3.5 px-6 text-xs uppercase tracking-[0.12em] bg-[#18224B] text-white hover:bg-[#2A3772] transition-colors font-medium"
              >
                Book Ritual with ₹{voucherAmount} Credit →
              </button>

              <a
                href={whatsAppVoucherUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full font-basel inline-flex items-center justify-center gap-2 py-3 px-6 text-xs uppercase tracking-[0.12em] border border-[#10B981] bg-[#ECFDF5] text-[#065F46] hover:bg-[#10B981] hover:text-white transition-colors cursor-pointer"
              >
                <span>💬</span>
                <span>Send Voucher to My WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
