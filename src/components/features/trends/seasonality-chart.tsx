"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { SeasonalityData } from "@/lib/trends-data"

export function SeasonalityChart({ data }: { data: SeasonalityData[] }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-white/20">Loading data...</div>

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                    dataKey="month"
                    stroke="#ffffff40"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#ffffff40"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ stroke: '#ffffff20' }}
                />
                <Area
                    type="monotone"
                    dataKey="demand"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
