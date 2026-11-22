export type NovaInteractionMode = 'idle' | 'word' | 'o-nudge' | 'v-lift';

export interface LetterTransform {
  x: number;
  y: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  accented: boolean;
}

export interface SparkleTransform {
  opacity: number;
  scale: number;
  rotate: number;
  y: number;
}

export interface NovaWordmarkPose {
  N: LetterTransform;
  O: LetterTransform;
  V: LetterTransform;
  A: LetterTransform;
  sparkle: SparkleTransform;
}

const REST_LETTER: LetterTransform = {
  x: 0,
  y: 0,
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
  accented: false,
};

const REST_SPARKLE: SparkleTransform = {
  opacity: 0,
  scale: 0.2,
  rotate: -45,
  y: 4,
};

/**
 * Pure choreography solver for the interactive NOVA wordmark.
 * Defines how O (the rolling pearl) and V (the sculptural cradle) physically
 * interact across hover states while N and A frame the motion gracefully.
 */
export function getNovaWordmarkPose(
  mode: NovaInteractionMode,
  reducedMotion = false
): NovaWordmarkPose {
  if (mode === 'idle') {
    return {
      N: { ...REST_LETTER },
      O: { ...REST_LETTER },
      V: { ...REST_LETTER },
      A: { ...REST_LETTER },
      sparkle: { ...REST_SPARKLE },
    };
  }

  if (reducedMotion) {
    return {
      N: { ...REST_LETTER },
      O: { ...REST_LETTER, accented: true },
      V: { ...REST_LETTER, accented: true },
      A: { ...REST_LETTER },
      sparkle: { opacity: 0.9, scale: 1, rotate: 0, y: 0 },
    };
  }

  switch (mode) {
    case 'word':
      // Hovering NOVA as a whole: O rolls clockwise toward V's cradle,
      // V tilts warmly to catch O, and N/A step outward for clean clearance.
      return {
        N: { x: -3, y: 0, rotate: -2, scaleX: 1, scaleY: 1, accented: false },
        O: { x: 3.5, y: -5, rotate: 180, scaleX: 0.98, scaleY: 0.98, accented: true },
        V: { x: -1, y: 2, rotate: 7, scaleX: 1.04, scaleY: 0.96, accented: true },
        A: { x: 4, y: 0, rotate: 2, scaleX: 1, scaleY: 1, accented: false },
        sparkle: { opacity: 1, scale: 1.05, rotate: 25, y: -8 },
      };

    case 'o-nudge':
      // Hovering directly on O: O rolls forward and kisses V's edge like Newton's cradle,
      // V leans smoothly right while A steps clear so no strokes collide.
      return {
        N: { x: -4, y: 0, rotate: -3, scaleX: 1, scaleY: 1, accented: false },
        O: { x: 4.5, y: -3, rotate: 360, scaleX: 1.05, scaleY: 0.95, accented: true },
        V: { x: 2, y: 2, rotate: 10, scaleX: 0.97, scaleY: 1.03, accented: true },
        A: { x: 6, y: 0, rotate: 3, scaleX: 1, scaleY: 1, accented: false },
        sparkle: { opacity: 1, scale: 1.15, rotate: 45, y: -8 },
      };

    case 'v-lift':
      // Hovering directly on V: V tilts warmly inward and springs up to float O
      // into a crisp, non-overlapping arc above the baseline.
      return {
        N: { x: -4, y: 0, rotate: -2, scaleX: 1, scaleY: 1, accented: false },
        O: { x: 1.5, y: -12, rotate: -180, scaleX: 1.02, scaleY: 1.04, accented: true },
        V: { x: 0, y: -2, rotate: -10, scaleX: 1.06, scaleY: 0.96, accented: true },
        A: { x: 4, y: 0, rotate: 2, scaleX: 1, scaleY: 1, accented: false },
        sparkle: { opacity: 1, scale: 1.15, rotate: -30, y: -14 },
      };
  }
}
