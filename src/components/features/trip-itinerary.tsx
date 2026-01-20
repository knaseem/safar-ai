"use client"

import { useState } from 'react'
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CinemaMap } from "./cinema-map"
import { BookingModal } from "./booking-modal"

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
}

export function TripItinerary({ data, onReset }: TripItineraryProps) {
    const [isBookingOpen, setIsBookingOpen] = useState(false)
    const locations = data.days.map(d => d.coordinates)

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header / Cinema Mode */}
                <div className="relative h-64 md:h-96 bg-neutral-900 group overflow-hidden">
                    <CinemaMap locations={locations} />

                    {/* Overlay Title */}
                    <div className="absolute bottom-6 left-8 pointer-events-none">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium uppercase tracking-wider border border-emerald-500/20 mb-3 backdrop-blur-md">
                            <CheckCircle className="size-3" />
                            AI Curated
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-1 drop-shadow-lg">{data.trip_name}</h2>
                    </div>
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
