/** Public-facing SeatSip brand strings (avoid hardcoding legacy domains in UI). */
export const BRAND = {
  name: 'SeatSip',
  domain: 'seatsip.in',
  websiteUrl: 'https://seatsip.in',
  supportEmail: 'hello@seatsip.in',
  supportPhoneDisplay: '+91 98765 43210',
  /** E.164 without + for wa.me links */
  supportPhoneWa: '919876543210',
} as const;
