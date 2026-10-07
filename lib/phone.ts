export const PHONE_ERROR = 'Enter a valid 10-digit mobile number';

/** Keeps only the 10-digit national number, dropping a pasted +91/91/0 prefix. */
export function phoneDigits(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export const isValidPhone = (value: string) => /^[6-9]\d{9}$/.test(value);
