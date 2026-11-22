import { SALON_CONFIG, RitualItem, TreatmentCategory } from '../data/salonData';

export interface BookingFormInput {
  categoryId: string;
  ritualId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

export interface BookingValidationErrors {
  categoryId?: string;
  ritualId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  preferredDate?: string;
  preferredTime?: string;
}

export interface ConfirmedDemoBooking extends BookingFormInput {
  referenceCode: string;
  categoryTitle: string;
  ritualName: string;
  duration: string;
  examplePrice: string;
  createdAtIso: string;
}

export const AVAILABLE_TIME_SLOTS = [
  '09:30 AM',
  '11:00 AM',
  '01:00 PM',
  '02:30 PM',
  '04:00 PM',
  '05:30 PM',
];

export function formatChapterCounter(activeIndex: number, total: number): {
  current: string;
  total: string;
  combined: string;
  paddedCurrent: string;
  paddedTotal: string;
  paddedSlash: string;
} {
  const safeTotal = Math.max(1, total);
  const clamped = Math.min(Math.max(1, activeIndex), safeTotal);
  const paddedCurrent = String(clamped).padStart(2, '0');
  const paddedTotal = String(safeTotal).padStart(2, '0');
  return {
    current: String(clamped),
    total: String(safeTotal),
    combined: `${clamped} : ${safeTotal}`,
    paddedCurrent,
    paddedTotal,
    paddedSlash: `${paddedCurrent} / ${paddedTotal}`,
  };
}

export function resolveScrollStoryState(
  progress: number,
  totalChapters: number = 4
): {
  activeIndex: number;
  chapterProgress: number;
  portalRevealProgress: number;
  isPortalInteractive: boolean;
} {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const safeTotal = Math.max(1, totalChapters);
  // First 73% of timeline drives the 4 horizontal chapters; final 27% emerges the Concerns/Treatments portals
  const chapterPhaseEnd = 0.73;
  const portalPhaseStart = 0.71;

  const chapterProgress = Math.min(1, Math.max(0, clampedProgress / chapterPhaseEnd));
  const rawIndex = Math.floor(chapterProgress * safeTotal) + 1;
  const activeIndex = Math.min(safeTotal, Math.max(1, rawIndex));

  const portalRevealProgress =
    clampedProgress <= portalPhaseStart
      ? 0
      : Math.min(1, (clampedProgress - portalPhaseStart) / (1 - portalPhaseStart));

  return {
    activeIndex,
    chapterProgress,
    portalRevealProgress,
    isPortalInteractive: portalRevealProgress > 0.45,
  };
}

export function getNextChapterIndex(currentIndex: number, total: number, direction: 'next' | 'prev'): number {
  if (total <= 1) return 1;
  if (direction === 'next') {
    return currentIndex >= total ? 1 : currentIndex + 1;
  }
  return currentIndex <= 1 ? total : currentIndex - 1;
}

export function getCategoryById(categoryId: string): TreatmentCategory | undefined {
  return SALON_CONFIG.treatmentCategories.find((c) => c.id === categoryId);
}

export function getCategoryServices(categoryId: string): RitualItem[] {
  const category = getCategoryById(categoryId);
  return category ? category.rituals : [];
}

export function findServiceById(ritualId: string): {
  category: TreatmentCategory;
  ritual: RitualItem;
} | null {
  for (const category of SALON_CONFIG.treatmentCategories) {
    const found = category.rituals.find((r) => r.id === ritualId);
    if (found) {
      return { category, ritual: found };
    }
  }
  return null;
}

export function validateBookingForm(input: BookingFormInput): {
  isValid: boolean;
  errors: BookingValidationErrors;
} {
  const errors: BookingValidationErrors = {};

  if (!input.categoryId || !getCategoryById(input.categoryId)) {
    errors.categoryId = 'Please select a service category.';
  }

  if (!input.ritualId || !findServiceById(input.ritualId)) {
    errors.ritualId = 'Please choose a specific ritual or treatment.';
  }

  const trimmedName = (input.clientName || '').trim();
  if (!trimmedName || trimmedName.length < 2) {
    errors.clientName = 'Please enter your full name.';
  }

  const trimmedEmail = (input.clientEmail || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    errors.clientEmail = 'Please provide a valid email address.';
  }

  const trimmedPhone = (input.clientPhone || '').trim();
  const digitsOnly = trimmedPhone.replace(/\D/g, '');
  if (!trimmedPhone || digitsOnly.length < 7) {
    errors.clientPhone = 'Please enter a valid contact phone number.';
  }

  const trimmedDate = (input.preferredDate || '').trim();
  if (!trimmedDate) {
    errors.preferredDate = 'Please select a preferred date.';
  }

  const trimmedTime = (input.preferredTime || '').trim();
  if (!trimmedTime) {
    errors.preferredTime = 'Please select a preferred time window.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createBookingRecord(
  input: BookingFormInput,
  now: Date = new Date()
): ConfirmedDemoBooking {
  const matched = findServiceById(input.ritualId);
  const categoryTitle = matched ? matched.category.title : 'Bespoke Treatment';
  const ritualName = matched ? matched.ritual.name : 'Selected Ritual';
  const duration = matched ? matched.ritual.duration : '60 min';
  const examplePrice = matched ? matched.ritual.examplePrice : 'Upon consultation';

  // Deterministic, human-readable demo reference code
  const nameSeed = (input.clientName || 'NV').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2).padEnd(2, 'N');
  const dateSeed = (input.preferredDate || '20261024').replace(/\D/g, '').slice(-4).padStart(4, '0');
  const referenceCode = `NOVA-${nameSeed}${dateSeed}`;

  return {
    ...input,
    clientName: input.clientName.trim(),
    clientEmail: input.clientEmail.trim(),
    clientPhone: input.clientPhone.trim(),
    notes: input.notes.trim(),
    referenceCode,
    categoryTitle,
    ritualName,
    duration,
    examplePrice,
    createdAtIso: now.toISOString(),
  };
}

export type BookingStep = 1 | 2 | 3;

export interface UpcomingDateOption {
  iso: string;
  weekday: string;
  dayNum: string;
  monthShort: string;
  displayLabel: string;
}

export const RITUAL_PREFERENCE_TAGS = [
  'Quiet silent ritual',
  'Sensitive skin',
  'Bridal timeline',
  'Fragrance-free',
] as const;

/**
 * Validates fields belonging to the active step of the guided consultation flow.
 */
export function validateBookingStep(
  step: BookingStep,
  input: BookingFormInput
): {
  isValid: boolean;
  errors: BookingValidationErrors;
} {
  const full = validateBookingForm(input);
  if (step === 1) {
    const errors: BookingValidationErrors = {};
    if (full.errors.categoryId) errors.categoryId = full.errors.categoryId;
    if (full.errors.ritualId) errors.ritualId = full.errors.ritualId;
    return { isValid: Object.keys(errors).length === 0, errors };
  }
  if (step === 2) {
    const errors: BookingValidationErrors = {};
    if (full.errors.preferredDate) errors.preferredDate = full.errors.preferredDate;
    if (full.errors.preferredTime) errors.preferredTime = full.errors.preferredTime;
    return { isValid: Object.keys(errors).length === 0, errors };
  }
  return full;
}

/**
 * Generates deterministic upcoming consultation date tiles starting from tomorrow.
 */
export function getUpcomingConsultationDates(
  count = 6,
  anchorDate: Date = new Date()
): UpcomingDateOption[] {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const results: UpcomingDateOption[] = [];

  const baseYear = anchorDate.getFullYear();
  const baseMonth = anchorDate.getMonth();
  const baseDay = anchorDate.getDate();

  for (let offset = 1; offset <= count; offset++) {
    const d = new Date(baseYear, baseMonth, baseDay + offset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const weekday = weekdays[d.getDay()];
    const monthShort = months[d.getMonth()];
    const dayNum = String(d.getDate());
    results.push({
      iso: `${yyyy}-${mm}-${dd}`,
      weekday,
      dayNum,
      monthShort,
      displayLabel: offset === 1 ? 'Tomorrow' : `${weekday}, ${dayNum} ${monthShort}`,
    });
  }

  return results;
}

/**
 * Cleanly toggles a quick ritual preference phrase inside the guest notes field.
 */
export function toggleRitualPreferenceNote(currentNotes: string, preference: string): string {
  const parts = currentNotes
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean);

  const exists = parts.some((p) => p.toLowerCase() === preference.toLowerCase());
  const nextParts = exists
    ? parts.filter((p) => p.toLowerCase() !== preference.toLowerCase())
    : [...parts, preference];

  return nextParts.join(' · ');
}

/**
 * Formats a clean, readable text summary for transmitting the consultation request to salon reception.
 */
export function generateWhatsAppMessageText(booking: ConfirmedDemoBooking): string {
  const lines = [
    `*NOVA Sanctuary — Appointment Request*`,
    `Ref: ${booking.referenceCode}`,
    ``,
    `• Guest: ${booking.clientName}`,
    `• Phone: ${booking.clientPhone}`,
    `• Email: ${booking.clientEmail}`,
    `• Ritual: ${booking.ritualName} (${booking.duration} · ${booking.examplePrice})`,
    `• Preferred Date: ${booking.preferredDate}`,
    `• Time Window: ${booking.preferredTime}`,
  ];

  if (booking.notes) {
    lines.push(`• Notes & Preferences: ${booking.notes}`);
  }

  lines.push(``);
  lines.push(`Sanctuary: Kingship by Kahlon, Sector 16, Vrindavan Colony, Lucknow`);
  lines.push(`Requested via novasalon.in`);

  return lines.join('\n');
}

/**
 * Smart device-aware WhatsApp URL:
 * - On desktop/laptop: routes directly to web.whatsapp.com/send to bypass the download/intermediate page.
 * - On mobile (iOS / Android): routes to wa.me to open the native WhatsApp mobile app instantly.
 */
export function getWhatsAppUrlForDevice(
  booking: ConfirmedDemoBooking,
  targetPhone = '917275256535'
): string {
  let cleanPhone = targetPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const text = generateWhatsAppMessageText(booking);
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Direct WhatsApp Web URL (bypasses the download/intermediate landing page on desktop).
 */
export function generateWhatsAppWebUrl(
  booking: ConfirmedDemoBooking,
  targetPhone = '917275256535'
): string {
  let cleanPhone = targetPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const text = generateWhatsAppMessageText(booking);
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Direct WhatsApp Desktop Application protocol URL (opens native PC/Mac WhatsApp desktop app directly).
 */
export function generateWhatsAppDesktopAppUrl(
  booking: ConfirmedDemoBooking,
  targetPhone = '917275256535'
): string {
  let cleanPhone = targetPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const text = generateWhatsAppMessageText(booking);
  return `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Builds a direct click-to-chat WhatsApp link targeting the salon reception number.
 * Default target: 917275256535 (testing reception number; Lucknow sanctuary).
 */
export function generateWhatsAppBookingUrl(
  booking: ConfirmedDemoBooking,
  targetPhone = '917275256535'
): string {
  let cleanPhone = targetPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const text = generateWhatsAppMessageText(booking);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds a pre-filled mailto link targeting the salon reception email.
 */
export function generateEmailBookingUrl(
  booking: ConfirmedDemoBooking,
  targetEmail = 'info@novasalon.in'
): string {
  const subject = `[NOVA Sanctuary Booking] ${booking.referenceCode} — ${booking.clientName}`;
  const body = generateWhatsAppMessageText(booking);
  return `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}


