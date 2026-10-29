import test from 'node:test';
import assert from 'node:assert/strict';
import { inquirySchema, valuationSchema, subscriptionSchema, normalizePhone, fieldErrors } from './validation.ts';

test('inquirySchema validates complete inquiry successfully', () => {
  const result = inquirySchema.safeParse({
    fullName: 'Otunba Adeola',
    email: 'adeola@example.com',
    phone: '+234 803 123 4567',
    primaryInterest: 'buy',
    preferredLocation: 'Ikoyi (Old Ikoyi / Banana Island)',
    estimatedBudget: '₦150M - ₦500M',
    messageDetails: 'Looking for a verified 4-bed detached duplex on Bourdillon.',
    consent: true
  });
  assert.equal(result.success, true);
});

test('inquirySchema rejects missing consent', () => {
  const result = inquirySchema.safeParse({
    fullName: 'Otunba Adeola',
    email: 'adeola@example.com',
    phone: '+234 803 123 4567',
    primaryInterest: 'buy',
    preferredLocation: 'Ikoyi',
    estimatedBudget: '₦150M',
    consent: false
  });
  assert.equal(result.success, false);
});

test('valuationSchema validates valid input', () => {
  const result = valuationSchema.safeParse({
    fullName: 'Chief Mrs. Adeleke',
    email: 'adeleke@firm.ng',
    phone: '08023456789',
    propertyType: 'contemporary-duplex',
    location: 'ikoyi',
    expectedPrice: '350,000,000',
    saleStrategy: 'discreet'
  });
  assert.equal(result.success, true);
});

test('subscriptionSchema validates emails', () => {
  assert.equal(subscriptionSchema.safeParse({ email: 'investor@lagos.ng' }).success, true);
  assert.equal(subscriptionSchema.safeParse({ email: 'invalid-email' }).success, false);
});

test('normalizePhone handles Nigerian and diaspora numbers', () => {
  assert.equal(normalizePhone('803 000 7890'), '+234 803 000 7890');
  assert.equal(normalizePhone('0803 000 7890'), '+234 803 000 7890');
  assert.equal(normalizePhone('+44 7700 900123'), '+44 7700 900123');
  assert.equal(normalizePhone('0044 7700 900123'), '+44 7700 900123');
  assert.equal(normalizePhone('  '), '');
});

test('inquirySchema flags bad phone and returns field errors', () => {
  const result = inquirySchema.safeParse({
    fullName: 'A', email: 'nope', phone: 'abc', primaryInterest: 'buy',
    preferredLocation: 'Ikoyi', estimatedBudget: '₦500M+', consent: false,
  });
  assert.equal(result.success, false);
  if (!result.success) {
    const f = fieldErrors(result.error.issues);
    assert.ok(f.fullName && f.email && f.phone && f.consent);
  }
});
