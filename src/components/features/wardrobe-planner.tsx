"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Shirt, Umbrella, Sun, CloudRain, Snowflake, Wind, Activity, Check, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface WardrobePlannerProps {
    destination: string
    days: number
    activities: string[]
    onClose?: () => void
}

type OutfitRecommendation = {
    day: number
    weather: {
        condition: "sunny" | "rainy" | "cloudy" | "snowy"
        tempMax: number
        tempMin: number
    }
    activityVibe: string
    items: {
        name: string
        type: "top" | "bottom" | "outerwear" | "shoes" | "accessory"
        icon: any
    }[]
    tip: string
}

export function WardrobePlanner({ destination, days, activities, onClose }: WardrobePlannerProps) {
    const [loading, setLoading] = useState(true)
    const [outfits, setOutfits] = useState<OutfitRecommendation[]>([])
    const [activeDay, setActiveDay] = useState(1)

    useEffect(() => {
        // Simulate AI combining weather and activities to generate outfits
        const generateOutfits = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000))

            const isCold = ["Switzerland", "Iceland", "Zermatt"].some(place => destination.includes(place))
            const isHot = ["Dubai", "Maldives", "Qatar", "Saudi"].some(place => destination.includes(place))

            const generated: OutfitRecommendation[] = Array.from({ length: days }).map((_, i) => {
                const day = i + 1
                const isRainy = Math.random() > 0.7 && !isHot

                // Weather Simulation
                let condition: "sunny" | "rainy" | "cloudy" | "snowy" = "sunny"
                let tempMax = 25
                let tempMin = 18

                if (isCold) {
                    condition = Math.random() > 0.5 ? "snowy" : "cloudy"
                    tempMax = 5
                    tempMin = -2
                } else if (isHot) {
                    condition = "sunny"
                    tempMax = 35
                    tempMin = 26
                } else if (isRainy) {
                    condition = "rainy"
                    tempMax = 20
                    tempMin = 15
                } else {
                    condition = Math.random() > 0.5 ? "sunny" : "cloudy"
                }

                // Activity Simulation
                const mappedActivity = activities[i % activities.length] || "Exploring the city"
                const isFormal = mappedActivity.toLowerCase().includes("dinner") || mappedActivity.toLowerCase().includes("gala")
                const isActive = mappedActivity.toLowerCase().includes("hike") || mappedActivity.toLowerCase().includes("tour") || mappedActivity.toLowerCase().includes("walk")

                // Generate Items based on context
                const items: OutfitRecommendation['items'] = []

                if (isCold) {
                    items.push({ name: "Thermal Base Layer", type: "top", icon: Shirt })
                    items.push({ name: "Insulated Jacket", type: "outerwear", icon: Snowflake })
                    items.push({ name: "Waterproof Boots", type: "shoes", icon: Activity })
                } else if (isHot) {
                    items.push({ name: "Lightweight Linen Shirt", type: "top", icon: Shirt })
                    items.push({ name: "Breathable Shorts", type: "bottom", icon: Activity })
                    items.push({ name: "Comfortable Sandals", type: "shoes", icon: Activity })
                    items.push({ name: "UV Protection Sunglasses", type: "accessory", icon: Sun })
                } else {
                    if (isFormal) {
                        items.push({ name: "Smart Casual Blazer", type: "outerwear", icon: Shirt })
                        items.push({ name: "Tailored Trousers", type: "bottom", icon: Activity })
                        items.push({ name: "Dress Shoes", type: "shoes", icon: Activity })
                    } else if (isActive) {
                        items.push({ name: "Moisture-wicking T-Shirt", type: "top", icon: Shirt })
                        items.push({ name: "Activewear Leggings/Shorts", type: "bottom", icon: Activity })
                        items.push({ name: "Supportive Walking Shoes", type: "shoes", icon: Activity })
                    } else {
                        items.push({ name: "Casual Cotton Tee", type: "top", icon: Shirt })
                        items.push({ name: "Comfortable Jeans", type: "bottom", icon: Activity })
                        items.push({ name: "Versatile Sneakers", type: "shoes", icon: Activity })
                    }
                }

                if (condition === "rainy") {
                    items.push({ name: "Lightweight Raincoat", type: "outerwear", icon: Umbrella })
                }

                let tip = "Stay comfortable and enjoy the day!"
                if (isFormal) tip = "A touch of elegance goes a long way here."
                if (isActive) tip = "Prioritize comfort and movement for today's adventures."
                if (condition === "rainy") tip = "Don't let the rain dampen your spirits—stay dry!"
                if (isHot) tip = "Stay hydrated and stick to the shade when possible."

                return {
                    day,
                    weather: { condition, tempMax, tempMin },
                    activityVibe: mappedActivity,
                    items,
                    tip
                }
            })

            setOutfits(generated)
            setLoading(false)
        }

        generateOutfits()
    }, [destination, days, activities])

    const nextDay = () => setActiveDay(prev => Math.min(prev + 1, days))
    const prevDay = () => setActiveDay(prev => Math.max(prev - 1, 1))

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl h-[400px]">
                <div className="relative">
                    <Shirt className="size-10 text-emerald-400 opacity-50 absolute" />
                    <Sparkles className="size-10 text-emerald-400 animate-pulse relative" />
                </div>
                <h3 className="text-lg font-bold text-white mt-6 mb-2">Analyzing Wardrobe</h3>
                <p className="text-sm text-white/50 text-center max-w-xs">
                    Cross-referencing {destination}'s weather forecast with your planned activities...
                </p>
                <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="h-full w-1/2 bg-emerald-500 rounded-full"
                    />
                </div>
            </div>
        )
    }

    const currentOutfit = outfits.find(o => o.day === activeDay)
    if (!currentOutfit) return null

    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case "sunny": return <Sun className="size-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            case "rainy": return <CloudRain className="size-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
            case "snowy": return <Snowflake className="size-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            case "cloudy":
            default: return <Wind className="size-5 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" />
        }
    }

    return (
        <div className="relative bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="size-4 text-emerald-400" />
                        <h2 className="text-lg font-bold text-white">Smart Wardrobe</h2>
                    </div>
                    <p className="text-xs text-white/50">AI-curated looks for {destination}</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <X className="size-5" />
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeDay}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-5 gap-8"
                    >
                        {/* Context Panel */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white leading-none">Day {currentOutfit.day}</h3>
                                <div className="flex gap-1">
                                    {Array.from({ length: days }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-1.5 rounded-full transition-all",
                                                i + 1 === activeDay ? "w-6 bg-emerald-500" : "w-1.5 bg-white/20"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        {getWeatherIcon(currentOutfit.weather.condition)}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold text-white">{currentOutfit.weather.tempMax}°</span>
                                            <span className="text-sm font-medium text-white/40">{currentOutfit.weather.tempMin}°</span>
                                        </div>
                                        <p className="text-xs text-white/50 capitalize">{currentOutfit.weather.condition} conditions expected</p>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-white/5" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-bold mb-1">Planned Activity</p>
                                    <p className="text-sm text-white/80">{currentOutfit.activityVibe}</p>
                                </div>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                <p className="text-sm text-emerald-100/80 italic">"{currentOutfit.tip}"</p>
                            </div>
                        </div>

                        {/* Outfit Items */}
                        <div className="md:col-span-3">
                            <h4 className="text-sm font-bold text-white/80 mb-4 tracking-wide uppercase">Suggested Attire</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {currentOutfit.items.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors group cursor-default"
                                    >
                                        <div className="p-2 border border-white/10 rounded-lg bg-black/40 text-emerald-400 group-hover:scale-110 transition-transform">
                                            <item.icon className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-0.5">{item.type}</p>
                                            <p className="text-sm font-medium text-white/90">{item.name}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={prevDay}
                    disabled={activeDay === 1}
                    className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 gap-2"
                >
                    <ChevronLeft className="size-4" /> Previous
                </Button>
                <div className="text-xs font-medium text-white/30 hidden sm:block">
                    Swipe or use arrows to view different days
                </div>
                <Button
                    variant="ghost"
                    onClick={nextDay}
                    disabled={activeDay === days}
                    className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 gap-2"
                >
                    Next Day <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    )
}
