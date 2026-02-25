"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        google: any
    }
}

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun, Sunrise, Sunset, Clock, MapPin, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PrayerTimes {
    Fajr: string
    Sunrise: string
    Dhuhr: string
    Asr: string
    Maghrib: string
    Isha: string
}

interface PrayerOverlayProps {
    coordinates: { lat: number; lng: number }
    date?: string
    onClose: () => void
}

const PRAYER_ICONS: Record<string, any> = {
    Fajr: Sunrise,
    Sunrise: Sun,
    Dhuhr: Sun,
    Asr: Sun,
    Maghrib: Sunset,
    Isha: Moon,
}

const PRAYER_COLORS: Record<string, string> = {
    Fajr: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30",
    Sunrise: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    Dhuhr: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    Asr: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
    Maghrib: "from-rose-500/20 to-orange-500/20 border-rose-500/30",
    Isha: "from-indigo-500/20 to-slate-500/20 border-indigo-500/30",
}

const PRAYER_LABELS: Record<string, string> = {
    Fajr: "Dawn",
    Sunrise: "Sunrise",
    Dhuhr: "Midday",
    Asr: "Afternoon",
    Maghrib: "Sunset",
    Isha: "Night",
}

function getCurrentPrayer(prayers: PrayerTimes): string | null {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const
    let current: string | null = null

    for (const prayer of prayerOrder) {
        const time = prayers[prayer]
        if (!time) continue
        const [h, m] = time.split(":").map(Number)
        const prayerMinutes = h * 60 + m
        if (currentMinutes >= prayerMinutes) {
            current = prayer
        }
    }

    return current
}

export function PrayerOverlay({ coordinates, date, onClose }: PrayerOverlayProps) {
    const [prayers, setPrayers] = useState<PrayerTimes | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [mosques, setMosques] = useState<any[]>([])
    const [loadingMosques, setLoadingMosques] = useState(false)

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            try {
                setLoading(true)
                const dateParam = date || new Date().toISOString().split("T")[0]
                const res = await fetch(
                    `/api/prayer-times?lat=${coordinates.lat}&lng=${coordinates.lng}&date=${dateParam}`
                )
                if (!res.ok) throw new Error("Failed to fetch")
                const data = await res.json()
                setPrayers(data.prayers)
            } catch (err) {
                setError("Could not load prayer times")
            } finally {
                setLoading(false)
            }
        }
        fetchPrayerTimes()
    }, [coordinates.lat, coordinates.lng, date])

    useEffect(() => {
        const fetchMosques = async () => {
            if (!window.google?.maps?.places) return
            try {
                setLoadingMosques(true)
                const service = new window.google.maps.places.PlacesService(
                    document.createElement("div")
                )
                const request = {
                    location: new window.google.maps.LatLng(coordinates.lat, coordinates.lng),
                    radius: 3000,
                    type: "mosque",
                }
                service.nearbySearch(request, (results: any, status: any) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                        setMosques(results.slice(0, 5))
                    }
                    setLoadingMosques(false)
                })
            } catch {
                setLoadingMosques(false)
            }
        }
        fetchMosques()
    }, [coordinates.lat, coordinates.lng])

    const currentPrayer = prayers ? getCurrentPrayer(prayers) : null

    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="absolute top-4 right-4 z-50 w-72 max-h-[80vh] overflow-y-auto"
        >
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🕌</span>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Prayer Times</h3>
                                <p className="text-[10px] text-white/40">
                                    {coordinates.lat.toFixed(2)}°, {coordinates.lng.toFixed(2)}°
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="size-4 text-white/60" />
                        </button>
                    </div>
                </div>

                {/* Prayer Times */}
                <div className="p-3 space-y-1.5">
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="size-5 text-emerald-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <p className="text-xs text-red-400 text-center py-4">{error}</p>
                    ) : prayers ? (
                        Object.entries(prayers).map(([name, time]) => {
                            const Icon = PRAYER_ICONS[name] || Clock
                            const isCurrent = currentPrayer === name
                            return (
                                <motion.div
                                    key={name}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-xl border transition-all",
                                        isCurrent
                                            ? `bg-gradient-to-r ${PRAYER_COLORS[name]} border-emerald-500/50 ring-1 ring-emerald-500/20`
                                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn(
                                            "p-1.5 rounded-lg",
                                            isCurrent ? "bg-emerald-500/20" : "bg-white/5"
                                        )}>
                                            <Icon className={cn(
                                                "size-3.5",
                                                isCurrent ? "text-emerald-400" : "text-white/40"
                                            )} />
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "text-xs font-medium",
                                                isCurrent ? "text-emerald-300" : "text-white/70"
                                            )}>
                                                {name}
                                            </p>
                                            <p className="text-[10px] text-white/30">
                                                {PRAYER_LABELS[name]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {isCurrent && (
                                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                                                Now
                                            </span>
                                        )}
                                        <span className={cn(
                                            "text-sm font-mono tabular-nums",
                                            isCurrent ? "text-emerald-300 font-semibold" : "text-white/50"
                                        )}>
                                            {time}
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        })
                    ) : null}
                </div>

                {/* Nearby Mosques */}
                {mosques.length > 0 && (
                    <div className="border-t border-white/5 p-3">
                        <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 px-1">
                            Nearby Mosques
                        </h4>
                        <div className="space-y-1.5">
                            {mosques.map((mosque: any, i: number) => (
                                <motion.div
                                    key={mosque.place_id || i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => {
                                        const lat = mosque.geometry?.location?.lat()
                                        const lng = mosque.geometry?.location?.lng()
                                        if (lat && lng) {
                                            window.open(
                                                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                                                "_blank"
                                            )
                                        }
                                    }}
                                >
                                    <MapPin className="size-3.5 text-emerald-500/60 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-white/70 font-medium truncate">
                                            {mosque.name}
                                        </p>
                                        {mosque.vicinity && (
                                            <p className="text-[10px] text-white/30 truncate">
                                                {mosque.vicinity}
                                            </p>
                                        )}
                                        {mosque.rating && (
                                            <p className="text-[10px] text-amber-400/60">
                                                ★ {mosque.rating}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {loadingMosques && (
                    <div className="border-t border-white/5 p-3">
                        <div className="flex items-center gap-2 text-white/30 text-xs">
                            <Loader2 className="size-3 animate-spin" />
                            Searching nearby mosques...
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
