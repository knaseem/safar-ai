"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CloudSun, DollarSign, Clock, Plane, ShieldCheck, Wifi, Battery, Radar, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { TripCountdown } from "./trip-countdown"
import { FlightTracker } from "./flight-tracker"

export function TravelHUD() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [destinationTime, setDestinationTime] = useState<Date | null>(null)
    const [showCelsius, setShowCelsius] = useState(true)
    const [booking, setBooking] = useState<any>(null)
    const [weatherData, setWeatherData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isTrackerOpen, setIsTrackerOpen] = useState(false)

    // Default to NYC (Home) and Tokyo (Target) until loaded
    const [destination, setDestination] = useState({ name: "Tokyo", timezoneOffset: 9, lat: 35.6762, lng: 139.6503 })
    const home = { name: "Home", timezoneOffset: -5 } // EST

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Bookings
                const res = await fetch('/api/bookings')
                if (!res.ok) return
                const { bookings } = await res.json()

                // 2. Find Next Upcoming Trip
                const now = new Date()
                const upcoming = bookings
                    .filter((b: any) => new Date(b.check_in) > now)
                    .sort((a: any, b: any) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())[0]

                if (upcoming) {
                    setBooking(upcoming)

                    let lat = 35.6762
                    let lng = 139.6503
                    let name = upcoming.destination.split(' ').pop() || "Trip"

                    // 3. If linked to a saved trip, try to get coordinates
                    if (upcoming.trip_id) {
                        const tripRes = await fetch('/api/trips')
                        const { trips } = await tripRes.json()
                        const trip = trips.find((t: any) => t.id === upcoming.trip_id)

                        if (trip?.trip_data?.days?.[0]?.coordinates) {
                            const coords = trip.trip_data.days[0].coordinates
                            lat = coords.lat
                            lng = coords.lng
                        }
                    }

                    setDestination({ name, timezoneOffset: 9, lat, lng })

                    // 4. Fetch Real Weather
                    try {
                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
                        const weather = await weatherRes.json()
                        setWeatherData(weather.current_weather)
                    } catch (e) {
                        console.error("Weather fetch failed")
                    }
                }
            } catch (error) {
                console.error("HUD Fetch Error", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])


    useEffect(() => {
        // Explicitly set time on mount to switch from server null state to client time
        setCurrentTime(new Date())
        setDestinationTime(new Date())

        const timer = setInterval(() => {
            const now = new Date()
            setCurrentTime(now)

            // Calculate destination time
            // destTime logic is handled here for state consistency
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
            const destTime = new Date(utc + (3600000 * destination.timezoneOffset))
            setDestinationTime(destTime)
        }, 1000)

        // Toggle temperature every 3 seconds
        const tempTimer = setInterval(() => {
            setShowCelsius(prev => !prev)
        }, 3000)

        return () => {
            clearInterval(timer)
            clearInterval(tempTimer)
        }
    }, [destination.timezoneOffset])

    if (!currentTime) return null

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8, type: "spring", bounce: 0.3 }}
            className="fixed top-1/2 -translate-y-1/2 left-4 z-[100] pointer-events-none hidden lg:flex"
        >
            {/* HUD Container - Vertical Command Pillar */}
            <div className="flex flex-col items-center gap-0 p-1.5 bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[8px_0_32px_rgb(0,0,0,0.4)] pointer-events-auto hover:scale-[1.02] transition-transform duration-300">

                {/* Trip Countdown - Enhanced */}
                {booking ? (
                    <div className="w-full flex flex-col gap-2">
                        <TripCountdown
                            tripName={booking.trip_name || "Upcoming Trip"}
                            destination={destination.name}
                            departureDate={booking.check_in}
                        />
                        <button
                            onClick={() => setIsTrackerOpen(true)}
                            className="text-[10px] flex items-center justify-center gap-1.5 py-1 text-emerald-400/60 hover:text-emerald-400 transition-colors uppercase font-bold tracking-wider"
                        >
                            <Radar className="size-3" />
                            Track Flight
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group w-full">
                        <div className="relative">
                            <Plane className="size-5 text-emerald-400 -rotate-45 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex flex-col items-center leading-none mt-1">
                            <span className="text-[8px] uppercase font-bold text-emerald-500/60 tracking-widest mb-0.5">
                                Plan Now
                            </span>
                            <span className="text-xs font-bold text-emerald-400 tracking-wide">
                                -- DAYS
                            </span>
                        </div>
                    </div>
                )}

                {/* Horizontal Separator */}
                <div className="h-px w-8 bg-white/5 my-2" />

                {/* Weather */}
                <div className="flex flex-col items-center gap-1.5 p-2 w-full text-center hover:bg-white/5 rounded-xl transition-colors cursor-default">
                    <CloudSun className="size-5 text-amber-400" />
                    <div className="flex flex-col leading-none">
                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider mb-0.5">
                            {destination.name.substring(0, 3).toUpperCase()}
                        </span>
                        <motion.span
                            key={showCelsius ? "c" : "f"}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs font-bold text-white min-w-[3ch]"
                        >
                            {weatherData ? (
                                showCelsius
                                    ? `${Math.round(weatherData.temperature)}°C`
                                    : `${Math.round(weatherData.temperature * 9 / 5 + 32)}°F`
                            ) : (
                                showCelsius ? "18°C" : "64°F"
                            )}
                        </motion.span>
                    </div>
                </div>

                {/* Horizontal Separator */}
                <div className="h-px w-8 bg-white/5 my-2" />

                {/* Currency */}
                <div className="flex flex-col items-center gap-1.5 p-2 w-full text-center hover:bg-white/5 rounded-xl transition-colors cursor-default">
                    <DollarSign className="size-5 text-emerald-400" />
                    <div className="flex flex-col leading-none">
                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider mb-0.5">
                            {(() => {
                                const city = destination.name.toLowerCase()
                                if (city.includes('tokyo') || city.includes('japan')) return 'JPY'
                                if (city.includes('paris') || city.includes('europe')) return 'EUR'
                                if (city.includes('london') || city.includes('uk')) return 'GBP'
                                if (city.includes('dubai') || city.includes('uae')) return 'AED'
                                return 'USD'
                            })()}
                        </span>
                        <motion.span
                            key={currentTime.getSeconds()}
                            initial={{ color: "#ffffff" }}
                            animate={{ color: ["#10b981", "#ffffff"] }}
                            className="text-[10px] font-mono font-bold text-white"
                        >
                            {(() => {
                                const city = destination.name.toLowerCase()
                                if (city.includes('tokyo')) return '148.42'
                                if (city.includes('paris')) return '0.92'
                                if (city.includes('london')) return '0.78'
                                return '1.00'
                            })()}
                        </motion.span>
                    </div>
                </div>

                {/* Horizontal Separator */}
                <div className="h-px w-8 bg-white/5 my-2" />

                {/* Dual Clocks - Stacked */}
                <div className="flex flex-col gap-3 p-2 w-full">
                    {/* Destination (Highlighted) */}
                    <div className="flex flex-col items-center leading-none text-cyan-400">
                        <span className="text-[8px] font-bold uppercase tracking-wider mb-0.5">
                            {destination.name.substring(0, 3).toUpperCase()}
                        </span>
                        <span className="text-xs font-mono font-bold">
                            {(() => {
                                const offset = Math.round(destination.lng / 15)
                                // Use currentTime which is guaranteed non-null here
                                const utc = currentTime!.getTime() + (currentTime!.getTimezoneOffset() * 60000)
                                const destTime = new Date(utc + (3600000 * offset))
                                return destTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            })()}
                        </span>
                    </div>

                    {/* Home */}
                    <div className="flex flex-col items-center leading-none text-emerald-400/90 hover:text-emerald-400 transition-colors">
                        <span className="text-[8px] font-bold uppercase tracking-wider mb-0.5">NYC</span>
                        <span className="text-[10px] font-mono font-medium">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isTrackerOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsTrackerOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-4xl"
                        >
                            <button
                                onClick={() => setIsTrackerOpen(false)}
                                className="absolute -top-10 right-0 text-white/50 hover:text-white"
                            >
                                <X className="size-6" />
                            </button>
                            <FlightTracker
                                flightNumber={booking?.details?.flight_number || "EK202"}
                                isOpen={isTrackerOpen}
                                onClose={() => setIsTrackerOpen(false)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
