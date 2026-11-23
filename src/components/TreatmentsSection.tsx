import React, { useEffect, useRef, useState } from 'react';
import { MediaAssetConfig, SALON_CONFIG } from '../data/salonData';
import { MediaSlot } from './MediaSlot';
import {
  resolveActiveTreatmentsSection,
  resolveModalityDeckState,
  resolveModalityTargetScrollY,
  resolveTreatmentsHeroStage,
  TreatmentsAnchorId,
} from '../utils/treatmentsScroll';

interface TreatmentsSectionProps {
  isFullPage?: boolean;
  onOpenBooking: (categoryId?: string, ritualId?: string) => void;
  onExploreFullTreatments?: () => void;
}

/**
 * Curated video + editorial photography pairing for each NOVA salon modality.
 * Maps existing salon service categories to lush full-bleed salon motion & stills.
 */
const CATEGORY_EDITORIAL_MEDIA: Record<string, MediaAssetConfig> = {
  facials: {
    id: 'treatments-modality-facials',
    videoPath: '/videos/approach-1.mp4',
    enableVideo: true,
    posterPath: '/images/service-facial.jpg',
    alt: 'Restorative botanical facial massage ritual in warm studio light at NOVA',
    focalPoint: 'center center',
  },
  nails: {
    id: 'treatments-modality-nails',
    videoPath: '/videos/approach-4.mp4',
    enableVideo: true,
    posterPath: '/images/service-nails.jpg',
    alt: 'Meticulous natural nail artistry and manicure care at NOVA',
    focalPoint: 'center center',
  },
  makeup: {
    id: 'treatments-modality-makeup',
    videoPath: '/videos/approach-3.mp4',
    enableVideo: true,
    posterPath: '/images/service-makeup.jpg',
    alt: 'Luminous skin-first bridal and editorial makeup artistry at NOVA',
    focalPoint: 'center 35%',
  },
  consultations: {
    id: 'treatments-modality-consultations',
    posterPath: '/images/service-consultation.jpg',
    alt: 'Botanical serum formulations and tailored skincare consultation at NOVA',
    focalPoint: 'center center',
  },
};

const HERO_VIDEO_MEDIA: MediaAssetConfig = {
  id: 'treatments-hero-film',
  videoPath: '/videos/approach-2.mp4',
  enableVideo: true,
  posterPath: '/images/spread-right-texture.jpg',
  alt: 'Close-up monochrome salon skincare texture and serum ritual film',
  focalPoint: 'center center',
};

/**
 * EDITORIAL TREATMENTS EXPERIENCE (Odyssée-Inspired Architectural Sequence for NOVA)
 * 1. Full-viewport atmospheric opening salon video with scroll-dissolving split title & manifesto
 * 2. Alabaster lead-in statement ("Guided by craft, refined through care.")
 * 3. Scroll-synchronized sticky service index ((1). to (4).) + stacked full-bleed salon media
 * 4. Full-bleed monochrome Pre & Aftercare care philosophy band
 * 5. Centered "YOUR JOURNEY" pause + narrow stacked macro diptych
 * + Floating bottom-left chapter index (• TREATMENTS / OUR MODALITIES / PRE AND AFTERCARE)
 */
export const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({
  isFullPage = true,
  onOpenBooking,
}) => {
  const categories = SALON_CONFIG.treatmentCategories;
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0].id);
  const [heroProgress, setHeroProgress] = useState<number>(0);
  const [modalityProgress, setModalityProgress] = useState<number>(0);
  const [activeAnchor, setActiveAnchor] = useState<TreatmentsAnchorId>('treatments');
  const [isNavOverDark, setIsNavOverDark] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const heroTrackRef = useRef<HTMLDivElement | null>(null);
  const modalitiesSectionRef = useRef<HTMLElement | null>(null);
  const modalitiesTrackRef = useRef<HTMLDivElement | null>(null);
  const mediaStageRef = useRef<HTMLDivElement | null>(null);
  const aftercareSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Scroll listener for opening hero dissolve, right-hand vanishing modality deck, and floating anchor contrast
  useEffect(() => {
    if (!isFullPage) return;

    let rafId = 0;
    const updateScrollState = () => {
      rafId = 0;
      const vh = window.innerHeight || 900;
      const scrollY = window.scrollY;

      const heroEl = heroTrackRef.current;
      const heroHeight = heroEl ? heroEl.offsetHeight : vh * 1.9;
      const maxHeroScroll = Math.max(1, heroHeight - vh);
      const nextHeroProgress = Math.max(0, Math.min(1, scrollY / maxHeroScroll));
      setHeroProgress(nextHeroProgress);

      // Compute continuous 0..1 progress through the sticky right-hand vanishing deck on desktop
      const trackEl = modalitiesTrackRef.current;
      const stageEl = mediaStageRef.current;
      if (trackEl && stageEl && window.innerWidth >= 1024) {
        const trackRect = trackEl.getBoundingClientRect();
        const trackTop = trackRect.top + scrollY;
        const trackHeight = trackEl.offsetHeight;
        const stageHeight = stageEl.offsetHeight || Math.round(vh * 0.78);
        const stickyTopOffset = 96; // matches lg:top-24
        const travel = Math.max(1, trackHeight - stageHeight);
        const rawModalityProgress = (scrollY - (trackTop - stickyTopOffset)) / travel;
        const clampedModalityProgress = Math.max(0, Math.min(1, rawModalityProgress));
        setModalityProgress(clampedModalityProgress);

        const nextDeck = resolveModalityDeckState(
          clampedModalityProgress,
          categories.length,
          prefersReducedMotion
        );
        const nextCat = categories[nextDeck.activeIndex];
        if (nextCat) {
          setActiveCategoryId((prev) => (prev === nextCat.id ? prev : nextCat.id));
        }
      }

      const aftercareEl = aftercareSectionRef.current;
      const aftercareTop = aftercareEl
        ? aftercareEl.getBoundingClientRect().top + scrollY
        : heroHeight + 2400;
      const aftercareBottom = aftercareEl
        ? aftercareTop + aftercareEl.offsetHeight
        : aftercareTop + vh;

      const status = resolveActiveTreatmentsSection(
        scrollY,
        { heroHeight, aftercareTop, aftercareBottom },
        vh
      );
      setActiveAnchor(status.activeAnchor);
      setIsNavOverDark(status.isOverDarkMedia);
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScrollState);
      }
    };

    updateScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [categories, isFullPage, prefersReducedMotion]);

  const handleSelectCategory = (categoryId: string, shouldScrollMedia = false) => {
    setActiveCategoryId(categoryId);
    const idx = categories.findIndex((cat) => cat.id === categoryId);
    if (
      shouldScrollMedia &&
      idx >= 0 &&
      typeof window !== 'undefined' &&
      window.innerWidth >= 1024
    ) {
      const trackEl = modalitiesTrackRef.current;
      const stageEl = mediaStageRef.current;
      if (trackEl && stageEl) {
        const trackTop = trackEl.getBoundingClientRect().top + window.scrollY;
        const trackHeight = trackEl.offsetHeight;
        const stageHeight = stageEl.offsetHeight || Math.round((window.innerHeight || 900) * 0.78);
        const targetY = resolveModalityTargetScrollY(
          trackTop,
          trackHeight,
          stageHeight,
          96,
          idx,
          categories.length
        );
        window.scrollTo({
          top: targetY,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
    }
  };

  const scrollToAnchor = (anchor: TreatmentsAnchorId) => {
    const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
    if (anchor === 'treatments') {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    if (anchor === 'modalities' && modalitiesSectionRef.current) {
      modalitiesSectionRef.current.scrollIntoView({ behavior, block: 'start' });
      return;
    }
    if (anchor === 'aftercare' && aftercareSectionRef.current) {
      aftercareSectionRef.current.scrollIntoView({ behavior, block: 'start' });
    }
  };

  const heroStage = resolveTreatmentsHeroStage(heroProgress, prefersReducedMotion);
  const modalityDeck = resolveModalityDeckState(
    modalityProgress,
    categories.length,
    prefersReducedMotion
  );
  const desktopTrackHeightVh = Math.max(1, categories.length - 1) * 92 + 78;

  return (
    <div id="treatments-section" className="relative bg-[#FBF9F5] text-[#18224B]">
      {/* FLOATING BOTTOM-LEFT CHAPTER INDEX (Desktop) */}
      {isFullPage && (
        <nav
          aria-label="Treatments Page Sections"
          data-testid="treatments-floating-index"
          className={`hidden md:flex fixed bottom-7 left-7 z-30 flex-col items-start gap-1 font-basel text-[10.5px] uppercase tracking-[0.06em] transition-colors duration-300 ${
            isNavOverDark ? 'text-[#FBF9F5]' : 'text-[#18224B]'
          }`}
        >
          {(
            [
              { id: 'treatments', label: 'Treatments' },
              { id: 'modalities', label: 'Our Modalities' },
              { id: 'aftercare', label: 'Pre and Aftercare' },
            ] as const
          ).map((item) => {
            const isActive = activeAnchor === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToAnchor(item.id)}
                className={`cursor-pointer inline-flex items-center gap-1.5 py-0.5 transition-opacity whitespace-nowrap shrink-0 ${
                  isActive ? 'opacity-100 font-medium' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="inline-block h-1 w-1 rounded-full bg-current"
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* 1. ATMOSPHERIC FULL-VIEWPORT OPENING VIDEO HERO + SCROLL MANIFESTO */}
      <section
        ref={heroTrackRef}
        aria-label="Treatments Opening Film"
        data-testid="treatments-hero"
        className="relative h-[192vh] w-full bg-[#1C1E22] text-[#FBF9F5]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Moody Monochrome Salon Skincare Film */}
          <MediaSlot
            media={HERO_VIDEO_MEDIA}
            priority={true}
            subtleMotion={true}
            className="h-full w-full grayscale contrast-[1.08] brightness-[0.82]"
            overlayClassName="bg-gradient-to-b from-[#121620]/35 via-[#121620]/20 to-[#121620]/55"
          />

          {/* Stage 1A: Split Editorial Serif Headline (Dissolves softly on scroll) */}
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center px-6 md:px-10"
            style={{
              opacity: heroStage.headlineOpacity,
              filter:
                heroStage.headlineBlurPx > 0
                  ? `blur(${heroStage.headlineBlurPx}px)`
                  : undefined,
            }}
          >
            <h1
              id="treatments-heading"
              className="mx-auto w-full max-w-[1440px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-serif-editorial text-4xl sm:text-5xl lg:text-[3.35rem] font-light tracking-[-0.025em] text-[#FBF9F5] drop-shadow-[0_2px_18px_rgba(0,0,0,0.28)]"
            >
              <span>Guided by craft</span>
              <span>refined through care.</span>
            </h1>
          </div>

          {/* Stage 1B: Indented Salon Ethos Manifesto (Rises cleanly in lower-right on scroll) */}
          <div
            className="absolute inset-0 z-20 flex items-end pb-16 sm:pb-20 md:pb-24 px-6 md:px-10 pointer-events-none"
            style={{
              opacity: heroStage.manifestoOpacity,
              transform: `translate3d(0, ${heroStage.manifestoY}px, 0)`,
            }}
          >
            <div className="mx-auto w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-start-7 lg:col-span-6 space-y-8 pointer-events-auto">
                <p className="font-serif-editorial text-2xl sm:text-[1.85rem] lg:text-[2.1rem] font-light leading-[1.22] tracking-[-0.02em] text-[#FBF9F5] md:indent-20 drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
                  Beauty is an unhurried, personal ritual. At{' '}
                  <span className="font-brand text-[0.9em] tracking-[0.05em]">NOVA</span>,
                  we approach skin, nails, makeup, and restorative care layer by layer—uniting
                  refined manual artistry with considered botanical formulations tailored
                  exclusively to your natural rhythm.
                </p>

                <button
                  type="button"
                  onClick={() => scrollToAnchor('modalities')}
                  className="font-basel cursor-pointer text-[11px] uppercase tracking-[0.08em] text-[#FBF9F5]/90 hover:text-[#E8D5B5] transition-colors whitespace-nowrap shrink-0"
                >
                  A treatment plan shaped for you
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUIET ALABASTER LEAD-IN + SCROLL-LINKED MODALITIES DIRECTORY */}
      <section
        ref={modalitiesSectionRef}
        aria-label="Our Salon Modalities and Services"
        data-testid="treatments-modalities"
        className="bg-[#FBF9F5] text-[#18224B] pt-16 md:pt-24 pb-20 md:pb-32"
      >
        {/* Echo Lead-in Statement aligned to left modalities column */}
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 md:px-10 pb-20 md:pb-32 grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-start-3 lg:col-span-5">
            <p className="font-serif-editorial text-[1.15rem] md:text-[1.35rem] font-light tracking-[-0.018em] text-[#18224B]">
              Guided by craft, refined through care.
            </p>
          </div>
        </div>

        {/* Desktop Split Architecture: Sticky Left Numbered Modalities | Sticky Right Vanishing Media Deck */}
        <div
          ref={modalitiesTrackRef}
          data-testid="treatments-modalities-track"
          className="mx-auto max-w-[1440px] px-5 sm:px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start"
        >
          {/* LEFT COLUMN: Sticky Numbered Service Chapters ((1). - (4).) */}
          <div className="lg:col-start-3 lg:col-span-4 lg:sticky lg:top-28 lg:pr-6">
            <div className="space-y-4">
              {categories.map((cat, idx) => {
                const isActive = cat.id === activeCategoryId;
                const displayNumber = `(${idx + 1}).`;
                return (
                  <div
                    key={cat.id}
                    data-testid={`modality-chapter-${cat.id}`}
                    data-active={isActive ? 'true' : 'false'}
                    className="transition-colors duration-300"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(cat.id, true)}
                      aria-expanded={isActive}
                      className={`cursor-pointer group w-full grid grid-cols-[2.75rem_1fr] items-baseline text-left py-1.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-[#18224B] ${
                        isActive
                          ? 'text-[#18224B]'
                          : 'text-[#18224B]/30 hover:text-[#18224B]/70'
                      }`}
                    >
                      <span className="font-serif-editorial text-[15px] tabular-nums">
                        {displayNumber}
                      </span>
                      <span className="font-serif-editorial text-[1.15rem] md:text-[1.25rem] font-light tracking-[-0.016em] leading-snug">
                        {cat.title}
                      </span>
                    </button>

                    {/* Active Chapter Prose + Editorial Ritual List */}
                    {isActive && (
                      <div className="grid grid-cols-[2.75rem_1fr] pt-3 pb-7">
                        <div className="col-start-2 space-y-6">
                          <p className="font-basel text-[14px] leading-[1.6] text-[#18224B]/85 max-w-[330px]">
                            {cat.description}
                          </p>

                          {/* Unboxed Editorial Bullet List of Salon Rituals (Click any ritual to reserve) */}
                          <ul className="space-y-3 pt-1">
                            {cat.rituals.map((ritual) => (
                              <li key={ritual.id} className="group/ritual">
                                <button
                                  type="button"
                                  onClick={() => onOpenBooking(cat.id, ritual.id)}
                                  className="cursor-pointer w-full text-left flex items-start gap-3 py-0.5 text-[#18224B] hover:opacity-70 transition-opacity focus-visible:outline-2 focus-visible:outline-[#18224B]"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="mt-[0.55rem] h-[3px] w-[3px] rounded-full bg-[#18224B]/65 shrink-0"
                                  />
                                  <span className="block space-y-0.5">
                                    <span className="block font-basel text-[13.5px] leading-[1.45] text-[#18224B] group-hover/ritual:underline underline-offset-4">
                                      {ritual.name}
                                    </span>
                                    <span className="block font-mono-tabular text-[11px] text-[#18224B]/55">
                                      {ritual.duration}{ritual.examplePrice ? ` · ${ritual.examplePrice}` : ''}
                                    </span>
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>

                          {/* Quiet Editorial Booking Trigger */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => onOpenBooking(cat.id, cat.rituals[0]?.id)}
                              className="font-basel cursor-pointer text-[11px] uppercase tracking-[0.1em] text-[#18224B] border-b border-[#18224B]/40 pb-1 hover:border-[#18224B] transition-colors whitespace-nowrap shrink-0"
                            >
                              Reserve {cat.shortLabel} →
                            </button>
                          </div>

                          {/* Mobile-only paired editorial visual right below the active chapter */}
                          <div className="lg:hidden pt-3">
                            <div className="aspect-[4/4.4] w-full overflow-hidden bg-[#E6E2DA]">
                              <MediaSlot
                                media={CATEGORY_EDITORIAL_MEDIA[cat.id] || cat.media}
                                subtleMotion={true}
                                className="h-full w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop): Sticky Vanishing Editorial Deck (Scrolls into one another) */}
          <div
            className="hidden lg:block lg:col-start-7 lg:col-span-6 relative"
            style={{ height: `${desktopTrackHeightVh}vh` }}
          >
            <div
              ref={mediaStageRef}
              data-testid="modality-vanishing-stage"
              data-active-index={modalityDeck.activeIndex}
              data-transition-progress={modalityDeck.transitionProgress}
              className="sticky top-24 h-[78vh] min-h-[540px] max-h-[760px] w-full overflow-hidden bg-[#FBF9F5]"
            >
              {categories.map((cat, idx) => {
                const editorialMedia = CATEGORY_EDITORIAL_MEDIA[cat.id] || cat.media;
                const slide = modalityDeck.slides[idx];
                const topEdge = slide?.clipTopPercent ?? 100;
                const featherBand = (slide?.featherProgress ?? 0) * 24;

                // Soft feathered leading edge so incoming media melts smoothly into the vanishing visual beneath
                const maskGradient =
                  featherBand > 0.4
                    ? `linear-gradient(to bottom, transparent ${Math.max(
                        0,
                        topEdge - 1
                      )}%, rgba(0,0,0,0.52) ${Math.min(
                        100,
                        topEdge + featherBand * 0.45
                      )}%, black ${Math.min(100, topEdge + featherBand)}%, black 100%)`
                    : topEdge > 0.5
                      ? `linear-gradient(to bottom, transparent ${topEdge}%, black ${topEdge}%)`
                      : undefined;

                const filterValue =
                  slide && slide.blurPx > 0.08 ? `blur(${slide.blurPx}px)` : undefined;

                return (
                  <div
                    key={cat.id}
                    data-modality-id={cat.id}
                    data-testid={`modality-media-${cat.id}`}
                    data-slide-role={slide?.role ?? 'upcoming'}
                    data-slide-opacity={slide?.opacity ?? 0}
                    data-slide-clip={topEdge}
                    aria-hidden={!slide?.isVisible}
                    className="absolute inset-0 h-full w-full overflow-hidden"
                    style={{
                      zIndex: slide?.zIndex ?? idx + 1,
                      opacity: slide?.opacity ?? 0,
                      transform: slide
                        ? `translate3d(0, ${slide.translateYPercent}%, 0) scale(${slide.scale})`
                        : 'translate3d(0, 14%, 0) scale(1.09)',
                      filter: filterValue,
                      maskImage: maskGradient,
                      WebkitMaskImage: maskGradient,
                      visibility: slide?.isVisible ? 'visible' : 'hidden',
                      pointerEvents: slide?.role === 'active' ? 'auto' : 'none',
                    }}
                  >
                    <MediaSlot
                      media={editorialMedia}
                      priority={false}
                      subtleMotion={false}
                      className="h-full w-full"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FULL-BLEED MONOCHROME "PRE & AFTERCARE" ATMOSPHERIC BAND */}
      <section
        ref={aftercareSectionRef}
        aria-label="Pre and Aftercare Guidance"
        data-testid="treatments-aftercare"
        className="relative min-h-[92vh] w-full overflow-hidden bg-[#6E6F73] text-[#FBF9F5] flex items-end"
      >
        <img
          src="/images/intro-profile.jpg"
          alt="Serene monochrome salon skincare portrait illustrating calm pre and aftercare"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-center grayscale contrast-[1.04] brightness-[0.84] scale-[1.02]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121620]/70 via-[#121620]/25 to-[#121620]/15"
        />

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 md:px-10 pb-14 md:pb-20 pt-32 grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-start-3 lg:col-span-8">
            <p className="font-serif-editorial text-2xl sm:text-3xl lg:text-[2.15rem] font-light leading-[1.24] tracking-[-0.022em] text-[#FBF9F5] md:indent-24 [text-wrap:balance]">
              Preparing your skin, hands, and complexion is just as important as the care
              after your visit in order to elevate every ritual and result. We discuss this
              with you during your consultation, working gently with your natural rhythm,
              and you will leave with tailored aftercare notes for calm, lasting radiance.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CENTERED "YOUR JOURNEY" BREATHING PAUSE + STACKED MACRO DIPTYCH */}
      <section
        aria-label="Your Personal Journey"
        data-testid="treatments-journey"
        className="bg-[#FBF9F5] text-[#18224B] px-6 md:px-10"
      >
        {/* Spacious Centered Editorial Statement */}
        <div className="mx-auto max-w-[780px] py-32 md:py-44 text-center space-y-6">
          <div className="space-y-1">
            <p className="font-serif-editorial text-2xl sm:text-3xl md:text-[2.45rem] font-light uppercase tracking-[0.02em] text-[#18224B]/40">
              Your Journey
            </p>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl md:text-[2.45rem] font-light tracking-[-0.02em] text-[#18224B]/45 [text-wrap:balance]">
              Artisanal precision, made personal.
            </h2>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="font-basel cursor-pointer text-[11px] uppercase tracking-[0.12em] text-[#18224B] border-b border-[#18224B]/35 pb-1 hover:border-[#18224B] transition-colors whitespace-nowrap shrink-0"
            >
              Book a Consultation
            </button>
          </div>
        </div>

        {/* Centered Narrow Stacked Macro Diptych (Zero gap between frames, matching reference) */}
        <div className="mx-auto max-w-[440px] w-full pb-28 md:pb-36 flex flex-col gap-0">
          <div className="aspect-[1/0.86] w-full overflow-hidden bg-[#E5DDD5]">
            <img
              src="/assets/aistudio/Generated_Image_November_17__2026_-_4_59PM_6977a387.jpg"
              alt="Macro close-up of luminous natural skin and eye texture"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center animate-editorial-film"
            />
          </div>
          <div className="aspect-[1/0.86] w-full overflow-hidden bg-[#DDD4C8]">
            <img
              src="/images/chapter-3-professionals.jpg"
              alt="Tactile sculptural facial touch and gentle salon care"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
