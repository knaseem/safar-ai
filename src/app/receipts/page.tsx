"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    FileText, Receipt, Download, Filter, Calendar,
    Plane, Building2, Ticket, DollarSign, TrendingUp,
    Search, ChevronDown, Upload, X, Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

interface ReceiptItem {
    id: string
    type: "flight" | "hotel" | "activity" | "other"
    title: string
    amount: number
    currency: string
    date: string
    reference?: string
    tripName?: string
    status: "confirmed" | "pending" | "cancelled"
}

type FilterType = "all" | "flight" | "hotel" | "activity"

export default function ReceiptsPage() {
    const { user } = useAuth()
    const [receipts, setReceipts] = useState<ReceiptItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<"date" | "amount">("date")

    useEffect(() => {
        if (!user) return
        fetchReceipts()
    }, [user])

    const fetchReceipts = async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            // Fetch from booking_requests
            const { data: bookings } = await supabase
                .from("booking_requests")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false })

            if (bookings) {
                const mapped: ReceiptItem[] = bookings.map((b: any) => ({
                    id: b.id,
                    type: b.trip_type === "stay" ? "hotel" : b.trip_type === "flight" ? "flight" : "activity",
                    title: b.trip_name || "Booking",
                    amount: b.details?.total_amount
                        ? parseFloat(b.details.total_amount)
                        : b.details?.estimated_price || 0,
                    currency: b.details?.total_currency || "USD",
                    date: b.created_at,
                    reference: b.duffel_order_id || b.id?.slice(0, 8),
                    tripName: b.trip_name,
                    status: b.status === "booked" ? "confirmed" : b.status === "cancelled" ? "cancelled" : "pending",
                }))
                setReceipts(mapped)
            }
        } catch (error) {
            console.error("Failed to fetch receipts:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredReceipts = useMemo(() => {
        let result = receipts
        if (filter !== "all") result = result.filter(r => r.type === filter)
        if (searchQuery) result = result.filter(r =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.reference?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        result.sort((a, b) => {
            if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime()
            return b.amount - a.amount
        })
        return result
    }, [receipts, filter, searchQuery, sortBy])

    const totalSpend = useMemo(() =>
        filteredReceipts
            .filter(r => r.status !== "cancelled")
            .reduce((sum, r) => sum + r.amount, 0),
        [filteredReceipts]
    )

    const categoryBreakdown = useMemo(() => {
        const breakdown = { flight: 0, hotel: 0, activity: 0, other: 0 }
        receipts.filter(r => r.status !== "cancelled").forEach(r => {
            breakdown[r.type] = (breakdown[r.type] || 0) + r.amount
        })
        return breakdown
    }, [receipts])

    const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
        flight: { icon: Plane, color: "text-blue-400", bg: "bg-blue-500/10", label: "Flight" },
        hotel: { icon: Building2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Hotel" },
        activity: { icon: Ticket, color: "text-purple-400", bg: "bg-purple-500/10", label: "Activity" },
        other: { icon: Receipt, color: "text-amber-400", bg: "bg-amber-500/10", label: "Other" },
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="text-center">
                    <Receipt className="size-12 text-white/20 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-white mb-2">Sign in to view receipts</h2>
                    <p className="text-sm text-white/40">Your travel receipts and invoices appear here</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 pt-24 pb-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Receipts Vault</h1>
                            <p className="text-sm text-white/40">All your travel invoices and receipts in one place</p>
                        </div>
                        <Button
                            onClick={() => exportReceipts(filteredReceipts)}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/10 gap-2"
                            disabled={filteredReceipts.length === 0}
                        >
                            <Download className="size-4" />
                            Export CSV
                        </Button>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-4 gap-4 mb-8"
                >
                    <StatCard
                        icon={DollarSign}
                        label="Total Spend"
                        value={`$${totalSpend.toLocaleString()}`}
                        color="text-emerald-400"
                    />
                    <StatCard
                        icon={Plane}
                        label="Flights"
                        value={`$${categoryBreakdown.flight.toLocaleString()}`}
                        color="text-blue-400"
                    />
                    <StatCard
                        icon={Building2}
                        label="Hotels"
                        value={`$${categoryBreakdown.hotel.toLocaleString()}`}
                        color="text-purple-400"
                    />
                    <StatCard
                        icon={Ticket}
                        label="Activities"
                        value={`$${categoryBreakdown.activity.toLocaleString()}`}
                        color="text-amber-400"
                    />
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-3 mb-6"
                >
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search receipts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/30"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                        {(["all", "flight", "hotel", "activity"] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                                    filter === f
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "text-white/40 hover:text-white/60"
                                )}
                            >
                                {f === "all" ? "All" : f}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <button
                        onClick={() => setSortBy(s => s === "date" ? "amount" : "date")}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                        <TrendingUp className="size-3.5" />
                        {sortBy === "date" ? "By Date" : "By Amount"}
                    </button>
                </motion.div>

                {/* Receipt List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse h-20 bg-white/5 rounded-2xl" />
                        ))}
                    </div>
                ) : filteredReceipts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Receipt className="size-16 text-white/10 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white/40 mb-1">No receipts found</h3>
                        <p className="text-sm text-white/20">
                            {filter !== "all"
                                ? "Try changing the filter"
                                : "Your booking receipts will appear here automatically"}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-2">
                        {filteredReceipts.map((receipt, index) => {
                            const tc = typeConfig[receipt.type] || typeConfig.other
                            const Icon = tc.icon
                            return (
                                <motion.div
                                    key={receipt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group flex items-center gap-4 px-5 py-4 bg-white/5 hover:bg-white/[0.07] border border-white/5 rounded-2xl transition-all"
                                >
                                    {/* Type Icon */}
                                    <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", tc.bg)}>
                                        <Icon className={cn("size-5", tc.color)} />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{receipt.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-white/30">
                                                {new Date(receipt.date).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", year: "numeric"
                                                })}
                                            </span>
                                            {receipt.reference && (
                                                <>
                                                    <span className="text-white/10">•</span>
                                                    <span className="text-[10px] text-white/20 font-mono">
                                                        #{receipt.reference}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                                        receipt.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                                            receipt.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                                                "bg-amber-500/10 text-amber-400"
                                    )}>
                                        {receipt.status}
                                    </span>

                                    {/* Amount */}
                                    <div className="text-right shrink-0">
                                        <p className={cn(
                                            "text-lg font-bold font-mono",
                                            receipt.status === "cancelled" ? "text-white/20 line-through" : "text-white"
                                        )}>
                                            ${receipt.amount.toLocaleString()}
                                        </p>
                                        <p className="text-[9px] text-white/20">{receipt.currency}</p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }: {
    icon: any; label: string; value: string; color: string
}) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/[0.07] transition-colors">
            <Icon className={cn("size-5 mb-2", color)} />
            <p className="text-lg font-bold text-white font-mono">{value}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-0.5">{label}</p>
        </div>
    )
}

function exportReceipts(receipts: ReceiptItem[]) {
    const csv = [
        ["Date", "Type", "Description", "Reference", "Amount", "Currency", "Status"].join(","),
        ...receipts.map(r => [
            new Date(r.date).toISOString().split("T")[0],
            r.type,
            `"${r.title}"`,
            r.reference || "",
            r.amount,
            r.currency,
            r.status,
        ].join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `safar-receipts-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
}
