# Production Handover & Quality Polish (NOVA Sanctuary)

* **Author:** Anurag1428
* **Date:** 2026-11-23

## Overview

A technical and operational audit and polish pass for the NOVA Sanctuary website to eliminate subtle flaws, dead links, iOS viewport issues, and deployment risks before client handover.

## Analysis & Resolutions

### 1. Instagram Profile Connection
* **Initial Defect:** `socials` linked to a dead anchor `#instagram`. In `Footer.tsx`, tapping it inadvertently triggered `onOpenBooking` rather than external navigation.
* **Resolution:** Connected genuine Instagram handle (`https://www.instagram.com/nova.unisexsalon8866?jplx=MXBtdTUweHdtMjJrdw==`) and updated `Footer.tsx` to cleanly render outbound links with `target="_blank"` and `rel="noopener noreferrer"`.

### 2. Gift Cards Concierge Integration
* **Explanation:** In quiet-luxury salons, gift cards allow patrons to gift bespoke treatments (facials, bridal beauty, skin consultations) to family and friends. Because the salon does not yet have an automated e-commerce payment gateway (e.g. Razorpay merchant account), a dead `#gift-cards` button left a broken user experience.
* **Resolution:** Routed "Gift Cards" directly to the salon's reception WhatsApp concierge with a pre-filled message: `"Hello NOVA Sanctuary, I would like to inquire about purchasing a Sanctuary Gift Card or Experience Voucher."` This turns a dead link into an instant inquiry channel.

### 3. Favicon & Link Sharing Metadata
* **Explanation:** A favicon is the monogram icon displayed on browser tabs, bookmarks, and mobile home screen shortcuts. Without it, browsers show a generic globe or blank sheet and trigger 404 network errors for `/favicon.ico`. When links are shared via WhatsApp or Instagram DMs, lack of `og:image` leaves a bare blue URL without an image preview.
* **Resolution:** Designed a geometric SVG favicon (`/public/favicon.svg`) featuring NOVA's gold monogram and midnight navy backing. Added `<link rel="icon">`, `<link rel="apple-touch-icon">`, and OpenGraph preview tags (`og:image`, `twitter:image`) in `index.html`.

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
