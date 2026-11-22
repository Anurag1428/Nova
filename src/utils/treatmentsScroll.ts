export type TreatmentsAnchorId = 'treatments' | 'modalities' | 'aftercare';

export interface TreatmentsHeroVisualState {
  headlineOpacity: number;
  headlineBlurPx: number;
  manifestoOpacity: number;
  manifestoY: number;
}

export interface TreatmentsSectionStatus {
  activeAnchor: TreatmentsAnchorId;
  isOverDarkMedia: boolean;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Maps scroll progress (0..1) through the Treatments opening video hero into
 * the signature Odyssée dissolve:
 * - 0.00 -> 0.25: Crisp split headline ("Guided by craft" / "refined through care.")
 * - 0.25 -> 0.72: Split headline softens/blurs back while right-aligned manifesto rises cleanly
 * - 0.72 -> 1.00: Manifesto holds legible focus before alabaster modalities enter
 */
export function resolveTreatmentsHeroStage(
  rawProgress: number,
  reducedMotion = false
): TreatmentsHeroVisualState {
  const p = clamp01(rawProgress);

  if (reducedMotion) {
    return {
      headlineOpacity: p < 0.45 ? 1 : 0.35,
      headlineBlurPx: 0,
      manifestoOpacity: p < 0.35 ? 0 : 1,
      manifestoY: 0,
    };
  }

  const dissolve = clamp01((p - 0.14) / 0.42);
  const manifestoIn = clamp01((p - 0.24) / 0.38);

  return {
    headlineOpacity: Number((1 - dissolve * 0.72).toFixed(3)),
    headlineBlurPx: Number((dissolve * 3.5).toFixed(2)),
    manifestoOpacity: Number(manifestoIn.toFixed(3)),
    manifestoY: Number(((1 - manifestoIn) * 34).toFixed(1)),
  };
}

/**
 * Determines which bottom-left chapter anchor is active and whether floating
 * chrome (bottom-left index) currently sits over dark photography/video.
 */
export function resolveActiveTreatmentsSection(
  scrollY: number,
  bounds: {
    heroHeight: number;
    aftercareTop: number;
    aftercareBottom: number;
  },
  viewportHeight: number
): TreatmentsSectionStatus {
  const probeY = scrollY + viewportHeight * 0.55;
  const bottomNavY = scrollY + viewportHeight - 48;

  if (probeY < bounds.heroHeight) {
    return {
      activeAnchor: 'treatments',
      isOverDarkMedia: bottomNavY < bounds.heroHeight,
    };
  }

  if (probeY >= bounds.aftercareTop) {
    return {
      activeAnchor: 'aftercare',
      isOverDarkMedia:
        bottomNavY >= bounds.aftercareTop && bottomNavY <= bounds.aftercareBottom,
    };
  }

  return {
    activeAnchor: 'modalities',
    isOverDarkMedia:
      bottomNavY >= bounds.aftercareTop && bottomNavY <= bounds.aftercareBottom,
  };
}

export interface ModalitySlideState {
  index: number;
  opacity: number;
  scale: number;
  translateYPercent: number;
  clipTopPercent: number;
  blurPx: number;
  featherProgress: number;
  zIndex: number;
  isVisible: boolean;
  role: 'vanished' | 'active' | 'outgoing' | 'incoming' | 'upcoming';
}

export interface ModalityDeckState {
  activeIndex: number;
  transitionProgress: number;
  slides: ModalitySlideState[];
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Resolves continuous scroll progress (0..1) across the Treatments modalities
 * sticky deck into per-slide visual transforms where each right-hand video/image
 * scrolls into the previous one while the outgoing frame recedes, softens, and vanishes.
 */
export function resolveModalityDeckState(
  rawProgress: number,
  count: number,
  reducedMotion = false
): ModalityDeckState {
  if (count <= 0) {
    return { activeIndex: 0, transitionProgress: 0, slides: [] };
  }
  if (count === 1) {
    return {
      activeIndex: 0,
      transitionProgress: 0,
      slides: [
        {
          index: 0,
          opacity: 1,
          scale: 1,
          translateYPercent: 0,
          clipTopPercent: 0,
          blurPx: 0,
          featherProgress: 0,
          zIndex: 1,
          isVisible: true,
          role: 'active',
        },
      ],
    };
  }

  const p = clamp01(rawProgress);
  const scaled = p * (count - 1);
  const baseIndex = Math.min(count - 2, Math.floor(scaled));
  const localT = clamp01(scaled - baseIndex);

  // Brief editorial hold at the start of each chapter before the next visual flows in
  const HOLD_PORTION = 0.16;
  const rawU = localT <= HOLD_PORTION ? 0 : clamp01((localT - HOLD_PORTION) / (1 - HOLD_PORTION));
  const u = smoothstep(rawU);

  const activeIndex = u >= 0.48 ? baseIndex + 1 : baseIndex;
  const slides: ModalitySlideState[] = [];

  for (let i = 0; i < count; i++) {
    if (i < baseIndex) {
      slides.push({
        index: i,
        opacity: 0,
        scale: reducedMotion ? 1 : 0.86,
        translateYPercent: reducedMotion ? 0 : -7,
        clipTopPercent: 0,
        blurPx: reducedMotion ? 0 : 10,
        featherProgress: 0,
        zIndex: i + 1,
        isVisible: false,
        role: 'vanished',
      });
      continue;
    }

    if (i === baseIndex) {
      if (u <= 0.001) {
        slides.push({
          index: i,
          opacity: 1,
          scale: 1,
          translateYPercent: 0,
          clipTopPercent: 0,
          blurPx: 0,
          featherProgress: 0,
          zIndex: i + 1,
          isVisible: true,
          role: 'active',
        });
      } else {
        const outgoingOpacity = reducedMotion
          ? Number((1 - u).toFixed(3))
          : Number(Math.max(0, 1 - Math.pow(u, 1.15)).toFixed(3));
        slides.push({
          index: i,
          opacity: outgoingOpacity,
          scale: reducedMotion ? 1 : Number((1 - u * 0.14).toFixed(4)),
          translateYPercent: reducedMotion ? 0 : Number((-u * 7).toFixed(2)),
          clipTopPercent: 0,
          blurPx: reducedMotion ? 0 : Number((u * 10).toFixed(2)),
          featherProgress: 0,
          zIndex: i + 1,
          isVisible: outgoingOpacity > 0.005,
          role: outgoingOpacity <= 0.005 ? 'vanished' : 'outgoing',
        });
      }
      continue;
    }

    if (i === baseIndex + 1) {
      if (u <= 0.001) {
        slides.push({
          index: i,
          opacity: 0,
          scale: reducedMotion ? 1 : 1.09,
          translateYPercent: reducedMotion ? 0 : 14,
          clipTopPercent: reducedMotion ? 0 : 100,
          blurPx: reducedMotion ? 0 : 3.5,
          featherProgress: 0,
          zIndex: i + 1,
          isVisible: false,
          role: 'upcoming',
        });
      } else {
        const incomingOpacity = reducedMotion
          ? Number(u.toFixed(3))
          : Number(Math.min(1, 0.22 + u * 0.96).toFixed(3));
        const isSettled = u >= 0.995;
        slides.push({
          index: i,
          opacity: isSettled ? 1 : incomingOpacity,
          scale: reducedMotion || isSettled ? 1 : Number((1.09 - u * 0.09).toFixed(4)),
          translateYPercent: reducedMotion || isSettled ? 0 : Number(((1 - u) * 14).toFixed(2)),
          clipTopPercent: reducedMotion || isSettled ? 0 : Number(((1 - u) * 100).toFixed(2)),
          blurPx: reducedMotion || isSettled ? 0 : Number(((1 - u) * 3.5).toFixed(2)),
          featherProgress: reducedMotion || isSettled ? 0 : Number(Math.sin(u * Math.PI).toFixed(3)),
          zIndex: i + 1,
          isVisible: true,
          role: isSettled ? 'active' : 'incoming',
        });
      }
      continue;
    }

    slides.push({
      index: i,
      opacity: 0,
      scale: reducedMotion ? 1 : 1.09,
      translateYPercent: reducedMotion ? 0 : 14,
      clipTopPercent: reducedMotion ? 0 : 100,
      blurPx: reducedMotion ? 0 : 3.5,
      featherProgress: 0,
      zIndex: i + 1,
      isVisible: false,
      role: 'upcoming',
    });
  }

  return {
    activeIndex,
    transitionProgress: Number(u.toFixed(3)),
    slides,
  };
}

/**
 * Computes the exact window scrollY that settles the sticky modality deck
 * on a given chapter index at 100% crisp focus.
 */
export function resolveModalityTargetScrollY(
  trackTop: number,
  trackHeight: number,
  stickyStageHeight: number,
  stickyTopOffset: number,
  index: number,
  count: number
): number {
  const startY = Math.max(0, trackTop - stickyTopOffset);
  if (count <= 1) return startY;
  const clampedIndex = Math.max(0, Math.min(count - 1, index));
  const travel = Math.max(1, trackHeight - stickyStageHeight);
  const progress = clampedIndex / (count - 1);
  return Math.round(startY + progress * travel);
}

