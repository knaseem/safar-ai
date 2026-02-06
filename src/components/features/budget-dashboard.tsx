"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Wallet,
    TrendingDown,
    AlertCircle,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Plane,
    Hotel,
    Utensils,
    Activity,
    Plus,
    Gauge,
    Download,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSpring, useTransform, animate } from "framer-motion"
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { BudgetPDF } from './budget-pdf'
import { EXCHANGE_RATES, convertCurrency, formatCurrency as formatCurrencyUtil } from "@/lib/currency"
import { useExchangeRates } from "@/hooks/use-exchange-rates"

function CountingNumber({ value, currency = "USD" }: { value: number; currency?: string }) {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 })
    const display = useTransform(spring, (current) =>
        `${currency} ${Math.round(current).toLocaleString()}`
    )

    useEffect(() => {
        spring.set(value)
    }, [value, spring])

    return <motion.span>{display}</motion.span>
}


import { BudgetCategory } from "@/lib/types"

interface BudgetDashboardProps {
    totalBudget: number
    currency?: string
    initialCategories?: Record<string, number>
    startDate?: string
    endDate?: string
    tripName?: string
    onSave?: (data: Record<string, number>) => void
    className?: string
}

export function BudgetDashboard({
    totalBudget,
    currency = "USD",
    initialCategories,
    startDate,
    endDate,
    tripName,
    onSave,
    className
}: BudgetDashboardProps) {
    const [spentCategories, setSpentCategories] = useState<Record<string, number>>(initialCategories || {
        lodging: 0,
        flights: 0,
        food: 0,
        activities: 0,
        other: 0
    })
    const [isExpanded, setIsExpanded] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [tempBudget, setTempBudget] = useState(totalBudget)
    const [displayCurrency, setDisplayCurrency] = useState(currency)
    const [isDownloading, setIsDownloading] = useState(false)
    const { rates, loading: ratesLoading } = useExchangeRates()

    // Derived Logic
    const totalSpent = useMemo(() =>
        Object.values(spentCategories).reduce((a, b) => a + b, 0),
        [spentCategories])

    const remaining = tempBudget - totalSpent
    const spentPercentage = (totalSpent / tempBudget) * 100

    // Burn Rate Logic
    const burnRateData = useMemo(() => {
        if (!startDate || !endDate) return null
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
        return {
            days,
            dailyBurn: totalSpent / days,
            dailyLimit: tempBudget / days
        }
    }, [startDate, endDate, totalSpent, tempBudget])

    // Currency Helper
    const getConverted = (amount: number) => convertCurrency(amount, currency, displayCurrency, rates)

    // PDF Download
    const handleDownloadPDF = async () => {
        setIsDownloading(true)
        try {
            const cats = Object.entries(spentCategories).map(([id, value]) => ({
                label: id.charAt(0).toUpperCase() + id.slice(1),
                value: getConverted(value)
            }))

            const blob = await pdf(
                <BudgetPDF
                    tripName={tripName || "Expedition"}
                    totalBudget={getConverted(tempBudget)}
                    totalSpent={getConverted(totalSpent)}
                    currency={displayCurrency}
                    categories={cats}
                    burnRate={getConverted(burnRateData?.dailyBurn || 0)}
                />
            ).toBlob()
            saveAs(blob, `Budget_Brief_${tripName?.replace(/\s+/g, '_') || 'Trip'}.pdf`)
        } catch (e) {
            console.error("PDF Fail", e)
        } finally {
            setIsDownloading(false)
        }
    }

    const categories: BudgetCategory[] = [
        { id: 'flights', label: 'Flights', value: spentCategories.flights, color: '#3b82f6', icon: Plane },
        { id: 'lodging', label: 'Lodging', value: spentCategories.lodging, color: '#10b981', icon: Hotel },
        { id: 'food', label: 'Gastronomy', value: spentCategories.food, color: '#f59e0b', icon: Utensils },
        { id: 'activities', label: 'Activities', value: spentCategories.activities, color: '#8b5cf6', icon: Activity },
        { id: 'other', label: 'Other', value: spentCategories.other, color: '#ec4899', icon: Plus },
    ]

    const handleCategoryChange = (id: string, val: string) => {
        const num = parseInt(val) || 0
        setSpentCategories(prev => ({ ...prev, [id]: num }))
    }

    const handleSave = () => {
        onSave?.(spentCategories)
        setIsEditing(false)
    }

    // AI Recommendation Logic & Vibe Efficiency
    const vibeEfficiency = useMemo(() => {
        const highImpactWeight = spentCategories.food * 1.5 + spentCategories.activities * 1.8
        const totalWeight = totalSpent || 1
        return Math.min(Math.round((highImpactWeight / totalWeight) * 100), 100)
    }, [spentCategories, totalSpent])

    const getAIRecommendation = () => {
        if (totalSpent > tempBudget) {
            const highest = categories.reduce((a, b) => a.value > b.value ? a : b)
            return {
                type: "warning",
                message: `Critical: Over budget by ${currency} ${Math.abs(remaining).toLocaleString()}.`,
                tip: `Re-allocating ${highest.label} could restore balance.`,
                glow: "shadow-[0_0_30px_rgba(239,68,68,0.2)] border-red-500/30"
            }
        }
        if (vibeEfficiency > 70) {
            return {
                type: "success",
                message: "High-Vibe spending detected! Multiplier active.",
                tip: "Your choices maximize local experiences per dollar.",
                glow: "shadow-[0_0_30_rgba(16,185,129,0.2)] border-emerald-500/30"
            }
        }
        return {
            type: "success",
            message: "Budget structure is sound and optimized.",
            tip: "You have room for a luxury spa upgrade!",
            glow: "shadow-[0_0_30px_rgba(59,130,246,0.1)] border-white/10"
        }
    }


    const reco = getAIRecommendation()

    return (
        <div className={cn("glass-dark rounded-3xl p-6 border border-white/10 shadow-2xl", className)}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                        <Wallet className="size-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">Budget Optimizer</h3>
                        <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                            SafarAI Intelligent Tracking
                            {!ratesLoading && <span className="text-emerald-500 text-[9px] bg-emerald-500/10 px-1.5 rounded ml-1 animate-pulse border border-emerald-500/20">LIVE MARKET</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={displayCurrency}
                        onChange={(e) => setDisplayCurrency(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg text-[10px] px-2 py-1.5 text-white/60 focus:outline-none focus:border-white/30 mr-1 uppercase"
                    >
                        {["USD", "EUR", "GBP", "JPY", "CNY", "AUD", "CAD", "CHF", "HKD", "SGD", "NZD", "KRW", "INR", "AED", "SAR"].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white/60"
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
                    >
                        {isExpanded ? <ChevronUp className="size-4 text-white/40" /> : <ChevronDown className="size-4 text-white/40" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Visual Section: Spending Rings */}
                <div className="relative flex items-center justify-center p-4">
                    <svg className="size-80 -rotate-90">
                        <defs>
                            {categories.map(cat => (
                                <radialGradient key={`grad-${cat.id}`} id={`grad-${cat.id}`}>
                                    <stop offset="0%" stopColor={cat.color} stopOpacity="0.8" />
                                    <stop offset="100%" stopColor={cat.color} stopOpacity="0.1" />
                                </radialGradient>
                            ))}
                        </defs>
                        {/* Background Rings */}
                        {categories.map((cat, i) => (
                            <circle
                                key={`bg-${cat.id}`}
                                cx="160"
                                cy="160"
                                r={130 - i * 22}
                                fill="transparent"
                                stroke="rgba(255,255,255,0.03)"
                                strokeWidth="14"
                            />
                        ))}
                        {/* Progress Rings */}
                        {categories.map((cat, i) => {
                            const radius = 130 - i * 22
                            const circum = 2 * Math.PI * radius
                            const perc = Math.min((cat.value / tempBudget) * 100, 100)
                            const offset = circum - (perc / 100) * circum

                            return (
                                <motion.circle
                                    key={`val-${cat.id}`}
                                    cx="160"
                                    cy="160"
                                    r={radius}
                                    fill="transparent"
                                    stroke={cat.color}
                                    strokeWidth="14"
                                    strokeDasharray={circum}
                                    initial={{ strokeDashoffset: circum }}
                                    animate={{ strokeDashoffset: offset }}
                                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_8px_var(--glow)]"
                                    style={{ "--glow": cat.color } as any}
                                />
                            )
                        })}
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <motion.div
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-4xl font-black text-white tracking-tighter"
                        >
                            <CountingNumber value={getConverted(totalSpent)} currency={displayCurrency} />
                        </motion.div>
                        {isEditing ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col items-center">
                                <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold mb-1">Limit Threshold</span>
                                <input
                                    type="number"
                                    value={tempBudget}
                                    onChange={(e) => setTempBudget(parseInt(e.target.value) || 0)}
                                    className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-emerald-400 w-32 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                                />
                            </motion.div>
                        ) : (
                            <div className="text-[10px] text-white/20 uppercase tracking-[0.4em] mt-2 font-medium">
                                Total Expedition Spend
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6 flex flex-col justify-center">
                    <AnimatePresence mode="popLayout">
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid grid-cols-1 gap-3"
                            >
                                {categories.map((cat) => (
                                    <motion.div
                                        key={cat.id}
                                        whileHover={{ x: 5 }}
                                        className="relative group bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 transition-all hover:bg-white/[0.06] hover:border-white/10"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="p-2 rounded-lg"
                                                    style={{ backgroundColor: `${cat.color}15` }}
                                                >
                                                    <cat.icon className="size-4" style={{ color: cat.color }} />
                                                </div>
                                                <span className="text-sm text-white/70 font-bold tracking-tight">{cat.label}</span>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={cat.value}
                                                    onChange={(e) => handleCategoryChange(cat.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white text-right w-24 focus:outline-none focus:border-white/20 font-mono"
                                                />
                                            ) : (
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-white">
                                                        <CountingNumber value={getConverted(cat.value)} currency={displayCurrency} />
                                                    </div>
                                                    <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                                                        {Math.round((cat.value / tempBudget) * 100)}% Usage
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((cat.value / tempBudget) * 100, 100)}%` }}
                                                className="h-full rounded-full"
                                                style={{
                                                    backgroundColor: cat.color,
                                                    boxShadow: `0 0 10px ${cat.color}40`
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Vibe Efficiency Gauge */}
                    <motion.div
                        layout
                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <Activity className="size-3 text-emerald-400" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Vibe Efficiency Index</span>
                            </div>
                            <span className="text-xs font-black text-emerald-400">{vibeEfficiency}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${vibeEfficiency}%` }}
                                className="h-full bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            />
                        </div>
                    </motion.div>

                    {/* Burn Rate Gauge */}
                    {burnRateData && (
                        <motion.div layout className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <Gauge className="size-3 text-orange-400" />
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Velocity (Burn Rate)</span>
                                </div>
                                <span className="text-xs font-black text-orange-400">
                                    {displayCurrency} {Math.round(getConverted(burnRateData.dailyBurn)).toLocaleString()}<span className="text-white/30 text-[9px] font-normal"> / DAY</span>
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((burnRateData.dailyBurn / (burnRateData.dailyLimit * 1.5)) * 100, 100)}%` }}
                                    className={cn(
                                        "h-full shadow-[0_0_10px_rgba(249,115,22,0.5)]",
                                        burnRateData.dailyBurn > burnRateData.dailyLimit ? "bg-red-500" : "bg-orange-500"
                                    )}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-[9px] text-white/20 font-mono">
                                <span>0</span>
                                <span>SAFE: {Math.round(getConverted(burnRateData.dailyLimit))}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Logic Alert */}
                    <motion.div
                        layout
                        className={cn(
                            "p-4 rounded-2xl border flex gap-4 transition-all duration-500 relative overflow-hidden group",
                            reco.glow
                        )}>
                        {/* Scanning Effect Overlay */}
                        <motion.div
                            animate={{ y: ["-100%", "200%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"
                        />

                        <div className={cn(
                            "p-2 rounded-xl h-fit relative z-10",
                            reco.type === 'warning' ? "bg-red-500/20 text-red-400" :
                                reco.type === 'caution' ? "bg-yellow-500/20 text-yellow-400" :
                                    "bg-emerald-500/20 text-emerald-400"
                        )}>
                            {reco.type === 'success' ? <Sparkles className="size-4 animate-pulse" /> : <AlertCircle className="size-4" />}
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs text-white font-black mb-1 group-hover:tracking-tight transition-all uppercase tracking-wide">{reco.message}</p>
                            <p className="text-[10px] text-white/50 italic leading-tight font-medium">ADVISOR: {reco.tip}</p>
                        </div>
                    </motion.div>


                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-xl transition-all font-bold border-white/10 bg-transparent hover:bg-white/5 disabled:opacity-50 text-white/60 hover:text-white"
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                        >
                            {isDownloading ? <RefreshCw className="size-4 animate-spin mr-2" /> : <Download className="size-4 mr-2" />}
                            {isDownloading ? "Generating..." : "Export Brief"}
                        </Button>
                        <Button
                            variant={isEditing ? "premium" : "outline"}
                            size="sm"
                            className={cn(
                                "flex-1 rounded-xl transition-all font-bold",
                                !isEditing && "border-white/10 bg-white text-emerald-900 hover:text-emerald-800"
                            )}
                            onClick={handleSave}
                        >
                            {isEditing ? "Save & Sync" : "Sync Ledger"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
