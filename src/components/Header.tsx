import React, { useEffect, useState } from 'react';
import { InteractiveNovaWordmark } from './InteractiveNovaWordmark';
import { MenuDrawer } from './MenuDrawer';
import { NavHoverLink } from './NavHoverLink';

export type ActivePage = 'home' | 'treatments' | 'about';

interface HeaderProps {
  activePage: ActivePage;
  onNavigatePage: (page: ActivePage, sectionId?: string) => void;
  onOpenBooking: (categoryId?: string, ritualId?: string) => void;
  bookingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigatePage,
  onOpenBooking,
  bookingCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverHeroMedia, setIsOverHeroMedia] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Home: transition into compact white top header after both full-screen hero stages
      setIsScrolled(window.scrollY > window.innerHeight * 1.88);
      // Treatments & About: stay transparent ivory while over their full-bleed opening hero media
      const overTreatmentsHero =
        activePage === 'treatments' && window.scrollY < window.innerHeight * 1.78;
      const overAboutHero =
        activePage === 'about' && window.scrollY < window.innerHeight * 0.86;
      setIsOverHeroMedia(overTreatmentsHero || overAboutHero);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePage]);

  const showCompactBar = isScrolled || activePage !== 'home';
  const useLightOverVideo =
    (activePage === 'treatments' || activePage === 'about') && isOverHeroMedia;

  const handleLinkClick = (page: ActivePage, sectionId?: string) => {
    setMenuOpen(false);
    onNavigatePage(page, sectionId);
  };

  return (
    <>
      {/* Odyssée-Inspired Minimalist Sticky Top Bar
          Follows 3-Zone Contract: Brand Wordmark — Clean Text Links — Primary Action */}
      <header
        aria-label="Primary Sticky Navigation"
        className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-8 px-6 md:px-10 py-4 transition-all duration-500 ${
          showCompactBar
            ? useLightOverVideo
              ? 'translate-y-0 opacity-100 bg-gradient-to-b from-[#121620]/45 via-[#121620]/15 to-transparent text-[#FBF9F5]'
              : 'translate-y-0 opacity-100 bg-[#FBF9F5]/95 backdrop-blur-md text-[#18224B]'
            : 'pointer-events-none -translate-y-3 opacity-0 bg-transparent text-[#FBF9F5]'
        }`}
      >
        {/* Zone 1: NOVA Editorial Wordmark */}
        <InteractiveNovaWordmark
          testId="header-nova-wordmark"
          accentColor={useLightOverVideo ? '#E8D5B5' : '#9E7F4F'}
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home');
          }}
          className={`font-brand text-2xl md:text-[1.75rem] font-normal focus-visible:outline-2 focus-visible:outline-offset-4 transition-colors duration-300 ${
            useLightOverVideo ? 'text-[#FBF9F5]' : 'text-[#18224B]'
          }`}
        />

        {/* Zone 2: Minimalist uppercase navigation links in Basel Grotesk with Hover Dot */}
        <nav
          aria-label="Main Navigation"
          className="font-basel hidden md:flex items-center gap-10 pl-3 text-[11px] font-normal tracking-[0.05em] uppercase"
        >
          <NavHoverLink
            label="Menu"
            variant={useLightOverVideo ? 'header-dark-video' : 'header-light'}
            isActive={menuOpen}
            ariaExpanded={menuOpen}
            ariaControls="nova-menu-panel"
            onClick={() => setMenuOpen(true)}
          />
          <NavHoverLink
            label="Treatments"
            variant={useLightOverVideo ? 'header-dark-video' : 'header-light'}
            isActive={activePage === 'treatments'}
            onClick={() => handleLinkClick('treatments')}
          />
          <NavHoverLink
            label="Concerns"
            variant={useLightOverVideo ? 'header-dark-video' : 'header-light'}
            onClick={() => handleLinkClick('home', 'our-approach')}
          />
          <NavHoverLink
            label="About"
            variant={useLightOverVideo ? 'header-dark-video' : 'header-light'}
            isActive={activePage === 'about'}
            onClick={() => handleLinkClick('about')}
          />
        </nav>

        {/* Zone 3: Primary Action in Basel Grotesk */}
        <div className="font-basel flex items-center gap-5 shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            className={`font-basel md:hidden cursor-pointer px-2.5 py-1.5 text-[11px] uppercase tracking-[0.04em] whitespace-nowrap shrink-0 transition-colors duration-300 ${
              useLightOverVideo ? 'text-[#FBF9F5]' : 'text-[#18224B]'
            }`}
          >
            Menu
          </button>
          <NavHoverLink
            label={bookingCount > 0 ? `Book Consultation (${bookingCount})` : 'Book Consultation'}
            variant={useLightOverVideo ? 'header-dark-video' : 'header-light'}
            onClick={() => onOpenBooking()}
            className="text-[11px] tracking-[0.05em]"
          />
        </div>
      </header>

      {/* Right-Side Frosted Editorial Menu Drawer */}
      <MenuDrawer
        isOpen={menuOpen}
        activePage={activePage}
        onClose={() => setMenuOpen(false)}
        onNavigatePage={onNavigatePage}
        onOpenBooking={() => onOpenBooking()}
      />
    </>
  );
};
