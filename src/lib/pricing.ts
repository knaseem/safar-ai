// This utility can be used on both client and server if needed, but primarily server-side for API routes

/**
 * Pricing Utility for Safar AI
 * Handles profit markups for various travel components
 */

// Default markup percentages (can be overridden by Env vars)
export const MARKUP_FLIGHT_PERCENT = Number(process.env.MARKUP_FLIGHT_PERCENT) || 5;
export const MARKUP_HOTEL_PERCENT = Number(process.env.MARKUP_HOTEL_PERCENT) || 10;
export const MARKUP_ANCILLARY_FEE = Number(process.env.MARKUP_ANCILLARY_FEE) || 15;

export type MarkupType = 'flight' | 'hotel' | 'ancillary';

/**
 * Apply markup to a base price
 */
export function applyMarkup(amount: number | string, type: MarkupType): number {
    const baseAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(baseAmount)) return 0;

    let finalAmount = baseAmount;

    switch (type) {
        case 'flight':
            finalAmount = baseAmount * (1 + MARKUP_FLIGHT_PERCENT / 100);
            break;
        case 'hotel':
            finalAmount = baseAmount * (1 + MARKUP_HOTEL_PERCENT / 100);
            break;
        case 'ancillary':
            finalAmount = baseAmount + MARKUP_ANCILLARY_FEE;
            break;
    }

    // Round to 2 decimal places
    return Math.round(finalAmount * 100) / 100;
}

/**
 * Extract currency symbol (utility)
 */
export function formatCurrencyValue(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}
