"use client"

import { useState, useEffect, useCallback } from "react"
import { UnifiedBooking } from "@/types/booking"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Hotel, Calendar, MapPin, Link as LinkIcon, Edit2, Check, X, Loader2, Trash2, RefreshCw, AlertTriangle, CheckCircle, Shield, User, Clock, ArrowRight, Sparkles, Info, ExternalLink } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

// ── Gradient maps ────────────────────────────────────
const TYPE_GRADIENTS: Record<string, string> = {
    flight: "from-blue-500 via-cyan-500 to-blue-600",
    hotel: "from-purple-500 via-fuchsia-500 to-purple-600",
    activity: "from-emerald-500 via-teal-500 to-emerald-600",
    custom: "from-amber-500 via-orange-500 to-amber-600",
}

const TYPE_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
    flight: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-blue-500/20" },
    hotel: { bg: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-purple-500/20" },
    activity: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
    custom: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "shadow-amber-500/20" },
}

// ── Stepper for Change Modal ─────────────────────────
const CHANGE_STEPS = ['Select Date', 'Searching', 'Review', 'Confirmed'] as const
function StepperProgress({ currentStep }: { currentStep: string }) {
    const stepMap: Record<string, number> = { 'select-date': 0, 'searching': 1, 'review': 2, 'confirming': 3 }
    const current = stepMap[currentStep] ?? 0

    return (
        <div className="flex items-center gap-1 mb-6">
            {CHANGE_STEPS.map((label, i) => (
                <div key={label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                        <motion.div
                            className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${i < current ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : i === current ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/30'
                                    : 'bg-white/5 text-white/30'
                                }`}
                            animate={i === current ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: i === current ? Infinity : 0, duration: 2 }}
                        >
                            {i < current ? <Check className="size-3" /> : i + 1}
                        </motion.div>
                        <span className={`text-[9px] mt-1 uppercase tracking-wider font-medium ${i <= current ? 'text-white/60' : 'text-white/20'
                            }`}>
                            {label}
                        </span>
                    </div>
                    {i < CHANGE_STEPS.length - 1 && (
                        <div className={`h-px flex-1 mx-1 mt-[-12px] transition-colors duration-300 ${i < current ? 'bg-emerald-500' : 'bg-white/10'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    )
}

// ── Refund Comparison Bar ────────────────────────────
function RefundBar({ original, refund, currency }: { original: number; refund: number; currency: string }) {
    const pct = original > 0 ? Math.round((refund / original) * 100) : 0

    return (
        <div className="bg-black/30 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>Original: {currency} {original.toFixed(2)}</span>
                <span className="text-emerald-400 font-bold">{pct}% refund</span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
            <div className="flex justify-between mt-3">
                <span className="text-white/50 text-sm">Refund Amount</span>
                <span className="text-emerald-400 font-bold text-lg">
                    {currency} {refund.toFixed(2)}
                </span>
            </div>
        </div>
    )
}

// ── Success Celebration ──────────────────────────────
function SuccessCelebration({ message, sub }: { message: string; sub: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
        >
            <motion.div
                className="size-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.6 }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <CheckCircle className="size-8 text-emerald-400" />
                </motion.div>
            </motion.div>
            {/* Sparkle particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${30 + Math.random() * 40}%`,
                        top: `${20 + Math.random() * 30}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        y: [0, -20 - Math.random() * 30],
                        x: [-10 + Math.random() * 20],
                    }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                >
                    <Sparkles className="size-3 text-emerald-400" />
                </motion.div>
            ))}
            <h3 className="text-lg font-bold text-white mb-1">{message}</h3>
            <p className="text-white/40 text-sm">{sub}</p>
        </motion.div>
    )
}

// ── Quote Expiry Banner ──────────────────────────────
function QuoteExpiryBanner({ expiresAt, onExpired }: { expiresAt: string; onExpired: () => void }) {
    const [timeLeft, setTimeLeft] = useState('')
    const handleExpired = useCallback(onExpired, [onExpired])

    useEffect(() => {
        const update = () => {
            const remaining = Math.max(0, new Date(expiresAt).getTime() - Date.now())
            if (remaining <= 0) {
                handleExpired()
                setTimeLeft('Expired')
                return
            }
            const mins = Math.floor(remaining / 60000)
            const secs = Math.floor((remaining % 60000) / 1000)
            setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
        }
        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [expiresAt, handleExpired])

    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-400 mb-4 flex justify-between items-center"
        >
            <span className="flex items-center gap-1.5"><Clock className="size-3" /> Quote expires in</span>
            <span className="font-mono font-bold">{timeLeft}</span>
        </motion.div>
    )
}

// ── Context Hint ─────────────────────────────────
function ContextHint({ icon: Icon, children, color = 'white/25' }: { icon?: any; children: React.ReactNode; color?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-1.5 text-[10px] text-white/30 leading-relaxed"
        >
            {Icon ? <Icon className="size-3 shrink-0 mt-px" /> : <Info className="size-3 shrink-0 mt-px" />}
            <span>{children}</span>
        </motion.div>
    )
}

// ── Traveler Avatars ─────────────────────────────────
function TravelerAvatars({ passengers }: { passengers: any[] }) {
    if (!passengers || passengers.length === 0) return null

    return (
        <div className="flex items-center gap-1">
            <div className="flex -space-x-1.5">
                {passengers.slice(0, 3).map((p: any, i: number) => (
                    <div key={i} className="size-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center" title={p.given_name ? `${p.given_name} ${p.family_name}` : `Traveler ${i + 1}`}>
                        <span className="text-[8px] font-bold text-white/60">
                            {p.given_name ? p.given_name[0] : <User className="size-2.5" />}
                        </span>
                    </div>
                ))}
            </div>
            {passengers.length > 3 && (
                <span className="text-[10px] text-white/40">+{passengers.length - 3}</span>
            )}
            <span className="text-white/30 text-[10px] ml-0.5">
                {passengers.length} traveler{passengers.length > 1 ? 's' : ''}
            </span>
        </div>
    )
}

// ══════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════

interface UnifiedBookingCardProps {
    booking: UnifiedBooking
    trips: { id: string, name: string }[]
    onUpdate: (updated: Partial<UnifiedBooking>) => void
    onDelete: () => void
    index?: number // for stagger animation
}

export function UnifiedBookingCard({ booking, trips, onUpdate, onDelete, index = 0 }: UnifiedBookingCardProps) {
    const [isRenaming, setIsRenaming] = useState(false)
    const [tempLabel, setTempLabel] = useState(booking.label || "")
    const [loadingLink, setLoadingLink] = useState(false)
    const [loadingRename, setLoadingRename] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)

    // Cancel flow state
    const [cancellingId, setCancellingId] = useState(false)
    const [cancelQuote, setCancelQuote] = useState<any>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [quoteExpired, setQuoteExpired] = useState(false)
    const [cancelSuccess, setCancelSuccess] = useState(false)

    // Change flight flow state
    const [showChangeModal, setShowChangeModal] = useState(false)
    const [changeState, setChangeState] = useState<{
        step: 'select-date' | 'searching' | 'review' | 'confirming' | 'success';
        newDate: string;
        quote: any;
    }>({ step: 'select-date', newDate: '', quote: null })

    const isDuffelBooking = booking.source === 'duffel'
    const isConfirmed = booking.status === 'confirmed' || booking.status === 'booked'
    const isCancelled = booking.status === 'cancelled'
    const isDuffelFlight = isDuffelBooking && booking.type === 'flight'

    const typeColors = TYPE_COLORS[booking.type] || TYPE_COLORS.custom
    const typeGradient = TYPE_GRADIENTS[booking.type] || TYPE_GRADIENTS.custom

    // ── Trip Linking ──────────────────────────────────
    async function handleLinkTrip(tripId: string) {
        setLoadingLink(true)
        try {
            const res = await fetch('/api/bookings/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: booking.id,
                    source: booking.source,
                    tripId: tripId === 'none' ? null : tripId
                })
            })

            if (!res.ok) throw new Error("Failed to link trip")

            const tripName = tripId === 'none' ? undefined : trips.find(t => t.id === tripId)?.name
            onUpdate({ tripId: tripId === 'none' ? undefined : tripId, tripName })
            toast.success(tripId === 'none' ? "Booking unlinked" : `Linked to ${tripName}`)
        } catch (error) {
            toast.error("Failed to update trip link")
        } finally {
            setLoadingLink(false)
        }
    }

    // ── Rename ────────────────────────────────────────
    async function handleRename() {
        setLoadingRename(true)
        try {
            const res = await fetch('/api/bookings/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: booking.id,
                    source: booking.source,
                    label: tempLabel
                })
            })

            if (!res.ok) throw new Error("Failed to rename")

            onUpdate({ label: tempLabel })
            setIsRenaming(false)
            toast.success("Booking renamed")
        } catch (error) {
            toast.error("Failed to rename booking")
        } finally {
            setLoadingRename(false)
        }
    }

    // ── Simple Delete (non-Duffel bookings) ───────────
    async function handleDelete() {
        if (!confirm("Are you sure you want to remove this booking? This cannot be undone.")) return

        setLoadingDelete(true)
        try {
            const res = await fetch('/api/bookings/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: booking.id,
                    source: booking.source
                })
            })

            if (!res.ok) throw new Error("Failed to delete")

            onDelete()
            toast.success("Booking removed")
        } catch (error) {
            toast.error("Failed to remove booking")
        } finally {
            setLoadingDelete(false)
        }
    }

    // ── Duffel Cancel with Refund Quote ───────────────
    async function handleCancelWithQuote() {
        setCancellingId(true)
        try {
            const res = await fetch(`/api/orders/${booking.id}`, { method: "DELETE" })
            const data = await res.json()
            if (data.quote) {
                setCancelQuote(data.quote)
                setShowCancelModal(true)
                setQuoteExpired(false)
                setCancelSuccess(false)
            } else {
                throw new Error(data.error || "Could not get cancellation quote")
            }
        } catch (error: any) {
            toast.error("Failed to get cancellation quote", { description: error.message })
        } finally {
            setCancellingId(false)
        }
    }

    async function handleConfirmCancel() {
        setCancellingId(true)
        try {
            const res = await fetch(`/api/orders/${booking.id}?confirm=true`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                setCancelSuccess(true)
                setTimeout(() => {
                    onUpdate({ status: 'cancelled' })
                    setShowCancelModal(false)
                    setCancelQuote(null)
                    setCancelSuccess(false)
                }, 2000)
            } else {
                throw new Error(data.error)
            }
        } catch (error: any) {
            toast.error("Cancellation failed", { description: error.message })
        } finally {
            setCancellingId(false)
        }
    }

    // ── Duffel Change Flight ──────────────────────────
    async function handleSearchChange() {
        if (!changeState.newDate) return

        setChangeState(prev => ({ ...prev, step: 'searching' }))

        try {
            const realSliceIds = booking.originalData?.metadata?.slice_ids
            const sliceIds = realSliceIds?.length ? realSliceIds : ['sli_mock_1']

            const res = await fetch('/api/orders/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: booking.details.duffelOrderId || booking.id,
                    sliceIds,
                    origin: booking.details.origin || 'JFK',
                    destination: booking.details.destination || 'LHR',
                    departureDate: changeState.newDate
                })
            })

            const data = await res.json()

            if (data.offers && data.offers.length > 0) {
                const offer = data.offers[0]
                setChangeState(prev => ({
                    ...prev,
                    step: 'review',
                    quote: offer
                }))
            } else {
                throw new Error("No alternative flights found for this date")
            }

        } catch (err: any) {
            toast.error("Search failed", { description: err.message })
            setChangeState(prev => ({ ...prev, step: 'select-date' }))
        }
    }

    async function handleConfirmChange() {
        if (!changeState.quote) return

        setChangeState(prev => ({ ...prev, step: 'confirming' }))

        try {
            const res = await fetch('/api/orders/change', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    offerId: changeState.quote.id,
                    orderId: booking.details.duffelOrderId || booking.id,
                    payment: {
                        amount: changeState.quote.total_amount,
                        currency: changeState.quote.total_currency
                    }
                })
            })

            const data = await res.json()
            if (data.success) {
                setChangeState(prev => ({ ...prev, step: 'success' }))
                setTimeout(() => {
                    setShowChangeModal(false)
                    setChangeState({ step: 'select-date', newDate: '', quote: null })
                    onUpdate({ status: 'confirmed' })
                }, 2500)
            } else {
                throw new Error(data.error)
            }
        } catch (err: any) {
            toast.error("Confirmation failed", { description: err.message })
            setChangeState(prev => ({ ...prev, step: 'review' }))
        }
    }

    function resetChangeModal() {
        setShowChangeModal(false)
        setChangeState({ step: 'select-date', newDate: '', quote: null })
    }

    const TypeIcon = booking.type === 'flight' ? Plane
        : booking.type === 'hotel' ? Hotel
            : MapPin

    // Extract conditions from booking metadata if available
    const conditions = booking.details?.conditions
    const isRefundable = conditions?.refund_before_departure !== null && conditions?.refund_before_departure !== undefined
    const isChangeable = conditions?.change_before_departure !== null && conditions?.change_before_departure !== undefined

    return (
        <>
            {/* ── Main Card ────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
            >
                <Card className={`relative overflow-hidden bg-neutral-900 border-white/10 transition-all duration-300 group
                    hover:border-white/20 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5
                    ${isCancelled ? 'opacity-60' : ''}`}
                >
                    {/* Gradient accent strip */}
                    <div className={`h-1 w-full bg-gradient-to-r ${isCancelled ? 'from-neutral-600 to-neutral-700' : typeGradient}`} />

                    <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            {/* Left: Icon & Info */}
                            <div className="flex gap-4 flex-1">
                                {/* Icon with glow ring */}
                                <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${typeColors.bg} ${typeColors.text} ring-1 ring-white/5 shadow-lg ${typeColors.glow} transition-all group-hover:shadow-xl group-hover:scale-105`}>
                                    <TypeIcon className="size-6" />
                                </div>

                                <div className="space-y-1.5 flex-1 min-w-0">
                                    {/* Status row */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Animated status badge */}
                                        <Badge variant="outline" className={`uppercase text-[10px] tracking-wider border-0 flex items-center gap-1.5 ${isConfirmed ? 'bg-emerald-500/10 text-emerald-500'
                                            : isCancelled ? 'bg-red-500/10 text-red-400'
                                                : booking.status === 'failed' ? 'bg-red-500/10 text-red-400'
                                                    : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {/* Pulsing status dot */}
                                            <span className="relative flex size-1.5">
                                                {isConfirmed && (
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                )}
                                                <span className={`relative inline-flex rounded-full size-1.5 ${isConfirmed ? 'bg-emerald-500'
                                                    : isCancelled ? 'bg-red-400'
                                                        : 'bg-yellow-500'
                                                    }`} />
                                            </span>
                                            {booking.status}
                                        </Badge>
                                        {booking.source === 'import' && (
                                            <Badge variant="outline" className="bg-white/5 text-white/40 border-0 text-[10px]">
                                                Imported
                                            </Badge>
                                        )}
                                        <span className="text-white/20 text-[10px] font-mono">
                                            #{booking.bookingReference || booking.id.slice(0, 8)}
                                        </span>
                                    </div>

                                    {/* Title / Rename */}
                                    {isRenaming ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={tempLabel}
                                                onChange={(e) => setTempLabel(e.target.value)}
                                                className="h-8 bg-black/50 border-white/10 text-white w-full max-w-[200px]"
                                                placeholder="Name this booking..."
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                            />
                                            <Button size="icon" variant="ghost" className="size-8 text-emerald-400 hover:bg-emerald-500/10" onClick={handleRename} disabled={loadingRename}>
                                                {loadingRename ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                            </Button>
                                            <Button size="icon" variant="ghost" className="size-8 text-red-400 hover:bg-red-500/10" onClick={() => setIsRenaming(false)}>
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group/title">
                                            <h3 className="text-lg font-bold text-white truncate">
                                                {booking.label || booking.details.title}
                                            </h3>
                                            <button
                                                onClick={() => { setTempLabel(booking.label || booking.details.title); setIsRenaming(true); }}
                                                className="opacity-0 group-hover/title:opacity-100 transition-opacity text-white/20 hover:text-white shrink-0"
                                            >
                                                <Edit2 className="size-3" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Delete/Cancel icon (top-right) */}
                                    {!isRenaming && !isCancelled && (
                                        <button
                                            onClick={isDuffelBooking && isConfirmed ? handleCancelWithQuote : handleDelete}
                                            disabled={loadingDelete || cancellingId}
                                            className="opacity-0 group-hover:opacity-100 transition-all text-white/20 hover:text-red-400 absolute right-4 top-5"
                                            title={isDuffelBooking ? "Cancel Booking" : "Remove Booking"}
                                        >
                                            {(loadingDelete || cancellingId) ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                        </button>
                                    )}

                                    <p className="text-white/50 text-sm truncate">
                                        {booking.label ? booking.details.title : booking.details.subtitle}
                                    </p>

                                    {/* Meta row */}
                                    <div className="flex items-center gap-3 text-white/40 text-xs pt-0.5 flex-wrap">
                                        {booking.details.date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                {new Date(booking.details.date).toLocaleDateString()}
                                            </span>
                                        )}

                                        {/* Traveler avatars */}
                                        <TravelerAvatars passengers={booking.originalData?.passengers || []} />

                                        {/* Policy Badges */}
                                        {isDuffelBooking && conditions && (
                                            <>
                                                {isRefundable && (
                                                    <span className="flex items-center gap-1 text-emerald-400/70">
                                                        <Shield className="size-3" />
                                                        Refundable
                                                    </span>
                                                )}
                                                {!isRefundable && conditions?.refund_before_departure === null && (
                                                    <span className="flex items-center gap-1 text-red-400/70">
                                                        <Shield className="size-3" />
                                                        Non-refundable
                                                    </span>
                                                )}
                                                {isChangeable && (
                                                    <span className="flex items-center gap-1 text-blue-400/70">
                                                        <RefreshCw className="size-3" />
                                                        Changeable
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Price & Actions */}
                            <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                {booking.details.price && (
                                    <div className="text-right">
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Total</p>
                                        <p className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                                            {booking.details.currency} {parseFloat(booking.details.price).toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                {/* Self-Service Actions */}
                                {isDuffelBooking && isConfirmed && (
                                    <>
                                        <div className="flex gap-2">
                                            {isDuffelFlight && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowChangeModal(true)}
                                                    className="bg-transparent border-white/10 text-white hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 text-xs transition-all hover:shadow-lg hover:shadow-blue-500/10"
                                                >
                                                    <RefreshCw className="size-3 mr-1.5" />
                                                    Change
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelWithQuote}
                                                disabled={cancellingId}
                                                className="bg-transparent border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-xs transition-all hover:shadow-lg hover:shadow-red-500/10"
                                            >
                                                {cancellingId ? (
                                                    <Loader2 className="size-3 animate-spin mr-1.5" />
                                                ) : (
                                                    <X className="size-3 mr-1.5" />
                                                )}
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {/* ── Contextual Hints ────────────────── */}

                                {/* Hotel: no modify, suggest cancel+rebook */}
                                {isDuffelBooking && booking.type === 'hotel' && isConfirmed && (
                                    <ContextHint icon={Info}>To modify dates, cancel and rebook with updated preferences.</ContextHint>
                                )}

                                {/* Activity: managed externally via Viator */}
                                {booking.type === 'activity' && isConfirmed && (
                                    <ContextHint icon={ExternalLink}>Managed by Viator — modify or cancel on their platform.</ContextHint>
                                )}

                                {/* Imported: we can't manage externally-booked reservations */}
                                {booking.source === 'import' && (
                                    <ContextHint icon={Info}>Imported booking — manage through your original provider.</ContextHint>
                                )}

                                {/* Non-refundable flight warning */}
                                {isDuffelFlight && isConfirmed && conditions && !isRefundable && conditions?.refund_before_departure === null && (
                                    <ContextHint icon={AlertTriangle}>Non-refundable fare — cancellation fees may apply.</ContextHint>
                                )}

                                {/* Changeable flight: free changes */}
                                {isDuffelFlight && isConfirmed && isChangeable && (
                                    <ContextHint icon={CheckCircle}>Free changes available before departure.</ContextHint>
                                )}

                                {/* Pending/processing */}
                                {booking.status === 'pending' && (
                                    <ContextHint icon={Clock}>Your booking is being processed — usually takes a few minutes.</ContextHint>
                                )}

                                {/* Cancelled: refund timeline */}
                                {isCancelled && (
                                    <ContextHint icon={Clock}>Refund typically arrives in 5–10 business days.</ContextHint>
                                )}

                                {/* Trip Link */}
                                <div className="w-full">
                                    <Select
                                        value={booking.tripId || "none"}
                                        onValueChange={handleLinkTrip}
                                        disabled={loadingLink}
                                    >
                                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white/70 h-8 text-xs hover:bg-white/8 transition-colors">
                                            <div className="flex items-center gap-2 truncate">
                                                <LinkIcon className="size-3 shrink-0" />
                                                <span className="truncate">
                                                    {booking.tripName ? `Linked: ${booking.tripName}` : "Assign to Trip..."}
                                                </span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-white/10">
                                            <SelectItem value="none" className="text-white/50">No Trip (Unlinked)</SelectItem>
                                            {trips.map(trip => (
                                                <SelectItem key={trip.id} value={trip.id} className="text-white">
                                                    {trip.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Cancel Modal ──────────────────────────────── */}
            <AnimatePresence>
                {showCancelModal && cancelQuote && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowCancelModal(false); setCancelQuote(null); }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <button
                                onClick={() => { setShowCancelModal(false); setCancelQuote(null); }}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="size-5" />
                            </button>

                            {cancelSuccess ? (
                                <SuccessCelebration
                                    message="Booking Cancelled"
                                    sub="Your refund will be processed within 5-10 business days."
                                />
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-12 bg-amber-500/10 rounded-xl flex items-center justify-center ring-1 ring-amber-500/20">
                                            <AlertTriangle className="size-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Cancel Booking?</h3>
                                            <p className="text-sm text-white/50">
                                                {booking.bookingReference || booking.id.slice(0, 8)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Visual refund bar */}
                                    <RefundBar
                                        original={booking.details.price ? parseFloat(booking.details.price) : 0}
                                        refund={parseFloat(cancelQuote.refund_amount || '0')}
                                        currency={cancelQuote.refund_currency || booking.details.currency || 'USD'}
                                    />

                                    <p className="text-sm text-white/40 mb-4">
                                        This action cannot be undone. Your refund will be processed within 5-10 business days.
                                    </p>

                                    {cancelQuote.expires_at && (
                                        <QuoteExpiryBanner expiresAt={cancelQuote.expires_at} onExpired={() => setQuoteExpired(true)} />
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 bg-transparent border-white/10 hover:bg-white/5"
                                            onClick={() => { setShowCancelModal(false); setCancelQuote(null); }}
                                        >
                                            Keep Booking
                                        </Button>
                                        <Button
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all"
                                            onClick={handleConfirmCancel}
                                            disabled={cancellingId || quoteExpired}
                                        >
                                            {cancellingId ? (
                                                <Loader2 className="size-4 animate-spin mr-2" />
                                            ) : null}
                                            {quoteExpired ? 'Quote Expired' : 'Confirm Cancel'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Change Flight Modal ──────────────────────── */}
            <AnimatePresence>
                {showChangeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetChangeModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <button
                                onClick={resetChangeModal}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="size-5" />
                            </button>

                            {/* Route context */}
                            <div className="flex items-center gap-2 mb-2">
                                <Plane className="size-4 text-blue-400" />
                                <h2 className="text-xl font-bold text-white">Change Flight</h2>
                            </div>
                            {(booking.details.origin || booking.details.destination) && (
                                <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
                                    <span className="font-mono">{booking.details.origin || '???'}</span>
                                    <ArrowRight className="size-3" />
                                    <span className="font-mono">{booking.details.destination || '???'}</span>
                                </div>
                            )}

                            {/* Stepper */}
                            <StepperProgress currentStep={changeState.step} />

                            {changeState.step === 'select-date' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-white/40 font-bold">New Departure Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all"
                                            onChange={(e) => setChangeState(prev => ({ ...prev, newDate: e.target.value }))}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all"
                                        disabled={!changeState.newDate}
                                        onClick={handleSearchChange}
                                    >
                                        Find Flights
                                    </Button>
                                </motion.div>
                            )}

                            {changeState.step === 'searching' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-8 text-center"
                                >
                                    <div className="relative mx-auto w-fit">
                                        <Loader2 className="size-10 text-blue-500 animate-spin" />
                                        <Plane className="size-4 text-blue-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <p className="text-white/60 mt-4">Searching for alternatives...</p>
                                    <p className="text-white/30 text-xs mt-1">This may take a few seconds</p>
                                </motion.div>
                            )}

                            {changeState.step === 'review' && changeState.quote && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                                                <CheckCircle className="size-4" />
                                                Flight Found
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-white text-lg font-bold">
                                            <span>Additional Cost</span>
                                            <span className="text-emerald-300">{changeState.quote.total_currency} {changeState.quote.total_amount}</span>
                                        </div>
                                        <p className="text-xs text-white/40 mt-2">Includes change fees and fare difference</p>
                                    </div>
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all"
                                        onClick={handleConfirmChange}
                                    >
                                        Confirm & Pay Difference
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-white/40 hover:text-white"
                                        onClick={() => setChangeState(prev => ({ ...prev, step: 'select-date', quote: null }))}
                                    >
                                        ← Pick Different Date
                                    </Button>
                                </motion.div>
                            )}

                            {changeState.step === 'confirming' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-8 text-center"
                                >
                                    <Loader2 className="size-10 text-emerald-500 animate-spin mx-auto mb-4" />
                                    <p className="text-white/60">Processing your change...</p>
                                    <p className="text-white/30 text-xs mt-1">Please don&apos;t close this window</p>
                                </motion.div>
                            )}

                            {changeState.step === 'success' && (
                                <SuccessCelebration
                                    message="Flight Changed!"
                                    sub="Your itinerary has been updated successfully."
                                />
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
