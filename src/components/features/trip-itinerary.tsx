"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, ArrowRight, Heart, Loader2, Sparkles, Share2, Copy, Play, X, CloudSun, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CinemaMap } from "./cinema-map"
import { EnhancedBookingModal } from "./enhanced-booking-modal"
import { AuthModal } from "./auth-modal"
import { TripPdfDocument } from "./trip-pdf"
import { AIChatDrawer, ConciergeButton } from "./ai-chat-drawer"
import { SocialShareModal } from "./social-share-modal"
import { WeatherWidget } from "./weather-widget"
import { pdf } from "@react-pdf/renderer"
import { AudioConcierge } from "./audio-concierge"
import { saveAs } from "file-saver"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { generateAffiliateLink, extractCleanCity } from "@/lib/affiliate"
import { AtmosphericBackground } from "./atmospheric-background"
import { useSound } from "./ambient-sound-provider"
import { useTripAudio } from "@/hooks/use-trip-audio"
import { ActivityCard, HotelVerificationBadge, MoonIcon } from "./trip-itinerary-items"
import { VibeBadge } from "./vibe-badge"
import { ConciergePortal } from "./concierge-portal"

export type TripData = {
    trip_name: string
    sound_theme?: 'city' | 'nature' | 'ocean' | 'desert' | 'cafe'
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
    selection?: {
        flight: any
        hotel: any
    }
}

interface TripItineraryProps {
    data: TripData
    onReset?: () => void
    isHalal?: boolean
    isShared?: boolean
    tripId?: string // If present, enables sharing
    searchQuery?: string // Original search context from user
}

export function TripItinerary({ data, onReset, isHalal = false, isShared = false, tripId, searchQuery }: TripItineraryProps) {
    const [isBookingOpen, setIsBookingOpen] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isPresenting, setIsPresenting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isPortalOpen, setIsPortalOpen] = useState(false)
    const [portalUrl, setPortalUrl] = useState<string | null>(null)
    const [portalTitle, setPortalTitle] = useState("Secure Booking")
    const [providerName, setProviderName] = useState("Expedia")
    const [isSaved, setIsSaved] = useState(!!tripId)
    const [savedTripId, setSavedTripId] = useState<string | null>(tripId || null)
    const [activeDayIndex, setActiveDayIndex] = useState(0)
    const [timeOfDay, setTimeOfDay] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning')

    // Standardized destination extraction using precision utility
    const destinationName = searchQuery || data.trip_name || data.days[0]?.theme || 'Destination'
    const cleanDestination = extractCleanCity(destinationName)

    const [isMounted, setIsMounted] = useState(false)
    const dayRefs = useRef<(HTMLDivElement | null)[]>([])
    const { user } = useAuth()
    const { setTheme } = useSound()
    const router = useRouter()
    const locations = data.days.map(d => d.coordinates)

    // Handle Ambient Audio logic via hook
    useTripAudio(data)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isPresenting) return

        const interval = setInterval(() => {
            setActiveDayIndex(prev => (prev + 1) % data.days.length)
        }, 8000)

        return () => clearInterval(interval)
    }, [isPresenting, data.days.length])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (isPresenting) return
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'))
                        if (!isNaN(index)) {
                            setActiveDayIndex(index)
                        }
                    }
                })
            },
            { rootMargin: '-40% 0px -40% 0px' }
        )

        dayRefs.current.forEach((el) => {
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [data, isPresenting])

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
                if (result.trip?.id) setSavedTripId(result.trip.id)
            }
        } catch (error) {
            toast.error("Failed to save trip")
        } finally {
            setIsSaving(false)
        }
    }

    const handleShare = () => {
        if (!savedTripId) return
        setIsShareModalOpen(true)
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-6xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-1000 ${isPresenting ? 'h-[95vh] border-emerald-500/50' : 'h-[85vh] md:h-[90vh]'}`}
            >
                {/* Atmospheric Background Layer */}
                <AtmosphericBackground
                    destination={data.days[activeDayIndex]?.theme?.split('in ')?.[1] || data.trip_name || 'Paris'}
                    timeOfDay={timeOfDay}
                />

                {/* Top Section: Fixed Map */}
                <div className={`relative shrink-0 bg-neutral-900/60 group overflow-hidden border-b border-white/10 transition-all duration-1000 ${isPresenting ? 'h-full' : 'h-[55%]'}`}>
                    <CinemaMap locations={locations} activeIndex={activeDayIndex} />

                    {/* Overlay Title */}
                    <div className="absolute bottom-6 left-8 right-20 pointer-events-none">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium uppercase tracking-wider border border-emerald-500/20 mb-3 backdrop-blur-md">
                            <CheckCircle className="size-3" />
                            {isShared ? "Shared Application" : "AI Curated"}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-1 drop-shadow-lg max-w-full">{data.trip_name}</h2>
                    </div>

                    {/* Action Buttons Group (Left) */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
                        {!isPresenting && (
                            <button
                                onClick={() => setIsPresenting(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all duration-300 group"
                            >
                                <Play className="size-4 fill-current group-hover:scale-110 transition-transform" />
                                <span className="text-sm">Present Trip</span>
                            </button>
                        )}

                        <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                            {!isShared ? (
                                <>
                                    <div className="relative group/tooltip">
                                        <button
                                            onClick={handleSaveTrip}
                                            disabled={isSaving || isSaved}
                                            className={`p-2 rounded-full transition-all duration-300 ${isSaved
                                                ? "text-emerald-400 bg-emerald-500/10"
                                                : "text-white/70 hover:text-white hover:bg-white/10"
                                                }`}
                                        >
                                            {isSaving ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Heart className={`size-4 ${isSaved ? "fill-current" : ""}`} />
                                            )}
                                        </button>
                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/80 text-[10px] text-white opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10">
                                            {isSaved ? "Saved" : "Save Trip"}
                                        </div>
                                    </div>

                                    {isSaved && savedTripId && (
                                        <div className="relative group/tooltip">
                                            <button
                                                onClick={handleShare}
                                                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                                            >
                                                <Share2 className="size-4" />
                                            </button>
                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/80 text-[10px] text-white opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10">
                                                Share
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => router.push('/')}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                                >
                                    <Sparkles className="size-4 text-yellow-300" />
                                    <span className="text-xs font-medium hidden md:inline">Plan My Own</span>
                                </button>
                            )}

                            {!isShared && (
                                <div className="ml-1">
                                    <ConciergeButton tripName={data.trip_name} onClick={() => setIsChatOpen(true)} />
                                </div>
                            )}

                            {isMounted && !isShared && !isPresenting && (
                                <div className="relative group/tooltip">
                                    <button
                                        onClick={async () => {
                                            const blob = await pdf(<TripPdfDocument data={data} />).toBlob()
                                            const url = URL.createObjectURL(blob)
                                            window.open(url, '_blank')
                                        }}
                                        className="hidden md:flex p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                                    >
                                        <ArrowRight className="size-4 rotate-90" />
                                    </button>
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/80 text-[10px] text-white opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10">
                                        Download PDF
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isPresenting && (
                        <div className="absolute top-20 left-4 z-20">
                            <WeatherWidget
                                lat={data.days[activeDayIndex].coordinates.lat}
                                lng={data.days[activeDayIndex].coordinates.lng}
                            />
                        </div>
                    )}

                    {isPresenting && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 animate-in slide-in-from-top-4">
                            <button
                                onClick={() => setIsPresenting(false)}
                                className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/30 transition-all shadow-xl backdrop-blur-md"
                            >
                                <X className="size-4" />
                                <span className="text-sm font-medium">Exit Presentation</span>
                            </button>
                        </div>
                    )}

                    <AnimatePresence>
                        {isPresenting && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-12 left-0 right-0 z-40 flex justify-center px-4"
                            >
                                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl w-full text-center shadow-2xl">
                                    <h2 className="text-3xl font-bold text-white mb-2">Day {data.days[activeDayIndex].day}</h2>
                                    <p className="text-emerald-400 font-medium uppercase tracking-widest text-sm mb-4">{data.days[activeDayIndex].theme}</p>
                                    <div className="flex justify-center gap-8 text-left">
                                        <div>
                                            <p className="text-xs text-white/40 uppercase mb-1">Morning</p>
                                            <p className="text-white text-sm">{data.days[activeDayIndex].morning}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40 uppercase mb-1">Stay</p>
                                            <p className="text-white text-sm">{data.days[activeDayIndex].stay.split(':')[0]}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center mt-6">
                                        <AudioConcierge
                                            dayData={data.days[activeDayIndex]}
                                            tripName={data.trip_name}
                                        />
                                    </div>

                                    <div className="mt-6 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            key={activeDayIndex}
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 8, ease: "linear" }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Section: Scrollable Timeline */}
                <div className={`flex-1 overflow-y-auto relative bg-transparent scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent transition-all duration-500 ${isPresenting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
                                <div className={`absolute -left-3 top-0 h-6 w-6 rounded-full border-4 border-black flex items-center justify-center transition-colors duration-500 ${activeDayIndex === index ? "bg-emerald-500 scale-110" : "bg-white/20"}`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${activeDayIndex === index ? "bg-white" : "bg-black/50"}`} />
                                </div>

                                <div className="mb-6">
                                    <h3 className={`text-xl font-bold transition-colors duration-300 ${activeDayIndex === index ? "text-emerald-400" : "text-white"}`}>
                                        Day {day.day}
                                    </h3>
                                    <div className="text-white/60 font-medium text-base mt-1">{day.theme}</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div onMouseEnter={() => setTimeOfDay('Morning')}>
                                        <ActivityCard
                                            time="Morning"
                                            title={day.morning}
                                            destination={cleanDestination}
                                            isActive={activeDayIndex === index}

                                        />
                                    </div>
                                    <div onMouseEnter={() => setTimeOfDay('Afternoon')}>
                                        <ActivityCard
                                            time="Afternoon"
                                            title={day.afternoon}
                                            destination={cleanDestination}
                                            isActive={activeDayIndex === index}

                                        />
                                    </div>
                                    <div onMouseEnter={() => setTimeOfDay('Evening')}>
                                        <ActivityCard
                                            time="Evening"
                                            title={day.evening}
                                            destination={cleanDestination}
                                            isActive={activeDayIndex === index}

                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-white/40 text-sm bg-white/5 p-3 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-colors group/stay">
                                    <div className="flex items-center gap-2">
                                        <MoonIcon className="size-4 text-indigo-300" />
                                        <span className="uppercase tracking-widest text-[10px] text-indigo-300/60">Stay:</span>
                                        <span className="text-white/80">{day.stay}</span>
                                        <HotelVerificationBadge hotel={day.stay} />

                                        {/* Luxury Intelligence: Vibe Badges */}
                                        <div className="flex gap-2 ml-4">
                                            {day.theme.toLowerCase().includes('zen') || day.theme.toLowerCase().includes('nature') ? (
                                                <VibeBadge label="Zen Sanctuary" type="sleep" />
                                            ) : day.theme.toLowerCase().includes('luxury') || day.theme.toLowerCase().includes('fine') ? (
                                                <VibeBadge label="Service Excellence" type="service" />
                                            ) : (
                                                <VibeBadge label="Social Hub" type="social" />
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 border-t border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md sticky bottom-0 z-10">
                        <div className="flex flex-col">
                            <button onClick={onReset} className="text-white/40 hover:text-white text-xs mb-1 text-left">
                                ← Back to Vibe
                            </button>
                            {data.selection && (
                                <div className="flex gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">
                                    <Plane className="size-3" /> Flight & Hotel Locked
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {data.selection ? (
                                <Button
                                    size="lg"
                                    className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
                                    onClick={() => {
                                        const flightLink = generateAffiliateLink('flight', {
                                            origin: data.selection?.flight.origin,
                                            destination: data.selection?.flight.destination,
                                            checkIn: '2026-06-01' // Use selected date if available
                                        })
                                        // window.open(flightLink, '_blank') // Replaced with ConciergePortal
                                        setPortalUrl(flightLink)
                                        setPortalTitle("Secure Flight Booking")
                                        setProviderName("Expedia") // Set provider name
                                        setIsPortalOpen(true)

                                        // Also open hotel shortly after or provide a consolidated UI
                                        toast.info("Opening Flight Deep Link...", {
                                            description: "Secure your flight on Expedia while we prepare your hotel link."
                                        })
                                    }}
                                >
                                    Complete Secure Booking <ArrowRight className="size-4 ml-2" />
                                </Button>
                            ) : (
                                <Button size="lg" className="bg-white text-black hover:bg-white/90" onClick={() => setIsBookingOpen(true)}>
                                    Request Custom Package <ArrowRight className="size-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <EnhancedBookingModal
                tripData={data}
                isHalal={isHalal}
                isOpen={isBookingOpen}
                searchQuery={searchQuery}
                onClose={() => setIsBookingOpen(false)}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            <AIChatDrawer
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                tripData={data}
            />

            {savedTripId && (
                <SocialShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    tripName={data.trip_name}
                    shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${savedTripId}`}
                />
            )}

            <ConciergePortal
                isOpen={isPortalOpen}
                url={portalUrl}
                onClose={() => setIsPortalOpen(false)}
                title={portalTitle}
                providerName={providerName}
            />
        </>
    )
}
