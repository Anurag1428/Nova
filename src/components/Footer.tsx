import React from 'react';
import { SALON_CONFIG } from '../data/salonData';
import { ActivePage } from './Header';
import { RollingMarble } from './RollingMarble';
import { NavHoverLink } from './NavHoverLink';

interface FooterProps {
  onOpenBooking: () => void;
  onNavigatePage: (page: ActivePage, sectionId?: string) => void;
  onOpenConciergeLedger?: () => void;
}

/**
 * Section 12: SIGNATURE ODYSSÉE-INSPIRED FOOTER + ROLLING MARBLE ENGRAVED WITH "HERSHITA"
 * Matches `odyssee-footer.png` and `odyssee-marble-bottom.png`:
 * - Upper section on warm alabaster (#FBF9F5) with midnight navy (#18224B) contact & hours tables
 * - Lower full-bleed studio cyclorama with the rolling pearlescent marble sphere engraved with HERSHITA
 */
export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onNavigatePage, onOpenConciergeLedger }) => {
  const { brand, contact } = SALON_CONFIG;

  return (
    <footer
      role="contentinfo"
      className="bg-[#FBF9F5] text-[#18224B] pt-20"
    >
      {/* Upper White/Alabaster Contact & Hours Architecture (Matching odyssee-footer.png) */}
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 pb-8">
        <p className="font-serif-editorial text-xl md:text-2xl font-light tracking-[-0.022em] text-[#18224B] mb-16">
          {brand.shortTagline}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-20 text-[13px] leading-[1.6]">
          {/* Left Column: Contact Details Table (A. / C. / S.) */}
          <div className="md:col-span-4 lg:col-span-3">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Contact details</caption>
              <tbody className="align-top">
                <tr>
                  <th
                    scope="row"
                    aria-label="Address"
                    className="pb-6 pr-6 font-normal text-[#18224B] w-10"
                  >
                    A.
                  </th>
                  <td className="pb-6 text-[#18224B]">
                    <p>{contact.addressLine1}</p>
                    <p>{contact.addressLine2}</p>
                    <p className="mt-0.5">
                      <a
                        href={contact.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-65 transition-opacity"
                      >
                        Get Directions
                      </a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <th
                    scope="row"
                    aria-label="Communication"
                    className="pb-6 pr-6 font-normal text-[#18224B] w-10"
                  >
                    C.
                  </th>
                  <td className="pb-6 text-[#18224B]">
                    <p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:opacity-65 transition-opacity"
                      >
                        {contact.email}
                      </a>
                    </p>
                    <p>
                      <a
                        href={contact.phoneHref}
                        className="hover:opacity-65 transition-opacity"
                      >
                        {contact.phoneDisplay}
                      </a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <th
                    scope="row"
                    aria-label="Social media"
                    className=" pr-6 font-normal text-[#18224B] w-10"
                  >
                    S.
                  </th>
                  <td className="text-[#18224B]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {contact.socials.map((soc, idx) => (
                        <React.Fragment key={soc.label}>
                          {idx > 0 && <span aria-hidden="true">/</span>}
                          <button
                            type="button"
                            onClick={onOpenBooking}
                            className="cursor-pointer hover:opacity-65 transition-opacity"
                          >
                            {soc.label}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Middle Column: Weekly Opening Hours Table (Mo - Su) */}
          <div className="md:col-span-5 lg:col-span-4">
            <table className="w-full max-w-[260px] text-left border-collapse">
              <caption className="sr-only">Opening hours (IST)</caption>
              <tbody>
                {contact.hours.map((row, idx) => {
                  const isSunday = idx === contact.hours.length - 1;
                  return (
                    <tr
                      key={row.days}
                      className={isSunday ? 'text-[#18224B]' : 'text-[#18224B]/35'}
                    >
                      <th scope="row" className="py-0.5 pr-8 font-normal">
                        {row.days}
                      </th>
                      <td className="py-0.5 font-mono-tabular">
                        {row.time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Column: Quick Directory Links */}
          <div className="md:col-span-3 lg:col-span-5 flex flex-col items-start md:items-end justify-between">
            <div className="flex flex-wrap gap-7 pl-3 text-xs uppercase tracking-[0.12em]">
              <NavHoverLink
                label="Home"
                variant="header-light"
                onClick={() => onNavigatePage('home')}
                className="text-xs tracking-[0.12em]"
              />
              <NavHoverLink
                label="Treatments"
                variant="header-light"
                onClick={() => onNavigatePage('treatments')}
                className="text-xs tracking-[0.12em]"
              />
              <NavHoverLink
                label="About"
                variant="header-light"
                onClick={() => onNavigatePage('about')}
                className="text-xs tracking-[0.12em]"
              />
              <NavHoverLink
                label="Book Consultation"
                variant="header-light"
                onClick={onOpenBooking}
                className="text-xs tracking-[0.12em] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bottom Metadata Row above the Rolling Marble */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 text-xs pt-4">
          <div className="sm:col-span-3 text-[#18224B]">
            ©2026 <span className="font-brand tracking-[0.06em]">{brand.name}</span> Unisex Salon
          </div>
          <div className="sm:col-span-4 font-basel text-[11px] uppercase tracking-[0.04em] text-[#18224B] flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#E11D24]" aria-hidden="true" />
            <span>10:00AM – 9:00PM · LUCKNOW, UP</span>
          </div>
          <div className="sm:col-span-5 flex flex-wrap sm:justify-end gap-6 sm:gap-8 text-[#18224B]/35">
            {onOpenConciergeLedger && (
              <button
                type="button"
                onClick={onOpenConciergeLedger}
                className="cursor-pointer text-[#9E7F4F] hover:text-[#18224B] transition-colors inline-flex items-center gap-1.5 font-medium"
                title="Open Reception Concierge Desk & Abandoned Leads Ledger (Shortcut: Ctrl+Shift+L)"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Concierge Desk</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenBooking}
              className="cursor-pointer hover:text-[#18224B] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={onOpenBooking}
              className="cursor-pointer hover:text-[#18224B] transition-colors"
            >
              Terms of Use
            </button>
            <span>{brand.subBrand}</span>
          </div>
        </div>
      </div>

      {/* THE ROLLING MARBLE SCENE AT THE BOTTOM OF THE WEBSITE (Engraved with HERSHITA) */}
      <RollingMarble brandText={brand.name} onBookClick={onOpenBooking} />

      {/* Creator Trademark Signature Bar at the very end of the website */}
      <div
        data-testid="creator-trademark"
        className="border-t border-[#18224B]/10 bg-[#FBF9F5] text-[#18224B]"
      >
        <div className="mx-auto max-w-[1440px] px-5 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono-tabular text-[10px] uppercase tracking-[0.18em] text-[#18224B]/45">
            {brand.creatorRole}
          </span>
          <p className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.16em] text-[#18224B]/60">
            <span className="hidden sm:inline-block h-px w-6 bg-[#18224B]/20" aria-hidden="true" />
            <span>{brand.creatorPrefix}</span>
            <span className="font-serif-editorial normal-case text-[17px] leading-none tracking-[0.01em] text-[#18224B]">
              {brand.creatorName}
              <sup className="font-basel text-[10px] tracking-normal ml-0.5 text-[#18224B]/70">
                {brand.creatorTrademark}
              </sup>
            </span>
            <span className="hidden sm:inline-block h-px w-6 bg-[#18224B]/20" aria-hidden="true" />
          </p>
        </div>
      </div>
    </footer>
  );
};
