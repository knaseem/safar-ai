"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plane, Clock, Gauge, Mountain, MapPin, Radio, X, RefreshCw, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface FlightTrackerProps {
    flightNumber: string
    departureIata?: string
    arrivalIata?: string
    departureTime?: string
    isOpen: boolean
    onClose: () => void
}

interface TrackingData {
    status: string
    live: {
        latitude: number
        longitude: number
        altitude: number
        speed_horizontal: number
        direction: number
        is_ground: boolean
        progress?: number
    } | null
    departure: {
        airport: string
        iata: string
        scheduled: string
        actual: string | null
    }
    arrival: {
        airport: string
        iata: string
        scheduled: string
        estimated: string
    }
    airline: { name: string; iata: string }
    flight: { number: string }
    route?: {
        departure: { lat: number; lng: number }
        arrival: { lat: number; lng: number }
        waypoints: { lat: number; lng: number }[]
    }
    source: "live" | "simulated"
}

export function FlightTracker({ flightNumber, departureIata, arrivalIata, departureTime, isOpen, onClose }: FlightTrackerProps) {
    const [tracking, setTracking] = useState<TrackingData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const fetchTracking = useCallback(async () => {
        if (!flightNumber) return
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({ flight: flightNumber })
            if (departureIata) params.set("dep", departureIata)
            if (arrivalIata) params.set("arr", arrivalIata)
            if (departureTime) params.set("dep_time", departureTime)

            const res = await fetch(`/api/flights/track?${params}`)
            if (!res.ok) throw new Error("Failed to track flight")
            const data = await res.json()
            setTracking(data)
            setLastUpdated(new Date())
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [flightNumber, departureIata, arrivalIata, departureTime])

    useEffect(() => {
        if (isOpen) {
            fetchTracking()
            // Auto-refresh every 60 seconds
            const interval = setInterval(fetchTracking, 60000)
            return () => clearInterval(interval)
        }
    }, [isOpen, fetchTracking])

    if (!isOpen) return null

    const progress = tracking?.live?.progress || 0
    const status = tracking?.status || "unknown"

    const statusConfig: Record<string, { color: string; bg: string; label: string; pulse: boolean }> = {
        "scheduled": { color: "text-blue-400", bg: "bg-blue-500/20", label: "Scheduled", pulse: false },
        "departing": { color: "text-amber-400", bg: "bg-amber-500/20", label: "Departing", pulse: true },
        "en-route": { color: "text-emerald-400", bg: "bg-emerald-500/20", label: "In Flight", pulse: true },
        "landed": { color: "text-purple-400", bg: "bg-purple-500/20", label: "Landed", pulse: false },
        "unknown": { color: "text-white/40", bg: "bg-white/10", label: "Unknown", pulse: false },
    }
    const sc = statusConfig[status] || statusConfig.unknown

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", bounce: 0.2 }}
                    className="relative w-full max-w-2xl bg-neutral-900/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="relative p-6 pb-4 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Radio className={cn("size-5", sc.color, sc.pulse && "animate-pulse")} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Flight Tracker</h2>
                                    <p className="text-xs text-white/40">
                                        {tracking?.source === "live" ? "Live data via AviationStack" : "Estimated position"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); fetchTracking() }}
                                    className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <RefreshCw className={cn("size-4 text-white/50", loading && "animate-spin")} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <X className="size-4 text-white/50" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading && !tracking ? (
                        <div className="p-12 text-center">
                            <div className="relative size-16 mx-auto mb-4">
                                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                                <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin" />
                                <Plane className="absolute inset-0 m-auto size-6 text-emerald-400 -rotate-45" />
                            </div>
                            <p className="text-white/40 text-sm">Locating {flightNumber}...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-red-400 mb-2">{error}</p>
                            <button onClick={fetchTracking} className="text-emerald-400 underline text-sm">Retry</button>
                        </div>
                    ) : tracking ? (
                        <div className="p-6 space-y-6">
                            {/* Flight Number & Status */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-white font-mono">{tracking.flight.number}</span>
                                    <span className="text-sm text-white/40">{tracking.airline.name}</span>
                                </div>
                                <div className={cn("px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider", sc.bg, sc.color)}>
                                    {sc.pulse && <span className="inline-block size-1.5 rounded-full bg-current mr-1.5 animate-pulse" />}
                                    {sc.label}
                                </div>
                            </div>

                            {/* Route Visualization */}
                            <div className="relative bg-white/5 rounded-2xl p-6 border border-white/5 overflow-hidden">
                                {/* Neon flight path */}
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-16">
                                    <div className="h-0.5 bg-white/10 rounded-full relative">
                                        {/* Progress glow */}
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                                        />
                                        {/* Plane icon on path */}
                                        {status === "en-route" && (
                                            <motion.div
                                                initial={{ left: "0%" }}
                                                animate={{ left: `${progress}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                            >
                                                <div className="relative">
                                                    <div className="absolute inset-0 size-8 bg-emerald-500/30 rounded-full blur-md animate-pulse" />
                                                    <div className="relative size-8 bg-neutral-800 border border-emerald-500/50 rounded-full flex items-center justify-center">
                                                        <Plane className="size-4 text-emerald-400 -rotate-45" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Departure & Arrival */}
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="text-center">
                                        <div className="size-12 bg-neutral-800 border border-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                                            <span className="text-lg font-bold text-white font-mono">{tracking.departure.iata}</span>
                                        </div>
                                        <p className="text-xs text-white/60 max-w-[100px] truncate">{tracking.departure.airport}</p>
                                        <p className="text-[10px] text-white/30 mt-0.5">
                                            {tracking.departure.actual
                                                ? `Departed ${formatTime(tracking.departure.actual)}`
                                                : `Departs ${formatTime(tracking.departure.scheduled)}`}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center pt-2">
                                        <ArrowRight className="size-4 text-white/20 mb-1" />
                                        <span className="text-xs font-bold text-emerald-400">{progress}%</span>
                                    </div>

                                    <div className="text-center">
                                        <div className="size-12 bg-neutral-800 border border-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                                            <span className="text-lg font-bold text-white font-mono">{tracking.arrival.iata}</span>
                                        </div>
                                        <p className="text-xs text-white/60 max-w-[100px] truncate">{tracking.arrival.airport}</p>
                                        <p className="text-[10px] text-white/30 mt-0.5">
                                            ETA {formatTime(tracking.arrival.estimated || tracking.arrival.scheduled)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Live Stats Grid */}
                            {tracking.live && (
                                <div className="grid grid-cols-4 gap-3">
                                    <StatCard
                                        icon={Mountain}
                                        label="Altitude"
                                        value={`${(tracking.live.altitude / 1000).toFixed(1)}k`}
                                        unit="ft"
                                        color="text-blue-400"
                                    />
                                    <StatCard
                                        icon={Gauge}
                                        label="Speed"
                                        value={tracking.live.speed_horizontal.toString()}
                                        unit="mph"
                                        color="text-emerald-400"
                                    />
                                    <StatCard
                                        icon={MapPin}
                                        label="Position"
                                        value={`${tracking.live.latitude.toFixed(1)}°`}
                                        unit={tracking.live.latitude >= 0 ? "N" : "S"}
                                        color="text-amber-400"
                                    />
                                    <StatCard
                                        icon={Clock}
                                        label="ETA"
                                        value={formatETA(tracking.arrival.estimated || tracking.arrival.scheduled)}
                                        unit=""
                                        color="text-purple-400"
                                    />
                                </div>
                            )}

                            {/* Last Updated */}
                            <div className="flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase tracking-wider">
                                <Radio className="size-3" />
                                <span>
                                    Last updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
                                    {tracking.source === "simulated" && " • Estimated Position"}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

function StatCard({ icon: Icon, label, value, unit, color }: {
    icon: any; label: string; value: string; unit: string; color: string
}) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center hover:bg-white/[0.07] transition-colors">
            <Icon className={cn("size-4 mx-auto mb-1.5", color)} />
            <p className="text-xs text-white/40 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-white font-mono">
                {value}<span className="text-[10px] text-white/40 ml-0.5">{unit}</span>
            </p>
        </div>
    )
}

function formatTime(isoString: string): string {
    try {
        return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
        return "—"
    }
}

function formatETA(isoString: string): string {
    try {
        const eta = new Date(isoString).getTime()
        const now = Date.now()
        const diff = eta - now

        if (diff <= 0) return "Arrived"

        const hours = Math.floor(diff / 3600000)
        const mins = Math.floor((diff % 3600000) / 60000)

        if (hours > 0) return `${hours}h${mins}m`
        return `${mins}m`
    } catch {
        return "—"
    }
}
