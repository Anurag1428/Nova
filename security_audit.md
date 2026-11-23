# Comprehensive Security & Privacy Audit: NOVA Sanctuary

* **Application:** NOVA Unisex Salon & Makeup Studio Frontend Web Application
* **Auditor:** Automated Codebase Security Assessment
* **Date:** 2026-11-23
* **Repository State:** Synchronized with `origin/main` (`11a1f76`)

---

## Executive Summary

| Risk Category | Severity | Current Status | Primary Vulnerability / Concern |
| :--- | :---: | :---: | :--- |
| **1. API Credentials & Token Handling** | **HIGH** | ⚠️ Needs Proxy | Airtable PAT (`VITE_AIRTABLE_TOKEN`) exposed in browser network requests |
| **2. Customer Data Privacy (DPDP / GDPR)** | **MEDIUM** | ⚠️ Noticeable | Full lead dossiers (names, phone numbers) persisted in client `localStorage` |
| **3. Anti-Spam & Bot Protection** | **MEDIUM** | ⚠️ Unmitigated | No honeypot field or CAPTCHA on auto-dispatching lead capture inputs |
| **4. XSS & Code Injection** | **SECURE** | ✅ Clean | 0 occurrences of `dangerouslySetInnerHTML`, `innerHTML`, or `eval()` |
| **5. Dependency Vulnerabilities** | **SECURE** | ✅ Clean | `npm audit` reports 0 known CVEs across all 37 dependencies |
| **6. URL & Link Injection** | **SECURE** | ✅ Clean | Strict `encodeURIComponent` sanitization on all WhatsApp and mailto links |
| **7. Transport Security & Headers** | **LOW** | ℹ️ Hardening | Missing explicit Content Security Policy (CSP) headers in `vercel.json` |

---

## Detailed Vulnerability Analysis

### 1. Client-Side Airtable Token Exposure (Severity: HIGH)
* **Mechanics:** 
  The project is a client-side Single-Page Application (SPA). `src/utils/leadCapture.ts` and `src/utils/liveSalonSettings.ts` perform direct `fetch()` calls to `https://api.airtable.com/v0/...` directly from the user's browser, passing `Authorization: Bearer <token>`.
* **Impact:**
  1. Anyone visiting the website can press `F12` $\rightarrow$ **Network tab**, trigger a lead or page load, and view the plaintext Airtable Personal Access Token (PAT).
  2. If that PAT was generated with `data.records:read` scopes across the base, a malicious party could write a 3-line script to download the entire `Consultation Bookings` and `VIP Vouchers` tables, exposing customer names, phone numbers, and booking notes.
  3. An attacker could delete records or trigger the Airtable 5 requests/sec rate limit to disrupt reception operations.
* **Remediation Options:**
  * **Option A (Recommended for Vercel/Netlify):** Add a serverless proxy route (e.g. `/api/leads` and `/api/settings` using standard Vercel serverless functions in an `api/` directory). The browser communicates with your serverless route without credentials, and the serverless function communicates with Airtable server-to-server. The Airtable PAT never touches the client browser.
  * **Option B (Immediate Token Scope Hardening):** In Airtable Developer Hub (`airtable.com/create/tokens`), ensure the token scope is restricted to:
    - `data.records:write` ONLY for the bookings and vouchers tables (remove read permission).
    - `data.records:read` ONLY for the `Salon Settings` table.
    *Note: Even with write-only scopes, an exposed token can still be spammed with dummy records.*

---

### 2. Customer Lead Persistence in Browser `localStorage` (Severity: MEDIUM)
* **Mechanics:**
  In `src/utils/leadCapture.ts`, `saveCapturedLead()` pushes customer lead records into `window.localStorage.getItem('nova_captured_leads_v1')`. Up to 100 historical bookings are saved in plain text.
* **Impact:**
  If a customer books an appointment from a shared computer (e.g. a public library, office terminal, or hotel lobby), another user of that computer can inspect `localStorage` and view past client names, mobile numbers, and personal booking notes.
* **Remediation:**
  Only store the *current* visitor's active reference code in `sessionStorage` or a lightweight `localStorage` dismissal flag. Customer personal details should be transmitted to the CRM and cleared from browser storage upon session completion.

---

### 3. Lack of Honeypot / Bot Throttling on Auto-Capture Form (Severity: MEDIUM)
* **Mechanics:**
  Both `BookingDrawer.tsx` and `VipPrivilegeModal.tsx` trigger an automated background dispatch when the phone field reaches 10 digits (`length >= 10`).
* **Impact:**
  A basic scraping bot or automated script could generate synthetic form inputs and spam the Airtable table with thousands of fake records, consuming Airtable record quotas and polluting reception CRM data.
* **Remediation:**
  1. Add an invisible honeypot field (e.g. `<input name="sanctuary_fax_code" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />`). If this hidden field contains any text upon dispatch, abort transmission because humans cannot see or type into it.
  2. Introduce IP/session rate-limiting at the serverless proxy boundary.

---

### 4. Content Security Policy (CSP) & HTTP Headers (Severity: LOW)
* **Mechanics:**
  Neither `index.html` nor `vercel.json` currently defines strict security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).
* **Impact:**
  The site is vulnerable to iframe clickjacking if embedded on an external phishing domain mimicking the salon.
* **Remediation:**
  Add a `headers` block in `vercel.json` enforcing `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff`.

---

## Clean Security Invariants (What the Code Does Right)

1. **Zero Cross-Site Scripting (XSS) Vectors:**
   * React 19 JSX automatically sanitizes and HTML-encodes all dynamic text inputs.
   * Exhaustive audit confirmed 0 occurrences of `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, or `eval()`.
2. **Zero Third-Party Dependency Vulnerabilities:**
   * `npm audit` returned `found 0 vulnerabilities` across all dependencies.
3. **URL Parameter Encoding:**
   * All outgoing WhatsApp and mailto links strictly utilize `encodeURIComponent()`, preventing parameter injection or URL splitting attacks.
4. **Git Push Protection Enforced:**
   * `.env` is correctly included in `.gitignore`. Production PAT tokens are prevented from leaking into GitHub public commit history.

---

## Action Plan: Recommended Implementation Order

1. **Phase 1 (Immediate / Zero-Cost):**
   * Review token permissions in Airtable Developer Hub to ensure write-only scopes on customer data.
   * Add a hidden honeypot field to `BookingDrawer.tsx` and `VipPrivilegeModal.tsx`.
   * Add standard security headers (`X-Frame-Options`, `X-Content-Type-Options`) to `vercel.json`.
2. **Phase 2 (Architecture Hardening before live client traffic):**
   * Migrate client-side Airtable API calls to lightweight Vercel Serverless Functions (`api/lead.ts` and `api/settings.ts`) so credentials stay completely hidden behind server-side execution.
