import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_VIP_SETTINGS,
  fetchLiveSalonSettings,
} from './liveSalonSettings';

test('DEFAULT_VIP_SETTINGS has safe fallback values', () => {
  assert.equal(DEFAULT_VIP_SETTINGS.voucherAmount, 500);
  assert.equal(DEFAULT_VIP_SETTINGS.voucherCode, 'NOVA-VIP500');
  assert.equal(DEFAULT_VIP_SETTINGS.isPopupActive, true);
  assert.equal(DEFAULT_VIP_SETTINGS.loadedFromAirtable, false);
});

test('fetchLiveSalonSettings returns valid settings structure', async () => {
  const settings = await fetchLiveSalonSettings();
  assert.ok(typeof settings.voucherAmount === 'number');
  assert.ok(settings.voucherAmount > 0);
  assert.ok(typeof settings.voucherCode === 'string');
  assert.ok(typeof settings.isPopupActive === 'boolean');
});
