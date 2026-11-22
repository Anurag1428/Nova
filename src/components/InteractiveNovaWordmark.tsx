import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  getNovaWordmarkPose,
  NovaInteractionMode,
} from '../utils/wordmarkMotion';

interface InteractiveNovaWordmarkProps {
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  /** Color of O & V during interaction (warm champagne on dark hero, antique gold on light header) */
  accentColor?: string;
  testId?: string;
}

/**
 * Interactive "NOVA" brand wordmark where O (pearl) and V (cradle) physically
 * respond and play off each other on hover:
 * - Hovering the wordmark rolls O clockwise into V's cradle with an elastic bounce & star glint
 * - Hovering directly over O nudges V like Newton's cradle
 * - Hovering directly over V tilts V to toss O into a buoyant arc
 */
export const InteractiveNovaWordmark: React.FC<InteractiveNovaWordmarkProps> = ({
  onClick,
  className = '',
  accentColor = '#E8D5B5',
  testId = 'nova-wordmark',
}) => {
  const [mode, setMode] = useState<NovaInteractionMode>('idle');
  const nRef = useRef<HTMLSpanElement | null>(null);
  const oRef = useRef<HTMLSpanElement | null>(null);
  const vRef = useRef<HTMLSpanElement | null>(null);
  const aRef = useRef<HTMLSpanElement | null>(null);
  const sparkleRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pose = getNovaWordmarkPose(mode, prefersReduced);
    const isIdle = mode === 'idle';
    const isBump = mode === 'o-nudge' || mode === 'v-lift';

    const letterEase = isIdle
      ? 'power3.out'
      : isBump
        ? 'elastic.out(1, 0.48)'
        : 'back.out(1.7)';
    const duration = prefersReduced ? 0.2 : isIdle ? 0.55 : isBump ? 0.72 : 0.6;

    const entries: Array<[HTMLSpanElement | null, typeof pose.N]> = [
      [nRef.current, pose.N],
      [oRef.current, pose.O],
      [vRef.current, pose.V],
      [aRef.current, pose.A],
    ];

    entries.forEach(([el, target], idx) => {
      if (!el) return;
      gsap.killTweensOf(el);
      gsap.to(el, {
        x: target.x,
        y: target.y,
        rotation: target.rotate,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        duration: idx === 1 || idx === 2 ? duration : duration * 0.85,
        ease: idx === 1 || idx === 2 ? letterEase : 'power3.out',
        overwrite: 'auto',
      });
    });

    if (sparkleRef.current) {
      gsap.killTweensOf(sparkleRef.current);
      gsap.to(sparkleRef.current, {
        opacity: pose.sparkle.opacity,
        scale: pose.sparkle.scale,
        rotation: pose.sparkle.rotate,
        y: pose.sparkle.y,
        duration: isIdle ? 0.3 : 0.45,
        ease: isIdle ? 'power2.out' : 'back.out(2)',
        overwrite: 'auto',
      });
    }
  }, [mode]);

  const isInteracting = mode !== 'idle';

  return (
    <a
      href="#top"
      aria-label="NOVA"
      data-testid={testId}
      data-interaction-state={mode}
      onClick={onClick}
      onMouseEnter={() => setMode((prev) => (prev === 'idle' ? 'word' : prev))}
      onMouseLeave={() => setMode('idle')}
      onFocus={() => setMode('word')}
      onBlur={() => setMode('idle')}
      className={`group relative inline-flex items-baseline gap-[0.08em] tracking-normal select-none whitespace-nowrap shrink-0 cursor-pointer ${className}`}
    >
      <span
        ref={nRef}
        aria-hidden="true"
        className="inline-block"
      >
        N
      </span>

      {/* Interactive O + V Kinetic Duo */}
      <span className="relative inline-flex items-baseline gap-[0.08em]">
        <span
          ref={oRef}
          aria-hidden="true"
          data-testid={`${testId}-o`}
          onMouseEnter={() => setMode('o-nudge')}
          onMouseLeave={() => setMode('word')}
          style={isInteracting ? { color: accentColor } : undefined}
          className="inline-block origin-center"
        >
          O
        </span>

        {/* Delicate 4-point star glint that blooms when O and V meet */}
        <span
          ref={sparkleRef}
          aria-hidden="true"
          style={{ color: accentColor }}
          className="pointer-events-none absolute left-1/2 -top-2 -translate-x-1/2 opacity-0"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="drop-shadow-[0_0_6px_rgba(232,213,181,0.75)]"
          >
            <path d="M8 0L9.75 6.25L16 8L9.75 9.75L8 16L6.25 9.75L0 8L6.25 6.25L8 0Z" />
          </svg>
        </span>

        <span
          ref={vRef}
          aria-hidden="true"
          data-testid={`${testId}-v`}
          onMouseEnter={() => setMode('v-lift')}
          onMouseLeave={() => setMode('word')}
          style={isInteracting ? { color: accentColor } : undefined}
          className="inline-block origin-bottom"
        >
          V
        </span>
      </span>

      <span
        ref={aRef}
        aria-hidden="true"
        className="inline-block"
      >
        A
      </span>
    </a>
  );
};
