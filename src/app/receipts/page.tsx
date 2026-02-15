"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    FileText, Receipt, Download, Filter, Calendar,
    Plane, Building2, Ticket, DollarSign, TrendingUp,
    Search, ChevronDown, Upload, X, Eye, Plus, Sparkles, ArrowLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

type FilterType = "all" | "flight" | "hotel" | "activity" | "other"

export default function ReceiptsPage() {
    const { user } = useAuth()
    const [receipts, setReceipts] = useState<ReceiptItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<"date" | "amount">("date")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    // Manual Entry Form State
    const [newItem, setNewItem] = useState({
        title: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        type: "other" as ReceiptItem["type"]
    })

    useEffect(() => {
        if (!user) return
        fetchReceipts()
    }, [user])

    const fetchReceipts = async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            // 1. Fetch from booking_requests (automated)
            const { data: bookings } = await supabase
                .from("booking_requests")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false })

            let mappedReceipts: ReceiptItem[] = []

            if (bookings) {
                mappedReceipts = bookings.map((b: any) => ({
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
            }

            // 2. Load manual receipts from localStorage (for demo persistence)
            // In production, this should be a Supabase table 'expenses'
            const local = localStorage.getItem(`safar_receipts_${user?.id}`)
            if (local) {
                const manualReceipts = JSON.parse(local)
                mappedReceipts = [...mappedReceipts, ...manualReceipts]
            }

            setReceipts(mappedReceipts)

            // Deduplicate by ID to prevent key collisions from multiple sources (Supabase/LocalStorage)
            const uniqueReceipts = Array.from(new Map(mappedReceipts.map(item => [item.id, item])).values())
            setReceipts(uniqueReceipts)
        } catch (error) {
            console.error("Failed to fetch receipts:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddReceipt = () => {
        if (!newItem.title || !newItem.amount) {
            alert("Please fill in both description and amount.")
            return
        }

        const newReceipt: ReceiptItem = {
            id: `manual_${Date.now()}`,
            type: newItem.type,
            title: newItem.title,
            amount: parseFloat(newItem.amount),
            currency: "USD",
            date: newItem.date,
            status: "confirmed",
            reference: `MAN-${Math.floor(Math.random() * 10000)}`
        }

        // Save to local state and localStorage
        const updated = [newReceipt, ...receipts]
        setReceipts(updated)

        // Filter out only manual ones to save
        const manualOnly = updated.filter(r => r.id.startsWith("manual_"))
        localStorage.setItem(`safar_receipts_${user?.id}`, JSON.stringify(manualOnly))

        setIsAddOpen(false)
        setNewItem({
            title: "",
            amount: "",
            date: new Date().toISOString().split('T')[0],
            type: "other"
        })
    }

    const generateSampleData = () => {
        // defined demo IDs to check against
        const demoIds = ["demo_1", "demo_2", "demo_3", "demo_4", "demo_5"]

        // Filter out any existing demo data from current receipts to avoid duplicates
        const existingReceipts = receipts.filter(r => !demoIds.includes(r.id))

        const samples: ReceiptItem[] = [
            { id: `demo_1`, type: "flight", title: "Flight to Tokyo (JAL)", amount: 1250.00, currency: "USD", date: new Date(Date.now() - 86400000 * 2).toISOString(), status: "confirmed", reference: "JAL-8821" },
            { id: `demo_2`, type: "hotel", title: "Ritz Carlton Kyoto", amount: 850.00, currency: "USD", date: new Date(Date.now() - 86400000 * 5).toISOString(), status: "confirmed", reference: "RC-9921" },
            { id: `demo_3`, type: "activity", title: "Private Tea Ceremony", amount: 150.00, currency: "USD", date: new Date(Date.now() - 86400000 * 4).toISOString(), status: "confirmed", reference: "EXP-112" },
            { id: `demo_4`, type: "other", title: "Uber to Airport", amount: 45.50, currency: "USD", date: new Date(Date.now() - 86400000 * 1).toISOString(), status: "confirmed", reference: "UBER-X" },
            { id: `demo_5`, type: "flight", title: "Flight to London (BA)", amount: 920.00, currency: "USD", date: new Date(Date.now() - 86400000 * 15).toISOString(), status: "confirmed", reference: "BA-221" },
        ]

        const updated = [...existingReceipts, ...samples]
        setReceipts(updated)

        // Persist manual/demo ones
        const manualOnly = updated.filter(r => r.id.startsWith("manual_") || r.id.startsWith("demo_"))
        localStorage.setItem(`safar_receipts_${user?.id}`, JSON.stringify(manualOnly))
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

    // Data for Chart
    const chartData = useMemo(() => {
        const dailyTotals: Record<string, number> = {}
        // Get last 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            dailyTotals[dateStr] = 0
        }

        receipts.forEach(r => {
            if (r.status === 'cancelled') return
            const dateStr = new Date(r.date).toISOString().split('T')[0]
            if (dailyTotals[dateStr] !== undefined) {
                dailyTotals[dateStr] += r.amount
            }
        })

        return Object.entries(dailyTotals).map(([date, amount]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount
        }))
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <Button
                                variant="ghost"
                                className="pl-0 text-white/40 hover:text-white mb-2"
                                onClick={() => window.location.href = '/'}
                            >
                                <ArrowLeft className="size-4 mr-2" />
                                Back to Home
                            </Button>
                            <h1 className="text-3xl font-bold text-white mb-1">Receipts Vault</h1>
                            <p className="text-sm text-white/40">Track, visualize, and export your travel expenses</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={generateSampleData}
                                variant="outline"
                                className="bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                            >
                                <Sparkles className="size-4 mr-2" />
                                Load Demo Data
                            </Button>

                            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                                        <Plus className="size-4" />
                                        Add Receipt
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add Expense</DialogTitle>
                                        <DialogDescription className="text-white/40">
                                            Manually add a travel expense to your vault.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                                placeholder="e.g. Taxi to Airport"
                                                className="bg-white/5 border-white/10"
                                                value={newItem.title}
                                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Amount (USD)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="bg-white/5 border-white/10"
                                                    value={newItem.amount}
                                                    onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Date</Label>
                                                <Input
                                                    type="date"
                                                    className="bg-white/5 border-white/10"
                                                    value={newItem.date}
                                                    onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={newItem.type}
                                                onValueChange={(v: any) => setNewItem({ ...newItem, type: v })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                    <SelectItem value="flight">Flight</SelectItem>
                                                    <SelectItem value="hotel">Hotel</SelectItem>
                                                    <SelectItem value="activity">Activity</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                        <Button onClick={handleAddReceipt} className="bg-emerald-500 hover:bg-emerald-600">
                                            Add Receipt
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button
                                onClick={() => exportReceipts(filteredReceipts)}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 gap-2"
                                disabled={filteredReceipts.length === 0}
                            >
                                <Download className="size-4" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Spending Chart */}
                {receipts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="mb-8 p-6 bg-white/5 border border-white/5 rounded-2xl h-[300px]"
                    >
                        <h3 className="text-sm font-medium text-white/60 mb-6">Spending Trend (Last 30 Days)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="rgba(255,255,255,0.2)"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.2)"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
                    className="flex flex-col md:flex-row md:items-center gap-3 mb-6"
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
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 overflow-x-auto">
                        {(["all", "flight", "hotel", "activity", "other"] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap",
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
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/40 hover:text-white/60 transition-colors whitespace-nowrap"
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
                        className="text-center py-24 border border-white/5 rounded-3xl bg-white/[0.02]"
                    >
                        <Receipt className="size-16 text-white/10 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white/40 mb-1">No receipts found</h3>
                        <p className="text-sm text-white/20 max-w-sm mx-auto mb-6">
                            {filter !== "all"
                                ? "Try changing the filter"
                                : "Start by adding a receipt manually or generate sample data to see how it looks."}
                        </p>
                        <Button onClick={generateSampleData} variant="outline" className="border-white/10 text-white/60">
                            Generate Sample Data
                        </Button>
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
                                        "hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
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
                                            ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    // 1. Create CSV Content
    const headers = ["Date", "Type", "Description", "Reference", "Amount", "Currency", "Status"]
    const rows = receipts.map(r => [
        new Date(r.date).toISOString().split("T")[0],
        r.type,
        `"${r.title.replace(/"/g, '""')}"`, // Escape quotes
        r.reference || "",
        r.amount.toFixed(2),
        r.currency,
        r.status,
    ])

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n")

    // 2. Create and Download Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `safar-expenses-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
