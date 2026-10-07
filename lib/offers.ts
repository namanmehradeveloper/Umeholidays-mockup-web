import type { Offer } from '../types';

export function formatInr(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

/** Offer dates are stored as calendar days in UTC, so format them in UTC to avoid off-by-one days. */
export function formatOfferDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function offerDiscountLabel(offer: Pick<Offer, 'discountType' | 'discountValue'>) {
  if (offer.discountType === 'percentage' && offer.discountValue > 0) return `${offer.discountValue}% off`;
  if (offer.discountType === 'fixed' && offer.discountValue > 0) return `${formatInr(offer.discountValue)} off`;
  return '';
}

export function offerValidityLabel(offer: Pick<Offer, 'startDate' | 'endDate'>) {
  const start = formatOfferDate(offer.startDate);
  const end = formatOfferDate(offer.endDate);
  if (start && end) return `${start} – ${end}`;
  if (end) return `Valid till ${end}`;
  if (start) return `From ${start}`;
  return 'Limited period';
}

export function hasOfferDiscount(offer: Pick<Offer, 'discountAmount' | 'originalPrice'>) {
  return Boolean(offer.originalPrice && offer.discountAmount > 0);
}
