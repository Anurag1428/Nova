import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MediaAssetConfig, SALON_CONFIG } from '../data/salonData';
import { MediaSlot } from './MediaSlot';
import {
  captureBookingLead,
  saveCapturedLead,
  updateLeadStatus,
  dispatchLeadNotification,
} from '../utils/leadCapture';
import { useLiveSalonSettings } from '../utils/liveSalonSettings';
import {
  AVAILABLE_TIME_SLOTS,
  BookingFormInput,
  BookingValidationErrors,
  ConfirmedDemoBooking,
  createBookingRecord,
  findServiceById,
  getCategoryById,
  getCategoryServices,
  getUpcomingConsultationDates,
  generateEmailBookingUrl,
  generateWhatsAppMessageText,
  generateWhatsAppWebUrl,
  generateWhatsAppDesktopAppUrl,
  getWhatsAppUrlForDevice,
} from '../utils/bookingLogic';

interface BookingDrawerProps {
  isOpen: boolean;
  initialCategoryId?: string;
  initialRitualId?: string;
  initialClientName?: string;
  initialClientPhone?: string;
  initialNotes?: string;
  onClose: () => void;
  onBookingConfirmed: (booking: ConfirmedDemoBooking) => void;
  savedBookings: ConfirmedDemoBooking[];
}

const CATEGORY_SANCTUARY_FILMS: Record<string, MediaAssetConfig> = {
  facials: {
    id: 'booking-film-facials',
    videoPath: '/videos/approach-1.mp4',
    enableVideo: true,
    posterPath: '/images/service-facial.jpg',
    alt: 'Warm restorative botanical facial ritual inside NOVA private sanctuary',
    focalPoint: 'center center',
  },
  nails: {
    id: 'booking-film-nails',
    videoPath: '/videos/approach-4.mp4',
    enableVideo: true,
    posterPath: '/images/service-nails.jpg',
    alt: 'Minimalist hand and nail artistry ritual at NOVA',
    focalPoint: 'center center',
  },
  makeup: {
    id: 'booking-film-makeup',
    videoPath: '/videos/approach-3.mp4',
    enableVideo: true,
    posterPath: '/images/service-makeup.jpg',
    alt: 'Skin-first bridal and editorial makeup artistry at NOVA',
    focalPoint: 'center 35%',
  },
  consultations: {
    id: 'booking-film-consultations',
    videoPath: '/videos/approach-2.mp4',
    enableVideo: true,
    posterPath: '/images/service-consultation.jpg',
    alt: 'Bespoke botanical skincare consultation and formulation ritual at NOVA',
    focalPoint: 'center center',
  },
};

/**
 * STREAMLINED LUXURY CONSULTATION SANCTUARY
 * Clear, fast, and un-confusing single-flow appointment booking:
 * 1. Select Ritual from 4 clear categories
 * 2. Pick Preferred Date & Time in 1 tap
 * 3. Enter Name & WhatsApp Number (Autofill enabled)
 * 4. 1-Click Send via WhatsApp (with background auto-sync to Airtable CRM)
 */
export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  initialCategoryId,
  initialRitualId,
  initialClientName,
  initialClientPhone,
  initialNotes,
  onClose,
  onBookingConfirmed,
}) => {
  const liveSettings = useLiveSalonSettings();
  const defaultCategory = initialCategoryId || SALON_CONFIG.treatmentCategories[0].id;
  const defaultRituals = getCategoryServices(defaultCategory);
  const defaultRitual = initialRitualId || defaultRituals[0]?.id || '';

  const upcomingDates = useMemo(() => getUpcomingConsultationDates(6), []);

  const [form, setForm] = useState<BookingFormInput>({
    categoryId: defaultCategory,
    ritualId: defaultRitual,
    clientName: initialClientName || '',
    clientEmail: '',
    clientPhone: initialClientPhone || '',
    preferredDate: upcomingDates[0]?.iso || '',
    preferredTime: AVAILABLE_TIME_SLOTS[1],
    notes: initialNotes || '',
  });

  const [errors, setErrors] = useState<BookingValidationErrors>({});
  const [latestConfirmed, setLatestConfirmed] = useState<ConfirmedDemoBooking | null>(null);
  const [copied, setCopied] = useState(false);
  const [sentViaWhatsApp, setSentViaWhatsApp] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(false);

  // Stable refs to prevent render loops while maintaining auto-capture
  const currentLeadIdRef = useRef<string | null>(null);
  const autoDispatchedDraftPhoneRef = useRef<string>('');

  // Sync incoming preset values whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const catId = initialCategoryId || form.categoryId || SALON_CONFIG.treatmentCategories[0].id;
      const rituals = getCategoryServices(catId);
      const ritId =
        initialRitualId && rituals.some((r) => r.id === initialRitualId)
          ? initialRitualId
          : rituals[0]?.id || '';

      setForm((prev) => ({
        ...prev,
        categoryId: catId,
        ritualId: ritId,
        clientName: initialClientName || prev.clientName || '',
        clientPhone: initialClientPhone || prev.clientPhone || '',
        notes: initialNotes || prev.notes || '',
        preferredDate: prev.preferredDate || upcomingDates[0]?.iso || '',
      }));
      setErrors({});
      setLatestConfirmed(null);
      setSentViaWhatsApp(false);
      setCopied(false);
      setShowMessagePreview(false);
      currentLeadIdRef.current = null;
    }
  }, [isOpen, initialCategoryId, initialRitualId, initialClientName, initialClientPhone, initialNotes, upcomingDates]);

  // Lock body scroll when open and bind Escape key
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  // Real-time Keystroke Auto-Capture to Airtable CRM without state-loop
  useEffect(() => {
    const cleanPhone = form.clientPhone.replace(/\D/g, '');
    if (cleanPhone.length >= 10 && !latestConfirmed) {
      const timer = window.setTimeout(async () => {
        if (autoDispatchedDraftPhoneRef.current === cleanPhone) return;
        autoDispatchedDraftPhoneRef.current = cleanPhone;

        const activeCat = getCategoryById(form.categoryId) || SALON_CONFIG.treatmentCategories[0];
        const rituals = getCategoryServices(activeCat.id);
        const curRitual = rituals.find((r) => r.id === form.ritualId) || rituals[0];

        const formattedPhone = cleanPhone.length === 10
          ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
          : form.clientPhone.trim();

        const draftLead = saveCapturedLead({
          id: currentLeadIdRef.current || undefined,
          referenceCode: `LEAD-${cleanPhone.slice(-4)}`,
          clientName: form.clientName.trim() || 'Sanctuary Guest',
          clientPhone: formattedPhone,
          clientEmail: form.clientEmail.trim() || '',
          ritualName: curRitual?.name || 'Consultation Ritual',
          categoryId: activeCat.id,
          duration: curRitual?.duration || '60 min',
          examplePrice: curRitual?.examplePrice || '',
          preferredDate: form.preferredDate || new Date().toISOString().split('T')[0],
          preferredTime: form.preferredTime || '11:00 AM',
          notes: form.notes || 'Inquiry auto-captured while typing form',
          status: 'draft_entered',
          sentNotification: false,
        });

        currentLeadIdRef.current = draftLead.id;

        try {
          await dispatchLeadNotification(draftLead);
        } catch {
          // Non-blocking
        }
      }, 700);

      return () => window.clearTimeout(timer);
    }
  }, [form.clientName, form.clientPhone, form.clientEmail, form.preferredDate, form.preferredTime, form.ritualId, form.categoryId, form.notes, latestConfirmed]);

  if (!isOpen) return null;

  const activeCategory = getCategoryById(form.categoryId) || SALON_CONFIG.treatmentCategories[0];
  const availableRituals = getCategoryServices(activeCategory.id);
  const selectedMatch = findServiceById(form.ritualId);
  const selectedRitual = selectedMatch?.ritual || availableRituals[0];
  const activeMedia = CATEGORY_SANCTUARY_FILMS[activeCategory.id] || activeCategory.media;

  const handleCategorySelect = (newCategoryId: string) => {
    const nextRituals = getCategoryServices(newCategoryId);
    setForm((prev) => ({
      ...prev,
      categoryId: newCategoryId,
      ritualId: nextRituals[0]?.id || '',
    }));
    setErrors((prev) => ({ ...prev, categoryId: undefined, ritualId: undefined }));
  };

  const handleRitualSelect = (ritualId: string) => {
    setForm((prev) => ({ ...prev, ritualId }));
    setErrors((prev) => ({ ...prev, ritualId: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = form.clientPhone.replace(/\D/g, '');
    const validationErrors: BookingValidationErrors = {};

    if (!form.clientName.trim()) {
      validationErrors.clientName = 'Please enter your name.';
    }
    if (cleanPhone.length < 10) {
      validationErrors.clientPhone = 'Please enter a valid 10-digit mobile number.';
    }
    if (!form.preferredDate) {
      validationErrors.preferredDate = 'Please select your preferred date.';
    }
    if (!form.preferredTime) {
      validationErrors.preferredTime = 'Please select a preferred time slot.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const record = createBookingRecord(form);
    const captured = captureBookingLead(record, 'confirmed_on_site');
    currentLeadIdRef.current = captured.id;
    setLatestConfirmed(record);
    onBookingConfirmed(record);
  };

  const hasVipApplied = Boolean(form.notes && /VIP|Welcome Privilege/i.test(form.notes));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-drawer-title"
      data-testid="booking-sanctuary-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs text-[#18224B] animate-fade-in"
    >
      <div className="relative flex flex-col lg:flex-row h-full sm:h-auto sm:max-h-[92vh] w-full max-w-5xl bg-[#FBF9F5] border border-[#18224B]/15 shadow-2xl overflow-hidden">
        
        {/* LEFT ATMOSPHERIC CANVAS (Editorial Film + Selected Dossier) */}
        <aside
          aria-label="Selected Ritual Visual Atmosphere"
          className="relative h-40 sm:h-48 lg:h-auto lg:w-[40%] shrink-0 overflow-hidden bg-[#18224B] text-[#FBF9F5]"
        >
          <div key={activeCategory.id} className="absolute inset-0">
            <MediaSlot
              media={activeMedia}
              priority={true}
              subtleMotion={true}
              className="h-full w-full object-cover"
              overlayClassName="bg-gradient-to-b from-[#121620]/60 via-[#121620]/30 to-[#121620]/90"
            />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between p-5 lg:p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-brand text-xl lg:text-2xl tracking-[0.06em] text-[#FBF9F5] block">
                  {SALON_CONFIG.brand.name}
                </span>
                <span className="font-basel text-[10px] uppercase tracking-[0.16em] text-[#E8D5B5] block mt-1">
                  Private Sanctuary · Lucknow
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close booking modal"
                className="lg:hidden text-white/80 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mt-auto">
              <span className="font-basel text-[10px] uppercase tracking-[0.16em] text-[#E8D5B5] block">
                {activeCategory.shortLabel}
              </span>
              {selectedRitual && (
                <>
                  <h3 className="font-serif-editorial text-xl lg:text-2xl font-light text-[#FBF9F5] leading-tight">
                    {selectedRitual.name}
                  </h3>
                  <p className="font-mono-tabular text-xs text-[#E8D5B5]">
                    {selectedRitual.duration}{selectedRitual.examplePrice ? ` · ${selectedRitual.examplePrice}` : ''}
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT INTERACTIVE BOOKING FLOW */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 lg:p-9 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#18224B]/10 pb-4 mb-6">
              <div>
                <span className="font-basel text-[10px] uppercase tracking-[0.2em] text-[#9E7F4F] font-semibold block">
                  Bespoke Appointment
                </span>
                <h2
                  id="booking-drawer-title"
                  className="font-serif-editorial text-2xl sm:text-3xl font-light text-[#18224B] tracking-[-0.02em] mt-0.5"
                >
                  {latestConfirmed ? 'Consultation Invitation' : 'Reserve Your Ritual'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="hidden lg:inline-flex font-basel text-xs uppercase tracking-[0.1em] text-[#18224B]/50 hover:text-[#18224B] cursor-pointer p-1"
              >
                ✕ Close
              </button>
            </div>

            {hasVipApplied && !latestConfirmed && (
              <div className="mb-5 flex items-center gap-2 p-3 bg-[#C5B393]/15 border border-[#C5B393] text-xs font-basel text-[#18224B]">
                <span className="text-[#9E7F4F] font-bold">✦ VIP PRIVILEGE:</span>
                <span>Your ₹{liveSettings.voucherAmount} welcome credit voucher will be automatically applied at reception!</span>
              </div>
            )}

            {latestConfirmed ? (
              /* SUCCESS STATE: LETTERPRESS INVITATION CARD */
              <div className="space-y-6">
                <div className="border border-[#C5B393] bg-[#F6F1E9] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#18224B]/10 pb-3">
                    <span className="font-brand text-lg text-[#18224B]">NOVA Sanctuary</span>
                    <span className="font-mono-tabular text-xs font-bold text-[#18224B]">
                      REF: {latestConfirmed.referenceCode}
                    </span>
                  </div>

                  <dl className="space-y-2.5 text-xs font-basel">
                    <div className="flex justify-between">
                      <dt className="text-[#18224B]/60">Ritual:</dt>
                      <dd className="font-semibold text-[#18224B]">{latestConfirmed.ritualName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#18224B]/60">Schedule:</dt>
                      <dd className="font-mono-tabular text-[#18224B]">
                        {latestConfirmed.preferredDate} at {latestConfirmed.preferredTime}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#18224B]/60">Guest:</dt>
                      <dd className="text-[#18224B] font-medium">{latestConfirmed.clientName} ({latestConfirmed.clientPhone})</dd>
                    </div>
                    {latestConfirmed.notes && (
                      <div className="flex justify-between">
                        <dt className="text-[#18224B]/60">Notes:</dt>
                        <dd className="text-[#18224B]/80 max-w-[240px] text-right">{latestConfirmed.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Primary WhatsApp Action */}
                <div className="space-y-2">
                  <a
                    href={getWhatsAppUrlForDevice(latestConfirmed, '917275256535')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(generateWhatsAppMessageText(latestConfirmed)).catch(() => {});
                      }
                      if (currentLeadIdRef.current) {
                        updateLeadStatus(currentLeadIdRef.current, 'dispatched_whatsapp');
                      }
                      setCopied(true);
                      setSentViaWhatsApp(true);
                      window.setTimeout(() => setCopied(false), 3000);
                    }}
                    className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-xs uppercase tracking-[0.14em] bg-[#10B981] text-white hover:bg-[#059669] transition-all font-medium cursor-pointer shadow-sm"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.805 1.524zm6.208-3.82c1.62.96 3.238 1.455 5.097 1.456 5.485 0 9.948-4.463 9.951-9.95.001-2.658-1.034-5.158-2.91-7.036-1.877-1.878-4.376-2.912-7.037-2.914-5.487 0-9.95 4.463-9.952 9.951-.001 1.932.551 3.825 1.597 5.491l-.973 3.553 3.827-.551zm11.23-7.51c-.139-.232-.511-.372-1.069-.65-.558-.279-3.298-1.627-3.809-1.813-.512-.186-.883-.279-1.255.279-.372.558-1.441 1.813-1.766 2.185-.325.372-.65.418-1.208.14-.558-.279-2.356-.869-4.488-2.77-1.659-1.48-2.78-3.308-3.105-3.866-.325-.558-.035-.859.244-1.137.251-.25.558-.65.837-.975.279-.326.372-.558.558-.93.186-.372.093-.697-.046-.976-.139-.279-1.255-3.021-1.719-4.137-.453-1.087-.912-.94-1.255-.957l-1.07-.018c-.372 0-.976.139-1.487.697-.512.558-1.952 1.906-1.952 4.65 0 2.743 1.998 5.393 2.277 5.765.279.372 3.931 6.002 9.524 8.418 1.33.575 2.368.919 3.178 1.176 1.336.424 2.552.364 3.513.221 1.072-.16 3.298-1.348 3.763-2.65.465-1.302.465-2.417.326-2.65z"/>
                    </svg>
                    <span>Send Booking Request via WhatsApp</span>
                    <span>→</span>
                  </a>
                  <p className="text-[11px] text-center text-[#18224B]/60 font-basel">
                    Front Desk Reception: <span className="font-semibold">+91 72752 56535</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <a
                    href={generateWhatsAppWebUrl(latestConfirmed, '917275256535')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 text-[11px] font-basel uppercase tracking-[0.08em] border border-[#18224B]/20 bg-white hover:bg-[#18224B] hover:text-white transition-colors"
                  >
                    🌐 WhatsApp Web
                  </a>
                  <a
                    href={generateWhatsAppDesktopAppUrl(latestConfirmed, '917275256535')}
                    className="flex-1 text-center py-2.5 text-[11px] font-basel uppercase tracking-[0.08em] border border-[#18224B]/20 bg-white hover:bg-[#18224B] hover:text-white transition-colors"
                  >
                    💻 WhatsApp App
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setLatestConfirmed(null)}
                  className="w-full text-center text-xs font-basel uppercase tracking-[0.1em] text-[#18224B]/60 hover:text-[#18224B] pt-2 cursor-pointer"
                >
                  ← Modify Booking Details
                </button>
              </div>
            ) : (
              /* STREAMLINED SINGLE-FLOW BOOKING FORM */
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                
                {/* 1. Category Tabs */}
                <div>
                  <label className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/70 mb-2">
                    1. Select Modality
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SALON_CONFIG.treatmentCategories.map((cat) => {
                      const isSelected = cat.id === form.categoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`p-2.5 text-left border transition-all cursor-pointer font-basel text-xs ${
                            isSelected
                              ? 'border-[#18224B] bg-[#18224B] text-[#FBF9F5] font-medium shadow-sm'
                              : 'border-[#18224B]/20 bg-white text-[#18224B] hover:border-[#18224B]/50'
                          }`}
                        >
                          <span className="block truncate font-medium">{cat.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Ritual Cards Under Selected Category */}
                <div>
                  <label className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/70 mb-2">
                    2. Choose Specific Ritual
                  </label>
                  <div className="space-y-2">
                    {availableRituals.map((r) => {
                      const isSelected = r.id === form.ritualId;
                      return (
                        <div
                          key={r.id}
                          onClick={() => handleRitualSelect(r.id)}
                          className={`p-3.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-[#18224B] bg-white ring-2 ring-[#18224B]/20'
                              : 'border-[#18224B]/15 bg-white/70 hover:border-[#18224B]/40'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-serif-editorial text-base text-[#18224B] block font-normal">
                              {r.name}
                            </span>
                            <span className="text-[11px] text-[#18224B]/60 font-basel block truncate mt-0.5">
                              {r.summary}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            {r.examplePrice ? (
                              <span className="font-mono-tabular text-xs font-semibold text-[#18224B] block">
                                {r.examplePrice}
                              </span>
                            ) : null}
                            <span className="text-[10px] text-[#18224B]/50 font-mono-tabular block">
                              {r.duration}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Schedule Selection (Date & Time) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date Picker */}
                  <div>
                    <label className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/70 mb-2">
                      3. Preferred Date <span className="text-[#9E2A2B]">*</span>
                    </label>
                    <select
                      value={form.preferredDate}
                      onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
                      className="w-full bg-white border border-[#18224B]/20 px-3 py-2.5 text-xs font-basel text-[#18224B] focus:border-[#18224B] focus:outline-none"
                    >
                      {upcomingDates.map((d) => (
                        <option key={d.iso} value={d.iso}>
                          {d.displayLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Slot Picker */}
                  <div>
                    <label className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/70 mb-2">
                      Preferred Time <span className="text-[#9E2A2B]">*</span>
                    </label>
                    <select
                      value={form.preferredTime}
                      onChange={(e) => setForm((p) => ({ ...p, preferredTime: e.target.value }))}
                      className="w-full bg-white border border-[#18224B]/20 px-3 py-2.5 text-xs font-basel text-[#18224B] focus:border-[#18224B] focus:outline-none"
                    >
                      {AVAILABLE_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Guest Details with 1-Tap Autofill */}
                <div className="space-y-3 pt-1 border-t border-[#18224B]/10">
                  <span className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/70 pt-2">
                    4. Guest Contact Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="drawer-name" className="block text-[10.5px] uppercase tracking-[0.1em] text-[#18224B]/60 mb-1">
                        Your Full Name <span className="text-[#9E2A2B]">*</span>
                      </label>
                      <input
                        id="drawer-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        autoCapitalize="words"
                        placeholder="e.g. Aditya"
                        value={form.clientName}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, clientName: e.target.value }));
                          setErrors((prev) => ({ ...prev, clientName: undefined }));
                        }}
                        className="w-full bg-white border border-[#18224B]/20 px-3 py-2 text-base sm:text-xs font-basel text-[#18224B] focus:border-[#18224B] focus:outline-none"
                      />
                      {errors.clientName && (
                        <p className="text-[11px] text-[#9E2A2B] mt-0.5">{errors.clientName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="drawer-tel" className="block text-[10.5px] uppercase tracking-[0.1em] text-[#18224B]/60 mb-1">
                        WhatsApp Number <span className="text-[#9E2A2B]">*</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2.5 bg-[#F0ECE1] border border-r-0 border-[#18224B]/20 text-xs font-mono select-none">
                          +91
                        </span>
                        <input
                          id="drawer-tel"
                          name="tel"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="82992 32511"
                          value={form.clientPhone}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, clientPhone: e.target.value }));
                            setErrors((prev) => ({ ...prev, clientPhone: undefined }));
                          }}
                          className="flex-1 bg-white border border-[#18224B]/20 px-3 py-2 text-base sm:text-xs font-mono text-[#18224B] focus:border-[#18224B] focus:outline-none"
                        />
                      </div>
                      {errors.clientPhone && (
                        <p className="text-[11px] text-[#9E2A2B] mt-0.5">{errors.clientPhone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="drawer-notes" className="block text-[10.5px] uppercase tracking-[0.1em] text-[#18224B]/60 mb-1">
                      Notes or Special Requests (Optional)
                    </label>
                    <input
                      id="drawer-notes"
                      name="notes"
                      type="text"
                      placeholder="e.g. Sensitive skin, bridal preference..."
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      className="w-full bg-white border border-[#18224B]/20 px-3 py-2 text-base sm:text-xs font-basel text-[#18224B] focus:border-[#18224B] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 text-xs font-basel uppercase tracking-[0.14em] bg-[#18224B] text-[#FBF9F5] hover:bg-[#233168] transition-all font-medium cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Proceed to WhatsApp Confirmation</span>
                    <span>→</span>
                  </button>
                  <p className="text-[10.5px] text-center text-[#18224B]/55 font-basel mt-2">
                    Instant Auto-Capture · We confirm every reservation personally on +91 72752 56535
                  </p>
                </div>

              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
