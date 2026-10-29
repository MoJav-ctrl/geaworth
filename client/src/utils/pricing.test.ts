import test from 'node:test';
import assert from 'node:assert/strict';
import { formatNaira, parsePrice, matchesPriceBracket, calculateNetYield, priceBracketToRange } from './pricing.ts';

test('formatNaira formats integers with commas and currency symbol', () => {
  assert.equal(formatNaira(385000000), '₦385,000,000');
  assert.equal(formatNaira(0), '₦0');
  assert.equal(formatNaira(28000000, 'yr'), '₦28,000,000 / yr');
  assert.equal(formatNaira(180000, '/ night'), '₦180,000 / night');
});

test('parsePrice parses various Nigerian shorthand formats', () => {
  assert.equal(parsePrice('350,000,000'), 350000000);
  assert.equal(parsePrice('₦180M'), 180000000);
  assert.equal(parsePrice('50m'), 50000000);
  assert.equal(parsePrice('₦750M+'), 750000000);
  assert.equal(parsePrice('2.5m'), 2500000);
  assert.equal(parsePrice('45B+'), 45000000000);
});

test('matchesPriceBracket categorizes correctly', () => {
  assert.equal(matchesPriceBracket(35000000, 'under-50m'), true);
  assert.equal(matchesPriceBracket(50000000, 'under-50m'), false);
  assert.equal(matchesPriceBracket(80000000, '50m-150m'), true);
  assert.equal(matchesPriceBracket(220000000, '150m-500m'), true);
  assert.equal(matchesPriceBracket(650000000, '500m-plus'), true);
  assert.equal(matchesPriceBracket(120000000, 'any'), true);
});

test('calculateNetYield computes correct percentage', () => {
  assert.equal(calculateNetYield(28000000, 200000000), 14.0);
  assert.equal(calculateNetYield(0, 200000000), 0);
});

test('priceBracketToRange maps brackets to API min/max', () => {
  assert.deepEqual(priceBracketToRange('under-50m'), { maxPrice: 49_999_999 });
  assert.deepEqual(priceBracketToRange('50m-150m'), { minPrice: 50_000_000, maxPrice: 150_000_000 });
  assert.deepEqual(priceBracketToRange('500m-plus'), { minPrice: 500_000_000 });
  assert.deepEqual(priceBracketToRange(''), {});
});
