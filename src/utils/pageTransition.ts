import type { ActivePage } from '../components/Header';

export type TransitionPhase = 'idle' | 'rising' | 'swapping' | 'revealing';

export interface PageTransitionTimings {
  riseDuration: number;
  holdDuration: number;
  revealDuration: number;
}

export const PAGE_TRANSITION_TIMINGS: PageTransitionTimings = {
  riseDuration: 0.62,
  holdDuration: 0.06,
  revealDuration: 0.64,
};

/**
 * Determines whether navigating from `currentPage` to `nextPage` should run
 * the rising warm-alabaster curtain wipe transition.
 */
export function shouldAnimatePageTransition(
  currentPage: ActivePage,
  nextPage: ActivePage,
  reducedMotion = false
): boolean {
  if (reducedMotion) return false;
  return currentPage !== nextPage;
}

export function getPageTransitionTimings(): PageTransitionTimings {
  return { ...PAGE_TRANSITION_TIMINGS };
}
