import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SALON_CONFIG } from '../data/salonData';
import { NavHoverLink } from './NavHoverLink';
import aboutLoungeHeroImg from '../assets/images/about_lounge_hero_1795344838653.jpg';
import aboutHydrangeaInsetImg from '../assets/images/about_hydrangea_inset_1795344837528.jpg';
import aboutOwnerPortraitImg from '../assets/images/owner_portrait_light_body.jpg';
import aboutConsultationBwImg from '../assets/images/about_consultation_bw_1795344839589.jpg';

gsap.registerPlugin(ScrollTrigger);

interface AboutSectionProps {
  isFullPage?: boolean;
  onNavigateAbout?: () => void;
  onNavigateTreatments?: () => void;
  onOpenBooking: () => void;
}

/**
 * Editorial About & Founder Sanctuary Page
 * Mirrors the Odyssée architectural About sequence tailored for NOVA Unisex Salon:
 * 1. Full-viewport sunlit lounge hero with split "Evolving / with you." horizon headline & floating hydrangea inset
 * 2. Alabaster (#FBF9F5) manifesto band with left "ABOUT" kicker, indented serif philosophy & Lucknow sanctuary details
 * 3. Tall editorial Founder & Owner portrait on left with flush scrolling monochrome consultation inset on right
 * 4. Quiet 3-pillar sanctuary ethos strip with direct consultation & treatment actions
 */
export const AboutSection: React.FC<AboutSectionProps> = ({
  isFullPage = true,
  onNavigateTreatments,
  onOpenBooking,
}) => {
  const { about, contact } = SALON_CONFIG;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const heroBgRef = useRef<HTMLImageElement | null>(null);
  const heroInsetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      if (heroBgRef.current) {
        gsap.fromTo(
          heroBgRef.current,
          { scale: 1.05, yPercent: 0 },
          {
            scale: 1.09,
            yPercent: 7,
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-testid="about-hero-section"]',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.4,
            },
          }
        );
      }

      if (heroInsetRef.current) {
        gsap.fromTo(
          heroInsetRef.current,
          { y: 18, opacity: 0.92 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            ease: 'power3.out',
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      id="about-section"
      className="bg-[#FBF9F5] text-[#18224B]"
    >
      {/* 1. FULL-VIEWPORT SUNLIT LOUNGE HERO (Matching reference `image_71ad232e.png`) */}
      <section
        data-testid="about-hero-section"
        aria-labelledby="about-hero-heading"
        className={`relative w-full overflow-hidden bg-[#B8ADA1] text-[#FBF9F5] ${
          isFullPage ? 'min-h-[100svh] h-screen max-h-[1040px]' : 'min-h-[82vh]'
        }`}
      >
        {/* Full-bleed lounge interior photograph */}
        <img
          ref={heroBgRef}
          src={aboutLoungeHeroImg}
          alt="Sunlit NOVA Unisex Salon reception lounge with sheer linen curtains and warm camel boucle sofa"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-[center_58%] will-change-transform select-none"
        />

        {/* Measured neutral veil for crisp white typography over sunlit linen curtains */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1A1815]/36 via-[#1A1815]/14 to-[#1A1815]/42"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_56%,rgba(20,18,16,0.22)_0%,transparent_64%)]"
        />

        {/* Hero Composition Grid */}
        <div className="relative z-10 mx-auto h-full max-w-[1440px] px-5 sm:px-6 md:px-10 pt-24 pb-10 md:py-0 flex flex-col justify-between lg:block">
          {/* Split Horizon Serif Headline: "Evolving" (far left) — "with you." (center-right beside inset) */}
          <h1
            id="about-hero-heading"
            className="lg:absolute lg:inset-x-10 lg:top-[52%] lg:-translate-y-1/2 grid grid-cols-1 lg:grid-cols-12 items-baseline gap-y-1"
          >
            <span className="lg:col-start-1 lg:col-span-5 font-serif-editorial text-[2.6rem] sm:text-[3.2rem] lg:text-[3.55rem] font-light leading-none tracking-[-0.028em] text-[#FBF9F5] drop-shadow-[0_2px_16px_rgba(18,22,32,0.34)]">
              {about.heroTitleLeft}
            </span>
            <span className="lg:col-start-7 lg:col-span-3 font-serif-editorial text-[2.6rem] sm:text-[3.2rem] lg:text-[3.55rem] font-light leading-none tracking-[-0.028em] text-[#FBF9F5] drop-shadow-[0_2px_16px_rgba(18,22,32,0.34)]">
              {about.heroTitleRight}
            </span>
          </h1>

          {/* Floating Right Still-Life Inset Card + Uppercase Micro Caption */}
          <figure
            ref={heroInsetRef}
            data-testid="about-hero-inset"
            className="mt-8 lg:mt-0 lg:absolute lg:right-10 lg:bottom-10 w-[235px] sm:w-[270px] lg:w-[295px] xl:w-[320px] self-end lg:self-auto"
          >
            <div className="aspect-[3/3.65] w-full overflow-hidden bg-[#574F47] shadow-[0_18px_48px_rgba(16,14,12,0.24)]">
              <img
                src={aboutHydrangeaInsetImg}
                alt="Fresh white hydrangeas in a glass bowl on a honed travertine stone table at NOVA"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <figcaption className="font-basel mt-3 text-[9.5px] sm:text-[10px] font-normal uppercase tracking-[0.045em] leading-[1.42] text-[#FBF9F5] drop-shadow-[0_1px_8px_rgba(16,14,12,0.55)]">
              {about.heroInsetCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 2. EDITORIAL PHILOSOPHY MANIFESTO & SANCTUARY ADDRESS (Matching reference `image_167c1f61.png`) */}
      <section
        data-testid="about-manifesto-section"
        aria-labelledby="about-manifesto-kicker"
        className="bg-[#FBF9F5] text-[#18224B] pt-14 pb-20 sm:pt-16 md:pt-20 md:pb-28 px-5 sm:px-6 md:px-10"
      >
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-8 items-start">
          {/* Far-Left Quiet Kicker */}
          <div className="lg:col-span-5 pt-1">
            <span
              id="about-manifesto-kicker"
              className="font-basel block text-[10.5px] font-normal uppercase tracking-[0.05em] text-[#18224B]"
            >
              {about.heroKicker}
            </span>
          </div>

          {/* Right Half: Indented Light Serif Manifesto + Sanctuary Address & Contact Details */}
          <div className="lg:col-start-7 lg:col-span-6">
            <p className="font-serif-editorial text-[1.6rem] sm:text-[1.95rem] lg:text-[2.15rem] xl:text-[2.32rem] font-light leading-[1.2] tracking-[-0.022em] text-[#18224B] md:indent-[4.5rem] lg:indent-[5.75rem]">
              <span className="font-brand text-[0.94em] tracking-[0.04em]">NOVA</span>{' '}
              {about.manifesto}
            </p>

            {/* Address & Direct Contact Details Directly Below Manifesto */}
            <div className="mt-12 md:mt-16 space-y-6 font-basel text-[13.5px] md:text-[14px] font-normal leading-[1.55] tracking-[-0.005em] text-[#18224B]">
              <address className="not-italic space-y-0.5">
                <a
                  href={contact.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block hover:opacity-65 transition-opacity"
                >
                  <span className="block">{contact.addressLine1}</span>
                  <span className="block">{contact.addressLine2}</span>
                </a>
              </address>

              <div className="space-y-0.5">
                <a
                  href={`mailto:${contact.email}`}
                  className="block w-fit hover:opacity-65 transition-opacity"
                >
                  {contact.email}
                </a>
                <a
                  href={contact.phoneHref}
                  className="block w-fit font-mono-tabular hover:opacity-65 transition-opacity"
                >
                  {contact.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUNDER & OWNER EDITORIAL SPREAD (Matching references `image_cd771dd9.png` & `image_a218be73.png`)
          Tall edited Owner portrait on left + flush sticky monochrome consultation frame gliding alongside it */}
      <section
        data-testid="about-founder-spread"
        aria-labelledby="about-founder-heading"
        className="bg-[#FBF9F5] text-[#18224B] pb-20 md:pb-28 px-4 sm:px-6 md:px-7"
      >
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-0 items-start lg:items-stretch">
          {/* Left Half: Tall Full-Height Editorial Portrait of the Founder & Owner */}
          <div className="lg:col-start-1 lg:col-span-6">
            <div className="relative aspect-[2/3] lg:aspect-auto lg:h-[144vh] lg:min-h-[1080px] lg:max-h-[1420px] w-full overflow-hidden bg-[#EAE6DF]">
              <img
                src={aboutOwnerPortraitImg}
                alt="Editorial portrait of the Founder and Owner of NOVA Unisex Salon seated beside the sunlit sanctuary lounge"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-[center_16%]"
              />
            </div>
          </div>

          {/* Center-Right: Flush Adjacent Monochrome Consultation Snapshot (sticks & glides along the portrait) */}
          <div className="lg:col-start-7 lg:col-span-2 relative">
            <div className="lg:sticky lg:top-[28vh]">
              <figure className="w-full max-w-[260px] lg:max-w-none">
                <div className="aspect-[4/4.65] w-full overflow-hidden bg-[#D9D9D9]">
                  <img
                    src={aboutConsultationBwImg}
                    alt="Monochrome editorial view of tailored hands sketching a bespoke beauty consultation dossier at NOVA"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-[56%_92%] scale-[1.92] origin-[56%_88%] grayscale contrast-[1.08]"
                  />
                </div>
              </figure>
            </div>
          </div>

          {/* Far-Right Editorial Breathing Space + Quiet Founder Attribution at Lower Anchor */}
          <div className="lg:col-start-9 lg:col-span-4 flex flex-col justify-end lg:pl-10 xl:pl-14 pt-2 lg:pt-0 lg:pb-2">
            <div className="max-w-[320px] space-y-4">
              <span className="font-basel block text-[10.5px] font-normal uppercase tracking-[0.06em] text-[#18224B]/70">
                {about.founder.label}
              </span>
              <h2
                id="about-founder-heading"
                className="font-serif-editorial text-[1.75rem] sm:text-[1.95rem] font-light leading-[1.15] tracking-[-0.022em] text-[#18224B]"
              >
                {about.founder.title}
              </h2>
              <p className="font-basel text-[13px] font-normal leading-[1.58] text-[#18224B]/82">
                {about.founder.bio}
              </p>
              <p className="font-basel text-[11px] uppercase tracking-[0.05em] text-[#18224B]/60 pt-1">
                {about.founder.specialty}
              </p>
              <div className="pt-3">
                <NavHoverLink
                  label="Book Consultation"
                  variant="header-light"
                  onClick={onOpenBooking}
                  className="text-[11px] tracking-[0.05em]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUIET SANCTUARY PILLARS & NEXT CHAPTER TRANSITION */}
      <section
        aria-label="Our Sanctuary Standards"
        className="bg-[#FBF9F5] text-[#18224B] border-t border-[#18224B]/12 py-16 md:py-24 px-5 sm:px-6 md:px-10"
      >
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-8 items-start">
          <div className="lg:col-span-3">
            <span className="font-basel block text-[10.5px] font-normal uppercase tracking-[0.05em] text-[#18224B]">
              The Sanctuary
            </span>
          </div>

          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {about.atmosphereHighlights.map((item, idx) => (
                <div key={item.label} className="space-y-3">
                  <span className="font-mono-tabular block text-[11px] text-[#18224B]/55">
                    ({idx + 1}).
                  </span>
                  <h3 className="font-serif-editorial text-[1.45rem] font-light leading-[1.2] tracking-[-0.02em] text-[#18224B]">
                    {item.label}
                  </h3>
                  <p className="font-basel text-[13.5px] leading-[1.55] text-[#18224B]/80">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-14 pt-8 border-t border-[#18224B]/12 flex flex-wrap items-center justify-between gap-6 pl-3">
              {onNavigateTreatments && (
                <NavHoverLink
                  label="Explore Treatments"
                  variant="header-light"
                  onClick={onNavigateTreatments}
                  className="text-[11px] tracking-[0.05em]"
                />
              )}
              <NavHoverLink
                label="Reserve a Private Consultation"
                variant="header-light"
                onClick={onOpenBooking}
                className="text-[11px] tracking-[0.05em]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
