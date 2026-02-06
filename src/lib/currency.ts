export const EXCHANGE_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.5,
    AED: 3.67,
    SAR: 3.75,
    CAD: 1.35,
    AUD: 1.52,
    CHF: 0.88,
    CNY: 7.19,
    INR: 82.90,
    SGD: 1.34,
    HKD: 7.82,
    NZD: 1.63,
    KRW: 1330.50,
    THB: 35.80,
    MXN: 17.05,
    BRL: 4.97,
    ZAR: 19.05,
    TRY: 31.20,
    // Middle East
    QAR: 3.64,
    KWD: 0.31,
    BHD: 0.38,
    OMR: 0.38,
    JOD: 0.71,
    EGP: 30.90,
    // Asia
    IDR: 15600,
    MYR: 4.77,
    PHP: 56.10,
    VND: 24500,
    TWD: 31.60,
    PKR: 279.50,
    BDT: 109.50,
    LKR: 310.00,
};

export const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const convertCurrency = (amount: number, from: string, to: string, rates?: Record<string, number>) => {
    const exchangeRates = rates || EXCHANGE_RATES;
    const inUSD = amount / (exchangeRates[from] || 1);
    return inUSD * (exchangeRates[to] || 1);
};
