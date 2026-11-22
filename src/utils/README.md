# Utils Component Package

## Overview
Mathematical solvers, validation logic, and physics choreography algorithms powering Maison Aura / NOVA Sanctuary. Provides pure utility functions for guided booking state, scroll-synchronized story progression, sticky modality transitions, and interactive typography kinematics.

## Interface
- `[bookingLogic.ts:BookingFormInput]`: Interface for booking form state (categoryId, ritualId, clientName, clientEmail, clientPhone, preferredDate, preferredTime, notes)
- `[bookingLogic.ts:BookingValidationErrors]`: Validation error map for consultation reservation fields
- `[bookingLogic.ts:ConfirmedDemoBooking]`: Record type extending `BookingFormInput` with reference code, category title, ritual name, duration, and ISO timestamp
- `[bookingLogic.ts:AVAILABLE_TIME_SLOTS]`: Array of valid daily consultation appointment slots
- `[bookingLogic.ts:formatChapterCounter]`: Formats active chapter numbers and padded counters (e.g. `'01 / 04'`)
- `[bookingLogic.ts:resolveScrollStoryState]`: Maps raw scroll progress (0..1) to chapter index, chapter progress, and portal reveal status
- `[bookingLogic.ts:getNextChapterIndex]`: Computes cyclic next/previous chapter index
- `[bookingLogic.ts:getCategoryById]`: Look up `TreatmentCategory` by ID from `SALON_CONFIG`
- `[bookingLogic.ts:getCategoryServices]`: Retrieves ritual array for a given category ID
- `[bookingLogic.ts:findServiceById]`: Resolves ritual item and parent category by ritual ID
- `[bookingLogic.ts:validateBookingForm]`: Validates full consultation reservation form fields
- `[bookingLogic.ts:createBookingRecord]`: Generates a confirmed demo booking record with deterministic reference code
- `[bookingLogic.ts:BookingStep]`: Type representing step index (`1 | 2 | 3`)
- `[bookingLogic.ts:UpcomingDateOption]`: Interface for upcoming consultation date selection tiles
- `[bookingLogic.ts:RITUAL_PREFERENCE_TAGS]`: Constant tuple of quick preference strings (`'Quiet silent ritual'`, `'Sensitive skin'`, `'Bridal timeline'`, `'Fragrance-free'`)
- `[bookingLogic.ts:validateBookingStep]`: Validates fields belonging to the active consultation step
- `[bookingLogic.ts:getUpcomingConsultationDates]`: Generates deterministic upcoming date options starting from tomorrow
- `[bookingLogic.ts:toggleRitualPreferenceNote]`: Toggles a bulleted preference string inside client notes
- `[pageTransition.ts:TransitionPhase]`: Navigation transition phase union (`'idle' | 'rising' | 'swapping' | 'revealing'`)
- `[pageTransition.ts:PageTransitionTimings]`: Interface for curtain transition durations
- `[pageTransition.ts:PAGE_TRANSITION_TIMINGS]`: Constant durations for rise (0.62s), hold (0.06s), and reveal (0.64s)
- `[pageTransition.ts:shouldAnimatePageTransition]`: Pure predicate checking if route changed and reduced motion is disabled
- `[pageTransition.ts:getPageTransitionTimings]`: Returns clone of timing constants
- `[treatmentsScroll.ts:TreatmentsAnchorId]`: Anchor identifier type (`'treatments' | 'modalities' | 'aftercare'`)
- `[treatmentsScroll.ts:TreatmentsHeroVisualState]`: Opacity and blur transforms for hero headline and manifesto
- `[treatmentsScroll.ts:TreatmentsSectionStatus]`: Status holding active anchor and dark media backdrop flag
- `[treatmentsScroll.ts:resolveTreatmentsHeroStage]`: Computes hero dissolve and manifesto transforms from scroll progress
- `[treatmentsScroll.ts:resolveActiveTreatmentsSection]`: Determines active chapter anchor and dark media backdrop from scroll position
- `[treatmentsScroll.ts:ModalitySlideState]`: Visual transform contract for sticky modality cards
- `[treatmentsScroll.ts:ModalityDeckState]`: State containing active index, transition progress, and slide transforms
- `[treatmentsScroll.ts:resolveModalityDeckState]`: Pure solver computing slide-by-slide transitions with smoothstep interpolation
- `[treatmentsScroll.ts:resolveModalityTargetScrollY]`: Computes exact window scroll offset for a target slide index
- `[wordmarkMotion.ts:NovaInteractionMode]`: Interaction mode (`'idle' | 'word' | 'o-nudge' | 'v-lift'`)
- `[wordmarkMotion.ts:LetterTransform]`: 2D transform and accent state for individual brand letters
- `[wordmarkMotion.ts:SparkleTransform]`: Transform state for decorative brand sparkle
- `[wordmarkMotion.ts:NovaWordmarkPose]`: Pose container for letters N, O, V, A and sparkle
- `[wordmarkMotion.ts:getNovaWordmarkPose]`: Pure choreography solver for NOVA interactive wordmark physics and transforms

## Invariants
- `[bookingLogic.ts:resolveScrollStoryState]`: Progress is strictly clamped between 0 and 1; first 73% (0.00 to 0.73) drives chapters; portals become interactive only when reveal progress exceeds 0.45
- `[bookingLogic.ts:validateBookingForm]`: Requires client name length >= 2, valid email format regex, and at least 7 telephone digits
- `[bookingLogic.ts:createBookingRecord]`: Generates immutable demo reference code adhering to format `NOVA-${2-letter-name}${4-digit-date}`
- `[pageTransition.ts:shouldAnimatePageTransition]`: Always returns false if `reducedMotion` is true or if `currentPage === nextPage`
- `[treatmentsScroll.ts:resolveModalityDeckState]`: Modality deck count <= 0 returns empty slides; count == 1 locks slide 0 at 100% opacity; holds 16% progress before advancing incoming slide
- `[wordmarkMotion.ts:getNovaWordmarkPose]`: Mode `'idle'` always returns identity zero transforms; reduced motion disables translation and rotation while preserving accent flags

## Side Effects
- None

## Verification
- Run: `npm run lint`
