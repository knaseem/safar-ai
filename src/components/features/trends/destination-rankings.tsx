"use client"

import { TrendingDestination } from "@/lib/trends-data"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

export function DestinationRankings({ data }: { data: TrendingDestination[] }) {
    if (!data || data.length === 0) return <div className="text-center text-white/20 py-10">Loading trends...</div>

    return (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div
                    key={item.code}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors group cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3 ? "bg-white text-black" : "bg-white/10 text-white/40"
                            }`}>
                            {index + 1}
                        </div>
                        <div>
                            <div className="font-bold text-base group-hover:text-emerald-400 transition-colors">
                                {item.city}
                            </div>
                            <div className="text-xs text-white/40 font-mono">{item.country}</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className={`flex items-center gap-1 text-sm font-medium ${item.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.change > 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                            <span>{item.change > 0 ? '+' : ''}{item.change}%</span>
                        </div>
                        <span className="text-[10px] text-white/20 uppercase tracking-wider">Vol</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
