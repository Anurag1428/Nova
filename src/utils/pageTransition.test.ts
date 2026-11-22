import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPageTransitionTimings,
  shouldAnimatePageTransition,
} from './pageTransition';

test('shouldAnimatePageTransition animates cross-page navigation only', () => {
  assert.equal(shouldAnimatePageTransition('home', 'treatments', false), true);
  assert.equal(shouldAnimatePageTransition('home', 'about', false), true);
  assert.equal(shouldAnimatePageTransition('treatments', 'home', false), true);
  assert.equal(shouldAnimatePageTransition('home', 'home', false), false);
  assert.equal(shouldAnimatePageTransition('treatments', 'treatments', false), false);
});

test('shouldAnimatePageTransition disables curtain animation when reducedMotion is enabled', () => {
  assert.equal(shouldAnimatePageTransition('home', 'treatments', true), false);
  assert.equal(shouldAnimatePageTransition('treatments', 'home', true), false);
});

test('getPageTransitionTimings exposes balanced positive durations', () => {
  const timings = getPageTransitionTimings();
  assert.ok(timings.riseDuration > 0.3 && timings.riseDuration < 1.2);
  assert.ok(timings.holdDuration >= 0 && timings.holdDuration < 0.3);
  assert.ok(timings.revealDuration > 0.3 && timings.revealDuration < 1.2);
});
