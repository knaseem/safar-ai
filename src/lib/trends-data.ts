import { createFlightSearch } from './duffel';

export interface TrendingDestination {
    city: string;
    country: string;
    code: string;
    score: number; // 0-100 "Hotness" score
    change: number; // Percentage change from last month
    imageUrl: string;
    priceEstimate: number;
}

export interface SeasonalityData {
    month: string;
    demand: number; // 0-100 scale
    price: number; // Avg price index
}

// Existing mock data as fallback/initial state
const TRENDING_CITIES: TrendingDestination[] = [
    {
        city: "Doha",
        country: "Qatar",
        code: "DOH",
        score: 98,
        change: 12.5,
        imageUrl: "/images/ai-hero/doha-hero.png",
        priceEstimate: 850,
    },
    {
        city: "Dubai",
        country: "UAE",
        code: "DXB",
        score: 95,
        change: 5.2,
        imageUrl: "/images/ai-hero/dubai-hero.png",
        priceEstimate: 920,
    },
    {
        city: "Mecca",
        country: "Saudi Arabia",
        code: "JED",
        score: 92,
        change: 8.7,
        imageUrl: "/images/ai-hero/mecca-hero.png",
        priceEstimate: 1100,
    },
    {
        city: "Zanzibar",
        country: "Tanzania",
        code: "ZNZ",
        score: 88,
        change: 15.3,
        imageUrl: "/images/ai-hero/zanzibar-hero.png",
        priceEstimate: 1350,
    },
    {
        city: "Medina",
        country: "Saudi Arabia",
        code: "MED",
        score: 85,
        change: 4.1,
        imageUrl: "/images/ai-hero/medina-hero.png",
        priceEstimate: 1050,
    },
    {
        city: "Istanbul",
        country: "Turkey",
        code: "IST",
        score: 82,
        change: -2.3,
        imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2071&auto=format&fit=crop",
        priceEstimate: 780,
    },
];

// Cities to check for real trends (Curated list)
const CITIES_TO_CHECK = [
    { city: 'Dubai', country: 'UAE', code: 'DXB', img: '/images/ai-hero/dubai-hero.png' },
    { city: 'London', country: 'UK', code: 'LHR', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070' },
    { city: 'Paris', country: 'France', code: 'CDG', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073' },
    { city: 'New York', country: 'USA', code: 'JFK', img: 'https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=2070' },
    { city: 'Tokyo', country: 'Japan', code: 'HND', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1994' }
];

export const getTrendingDestinations = async (): Promise<TrendingDestination[]> => {
    try {
        // We'll search for flights 1 month from now to get a "Trend" price
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const dateStr = futureDate.toISOString().split('T')[0];

        // Fetch prices for all cities in parallel
        const results = await Promise.all(CITIES_TO_CHECK.map(async (dest) => {
            try {
                // Duffel requires an origin. We'll assume NYC (JFK) or London (LHR) as default origin for global trends,
                // or ideally this would come from the user's location. For now, let's use 'LHR' (London) as base, unless dest is London.
                const origin = dest.code === 'LHR' ? 'JFK' : 'LHR';

                const data = await createFlightSearch({
                    origin: origin,
                    destination: dest.code,
                    departureDate: dateStr,
                    adults: 1
                });

                // Find cheapest offer
                let cheapestPrice = 9999;
                if (data && data.offers && data.offers.length > 0) {
                    const prices = data.offers.map((o: any) => parseFloat(o.total_amount));
                    cheapestPrice = Math.min(...prices);
                }

                // If check failed (e.g. no offers), return null to filter out
                if (cheapestPrice === 9999) return null;

                return {
                    city: dest.city,
                    country: dest.country,
                    code: dest.code,
                    score: Math.floor(Math.random() * 20) + 80, // Random "Hotness" 80-100
                    change: Number((Math.random() * 20 - 5).toFixed(1)), // Random text change
                    imageUrl: dest.img,
                    priceEstimate: cheapestPrice
                };
            } catch (e) {
                console.error(`Failed to fetch trend for ${dest.city}`, e);
                return null;
            }
        }));

        // Filter valid results
        const validResults = results.filter(r => r !== null) as TrendingDestination[];

        if (validResults.length > 0) {
            return validResults.sort((a, b) => a.priceEstimate - b.priceEstimate);
        }

    } catch (err) {
        console.warn('Failed to fetch Duffel trends, using fallback data:', err);
    }

    // Fallback to mock data if API fails
    return TRENDING_CITIES;
};

// Mock Seasonality Curve (Standard Sine Wave + Noise)
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getSeasonalityData = async (destinationCode: string): Promise<SeasonalityData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Deterministic "random" based on code char codes to keep charts stable but different per city
    const seed = destinationCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return MONTHS.map((month, index) => {
        // Peak season usually Summer (Jun-Aug) or Winter (Dec) depending on logic, let's randomize slightly
        const baseDemand = 60 + Math.sin((index + seed) * 0.5) * 30;
        const noise = (Math.random() * 10) - 5;

        return {
            month,
            demand: Math.max(20, Math.min(100, Math.round(baseDemand + noise))),
            price: Math.round(500 + (baseDemand * 8) + noise * 10),
        };
    });
};

export const getAiInsight = (destination: string) => {
    return `AI analysis indicates ${destination} is experiencing a surge in booking volume (+15% YoY). Best time to visit is currently projected to be mid-October for optimal price-to-crowd ratio.`;
};
