"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, ArrowLeft, Globe, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { getTrendingDestinations, getSeasonalityData, TrendingDestination, SeasonalityData } from "@/lib/trends-data";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function TrendsPage() {
    const router = useRouter();
    const [destinations, setDestinations] = useState<TrendingDestination[]>([]);
    const [selectedCityCode, setSelectedCityCode] = useState<string>("DXB");
    const [selectedCityName, setSelectedCityName] = useState<string>("Dubai");
    const [seasonality, setSeasonality] = useState<SeasonalityData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Data Load
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const cities = await getTrendingDestinations();
            setDestinations(cities);

            // Should match the hardcoded buttons for visual consistency or use the API list
            // For this hybrid approach, we'll try to find the selected city in our data
            const defaultData = await getSeasonalityData("DXB");
            setSeasonality(defaultData);
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleCityChange = async (code: string, name: string) => {
        setSelectedCityCode(code);
        setSelectedCityName(name);
        const data = await getSeasonalityData(code);
        setSeasonality(data);
    };

    // Helper to render trend percentage
    const TrendBadge = ({ value }: { value: number }) => (
        <span className={`text-xs font-bold ${value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {value > 0 ? '+' : ''}{value}%
        </span>
    );

    return (
        <div className="min-h-screen bg-black text-white">

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/')}
                            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                <TrendingUp className="size-5 text-emerald-500" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                Global Market Insights
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 space-y-8">
                <Breadcrumb />

                {/* Intro Section - The "World is Moving" Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="col-span-2 relative overflow-hidden rounded-3xl bg-neutral-900 border border-white/10 p-8 min-h-[300px] flex flex-col justify-end group">
                        {/* Static placeholder image for reliability, or dynamic if we had one */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">The World is Moving.</h2>
                            <p className="text-white/60 max-w-xl text-lg">
                                Real-time travel intelligence powered by Duffel.
                                Analyze seasonality, discover rising stars, and book at the perfect moment.
                            </p>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="size-6 text-emerald-400" />
                            <h3 className="text-lg font-bold">Global Pulse</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/60">Total Flights Tracked</span>
                                <span className="font-mono text-emerald-400">248,932</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[75%]" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/60">Active Routes</span>
                                <span className="font-mono text-emerald-400">12,401</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[60%]" />
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 mt-4 animate-pulse">
                                Live Data Stream Active
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Seasonality Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 bg-neutral-900/50 border border-white/10 rounded-3xl p-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-lg">
                                    <Calendar className="size-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Seasonality Curve</h3>
                                    <p className="text-white/40 text-sm">Visitor volume forecast for {selectedCityName}</p>
                                </div>
                            </div>

                            {/* City Selector */}
                            <div className="flex gap-2">
                                {[
                                    { code: 'DXB', name: 'Dubai' },
                                    { code: 'DOH', name: 'Doha' },
                                    { code: 'JED', name: 'Mecca' },
                                    { code: 'ZNZ', name: 'Zanzibar' }
                                ].map(city => (
                                    <button
                                        key={city.code}
                                        onClick={() => handleCityChange(city.code, city.name)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedCityCode === city.code ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                                    >
                                        {city.code}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={seasonality}>
                                    <defs>
                                        <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                                        hide // Hide Y axis for cleaner look per user screenshot
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ fontSize: '12px', color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="demand"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorDemand)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Right: Top Destinations */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 max-h-[500px] overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                            <div className="bg-purple-500/20 p-2 rounded-lg">
                                <TrendingUp className="size-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Trending Now</h3>
                                <p className="text-white/40 text-sm">Fastest growing destinations</p>
                            </div>
                        </div>

                        <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 space-y-4">
                            {isLoading ? (
                                <div className="text-white/40 text-sm">Loading market data...</div>
                            ) : (
                                destinations.slice(0, 5).map((city, i) => (
                                    <div key={city.code} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="size-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                                                    {city.city}, {city.country}
                                                </div>
                                                <div className="text-xs text-white/40">{city.code}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <TrendBadge value={city.change} />
                                            <div className="text-[10px] text-white/30 uppercase">Vol</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

            </main>
        </div>
    )
}
