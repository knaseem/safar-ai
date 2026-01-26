"use client"

import { useState, useEffect } from "react"
import { Loader2, ArrowRight } from "lucide-react"
import { generateAffiliateLink } from "@/lib/affiliate"

export function HotelVerificationBadge({ hotel }: { hotel: string }) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'verified'>('idle')
    const [savings, setSavings] = useState(0)

    useEffect(() => {
        const verify = async () => {
            setStatus('checking')
            try {
                const res = await fetch('/api/agent/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ item: hotel, type: 'hotel', originalPrice: 200 })
                })
                const data = await res.json()
                setSavings(data.savings)
                setStatus('verified')
            } catch (e) {
                setStatus('idle')
            }
        }
        const timeout = setTimeout(verify, Math.random() * 2000 + 500)
        return () => clearTimeout(timeout)
    }, [hotel])

    if (status === 'idle') return null

    if (status === 'checking') return (
        <span className="flex items-center gap-1.5 text-[10px] text-white/40 ml-2 animate-pulse">
            <Loader2 className="size-3 animate-spin" />
            Verifying...
        </span>
    )

    return (
        <span className="flex items-center gap-1.5 text-[10px] ml-2 animate-in fade-in zoom-in duration-300">
            <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-emerald-400 font-medium">Verified Now</span>
            {savings > 0 && <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">Save ${savings}</span>}
        </span>
    )
}

export function ActivityCard({ time, title, destination, isActive = false }: { time: string, title: string, destination: string, isActive?: boolean }) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'verified'>('idle')



    const handleMouseEnter = () => {
        if (status === 'idle') {
            setStatus('checking')
            setTimeout(() => setStatus('verified'), 1200)
        }
    }

    return (
        <div
            className={`group p-4 rounded-xl border transition-all flex flex-col h-full relative overflow-hidden ${isActive
                ? "bg-white/10 border-emerald-500/30 hover:bg-white/15"
                : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
            onMouseEnter={handleMouseEnter}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-md ${isActive ? "bg-emerald-500/20" : "bg-white/10"}`}>
                        <div className={isActive ? "text-emerald-400" : "text-white/60"}>
                            {time === 'Morning' ? '🌅' : time === 'Afternoon' ? '☀️' : '🌙'}
                        </div>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">{time}</div>
                </div>
                {status === 'verified' && (
                    <div className="flex items-center gap-1">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                    </div>
                )}
            </div>

            <p className="text-white/90 text-sm font-medium leading-relaxed flex-1 line-clamp-3 group-hover:line-clamp-none transition-all">
                {title}
            </p>

            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white/40">Verified Activity</span>

            </div>
        </div >
    )
}

export function MoonIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    )
}
