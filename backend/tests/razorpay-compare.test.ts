import { timingSafeEqualUtf8 } from '../src/payments/razorpay';

describe('timingSafeEqualUtf8', () => {
  it('returns false on length mismatch', () => {
    expect(timingSafeEqualUtf8('abcdef0123456789abcdef0123456789', 'short')).toBe(false);
  });

  it('returns true when equal hex strings', () => {
    const h = 'a'.repeat(64);
    expect(timingSafeEqualUtf8(h, h)).toBe(true);
  });

  it('returns false when same length but different', () => {
    const a = '0'.repeat(64);
    const b = '1'.repeat(64);
    expect(timingSafeEqualUtf8(a, b)).toBe(false);
  });

  it('returns false when both empty', () => {
    expect(timingSafeEqualUtf8('', '')).toBe(false);
  });
});
