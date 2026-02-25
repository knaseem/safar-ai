"use client"

import { useState, useEffect } from "react"
import { TripItinerary } from "@/components/features/trip-itinerary"
import { PrayerOverlay } from "@/components/features/prayer-overlay"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { UnifiedBooking } from "@/types/booking"

interface TripContentProps {
    tripId: string
    tripData: any
    isHalal: boolean
    linkedBookings?: UnifiedBooking[]
}

export function TripContent({ tripId, tripData: initialTripData, isHalal, linkedBookings }: TripContentProps) {
    const [budgetData, setBudgetData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [prayerOpen, setPrayerOpen] = useState(false)
    const [liveTripData, setLiveTripData] = useState(initialTripData)

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const res = await fetch(`/api/budgets?tripId=${tripId}`)
                const data = await res.json()
                setBudgetData(data)
            } catch (err) {
                console.error("Failed to fetch budget:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchBudget()
    }, [tripId])

    // Get coordinates from first day for prayer overlay
    const firstDayCoords = liveTripData?.days?.[0]?.coordinates

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    const spentAmount = Object.values(budgetData?.categories || {}).reduce((a: any, b: any) => a + b, 0) as number
    const totalBudget = budgetData?.total_budget || 2500
    const usagePerc = Math.round((spentAmount / totalBudget) * 100)

    return (
        <div className="space-y-8">
            {/* Budget Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-6 py-4 glass-dark rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                        <Wallet className="size-4 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Trip Financials</div>
                        <div className="text-sm font-medium text-white/80">
                            {budgetData?.currency || "USD"} {totalBudget.toLocaleString()} Budget Allocated
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(usagePerc, 100)}%` }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                        <span className="text-[10px] text-white/40 font-mono">
                            {usagePerc}% Used
                        </span>
                    </div>

                    <Link href="/budget">
                        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 gap-2 text-xs">
                            Manage Budget <ArrowRight className="size-3" />
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Action Bar */}
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 justify-end"
            >
                <button
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent("open-chat-bubble", {
                            detail: {
                                initialPrompt: "I'd like to refine this itinerary",
                                isHalal
                            }
                        }))
                    }}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80 hover:border-white/20`}
                >
                    <span className="flex items-center gap-2">
                        ✨ Refine Trip
                    </span>
                </button>

                {firstDayCoords && (
                    <button
                        onClick={() => setPrayerOpen(!prayerOpen)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${prayerOpen
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                            : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            🕌 Prayer Times
                        </span>
                    </button>
                )}
            </motion.div>

            {/* Prayer Overlay */}
            <AnimatePresence>
                {prayerOpen && firstDayCoords && (
                    <PrayerOverlay
                        coordinates={firstDayCoords}
                        onClose={() => setPrayerOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Itinerary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <TripItinerary
                    data={liveTripData}
                    isHalal={isHalal}
                    isShared={false}
                    tripId={tripId}
                    linkedBookings={linkedBookings}
                />
            </motion.div>
        </div>
    )
}
