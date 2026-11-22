import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatChapterCounter,
  resolveScrollStoryState,
  getNextChapterIndex,
  findServiceById,
  getCategoryServices,
  validateBookingForm,
  validateBookingStep,
  getUpcomingConsultationDates,
  toggleRitualPreferenceNote,
  createBookingRecord,
  generateWhatsAppBookingUrl,
  generateEmailBookingUrl,
  generateWhatsAppMessageText,
} from './bookingLogic';

test('formatChapterCounter formats active chapter and bounds correctly', () => {
  const c1 = formatChapterCounter(1, 4);
  assert.equal(c1.current, '1');
  assert.equal(c1.total, '4');
  assert.equal(c1.combined, '1 : 4');
  assert.equal(c1.paddedSlash, '01 / 04');

  const outOfBounds = formatChapterCounter(9, 4);
  assert.equal(outOfBounds.combined, '4 : 4');
  assert.equal(outOfBounds.paddedSlash, '04 / 04');
});

test('resolveScrollStoryState maps scroll progress across 4 chapters and portal emergence', () => {
  const start = resolveScrollStoryState(0, 4);
  assert.equal(start.activeIndex, 1);
  assert.equal(start.portalRevealProgress, 0);
  assert.equal(start.isPortalInteractive, false);

  const mid = resolveScrollStoryState(0.4, 4);
  assert.equal(mid.activeIndex, 3);
  assert.equal(mid.portalRevealProgress, 0);

  const fourthSlide = resolveScrollStoryState(0.68, 4);
  assert.equal(fourthSlide.activeIndex, 4);
  assert.equal(fourthSlide.portalRevealProgress, 0);

  const end = resolveScrollStoryState(1, 4);
  assert.equal(end.activeIndex, 4);
  assert.equal(end.portalRevealProgress, 1);
  assert.equal(end.isPortalInteractive, true);
});

test('getNextChapterIndex cycles smoothly through chapters 1 to 4', () => {
  assert.equal(getNextChapterIndex(1, 4, 'next'), 2);
  assert.equal(getNextChapterIndex(4, 4, 'next'), 1);
  assert.equal(getNextChapterIndex(1, 4, 'prev'), 4);
  assert.equal(getNextChapterIndex(3, 4, 'prev'), 2);
});

test('findServiceById and getCategoryServices locate configured rituals', () => {
  const facials = getCategoryServices('facials');
  assert.equal(facials.length >= 3, true);

  const match = findServiceById('bare-luxury-manicure');
  assert.notEqual(match, null);
  assert.equal(match?.category.id, 'nails');
  assert.equal(match?.ritual.name, 'The Bare Luxury Manicure');
});

test('validateBookingForm rejects empty or invalid fields and accepts complete input', () => {
  const emptyResult = validateBookingForm({
    categoryId: '',
    ritualId: '',
    clientName: ' ',
    clientEmail: 'not-an-email',
    clientPhone: '123',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });

  assert.equal(emptyResult.isValid, false);
  assert.ok(emptyResult.errors.categoryId);
  assert.ok(emptyResult.errors.ritualId);
  assert.ok(emptyResult.errors.clientName);
  assert.ok(emptyResult.errors.clientEmail);
  assert.ok(emptyResult.errors.clientPhone);
  assert.ok(emptyResult.errors.preferredDate);
  assert.ok(emptyResult.errors.preferredTime);

  const validResult = validateBookingForm({
    categoryId: 'facials',
    ritualId: 'nova-signature-facial',
    clientName: 'Claire Moreau',
    clientEmail: 'claire@example.com',
    clientPhone: '+61 412 345 678',
    preferredDate: '2026-11-15',
    preferredTime: '11:00 AM',
    notes: 'Focus on hydration',
  });

  assert.equal(validResult.isValid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});

test('createBookingRecord produces deterministic demo booking summary', () => {
  const record = createBookingRecord({
    categoryId: 'makeup',
    ritualId: 'bridal-bespoke-preview',
    clientName: 'Claire Moreau',
    clientEmail: 'claire@example.com',
    clientPhone: '+61 412 345 678',
    preferredDate: '2026-11-18',
    preferredTime: '02:30 PM',
    notes: 'Spring bridal preview',
  });

  assert.equal(record.referenceCode, 'NOVA-CL1118');
  assert.equal(record.ritualName, 'Bridal Beauty Consultation & Preview');
  assert.equal(record.duration, '90 min');
});

test('SALON_CONFIG uses NOVA brand exclusively without legacy Maison Aura references', async () => {
  const { SALON_CONFIG } = await import('../data/salonData');
  assert.equal(SALON_CONFIG.brand.name, 'NOVA');
  assert.equal(SALON_CONFIG.about.team[0].name, 'Nova');
  assert.equal(SALON_CONFIG.treatmentCategories[0].rituals[0].name, 'The NOVA Signature Facial');
  assert.equal(/maison\s+aura/i.test(JSON.stringify(SALON_CONFIG)), false);
});

test('validateBookingStep scopes validation cleanly to each consultation step', () => {
  const partialInput = {
    categoryId: 'facials',
    ritualId: 'nova-signature-facial',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    preferredDate: '',
    preferredTime: '11:00 AM',
    notes: '',
  };

  assert.equal(validateBookingStep(1, partialInput).isValid, true);
  const step2Invalid = validateBookingStep(2, partialInput);
  assert.equal(step2Invalid.isValid, false);
  assert.ok(step2Invalid.errors.preferredDate);
  assert.equal(step2Invalid.errors.clientName, undefined);

  const step2Valid = validateBookingStep(2, { ...partialInput, preferredDate: '2026-11-25' });
  assert.equal(step2Valid.isValid, true);
});

test('getUpcomingConsultationDates generates sequential ISO dates starting tomorrow', () => {
  const anchor = new Date(2026, 10, 22); // Nov 22, 2026
  const dates = getUpcomingConsultationDates(4, anchor);
  assert.equal(dates.length, 4);
  assert.equal(dates[0].iso, '2026-11-23');
  assert.equal(dates[0].displayLabel, 'Tomorrow');
  assert.equal(dates[3].iso, '2026-11-26');
});

test('toggleRitualPreferenceNote adds and removes preference tags cleanly', () => {
  const first = toggleRitualPreferenceNote('', 'Quiet silent ritual');
  assert.equal(first, 'Quiet silent ritual');
  const second = toggleRitualPreferenceNote(first, 'Sensitive skin');
  assert.equal(second, 'Quiet silent ritual · Sensitive skin');
  const removed = toggleRitualPreferenceNote(second, 'Quiet silent ritual');
  assert.equal(removed, 'Sensitive skin');
});

test('generateWhatsAppBookingUrl and generateEmailBookingUrl format direct salon transmission links', () => {
  const booking = createBookingRecord({
    categoryId: 'facials',
    ritualId: 'nova-signature-facial',
    clientName: 'Priya Sharma',
    clientEmail: 'priya@example.com',
    clientPhone: '+91 9876543210',
    preferredDate: '2026-11-25',
    preferredTime: '11:00 AM',
    notes: 'Sensitive skin · Bridal timeline',
  });

  const waUrl = generateWhatsAppBookingUrl(booking);
  assert.ok(waUrl.startsWith('https://wa.me/917275256535?text='));
  assert.ok(waUrl.includes('Priya%20Sharma'));
  assert.ok(waUrl.includes('NOVA%20Signature%20Facial'));

  const emailUrl = generateEmailBookingUrl(booking);
  assert.ok(emailUrl.startsWith('mailto:info@novasalon.in?subject='));
  assert.ok(emailUrl.includes('Priya%20Sharma'));

  const messageText = generateWhatsAppMessageText(booking);
  assert.ok(messageText.includes('*NOVA Sanctuary — Appointment Request*'));
  assert.ok(messageText.includes('Priya Sharma'));
  assert.ok(messageText.includes('Sensitive skin · Bridal timeline'));
  assert.ok(messageText.includes('Kingship by Kahlon'));
});




