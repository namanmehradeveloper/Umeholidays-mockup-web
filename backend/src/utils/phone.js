export const PHONE_MESSAGE = 'must be a valid 10-digit Indian mobile number';

/**
 * Returns the 10-digit Indian mobile number in `value` (accepting a +91/91/0
 * prefix and any separators), or '' when it is not a valid mobile number.
 */
export function normalizePhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : '';
}
