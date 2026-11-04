// Regression test for maskPhoneNumber
const assert = require('assert');

// Port of maskPhoneNumber logic from src/utils/call-connect-helpers.ts
function maskPhoneNumber(number) {
  if (!number || typeof number !== 'string') return 'Unknown';
  const clean = number.trim();
  if (!clean) return 'Unknown';

  const lower = clean.toLowerCase();
  if (
    lower === 'private' ||
    lower === 'unknown' ||
    lower === 'restricted' ||
    lower === 'caller' ||
    lower === 'recent call' ||
    lower === 'incoming/outgoing' ||
    lower === 'recipient' ||
    lower === 'private/unknown' ||
    lower === 'test simulation' ||
    clean === '-1' ||
    clean === '-2'
  ) {
    return 'Private / Unknown';
  }

  // Extract all digit characters
  const digits = clean.replace(/\D/g, '');

  if (digits.length === 0) {
    return 'Private / Unknown';
  }

  if (digits.length < 4) {
    return digits;
  }

  // Strictly take the last 4 numeric digits of the phone number
  const last4 = digits.slice(-4);

  // Preserve international '+' prefix if original string started with '+'
  if (clean.startsWith('+')) {
    const intlDigits = digits.slice(0, digits.length - 10 > 0 ? digits.length - 10 : Math.min(3, digits.length - 4));
    if (intlDigits.length > 0) {
      return `+${intlDigits} ••• ••• ${last4}`;
    }
    return `+ ••• ••• ${last4}`;
  }

  return `•••• ••• ${last4}`;
}

console.log('Running maskPhoneNumber regression tests...');

// 1. Valid numbers
assert.strictEqual(maskPhoneNumber('+14155552671'), '+1 ••• ••• 2671');
assert.strictEqual(maskPhoneNumber('9876543210'), '•••• ••• 3210');
assert.strictEqual(maskPhoneNumber('+919876543210'), '+91 ••• ••• 3210');
assert.strictEqual(maskPhoneNumber('(415) 555-4321'), '•••• ••• 4321');

// 2. Regression tests: previously returned "call", "ient", "ller", "nown", "alls"
assert.strictEqual(maskPhoneNumber('Recent call'), 'Private / Unknown');
assert.strictEqual(maskPhoneNumber('Caller'), 'Private / Unknown');
assert.strictEqual(maskPhoneNumber('recipient'), 'Private / Unknown');
assert.strictEqual(maskPhoneNumber('Private/Unknown'), 'Private / Unknown');
assert.strictEqual(maskPhoneNumber('Incoming/Outgoing'), 'Private / Unknown');
assert.strictEqual(maskPhoneNumber('Test Simulation'), 'Private / Unknown');

// 3. Null, undefined, empty, and non-numeric values
assert.strictEqual(maskPhoneNumber(null), 'Unknown');
assert.strictEqual(maskPhoneNumber(undefined), 'Unknown');
assert.strictEqual(maskPhoneNumber(''), 'Unknown');
assert.strictEqual(maskPhoneNumber('   '), 'Unknown');
assert.strictEqual(maskPhoneNumber('Unknown'), 'Private / Unknown');
assert.strictEqual(maskPhoneNumber('PRIVATE'), 'Private / Unknown');
assert.strictEqual(maskPhoneNumber('-1'), 'Private / Unknown');
assert.strictEqual(maskPhoneNumber('-2'), 'Private / Unknown');
assert.strictEqual(maskPhoneNumber('abcdef'), 'Private / Unknown');

// 4. Short numbers
assert.strictEqual(maskPhoneNumber('911'), '911');
assert.strictEqual(maskPhoneNumber('112'), '112');

console.log('All maskPhoneNumber tests passed successfully!');

