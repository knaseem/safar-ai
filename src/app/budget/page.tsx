"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wallet, Plus, ArrowRight, Sparkles, AlertCircle } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { BudgetDashboard } from "@/components/features/budget-dashboard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"
import { AnimatePresence } from "framer-motion"


import { Trip, Budget, TripWithBudget } from "@/lib/types"

export default function BudgetPage() {
    const [tripsWithBudgets, setTripsWithBudgets] = useState<TripWithBudget[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedTripId, setExpandedTripId] = useState<string | null>(null)
    const [isDemoMode, setIsDemoMode] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch for performance
                const [tripsRes, budgetRes] = await Promise.all([
                    fetch("/api/trips"),
                    fetch("/api/budgets")
                ])

                const tripsData = await tripsRes.json()
                const budgetsData = await budgetRes.json()

                if (tripsData.trips) {
                    // Efficient in-memory mapping
                    const enrichedTrips = tripsData.trips.map((trip: Trip) => {
                        const budget = Array.isArray(budgetsData)
                            ? budgetsData.find((b: Budget) => b.trip_id === trip.id)
                            : null
                        return { ...trip, budget: budget || null }
                    })
                    setTripsWithBudgets(enrichedTrips)
                }
            } catch (err) {
                console.error("Failed to fetch data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSaveBudget = async (tripId: string, categories: any, totalBudget: number, currency: string) => {
        try {
            const res = await fetch("/api/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tripId,
                    total_budget: totalBudget,
                    currency,
                    categories
                })
            })
            if (res.ok) {
                toast.success("Budget Updated", { description: "Changes saved to cloud." })
            }
        } catch (err) {
            toast.error("Save Failed")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <Sparkles className="size-4" />
                            <span className="text-xs uppercase tracking-[0.2em] font-bold">Financial Intelligence</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold">Budget Optimizer</h1>
                        <p className="text-white/40 mt-4 max-w-xl">
                            Consolidated view of your travel investments. Manage spending across all active expeditions and optimize your value-to-vibe ratio.
                        </p>
                    </div>
                    <Link href="/">
                        <Button className="bg-white text-black hover:bg-white/90 font-bold rounded-xl px-6">
                            Plan New Trip
                        </Button>
                    </Link>
                </div>

                {tripsWithBudgets.length === 0 && !isDemoMode ? (
                    <div className="glass-dark rounded-3xl p-20 text-center border border-white/5">
                        <Wallet className="size-16 text-white/10 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-2">No active budgets found</h2>
                        <p className="text-white/40 mb-8">Save an itinerary to start optimizing your travel spend.</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/">
                                <Button className="bg-white text-black hover:bg-white/90 font-bold rounded-xl px-6">
                                    Discover Destinations
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="border-white/10 hover:bg-white/5 font-bold rounded-xl px-6"
                                onClick={() => {
                                    setIsDemoMode(true)
                                    setTripsWithBudgets([{
                                        id: 'demo-trip',
                                        user_id: 'demo-user',
                                        destination: 'Kyoto, Japan (Demo)',
                                        start_date: new Date().toISOString(),
                                        end_date: new Date().toISOString(),
                                        created_at: new Date().toISOString(),
                                        trip_name: 'Kyoto Cultural Expedition',
                                        budget: {
                                            trip_id: 'demo-trip',
                                            user_id: 'demo-user',
                                            total_budget: 5000,
                                            currency: 'USD',
                                            categories: {
                                                flights: 1200,
                                                lodging: 1500,
                                                food: 800,
                                                activities: 400,
                                                other: 200
                                            }
                                        }
                                    }])
                                    setExpandedTripId('demo-trip')
                                }}
                            >
                                Try Demo
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tripsWithBudgets.map((trip) => {
                            const isExpanded = expandedTripId === trip.id
                            const budgetData = trip.budget?.categories || {}
                            const spent = Object.values(budgetData).reduce((a: any, b: any) => a + b, 0) as number
                            const limit = trip.budget?.total_budget || 2500
                            const healthColor = spent > limit ? "text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" :
                                spent > limit * 0.8 ? "text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" :
                                    "text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"

                            return (
                                <motion.div
                                    key={trip.id}
                                    layout
                                    className={cn(
                                        "group overflow-hidden rounded-3xl border transition-all duration-500",
                                        isExpanded ? "bg-white/[0.02] border-white/10 shadow-2xl" : "bg-neutral-900/40 border-white/5 hover:border-white/10 hover:bg-neutral-900/60"
                                    )}
                                >
                                    {/* COLLAPSIBLE ROW */}
                                    <div
                                        onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                                        className="p-6 flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-6">
                                            {/* Status Beacon Icon */}
                                            <div className={cn(
                                                "size-12 rounded-2xl flex items-center justify-center transition-all duration-500 border",
                                                isExpanded ? "bg-white/10 border-white/20 rotate-45" : "bg-white/[0.02] border-white/5"
                                            )}>
                                                <Plus className={cn("size-6 transition-colors", healthColor)} />
                                            </div>

                                            <div>
                                                <h2 className="text-xl font-bold tracking-tight">{trip.trip_name || trip.destination}</h2>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                                                        {new Date(trip.created_at).toLocaleDateString()}
                                                    </span>
                                                    <div className="size-1 rounded-full bg-white/10" />
                                                    <span className="text-[10px] text-white/40 font-mono">
                                                        {trip.budget?.currency || "USD"} {spent.toLocaleString()} / {limit.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {!isExpanded && (
                                                <div className="hidden md:flex flex-col items-end">
                                                    <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">Efficiency</div>
                                                    <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500/40"
                                                            style={{ width: `${Math.min((spent / limit) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <Link href={`/trips/${trip.id}`} onClick={e => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-white/40 hover:text-white hover:bg-white/5 gap-2 px-3"
                                                >
                                                    <ArrowRight className="size-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* EXPANDED CONTENT */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                            >
                                                <div className="px-6 pb-8 border-t border-white/5 pt-8">
                                                    <BudgetDashboard
                                                        totalBudget={trip.budget?.total_budget || 2500}
                                                        currency={trip.budget?.currency || "USD"}
                                                        initialCategories={trip.budget?.categories}
                                                        onSave={(cats) => handleSaveBudget(trip.id, cats, trip.budget?.total_budget || 2500, trip.budget?.currency || "USD")}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Disclaimer Section */}
            <div className="container mx-auto px-6 pb-20">
                <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5 flex gap-6 items-start">
                    <AlertCircle className="size-6 text-white/20 mt-1" />
                    <div className="text-sm text-white/40 leading-relaxed">
                        <p className="font-bold text-white/60 mb-1">Financial Disclaimer</p>
                        <p>Rates and estimations provided by the SafarAI Budget Optimizer are based on live market averages and current affiliate data. Actual prices may fluctuate at time of final booking through service providers. All transactions are handled securely through our verified booking partners.</p>
                    </div>
                </div>
            </div>
        </main>
    )
}
