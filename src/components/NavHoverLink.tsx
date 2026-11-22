import React from 'react';

export type NavHoverVariant = 'hero' | 'header-light' | 'header-dark-video';

interface NavHoverLinkProps {
  label: string;
  onClick: () => void;
  isActive?: boolean;
  variant: NavHoverVariant;
  className?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

/**
 * Odyssée-inspired navigation link interaction for NOVA:
 * - Zero layout shift: crisp solid circular dot blooms cleanly to the left (-left-3.5)
 *   on hover, keyboard focus, or active route.
 * - Hero variant: transitions smoothly from luminous ivory (#FBF9F5) to deep
 *   midnight navy (#18224B) with a solid #18224B dot.
 */
export const NavHoverLink: React.FC<NavHoverLinkProps> = ({
  label,
  onClick,
  isActive = false,
  variant,
  className = '',
  ariaExpanded,
  ariaControls,
}) => {
  const colorClasses =
    variant === 'hero'
      ? isActive
        ? 'text-[#18224B] [text-shadow:none]'
        : 'text-[#FBF9F5] [text-shadow:0_1px_10px_rgba(0,0,0,0.28)] hover:text-[#18224B] hover:[text-shadow:none] focus-visible:text-[#18224B] focus-visible:[text-shadow:none]'
      : variant === 'header-dark-video'
        ? isActive
          ? 'text-[#E8D5B5]'
          : 'text-[#FBF9F5]/90 hover:text-[#E8D5B5] focus-visible:text-[#E8D5B5]'
        : isActive
          ? 'text-[#18224B] font-medium'
          : 'text-[#18224B]/75 hover:text-[#18224B] focus-visible:text-[#18224B]';

  const dotColorClass =
    variant === 'header-dark-video' ? 'bg-[#E8D5B5]' : 'bg-[#18224B]';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      data-nav-active={isActive ? 'true' : 'false'}
      className={`group/nav relative inline-flex items-center font-basel cursor-pointer py-1 uppercase whitespace-nowrap shrink-0 transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#18224B] ${colorClasses} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -left-3.5 top-1/2 -translate-y-1/2 h-[5.5px] w-[5.5px] rounded-full ${dotColorClass} transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isActive
            ? 'opacity-100 scale-100 translate-x-0'
            : 'opacity-0 scale-0 -translate-x-1 group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:translate-x-0 group-focus-visible/nav:opacity-100 group-focus-visible/nav:scale-100 group-focus-visible/nav:translate-x-0'
        }`}
      />
      <span>{label}</span>
    </button>
  );
};
