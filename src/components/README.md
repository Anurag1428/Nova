# Components Component Package

## Overview
Presentation and interaction layer for Maison Aura / NOVA Sanctuary. Implements quiet-luxury UI components following Odyssée-inspired aesthetics: fixed navigation, full-bleed media players, GSAP ScrollTrigger chapters, responsive booking modal, 3D rolling marble canvas, and rising alabaster transitions.

## Interface
- `[Header.tsx:ActivePage]`: Active route identifier union (`'home' | 'treatments' | 'about'`)
- `[Header.tsx:Header]`: Fixed and sticky navigation bar following a 3-zone contract (brand wordmark, text navigation links with hover dots, booking trigger) and mobile menu drawer toggle
- `[Footer.tsx:Footer]`: Editorial footer with structured tables for contact info (A. / C. / S.) and operating hours, quick links, and 3D rolling marble canvas integration
- `[NavHoverLink.tsx:NavHoverVariant]`: Navigation styling variant union (`'hero' | 'header-light' | 'header-dark-video'`)
- `[NavHoverLink.tsx:NavHoverLink]`: Accessible navigation link with blooming circular hover and active dot indicator and zero layout shift
- `[WordReveal.tsx:WordReveal]`: IntersectionObserver-driven staggered word reveal component with full accessibility DOM preservation
- `[PageTransitionCurtain.tsx:PageTransitionCurtain]`: Full-viewport warm alabaster architectural sheet driven by GSAP for upward wiping cross-page transition
- `[InteractiveNovaWordmark.tsx:InteractiveNovaWordmark]`: Interactive brand wordmark choreographed with GSAP where 'O' (rolling pearl) and 'V' (sculptural cradle) physically interact on hover
- `[MediaSlot.tsx:MediaSlot]`: Resilient editorial media player supporting inline looping video with IntersectionObserver lazy loading and graceful image/gradient fallback
- `[MenuDrawer.tsx:MenuDrawer]`: Full-viewport frosted slide-over modal drawer with numbered navigation (1. - 5.), portrait inset, and midnight-navy contact card
- `[RollingMarble.tsx:RollingMarble]`: 2D/3D equirectangular canvas rendering an interactive nacre pearl & kintsugi gold orb reacting to scroll velocity and mouse physics with a floating cursor follower
- `[InteractiveChapters.tsx:InteractiveChapters]`: GSAP ScrollTrigger-pinned 4-panel horizontal storytelling experience with scrubbing chapter indicators and transition into dual duotone portals
- `[TreatmentsSection.tsx:TreatmentsSection]`: Full editorial treatments page featuring opening video hero dissolve, sticky numbered modality index ((1). - (4).), vanishing right-hand media deck, aftercare band, and diptych
- `[AboutSection.tsx:AboutSection]`: Editorial about and founder sanctuary section with sunlit lounge parallax hero, indented serif manifesto, and owner portrait spread with sticky consultation inset
- `[BookingDrawer.tsx:BookingDrawer]`: Full-viewport guided consultation booking modal with 3-step concierge (ritual selection, schedule selection, guest details), live video canvas, and demo reservation confirmation

## Invariants
- `[Header.tsx:Header]`: Header transitions to compact white/alabaster bar when scrolled past `window.innerHeight * 1.88` on home, or transparent dark theme over video on treatments/about
- `[MenuDrawer.tsx:MenuDrawer]`: Traps focus/ESC key and locks `document.body.style.overflow = 'hidden'` while open
- `[BookingDrawer.tsx:BookingDrawer]`: Locks `document.body.style.overflow = 'hidden'` while open; enforces step-by-step validation before progressing to next step
- `[InteractiveChapters.tsx:InteractiveChapters]`: Pins horizontally only on desktop (`min-width: 1024px`); collapses to vertical stack on mobile/tablet
- `[TreatmentsSection.tsx:TreatmentsSection]`: Modality deck smoothly coordinates opacity, blur, translateY, and mask feathering across 4 service categories

## Side Effects
- `[Header.tsx:Header]`: Attaches window scroll event listener; toggles body scroll on drawer open
- `[MenuDrawer.tsx:MenuDrawer]`: Modifies `document.body.style.overflow` and attaches window keydown event listener
- `[BookingDrawer.tsx:BookingDrawer]`: Modifies `document.body.style.overflow` and attaches window keydown event listener
- `[PageTransitionCurtain.tsx:PageTransitionCurtain]`: GSAP mutates curtain DOM transform properties
- `[InteractiveNovaWordmark.tsx:InteractiveNovaWordmark]`: GSAP tweens letter transforms on hover/focus
- `[MediaSlot.tsx:MediaSlot]`: Invokes HTML5 video `.play()` and monitors IntersectionObserver
- `[RollingMarble.tsx:RollingMarble]`: Runs continuous `requestAnimationFrame` render loop mutating canvas buffer; listens to scroll and mousemove
- `[InteractiveChapters.tsx:InteractiveChapters]`: Registers GSAP ScrollTrigger instances mutating DOM transforms, clip-paths, and opacity
- `[TreatmentsSection.tsx:TreatmentsSection]`: Listens to scroll and resize events via `requestAnimationFrame`; drives window scroll on category clicks
- `[AboutSection.tsx:AboutSection]`: Registers GSAP ScrollTrigger for parallax image scroll effects

## Verification
- Run: `npm run lint`
