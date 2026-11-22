import React, { useEffect, useMemo, useState } from 'react';
import { MediaAssetConfig, SALON_CONFIG } from '../data/salonData';
import { MediaSlot } from './MediaSlot';
import {
  AVAILABLE_TIME_SLOTS,
  BookingFormInput,
  BookingStep,
  BookingValidationErrors,
  ConfirmedDemoBooking,
  createBookingRecord,
  findServiceById,
  getCategoryById,
  getCategoryServices,
  getUpcomingConsultationDates,
  generateEmailBookingUrl,
  generateWhatsAppBookingUrl,
  generateWhatsAppMessageText,
  RITUAL_PREFERENCE_TAGS,
  toggleRitualPreferenceNote,
  validateBookingForm,
  validateBookingStep,
} from '../utils/bookingLogic';

interface BookingDrawerProps {
  isOpen: boolean;
  initialCategoryId?: string;
  initialRitualId?: string;
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

const STEP_LABELS: { step: BookingStep; index: string; label: string }[] = [
  { step: 1, index: '01', label: 'Ritual' },
  { step: 2, index: '02', label: 'Schedule' },
  { step: 3, index: '03', label: 'Guest Details' },
];

/**
 * IMMERSIVE FULL-VIEWPORT CONSULTATION SANCTUARY
 * Split architectural experience:
 * - Left: Full-bleed live salon film that crossfades to match the chosen treatment
 *   category, paired with a real-time ritual dossier (duration, inclusions, fee).
 * - Right: Calm 3-stage warm alabaster (#FBF9F5) booking concierge with tactile
 *   ritual cards, quick date & time tiles, preference notes, and a letterpress
 *   NOVA confirmation invitation.
 */
export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  initialCategoryId,
  initialRitualId,
  onClose,
  onBookingConfirmed,
  savedBookings,
}) => {
  const defaultCategory = initialCategoryId || SALON_CONFIG.treatmentCategories[0].id;
  const defaultRituals = getCategoryServices(defaultCategory);
  const defaultRitual = initialRitualId || defaultRituals[0]?.id || '';

  const [rendered, setRendered] = useState(isOpen);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<BookingStep>(1);

  const [form, setForm] = useState<BookingFormInput>({
    categoryId: defaultCategory,
    ritualId: defaultRitual,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    preferredDate: '',
    preferredTime: AVAILABLE_TIME_SLOTS[1],
    notes: '',
  });

  const [errors, setErrors] = useState<BookingValidationErrors>({});
  const [latestConfirmed, setLatestConfirmed] = useState<ConfirmedDemoBooking | null>(null);
  const [copied, setCopied] = useState(false);

  const upcomingDates = useMemo(() => getUpcomingConsultationDates(6), []);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const catId = initialCategoryId || SALON_CONFIG.treatmentCategories[0].id;
      const rituals = getCategoryServices(catId);
      const ritId =
        initialRitualId && rituals.some((r) => r.id === initialRitualId)
          ? initialRitualId
          : rituals[0]?.id || '';

      setForm((prev) => ({
        ...prev,
        categoryId: catId,
        ritualId: ritId,
      }));
      setStep(1);
      setErrors({});
      setLatestConfirmed(null);

      let raf2 = 0;
      const raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      const fallbackTimer = window.setTimeout(() => {
        setVisible(true);
      }, 60);

      return () => {
        window.cancelAnimationFrame(raf1);
        if (raf2) window.cancelAnimationFrame(raf2);
        window.clearTimeout(fallbackTimer);
      };
    }

    setVisible(false);
    const timer = window.setTimeout(() => {
      setRendered(false);
    }, 420);
    return () => window.clearTimeout(timer);
  }, [isOpen, initialCategoryId, initialRitualId]);

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

  if (!rendered) return null;

  const activeCategory =
    getCategoryById(form.categoryId) || SALON_CONFIG.treatmentCategories[0];
  const availableRituals = getCategoryServices(activeCategory.id);
  const selectedMatch = findServiceById(form.ritualId);
  const selectedRitual = selectedMatch?.ritual || availableRituals[0];
  const activeMedia =
    CATEGORY_SANCTUARY_FILMS[activeCategory.id] || activeCategory.media;

  const handleCategoryChange = (newCategoryId: string) => {
    const nextRituals = getCategoryServices(newCategoryId);
    setForm((prev) => ({
      ...prev,
      categoryId: newCategoryId,
      ritualId: nextRituals[0]?.id || '',
    }));
    setErrors((prev) => ({ ...prev, categoryId: undefined, ritualId: undefined }));
  };

  const handleNextStep = () => {
    const check = validateBookingStep(step, form);
    if (!check.isValid) {
      setErrors(check.errors);
      return;
    }
    setErrors({});
    if (step < 3) {
      setStep((prev) => (prev + 1) as BookingStep);
    }
  };

  const handleStepTabClick = (targetStep: BookingStep) => {
    if (latestConfirmed) return;
    if (targetStep <= step) {
      setErrors({});
      setStep(targetStep);
      return;
    }
    // Validate intermediate step(s) before jumping forward
    for (let s = step; s < targetStep; s++) {
      const check = validateBookingStep(s as BookingStep, form);
      if (!check.isValid) {
        setErrors(check.errors);
        setStep(s as BookingStep);
        return;
      }
    }
    setErrors({});
    setStep(targetStep);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBookingForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      if (validation.errors.categoryId || validation.errors.ritualId) {
        setStep(1);
      } else if (validation.errors.preferredDate || validation.errors.preferredTime) {
        setStep(2);
      }
      return;
    }

    const record = createBookingRecord(form);
    setLatestConfirmed(record);
    onBookingConfirmed(record);
  };

  const handleStartAnother = () => {
    setLatestConfirmed(null);
    setStep(1);
    setErrors({});
  };

  const selectedDateDisplay =
    upcomingDates.find((d) => d.iso === form.preferredDate)?.displayLabel ||
    form.preferredDate ||
    null;

  const progressWidthPercent = latestConfirmed ? 100 : (step / 3) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-drawer-title"
      data-testid="booking-sanctuary-modal"
      data-step={latestConfirmed ? 'confirmed' : String(step)}
      data-state={visible ? 'open' : 'closing'}
      className={`fixed inset-0 z-50 bg-[#FBF9F5] text-[#18224B] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex h-full w-full flex-col lg:flex-row">
        {/* LEFT ATMOSPHERIC RITUAL CANVAS (Live Film + Real-Time Selected Ritual Dossier) */}
        <aside
          aria-label="Selected Ritual Visual Atmosphere"
          className="relative h-44 sm:h-52 lg:h-full w-full lg:w-[44%] shrink-0 overflow-hidden bg-[#18224B] text-[#FBF9F5]"
        >
          {/* Crossfading Category Salon Film */}
          <div key={activeCategory.id} className="absolute inset-0 animate-fade-in">
            <MediaSlot
              media={activeMedia}
              priority={true}
              subtleMotion={true}
              className="h-full w-full"
              overlayClassName="bg-gradient-to-b from-[#121620]/60 via-[#121620]/25 to-[#121620]/85"
            />
          </div>

          {/* Atmospheric Content Overlay */}
          <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7 lg:p-10">
            {/* Top Bar over Film */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-brand block text-2xl lg:text-[1.9rem] tracking-[0.06em] text-[#FBF9F5] leading-none">
                  {SALON_CONFIG.brand.name}
                </span>
                <span className="font-basel mt-1.5 block text-[10px] uppercase tracking-[0.18em] text-[#E8D5B5]">
                  Private Consultation · Lucknow
                </span>
              </div>

              {/* Mobile Close Control */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close appointment panel"
                className="lg:hidden font-basel cursor-pointer px-3 py-1.5 text-[10.5px] uppercase tracking-[0.12em] text-[#FBF9F5] border border-[#FBF9F5]/35 hover:border-[#FBF9F5] transition-colors whitespace-nowrap shrink-0"
              >
                Close
              </button>
            </div>

            {/* Bottom Live Selected Ritual Dossier (Full on Desktop, Compact Summary on Mobile) */}
            <div className="space-y-4 lg:space-y-6">
              <div className="space-y-1.5 lg:space-y-2.5">
                <div className="flex items-center gap-3 font-basel text-[10.5px] uppercase tracking-[0.16em] text-[#E8D5B5]">
                  <span>{activeCategory.index}</span>
                  <span aria-hidden="true" className="h-px w-6 bg-[#E8D5B5]/55" />
                  <span>{activeCategory.shortLabel}</span>
                </div>

                {selectedRitual && (
                  <>
                    <h3 className="font-serif-editorial text-xl sm:text-2xl lg:text-[2rem] font-light leading-[1.14] tracking-[-0.02em] text-[#FBF9F5]">
                      {selectedRitual.name}
                    </h3>
                    <p className="hidden lg:block font-basel text-[13.5px] leading-[1.6] text-[#FBF9F5]/82 max-w-[400px]">
                      {selectedRitual.summary}
                    </p>
                  </>
                )}
              </div>

              {/* Desktop Inclusions List */}
              {selectedRitual && (
                <div className="hidden lg:block border-t border-[#FBF9F5]/20 pt-5 space-y-3">
                  <span className="block font-basel text-[10px] uppercase tracking-[0.16em] text-[#FBF9F5]/60">
                    Ritual Includes
                  </span>
                  <ul className="grid grid-cols-1 gap-1.5">
                    {selectedRitual.includes.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 font-basel text-[12.5px] text-[#FBF9F5]/88"
                      >
                        <span
                          aria-hidden="true"
                          className="h-1 w-1 rounded-full bg-[#E8D5B5] shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Live Timing & Fee Bar */}
              {selectedRitual && (
                <div className="hidden sm:flex flex-wrap items-center justify-between gap-4 border-t border-[#FBF9F5]/20 pt-3.5 lg:pt-4 font-mono-tabular text-[11px] text-[#FBF9F5]/85">
                  <span>
                    {selectedRitual.duration} · {selectedRitual.examplePrice}
                  </span>
                  {selectedDateDisplay ? (
                    <span className="text-[#E8D5B5]">
                      {selectedDateDisplay} · {form.preferredTime}
                    </span>
                  ) : (
                    <span className="text-[#FBF9F5]/55">10:00 AM – 9:00 PM IST</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT WARM ALABASTER CONCIERGE FLOW */}
        <div className="flex-1 h-full overflow-y-auto bg-[#FBF9F5] text-[#18224B] flex flex-col justify-between">
          <div>
            {/* Sticky Top Step Progress Header */}
            <div className="sticky top-0 z-20 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#18224B]/10">
              <div className="mx-auto max-w-[660px] px-5 sm:px-8 lg:px-12 py-4 sm:py-5 flex items-center justify-between gap-4">
                <nav
                  aria-label="Consultation Booking Steps"
                  className="flex items-center gap-4 sm:gap-7 overflow-x-auto"
                >
                  {STEP_LABELS.map((item) => {
                    const isCurrent = !latestConfirmed && step === item.step;
                    const isCompleted = latestConfirmed !== null || step > item.step;
                    return (
                      <button
                        key={item.step}
                        type="button"
                        onClick={() => handleStepTabClick(item.step)}
                        disabled={latestConfirmed !== null}
                        className={`cursor-pointer inline-flex items-center gap-1.5 font-basel text-[10.5px] uppercase tracking-[0.1em] transition-colors whitespace-nowrap shrink-0 ${
                          isCurrent
                            ? 'text-[#18224B] font-medium'
                            : isCompleted
                              ? 'text-[#18224B]/70 hover:text-[#18224B]'
                              : 'text-[#18224B]/35 hover:text-[#18224B]/65'
                        }`}
                      >
                        <span className="font-mono-tabular text-[10px]">{item.index}.</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close appointment panel"
                  className="hidden lg:inline-block font-basel cursor-pointer py-1 text-[11px] uppercase tracking-[0.08em] text-[#18224B] hover:opacity-55 transition-opacity whitespace-nowrap shrink-0"
                >
                  Close
                </button>
              </div>

              {/* Hairline Progress Track */}
              <div className="h-[1.5px] w-full bg-[#18224B]/8">
                <div
                  className="h-full bg-[#18224B] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${progressWidthPercent}%` }}
                />
              </div>
            </div>

            {/* Main Interactive Content Container */}
            <div className="mx-auto max-w-[660px] px-5 sm:px-8 lg:px-12 py-7 sm:py-10 lg:py-12">
              {latestConfirmed ? (
                /* LUXURY LETTERPRESS CONFIRMATION INVITATION */
                <div
                  data-testid="booking-success-state"
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <span className="font-basel inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-[#9E7F4F]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#9E7F4F]" />
                      Consultation Invitation Prepared
                    </span>
                    <h2
                      id="booking-drawer-title"
                      className="font-serif-editorial text-3xl sm:text-4xl lg:text-[2.6rem] font-light leading-[1.1] tracking-[-0.025em] text-[#18224B]"
                    >
                      We look forward to welcoming you, {latestConfirmed.clientName}.
                    </h2>
                    <p className="font-basel text-[13.5px] leading-[1.6] text-[#18224B]/72">
                      Your consultation dossier has been formatted and is ready for transmission directly to NOVA Reception at Kingship by Kahlon, Lucknow.
                    </p>
                  </div>

                  {/* Instant Message Dispatcher to Lucknow Reception */}
                  <div className="border-2 border-[#18224B]/15 bg-[#FBF9F5] p-5 sm:p-7 space-y-5 shadow-[0_8px_32px_rgba(24,34,75,0.04)]">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-3 w-3 rounded-full bg-[#10B981] mt-1 shrink-0 animate-pulse" aria-hidden="true" />
                      <div>
                        <h3 className="font-serif-editorial text-[1.25rem] text-[#18224B]">
                          Transmit Dossier to Reception
                        </h3>
                        <p className="font-basel text-[12.5px] leading-[1.5] text-[#18224B]/75 mt-0.5">
                          Tap below to send your complete appointment details directly to NOVA front desk on WhatsApp or via Email.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* WhatsApp Transmission */}
                      <a
                        href={generateWhatsAppBookingUrl(latestConfirmed)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-basel inline-flex items-center justify-center gap-2 px-5 py-4 text-[11px] uppercase tracking-[0.12em] bg-[#10B981] text-white hover:bg-[#059669] transition-all whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer"
                      >
                        <span className="text-sm">💬</span>
                        <span>Send via WhatsApp</span>
                        <span>→</span>
                      </a>

                      {/* Email Transmission */}
                      <a
                        href={generateEmailBookingUrl(latestConfirmed)}
                        className="font-basel inline-flex items-center justify-center gap-2 px-5 py-4 text-[11px] uppercase tracking-[0.12em] border border-[#18224B] text-[#18224B] hover:bg-[#18224B] hover:text-[#FBF9F5] transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span className="text-sm">✉️</span>
                        <span>Email to Reception</span>
                        <span>→</span>
                      </a>
                    </div>

                    {/* Direct Desk Call & Copy Details Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#18224B]/10 text-xs font-basel">
                      <a
                        href="tel:+917275256535"
                        className="inline-flex items-center gap-1.5 text-[#18224B] hover:underline cursor-pointer"
                      >
                        <span>Call Reception:</span>
                        <span className="font-mono-tabular font-medium">(+91) 7275256535</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(generateWhatsAppMessageText(latestConfirmed));
                            setCopied(true);
                            window.setTimeout(() => setCopied(false), 2500);
                          }
                        }}
                        className="cursor-pointer text-[#18224B]/80 hover:text-[#18224B] transition-colors underline underline-offset-4"
                      >
                        {copied ? '✓ Booking Details Copied to Clipboard' : 'Copy Booking Details'}
                      </button>
                    </div>
                  </div>

                  {/* Invitation Card */}
                  <div className="border border-[#C5B393]/75 bg-[#F6F1E9] p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[#18224B]/12 pb-4">
                      <div>
                        <span className="font-brand text-xl tracking-[0.08em] text-[#18224B]">
                          {SALON_CONFIG.brand.name}
                        </span>
                        <span className="block font-basel text-[10px] uppercase tracking-[0.16em] text-[#18224B]/55 mt-0.5">
                          Sanctuary Dossier
                        </span>
                      </div>
                      <span className="font-mono-tabular text-xs tracking-[0.06em] text-[#18224B] border border-[#18224B]/20 px-3 py-1">
                        REF · {latestConfirmed.referenceCode}
                      </span>
                    </div>

                    <dl className="divide-y divide-[#18224B]/10 text-[13px] font-basel">
                      <div className="py-3.5 flex justify-between gap-4">
                        <dt className="text-[#18224B]/55 uppercase text-[10.5px] tracking-[0.12em]">
                          Selected Ritual
                        </dt>
                        <dd className="text-right font-serif-editorial text-[17px] text-[#18224B]">
                          {latestConfirmed.ritualName}
                        </dd>
                      </div>
                      <div className="py-3.5 flex justify-between gap-4">
                        <dt className="text-[#18224B]/55 uppercase text-[10.5px] tracking-[0.12em]">
                          Duration &amp; Fee
                        </dt>
                        <dd className="font-mono-tabular text-xs text-right text-[#18224B]">
                          {latestConfirmed.duration} · {latestConfirmed.examplePrice}
                        </dd>
                      </div>
                      <div className="py-3.5 flex justify-between gap-4">
                        <dt className="text-[#18224B]/55 uppercase text-[10.5px] tracking-[0.12em]">
                          Preferred Arrival
                        </dt>
                        <dd className="font-mono-tabular text-xs text-right text-[#18224B]">
                          {latestConfirmed.preferredDate} · {latestConfirmed.preferredTime}
                        </dd>
                      </div>
                      <div className="py-3.5 flex justify-between gap-4">
                        <dt className="text-[#18224B]/55 uppercase text-[10.5px] tracking-[0.12em]">
                          Guest Contact
                        </dt>
                        <dd className="text-right text-xs text-[#18224B]">
                          {latestConfirmed.clientEmail} · {latestConfirmed.clientPhone}
                        </dd>
                      </div>
                      {latestConfirmed.notes && (
                        <div className="py-3.5 flex justify-between gap-4">
                          <dt className="text-[#18224B]/55 uppercase text-[10.5px] tracking-[0.12em]">
                            Notes
                          </dt>
                          <dd className="text-right text-xs text-[#18224B]/85 max-w-[280px]">
                            {latestConfirmed.notes}
                          </dd>
                        </div>
                      )}
                      <div className="py-3.5 flex justify-between gap-4">
                        <dt className="text-[#18224B]/55 uppercase text-[10.5px] tracking-[0.12em]">
                          Sanctuary
                        </dt>
                        <dd className="text-right text-xs text-[#18224B]/80">
                          Kingship by Kahlon, Sector 16, Vrindavan Colony, Lucknow
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={handleStartAnother}
                      className="font-basel cursor-pointer px-6 py-3.5 text-[11px] uppercase tracking-[0.14em] bg-[#18224B] text-[#FBF9F5] hover:bg-[#233168] transition-colors whitespace-nowrap shrink-0"
                    >
                      Reserve Another Ritual
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="font-basel cursor-pointer px-6 py-3.5 text-[11px] uppercase tracking-[0.14em] border border-[#18224B]/25 text-[#18224B] hover:border-[#18224B] transition-colors whitespace-nowrap shrink-0"
                    >
                      Return to NOVA
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-8">
                  {/* STEP 1: RITUAL CURATION */}
                  {step === 1 && (
                    <div className="space-y-7">
                      <div className="space-y-2">
                        <span className="font-basel block text-[10.5px] uppercase tracking-[0.18em] text-[#18224B]/55">
                          Step 01 of 03 · Curate Your Experience
                        </span>
                        <h2
                          id="booking-drawer-title"
                          className="font-serif-editorial text-3xl sm:text-4xl font-light leading-[1.1] tracking-[-0.025em] text-[#18224B]"
                        >
                          How may we care for you?
                        </h2>
                      </div>

                      {/* Architectural Category Selector Tabs */}
                      <div>
                        <span className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/60 mb-3">
                          Select Modality
                        </span>
                        <div
                          role="tablist"
                          aria-label="Service Categories"
                          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                        >
                          {SALON_CONFIG.treatmentCategories.map((cat) => {
                            const isSelected = cat.id === form.categoryId;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`cursor-pointer text-left px-3.5 py-3 border transition-all duration-300 ${
                                  isSelected
                                    ? 'border-[#18224B] bg-[#18224B] text-[#FBF9F5]'
                                    : 'border-[#18224B]/15 bg-transparent text-[#18224B]/75 hover:border-[#18224B]/45 hover:text-[#18224B]'
                                }`}
                              >
                                <span className="block font-mono-tabular text-[10px] opacity-65">
                                  {cat.index}
                                </span>
                                <span className="mt-1 block font-basel text-[11.5px] leading-snug">
                                  {cat.shortLabel}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {errors.categoryId && (
                          <p role="alert" className="mt-2 text-xs text-[#9E2A2B]">
                            {errors.categoryId}
                          </p>
                        )}
                      </div>

                      {/* Tactile Editorial Ritual Selection Cards */}
                      <div>
                        <span className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/60 mb-3">
                          Choose Your Ritual
                        </span>
                        <div className="space-y-3">
                          {availableRituals.map((ritual) => {
                            const isSelected = ritual.id === form.ritualId;
                            return (
                              <button
                                key={ritual.id}
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({ ...prev, ritualId: ritual.id }));
                                  setErrors((prev) => ({ ...prev, ritualId: undefined }));
                                }}
                                aria-pressed={isSelected}
                                className={`cursor-pointer w-full text-left p-4 sm:p-5 border transition-all duration-300 ${
                                  isSelected
                                    ? 'border-[#18224B] bg-[#F3EEE5]'
                                    : 'border-[#18224B]/12 bg-transparent hover:border-[#18224B]/35 hover:bg-[#F7F3EC]/60'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2.5">
                                      <span
                                        aria-hidden="true"
                                        className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors ${
                                          isSelected
                                            ? 'border-[#18224B] bg-[#18224B]'
                                            : 'border-[#18224B]/35'
                                        }`}
                                      >
                                        {isSelected && (
                                          <span className="h-1.5 w-1.5 rounded-full bg-[#FBF9F5]" />
                                        )}
                                      </span>
                                      <span className="font-serif-editorial text-lg sm:text-[1.22rem] font-normal text-[#18224B] leading-snug">
                                        {ritual.name}
                                      </span>
                                    </div>
                                    <p className="font-basel text-[12.5px] leading-[1.55] text-[#18224B]/70 pl-6">
                                      {ritual.summary}
                                    </p>
                                  </div>

                                  <div className="text-right font-mono-tabular text-[11px] shrink-0">
                                    <span className="block text-[#18224B] font-medium">
                                      {ritual.duration}
                                    </span>
                                    <span className="block text-[#18224B]/55 mt-0.5">
                                      {ritual.examplePrice}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {errors.ritualId && (
                          <p role="alert" className="mt-2 text-xs text-[#9E2A2B]">
                            {errors.ritualId}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="font-basel cursor-pointer w-full sm:w-auto px-8 py-3.5 text-[11px] uppercase tracking-[0.16em] bg-[#18224B] text-[#FBF9F5] hover:bg-[#233168] transition-colors whitespace-nowrap"
                        >
                          Continue to Schedule →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SCHEDULE (DATE & TIME CURATION) */}
                  {step === 2 && (
                    <div className="space-y-7">
                      <div className="space-y-2">
                        <span className="font-basel block text-[10.5px] uppercase tracking-[0.18em] text-[#18224B]/55">
                          Step 02 of 03 · Reserve Your Window
                        </span>
                        <h2
                          id="booking-drawer-title"
                          className="font-serif-editorial text-3xl sm:text-4xl font-light leading-[1.1] tracking-[-0.025em] text-[#18224B]"
                        >
                          When would you like to arrive?
                        </h2>
                      </div>

                      {/* Quick-Pick Upcoming Date Tiles */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/60">
                            Upcoming Availability
                          </span>
                          <span className="font-mono-tabular text-[10.5px] text-[#18224B]/50">
                            Open Daily · IST
                          </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {upcomingDates.map((dateOpt) => {
                            const isSelected = form.preferredDate === dateOpt.iso;
                            return (
                              <button
                                key={dateOpt.iso}
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({ ...prev, preferredDate: dateOpt.iso }));
                                  setErrors((prev) => ({ ...prev, preferredDate: undefined }));
                                }}
                                aria-pressed={isSelected}
                                className={`cursor-pointer py-3 px-2 text-center border transition-all duration-200 ${
                                  isSelected
                                    ? 'border-[#18224B] bg-[#18224B] text-[#FBF9F5]'
                                    : 'border-[#18224B]/15 bg-transparent text-[#18224B] hover:border-[#18224B]/45 hover:bg-[#F3EEE5]/60'
                                }`}
                              >
                                <span className="block font-basel text-[10px] uppercase tracking-[0.08em] opacity-65">
                                  {dateOpt.weekday}
                                </span>
                                <span className="my-0.5 block font-serif-editorial text-xl font-normal leading-tight">
                                  {dateOpt.dayNum}
                                </span>
                                <span className="block font-basel text-[10px] opacity-70">
                                  {dateOpt.monthShort}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Future Date Picker */}
                        <div className="pt-2">
                          <label
                            htmlFor="booking-date"
                            className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/60 mb-2"
                          >
                            Or Choose Another Date
                          </label>
                          <input
                            id="booking-date"
                            type="date"
                            min={upcomingDates[0]?.iso || '2026-10-24'}
                            value={form.preferredDate}
                            onChange={(e) => {
                              setForm((prev) => ({ ...prev, preferredDate: e.target.value }));
                              setErrors((prev) => ({ ...prev, preferredDate: undefined }));
                            }}
                            className="w-full sm:w-64 bg-transparent border-b border-[#18224B]/30 py-2 font-mono-tabular text-sm text-[#18224B] focus:border-[#18224B] focus:outline-none transition-colors"
                          />
                        </div>

                        {errors.preferredDate && (
                          <p role="alert" className="text-xs text-[#9E2A2B]">
                            {errors.preferredDate}
                          </p>
                        )}
                      </div>

                      {/* Time Slot Architecture */}
                      <div className="space-y-3">
                        <span className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/60">
                          Preferred Time Window
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {AVAILABLE_TIME_SLOTS.map((slot) => {
                            const isSelected = form.preferredTime === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({ ...prev, preferredTime: slot }));
                                  setErrors((prev) => ({ ...prev, preferredTime: undefined }));
                                }}
                                aria-pressed={isSelected}
                                className={`cursor-pointer py-3 px-4 font-mono-tabular text-xs tracking-[0.04em] border transition-all duration-200 ${
                                  isSelected
                                    ? 'border-[#18224B] bg-[#18224B] text-[#FBF9F5]'
                                    : 'border-[#18224B]/15 bg-transparent text-[#18224B] hover:border-[#18224B]/45 hover:bg-[#F3EEE5]/60'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                        {errors.preferredTime && (
                          <p role="alert" className="text-xs text-[#9E2A2B]">
                            {errors.preferredTime}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 flex items-center justify-between gap-4 border-t border-[#18224B]/10">
                        <button
                          type="button"
                          onClick={() => {
                            setErrors({});
                            setStep(1);
                          }}
                          className="font-basel cursor-pointer py-2 text-[11px] uppercase tracking-[0.12em] text-[#18224B]/65 hover:text-[#18224B] transition-colors whitespace-nowrap"
                        >
                          ← Back to Ritual
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="font-basel cursor-pointer px-8 py-3.5 text-[11px] uppercase tracking-[0.16em] bg-[#18224B] text-[#FBF9F5] hover:bg-[#233168] transition-colors whitespace-nowrap"
                        >
                          Continue to Guest Details →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: GUEST DETAILS & PERSONAL PREFERENCES */}
                  {step === 3 && (
                    <div className="space-y-7">
                      <div className="space-y-2">
                        <span className="font-basel block text-[10.5px] uppercase tracking-[0.18em] text-[#18224B]/55">
                          Step 03 of 03 · Personalize Your Visit
                        </span>
                        <h2
                          id="booking-drawer-title"
                          className="font-serif-editorial text-3xl sm:text-4xl font-light leading-[1.1] tracking-[-0.025em] text-[#18224B]"
                        >
                          Tell us how to welcome you.
                        </h2>
                      </div>

                      {/* Quiet Live Selection Summary Strip */}
                      {selectedRitual && (
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F3EEE5] border border-[#18224B]/12 px-4 py-3.5">
                          <div className="space-y-0.5">
                            <span className="block font-serif-editorial text-[16px] text-[#18224B]">
                              {selectedRitual.name}
                            </span>
                            <span className="block font-mono-tabular text-[11px] text-[#18224B]/65">
                              {selectedDateDisplay || form.preferredDate} · {form.preferredTime} ·{' '}
                              {selectedRitual.duration}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="font-basel cursor-pointer text-[10.5px] uppercase tracking-[0.12em] text-[#18224B] underline underline-offset-4 hover:opacity-60 transition-opacity"
                          >
                            Modify
                          </button>
                        </div>
                      )}

                      {/* Editorial Underline Inputs */}
                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="booking-name"
                            className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/65 mb-1.5"
                          >
                            Full Name
                          </label>
                          <input
                            id="booking-name"
                            type="text"
                            placeholder="e.g. Ananya Sharma"
                            value={form.clientName}
                            onChange={(e) => {
                              setForm((prev) => ({ ...prev, clientName: e.target.value }));
                              setErrors((prev) => ({ ...prev, clientName: undefined }));
                            }}
                            className="w-full bg-transparent border-b border-[#18224B]/25 py-2.5 font-basel text-[15px] text-[#18224B] placeholder:text-[#18224B]/30 focus:border-[#18224B] focus:outline-none transition-colors"
                          />
                          {errors.clientName && (
                            <p role="alert" className="mt-1.5 text-xs text-[#9E2A2B]">
                              {errors.clientName}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label
                              htmlFor="booking-email"
                              className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/65 mb-1.5"
                            >
                              Email Address
                            </label>
                            <input
                              id="booking-email"
                              type="email"
                              placeholder="ananya@example.com"
                              value={form.clientEmail}
                              onChange={(e) => {
                                setForm((prev) => ({ ...prev, clientEmail: e.target.value }));
                                setErrors((prev) => ({ ...prev, clientEmail: undefined }));
                              }}
                              className="w-full bg-transparent border-b border-[#18224B]/25 py-2.5 font-basel text-[15px] text-[#18224B] placeholder:text-[#18224B]/30 focus:border-[#18224B] focus:outline-none transition-colors"
                            />
                            {errors.clientEmail && (
                              <p role="alert" className="mt-1.5 text-xs text-[#9E2A2B]">
                                {errors.clientEmail}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="booking-phone"
                              className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/65 mb-1.5"
                            >
                              Phone Number
                            </label>
                            <input
                              id="booking-phone"
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={form.clientPhone}
                              onChange={(e) => {
                                setForm((prev) => ({ ...prev, clientPhone: e.target.value }));
                                setErrors((prev) => ({ ...prev, clientPhone: undefined }));
                              }}
                              className="w-full bg-transparent border-b border-[#18224B]/25 py-2.5 font-mono-tabular text-[14px] text-[#18224B] placeholder:text-[#18224B]/30 focus:border-[#18224B] focus:outline-none transition-colors"
                            />
                            {errors.clientPhone && (
                              <p role="alert" className="mt-1.5 text-xs text-[#9E2A2B]">
                                {errors.clientPhone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* One-Tap Sanctuary Preferences + Optional Notes */}
                        <div className="space-y-3 pt-1">
                          <label
                            htmlFor="booking-notes"
                            className="block font-basel text-[10.5px] uppercase tracking-[0.14em] text-[#18224B]/65"
                          >
                            Sanctuary Preferences &amp; Skin Notes (Optional)
                          </label>

                          <div className="flex flex-wrap gap-2">
                            {RITUAL_PREFERENCE_TAGS.map((tag) => {
                              const isActive = form.notes
                                .toLowerCase()
                                .includes(tag.toLowerCase());
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      notes: toggleRitualPreferenceNote(prev.notes, tag),
                                    }))
                                  }
                                  aria-pressed={isActive}
                                  className={`cursor-pointer px-3 py-1.5 font-basel text-[11px] border transition-colors ${
                                    isActive
                                      ? 'border-[#18224B] bg-[#18224B] text-[#FBF9F5]'
                                      : 'border-[#18224B]/20 text-[#18224B]/75 hover:border-[#18224B]/50 hover:text-[#18224B]'
                                  }`}
                                >
                                  {isActive ? '✓ ' : '+ '}
                                  {tag}
                                </button>
                              );
                            })}
                          </div>

                          <textarea
                            id="booking-notes"
                            rows={2}
                            placeholder="Share skin sensitivities, wedding dates, or ambiance notes..."
                            value={form.notes}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, notes: e.target.value }))
                            }
                            className="w-full bg-transparent border-b border-[#18224B]/25 py-2 font-basel text-[14px] text-[#18224B] placeholder:text-[#18224B]/30 focus:border-[#18224B] focus:outline-none transition-colors resize-none"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-between gap-4 border-t border-[#18224B]/10">
                        <button
                          type="button"
                          onClick={() => {
                            setErrors({});
                            setStep(2);
                          }}
                          className="font-basel cursor-pointer py-2 text-[11px] uppercase tracking-[0.12em] text-[#18224B]/65 hover:text-[#18224B] transition-colors whitespace-nowrap"
                        >
                          ← Back to Schedule
                        </button>
                        <button
                          type="submit"
                          className="font-basel cursor-pointer px-8 py-3.5 text-[11px] uppercase tracking-[0.16em] bg-[#18224B] text-[#FBF9F5] hover:bg-[#233168] transition-colors whitespace-nowrap"
                        >
                          Confirm Private Consultation
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* Saved Session Requests */}
              {savedBookings.length > 0 && (
                <div className="mt-10 pt-6 border-t border-[#18224B]/12">
                  <span className="block font-basel text-[10.5px] uppercase tracking-[0.16em] text-[#18224B]/55 mb-3">
                    Your Prepared Requests ({savedBookings.length})
                  </span>
                  <ul className="space-y-2 text-xs font-basel text-[#18224B]/85">
                    {savedBookings.map((b) => (
                      <li
                        key={b.referenceCode + b.createdAtIso}
                        className="flex items-center justify-between gap-4 bg-[#F3EEE5]/80 px-4 py-2.5 border border-[#18224B]/10"
                      >
                        <span>
                          {b.ritualName} · {b.preferredDate} ({b.preferredTime})
                        </span>
                        <span className="font-mono-tabular text-[11px] text-[#18224B]/60 shrink-0">
                          {b.referenceCode}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Quiet Sanctuary Footer Note */}
          <div className="border-t border-[#18224B]/10 px-5 sm:px-8 lg:px-12 py-4">
            <div className="mx-auto max-w-[660px] flex flex-wrap items-center justify-between gap-2 font-basel text-[11px] text-[#18224B]/55">
              <span>{SALON_CONFIG.contact.phoneDisplay} · {SALON_CONFIG.contact.email}</span>
              <span>Interactive Concierge Preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
