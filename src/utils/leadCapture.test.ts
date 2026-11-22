import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveCapturedLead,
  getCapturedLeads,
  updateLeadStatus,
  clearAllCapturedLeads,
  formatOwnerAlertText,
  generateOwnerFollowUpWhatsAppUrl,
  exportLeadsToCsv,
  saveConciergeSettings,
  getConciergeSettings,
  verifyConciergePin,
  updateConciergePin,
  sendLeadToGoogleSheet,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
} from './leadCapture';

test('saveCapturedLead and getCapturedLeads persist and order leads newest first', () => {
  clearAllCapturedLeads();

  const l1 = saveCapturedLead({
    referenceCode: 'NOVA-PR1125',
    clientName: 'Priya Sharma',
    clientPhone: '+91 9876543210',
    clientEmail: 'priya@example.com',
    ritualName: 'The NOVA Signature Facial',
    categoryId: 'facials',
    duration: '75 min',
    examplePrice: '₹4,100',
    preferredDate: '2026-11-25',
    preferredTime: '11:00 AM',
    notes: 'Hydration focus',
    status: 'confirmed_on_site',
    sentNotification: false,
  });

  const l2 = saveCapturedLead({
    referenceCode: 'NOVA-AN1126',
    clientName: 'Ananya Verma',
    clientPhone: '+91 9123456789',
    clientEmail: 'ananya@example.com',
    ritualName: 'Bridal Beauty Consultation',
    categoryId: 'makeup',
    duration: '90 min',
    examplePrice: '₹8,500',
    preferredDate: '2026-11-26',
    preferredTime: '02:30 PM',
    notes: 'Spring wedding',
    status: 'draft_entered',
    sentNotification: false,
  });

  const leads = getCapturedLeads();
  assert.equal(leads.length, 2);
  assert.equal(leads[0].clientName, 'Ananya Verma');
  assert.equal(leads[1].clientName, 'Priya Sharma');
});

test('updateLeadStatus cleanly transitions workflow state', () => {
  clearAllCapturedLeads();

  const lead = saveCapturedLead({
    referenceCode: 'NOVA-PR1125',
    clientName: 'Priya Sharma',
    clientPhone: '+91 9876543210',
    clientEmail: 'priya@example.com',
    ritualName: 'The NOVA Signature Facial',
    categoryId: 'facials',
    duration: '75 min',
    examplePrice: '₹4,100',
    preferredDate: '2026-11-25',
    preferredTime: '11:00 AM',
    notes: '',
    status: 'confirmed_on_site',
    sentNotification: false,
  });

  assert.equal(lead.status, 'confirmed_on_site');

  const updated = updateLeadStatus(lead.id, 'dispatched_whatsapp');
  assert.ok(updated);
  assert.equal(updated.status, 'dispatched_whatsapp');

  const leads = getCapturedLeads();
  assert.equal(leads[0].status, 'dispatched_whatsapp');
});

test('formatOwnerAlertText highlights abandoned leads that filled form without sending', () => {
  const alertText = formatOwnerAlertText({
    id: 'test-1',
    referenceCode: 'NOVA-TEST01',
    clientName: 'Aarav Gupta',
    clientPhone: '+91 7275256535',
    clientEmail: 'aarav@example.com',
    ritualName: 'Scalp Detox & Hair Spa',
    categoryId: 'hair',
    duration: '60 min',
    examplePrice: '₹3,200',
    preferredDate: '2026-11-28',
    preferredTime: '04:00 PM',
    notes: 'Sensitive scalp',
    capturedAtIso: new Date().toISOString(),
    updatedAtIso: new Date().toISOString(),
    status: 'confirmed_on_site',
    sentNotification: false,
  });

  assert.ok(alertText.includes('⚠️ [HOT LEAD] Customer filled booking form but did NOT send WhatsApp yet!'));
  assert.ok(alertText.includes('Aarav Gupta'));
  assert.ok(alertText.includes('+91 7275256535'));
  assert.ok(alertText.includes('Action needed: Call or WhatsApp this guest immediately'));
});

test('generateOwnerFollowUpWhatsAppUrl builds direct contact link with client details', () => {
  const url = generateOwnerFollowUpWhatsAppUrl({
    id: 'test-2',
    referenceCode: 'NOVA-TEST02',
    clientName: 'Sneha Patel',
    clientPhone: '9876543210',
    clientEmail: 'sneha@example.com',
    ritualName: 'The NOVA Signature Facial',
    categoryId: 'facials',
    duration: '75 min',
    examplePrice: '₹4,100',
    preferredDate: '2026-11-29',
    preferredTime: '01:00 PM',
    notes: '',
    capturedAtIso: new Date().toISOString(),
    updatedAtIso: new Date().toISOString(),
    status: 'confirmed_on_site',
    sentNotification: false,
  });

  assert.ok(url.startsWith('https://wa.me/919876543210?text='));
  assert.ok(url.includes('Hello%20Sneha%20Patel'));
  assert.ok(url.includes('NOVA%20Sanctuary'));
});

test('exportLeadsToCsv generates valid CSV rows', () => {
  const leads = [
    {
      id: 'test-3',
      referenceCode: 'NOVA-TEST03',
      clientName: 'Kavita Roy',
      clientPhone: '9876543210',
      clientEmail: 'kavita@example.com',
      ritualName: 'Manicure Artistry',
      categoryId: 'nails',
      duration: '45 min',
      examplePrice: '₹1,800',
      preferredDate: '2026-11-30',
      preferredTime: '11:00 AM',
      notes: 'Gel finish',
      capturedAtIso: '2026-11-23T00:00:00.000Z',
      updatedAtIso: '2026-11-23T00:00:00.000Z',
      status: 'confirmed_on_site' as const,
      sentNotification: true,
    },
  ];

  const csv = exportLeadsToCsv(leads);
  assert.ok(csv.startsWith('Reference Code,Status,Guest Name'));
  assert.ok(csv.includes('"NOVA-TEST03"'));
  assert.ok(csv.includes('"Kavita Roy"'));
});

test('getConciergeSettings and saveConciergeSettings store contact preferences', () => {
  const custom = saveConciergeSettings({
    receptionPhone: '917275256535',
    notificationEmail: 'owner@novasalon.in',
  });

  assert.equal(custom.receptionPhone, '917275256535');
  assert.equal(custom.notificationEmail, 'owner@novasalon.in');

  const retrieved = getConciergeSettings();
  assert.equal(retrieved.notificationEmail, 'owner@novasalon.in');
});

test('verifyConciergePin validates 4-digit security PIN and rejects unauthorized attempts', () => {
  assert.equal(verifyConciergePin('1428'), true);
  assert.equal(verifyConciergePin('0000'), false);
  assert.equal(verifyConciergePin(''), false);

  updateConciergePin('9988');
  assert.equal(verifyConciergePin('9988'), true);
  assert.equal(verifyConciergePin('1428'), false);

  // Restore default for other tests
  updateConciergePin('1428');
});

test('GOOGLE_APPS_SCRIPT_TEMPLATE provides valid Apps Script code', () => {
  assert.ok(GOOGLE_APPS_SCRIPT_TEMPLATE.includes('function doPost(e)'));
  assert.ok(GOOGLE_APPS_SCRIPT_TEMPLATE.includes('SpreadsheetApp.getActiveSpreadsheet()'));
  assert.ok(GOOGLE_APPS_SCRIPT_TEMPLATE.includes('sheet.appendRow'));
});

test('sendLeadToGoogleSheet safely handles missing webhook URL', async () => {
  const res = await sendLeadToGoogleSheet({
    id: 'test-gs',
    referenceCode: 'NOVA-GS01',
    clientName: 'Test Guest',
    clientPhone: '+91 7275256535',
    clientEmail: 'test@example.com',
    ritualName: 'The NOVA Signature Facial',
    categoryId: 'facials',
    duration: '75 min',
    examplePrice: '₹4,100',
    preferredDate: '2026-11-26',
    preferredTime: '11:00 AM',
    notes: '',
    capturedAtIso: new Date().toISOString(),
    updatedAtIso: new Date().toISOString(),
    status: 'confirmed_on_site',
    sentNotification: false,
  }, '');
  assert.equal(res, false);
});
