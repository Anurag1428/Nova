# NOVA Sanctuary — End-to-End Comprehensive System & Functionality Inspection

* **Project:** NOVA Unisex Salon & Makeup Studio (Kingship by Kahlon, Sector 16, Vrindavan Colony, Lucknow)
* **Author:** Anurag1428
* **Inspection Date:** 2026-11-23
* **Repository State:** Branch `main` (clean, synchronized with `origin/main`)
* **Test Suite Status:** 38 / 38 unit tests passing (0 failed, 0 skipped)
* **Production Build:** Success (`dist/index.html` 1.96 kB, gzip 0.90 kB; CSS 97.94 kB; JS 477 kB)

---

## 1. System Architecture & Tech Stack

| Layer | Implementation | Operational Details |
| :--- | :--- | :--- |
| **Framework** | React 19 (`react: ^19.0.1`, `react-dom: ^19.0.1`) | Functional components, custom hooks, React Error Boundary |
| **Language & Typings** | TypeScript 7 (`typescript: ^7.0.2`) | Strict typing, zero `any` in critical logic, `tsc --noEmit` clean |
| **Build & Dev Tooling** | Vite 8 (`vite: ^8.3.0`, `@tailwindcss/vite: ^4.3.3`) | ES modules, native HMR, production build in 450ms |
| **Styling & Design System** | Tailwind CSS v4, Cormorant Garamond, Basel Grotesk | Quiet-luxury palette: Midnight Navy (`#18224B`), Warm Alabaster (`#FBF9F5`), Champagne Gold (`#C5B393`) |
| **Animation Engines** | GSAP 3.15 + ScrollTrigger, Motion 12 | Pinned scrub timelines, matchMedia mobile degradations |
| **Headless CMS & CRM** | Airtable REST API + LocalStorage Ledger | Zero-redeploy offer management + live client lead capture |

---

## 2. Detailed Functionality Breakdown by Module

### Module 1: Page Navigation, Routing & Transition Engine
* **Files:** `src/App.tsx`, `src/utils/pageTransition.ts`, `src/components/PageTransitionCurtain.tsx`, `src/components/NavHoverLink.tsx`
* **Mechanisms:**
  * Client-side page router with 3 views: `'home'`, `'treatments'`, and `'about'`.
  * **Rising Alabaster Curtain Transition**: When navigating between pages, a dedicated full-screen curtain sweeps upward (`riseDuration: 0.55s`), holds momentarily (`0.08s`), mounts the target page at `scrollY = 0`, and sweeps away (`revealDuration: 0.6s`).
  * **Reduced Motion Compliance**: Verified with unit tests (`pageTransition.test.ts`); disables curtain displacement for users with OS `prefers-reduced-motion`.
  * **Navigation Links**: Every link features a subtle gold/navy hover dot animation with keyboard accessibility (`Enter` and `Space` activation).

### Module 2: Opening Film & Horizon Sequence
* **Files:** `src/App.tsx` (lines 277–395), `src/components/InteractiveNovaWordmark.tsx`, `src/utils/wordmarkMotion.ts`
* **Mechanisms:**
  * **Dual-Slab Cinematic Opening**: On first load, two warm grey slabs slide vertically apart with cubic-bezier easing to reveal the salon editorial film.
  * **50vh Horizon Navigation**: A continuous navigation horizon stays pinned across the opening film, housing the brand wordmark, service categories, and consultation CTA.
  * **Interactive Wordmark Physics**: Hovering over the wordmark causes letter "O" to roll gently toward "V", while "V" cradles "O" with a golden sparkle accent.

### Module 3: Navigation Header & Slide-Over Menu Drawer
* **Files:** `src/components/Header.tsx`, `src/components/MenuDrawer.tsx`
* **Mechanisms:**
  * **Sticky Top Bar**: Becomes visible once the user scrolls past the opening horizon (`isScrolled`).
  * **Contrast Inversion**: Automatically detects when it is floating over dark full-bleed video versus white editorial sections, switching text and button contrast between ivory (`#FBF9F5`) and midnight navy (`#18224B`).
  * **Slide-Over Menu Drawer**: Clicking "Menu" opens an alabaster slide-over drawer featuring numbered navigation (1. Home, 2. Treatments, 3. Concerns, 4. About, 5. Reserve), salon contact details, physical address, Google Maps directions, and direct links to **Instagram** (`nova.unisexsalon8866`) and **WhatsApp** (`+91 72752 56535`).

### Module 4: "Why NOVA?" 4-Chapter Storytelling & Portals
* **Files:** `src/components/InteractiveChapters.tsx`, `src/utils/bookingLogic.ts`
* **Mechanisms:**
  * **Desktop ($ \ge 1024\text{px} $)**: Pins a 4-chapter narrative ("Quiet Stillness", "Skin Integrity", "Restorative Touch", "Unhurried Beauty") scrubbed via GSAP ScrollTrigger with a live numeric counter (`01 / 04`) and synchronized progress bar.
  * **Mobile ($ < 1024\text{px} $)**: Disables sticky scroll trapping entirely; renders chapters in a clean, natural vertical reading flow.
  * **Dual Portals**: Transitions into two dual-tone visual portal cards ("Explore Specific Concerns" and "Explore Treatments") with scroll-triggered entrance animations.

### Module 5: Treatments Modality Deck & Ritual Catalog
* **Files:** `src/components/TreatmentsSection.tsx`, `src/utils/treatmentsScroll.ts`, `src/data/salonData.ts`
* **Mechanisms:**
  * **4 Service Categories**:
    1. *Facials and skin treatments* (3 rituals: NOVA Signature Facial ₹2,500, Barrier Calm Infusion ₹1,800, Sculpt & Illuminate ₹3,200).
    2. *Manicure, pedicure and nail art* (3 rituals: Bare Luxury Manicure ₹1,200, Structured Gel Nail Art ₹1,800, Warm Stone Pedicure ₹1,500).
    3. *Professional and bridal makeup* (3 rituals: Bridal Beauty Preview ₹8,500, Wedding Day Artistry ₹15,000, Occasion Makeup ₹5,500).
    4. *Skincare consultations* (3 rituals: One-on-One Skincare Edit ₹999, Consultation + Bespoke Facial ₹2,999, Bridal Skin Journey ₹1,999).
  * **Pricing**: Authentically localized in Indian Rupees (`₹`).
  * **Desktop Experience**: 3D stacked card deck where scrolling flips through each modality with synchronous editorial video playback.
  * **Mobile Experience**: Each modality expands into an unpinned card layout with inline media.
  * **Direct Booking Handoff**: Tapping "Book This Ritual" on any card opens the booking drawer with that category and ritual pre-selected.

### Module 6: About Sanctuary & Founder Profile
* **Files:** `src/components/AboutSection.tsx`, `src/data/salonData.ts`
* **Mechanisms:**
  * Editorial architectural presentation of the Kingship by Kahlon sanctuary in Lucknow.
  * Features the verified studio blazer portrait of Founder Hershita (`owner_portrait_studio_blazer`).
  * Core ethos cards: Barrier-First Skincare, Tactile Precision, Unhurried Scheduling.
  * Location details with one-click Google Maps pin directions.

### Module 7: Single-Flow Consultation Booking Engine
* **Files:** `src/components/BookingDrawer.tsx`, `src/utils/bookingLogic.ts`
* **Mechanisms:**
  * **Simplified Single Screen**: Eliminated multi-step back-and-forth; all 4 steps (Modality, Ritual, Schedule, Guest Details) reside on one unified scrollable surface.
  * **Auto Date Generation**: Dynamically generates the next 6 upcoming calendar dates (starting tomorrow, skipping past days).
  * **Progressive Real-Time Lead Capture**: The instant a visitor enters 10 digits in the WhatsApp phone input, a background timer dispatches their lead to Airtable CRM after 800ms—capturing the lead even if they never submit or abandon the page.
  * **Indian Phone Formatting**: Automatically formats 10-digit input to `+91 XXXXX XXXXX`, preventing Airtable from formatting Indian numbers as US phone numbers.
  * **Autofill Enabled**: Inputs use semantic `autoComplete="name"` and `autoComplete="tel"` for 1-tap browser filling.
  * **Letterpress Confirmation Card**: Upon submission, renders an editorial appointment confirmation card displaying reference code, client name, ritual, and date.
  * **Multi-Channel WhatsApp Transmission**:
    * Primary: 1-click mobile deep link (`https://wa.me/917275256535?text=...`).
    * Secondary: Dedicated WhatsApp Web button (`https://web.whatsapp.com/send?...`).
    * Tertiary: Native desktop protocol (`whatsapp://send?...`).
    * Copy to Clipboard: Automatically copies the booking message so the guest can paste it anywhere if their popup blocker engages.

### Module 8: VIP Privilege Lead Magnet & Headless Offer CMS
* **Files:** `src/components/VipPrivilegeModal.tsx`, `src/utils/liveSalonSettings.ts`, `src/App.tsx`
* **Mechanisms:**
  * **12-Second Proactive Invitation**: Invites first-time visitors with a welcome credit modal after 12 seconds of browsing.
  * **Dismissal Memory**: Stores dismissal in `localStorage` (`nova_vip_privilege_dismissed_v1`) to prevent re-prompting returning visitors.
  * **Zero-Redeployment Headless CMS**:
    * Reads live settings from Airtable table `Salon Settings` (`tblFhgDOcFoqyKjAT`).
    * The owner can change the promotion amount (e.g., from `500` to `750` or `1000`) or toggle the popup on/off from the Airtable mobile app on their phone.
    * Updates automatically reflect across the website headline, body text, voucher code, and booking drawer banner with zero code changes or rebuilds.
  * **Offline Resilience**: If Airtable is momentarily unreachable, the system falls back to default values (`₹500` / `NOVA-VIP500` / `true`) with zero layout shift or console crash.
  * **Floating Access Pill**: Renders a luxury floating pill (`hidden sm:block`) on the bottom-left of the screen, dynamically hidden if the owner disables the promotion in Airtable.

### Module 9: CRM & Data Persistence Layer
* **Files:** `src/utils/leadCapture.ts`, `src/data/salonData.ts`
* **Mechanisms:**
  * **Airtable Direct Integration**:
    * Token securely sourced from `import.meta.env.VITE_AIRTABLE_TOKEN`.
    * Base ID: `appy0KzWMlpXE4TNN`.
    * Bookings Table: `tblzJVBkuxP6xSINF` (`Consultation Bookings`).
    * VIP Table: `tblGXJsK7tQWqf0kP` (`VIP Vouchers`).
    * Settings Table: `tblFhgDOcFoqyKjAT` (`Salon Settings`).
  * **Local Storage Offline Ledger**: Every lead is additionally saved to `nova_captured_leads_v1` in the visitor's browser for offline recovery.
  * **Google Sheets Webhook Relay**: Supports optional simultaneous forwarding to a Google Sheet.

### Module 10: Interactive 3D Rolling Marble
* **Files:** `src/components/RollingMarble.tsx`
* **Mechanisms:**
  * Renders a 3D nacre-pearl sphere on an HTML5 `<canvas>` using equirectangular spherical projection mathematics.
  * Rolls with page scroll velocity and tilts dynamically toward the user's cursor.
  * Displays Kintsugi gold mineral veins and floor shadow caustics.
  * Mobile-safe: Custom cursor is restricted to desktop (`lg:cursor-none`), preserving native touch scrolling on phones and tablets.

### Module 11: Production Invariants, SEO & Hosting Configuration
* **Files:** `index.html`, `public/favicon.*`, `vercel.json`, `public/_redirects`, `src/main.tsx`
* **Mechanisms:**
  * **Favicon Suite**: Installed official circular crown emblem in vector PNG, ICO (multi-size 16 to 64px), and Apple Touch Icon.
  * **OpenGraph Sharing**: Configured `og:image` and `twitter:image` with high-resolution salon photography for WhatsApp and Instagram link previews.
  * **SPA Deep-Route Rewrites**: Configured `vercel.json` rewrites and `public/_redirects` (`/* /index.html 200`) to guarantee that refreshing on any sub-route never returns a 404 error on Vercel, Netlify, or Cloudflare Pages.
  * **Runtime Safety**: `RootErrorBoundary` shields against unhandled React rendering exceptions, displaying a branded recovery view.

---

## 3. Automated Test Verification

All 38 automated unit tests pass cleanly:

```
✔ formatChapterCounter formats active chapter and bounds correctly (0.89ms)
✔ resolveScrollStoryState maps scroll progress across 4 chapters and portal emergence (0.19ms)
✔ getNextChapterIndex cycles smoothly through chapters 1 to 4 (0.12ms)
✔ findServiceById and getCategoryServices locate configured rituals (0.18ms)
✔ validateBookingForm rejects empty or invalid fields and accepts complete input (0.35ms)
✔ createBookingRecord produces deterministic demo booking summary (1.19ms)
✔ SALON_CONFIG uses NOVA brand exclusively without legacy references (1.04ms)
✔ validateBookingStep scopes validation cleanly to each consultation step (0.26ms)
✔ getUpcomingConsultationDates generates sequential ISO dates starting tomorrow (0.42ms)
✔ toggleRitualPreferenceNote adds and removes preference tags cleanly (0.37ms)
✔ generateWhatsAppBookingUrl and generateEmailBookingUrl format direct salon transmission links (0.76ms)
✔ saveCapturedLead and getCapturedLeads persist and order leads newest first (2.19ms)
✔ updateLeadStatus cleanly transitions workflow state (0.32ms)
✔ formatOwnerAlertText highlights abandoned leads that filled form without sending (15.35ms)
✔ generateOwnerFollowUpWhatsAppUrl builds direct contact link with client details (0.36ms)
✔ exportLeadsToCsv generates valid CSV rows (0.26ms)
✔ getConciergeSettings and saveConciergeSettings store contact preferences (0.20ms)
✔ verifyConciergePin validates 4-digit security PIN and rejects unauthorized attempts (0.16ms)
✔ GOOGLE_APPS_SCRIPT_TEMPLATE provides valid Apps Script code (0.09ms)
✔ sendLeadToGoogleSheet safely handles missing webhook URL (0.28ms)
✔ sendLeadToAirtable connects to Airtable and returns boolean result (0.53ms)
✔ DEFAULT_VIP_SETTINGS has safe fallback values (0.86ms)
✔ fetchLiveSalonSettings returns valid settings structure (0.29ms)
✔ shouldAnimatePageTransition animates cross-page navigation only (1.39ms)
✔ shouldAnimatePageTransition disables curtain animation when reducedMotion is enabled (0.28ms)
✔ getPageTransitionTimings exposes balanced positive durations (0.26ms)
✔ resolveTreatmentsHeroStage starts with crisp split headline and hidden manifesto (1.29ms)
✔ resolveTreatmentsHeroStage softens headline and reveals manifesto as user scrolls (0.28ms)
✔ resolveTreatmentsHeroStage removes blur and displacement under reduced motion (0.17ms)
✔ resolveActiveTreatmentsSection tracks active anchor and dark surface contrast accurately (0.28ms)
✔ resolveModalityDeckState settles cleanly on first and last slides at progress extremes (0.61ms)
✔ resolveModalityDeckState blends outgoing vanishing slide into incoming rising slide mid-scroll (0.31ms)
✔ resolveModalityDeckState disables blur and displacement under reduced motion (0.24ms)
✔ resolveModalityTargetScrollY lands squarely on each chapter settled stop (0.24ms)
✔ idle state keeps all NOVA letters at exact resting typography (1.31ms)
✔ word hover makes O roll toward V and V cradle O with sparkle visible (0.36ms)
✔ o-nudge and v-lift produce distinct reciprocal O and V interactions (0.16ms)
✔ reducedMotion preserves zero displacement while keeping subtle accent (0.13ms)

Total Tests: 38 passed, 0 failed, 0 skipped.
```

---

## 4. Production Handover Checklist for the Owner

When deploying the site to Vercel, Netlify, or any production host, ensure these 4 Environment Variables are pasted into the hosting dashboard:

1. `VITE_AIRTABLE_TOKEN`: `patsn... (Sourced from your local .env)`
2. `VITE_AIRTABLE_BASE_ID`: `appy0KzWMlpXE4TNN`
3. `VITE_AIRTABLE_BOOKINGS_TABLE_ID`: `tblzJVBkuxP6xSINF`
4. `VITE_AIRTABLE_VIP_TABLE_ID`: `tblGXJsK7tQWqf0kP`
5. `VITE_AIRTABLE_SETTINGS_TABLE_ID`: `tblFhgDOcFoqyKjAT`
