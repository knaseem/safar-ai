"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, MapPin, ArrowRight, BarChart3, Plane, Globe } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { getTrendingDestinations, getSeasonalityData, getAiInsight, TrendingDestination, SeasonalityData } from "@/lib/amadeus-trends";
import { Button } from "@/components/ui/button";

export default function TrendsPage() {
    const [destinations, setDestinations] = useState<TrendingDestination[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>("DXB");
    const [seasonality, setSeasonality] = useState<SeasonalityData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const cities = await getTrendingDestinations();
            setDestinations(cities);

            // Default to first city or Dubai
            const defaultCity = cities.find(c => c.code === "DXB") || cities[0];
            setSelectedCity(defaultCity.code);

            const chartData = await getSeasonalityData(defaultCity.code);
            setSeasonality(chartData);
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleCityChange = async (code: string) => {
        setSelectedCity(code);
        const data = await getSeasonalityData(code);
        setSeasonality(data);
    };

    const currentCity = destinations.find(d => d.code === selectedCity);

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">

            {/* Hero Section */}
            <div className="container mx-auto px-6 mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-3xl overflow-hidden bg-emerald-950/20 border border-emerald-500/10 p-10 md:p-16"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-purple-500/5 pointer-events-none" />
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                Amadeus Market Intelligence
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-6 font-display">
                            Global Travel Trends
                        </h1>
                        <p className="text-lg text-white/60 mb-8 leading-relaxed">
                            Real-time insights powered by AI analysis of over 500 million flight searches. Discover where the world is traveling next.
                        </p>

                        <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">12.5%</div>
                                <div className="text-xs text-white/40 uppercase tracking-wider">YoY Growth</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">850+</div>
                                <div className="text-xs text-white/40 uppercase tracking-wider">Destinations</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                                <div className="text-xs text-white/40 uppercase tracking-wider">Live Updates</div>
                            </div>
                        </div>
                    </div>

                    {/* Abstract Globe/Map Visual decoration could go here */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
                        <Globe className="w-full h-full text-emerald-500/20" strokeWidth={0.5} />
                    </div>
                </motion.div>
            </div>

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Rankings */}
                    <div className="lg:col-span-1 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="text-emerald-400 size-5" />
                            Trending Destinations
                        </h2>

                        <div className="space-y-4">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                                ))
                            ) : (
                                destinations.map((city, idx) => (
                                    <motion.button
                                        key={city.code}
                                        onClick={() => handleCityChange(city.code)}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`w-full group relative overflow-hidden rounded-xl p-4 transition-all duration-300 border ${selectedCity === city.code
                                                ? "bg-white/10 border-emerald-500/50"
                                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-neutral-800 overflow-hidden relative">
                                                <img src={city.imageUrl} alt={city.city} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{city.city}</h3>
                                                    <span className={`text-xs font-bold ${city.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {city.change > 0 ? '+' : ''}{city.change}%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/50">{city.country}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-white/40 uppercase mb-1">Score</div>
                                                <div className="text-lg font-bold font-mono">{city.score}</div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Chart & Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Chart Card */}
                        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Calendar className="text-purple-400 size-5" />
                                        Demand Forecast: <span className="text-emerald-400">{currentCity?.city}</span>
                                    </h2>
                                    <p className="text-sm text-white/40 mt-1">Projected search volume and pricing for next 12 months</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="text-xs font-medium">Demand</span>
                                    <div className="w-2 h-2 rounded-full bg-purple-400 ml-2" />
                                    <span className="text-xs font-medium">Price Index</span>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={seasonality}>
                                        <defs>
                                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            stroke="rgba(255,255,255,0.3)"
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.3)"
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            itemStyle={{ fontSize: '12px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="demand"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorDemand)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#c084fc"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorPrice)"
                                        // Need to scale price to match chart... usually dual axis, but for simple visual we mock same scale
                                        // For this mock let's just chart demand to keep it clean, or normalize
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* AI Insight Card */}
                        {currentCity && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                        <Plane className="size-20 transform group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <span className="p-1 rounded bg-white/10"><Plane className="size-4" /></span>
                                        AI Travel Insight
                                    </h3>
                                    <p className="text-sm text-white/70 leading-relaxed relative z-10">
                                        {getAiInsight(currentCity.city)}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                        <div className="text-xs text-white/50">Est. Flight Cost</div>
                                        <div className="font-mono font-bold text-emerald-400">${currentCity.priceEstimate}</div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 flex flex-col justify-center items-center text-center">
                                    <MapPin className="size-10 text-white/20 mb-4" />
                                    <h3 className="text-lg font-bold mb-2">Ready to explore {currentCity.city}?</h3>
                                    <p className="text-sm text-white/50 mb-6">Start planning your trip with our AI concierge.</p>
                                    <Button className="w-full bg-white text-black hover:bg-neutral-200">
                                        Plan Trip to {currentCity.city}
                                    </Button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
