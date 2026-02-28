import useSWR from 'swr';
import { EXCHANGE_RATES } from '@/lib/currency';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data;
};

export function useExchangeRates() {
    const { data, error, isLoading } = useSWR(
        'https://open.er-api.com/v6/latest/USD',
        fetcher,
        {
            revalidateOnFocus: false, // Rates don't change that fast
            dedupingInterval: 3600000, // Cache for 1 hour
            errorRetryCount: 2,
        }
    );

    // Merge live rates with static fallback to ensure all supported currencies exist
    // This prioritizes live data but keeps static as backup for any missing codes
    const rates = data?.rates ? { ...EXCHANGE_RATES, ...data.rates } : EXCHANGE_RATES;

    return {
        rates,
        loading: isLoading,
        error: !!error
    };
}
