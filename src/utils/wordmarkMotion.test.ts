import test from 'node:test';
import assert from 'node:assert/strict';
import { getNovaWordmarkPose } from './wordmarkMotion';

test('idle state keeps all NOVA letters at exact resting typography', () => {
  const pose = getNovaWordmarkPose('idle');
  for (const key of ['N', 'O', 'V', 'A'] as const) {
    assert.equal(pose[key].x, 0);
    assert.equal(pose[key].y, 0);
    assert.equal(pose[key].rotate, 0);
    assert.equal(pose[key].scaleX, 1);
    assert.equal(pose[key].scaleY, 1);
    assert.equal(pose[key].accented, false);
  }
  assert.equal(pose.sparkle.opacity, 0);
});

test('word hover makes O roll toward V and V cradle O with sparkle visible', () => {
  const pose = getNovaWordmarkPose('word');
  assert.ok(pose.O.x > 0, 'O should glide right toward V');
  assert.ok(pose.O.rotate > 0, 'O should rotate clockwise');
  assert.ok(pose.V.x < 0, 'V should meet O slightly leftward');
  assert.ok(pose.V.rotate > 0, 'V should tilt to cradle O');
  assert.equal(pose.O.accented, true);
  assert.equal(pose.V.accented, true);
  assert.equal(pose.sparkle.opacity, 1);
});

test('o-nudge and v-lift produce distinct reciprocal O and V interactions', () => {
  const oNudge = getNovaWordmarkPose('o-nudge');
  const vLift = getNovaWordmarkPose('v-lift');

  assert.ok(oNudge.O.x > vLift.O.x, 'direct O hover pushes O further into V');
  assert.ok(oNudge.V.rotate > 0, 'V leans right when nudged by O');
  assert.ok(vLift.V.rotate < 0, 'V tilts left to lift O on V hover');
  assert.ok(vLift.O.y < oNudge.O.y, 'V hover tosses O higher into an arc');
});

test('reducedMotion preserves zero displacement while keeping subtle accent', () => {
  const pose = getNovaWordmarkPose('o-nudge', true);
  assert.equal(pose.O.x, 0);
  assert.equal(pose.O.y, 0);
  assert.equal(pose.O.rotate, 0);
  assert.equal(pose.O.accented, true);
  assert.equal(pose.V.accented, true);
});
