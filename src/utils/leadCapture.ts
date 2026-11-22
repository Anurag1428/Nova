import { ConfirmedDemoBooking, generateWhatsAppMessageText } from './bookingLogic';
import { SALON_CONFIG } from '../data/salonData';

export type LeadStatus =
  | 'draft_entered'          // visitor filled name and phone in step 3
  | 'confirmed_on_site'      // reached confirmation screen, but did NOT click send via WhatsApp yet!
  | 'dispatched_whatsapp'    // clicked "Send via WhatsApp"
  | 'dispatched_email'       // clicked "Email to Reception"
  | 'vip_privilege_claimed'  // claimed ₹500 welcome voucher lead magnet
  | 'contacted';             // owner marked as contacted/resolved

export interface CapturedLeadRecord {
  id: string;
  referenceCode: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  ritualName: string;
  categoryId: string;
  duration: string;
  examplePrice: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  capturedAtIso: string;
  updatedAtIso: string;
  status: LeadStatus;
  sentNotification: boolean;
  userAgent?: string;
}

const STORAGE_KEY = 'nova_captured_leads_v1';
const SETTINGS_KEY = 'nova_concierge_settings_v1';

export interface ConciergeSettings {
  receptionPhone: string;
  notificationEmail: string;
  webhookUrl: string;
  googleSheetsWebhookUrl?: string;
  securityPin: string;
  callMeBotApiKey?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  soundAlertEnabled: boolean;
}

export const DEFAULT_CONCIERGE_SETTINGS: ConciergeSettings = {
  receptionPhone: '917275256535',
  notificationEmail: 'info@novasalon.in',
  webhookUrl: '',
  googleSheetsWebhookUrl: '',
  securityPin: '1428',
  callMeBotApiKey: '',
  telegramBotToken: '',
  telegramChatId: '',
  soundAlertEnabled: true,
};

// In-memory fallback for Node.js / non-browser test environments
let inMemoryLeads: CapturedLeadRecord[] = [];
let inMemorySettings: ConciergeSettings = { ...DEFAULT_CONCIERGE_SETTINGS };

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Retrieves all concierge settings (notification email, webhook, etc.).
 */
export function getConciergeSettings(): ConciergeSettings {
  if (!isBrowser()) {
    return inMemorySettings;
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_CONCIERGE_SETTINGS };
    return { ...DEFAULT_CONCIERGE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONCIERGE_SETTINGS };
  }
}

/**
 * Verifies staff 4-digit PIN before granting access to confidential customer leads.
 */
export function verifyConciergePin(pin: string): boolean {
  const settings = getConciergeSettings();
  const validPin = (settings.securityPin || '1428').trim();
  return pin.trim() === validPin;
}

/**
 * Updates staff security PIN.
 */
export function updateConciergePin(newPin: string): boolean {
  const clean = newPin.trim();
  if (clean.length >= 4) {
    saveConciergeSettings({ securityPin: clean });
    return true;
  }
  return false;
}
export function saveConciergeSettings(settings: Partial<ConciergeSettings>): ConciergeSettings {
  const current = getConciergeSettings();
  const next = { ...current, ...settings };
  if (!isBrowser()) {
    inMemorySettings = next;
    return next;
  }
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('Failed to save concierge settings to localStorage', err);
  }
  return next;
}

/**
 * Retrieves all captured leads, sorted with newest first.
 */
export function getCapturedLeads(): CapturedLeadRecord[] {
  if (!isBrowser()) {
    return [...inMemoryLeads];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort(
        (a, b) => new Date(b.capturedAtIso).getTime() - new Date(a.capturedAtIso).getTime()
      );
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Generates a unique lead ID.
 */
export function generateLeadId(): string {
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Saves a new lead or updates an existing lead in storage.
 */
export function saveCapturedLead(
  leadInput: Omit<CapturedLeadRecord, 'id' | 'capturedAtIso' | 'updatedAtIso'> & {
    id?: string;
    capturedAtIso?: string;
  }
): CapturedLeadRecord {
  const all = getCapturedLeads();
  const now = new Date().toISOString();

  // Check if lead with same referenceCode or ID already exists
  const existingIndex = all.findIndex(
    (item) => (leadInput.id && item.id === leadInput.id) || (leadInput.referenceCode && item.referenceCode === leadInput.referenceCode)
  );

  let leadRecord: CapturedLeadRecord;

  if (existingIndex >= 0) {
    const existing = all[existingIndex];
    leadRecord = {
      ...existing,
      ...leadInput,
      id: existing.id,
      capturedAtIso: existing.capturedAtIso,
      updatedAtIso: now,
    };
    all[existingIndex] = leadRecord;
  } else {
    leadRecord = {
      ...leadInput,
      id: leadInput.id || generateLeadId(),
      capturedAtIso: leadInput.capturedAtIso || now,
      updatedAtIso: now,
    };
    all.unshift(leadRecord);
  }

  if (!isBrowser()) {
    inMemoryLeads = all;
  } else {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(
        new CustomEvent('nova:lead_captured', {
          detail: { lead: leadRecord, totalCount: all.length },
        })
      );
    } catch (err) {
      console.warn('Failed to persist captured lead', err);
    }
  }

  return leadRecord;
}

/**
 * Updates the workflow status of an existing lead.
 */
export function updateLeadStatus(id: string, status: LeadStatus): CapturedLeadRecord | null {
  const all = getCapturedLeads();
  const index = all.findIndex((l) => l.id === id);
  if (index === 0 || index > 0) {
    all[index].status = status;
    all[index].updatedAtIso = new Date().toISOString();
    const updated = all[index];
    if (!isBrowser()) {
      inMemoryLeads = all;
    } else {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        window.dispatchEvent(
          new CustomEvent('nova:lead_captured', {
            detail: { lead: updated, totalCount: all.length },
          })
        );
      } catch (err) {
        console.warn('Failed to update lead status', err);
      }
    }
    return updated;
  }
  return null;
}

/**
 * Removes a lead by ID.
 */
export function deleteCapturedLead(id: string): void {
  const all = getCapturedLeads().filter((l) => l.id !== id);
  if (!isBrowser()) {
    inMemoryLeads = all;
  } else {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(
        new CustomEvent('nova:lead_captured', {
          detail: { totalCount: all.length },
        })
      );
    } catch (err) {
      console.warn('Failed to delete captured lead', err);
    }
  }
}

/**
 * Clears all captured leads from storage.
 */
export function clearAllCapturedLeads(): void {
  if (!isBrowser()) {
    inMemoryLeads = [];
  } else {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent('nova:lead_captured', {
          detail: { totalCount: 0 },
        })
      );
    } catch (err) {
      console.warn('Failed to clear leads', err);
    }
  }
}

/**
 * Converts captured booking to a lead record and triggers immediate capture.
 */
export function captureBookingLead(
  booking: ConfirmedDemoBooking,
  status: LeadStatus = 'confirmed_on_site'
): CapturedLeadRecord {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Node';
  const lead = saveCapturedLead({
    referenceCode: booking.referenceCode,
    clientName: booking.clientName,
    clientPhone: booking.clientPhone,
    clientEmail: booking.clientEmail,
    ritualName: booking.ritualName,
    categoryId: booking.categoryId,
    duration: booking.duration,
    examplePrice: booking.examplePrice,
    preferredDate: booking.preferredDate,
    preferredTime: booking.preferredTime,
    notes: booking.notes,
    status,
    sentNotification: false,
    userAgent,
  });

  // Automatically trigger background notification
  dispatchLeadNotification(lead).catch((err) => {
    console.info('Background lead notification attempted:', err?.message || err);
  });

  return lead;
}

/**
 * Formats a clean notification summary for the owner.
 */
export function formatOwnerAlertText(lead: CapturedLeadRecord): string {
  let statusHeadline = '✅ [NEW BOOKING] Customer requested appointment transmission';
  if (lead.status === 'vip_privilege_claimed') {
    statusHeadline = '🎁 [VIP PRIVILEGE CLAIMED] Guest unlocked ₹500 Welcome Voucher! Call/WhatsApp to schedule ritual.';
  } else if (lead.status === 'confirmed_on_site' || lead.status === 'draft_entered') {
    statusHeadline = '⚠️ [HOT LEAD] Customer filled booking form but did NOT send WhatsApp yet!';
  }

  return [
    statusHeadline,
    `Ref: ${lead.referenceCode}`,
    `Guest: ${lead.clientName}`,
    `Phone: ${lead.clientPhone}`,
    `Email: ${lead.clientEmail}`,
    `Ritual: ${lead.ritualName} (${lead.duration} · ${lead.examplePrice})`,
    `Date & Time: ${lead.preferredDate} at ${lead.preferredTime}`,
    lead.notes ? `Notes: ${lead.notes}` : '',
    ``,
    `Action needed: Call or WhatsApp this guest immediately at ${lead.clientPhone}`,
    `Captured via: novasalon.in at ${new Date(lead.capturedAtIso).toLocaleTimeString()}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Dispatches an automated background notification to external endpoints
 * (Email alert via FormSubmit, Webhook, etc.) without blocking the user.
 */
export async function dispatchLeadNotification(
  lead: CapturedLeadRecord
): Promise<{ success: boolean; channels: string[] }> {
  const settings = getConciergeSettings();
  const channels: string[] = [];

  const payload = {
    _subject: `⚡ [NOVA HOT LEAD] ${lead.clientName} (${lead.clientPhone}) - ${lead.ritualName}`,
    referenceCode: lead.referenceCode,
    guestName: lead.clientName,
    guestPhone: lead.clientPhone,
    guestEmail: lead.clientEmail,
    ritual: `${lead.ritualName} (${lead.duration} - ${lead.examplePrice})`,
    preferredDate: lead.preferredDate,
    preferredTime: lead.preferredTime,
    notes: lead.notes || 'None',
    status: lead.status,
    action: 'Customer filled booking form on website. Contact immediately!',
    capturedAt: lead.capturedAtIso,
  };

  // 1. If custom Webhook is configured (Zapier / Make / Telegram / Discord / Google Sheets)
  if (settings.webhookUrl) {
    try {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });
      channels.push('custom_webhook');
    } catch (e) {
      console.warn('Custom webhook dispatch failed', e);
    }
  }

  // 2. Dispatch via FormSubmit AJAX to notify salon owner email
  if (settings.notificationEmail && isBrowser()) {
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(settings.notificationEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      channels.push('email_alert');
    } catch {
      // In case of network errors or adblock, silently continue
      channels.push('email_attempted');
    }
  }

  // 3. Automated dispatch directly to Owner's Google Sheet (via Google Apps Script Webhook)
  const googleSheetUrl =
    settings.googleSheetsWebhookUrl ||
    (typeof SALON_CONFIG !== 'undefined' && (SALON_CONFIG as any).integrations?.googleSheetsWebhookUrl);

  if (googleSheetUrl) {
    try {
      const sheetRow = {
        timestamp: new Date(lead.capturedAtIso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        referenceCode: lead.referenceCode,
        clientName: lead.clientName,
        clientPhone: lead.clientPhone,
        clientEmail: lead.clientEmail,
        ritualName: lead.ritualName,
        duration: lead.duration,
        examplePrice: lead.examplePrice,
        preferredDate: lead.preferredDate,
        preferredTime: lead.preferredTime,
        status:
          lead.status === 'vip_privilege_claimed'
            ? '₹500 VIP Voucher Claimed'
            : lead.status === 'confirmed_on_site' || lead.status === 'draft_entered'
              ? 'Form Filled (Did Not Send)'
              : lead.status === 'dispatched_whatsapp'
                ? 'Sent via WhatsApp'
                : lead.status,
        notes: lead.notes || '',
      };

      await fetch(googleSheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetRow),
        mode: 'no-cors',
      });
      channels.push('google_sheets');
    } catch (e) {
      console.warn('Google Sheets dispatch failed', e);
    }
  }

  // 4. Automated WhatsApp message to Admin's WhatsApp (+91 7275256535) via CallMeBot API
  if (settings.callMeBotApiKey) {
    try {
      const cleanAdminPhone = (settings.receptionPhone || '917275256535').replace(/\D/g, '');
      const fullPhone = cleanAdminPhone.length === 10 ? `91${cleanAdminPhone}` : cleanAdminPhone;
      const alertMsg = formatOwnerAlertText(lead);
      await fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${fullPhone}&text=${encodeURIComponent(alertMsg)}&apikey=${encodeURIComponent(settings.callMeBotApiKey)}`,
        { mode: 'no-cors' }
      );
      channels.push('admin_whatsapp_automated');
    } catch (e) {
      console.warn('Automated WhatsApp dispatch failed', e);
    }
  }

  // 4. Automated Telegram Bot alert to Admin (if configured)
  if (settings.telegramBotToken && settings.telegramChatId) {
    try {
      const alertMsg = formatOwnerAlertText(lead);
      await fetch(
        `https://api.telegram.org/bot${encodeURIComponent(settings.telegramBotToken)}/sendMessage?chat_id=${encodeURIComponent(settings.telegramChatId)}&text=${encodeURIComponent(alertMsg)}`,
        { mode: 'no-cors' }
      );
      channels.push('admin_telegram_automated');
    } catch (e) {
      console.warn('Automated Telegram dispatch failed', e);
    }
  }

  return { success: channels.length > 0, channels };
}

/**
 * Generates pre-filled WhatsApp follow-up link for the salon owner to message the guest directly.
 */
export function generateOwnerFollowUpWhatsAppUrl(lead: CapturedLeadRecord): string {
  let cleanPhone = lead.clientPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const msg = [
    `Hello ${lead.clientName},`,
    ``,
    `Warm greetings from NOVA Sanctuary, Kingship by Kahlon, Lucknow.`,
    `We noticed your reservation request for *${lead.ritualName}* on *${lead.preferredDate}* at *${lead.preferredTime}* (Ref: ${lead.referenceCode}).`,
    ``,
    `We would love to reserve your sanctuary suite for this appointment. Would this time still suit you?`,
  ].join('\n');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

/**
 * Exports captured leads to CSV format for download or Excel import.
 */
export function exportLeadsToCsv(leads: CapturedLeadRecord[]): string {
  const headers = [
    'Reference Code',
    'Status',
    'Guest Name',
    'Phone',
    'Email',
    'Ritual',
    'Duration',
    'Price',
    'Preferred Date',
    'Preferred Time',
    'Notes',
    'Captured At',
  ];

  const rows = leads.map((l) => [
    `"${l.referenceCode}"`,
    `"${l.status}"`,
    `"${l.clientName.replace(/"/g, '""')}"`,
    `"${l.clientPhone.replace(/"/g, '""')}"`,
    `"${l.clientEmail.replace(/"/g, '""')}"`,
    `"${l.ritualName.replace(/"/g, '""')}"`,
    `"${l.duration}"`,
    `"${l.examplePrice}"`,
    `"${l.preferredDate}"`,
    `"${l.preferredTime}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
    `"${l.capturedAtIso}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Sends a captured lead row directly to the owner's Google Sheet Webhook.
 */
export async function sendLeadToGoogleSheet(
  lead: CapturedLeadRecord,
  customWebhookUrl?: string
): Promise<boolean> {
  const url =
    customWebhookUrl ||
    getConciergeSettings().googleSheetsWebhookUrl ||
    (typeof SALON_CONFIG !== 'undefined' && (SALON_CONFIG as any).integrations?.googleSheetsWebhookUrl);

  if (!url) return false;

  try {
    const row = {
      timestamp: new Date(lead.capturedAtIso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      referenceCode: lead.referenceCode,
      clientName: lead.clientName,
      clientPhone: lead.clientPhone,
      clientEmail: lead.clientEmail,
      ritualName: lead.ritualName,
      duration: lead.duration,
      examplePrice: lead.examplePrice,
      preferredDate: lead.preferredDate,
      preferredTime: lead.preferredTime,
      status: lead.status,
      notes: lead.notes || '',
    };

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
      mode: 'no-cors',
    });
    return true;
  } catch (err) {
    console.warn('sendLeadToGoogleSheet error', err);
    return false;
  }
}

/**
 * The 10-line Google Apps Script template for the owner's Google Sheet:
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = JSON.parse(e.postData.contents);
 *   sheet.appendRow([
 *     data.timestamp,
 *     data.referenceCode,
 *     data.clientName,
 *     data.clientPhone,
 *     data.clientEmail,
 *     data.ritualName,
 *     data.duration,
 *     data.examplePrice,
 *     data.preferredDate,
 *     data.preferredTime,
 *     data.status,
 *     data.notes
 *   ]);
 *   return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Auto-create headers & styling if sheet is brand new
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Date & Time",
      "Booking Ref",
      "Customer Name",
      "Phone Number",
      "Email Address",
      "Ritual / Service",
      "Duration",
      "Price",
      "Preferred Date",
      "Preferred Time",
      "Status",
      "Notes / Voucher"
    ]);
    var headerRange = sheet.getRange(1, 1, 1, 12);
    headerRange.setBackground("#18224B");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.timestamp || new Date().toLocaleString(),
    data.referenceCode || '',
    data.clientName || '',
    data.clientPhone || '',
    data.clientEmail || '',
    data.ritualName || '',
    data.duration || '',
    data.examplePrice || '',
    data.preferredDate || '',
    data.preferredTime || '',
    data.status || '',
    data.notes || ''
  ]);
  return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}`;
