// Geo-based pricing configuration
// Prices are adjusted based on purchasing power parity (PPP)

export interface GeoPrice {
  currency: string;
  currencySymbol: string;
  amount: number;
  originalAmount: number;
  discountPercent: number;
  countryCode: string;
  countryName: string;
}

// Regional pricing tiers based on PPP
// Tier 1: Full price (UK, US, Western Europe, Australia, etc.)
// Tier 2: 30% discount (Eastern Europe, Latin America, etc.)
// Tier 3: 50% discount (Middle East, South Asia, Southeast Asia, Africa, etc.)

const TIER_1_COUNTRIES = [
  'GB', 'US', 'CA', 'AU', 'NZ', 'IE', 'DE', 'FR', 'NL', 'BE',
  'AT', 'CH', 'LU', 'DK', 'SE', 'NO', 'FI', 'IS', 'SG', 'JP',
  'KR', 'HK', 'TW'
];

const TIER_2_COUNTRIES = [
  'ES', 'IT', 'PT', 'GR', 'CZ', 'PL', 'HU', 'RO', 'BG', 'HR',
  'SK', 'SI', 'LT', 'LV', 'EE', 'MX', 'BR', 'AR', 'CL', 'CO',
  'PE', 'UY', 'CR', 'PA', 'RU', 'UA', 'TR', 'ZA', 'IL', 'CN',
  'TH', 'MY', 'VN'
];

// All other countries get Tier 3 pricing (50% off)
// This includes most of MENA, South Asia, Africa

// Currency mapping for common countries
const CURRENCY_MAP: Record<string, { currency: string; symbol: string }> = {
  // Tier 1
  'GB': { currency: 'GBP', symbol: '£' },
  'US': { currency: 'USD', symbol: '$' },
  'CA': { currency: 'CAD', symbol: 'CA$' },
  'AU': { currency: 'AUD', symbol: 'A$' },
  'NZ': { currency: 'NZD', symbol: 'NZ$' },
  'IE': { currency: 'EUR', symbol: '€' },
  'DE': { currency: 'EUR', symbol: '€' },
  'FR': { currency: 'EUR', symbol: '€' },
  'NL': { currency: 'EUR', symbol: '€' },
  'BE': { currency: 'EUR', symbol: '€' },
  'AT': { currency: 'EUR', symbol: '€' },
  'CH': { currency: 'CHF', symbol: 'CHF' },
  'JP': { currency: 'JPY', symbol: '¥' },
  'SG': { currency: 'SGD', symbol: 'S$' },

  // Middle East (Arabic-speaking)
  'SA': { currency: 'SAR', symbol: 'ر.س' },
  'AE': { currency: 'AED', symbol: 'د.إ' },
  'KW': { currency: 'KWD', symbol: 'د.ك' },
  'QA': { currency: 'QAR', symbol: 'ر.ق' },
  'BH': { currency: 'BHD', symbol: 'د.ب' },
  'OM': { currency: 'OMR', symbol: 'ر.ع' },
  'JO': { currency: 'JOD', symbol: 'د.أ' },
  'LB': { currency: 'USD', symbol: '$' },
  'EG': { currency: 'EGP', symbol: 'ج.م' },
  'MA': { currency: 'MAD', symbol: 'د.م' },
  'DZ': { currency: 'DZD', symbol: 'د.ج' },
  'TN': { currency: 'TND', symbol: 'د.ت' },
  'LY': { currency: 'LYD', symbol: 'د.ل' },
  'IQ': { currency: 'IQD', symbol: 'د.ع' },
  'SY': { currency: 'USD', symbol: '$' },
  'YE': { currency: 'YER', symbol: 'ر.ي' },
  'PS': { currency: 'ILS', symbol: '₪' },
  'SD': { currency: 'SDG', symbol: 'ج.س' },

  // South Asia
  'PK': { currency: 'PKR', symbol: 'Rs' },
  'IN': { currency: 'INR', symbol: '₹' },
  'BD': { currency: 'BDT', symbol: '৳' },
  'LK': { currency: 'LKR', symbol: 'Rs' },

  // Southeast Asia
  'MY': { currency: 'MYR', symbol: 'RM' },
  'ID': { currency: 'IDR', symbol: 'Rp' },
  'TH': { currency: 'THB', symbol: '฿' },
  'VN': { currency: 'VND', symbol: '₫' },
  'PH': { currency: 'PHP', symbol: '₱' },

  // Africa
  'NG': { currency: 'NGN', symbol: '₦' },
  'ZA': { currency: 'ZAR', symbol: 'R' },
  'KE': { currency: 'KES', symbol: 'KSh' },
  'GH': { currency: 'GHS', symbol: '₵' },

  // Other
  'TR': { currency: 'TRY', symbol: '₺' },
  'BR': { currency: 'BRL', symbol: 'R$' },
  'MX': { currency: 'MXN', symbol: 'MX$' },
};

// Country names in Arabic for common regions
const COUNTRY_NAMES_AR: Record<string, string> = {
  'SA': 'السعودية',
  'AE': 'الإمارات',
  'KW': 'الكويت',
  'QA': 'قطر',
  'BH': 'البحرين',
  'OM': 'عُمان',
  'JO': 'الأردن',
  'LB': 'لبنان',
  'EG': 'مصر',
  'MA': 'المغرب',
  'DZ': 'الجزائر',
  'TN': 'تونس',
  'LY': 'ليبيا',
  'IQ': 'العراق',
  'SY': 'سوريا',
  'YE': 'اليمن',
  'PS': 'فلسطين',
  'SD': 'السودان',
  'PK': 'باكستان',
  'IN': 'الهند',
  'BD': 'بنغلاديش',
  'MY': 'ماليزيا',
  'ID': 'إندونيسيا',
  'TR': 'تركيا',
  'GB': 'بريطانيا',
  'US': 'أمريكا',
};

// Base price in GBP
const BASE_PRICE_GBP = 29.99;

// Approximate exchange rates (updated periodically)
// In production, you'd fetch these from an API
const EXCHANGE_RATES: Record<string, number> = {
  'GBP': 1,
  'USD': 1.27,
  'EUR': 1.17,
  'CAD': 1.72,
  'AUD': 1.94,
  'NZD': 2.10,
  'CHF': 1.12,
  'JPY': 190,
  'SGD': 1.71,
  'SAR': 4.76,
  'AED': 4.66,
  'KWD': 0.39,
  'QAR': 4.62,
  'BHD': 0.48,
  'OMR': 0.49,
  'JOD': 0.90,
  'EGP': 62,
  'MAD': 12.7,
  'DZD': 171,
  'TND': 3.95,
  'LYD': 6.15,
  'IQD': 1663,
  'YER': 317,
  'ILS': 4.72,
  'SDG': 760,
  'PKR': 354,
  'INR': 106,
  'BDT': 140,
  'LKR': 390,
  'MYR': 5.65,
  'IDR': 20200,
  'THB': 45.5,
  'VND': 32000,
  'PHP': 71,
  'NGN': 1960,
  'ZAR': 23,
  'KES': 193,
  'GHS': 16,
  'TRY': 41,
  'BRL': 6.2,
  'MXN': 21.7,
};

export function getGeoPrice(countryCode: string): GeoPrice {
  const upperCountry = countryCode.toUpperCase();

  // Determine discount tier
  let discountPercent = 0;
  if (TIER_1_COUNTRIES.includes(upperCountry)) {
    discountPercent = 0;
  } else if (TIER_2_COUNTRIES.includes(upperCountry)) {
    discountPercent = 30;
  } else {
    discountPercent = 50; // Tier 3
  }

  // Get currency info
  const currencyInfo = CURRENCY_MAP[upperCountry] || { currency: 'USD', symbol: '$' };
  const exchangeRate = EXCHANGE_RATES[currencyInfo.currency] || 1.27; // Default to USD rate

  // Calculate prices
  const originalAmountLocal = Math.round(BASE_PRICE_GBP * exchangeRate * 100) / 100;
  const discountedAmountLocal = Math.round(originalAmountLocal * (1 - discountPercent / 100) * 100) / 100;

  // Round to nice numbers for display
  const roundedAmount = roundToNicePrice(discountedAmountLocal, currencyInfo.currency);
  const roundedOriginal = roundToNicePrice(originalAmountLocal, currencyInfo.currency);

  return {
    currency: currencyInfo.currency,
    currencySymbol: currencyInfo.symbol,
    amount: roundedAmount,
    originalAmount: roundedOriginal,
    discountPercent,
    countryCode: upperCountry,
    countryName: COUNTRY_NAMES_AR[upperCountry] || upperCountry,
  };
}

// Round to psychologically appealing prices
function roundToNicePrice(price: number, currency: string): number {
  // For currencies with very large values (JPY, IDR, VND, etc.), round to whole numbers
  if (['JPY', 'IDR', 'VND', 'IQD', 'KRW'].includes(currency)) {
    return Math.round(price / 100) * 100;
  }

  // For other currencies, round to .99
  return Math.floor(price) + 0.99;
}

// Format price for display
export function formatPrice(price: GeoPrice): string {
  // For Arabic currencies, put symbol after the number
  const arabicCurrencies = ['SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'EGP', 'MAD', 'DZD', 'TND', 'LYD', 'IQD', 'YER', 'SDG'];

  if (arabicCurrencies.includes(price.currency)) {
    return `${price.amount} ${price.currencySymbol}`;
  }

  return `${price.currencySymbol}${price.amount}`;
}

export function formatOriginalPrice(price: GeoPrice): string {
  const arabicCurrencies = ['SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'EGP', 'MAD', 'DZD', 'TND', 'LYD', 'IQD', 'YER', 'SDG'];

  if (arabicCurrencies.includes(price.currency)) {
    return `${price.originalAmount} ${price.currencySymbol}`;
  }

  return `${price.currencySymbol}${price.originalAmount}`;
}

// Default price for when geo-detection fails
export const DEFAULT_PRICE: GeoPrice = {
  currency: 'USD',
  currencySymbol: '$',
  amount: 29.99,
  originalAmount: 29.99,
  discountPercent: 0,
  countryCode: 'US',
  countryName: 'أمريكا',
};
