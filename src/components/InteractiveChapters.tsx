import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SALON_CONFIG } from '../data/salonData';
import {
  formatChapterCounter,
  getNextChapterIndex,
  resolveScrollStoryState,
} from '../utils/bookingLogic';
import { MediaSlot } from './MediaSlot';

gsap.registerPlugin(ScrollTrigger);

interface InteractiveChaptersProps {
  onOpenBooking: () => void;
  onNavigateTreatments?: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

/**
 * Coordinated GSAP + ScrollTrigger Storytelling & Section Transition:
 * 1. Pins the 4-panel horizontal "Why Nova?" story on desktop and scrubs smoothly
 *    through slides 01 / 04 -> 02 / 04 -> 03 / 04 -> 04 / 04 with coordinated
 *    opacity, scale, clip-path, and thin horizon progress bar animations.
 * 2. Seamlessly transitions from Slide 04 / 04 into the emerging CONCERNS / TREATMENTS
 *    dual duotone portals within the same scrubbed timeline before releasing the pin.
 * 3. On mobile/tablet (<1024px), provides an accessible, unpinned interactive layout
 *    with smooth GSAP slide transitions.
 */
export const InteractiveChapters: React.FC<InteractiveChaptersProps> = ({
  onNavigateTreatments,
  onScrollToSection,
}) => {
  const chapters = SALON_CONFIG.chapters;
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [portalsInteractive, setPortalsInteractive] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pinStageRef = useRef<HTMLDivElement | null>(null);
  const chaptersStageRef = useRef<HTMLDivElement | null>(null);
  const portalsStageRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const activeIndexRef = useRef<number>(1);
  const portalInteractiveRef = useRef<boolean>(false);

  const counter = formatChapterCounter(activeIndex, chapters.length);

  // Sync manual slide selection (mobile or direct button click) with either ScrollTrigger scroll position or GSAP tween
  const handleSelectChapter = (targetIndex: number) => {
    const clamped = Math.min(chapters.length, Math.max(1, targetIndex));
    activeIndexRef.current = clamped;
    setActiveIndex(clamped);

    const st = scrollTriggerRef.current;
    if (st && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      // Map chapters 1..4 to their focal points on the timeline (0.04, 0.23, 0.44, 0.65)
      const chapterStops = [0.04, 0.23, 0.44, 0.65];
      const targetProgress = chapterStops[clamped - 1] ?? 0;
      const targetScroll = st.start + (st.end - st.start) * targetProgress;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      return;
    }

    // Immediate visual tween when not driven by desktop scroll scrub
    if (sectionRef.current) {
      const panels = sectionRef.current.querySelectorAll<HTMLElement>('.chapter-panel');
      panels.forEach((panel, idx) => {
        const isTarget = idx + 1 === clamped;
        const veil = panel.querySelector<HTMLElement>('.chapter-veil');
        const mediaInner = panel.querySelector<HTMLElement>('.chapter-media-inner');
        const copy = panel.querySelector<HTMLElement>('.chapter-copy');

        if (veil) {
          gsap.to(veil, {
            opacity: isTarget ? 0 : 0.82,
            duration: 0.55,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
        if (mediaInner) {
          gsap.to(mediaInner, {
            scale: isTarget ? 1 : 1.06,
            clipPath: isTarget
              ? 'inset(0% 0% 0% 0%)'
              : 'inset(2.5% 1.5% 2.5% 1.5%)',
            duration: 0.65,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
        if (copy) {
          gsap.to(copy, {
            opacity: isTarget ? 1 : 0.2,
            y: isTarget ? 0 : 10,
            duration: 0.55,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });

      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          xPercent: (clamped - 1) * 100,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, {
          scaleX: clamped / chapters.length,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    }
  };

  const handleStep = (direction: 'prev' | 'next') => {
    const nextIdx = getNextChapterIndex(activeIndexRef.current, chapters.length, direction);
    handleSelectChapter(nextIdx);
  };

  useLayoutEffect(() => {
    const rootEl = sectionRef.current;
    if (!rootEl) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP (>= 1024px): Pinned, scrub-driven 4-chapter story + seamless emergence of Concerns/Treatments portals
      mm.add('(min-width: 1024px)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('.chapter-panel', rootEl);
        const veils = panels.map((p) => p.querySelector<HTMLElement>('.chapter-veil'));
        const mediaInners = panels.map((p) =>
          p.querySelector<HTMLElement>('.chapter-media-inner')
        );
        const copies = panels.map((p) => p.querySelector<HTMLElement>('.chapter-copy'));

        const chaptersStage = chaptersStageRef.current;
        const portalsStage = portalsStageRef.current;
        const progressBar = progressBarRef.current;
        const progressFill = progressFillRef.current;
        const portalCards = gsap.utils.toArray<HTMLElement>('.portal-card', rootEl);
        const portalImages = gsap.utils.toArray<HTMLElement>('.portal-img', rootEl);

        // Set deterministic initial states for Slide 01 / 04 and hidden emerging portals
        veils.forEach((veil, idx) => {
          if (!veil) return;
          gsap.set(veil, { opacity: idx === 0 ? 0 : 0.82 });
        });

        mediaInners.forEach((media, idx) => {
          if (!media) return;
          gsap.set(media, {
            scale: idx === 0 ? 1 : 1.07,
            clipPath:
              idx === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(2.5% 1.5% 2.5% 1.5%)',
          });
        });

        copies.forEach((copy, idx) => {
          if (!copy) return;
          gsap.set(copy, {
            opacity: idx === 0 ? 1 : 0.18,
            y: idx === 0 ? 0 : 12,
          });
        });

        if (progressBar) {
          gsap.set(progressBar, { xPercent: 0 });
        }
        if (progressFill) {
          gsap.set(progressFill, { scaleX: 0.25, transformOrigin: 'left center' });
        }

        if (chaptersStage) {
          gsap.set(chaptersStage, { yPercent: 0, scale: 1, opacity: 1 });
        }

        if (portalsStage) {
          gsap.set(portalsStage, { yPercent: 24, opacity: 0 });
        }

        portalCards.forEach((card) => {
          gsap.set(card, { clipPath: 'inset(10% 3% 10% 3%)' });
        });

        portalImages.forEach((img) => {
          gsap.set(img, { scale: 1.1 });
        });

        // Master scrubbed timeline (total duration: 4.4 units)
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: pinStageRef.current,
            start: 'top top',
            end: '+=330%',
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const state = resolveScrollStoryState(self.progress, chapters.length);
              if (state.activeIndex !== activeIndexRef.current) {
                activeIndexRef.current = state.activeIndex;
                setActiveIndex(state.activeIndex);
              }
              if (state.isPortalInteractive !== portalInteractiveRef.current) {
                portalInteractiveRef.current = state.isPortalInteractive;
                setPortalsInteractive(state.isPortalInteractive);
              }
            },
          },
        });

        scrollTriggerRef.current = tl.scrollTrigger ?? null;

        // Helper to build overlapping chapter-to-chapter transitions (0->1, 1->2, 2->3)
        const addSlideTransition = (fromIdx: number, toIdx: number, startTime: number) => {
          const duration = 0.85;

          // Outgoing slide softens & recedes slightly
          if (veils[fromIdx]) {
            tl.to(veils[fromIdx], { opacity: 0.82, duration }, startTime);
          }
          if (mediaInners[fromIdx]) {
            tl.to(
              mediaInners[fromIdx],
              {
                scale: 1.05,
                clipPath: 'inset(2.5% 1.5% 2.5% 1.5%)',
                duration,
              },
              startTime
            );
          }
          if (copies[fromIdx]) {
            tl.to(
              copies[fromIdx],
              { opacity: 0.18, y: 10, duration: duration * 0.85 },
              startTime
            );
          }

          // Incoming slide emerges with crisp focus, full frame & elevated copy
          if (veils[toIdx]) {
            tl.to(veils[toIdx], { opacity: 0, duration }, startTime + 0.06);
          }
          if (mediaInners[toIdx]) {
            tl.to(
              mediaInners[toIdx],
              {
                scale: 1,
                clipPath: 'inset(0% 0% 0% 0%)',
                duration,
              },
              startTime + 0.06
            );
          }
          if (copies[toIdx]) {
            tl.to(
              copies[toIdx],
              { opacity: 1, y: 0, duration },
              startTime + 0.1
            );
          }

          // Scrub horizontal progress bar & subtle full-width progress fill
          if (progressBar) {
            tl.to(
              progressBar,
              { xPercent: toIdx * 100, duration, ease: 'none' },
              startTime
            );
          }
          if (progressFill) {
            tl.to(
              progressFill,
              { scaleX: (toIdx + 1) / chapters.length, duration, ease: 'none' },
              startTime
            );
          }
        };

        // Phase 1: Slide 01 -> Slide 02
        addSlideTransition(0, 1, 0.15);
        // Phase 2: Slide 02 -> Slide 03
        addSlideTransition(1, 2, 1.15);
        // Phase 3: Slide 03 -> Slide 04
        addSlideTransition(2, 3, 2.15);

        // Phase 4 (t = 3.18 -> 4.40): Seamless scroll-driven transition from Slide 04 into CONCERNS / TREATMENTS
        if (chaptersStage) {
          tl.to(
            chaptersStage,
            {
              yPercent: -15,
              scale: 0.965,
              opacity: 0,
              duration: 1.05,
              ease: 'power2.inOut',
            },
            3.18
          );
        }

        if (portalsStage) {
          tl.to(
            portalsStage,
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.15,
              ease: 'power2.out',
            },
            3.22
          );
        }

        if (portalCards.length > 0) {
          tl.to(
            portalCards,
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.15,
              stagger: 0.06,
              ease: 'power2.out',
            },
            3.24
          );
        }

        if (portalImages.length > 0) {
          tl.to(
            portalImages,
            {
              scale: 1,
              duration: 1.2,
              stagger: 0.06,
              ease: 'power2.out',
            },
            3.24
          );
        }

        return () => {
          scrollTriggerRef.current = null;
          tl.kill();
        };
      });

      // MOBILE & TABLET (< 1024px): Simplified responsive layout without long scroll pinning
      mm.add('(max-width: 1023px)', () => {
        scrollTriggerRef.current = null;
        portalInteractiveRef.current = true;
        setPortalsInteractive(true);

        if (chaptersStageRef.current) {
          gsap.set(chaptersStageRef.current, { clearProps: 'all' });
        }
        if (portalsStageRef.current) {
          gsap.set(portalsStageRef.current, { clearProps: 'all' });
        }
        gsap.set('.portal-card, .portal-img', { clearProps: 'all' });

        // Smooth scroll-triggered entrance for the Concerns / Treatments portals on mobile
        if (portalsStageRef.current) {
          gsap.fromTo(
            portalsStageRef.current,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: portalsStageRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    }, rootEl);

    return () => {
      scrollTriggerRef.current = null;
      ctx.revert();
    };
  }, [chapters.length]);

  const handleConcernsClick = () => {
    if (onNavigateTreatments) {
      onNavigateTreatments();
      return;
    }
    if (onScrollToSection) {
      onScrollToSection('our-approach');
    }
  };

  const handleTreatmentsClick = () => {
    if (onNavigateTreatments) {
      onNavigateTreatments();
      return;
    }
    const el = document.getElementById('treatments-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={sectionRef} className="relative bg-[#FBF9F5] text-[#18224B]">
      {/* Pinned Unified Scroll-Story Stage on Desktop; Natural Vertical Stack on Mobile */}
      <div
        ref={pinStageRef}
        className="relative w-full lg:h-screen lg:overflow-hidden flex flex-col justify-center bg-[#FBF9F5]"
      >
        {/* LAYER 1: WHY NOVA? — 4-PANEL HORIZONTAL SCROLL STORY */}
        <section
          id="our-approach"
          ref={chaptersStageRef}
          aria-labelledby="why-nova-heading"
          className="relative w-full pt-8 pb-16 md:pt-10 md:pb-20 lg:py-0 px-5 md:px-8 bg-[#FBF9F5] text-[#18224B] will-change-transform"
        >
          <div className="mx-auto max-w-[1440px]">
            {/* Odyssée-Style Horizon Header Bar with Dynamic 01 / 04 Counter & Scrubbed Progress Line */}
            <div className="relative pb-3.5 border-b border-[#18224B]/15">
              <div className="grid grid-cols-2 md:grid-cols-12 items-center text-[11px] uppercase tracking-[0.12em] text-[#18224B]">
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  data-testid="chapter-counter"
                  className="md:col-span-2 font-mono-tabular flex items-center gap-1.5"
                >
                  <span>{counter.paddedCurrent}</span>
                  <span className="opacity-50">/</span>
                  <span>{counter.paddedTotal}</span>
                </div>

                <h2
                  id="why-nova-heading"
                  className="md:col-span-7 font-basel text-[11px] font-normal uppercase tracking-[0.12em] text-[#18224B]"
                >
                  Why <span className="font-brand text-[13px] tracking-[0.06em]">NOVA</span>?
                </h2>

                <div className="col-span-2 md:col-span-3 flex justify-end items-center gap-3 mt-2 md:mt-0">
                  {/* Mobile Chapter Quick-Select Buttons */}
                  <div className="flex lg:hidden items-center gap-1.5 mr-2">
                    {chapters.map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => handleSelectChapter(ch.index)}
                        aria-label={`Select slide ${ch.index}`}
                        className={`cursor-pointer px-2 py-0.5 text-[10px] font-mono-tabular transition-colors ${
                          activeIndex === ch.index
                            ? 'bg-[#18224B] text-[#FBF9F5]'
                            : 'text-[#18224B]/55 hover:text-[#18224B]'
                        }`}
                      >
                        0{ch.index}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStep('prev')}
                    aria-label="Previous chapter"
                    className="cursor-pointer px-1.5 py-0.5 text-xs text-[#18224B]/60 hover:text-[#18224B] transition-colors"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStep('next')}
                    aria-label="Next chapter"
                    className="cursor-pointer px-1.5 py-0.5 text-xs text-[#18224B]/60 hover:text-[#18224B] transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Continuous Thin Progress Fill + Active 1/4 Navy Horizon Bar */}
              <div
                ref={progressFillRef}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 w-full h-[1px] bg-[#18224B]/30 origin-left"
              />
              <div
                ref={progressBarRef}
                aria-hidden="true"
                style={{ width: '25%' }}
                className="pointer-events-none absolute bottom-0 left-0 h-[1.5px] bg-[#18224B] will-change-transform"
              />
            </div>

            {/* 4-Column Edge-to-Edge Horizontal Video & Editorial Strip */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 sm:gap-x-0">
              {chapters.map((chapter) => {
                const isActive = chapter.index === activeIndex;
                return (
                  <article
                    key={chapter.id}
                    className="chapter-panel relative group"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectChapter(chapter.index)}
                      aria-pressed={isActive}
                      className="cursor-pointer block w-full text-left focus-visible:outline-2 focus-visible:outline-[#18224B]"
                    >
                      {/* 4:3 Video/Image Slot with Scrubbed Scale, Clip-Path & Alabaster Veil */}
                      <div className="chapter-media-wrap relative aspect-[4/3] w-full overflow-hidden bg-[#EAE6DF]">
                        <div className="chapter-media-inner h-full w-full will-change-transform">
                          <MediaSlot
                            media={chapter.media}
                            priority={true}
                            subtleMotion={false}
                            className="h-full w-full"
                          />
                        </div>

                        {/* Soft warm-alabaster veil controlled by GSAP ScrollTrigger */}
                        <div
                          aria-hidden="true"
                          className="chapter-veil pointer-events-none absolute inset-0 bg-[#FBF9F5] will-change-opacity"
                        />
                      </div>

                      {/* Below-Video Editorial Index & Copy: (1). on left, Heading + Paragraph on right */}
                      <div className="chapter-copy mt-5 grid grid-cols-[44px_1fr] pr-6 lg:pr-10 will-change-transform">
                        <div className="font-serif-editorial text-lg font-light text-[#18224B]">
                          <span>{chapter.number}</span>
                          {isActive && <span className="sr-only"> Active Chapter</span>}
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-serif-editorial text-xl md:text-[1.45rem] font-light leading-snug tracking-[-0.022em] text-[#18224B]">
                            {chapter.title}
                          </h3>
                          <p className="font-basel text-[13px] leading-[1.55] text-[#18224B]/90">
                            {chapter.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* LAYER 2: EMERGING CONCERNS & TREATMENTS PORTALS (Seamlessly revealed at the end of Slide 04) */}
        <section
          ref={portalsStageRef}
          aria-label="Concerns and Treatments Portals"
          className={`w-full px-5 md:px-8 pb-20 md:pb-28 lg:pb-0 lg:absolute lg:inset-0 lg:z-20 lg:flex lg:items-center bg-[#FBF9F5]/0 will-change-transform ${
            portalsInteractive ? 'pointer-events-auto' : 'lg:pointer-events-none'
          }`}
        >
          <div className="mx-auto w-full max-w-[1440px] grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left Portal: SKIN CONCERNS */}
            <button
              type="button"
              onClick={handleConcernsClick}
              className="portal-card group cursor-pointer relative aspect-[4/4.3] lg:max-h-[82vh] w-full overflow-hidden bg-[#737B92] text-center focus-visible:outline-2 focus-visible:outline-[#18224B] will-change-transform"
            >
              <img
                src="/images/chapter-2-tailored.jpg"
                alt="Skin concerns and bespoke consultations"
                className="portal-img h-full w-full object-cover grayscale contrast-90 mix-blend-luminosity opacity-55 group-hover:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 will-change-transform"
              />
              <div className="pointer-events-none absolute inset-0 bg-[#5C6684]/45 group-hover:opacity-15 transition-opacity duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-basel text-[11px] uppercase tracking-[0.16em] text-[#FBF9F5] drop-shadow">
                  Concerns
                </span>
              </div>
            </button>

            {/* Right Portal: TREATMENTS */}
            <button
              type="button"
              onClick={handleTreatmentsClick}
              className="portal-card group cursor-pointer relative aspect-[4/4.3] lg:max-h-[82vh] w-full overflow-hidden bg-[#515B75] text-center focus-visible:outline-2 focus-visible:outline-[#18224B] will-change-transform"
            >
              <img
                src="/images/service-makeup.jpg"
                alt="Treatments and aesthetic artistry"
                className="portal-img h-full w-full object-cover grayscale contrast-105 mix-blend-luminosity opacity-75 group-hover:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 will-change-transform"
              />
              <div className="pointer-events-none absolute inset-0 bg-[#3B4666]/45 group-hover:opacity-15 transition-opacity duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-basel text-[11px] uppercase tracking-[0.16em] text-[#FBF9F5] drop-shadow">
                  Treatments
                </span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
