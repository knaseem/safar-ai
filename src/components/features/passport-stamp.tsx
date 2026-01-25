"use client"

import { motion } from "framer-motion"
import { MapPin, Plane, Sparkles, Compass, Map, Camera } from "lucide-react"

interface PassportStampProps {
    destination: string
    date: string
    vibe?: string
    color?: 'gold' | 'emerald' | 'cyan' | 'rose' | 'amber'
}

const STAMP_COLORS = {
    gold: "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5",
    emerald: "border-emerald-500 text-emerald-500 bg-emerald-500/5",
    cyan: "border-cyan-500 text-cyan-500 bg-cyan-500/5",
    rose: "border-rose-500 text-rose-500 bg-rose-500/5",
    amber: "border-amber-600 text-amber-600 bg-amber-600/5",
}

const VIBE_ICONS: Record<string, any> = {
    luxury: Sparkles,
    adventure: Compass,
    culture: Map,
    chill: Camera,
    default: Plane
}

export function PassportStamp({ destination, date, vibe = "default", color = "gold" }: PassportStampProps) {
    const Icon = VIBE_ICONS[vibe.toLowerCase()] || VIBE_ICONS.default
    const colorStyles = STAMP_COLORS[color] || STAMP_COLORS.gold

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: Math.random() * 20 - 10 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className={`
                w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center p-2 
                ${colorStyles} opacity-80 backdrop-blur-sm relative group
            `}
        >
            <div className="absolute inset-2 border border-current rounded-full opacity-20" />

            <Icon className="size-6 mb-1 opacity-70" />
            <div className="text-[8px] font-bold uppercase tracking-tighter text-center leading-none max-w-full truncate px-1">
                {destination}
            </div>
            <div className="text-[6px] font-medium opacity-50 mt-0.5">
                {date}
            </div>

            {/* Inky grunge effect (optional overlay) */}
            <div className="absolute inset-0 mix-blend-overlay opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

            {/* Tooltip on hover */}
            <div className="absolute top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black text-white text-[10px] px-2 py-0.5 rounded pointer-events-none z-20">
                {vibe} trip
            </div>
        </motion.div>
    )
}
