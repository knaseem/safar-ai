import { useState, useEffect } from 'react';
import { EXCHANGE_RATES } from '@/lib/currency';

export function useExchangeRates() {
    const [rates, setRates] = useState<Record<string, number>>(EXCHANGE_RATES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/USD');
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();

                // Merge live rates with static fallback to ensure all supported currencies exist
                // This prioritizes live data but keeps static as backup for any missing codes
                setRates(prev => ({ ...prev, ...data.rates }));
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch live rates, using static backup.", err);
                setError(true);
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    return { rates, loading, error };
}
