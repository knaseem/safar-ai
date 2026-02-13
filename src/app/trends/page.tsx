"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, ArrowLeft, Globe, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { getTrendingDestinations, getSeasonalityData, TrendingDestination, SeasonalityData } from "@/lib/trends-data";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export default function TrendsPage() {
    const router = useRouter();
    const [destinations, setDestinations] = useState<TrendingDestination[]>([]);
    const [selectedCityCode, setSelectedCityCode] = useState<string>("DXB");
    const [selectedCityName, setSelectedCityName] = useState<string>("Dubai");
    const [seasonality, setSeasonality] = useState<SeasonalityData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [liveTraffic, setLiveTraffic] = useState<{ total: number; active: number; topCountries: { country: string; count: number }[] } | null>(null);

    // Initial Data Load
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const cities = await getTrendingDestinations();
            setDestinations(cities);

            // Live Traffic (OpenSky)
            import('@/lib/opensky').then(mod => {
                mod.fetchLiveTraffic().then(data => setLiveTraffic(data));
            });

            // Seasons
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

                    {/* Global Pulse Card */}
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 flex flex-col justify-center relative group">
                        {/* Live Indicator Pulse - Scoped overflow */}
                        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">LIVE</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <Globe className="size-6 text-emerald-400" />
                            <h3 className="text-lg font-bold">Global Pulse</h3>
                            <InfoTooltip content="Real-time air traffic data sourced directly from OpenSky Network API." />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-white/60">Total Flights Airborne</span>
                                    <span className="font-mono text-2xl font-bold text-white">
                                        {liveTraffic ? liveTraffic.total.toLocaleString() : "..."}
                                    </span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: "75%" }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-white/60">Active Commercial Routes</span>
                                    <span className="font-mono text-xl font-bold text-blue-400">
                                        {liveTraffic ? liveTraffic.active.toLocaleString() : "..."}
                                    </span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-6">
                                    <motion.div
                                        className="h-full bg-blue-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: "45%" }}
                                        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                                    />
                                </div>

                                {/* Top Countries Leaderboard */}
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Busiest Skies (Live)</h4>
                                    {liveTraffic?.topCountries ? (
                                        liveTraffic.topCountries.map((item, i) => (
                                            <div key={item.country} className="flex items-center justify-between text-xs group">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-4 text-white/20 font-mono">{i + 1}</span>
                                                    <span className="text-white/80 group-hover:text-emerald-400 transition-colors truncate max-w-[120px]">
                                                        {item.country || "Intl. Airspace"}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-white/40 group-hover:text-white transition-colors">
                                                    {item.count.toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-[10px] text-white/30 text-center uppercase tracking-widest">
                                    Data Source: OpenSky Network API
                                </p>
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
                                <InfoTooltip content="Price trends generated by probing live Duffel Flight Search API for future dates." />
                            </div>

                            {/* City Selector */}
                            <div className="flex gap-2">
                                {[
                                    { code: 'DXB', name: 'Dubai' },
                                    { code: 'LHR', name: 'London' },
                                    { code: 'JFK', name: 'New York' },
                                    { code: 'CDG', name: 'Paris' },
                                    { code: 'HND', name: 'Tokyo' },
                                    { code: 'JED', name: 'Mecca' }
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
                        className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 max-h-[500px] flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                            <div className="bg-purple-500/20 p-2 rounded-lg">
                                <TrendingUp className="size-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Trending Now</h3>
                                <p className="text-white/40 text-sm">Fastest growing destinations</p>
                            </div>
                            <InfoTooltip content="Destinations with highest search volume growth based on Amadeus Market Insights (Simulated)." />
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
