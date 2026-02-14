"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, ArrowRight, Ticket, Clock } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ViatorActivity {
    productCode: string;
    title: string;
    price: {
        formatted: string;
    };
    rating: {
        average: number;
        count: number;
    };
    images: {
        url: string;
    }[];
    duration: string;
    bookingLink: string;
}

interface ViatorTrendsProps {
    cityName: string;
}

const REGIONS = {
    "United States": [
        "New York City", "Los Angeles", "Las Vegas", "Miami", "San Francisco", "Orlando", "Chicago"
    ],
    "Europe": [
        "London", "Paris", "Rome", "Barcelona", "Amsterdam", "Berlin", "Istanbul"
    ],
    "Middle East": [
        "Dubai", "Abu Dhabi", "Doha", "Riyadh", "Cairo", "Muscat"
    ],
    "Asia": [
        "Tokyo", "Bangkok", "Singapore", "Hong Kong", "Bali", "Mumbai", "Seoul"
    ]
};

export function ViatorTrends({ cityName }: ViatorTrendsProps) {
    const [selectedCity, setSelectedCity] = useState(cityName);
    const [activities, setActivities] = useState<ViatorActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Sync with parent prop initially, but allow local override
    useEffect(() => {
        if (cityName) setSelectedCity(cityName);
    }, [cityName]);

    useEffect(() => {
        async function fetchActivities() {
            setIsLoading(true);
            try {
                // Fetch from our API route which uses lib/viator.ts
                // We use 'attractions' as a generic keyword to get top rated stuff
                const res = await fetch(`/api/activities/search?query=${encodeURIComponent(selectedCity)}&category=attractions`);
                const data = await res.json();

                if (data.products) {
                    // Map the generic product format back to our simple activity interface if needed,
                    // or just use the data if it matches. 
                    // The API returns 'products' which are ViatorProduct[].
                    // Let's assume for now we get the simple structure or mapped structure.
                    // Actually, the API returns data.products. 
                    // Let's look at route.ts -> it returns searchProducts result.
                    // searchProducts returns MOCK_VIATOR_PRODUCTS (ViatorProduct[]) or real data.
                    // We need to map ViatorProduct to our UI needs.

                    const mapped = data.products.slice(0, 5).map((p: any) => ({
                        productCode: p.productCode,
                        title: p.title,
                        price: { formatted: p.pricing?.summary?.fromPrice ? `$${p.pricing.summary.fromPrice}` : 'Check Price' },
                        rating: { average: p.reviews?.combinedAverageRating || 0, count: p.reviews?.totalReviews || 0 },
                        images: p.images?.[0]?.variants?.[0]?.url ? [{ url: p.images[0].variants[0].url }] : [],
                        duration: p.duration?.fixedDurationInMinutes ? `${Math.round(p.duration.fixedDurationInMinutes / 60)} hours` : 'Flexible',
                        bookingLink: p.productUrl || '#'
                    }));
                    setActivities(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch Viator trends", err);
            } finally {
                setIsLoading(false);
            }
        }

        if (selectedCity) {
            fetchActivities();
        }
    }, [selectedCity]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                        <Ticket className="size-5 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Top Rated Experiences</h3>
                        <p className="text-white/40 text-sm">Curated activities in {selectedCity}</p>
                    </div>
                    <InfoTooltip content="Top rated tours and activities sourced from Viator (TripAdvisor)." />
                </div>

                {/* City Selection Dropdown */}
                <div className="w-[240px]">
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="w-full bg-neutral-900 border-white/10 text-white">
                            <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px] overflow-y-auto bg-neutral-900 border-white/10 text-white">
                            {Object.entries(REGIONS).map(([region, cities]) => (
                                <SelectGroup key={region}>
                                    <SelectLabel className="text-orange-400 text-xs font-bold uppercase tracking-wider px-2 py-1.5 mt-2 bg-white/5">
                                        {region}
                                    </SelectLabel>
                                    {cities.map(city => (
                                        <SelectItem
                                            key={city}
                                            value={city}
                                            className="pl-4 focus:bg-white/10 cursor-pointer"
                                        >
                                            {city}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="h-[280px] bg-white/5 rounded-xl animate-pulse" />
                    ))
                ) : (
                    activities.map((activity, i) => (
                        <a
                            key={activity.productCode}
                            href={activity.bookingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex flex-col h-[280px] rounded-xl overflow-hidden border border-white/10 bg-neutral-900 transition-transform hover:-translate-y-1"
                        >
                            {/* Image Background */}
                            <div className="absolute inset-0">
                                <img
                                    src={activity.images[0]?.url || '/placeholder.jpg'}
                                    alt={activity.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40 transform-gpu"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col justify-end h-full p-4 space-y-2">
                                <div className="flex items-center gap-1 text-orange-400 text-xs font-bold">
                                    <Star className="size-3 fill-orange-400" />
                                    <span>{activity.rating.average}</span>
                                    <span className="text-white/40">({activity.rating.count})</span>
                                </div>

                                <h4 className="font-bold text-sm leading-tight line-clamp-2 text-white group-hover:text-orange-400 transition-colors">
                                    {activity.title}
                                </h4>

                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    <div className="flex items-center gap-1 text-white/60 text-xs">
                                        <Clock className="size-3" />
                                        <span>{activity.duration}</span>
                                    </div>
                                    <span className="font-bold text-white">{activity.price.formatted}</span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </motion.div>
    );
}
