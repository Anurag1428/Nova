# Maison Aura / NOVA Sanctuary — Master Project Context & Architecture

> **Source of Truth & Unified Baseline**  
> **Location:** `C:\Users\DELL\antigravity\Maison-Aura-Sanctuary-Master`  
> **App ID:** `fe11883b-3a3d-4fb3-a7eb-d4844c00e5b3`  
> **Last Synchronized:** November 22, 2026

---

## 1. Project Overview & Brand Identity
* **Brand:** Maison Aura — Bespoke Beauty & Skin Sanctuary (NOVA Unisex Salon & Makeup Sanctuary, Lucknow).
* **Concept:** An immersive quiet-luxury salon and sanctuary offering bespoke facials, natural nail artistry, bridal & editorial makeup, and personalized skincare consultations.
* **Aesthetic Language (Inspired by Odyssée):**
  - **Color Palette:** Warm Alabaster (`#FBF9F5`), Deep Midnight Navy (`#18224B`), Muted Charcoal, Soft Caramel/Tan accents.
  - **Typography:** Indented editorial serifs paired with minimalist, clean sans-serif typography.
  - **Motion & Physics:** Smooth GSAP ScrollTrigger animations, quiet fade-ups, subtle chapter reveals, and floating architectural insets.

---

## 2. Completed Milestones & Work History

### A. Point B Updates (From AI Studio)
* **Editorial About & Sanctuary Page (`AboutSection.tsx`):**
  - Full-viewport sunlit lounge hero with split *"Evolving / with you."* horizon headline and floating hydrangea inset (`about_hydrangea_inset_1795344837528.jpg`).
  - Alabaster (`#FBF9F5`) manifesto band with left `"ABOUT"` kicker, indented serif philosophy, and Lucknow sanctuary details.
  - Tall editorial Founder portrait on left with flush scrolling monochrome consultation inset (`about_consultation_bw_1795344839589.jpg`) on right.
  - Quiet 3-pillar sanctuary ethos strip with direct consultation and treatment CTAs.
* **Photo Harmonization & Studio Polish:**
  - Applied skin-chroma mask across neck, collarbone, and chest for soft daylight complexion harmony without touching the ivory blazer or silk camisole.
  - Adjusted hands, fingers, and wrists to match natural fair daylight complexion.
* **Testing & Lint:**
  - Zero TypeScript errors (`tsc --noEmit`).
  - 25/25 unit tests verified.
  - 1440x900 desktop responsive layout verified in Chromium.

### B. Antigravity Custom Work
* **Founder Real Identity Portrait (`public/images/nova-founder-portrait.jpg`):**
  - Genuine facial identity (eyes, nose, bone structure, smile) composited and feather-blended into the practitioner coat portrait.
  - Seamless color temperature and lighting match with ambient studio background.
  - Copied into master repository at `public/images/nova-founder-portrait.jpg`.

---

## 3. Directory & Component Architecture

```
Maison-Aura-Sanctuary-Master/
├── src/
│   ├── assets/images/       # High-res photography, insets, and portraits
│   ├── components/
│   │   ├── AboutSection.tsx         # 323-line editorial About & Founder page with GSAP
│   │   ├── BookingDrawer.tsx        # Interactive bespoke appointment booking modal
│   │   ├── Footer.tsx               # Minimalist editorial footer
│   │   ├── Header.tsx               # Clean fixed navigation header
│   │   ├── InteractiveChapters.tsx  # Multi-chapter sanctuary storytelling
│   │   ├── MediaSlot.tsx            # Fluid responsive image & video loader
│   │   ├── NavHoverLink.tsx         # Subtle hover typography component
│   │   ├── RollingMarble.tsx        # Dynamic physics/interaction component
│   │   ├── TreatmentsSection.tsx    # Treatment menu & bespoke rituals
│   │   └── WordReveal.tsx           # Split text reveal animations
│   ├── data/
│   │   └── salonData.ts             # Salon configuration, menu, contact, & philosophy
│   ├── App.tsx                      # Root application & view orchestration
│   └── index.css                    # Tailwind CSS v4 styling & tokens
├── public/
│   ├── images/                      # Production public images (including nova-founder-portrait.jpg)
│   └── videos/                      # Atmospheric background video assets
└── MASTER_PROJECT_CONTEXT.md        # This unified project documentation
```

---

## 4. Immediate Development Roadmap
1. Connect the final real founder portrait (`public/images/nova-founder-portrait.jpg`) directly into `AboutSection.tsx` or `salonData.ts` as needed.
2. Complete booking drawer integration and appointment scheduling flow.
3. Add smooth page transitions between the Home, About, Treatments, and Contact views.
4. Prepare for production build and deployment.
