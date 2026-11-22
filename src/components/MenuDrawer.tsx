import React, { useEffect, useState } from 'react';
import { SALON_CONFIG } from '../data/salonData';
import type { ActivePage } from './Header';

interface MenuDrawerProps {
  isOpen: boolean;
  activePage: ActivePage;
  onClose: () => void;
  onNavigatePage: (page: ActivePage, sectionId?: string) => void;
  onOpenBooking: () => void;
}

interface MenuLinkItem {
  number: string;
  label: string;
  isCurrent?: boolean;
  onSelect: () => void;
}

/**
 * Editorial Right-Side Slide-Over Menu Drawer (Odyssée-Inspired for NOVA)
 * - Frosted, soft-blurred full-viewport alabaster backdrop
 * - Right-aligned alabaster sheet with top-left CLOSE control
 * - Numbered (1. - 5.) editorial serif navigation
 * - Paired vertical salon portrait & concise craft philosophy
 * - Flush midnight-navy (#18224B) contact directory (A. / C. / S.)
 */
export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  activePage,
  onClose,
  onNavigatePage,
  onOpenBooking,
}) => {
  const [rendered, setRendered] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      let raf2 = 0;
      const raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      const fallbackTimer = window.setTimeout(() => {
        setVisible(true);
      }, 60);
      return () => {
        window.cancelAnimationFrame(raf1);
        if (raf2) window.cancelAnimationFrame(raf2);
        window.clearTimeout(fallbackTimer);
      };
    }

    setVisible(false);
    const timer = window.setTimeout(() => {
      setRendered(false);
    }, 420);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!rendered) return null;

  const { contact } = SALON_CONFIG;

  const navItems: MenuLinkItem[] = [
    {
      number: '1.',
      label: 'Home',
      isCurrent: activePage === 'home',
      onSelect: () => {
        onClose();
        onNavigatePage('home');
      },
    },
    {
      number: '2.',
      label: 'Treatments',
      isCurrent: activePage === 'treatments',
      onSelect: () => {
        onClose();
        onNavigatePage('treatments');
      },
    },
    {
      number: '3.',
      label: 'Concerns',
      onSelect: () => {
        onClose();
        onNavigatePage('home', 'our-approach');
      },
    },
    {
      number: '4.',
      label: 'About',
      isCurrent: activePage === 'about',
      onSelect: () => {
        onClose();
        onNavigatePage('about');
      },
    },
    {
      number: '5.',
      label: 'Book Consultation',
      onSelect: () => {
        onClose();
        onOpenBooking();
      },
    },
  ];

  return (
    <div
      id="nova-menu-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Nova Site Menu"
      data-testid="nova-menu-drawer"
      data-state={visible ? 'open' : 'closing'}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Frosted, Soft-Blurred Alabaster Backdrop */}
      <button
        type="button"
        aria-label="Close navigation menu backdrop"
        onClick={onClose}
        className={`absolute inset-0 h-full w-full cursor-default bg-[#FBF9F5]/62 backdrop-blur-xl transition-opacity duration-400 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Right-Side Editorial Sheet */}
      <aside
        className={`absolute inset-y-0 right-0 md:right-5 w-full max-w-[392px] bg-[#FBF9F5] text-[#18224B] shadow-[-18px_0_48px_rgba(24,34,75,0.07)] flex flex-col justify-between overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top + Middle Editorial Zone */}
        <div className="flex flex-1 flex-col justify-between px-6 sm:px-7 pt-5 pb-7 gap-10">
          <div>
            {/* Top-Left Minimalist CLOSE Control */}
            <div className="flex items-center justify-between pb-10 sm:pb-12">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="font-basel cursor-pointer py-1 text-[11px] font-normal uppercase tracking-[0.06em] text-[#18224B] hover:opacity-55 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#18224B] whitespace-nowrap shrink-0"
              >
                Close
              </button>
            </div>

            {/* Numbered Editorial Serif Navigation (1. - 5.) */}
            <nav aria-label="Menu Overlay Navigation" className="space-y-1.5">
              {navItems.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onSelect}
                  style={{
                    transitionDelay: visible ? `${60 + index * 35}ms` : '0ms',
                  }}
                  className={`group cursor-pointer w-full grid grid-cols-[2.2rem_1fr] items-baseline text-left py-0.5 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18224B] ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                >
                  <span className="font-basel text-[10.5px] tabular-nums text-[#18224B]/65 group-hover:text-[#18224B] transition-colors">
                    {item.number}
                  </span>
                  <span className="font-serif-editorial text-[1.72rem] sm:text-[1.82rem] font-light leading-[1.22] tracking-[-0.022em] text-[#18224B] inline-flex items-center gap-2.5 group-hover:opacity-65 group-hover:translate-x-1 transition-all duration-300">
                    <span>{item.label}</span>
                    {item.isCurrent && (
                      <span
                        aria-hidden="true"
                        className="inline-block h-1.5 w-1.5 rounded-full bg-[#18224B]/55"
                      />
                    )}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Paired Vertical Salon Portrait + Concise Philosophy Statement */}
          <div className="grid grid-cols-[106px_1fr] gap-4 items-start pt-4">
            <div className="aspect-[3/4.1] w-[106px] overflow-hidden bg-[#EAE6DF] shrink-0">
              <img
                src="/images/nova-intro-portrait.jpg"
                alt="Serene NOVA beauty editorial portrait"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <p className="font-basel text-[12.5px] font-normal leading-[1.52] tracking-[-0.008em] text-[#18224B] pt-0.5 pr-1">
              We take a craft-led approach to timeless beauty, skin health, and restorative personal care.
            </p>
          </div>
        </div>

        {/* Bottom Solid Midnight-Navy Contact Card (A. / C. / S.) */}
        <div className="bg-[#18224B] text-[#FBF9F5] px-6 sm:px-7 py-7">
          <dl className="space-y-4 font-basel text-[12px] font-normal leading-[1.52]">
            {/* Address */}
            <div className="grid grid-cols-[2.75rem_1fr] items-start">
              <dt className="text-[#FBF9F5]/85">
                <abbr title="Address" className="no-underline">
                  A.
                </abbr>
              </dt>
              <dd className="space-y-0.5 text-[#FBF9F5]/95">
                <p>Nova Unisex Salon, Kingship by Kahlon</p>
                <p>UGF 04, 12A, Sector 16, Vrindavan Colony, Lucknow</p>
                <p className="pt-0.5">
                  <a
                    href={contact.directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-[#FBF9F5]/45 underline-offset-4 hover:decoration-[#FBF9F5] transition-colors"
                  >
                    Get Directions
                  </a>
                </p>
              </dd>
            </div>

            {/* Communication */}
            <div className="grid grid-cols-[2.75rem_1fr] items-start">
              <dt className="text-[#FBF9F5]/85">
                <abbr title="Communication" className="no-underline">
                  C.
                </abbr>
              </dt>
              <dd className="space-y-0.5 text-[#FBF9F5]/95">
                <p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {contact.email}
                  </a>
                </p>
                <p>
                  <a
                    href={contact.phoneHref}
                    className="font-mono-tabular text-[11.5px] hover:opacity-70 transition-opacity"
                  >
                    {contact.phoneDisplay}
                  </a>
                </p>
              </dd>
            </div>

            {/* Social Media */}
            <div className="grid grid-cols-[2.75rem_1fr] items-start">
              <dt className="text-[#FBF9F5]/85">
                <abbr title="Social media" className="no-underline">
                  S.
                </abbr>
              </dt>
              <dd className="flex items-center gap-1.5 text-[#FBF9F5]/95">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                >
                  Instagram
                </button>
                <span aria-hidden="true" className="text-[#FBF9F5]/45">
                  /
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                >
                  Gift Cards
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
};
