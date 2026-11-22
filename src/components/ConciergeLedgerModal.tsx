import React, { useEffect, useState } from 'react';
import {
  CapturedLeadRecord,
  getCapturedLeads,
  updateLeadStatus,
  deleteCapturedLead,
  clearAllCapturedLeads,
  generateOwnerFollowUpWhatsAppUrl,
  exportLeadsToCsv,
  getConciergeSettings,
  saveConciergeSettings,
  verifyConciergePin,
  updateConciergePin,
  ConciergeSettings,
} from '../utils/leadCapture';

interface ConciergeLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConciergeLedgerModal: React.FC<ConciergeLedgerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [leads, setLeads] = useState<CapturedLeadRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'abandoned' | 'dispatched'>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ConciergeSettings>(getConciergeSettings);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinUpdateMessage, setPinUpdateMessage] = useState<string | null>(null);

  // Sync leads when opened or on custom events
  useEffect(() => {
    if (!isOpen) return;

    const refreshLeads = () => {
      setLeads(getCapturedLeads());
    };

    refreshLeads();
    setSettings(getConciergeSettings());

    const handleCustomEvent = () => refreshLeads();
    window.addEventListener('nova:lead_captured', handleCustomEvent);
    window.addEventListener('storage', handleCustomEvent);

    return () => {
      window.removeEventListener('nova:lead_captured', handleCustomEvent);
      window.removeEventListener('storage', handleCustomEvent);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const abandonedLeads = leads.filter(
    (l) => l.status === 'confirmed_on_site' || l.status === 'draft_entered'
  );
  const dispatchedLeads = leads.filter(
    (l) => l.status === 'dispatched_whatsapp' || l.status === 'dispatched_email'
  );

  const displayedLeads = leads.filter((l) => {
    if (filter === 'abandoned') return l.status === 'confirmed_on_site' || l.status === 'draft_entered';
    if (filter === 'dispatched') return l.status === 'dispatched_whatsapp' || l.status === 'dispatched_email';
    return true;
  });

  const handleStatusChange = (id: string, newStatus: CapturedLeadRecord['status']) => {
    updateLeadStatus(id, newStatus);
    setLeads(getCapturedLeads());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this lead record?')) {
      deleteCapturedLead(id);
      setLeads(getCapturedLeads());
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all captured leads from this browser?')) {
      clearAllCapturedLeads();
      setLeads([]);
    }
  };

  const handleDownloadCsv = () => {
    const csv = exportLeadsToCsv(leads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nova_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyLead = (lead: CapturedLeadRecord) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const summary = `NOVA Lead: ${lead.clientName} | Phone: ${lead.clientPhone} | Ritual: ${lead.ritualName} | Date: ${lead.preferredDate} ${lead.preferredTime} | Status: ${lead.status}`;
      navigator.clipboard.writeText(summary);
      setCopiedId(lead.id);
      window.setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveConciergeSettings(settings);
    setSettingsOpen(false);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyConciergePin(enteredPin)) {
      setIsAuthenticated(true);
      setPinError(null);
    } else {
      setPinError('Incorrect PIN. Access restricted to authorized sanctuary staff.');
    }
  };

  const handleLockOut = () => {
    setIsAuthenticated(false);
    setEnteredPin('');
    setPinError(null);
    setSettingsOpen(false);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length >= 4) {
      updateConciergePin(newPinInput.trim());
      setSettings(getConciergeSettings());
      setNewPinInput('');
      setPinUpdateMessage('✓ Staff Security PIN successfully updated!');
      window.setTimeout(() => setPinUpdateMessage(null), 3500);
    } else {
      setPinUpdateMessage('PIN must be at least 4 digits.');
    }
  };

  // If locked, present the staff security gateway
  if (!isAuthenticated) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="concierge-lock-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs text-[#18224B]"
      >
        <div className="relative w-full max-w-md bg-[#FBF9F5] border-2 border-[#18224B] shadow-2xl overflow-hidden">
          <div className="bg-[#18224B] text-[#FBF9F5] px-6 py-4 flex items-center justify-between border-b border-[#FBF9F5]/15">
            <span className="font-mono-tabular text-[10px] uppercase tracking-[0.2em] text-[#E8D5B5]">
              NOVA SANCTUARY · STAFF SECURITY
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase text-[#FBF9F5]/60 hover:text-[#FBF9F5] cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#18224B]/5 border border-[#18224B]/15 text-2xl text-[#18224B]">
              🔒
            </div>

            <div className="space-y-1.5">
              <h2 id="concierge-lock-title" className="font-serif-editorial text-2xl sm:text-3xl text-[#18224B]">
                Staff Concierge Access
              </h2>
              <p className="font-basel text-xs text-[#18224B]/65 leading-relaxed">
                Client phone numbers and booking requests are confidential. Enter your sanctuary staff PIN to view records.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  autoFocus
                  placeholder="• • • •"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(null);
                  }}
                  className="w-44 mx-auto text-center font-mono text-2xl tracking-[0.3em] py-3 bg-white border-2 border-[#18224B]/30 focus:border-[#18224B] focus:outline-none"
                />
                {pinError && (
                  <p role="alert" className="mt-2 text-xs text-[#9E2A2B] font-basel font-medium">
                    {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full font-basel py-3.5 px-6 text-xs uppercase tracking-[0.14em] bg-[#18224B] text-white hover:bg-[#2A3772] transition-colors cursor-pointer font-medium"
              >
                Unlock Customer Ledger →
              </button>
            </form>

            <span className="text-[10px] text-[#18224B]/40 block font-mono">
              Protected by 4-digit PIN · Kingship by Kahlon
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="concierge-ledger-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs text-[#18224B]"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#FBF9F5] border border-[#C5B393]/70 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#18224B] text-[#FBF9F5] px-6 py-5 flex items-center justify-between border-b border-[#FBF9F5]/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-mono-tabular text-[10px] uppercase tracking-[0.2em] text-[#E8D5B5]">
                RECEPTION DESK · LUCKNOW
              </span>
            </div>
            <h2
              id="concierge-ledger-title"
              className="font-serif-editorial text-2xl sm:text-3xl font-light tracking-[-0.015em]"
            >
              Concierge Leads Ledger
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLockOut}
              className="font-basel text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 border border-[#FBF9F5]/30 hover:border-[#FBF9F5] text-[#FBF9F5] transition-colors cursor-pointer"
              title="Lock Concierge Desk immediately"
            >
              🔒 Lock Desk
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="font-basel text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 border border-[#FBF9F5]/30 hover:border-[#FBF9F5] text-[#FBF9F5] transition-colors cursor-pointer"
            >
              {settingsOpen ? 'Close Settings' : '⚙ Alerts & PIN'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close concierge ledger"
              className="font-basel text-xs uppercase tracking-[0.1em] px-3 py-1.5 bg-[#FBF9F5] text-[#18224B] hover:bg-[#E8D5B5] transition-colors cursor-pointer font-medium"
            >
              Done ✕
            </button>
          </div>
        </div>

        {/* Alerts Configuration Panel (Collapsible) */}
        {settingsOpen && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-[#F0ECE1] border-b border-[#C5B393]/60 p-5 space-y-4 font-basel text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-editorial text-lg text-[#18224B]">
                Real-Time Lead Alert Dispatch Settings
              </h3>
              <span className="text-[11px] text-[#18224B]/60">
                Notifies you the moment any visitor fills the form
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10.5px] uppercase tracking-[0.1em] text-[#18224B]/70 mb-1">
                  Alert Email Address
                </label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, notificationEmail: e.target.value })
                  }
                  placeholder="info@novasalon.in"
                  className="w-full bg-white border border-[#18224B]/20 px-3 py-2 text-xs focus:outline-none focus:border-[#18224B]"
                />
                <span className="text-[10px] text-[#18224B]/50 mt-0.5 block">
                  Receives automated instant emails via FormSubmit when a lead is captured.
                </span>
              </div>

              <div>
                <label className="block text-[10.5px] uppercase tracking-[0.1em] text-[#18224B]/70 mb-1">
                  Webhook URL (Optional: Zapier / Make / Telegram / Sheets)
                </label>
                <input
                  type="url"
                  value={settings.webhookUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, webhookUrl: e.target.value })
                  }
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="w-full bg-white border border-[#18224B]/20 px-3 py-2 text-xs focus:outline-none focus:border-[#18224B]"
                />
                <span className="text-[10px] text-[#18224B]/50 mt-0.5 block">
                  Pings this webhook silently with full lead JSON payload on form completion.
                </span>
              </div>

              <div>
                <label className="block text-[10.5px] uppercase tracking-[0.1em] text-[#18224B]/70 mb-1">
                  Automated Admin WhatsApp API Key (CallMeBot)
                </label>
                <input
                  type="text"
                  value={settings.callMeBotApiKey || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, callMeBotApiKey: e.target.value })
                  }
                  placeholder="e.g. 123456"
                  className="w-full bg-white border border-[#18224B]/20 px-3 py-2 text-xs focus:outline-none focus:border-[#18224B]"
                />
                <span className="text-[10px] text-[#18224B]/50 mt-0.5 block">
                  Enables automated background WhatsApp alerts sent straight to {settings.receptionPhone}.
                </span>
              </div>

              <div>
                <label className="block text-[10.5px] uppercase tracking-[0.1em] text-[#18224B]/70 mb-1">
                  Reception Phone Number
                </label>
                <input
                  type="text"
                  value={settings.receptionPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, receptionPhone: e.target.value })
                  }
                  placeholder="917275256535"
                  className="w-full bg-white border border-[#18224B]/20 px-3 py-2 text-xs focus:outline-none focus:border-[#18224B]"
                />
                <span className="text-[10px] text-[#18224B]/50 mt-0.5 block">
                  Admin destination phone number with country code (e.g. 917275256535).
                </span>
              </div>

              <div>
                <label className="block text-[10.5px] uppercase tracking-[0.1em] text-[#18224B]/70 mb-1">
                  Change Staff Security PIN (Default: 1428)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="New 4-digit PIN"
                    className="flex-1 bg-white border border-[#18224B]/20 px-3 py-2 text-xs focus:outline-none focus:border-[#18224B]"
                  />
                  <button
                    type="button"
                    onClick={handleChangePin}
                    className="px-3 py-2 bg-[#18224B] text-white text-xs hover:bg-[#2A3772] cursor-pointer whitespace-nowrap"
                  >
                    Update PIN
                  </button>
                </div>
                {pinUpdateMessage && (
                  <span className="text-[10.5px] text-[#065F46] font-medium mt-1 block">
                    {pinUpdateMessage}
                  </span>
                )}
                <span className="text-[10px] text-[#18224B]/50 mt-0.5 block">
                  Locks the concierge ledger so only you and authorized staff can view client records.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 border border-[#18224B]/25 hover:border-[#18224B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#18224B] text-[#FBF9F5] hover:bg-[#2A3772] cursor-pointer font-medium"
              >
                Save Settings
              </button>
            </div>
          </form>
        )}

        {/* Metric Badges & Filter Tabs */}
        <div className="bg-[#F7F4EE] px-6 py-4 border-b border-[#C5B393]/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`font-basel text-xs px-3.5 py-1.5 cursor-pointer transition-colors ${
                filter === 'all'
                  ? 'bg-[#18224B] text-white font-medium'
                  : 'bg-white border border-[#18224B]/15 text-[#18224B] hover:border-[#18224B]'
              }`}
            >
              All Leads ({leads.length})
            </button>

            <button
              type="button"
              onClick={() => setFilter('abandoned')}
              className={`font-basel text-xs px-3.5 py-1.5 cursor-pointer transition-colors flex items-center gap-1.5 ${
                filter === 'abandoned'
                  ? 'bg-[#D97706] text-white font-medium'
                  : 'bg-white border border-[#D97706]/40 text-[#B45309] hover:bg-[#FEF3C7]'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#D97706]" />
              <span>Needs Follow-up ({abandonedLeads.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('dispatched')}
              className={`font-basel text-xs px-3.5 py-1.5 cursor-pointer transition-colors flex items-center gap-1.5 ${
                filter === 'dispatched'
                  ? 'bg-[#059669] text-white font-medium'
                  : 'bg-white border border-[#059669]/40 text-[#047857] hover:bg-[#ECFDF5]'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#059669]" />
              <span>Sent via WhatsApp ({dispatchedLeads.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {leads.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="font-basel text-xs text-[#18224B] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>📥 Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="font-basel text-xs text-red-600/70 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Leads Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {displayedLeads.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="text-4xl">📋</span>
              <h3 className="font-serif-editorial text-2xl text-[#18224B]/75">
                No Leads in This View
              </h3>
              <p className="font-basel text-xs text-[#18224B]/55 max-w-sm mx-auto">
                Whenever a visitor fills out their name, phone, and selects a ritual on the booking drawer, their details appear here in real time—even if they do not click send!
              </p>
            </div>
          ) : (
            displayedLeads.map((lead) => {
              const isAbandoned =
                lead.status === 'confirmed_on_site' || lead.status === 'draft_entered';
              return (
                <div
                  key={lead.id}
                  className={`p-5 sm:p-6 border transition-all ${
                    isAbandoned
                      ? 'bg-[#FFFDF7] border-[#F59E0B]/50 shadow-sm'
                      : 'bg-white border-[#18224B]/15'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#18224B]/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isAbandoned ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40 text-[10px] font-basel uppercase tracking-[0.08em] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706] animate-pulse" />
                            Form Filled · Not Sent (Call Now)
                          </span>
                        ) : lead.status === 'dispatched_whatsapp' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ECFDF5] text-[#065F46] border border-[#10B981]/30 text-[10px] font-basel uppercase tracking-[0.08em] font-medium">
                            ✓ Sent via WhatsApp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F3F4F6] text-[#374151] text-[10px] font-basel uppercase tracking-[0.08em]">
                            {lead.status}
                          </span>
                        )}

                        <span className="font-mono-tabular text-[11px] text-[#18224B]/60">
                          REF: {lead.referenceCode}
                        </span>
                      </div>

                      <h4 className="font-serif-editorial text-xl sm:text-2xl text-[#18224B]">
                        {lead.clientName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="font-mono-tabular text-[11px] text-[#18224B]/65 block">
                        {new Date(lead.capturedAtIso).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-[10px] text-[#18224B]/40 font-mono">
                        ID: {lead.id.slice(-6)}
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3.5 text-xs font-basel border-b border-[#18224B]/10">
                    <div>
                      <span className="text-[10.5px] uppercase tracking-[0.08em] text-[#18224B]/50 block mb-0.5">
                        Phone &amp; Email
                      </span>
                      <a
                        href={`tel:${lead.clientPhone}`}
                        className="font-mono-tabular font-semibold text-[#18224B] hover:underline block text-[13px]"
                      >
                        {lead.clientPhone}
                      </a>
                      <span className="text-[#18224B]/70 truncate block">{lead.clientEmail}</span>
                    </div>

                    <div>
                      <span className="text-[10.5px] uppercase tracking-[0.08em] text-[#18224B]/50 block mb-0.5">
                        Selected Ritual
                      </span>
                      <span className="font-medium text-[#18224B] block">{lead.ritualName}</span>
                      <span className="text-[#18224B]/60 font-mono-tabular text-[11px]">
                        {lead.duration} · {lead.examplePrice}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10.5px] uppercase tracking-[0.08em] text-[#18224B]/50 block mb-0.5">
                        Requested Window
                      </span>
                      <span className="font-mono-tabular font-medium text-[#18224B] block">
                        {lead.preferredDate}
                      </span>
                      <span className="text-[#18224B]/75 font-mono-tabular">{lead.preferredTime}</span>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {lead.notes && (
                    <div className="py-2.5 text-xs font-basel border-b border-[#18224B]/10 flex items-start gap-2 text-[#18224B]/80">
                      <span className="text-[10.5px] uppercase tracking-[0.08em] text-[#18224B]/50 shrink-0">
                        Notes:
                      </span>
                      <span>{lead.notes}</span>
                    </div>
                  )}

                  {/* Direct Contact Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Call Client Directly */}
                      <a
                        href={`tel:${lead.clientPhone}`}
                        className="font-basel inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#18224B] text-white hover:bg-[#27387A] transition-colors cursor-pointer"
                      >
                        <span>📞</span>
                        <span>Call Guest</span>
                      </a>

                      {/* WhatsApp Guest with Pre-filled Follow-up */}
                      <a
                        href={generateOwnerFollowUpWhatsAppUrl(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-basel inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#10B981] text-white hover:bg-[#059669] transition-colors cursor-pointer font-medium"
                      >
                        <span>💬</span>
                        <span>WhatsApp Guest Directly</span>
                      </a>

                      {/* Copy summary */}
                      <button
                        type="button"
                        onClick={() => handleCopyLead(lead)}
                        className="font-basel text-xs px-2.5 py-1.5 border border-[#18224B]/20 hover:border-[#18224B] text-[#18224B] transition-colors cursor-pointer"
                      >
                        {copiedId === lead.id ? '✓ Copied' : '📋 Copy Info'}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {isAbandoned && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(lead.id, 'contacted')}
                          className="font-basel text-xs text-[#059669] hover:underline cursor-pointer"
                        >
                          Mark as Contacted
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(lead.id)}
                        className="font-basel text-xs text-red-600/70 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F0ECE1] px-6 py-3 border-t border-[#C5B393]/50 flex items-center justify-between text-xs font-basel text-[#18224B]/70">
          <span>
            Real-time lead capture active · Stored securely in your browser &amp; dispatched to reception
          </span>
          <span className="font-mono-tabular text-[11px]">
            Reception: +91 72752 56535
          </span>
        </div>
      </div>
    </div>
  );
};
