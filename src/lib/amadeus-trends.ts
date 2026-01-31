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

// Mock Data for "Global Trending"
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
        imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2071&auto=format&fit=crop", // Placeholder
        priceEstimate: 780,
    },
];

// Mock Seasonality Curve (Standard Sine Wave + Noise)
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getTrendingDestinations = async (): Promise<TrendingDestination[]> => {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    return TRENDING_CITIES;
};

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
