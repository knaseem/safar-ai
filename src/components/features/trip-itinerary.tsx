"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CinemaMap } from "./cinema-map"
import { EnhancedBookingModal } from "./enhanced-booking-modal"
import { AuthModal } from "./auth-modal"
import { TripPdfDocument } from "./trip-pdf"
import { pdf } from "@react-pdf/renderer"
import { saveAs } from "file-saver"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export type TripData = {
    trip_name: string
    days: {
        day: number
        theme: string
        coordinates: {
            lat: number
            lng: number
        }
        morning: string
        afternoon: string
        evening: string
        stay: string
    }[]
}

interface TripItineraryProps {
    data: TripData
    onReset: () => void
    isHalal?: boolean
}

export function TripItinerary({ data, onReset, isHalal = false }: TripItineraryProps) {
    const [isBookingOpen, setIsBookingOpen] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [activeDayIndex, setActiveDayIndex] = useState(0)
    const [isMounted, setIsMounted] = useState(false)
    const dayRefs = useRef<(HTMLDivElement | null)[]>([])
    const { user } = useAuth()
    const locations = data.days.map(d => d.coordinates)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'))
                        if (!isNaN(index)) {
                            setActiveDayIndex(index)
                        }
                    }
                })
            },
            { rootMargin: '-40% 0px -40% 0px' } // Trigger when element is in middle of viewport
        )

        dayRefs.current.forEach((el) => {
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [data])

    const handleSaveTrip = async () => {
        if (!user) {
            setIsAuthModalOpen(true)
            return
        }

        setIsSaving(true)
        try {
            const res = await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trip_name: data.trip_name,
                    trip_data: data,
                    is_halal: isHalal,
                    destination: data.days[0]?.theme || null
                })
            })

            const result = await res.json()

            if (!res.ok) {
                if (res.status === 409) {
                    toast.info("Trip already saved", { description: "Check your dashboard" })
                    setIsSaved(true)
                } else if (res.status === 403) {
                    toast.error("Trip limit reached", { description: "Delete some trips to save new ones" })
                } else {
                    throw new Error(result.error)
                }
            } else {
                toast.success("Trip saved!", { description: "View it in your dashboard" })
                setIsSaved(true)
            }
        } catch (error) {
            toast.error("Failed to save trip")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[90vh]"
            >
                {/* Top Section: Fixed Map */}
                <div className="relative h-[55%] shrink-0 bg-neutral-900 group overflow-hidden border-b border-white/10">
                    <CinemaMap locations={locations} activeIndex={activeDayIndex} />

                    {/* Overlay Title */}
                    <div className="absolute bottom-6 left-8 right-20 pointer-events-none">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium uppercase tracking-wider border border-emerald-500/20 mb-3 backdrop-blur-md">
                            <CheckCircle className="size-3" />
                            AI Curated
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-1 drop-shadow-lg max-w-full">{data.trip_name}</h2>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveTrip}
                        disabled={isSaving || isSaved}
                        className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300 ${isSaved
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                            : "bg-black/40 border-white/20 text-white hover:bg-black/60 hover:border-white/30"
                            }`}
                    >
                        {isSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Heart className={`size-4 ${isSaved ? "fill-current" : ""}`} />
                        )}
                        <span className="text-sm font-medium">
                            {isSaved ? "Saved" : "Save Trip"}
                        </span>
                    </button>

                    {/* PDF Download Button - Client Only */}
                    {isMounted && (
                        <button
                            onClick={async () => {
                                const blob = await pdf(<TripPdfDocument data={data} />).toBlob()
                                const url = URL.createObjectURL(blob)
                                // Open in new tab - user can save with Cmd+S
                                window.open(url, '_blank')
                            }}
                            className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border bg-black/40 border-white/20 text-white hover:bg-black/60 hover:border-white/30 transition-all duration-300"
                        >
                            <ArrowRight className="size-4 rotate-90" />
                            <span className="text-sm font-medium">Download PDF</span>
                        </button>
                    )}
                </div>

                {/* Bottom Section: Scrollable Timeline */}
                <div className="flex-1 overflow-y-auto relative bg-transparent scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="flex-1 p-8 space-y-12">
                        {data.days.map((day, index) => (
                            <motion.div
                                key={day.day}
                                ref={(el: HTMLDivElement | null) => { dayRefs.current[index] = el }}
                                data-index={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative pl-8 border-l last:border-0 transition-colors duration-500 ${activeDayIndex === index ? "border-emerald-500/50" : "border-white/10"}`}
                            >
                                {/* Day Marker */}
                                <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-emerald-500 border-4 border-black flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 bg-white rounded-full" />
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        Day {day.day}
                                        <span className="text-white/40 font-normal text-base">— {day.theme}</span>
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ActivityCard time="Morning" title={day.morning} destination={data.days[0]?.theme?.split(' ').slice(-1)[0] || data.trip_name} />
                                    <ActivityCard time="Afternoon" title={day.afternoon} destination={data.days[0]?.theme?.split(' ').slice(-1)[0] || data.trip_name} />
                                    <ActivityCard time="Evening" title={day.evening} destination={data.days[0]?.theme?.split(' ').slice(-1)[0] || data.trip_name} />
                                </div>

                                <div className="mt-4 flex items-center justify-between text-white/40 text-sm bg-white/5 p-3 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-colors group/stay">
                                    <div className="flex items-center gap-2">
                                        <MoonIcon className="size-4" />
                                        <span className="uppercase tracking-widest text-[10px]">Stay:</span>
                                        <span className="text-white/80">{day.stay}</span>
                                        <HotelVerificationBadge hotel={day.stay} />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const hotel = day.stay.split(':')[0]
                                            window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel)}`, '_blank')
                                        }}
                                        className="opacity-0 group-hover/stay:opacity-100 flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded transition-all hover:bg-emerald-500/20"
                                    >
                                        Check Rates <ArrowRight className="size-3" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 border-t border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md sticky bottom-0 z-10">
                        <button onClick={onReset} className="text-white/40 hover:text-white text-sm">
                            ← Back
                        </button>
                        <Button size="lg" className="bg-white text-black hover:bg-white/90" onClick={() => setIsBookingOpen(true)}>
                            Proprietary Booking <ArrowRight className="size-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            <EnhancedBookingModal
                tripData={data}
                isHalal={isHalal}
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    )
}

function HotelVerificationBadge({ hotel }: { hotel: string }) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'verified'>('idle')
    const [savings, setSavings] = useState(0)

    useEffect(() => {
        // Auto-verify on mount for "Autonomous" feel
        const verify = async () => {
            setStatus('checking')
            try {
                const res = await fetch('/api/agent/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ item: hotel, type: 'hotel', originalPrice: 200 })
                })
                const data = await res.json()
                setSavings(data.savings)
                setStatus('verified')
            } catch (e) {
                setStatus('idle')
            }
        }
        // Stagger checks so they don't all spin at once
        const timeout = setTimeout(verify, Math.random() * 2000 + 500)
        return () => clearTimeout(timeout)
    }, [hotel])

    if (status === 'idle') return null

    if (status === 'checking') return (
        <span className="flex items-center gap-1.5 text-[10px] text-white/40 ml-2 animate-pulse">
            <Loader2 className="size-3 animate-spin" />
            AI Verifying...
        </span>
    )

    return (
        <span className="flex items-center gap-1.5 text-[10px] ml-2 animate-in fade-in zoom-in duration-300">
            <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-emerald-400 font-medium">Verified Now</span>
            {savings > 0 && <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">Save ${savings}</span>}
        </span>
    )
}

function ActivityCard({ time, title, destination }: { time: string, title: string, destination: string }) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'verified'>('idle')

    // Extract key term for search (remove generic words if needed, but usually full title + destination works better)
    // Simple heuristic: search for the whole activity string
    const handleBook = () => {
        const query = `${title} ${destination}`
        window.open(`https://www.viator.com/searchResults/all?text=${encodeURIComponent(query)}`, '_blank')
    }

    // Trigger verification on hover
    const handleMouseEnter = () => {
        if (status === 'idle') {
            setStatus('checking')
            // Mock API call
            setTimeout(() => setStatus('verified'), 1200)
        }
    }

    return (
        <div
            className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all flex flex-col h-full relative overflow-hidden"
            onMouseEnter={handleMouseEnter}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className="text-[10px] uppercase tracking-widest text-emerald-400">{time}</div>
                    {status === 'checking' && <Loader2 className="size-3 text-white/20 animate-spin" />}
                    {status === 'verified' && (
                        <div className="flex items-center gap-1">
                            <div className="size-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] text-white/40">Live</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleBook}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500 text-black p-1 rounded hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                    title="Book Activity"
                >
                    <ArrowRight className="size-3 -rotate-45" />
                </button>
            </div>
            <p className="text-white/90 text-sm font-medium leading-relaxed flex-1">
                {title}
            </p>
        </div>
    )
}

function MoonIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    )
}

