
import { getAmadeus } from './amadeus';

// Interfaces matching Amadeus API responses
export interface AnalyticsData {
    period: string; // "2024-01"
    score: number; // 0-100 probability or volume
}

export interface DestinationRanking {
    destination: string; // IATA code
    name?: string; // Enriched name
    rank: number;
    trend: 'up' | 'down' | 'stable';
    change: number; // Percentage change
}

/**
 * SIMULATION LAYER: Market Insights
 * Returns mock data if keys are missing or in test mode.
 */

// Mock Data Generators using deterministic random based on string seed
const seededRandom = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
}

export async function fetchBusiestPeriods(cityCode: string): Promise<AnalyticsData[]> {
    const amadeus = getAmadeus();
    // REAL API CALL
    if (amadeus) {
        try {
            const response = await (amadeus as any).travel.analytics.airTraffic.busiestPeriod.get({
                cityCode: cityCode,
                period: '2024',
                direction: 'ARRIVING'
            });

            if (response.data && response.data.length > 0) {
                return response.data;
            }
        } catch (e) {
            console.warn("Amadeus API limit or error, falling back to sim", e);
        }
    }

    // SIMULATION MODE
    // Generate a realistic seasonality curve (High in Summer/Dec, Low in Feb/Nov)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Northern hemisphere default seasonality
    const baseSeasonality = [0.4, 0.3, 0.5, 0.6, 0.7, 0.9, 1.0, 0.9, 0.7, 0.6, 0.4, 0.8];

    return months.map((m, i) => {
        const noise = (seededRandom(cityCode + m) * 0.2) - 0.1; // +/- 10% randomness
        let val = baseSeasonality[i] + noise;

        // Adjust for specific known hubs (mock logic)
        if (cityCode === 'DXB' && (i < 3 || i > 9)) val += 0.4; // Winter sun
        if (cityCode === 'SYD' && (i < 2 || i > 10)) val += 0.4; // Southern summer

        return {
            period: m,
            score: Math.min(Math.max(Math.round(val * 100), 10), 100)
        };
    });
}

export async function fetchTrendingDestinations(originCity: string): Promise<DestinationRanking[]> {
    const amadeus = getAmadeus();
    // REAL API CALL
    if (amadeus) {
        try {
            const response = await (amadeus as any).shopping.flightDestinations.get({
                origin: originCity,
                oneWay: false,
                nonStop: false
            });

            if (response.data && response.data.length > 0) {
                return response.data.map((item: any, index: number) => ({
                    destination: item.destination,
                    name: item.destination, // Usually just city code from this API
                    rank: index + 1,
                    trend: Math.random() > 0.5 ? 'up' : 'stable',
                    change: Math.round(Math.random() * 20)
                }));
            }
        } catch (e) {
            console.warn("Amadeus Inspiration API fail, falling back to curated list", e);
        }
    }

    // SIMULATION MODE / FALLBACK
    // Return a curated list of "Trending" spots if API fails or returns empty
    const mockTrends: DestinationRanking[] = [
        { destination: 'TYO', name: 'Tokyo, Japan', rank: 1, trend: 'up', change: 24 },
        { destination: 'PAR', name: 'Paris, France', rank: 2, trend: 'stable', change: 2 },
        { destination: 'DXB', name: 'Dubai, UAE', rank: 3, trend: 'up', change: 15 },
        { destination: 'NYC', name: 'New York, USA', rank: 4, trend: 'down', change: -5 },
        { destination: 'SIN', name: 'Singapore', rank: 5, trend: 'up', change: 8 },
        { destination: 'ROM', name: 'Rome, Italy', rank: 6, trend: 'stable', change: 0 },
        { destination: 'CPT', name: 'Cape Town', rank: 7, trend: 'up', change: 12 },
        { destination: 'DPS', name: 'Bali, Indonesia', rank: 8, trend: 'up', change: 18 },
        { destination: 'IST', name: 'Istanbul, Turkey', rank: 9, trend: 'down', change: -2 },
        { destination: 'BCN', name: 'Barcelona, Spain', rank: 10, trend: 'stable', change: 4 },
    ];

    // Shuffle slightly based on origin for variety
    return mockTrends.sort(() => Math.random() - 0.5);
}
