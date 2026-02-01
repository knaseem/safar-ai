"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plane, Hotel, Calendar, Clock, X, AlertTriangle, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface DuffelOrder {
    id: string
    duffel_order_id: string
    type: "flight" | "stay"
    status: "confirmed" | "cancelled" | "pending"
    total_amount: number
    markup_amount: number
    currency: string
    passengers: Array<{
        given_name: string
        family_name: string
        email: string
    }>
    metadata: {
        booking_reference: string
        created_at: string
        offer_details?: {
            origin?: string
            destination?: string
            departureDate?: string
            airline?: string
            hotelName?: string
        }
    }
    created_at: string
    cancelled_at?: string
}

interface DuffelBookingsProps {
    className?: string
}

export function DuffelBookings({ className = "" }: DuffelBookingsProps) {
    const [orders, setOrders] = useState<DuffelOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [cancelQuote, setCancelQuote] = useState<any>(null)
    const [selectedOrder, setSelectedOrder] = useState<DuffelOrder | null>(null)

    const [modificationState, setModificationState] = useState<{
        step: 'select-date' | 'searching' | 'review' | 'confirming';
        newDate: string;
        quote: any;
    }>({ step: 'select-date', newDate: '', quote: null })
    const [modifyingOrder, setModifyingOrder] = useState<DuffelOrder | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        try {
            const res = await fetch("/api/orders")
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSearchChange() {
        if (!modifyingOrder || !modificationState.newDate) return

        setModificationState(prev => ({ ...prev, step: 'searching' }))

        try {
            // 1. Create Change Request
            // In a real app we'd get sliceIds from the order details.
            // For this implementation we'll mock the slice selection or assume the first slice.
            const res = await fetch('/api/orders/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: modifyingOrder.duffel_order_id,
                    sliceIds: ['sli_mock_1'], // Simplified: assume 1st slice for demo
                    origin: modifyingOrder.metadata?.offer_details?.origin || 'JFK',
                    destination: modifyingOrder.metadata?.offer_details?.destination || 'LHR',
                    departureDate: modificationState.newDate
                })
            })

            const data = await res.json()

            if (data.offers && data.offers.length > 0) {
                const offer = data.offers[0]
                setModificationState(prev => ({
                    ...prev,
                    step: 'review',
                    quote: offer
                }))
            } else {
                throw new Error("No alternative flights found")
            }

        } catch (err: any) {
            toast.error("Process failed", { description: err.message })
            setModificationState(prev => ({ ...prev, step: 'select-date' }))
        }
    }

    async function handleConfirmChange() {
        if (!modificationState.quote) return

        setModificationState(prev => ({ ...prev, step: 'confirming' }))

        try {
            const res = await fetch('/api/orders/change', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    offerId: modificationState.quote.id,
                    payment: {
                        amount: modificationState.quote.total_amount,
                        currency: modificationState.quote.total_currency
                    }
                })
            })

            const data = await res.json()
            if (data.success) {
                toast.success("Flight changed successfully!")
                // Reset UI
                setModifyingOrder(null)
                setModificationState({ step: 'select-date', newDate: '', quote: null })
                // Refresh list
                fetchOrders()
            } else {
                throw new Error(data.error)
            }
        } catch (err: any) {
            toast.error("Confirmation failed", { description: err.message })
            setModificationState(prev => ({ ...prev, step: 'review' }))
        }
    }

    async function handleCancelOrder(orderId: string) {
        // First request: Get quote
        if (!cancelQuote || cancelQuote.orderId !== orderId) {
            setCancellingId(orderId)
            try {
                const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" })
                const data = await res.json()
                if (data.quote) {
                    setCancelQuote({ ...data.quote, orderId })
                    setSelectedOrder(orders.find(o => o.id === orderId) || null)
                }
            } catch (error) {
                toast.error("Failed to get cancellation quote")
            } finally {
                setCancellingId(null)
            }
            return
        }

        // Second request: Confirm cancellation
        setCancellingId(orderId)
        try {
            const res = await fetch(`/api/orders/${orderId}?confirm=true`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                toast.success("Booking cancelled", {
                    description: `Refund of ${data.refund_currency} ${data.refund_amount} will be processed.`
                })
                // Update local state
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: "cancelled" as const } : o
                ))
                setCancelQuote(null)
                setSelectedOrder(null)
            } else {
                throw new Error(data.error)
            }
        } catch (error: any) {
            toast.error("Cancellation failed", { description: error.message })
        } finally {
            setCancellingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-white/5">
                <Plane className="size-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Direct Bookings</h3>
                <p className="text-white/40 mb-4">
                    Bookings made through our checkout will appear here.
                </p>
            </div>
        )
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {orders.map((order) => (
                <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900 border border-white/10 rounded-xl p-5 hover:border-emerald-500/30 transition-all"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Order Info */}
                        <div className="flex items-start gap-4">
                            <div className={`size-12 rounded-xl flex items-center justify-center ${order.type === "flight"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-purple-500/10 text-purple-400"
                                }`}>
                                {order.type === "flight" ? (
                                    <Plane className="size-6" />
                                ) : (
                                    <Hotel className="size-6" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${order.status === "confirmed"
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : order.status === "cancelled"
                                            ? "bg-red-500/10 text-red-400"
                                            : "bg-yellow-500/10 text-yellow-500"
                                        }`}>
                                        {order.status}
                                    </span>
                                    <span className="text-white/40 text-xs font-mono">
                                        {order.metadata?.booking_reference}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white">
                                    {order.type === "flight" && order.metadata?.offer_details ? (
                                        `${order.metadata.offer_details.origin} → ${order.metadata.offer_details.destination}`
                                    ) : order.type === "stay" && order.metadata?.offer_details?.hotelName ? (
                                        order.metadata.offer_details.hotelName
                                    ) : (
                                        `${order.type === "flight" ? "Flight" : "Hotel"} Booking`
                                    )}
                                </h3>
                                <div className="flex items-center gap-4 text-white/50 text-sm mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3" />
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    <span>
                                        {order.passengers?.length || 1} traveler{(order.passengers?.length || 1) > 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Price & Actions */}
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-white/40 uppercase tracking-wider">Total Paid</p>
                                <p className="text-xl font-bold text-white">
                                    {order.currency} {order.total_amount?.toFixed(2)}
                                </p>
                            </div>

                            {order.status === "confirmed" && (
                                <div className="flex gap-2">
                                    {/* Modification Button */}
                                    {order.type === 'flight' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setModifyingOrder(order)}
                                            className="bg-transparent border-white/10 text-white hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400"
                                        >
                                            Change
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCancelOrder(order.id)}
                                        disabled={cancellingId === order.id}
                                        className="bg-transparent border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                                    >
                                        {cancellingId === order.id ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            "Cancel"
                                        )}
                                    </Button>
                                </div>
                            )}

                            {order.status === "cancelled" && (
                                <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium">
                                    Cancelled
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Modification Modal */}
            <AnimatePresence>
                {modifyingOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setModifyingOrder(null); setModificationState({ step: 'select-date', newDate: '', quote: null }) }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                        >
                            <button
                                onClick={() => { setModifyingOrder(null); setModificationState({ step: 'select-date', newDate: '', quote: null }) }}
                                className="absolute top-4 right-4 text-white/40 hover:text-white"
                            >
                                <X className="size-5" />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-2">Change Flight</h2>
                            <p className="text-white/50 mb-6 text-sm">Select a new date for your trip to {modifyingOrder.metadata?.offer_details?.destination}</p>

                            {modificationState.step === 'select-date' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-white/40 font-bold">New Departure Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                                            onChange={(e) => setModificationState(prev => ({ ...prev, newDate: e.target.value }))}
                                        />
                                    </div>
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                        disabled={!modificationState.newDate}
                                        onClick={handleSearchChange}
                                    >
                                        Find Flights
                                    </Button>
                                </div>
                            )}

                            {modificationState.step === 'searching' && (
                                <div className="py-8 text-center">
                                    <Loader2 className="size-8 text-blue-500 animate-spin mx-auto mb-4" />
                                    <p className="text-white/60">Searching for alternatives...</p>
                                </div>
                            )}

                            {modificationState.step === 'review' && modificationState.quote && (
                                <div className="space-y-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-emerald-400 font-bold text-sm">Flight Found</span>
                                            <CheckCircle className="size-4 text-emerald-400" />
                                        </div>
                                        <div className="flex justify-between text-white text-lg font-bold">
                                            <span>Additional Cost</span>
                                            <span>{modificationState.quote.total_currency} {modificationState.quote.total_amount}</span>
                                        </div>
                                        <p className="text-xs text-white/40 mt-1">Includes change fees and fare difference</p>
                                    </div>
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                        onClick={handleConfirmChange}
                                    >
                                        Confirm & Pay Difference
                                    </Button>
                                </div>
                            )}

                            {modificationState.step === 'confirming' && (
                                <div className="py-8 text-center">
                                    <Loader2 className="size-8 text-emerald-500 animate-spin mx-auto mb-4" />
                                    <p className="text-white/60">Processing update...</p>
                                </div>
                            )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Cancellation Confirmation Modal */}
            <AnimatePresence>
                {cancelQuote && selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setCancelQuote(null); setSelectedOrder(null); }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                        >
                            <button
                                onClick={() => { setCancelQuote(null); setSelectedOrder(null); }}
                                className="absolute top-4 right-4 text-white/40 hover:text-white"
                            >
                                <X className="size-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="size-6 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Cancel Booking?</h3>
                                    <p className="text-sm text-white/50">
                                        {selectedOrder.metadata?.booking_reference}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-black/30 rounded-xl p-4 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-white/50">Original Amount</span>
                                    <span className="text-white">
                                        {selectedOrder.currency} {selectedOrder.total_amount?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-emerald-400">
                                    <span>Refund Amount</span>
                                    <span className="font-bold">
                                        {cancelQuote.refund_currency} {cancelQuote.refund_amount}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-white/40 mb-6">
                                This action cannot be undone. Your refund will be processed within 5-10 business days.
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 bg-transparent border-white/10"
                                    onClick={() => { setCancelQuote(null); setSelectedOrder(null); }}
                                >
                                    Keep Booking
                                </Button>
                                <Button
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                                    onClick={() => handleCancelOrder(selectedOrder.id)}
                                    disabled={cancellingId === selectedOrder.id}
                                >
                                    {cancellingId === selectedOrder.id ? (
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                    ) : null}
                                    Confirm Cancel
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
