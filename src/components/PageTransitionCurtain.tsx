import React, { useLayoutEffect } from 'react';
import gsap from 'gsap';
import type { TransitionPhase } from '../utils/pageTransition';

interface PageTransitionCurtainProps {
  curtainRef: React.RefObject<HTMLDivElement | null>;
  phase: TransitionPhase;
}

/**
 * Full-viewport warm alabaster (#FBF9F5) rising architectural sheet that wipes
 * cleanly upward from the bottom edge during cross-page navigation (Odyssée style),
 * matching the crisp horizontal horizon curtain transition.
 *
 * Transform is owned exclusively by GSAP (initialized off-screen on mount)
 * so React phase re-renders never overwrite the in-flight animation.
 */
export const PageTransitionCurtain: React.FC<PageTransitionCurtainProps> = ({
  curtainRef,
  phase,
}) => {
  const isActive = phase !== 'idle';

  useLayoutEffect(() => {
    if (curtainRef.current) {
      gsap.set(curtainRef.current, { yPercent: 100 });
    }
  }, [curtainRef]);

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      data-testid="page-transition-curtain"
      data-transition-phase={phase}
      className={`fixed inset-0 z-[60] bg-[#FBF9F5] will-change-transform ${
        isActive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    />
  );
};
