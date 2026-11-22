import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveActiveTreatmentsSection,
  resolveModalityDeckState,
  resolveModalityTargetScrollY,
  resolveTreatmentsHeroStage,
} from './treatmentsScroll';

test('resolveTreatmentsHeroStage starts with crisp split headline and hidden manifesto', () => {
  const start = resolveTreatmentsHeroStage(0);
  assert.equal(start.headlineOpacity, 1);
  assert.equal(start.headlineBlurPx, 0);
  assert.equal(start.manifestoOpacity, 0);
  assert.ok(start.manifestoY > 20);
});

test('resolveTreatmentsHeroStage softens headline and reveals manifesto as user scrolls', () => {
  const mid = resolveTreatmentsHeroStage(0.45);
  const end = resolveTreatmentsHeroStage(0.85);

  assert.ok(mid.headlineOpacity < 1 && mid.headlineOpacity > 0.2);
  assert.ok(mid.manifestoOpacity > 0 && mid.manifestoOpacity < 1);
  assert.ok(end.headlineOpacity <= 0.3);
  assert.ok(end.headlineBlurPx >= 3);
  assert.equal(end.manifestoOpacity, 1);
  assert.equal(end.manifestoY, 0);
});

test('resolveTreatmentsHeroStage removes blur and displacement under reduced motion', () => {
  const late = resolveTreatmentsHeroStage(0.8, true);
  assert.equal(late.headlineBlurPx, 0);
  assert.equal(late.manifestoY, 0);
  assert.equal(late.manifestoOpacity, 1);
});

test('resolveActiveTreatmentsSection tracks active anchor and dark surface contrast accurately', () => {
  const bounds = { heroHeight: 1700, aftercareTop: 4600, aftercareBottom: 5350 };

  const inHero = resolveActiveTreatmentsSection(100, bounds, 900);
  assert.equal(inHero.activeAnchor, 'treatments');
  assert.equal(inHero.isOverDarkMedia, true);

  const inModalities = resolveActiveTreatmentsSection(2200, bounds, 900);
  assert.equal(inModalities.activeAnchor, 'modalities');
  assert.equal(inModalities.isOverDarkMedia, false);

  const inAftercare = resolveActiveTreatmentsSection(4300, bounds, 900);
  assert.equal(inAftercare.activeAnchor, 'aftercare');
  assert.equal(inAftercare.isOverDarkMedia, true);

  const inJourney = resolveActiveTreatmentsSection(5500, bounds, 900);
  assert.equal(inJourney.activeAnchor, 'aftercare');
  assert.equal(inJourney.isOverDarkMedia, false);
});

test('resolveModalityDeckState settles cleanly on first and last slides at progress extremes', () => {
  const start = resolveModalityDeckState(0, 4);
  assert.equal(start.activeIndex, 0);
  assert.equal(start.slides[0].opacity, 1);
  assert.equal(start.slides[0].scale, 1);
  assert.equal(start.slides[0].blurPx, 0);
  assert.equal(start.slides[0].role, 'active');
  assert.equal(start.slides[1].isVisible, false);

  const end = resolveModalityDeckState(1, 4);
  assert.equal(end.activeIndex, 3);
  assert.equal(end.slides[3].opacity, 1);
  assert.equal(end.slides[3].scale, 1);
  assert.equal(end.slides[3].clipTopPercent, 0);
  assert.equal(end.slides[3].blurPx, 0);
  assert.equal(end.slides[0].isVisible, false);
  assert.equal(end.slides[2].role, 'vanished');
});

test('resolveModalityDeckState blends outgoing vanishing slide into incoming rising slide mid-scroll', () => {
  // 0.20 of 3 transitions => scaled = 0.60 => mid-way between slide 0 and slide 1
  const mid = resolveModalityDeckState(0.2, 4);
  const outgoing = mid.slides[0];
  const incoming = mid.slides[1];

  assert.equal(outgoing.role, 'outgoing');
  assert.ok(outgoing.opacity > 0.1 && outgoing.opacity < 0.9, 'outgoing should fade smoothly');
  assert.ok(outgoing.scale < 1 && outgoing.scale > 0.85, 'outgoing should recede slightly');
  assert.ok(outgoing.blurPx > 1, 'outgoing should soften as it vanishes');
  assert.ok(outgoing.translateYPercent < 0, 'outgoing should drift upward');

  assert.equal(incoming.role, 'incoming');
  assert.ok(incoming.isVisible, 'incoming should be visible during blend');
  assert.ok(incoming.clipTopPercent > 10 && incoming.clipTopPercent < 90, 'incoming should glide upward into frame');
  assert.ok(incoming.featherProgress > 0.5, 'incoming top edge should feather smoothly mid-blend');
  assert.ok(incoming.scale > 1, 'incoming should settle subtly from optical zoom');
});

test('resolveModalityDeckState disables blur and displacement under reduced motion', () => {
  const mid = resolveModalityDeckState(0.2, 4, true);
  assert.equal(mid.slides[0].blurPx, 0);
  assert.equal(mid.slides[0].scale, 1);
  assert.equal(mid.slides[0].translateYPercent, 0);
  assert.equal(mid.slides[1].clipTopPercent, 0);
  assert.equal(mid.slides[1].featherProgress, 0);
});

test('resolveModalityTargetScrollY lands squarely on each chapter settled stop', () => {
  const trackTop = 2000;
  const trackHeight = 3200;
  const stageHeight = 700;
  const stickyTopOffset = 96;

  assert.equal(resolveModalityTargetScrollY(trackTop, trackHeight, stageHeight, stickyTopOffset, 0, 4), 1904);
  assert.equal(resolveModalityTargetScrollY(trackTop, trackHeight, stageHeight, stickyTopOffset, 3, 4), 4404);

  const midTarget = resolveModalityTargetScrollY(trackTop, trackHeight, stageHeight, stickyTopOffset, 1, 4);
  assert.ok(midTarget > 1904 && midTarget < 4404);
});

