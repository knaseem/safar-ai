"use client"

import { useState } from 'react'
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CinemaMap } from "./cinema-map"
import { BookingModal } from "./booking-modal"
import { AuthModal } from "./auth-modal"
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
    const { user } = useAuth()
    const locations = data.days.map(d => d.coordinates)

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
                className="w-full max-w-4xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header / Cinema Mode */}
                <div className="relative h-80 md:h-[500px] bg-neutral-900 group overflow-hidden">
                    <CinemaMap locations={locations} />

                    {/* Overlay Title */}
                    <div className="absolute bottom-6 left-8 pointer-events-none">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium uppercase tracking-wider border border-emerald-500/20 mb-3 backdrop-blur-md">
                            <CheckCircle className="size-3" />
                            AI Curated
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-1 drop-shadow-lg">{data.trip_name}</h2>
                    </div>

                    {/* Save Button - positioned top-left to avoid cinema map controls */}
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
                </div>

                {/* Timeline */}
                <div className="p-8 space-y-12">
                    {data.days.map((day, index) => (
                        <motion.div
                            key={day.day}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-8 border-l border-white/10 last:border-0"
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
                                {/* Morning */}
                                <ActivityCard time="Morning" title={day.morning} />
                                {/* Afternoon */}
                                <ActivityCard time="Afternoon" title={day.afternoon} />
                                {/* Evening */}
                                <ActivityCard time="Evening" title={day.evening} />
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-white/40 text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                                <MoonIcon className="size-4" />
                                <span className="uppercase tracking-widest text-[10px]">Stay:</span>
                                <span className="text-white/80">{day.stay}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="p-8 border-t border-white/10 flex justify-between items-center bg-black/20">
                    <button onClick={onReset} className="text-white/40 hover:text-white text-sm">
                        ← Plan Another Trip
                    </button>
                    <Button size="lg" className="bg-white text-black hover:bg-white/90" onClick={() => setIsBookingOpen(true)}>
                        Proprietary Booking <ArrowRight className="size-4 ml-2" />
                    </Button>
                </div>
            </motion.div>

            <BookingModal
                tripName={data.trip_name}
                days={data.days.length}
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

function ActivityCard({ time, title }: { time: string, title: string }) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="text-[10px] uppercase tracking-widest text-emerald-400 mb-2">{time}</div>
            <p className="text-white/90 text-sm font-medium leading-relaxed">
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
