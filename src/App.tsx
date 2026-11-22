/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SALON_CONFIG } from './data/salonData';
import { ActivePage, Header } from './components/Header';
import { MediaSlot } from './components/MediaSlot';
import { InteractiveChapters } from './components/InteractiveChapters';
import { TreatmentsSection } from './components/TreatmentsSection';
import { AboutSection } from './components/AboutSection';
import { BookingDrawer } from './components/BookingDrawer';
import { VipPrivilegeModal } from './components/VipPrivilegeModal';
import { Footer } from './components/Footer';
import { InteractiveNovaWordmark } from './components/InteractiveNovaWordmark';
import { PageTransitionCurtain } from './components/PageTransitionCurtain';
import { NavHoverLink } from './components/NavHoverLink';
import { ConfirmedDemoBooking } from './utils/bookingLogic';
import {
  getPageTransitionTimings,
  shouldAnimatePageTransition,
  TransitionPhase,
} from './utils/pageTransition';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [openingStage, setOpeningStage] = useState<'curtain' | 'revealing' | 'complete'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'complete';
    }
    return 'curtain';
  });

  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPreset, setBookingPreset] = useState<{
    categoryId?: string;
    ritualId?: string;
    clientName?: string;
    clientPhone?: string;
    notes?: string;
  }>({});
  const [savedBookings, setSavedBookings] = useState<ConfirmedDemoBooking[]>([]);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle');
  const [pendingPage, setPendingPage] = useState<ActivePage | null>(null);

  const philosophyGridRef = useRef<HTMLDivElement | null>(null);
  const philosophySmallCardRef = useRef<HTMLDivElement | null>(null);
  const philosophyLargeCardRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const transitionCurtainRef = useRef<HTMLDivElement | null>(null);
  const transitionTlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Proactively invite first-time visitors with the ₹500 VIP Welcome Privilege after 12 seconds
    if (typeof window === 'undefined') return;
    const dismissed = window.localStorage.getItem('nova_vip_privilege_dismissed_v1');
    if (!dismissed) {
      const timer = window.setTimeout(() => {
        setVipModalOpen(true);
      }, 12000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (openingStage === 'complete') return;
    const t1 = window.setTimeout(() => {
      setOpeningStage('revealing');
    }, 450);
    const t2 = window.setTimeout(() => {
      setOpeningStage('complete');
    }, 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [openingStage]);

  useEffect(() => {
    if (activePage !== 'home') return;
    const gridEl = philosophyGridRef.current;
    const smallEl = philosophySmallCardRef.current;
    const largeEl = philosophyLargeCardRef.current;
    if (!gridEl || !smallEl || !largeEl) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      gsap.set(smallEl, { y: 0 });

      const getMaxTravel = () =>
        Math.max(0, largeEl.offsetHeight - smallEl.offsetHeight);

      gsap.fromTo(
        smallEl,
        { y: 0 },
        {
          y: () => getMaxTravel(),
          ease: 'none',
          scrollTrigger: {
            trigger: largeEl,
            start: 'top 20%',
            end: 'bottom 88%',
            scrub: 0.2,
            refreshPriority: -1,
            invalidateOnRefresh: true,
          },
        }
      );

      ScrollTrigger.sort();
    });

    mm.add('(max-width: 1023px)', () => {
      gsap.set(smallEl, { clearProps: 'all' });
    });

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 280);

    return () => {
      window.clearTimeout(refreshTimer);
      mm.revert();
    };
  }, [activePage]);

  useEffect(() => {
    return () => {
      transitionTlRef.current?.kill();
    };
  }, []);

  const handleNavigatePage = (page: ActivePage, sectionId?: string) => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!shouldAnimatePageTransition(activePage, page, prefersReduced)) {
      setActivePage(page);
      window.requestAnimationFrame(() => {
        if (sectionId) {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      return;
    }

    const curtain = transitionCurtainRef.current;
    const mainEl = mainRef.current;
    if (!curtain) {
      setActivePage(page);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    // Cancel any overlapping transition cleanly
    transitionTlRef.current?.kill();

    const timings = getPageTransitionTimings();
    setPendingPage(page);
    setTransitionPhase('rising');

    gsap.set(curtain, { yPercent: 100 });

    const tl = gsap.timeline();
    transitionTlRef.current = tl;

    // 1. Warm alabaster (#FBF9F5) sheet rises smoothly from bottom edge over current page
    tl.to(
      curtain,
      {
        yPercent: 0,
        duration: timings.riseDuration,
        ease: 'power4.inOut',
      },
      0
    );

    // 2. At peak full-viewport coverage, swap page cleanly at scroll top
    tl.add(() => {
      setTransitionPhase('swapping');
      setActivePage(page);
      if (sectionId) {
        window.requestAnimationFrame(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'auto' });
          else window.scrollTo({ top: 0, behavior: 'auto' });
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      if (mainEl) {
        gsap.set(mainEl, { y: 28, opacity: 0 });
      }
    });

    // 3. Curtain sweeps upward off-screen as incoming page glides smoothly into view
    tl.add(() => {
      setTransitionPhase('revealing');
    }, `+=${timings.holdDuration}`);

    tl.to(
      curtain,
      {
        yPercent: -100,
        duration: timings.revealDuration,
        ease: 'power4.inOut',
      },
      '<'
    );

    if (mainEl) {
      tl.to(
        mainEl,
        {
          y: 0,
          opacity: 1,
          duration: timings.revealDuration * 0.95,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        },
        '<0.08'
      );
    }

    tl.add(() => {
      gsap.set(curtain, { yPercent: 100 });
      setPendingPage(null);
      setTransitionPhase('idle');
      ScrollTrigger.refresh();
    });
  };

  const handleOpenBooking = (categoryId?: string, ritualId?: string) => {
    setBookingPreset({ categoryId, ritualId });
    setBookingOpen(true);
  };

  const handleApplyVipToBooking = (clientName: string, clientPhone: string, voucherCode: string) => {
    setBookingPreset({
      clientName,
      clientPhone,
      notes: `Applied ₹500 VIP Welcome Privilege Voucher (${voucherCode})`,
    });
    setBookingOpen(true);
  };

  const handleBookingConfirmed = (record: ConfirmedDemoBooking) => {
    setSavedBookings((prev) => [record, ...prev]);
  };

  const { brand, mediaSlots, introduction } = SALON_CONFIG;

  return (
    <div
      id="top"
      data-view={activePage}
      className="min-h-screen bg-[#FBF9F5] text-[#18224B] flex flex-col justify-between selection:bg-[#18224B] selection:text-[#FBF9F5]"
    >
      {/* 1. CINEMATIC OPENING CURTAIN REVEAL LAYER */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-50 flex flex-col justify-between overflow-hidden transition-opacity duration-700 ${
          openingStage === 'complete' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className={`w-full flex-1 bg-[#7D7278] border-b border-[#FBF9F5]/25 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            openingStage === 'curtain' ? 'translate-y-0' : '-translate-y-full'
          }`}
        />
        <div
          className={`w-full flex-1 bg-[#7D7278] transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            openingStage === 'curtain' ? 'translate-y-0' : 'translate-y-full'
          }`}
        />
      </div>

      {/* 2. COMPACT STICKY HEADER & MENU OVERLAY */}
      <Header
        activePage={activePage}
        onNavigatePage={handleNavigatePage}
        onOpenBooking={handleOpenBooking}
        bookingCount={savedBookings.length}
      />

      {/* MAIN VIEW SWITCHER */}
      <main ref={mainRef} className="flex-1">
        {activePage === 'treatments' && (
          <TreatmentsSection
            isFullPage={true}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {activePage === 'about' && (
          <AboutSection
            isFullPage={true}
            onOpenBooking={() => handleOpenBooking()}
            onNavigateTreatments={() => handleNavigatePage('treatments')}
          />
        )}

        {activePage === 'home' && (
          <article>
            {/* 3. TWO-STAGE OPENING HERO FILM SEQUENCE (Preserving the exact opening video section the user loved) */}
            <section
              aria-label="Opening Hero"
              className="relative w-full bg-[#121620] text-[#FBF9F5]"
            >
              {/* Sticky 50vh Continuous Horizon Header Line Across the Opening Composition */}
              <div className="pointer-events-none absolute inset-0 z-20">
                <div className="pointer-events-auto sticky top-[46vh] md:top-[48vh] w-full px-5 sm:px-6 md:px-10">
                  <div className="mx-auto max-w-[1440px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 pb-4 pt-2">
                    <div className="flex items-center justify-between w-full sm:w-auto gap-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.42)]">
                      <InteractiveNovaWordmark
                        testId="hero-nova-wordmark"
                        accentColor="#E8D5B5"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigatePage('home');
                        }}
                        className="font-brand text-2xl sm:text-3xl md:text-[2.15rem] font-normal text-[#FBF9F5]"
                      />

                      <button
                        type="button"
                        onClick={() => handleOpenBooking()}
                        className="sm:hidden cursor-pointer px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] bg-[#FBF9F5] text-[#18224B] transition-colors whitespace-nowrap shrink-0"
                      >
                        Book Consultation
                      </button>
                    </div>

                    {/* Middle: Serif Tagline along the continuous horizon in psTimes */}
                    <p className="hidden lg:block font-pstimes text-[18px] md:text-[19px] font-normal tracking-[-0.01em] text-[#FBF9F5] whitespace-nowrap drop-shadow-[0_2px_10px_rgba(0,0,0,0.42)]">
                      {brand.shortTagline}
                    </p>

                    {/* Right: Navigation Actions in Basel Grotesk with Signature Midnight-Navy Hover Dot */}
                    <nav
                      aria-label="Opening Horizon Navigation"
                      className="font-basel flex flex-wrap items-center gap-7 md:gap-11 pl-3 text-[11px] font-normal uppercase tracking-[0.05em]"
                    >
                      <NavHoverLink
                        label="Treatments"
                        variant="hero"
                        isActive={pendingPage === 'treatments'}
                        onClick={() => handleNavigatePage('treatments')}
                      />
                      <NavHoverLink
                        label="Concerns"
                        variant="hero"
                        onClick={() => handleNavigatePage('home', 'our-approach')}
                      />
                      <NavHoverLink
                        label="About"
                        variant="hero"
                        isActive={pendingPage === 'about'}
                        onClick={() => handleNavigatePage('about')}
                      />
                      <NavHoverLink
                        label="Book Consultation"
                        variant="hero"
                        onClick={() => handleOpenBooking()}
                        className="hidden sm:inline-flex"
                      />
                    </nav>
                  </div>
                </div>
              </div>

              {/* STAGE A: Full-Viewport Opening Beauty Film Video (/videos/hero.mp4) */}
              <div className="relative h-screen w-full overflow-hidden">
                <div
                  className={`h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    openingStage === 'curtain' ? 'scale-110' : 'scale-100'
                  }`}
                >
                  <MediaSlot
                    media={mediaSlots.hero}
                    priority={true}
                    subtleMotion={false}
                    className="h-full w-full"
                    overlayClassName="bg-gradient-to-b from-[#121620]/30 via-[#121620]/15 to-[#121620]/65"
                  />
                </div>

                <div className="absolute bottom-8 left-6 right-6 md:left-10 md:right-10 z-30 flex items-center justify-end text-[11px] uppercase tracking-[0.18em] text-[#FBF9F5]/80">
                  <span className="hidden sm:inline font-mono-tabular">
                    Scroll to enter ↓
                  </span>
                </div>
              </div>

              {/* STAGE B: Full-Screen Edge-to-Edge Macro Skin Photograph (No white background until after this section) */}
              <div className="relative h-screen w-full overflow-hidden bg-[#121620]">
                <img
                  src="/assets/aistudio/Generated_Image_November_17__2026_-_4_59PM_6977a387.jpg"
                  alt="Macro editorial photograph showing natural skin texture, pores and facial details"
                  className="h-full w-full object-cover object-center animate-editorial-film select-none"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#121620]/15 via-transparent to-[#121620]/30"
                  aria-hidden="true"
                />
              </div>
            </section>

            {/* 4. ODYSSÉE-STYLE ASYMMETRICAL INTRODUCTION (Matching reference `image_0c2f72bb.png`)
                Left studio-blended portrait + Right col-start-4 indented light high-contrast serif statement */}
            <section
              id="introduction"
              aria-label="Sanctuary Introduction"
              className="pt-12 pb-10 md:pt-16 md:pb-14 px-4 sm:px-6 md:px-7 bg-[#FBF9F5] text-[#18224B]"
            >
              <div className="mx-auto max-w-[1440px] grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Vertical Portrait — Clean rectangular frame with soft studio stone backdrop (#EBEAE6) */}
                <div className="md:col-span-3 lg:col-span-2">
                  <div className="relative aspect-[3/4.35] w-full max-w-[240px] lg:w-[236px] overflow-hidden bg-[#EBEAE6]">
                    <MediaSlot
                      media={mediaSlots.introduction}
                      subtleMotion={true}
                      className="h-full w-full !bg-[#EBEAE6]"
                      imgClassName="mix-blend-multiply brightness-[0.99] contrast-[1.05] saturate-[0.82]"
                    />
                  </div>
                </div>

                {/* Right Indented Serif Headline & Concise Call to Action (col-start-4 col-span-9) */}
                <div className="md:col-span-9 lg:col-start-4 lg:col-span-9 flex flex-col justify-between pt-1">
                  <h2 className="font-serif-editorial text-[1.95rem] sm:text-[2.4rem] lg:text-[2.82rem] xl:text-[2.95rem] font-light leading-[1.08] tracking-[-0.026em] text-[#18224B] md:indent-[5rem] lg:indent-[6.75rem]">
                    At <span className="font-brand tracking-[0.04em]">NOVA</span>, we believe beauty is a personal expression of who you are. Step into our sanctuary for unhurried rituals shaped around your natural rhythm.
                  </h2>

                  <div className="mt-9 md:mt-11 max-w-[365px]">
                    <p className="font-basel text-[15px] md:text-[15.5px] font-normal leading-[1.45] tracking-[-0.01em] text-[#18224B]">
                      {introduction.body}
                    </p>
                    <div className="mt-6 md:mt-7">
                      <button
                        type="button"
                        onClick={() => handleOpenBooking()}
                        className="font-basel cursor-pointer text-[11px] font-normal uppercase tracking-[0.05em] text-[#18224B] hover:opacity-60 transition-opacity whitespace-nowrap shrink-0"
                      >
                        {introduction.ctaLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5 & 6. COORDINATED GSAP SCROLL-STORY ("WHY NOVA?" 4-PANEL STRIP -> SEAMLESS EMERGENCE OF CONCERNS & TREATMENTS PORTALS) */}
            <InteractiveChapters
              onOpenBooking={() => handleOpenBooking()}
              onNavigateTreatments={() => handleNavigatePage('treatments')}
              onScrollToSection={(sectionId) => {
                const el = document.getElementById(sectionId);
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 7. OUR PHILOSOPHY + ASYMMETRICAL DUAL-VIDEO MACRO SECTION (Matching `image_62f75fc9.png`) */}
            <section
              aria-label="Our Philosophy and Method"
              className="bg-[#FBF9F5] text-[#18224B] pt-16 md:pt-28 pb-24 md:pb-36"
            >
              {/* Part A: Offset Philosophy Statement Matching `image_62f75fc9.png` (Left col-span-3 label + Right col-start-7 indented 5-line serif block) */}
              <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-7 pb-20 md:pb-32 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-3 pt-2">
                  <span className="font-basel text-[11px] font-normal uppercase tracking-[0.04em] text-[#18224B]">
                    Our Philosophy
                  </span>
                </div>
                <div className="md:col-span-9 lg:col-start-7 lg:col-span-6 space-y-8 md:space-y-10">
                  <h3 className="font-serif-editorial text-[1.35rem] sm:text-[1.55rem] lg:text-[1.72rem] xl:text-[1.82rem] font-light leading-[1.14] tracking-[-0.022em] text-[#18224B] md:indent-[3.75rem] lg:indent-[4.75rem]">
                    Every treatment at <span className="font-brand text-[0.92em] tracking-[0.04em]">NOVA</span> is grounded in evidence-based skincare and the quiet art of aesthetic refinement. Our specialists combine anatomical precision with restorative techniques to achieve results that are both gentle and enduring.
                  </h3>
                  <div>
                    <button
                      type="button"
                      onClick={() => handleNavigatePage('treatments')}
                      className="font-basel cursor-pointer text-[11px] font-normal uppercase tracking-[0.05em] text-[#18224B] hover:opacity-60 transition-opacity"
                    >
                      Explore treatments
                    </button>
                  </div>
                </div>
              </div>

              {/* Part B: Odyssée Asymmetrical Dual-Video & Giant Vertical Macro Composition (`image_77d66d8b.png`)
                  Left small video + caption scrolls smoothly from the top edge all the way to the bottom edge of the tall vertical right-hand video */}
              <div
                ref={philosophyGridRef}
                data-testid="philosophy-dual-video-grid"
                className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-7 grid grid-cols-1 lg:grid-cols-12 gap-0 items-start lg:items-stretch"
              >
                {/* Left-Center Small Macro Video + Caption Underneath (col-start-5 col-span-2) — stretches to match right video height so inner block travels all the way to the end */}
                <div className="lg:col-start-5 lg:col-span-2 pb-12 lg:pb-0 relative">
                  <div
                    ref={philosophySmallCardRef}
                    data-testid="philosophy-small-sticky-card"
                    className="will-change-transform"
                  >
                    <div className="aspect-[4/5] w-full overflow-hidden bg-[#D5D7DB]">
                      <MediaSlot
                        media={mediaSlots.spreadLeft}
                        priority={true}
                        subtleMotion={false}
                        className="h-full w-full grayscale contrast-105"
                      />
                    </div>
                    <p className="font-basel mt-4 pr-4 pb-1 text-[13px] leading-[1.55] text-[#18224B]">
                      Behind every treatment lies a commitment to science, research and refinement, ensuring results that are safe, precise and enduring.
                    </p>
                  </div>
                </div>

                {/* Right Giant Vertical Macro Skin & Lips Video (col-start-7 col-span-5) — elongated vertical proportion */}
                <div
                  ref={philosophyLargeCardRef}
                  data-testid="philosophy-large-video-card"
                  className="lg:col-start-7 lg:col-span-5 aspect-[3/4.6] lg:aspect-auto lg:h-[168vh] lg:min-h-[1260px] w-full overflow-hidden bg-[#E5DDD5]"
                >
                  <MediaSlot
                    media={{
                      id: 'macro-lips-right',
                      videoPath: '/videos/approach-3.mp4',
                      enableVideo: true,
                      posterPath: '/images/spread-left-lips.jpg',
                      alt: 'Extreme macro close-up of luminous skin texture and lips',
                      focalPoint: 'center center',
                    }}
                    priority={true}
                    subtleMotion={true}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </section>

            {/* 8. FULL-VIEWPORT LAYERED SPREAD: "PERSONAL · PRECISE · BEAUTIFUL" (Matching `odyssee-sec3.png`) */}
            <section
              aria-label="Editorial Visual Spread"
              className="relative min-h-[92vh] w-full overflow-hidden bg-[#EAE6DF] flex items-center"
            >
              {/* Soft-focus ghostly macro eye/skin texture on left blending into warm portrait on right */}
              <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-12">
                <div className="hidden md:block md:col-span-6 relative overflow-hidden">
                  <img
                    src="/images/spread-left-lips.jpg"
                    alt="Soft focus beauty texture"
                    className="h-full w-full object-cover scale-125 opacity-25 grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FBF9F5]/40 via-transparent to-[#C8B9A6]/50" />
                </div>
                <div className="col-span-1 md:col-span-6 relative overflow-hidden">
                  <img
                    src="/images/intro-profile.jpg"
                    alt="Serene beauty portrait"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#EAE6DF] via-transparent to-transparent md:w-1/3" />
                </div>
              </div>

              {/* Three-Part Horizon Typographic Statement Across the Exact Center (Matching `odyssee-sec3.png`) */}
              <div className="relative z-10 w-full px-6 md:px-10">
                <h2 className="font-basel mx-auto max-w-[1440px] flex items-center justify-between text-[11px] md:text-xs font-normal uppercase tracking-[0.16em] text-[#18224B] md:text-[#FBF9F5] drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
                  <span className="text-[#18224B]">Bespoke</span>
                  <span className="text-[#FBF9F5] drop-shadow">Personal</span>
                  <span className="text-[#FBF9F5] drop-shadow">Aesthetic</span>
                </h2>
              </div>
            </section>

            {/* 9. CLOSING "OUR APPROACH" 3-ZONE EDITORIAL LAYOUT + DUOTONE DUO CARDS (Matching `image_2425b6c4.png`) */}
            <section
              aria-label="Explore More"
              className="py-20 md:py-32 px-4 sm:px-6 md:px-7 bg-[#FBF9F5] text-[#18224B]"
            >
              <div className="mx-auto max-w-[1440px] grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-x-6 lg:gap-x-0 items-start">
                {/* Far-Left Column: Section Label (col-start-1 col-span-2) */}
                <div className="md:col-span-3 lg:col-start-1 lg:col-span-2 pt-0.5">
                  <h2 className="font-basel text-[11px] font-normal uppercase tracking-[0.04em] text-[#18224B]">
                    Our approach
                  </h2>
                </div>

                {/* Middle-Left Column: Two Concise Editorial Paragraphs (col-start-3 col-span-3) */}
                <div className="md:col-span-9 lg:col-start-3 lg:col-span-3 space-y-5 max-w-[268px]">
                  <p className="font-basel text-[15px] md:text-[15.5px] font-normal leading-[1.42] tracking-[-0.01em] text-[#18224B]">
                    Every treatment is carefully tailored to your lifestyle, your goals, your unique skin type and the time you have to recover.
                  </p>
                  <p className="font-basel text-[15px] md:text-[15.5px] font-normal leading-[1.42] tracking-[-0.01em] text-[#18224B]">
                    Learn about the treatments that define our approach and the team who bring it to life.
                  </p>
                </div>

                {/* Right Half: Two Tall Edge-to-Edge Duotone Cards (`TREATMENTS` | `ABOUT`, col-start-7 col-span-6) */}
                <div className="md:col-span-12 lg:col-start-7 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-0">
                  <button
                    type="button"
                    onClick={() => handleNavigatePage('treatments')}
                    className="group cursor-pointer relative aspect-[3/4.5] w-full overflow-hidden bg-[#7A8296] focus-visible:outline-2 focus-visible:outline-[#18224B]"
                  >
                    <img
                      src="/images/chapter-4-rituals.jpg"
                      alt="Explore Treatments"
                      className="h-full w-full object-cover grayscale mix-blend-luminosity opacity-75 scale-105 group-hover:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[#626B82]/45 group-hover:opacity-15 transition-opacity duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-basel text-[11px] font-normal uppercase tracking-[0.05em] text-[#FBF9F5] drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]">
                        Treatments
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigatePage('about')}
                    className="group cursor-pointer relative aspect-[3/4.5] w-full overflow-hidden bg-[#AEB3BF] focus-visible:outline-2 focus-visible:outline-[#18224B]"
                  >
                    <img
                      src="/images/chapter-2-tailored.jpg"
                      alt="Discover About and Our Team"
                      className="h-full w-full object-cover grayscale contrast-105 mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[#969CA9]/35 group-hover:opacity-15 transition-opacity duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-basel text-[11px] font-normal uppercase tracking-[0.05em] text-[#FBF9F5] drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]">
                        About
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </section>
          </article>
        )}
      </main>

      {/* 11. SIGNATURE FOOTER WITH ROLLING MARBLE ENGRAVED WITH "NOVA" */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onNavigatePage={handleNavigatePage}
      />

      {/* INTERACTIVE APPOINTMENT BOOKING DRAWER */}
      <BookingDrawer
        isOpen={bookingOpen}
        initialCategoryId={bookingPreset.categoryId}
        initialRitualId={bookingPreset.ritualId}
        initialClientName={bookingPreset.clientName}
        initialClientPhone={bookingPreset.clientPhone}
        initialNotes={bookingPreset.notes}
        onClose={() => setBookingOpen(false)}
        onBookingConfirmed={handleBookingConfirmed}
        savedBookings={savedBookings}
      />

      {/* VIP PRIVILEGE WELCOME MODAL */}
      <VipPrivilegeModal
        isOpen={vipModalOpen}
        onClose={() => setVipModalOpen(false)}
        onApplyToBooking={handleApplyVipToBooking}
      />

      {/* FLOATING VIP PRIVILEGE VOUCHER PILL */}
      <aside aria-label="Sanctuary Welcome Privilege" className="fixed bottom-6 left-6 z-40 hidden sm:block">
        <button
          type="button"
          onClick={() => setVipModalOpen(true)}
          className="group cursor-pointer flex items-center gap-2.5 px-4 py-2.5 bg-[#18224B] text-[#FBF9F5] border border-[#C5B393] shadow-[0_4px_20px_rgba(24,34,75,0.25)] hover:bg-[#2A3772] transition-all duration-300"
          title="Claim ₹500 Sanctuary Welcome Privilege Voucher"
        >
          <span className="text-[#E8D5B5] text-xs animate-pulse">✦</span>
          <span className="font-basel text-[11px] uppercase tracking-[0.14em] font-medium">
            ₹500 Welcome Privilege
          </span>
          <span className="text-xs text-[#E8D5B5] group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </aside>

      {/* RISING ALABASTER CURTAIN PAGE TRANSITION LAYER */}
      <PageTransitionCurtain
        curtainRef={transitionCurtainRef}
        phase={transitionPhase}
      />
    </div>
  );
}
