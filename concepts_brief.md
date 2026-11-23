# Production Handover & Quality Polish (NOVA Sanctuary)

* **Author:** Anurag1428
* **Date:** 2026-11-23

## Overview

A technical and operational audit and polish pass for the NOVA Sanctuary website to eliminate subtle flaws, dead links, iOS viewport issues, and deployment risks before client handover.

## Analysis & Resolutions

### 1. Instagram Profile Connection
* **Initial Defect:** `socials` linked to a dead anchor `#instagram`. In `Footer.tsx`, tapping it inadvertently triggered `onOpenBooking` rather than external navigation.
* **Resolution:** Connected genuine Instagram handle (`https://www.instagram.com/nova.unisexsalon8866?jplx=MXBtdTUweHdtMjJrdw==`) and updated `Footer.tsx` to cleanly render outbound links with `target="_blank"` and `rel="noopener noreferrer"`.

### 2. Resolution of the "Gift Card" Problem
* **Root Cause:** "Gift Cards" was an unconfigured placeholder button from the design template. In `MenuDrawer.tsx`, clicking it accidentally triggered the consultation booking drawer with zero explanation, and Indian salon patrons in Lucknow communicate via WhatsApp rather than purchasing gift cards online.
* **Resolution:** Replaced "Gift Cards" with direct reception "WhatsApp" across both the slide-over navigation menu (`MenuDrawer.tsx`) and the footer (`Footer.tsx`). Both now display `Instagram / WhatsApp` pointing directly to the salon's verified Instagram handle and the official reception WhatsApp.

### 3. Official Brand Favicon & Link Sharing Metadata
* **Resolution:** Generated multi-resolution favicons (`favicon.png`, `apple-touch-icon.png`, and `favicon.ico`) directly from the salon owner's official gold & black circular crown emblem (`NOVA UNISEX SALON & MAKEUP STUDIO`). Linked them in `index.html` alongside OpenGraph social preview tags.

### 4. Indian Rupee (₹) Pricing Localization
* **Resolution:** Replaced all leftover `$ (Example)` pricing in `src/data/salonData.ts` with authentic Indian Rupee (`₹`) pricing (e.g. ₹2,500 for The NOVA Signature Facial, ₹8,500 for Bridal Beauty, and ₹999 for Skincare Consultations).

### 4. iOS Safari Viewport Auto-Zoom
* **Explanation:** On iPhones, Mobile Safari automatically forces an intrusive viewport zoom on any input whose font size is under 16px. Form inputs in `BookingDrawer.tsx` and `VipPrivilegeModal.tsx` were styled with `text-xs` (12px) and `text-sm` (14px).
* **Resolution:** Upgraded mobile input classes to `text-base sm:text-xs` and `text-base sm:text-sm` so iOS Safari retains 16px base font without viewport shifts, while preserving compact typography on desktop.

### 5. Static Host Rewrite Rules
* **Resolution:** Added `public/_redirects` (`/* /index.html 200`) and `vercel.json` rewrites to guarantee zero 404 errors when clients refresh deep routes on Vercel, Netlify, or Cloudflare Pages.

---

## Goals vs. Non-Goals

### In-Scope Goals
* Connect live verified Instagram link.
* Turn `#gift-cards` into a live WhatsApp gift concierge.
* Embed high-fidelity SVG favicon and OpenGraph link preview metadata in `index.html`.
* Enforce 16px minimum font size on iOS form inputs.
* Guarantee SPA route rewrites for static hosting.

### Out-of-Scope Non-Goals
* Full e-commerce payment checkout for gift cards (requires client Razorpay/Stripe merchant verification).
* Modifying core luxury brand typography or visual design.

---

## Alternatives Weighed

1. **Omitting the "Gift Cards" Link Entirely:**
   * *Rejected:* Gifting treatments is a high-ticket revenue driver for Lucknow bridal and luxury salon clientele. Routing through WhatsApp allows the salon to sell custom high-value gift packages manually via UPI.
2. **Generating a Static PNG / ICO Favicon:**
   * *Rejected:* Vector SVG (`favicon.svg`) renders crisply at all DPIs (Retina, 4K) without file bloat.

---

## Key Decisions & Staging for Next Steps

* **Reception Phone Number Sync:** Ensure the client confirms whether `+91 72752 56535` or `+91 9196355139` is the primary phone for direct voice calls.
