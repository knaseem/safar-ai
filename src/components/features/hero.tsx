"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, Moon } from "lucide-react"
import { toast } from "sonner"
import { TripItinerary, TripData } from "./trip-itinerary"
import { StaysSearchForm } from "./stays/stays-search-form"
import { HotelResultsModal } from "./stays/hotel-results-modal"
import { FlightsSearchForm } from "./flights/flights-search-form"
import { FlightResultsModal } from "./flights/flight-results-modal"

// Rotating placeholder suggestions
const placeholderSuggestions = [
    "3 day trip to Chicago",
    "5 day trip to Dubai",
    "7 day adventure in Bali",
    "Weekend getaway to Paris",
    "10 days exploring Japan",
    "4 days in Marrakech",
    "Beach vacation in Maldives",
]

const halalPlaceholderSuggestions = [
    "Umrah trip to Mecca, Saudi Arabia",
    "Luxury Umrah package with Medina visit, 5-star hotels",
    "Islamic heritage tour in Mecca",
    "Islamic heritage tour in Medina",
    "Family trip to Malaysia, alcohol-free hotels",
    "Halal foodie tour in Osaka, prayer-friendly itinerary",
    "Relaxing week in Maldives, private villa",
    "Islamic heritage tour in Andalusia (Cordoba & Granada)",
    "Winter break in Qatar, family activities",
    "Ottoman history tour in Istanbul and Bursa",
    "Halal-friendly nature retreat in Bosnia & Herzegovina",
    "Luxury shopping and desert safari in Dubai",
    "Zanzibar beach holiday, halal food resorts",
    "Scenic train trip in Switzerland, halal dining options",
]

interface HeroProps {
    initialPrompt?: string;
}

const HERO_IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?q=80&w=2670&auto=format&fit=crop", // Confirmed Full Burj Khalifa
        location: "Burj Khalifa, Dubai",
        credit: "Unsplash"
    },
    {
        url: "https://images.pexels.com/photos/11215343/pexels-photo-11215343.jpeg?auto=compress&cs=tinysrgb&w=2600", // Elephant Rock - Pexels
        location: "Elephant Rock, AlUla",
        credit: "Pexels"
    },
    {
        url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop",
        location: "Kyoto, Japan",
        credit: "Sorasak"
    },
    {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop", // Confirmed working Zermatt
        location: "Zermatt, Switzerland",
        credit: "Jrg"
    },
    {
        url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2673&auto=format&fit=crop",
        location: "Paris, France",
        credit: "Anthony DELANOIX"
    },
    {
        url: "https://images.pexels.com/photos/14822617/pexels-photo-14822617.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // User provided Pexels image
        location: "Swat Valley, Pakistan",
        credit: "Pexels"
    },
    {
        url: "https://images.pexels.com/photos/27698081/pexels-photo-27698081.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // User provided Pexels image (Faisal Mosque)
        location: "Islamabad, Pakistan",
        credit: "Pexels"
    },
    {
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
        location: "Maldives",
        credit: "Rayyu"
    },
    {
        url: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2654&auto=format&fit=crop",
        location: "Iceland",
        credit: "Davide Cantelli"
    },
    {
        url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2274&auto=format&fit=crop",
        location: "Kuala Lumpur, Malaysia",
        credit: "Esmonde Yong"
    },
    {
        url: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2670&auto=format&fit=crop",
        location: "Beijing, China",
        credit: "Zhang Kaiyv"
    },
    {
        url: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?q=80&w=2670&auto=format&fit=crop", // Restored generic Shanghai skyline that works
        location: "Shanghai, China",
        credit: "Edward He"
    }
]

const HALAL_HERO_IMAGES = [
    {
        url: "/images/ai-hero/mecca-hero-real.png", // Generated AI Image (Ultra Realistic Kaaba)
        location: "Mecca, Saudi Arabia",
        credit: "SafarAI Imagination"
    },
    {
        url: "/images/ai-hero/medina-hero-front.png", // Generated AI Image (Masjid Nabawi Front)
        location: "Medina, Saudi Arabia",
        credit: "SafarAI Imagination"
    },
    {
        url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2600&auto=format&fit=crop", // Istanbul (Verified Unsplash)
        location: "Istanbul, Turkey",
        credit: "Unsplash"
    },
    {
        url: "https://images.pexels.com/photos/3566139/pexels-photo-3566139.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Alhambra (Verified Pexels)
        location: "Granada, Spain",
        credit: "Pexels"
    },
    {
        url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2274&auto=format&fit=crop", // Kuala Lumpur (Unsplash safe fallback)
        location: "Kuala Lumpur, Malaysia",
        credit: "Unsplash"
    },
    {
        url: "/images/ai-hero/dubai-hero.png", // Generated AI Image (Sci-fi Future)
        location: "Dubai, UAE",
        credit: "SafarAI Imagination"
    },
    {
        url: "/images/ai-hero/zanzibar-hero.png", // Generated AI Image (Tropical Paradise)
        location: "Zanzibar, Tanzania",
        credit: "SafarAI Imagination"
    },
    {
        url: "/images/ai-hero/doha-hero.png", // Generated AI Image (Cyberpunk West Bay)
        location: "Doha, Qatar",
        credit: "SafarAI Imagination"
    }
]

export function Hero({ initialPrompt }: HeroProps) {
    const [isHalal, setIsHalal] = useState(false)
    const [mode, setMode] = useState<'ai' | 'stays' | 'flights'>('ai')
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [tripData, setTripData] = useState<TripData | null>(null)
    const [placeholderIndex, setPlaceholderIndex] = useState(0)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Stays State
    const [showHotelResults, setShowHotelResults] = useState(false)
    const [hotelResults, setHotelResults] = useState<any[]>([])
    const [searchedParams, setSearchedParams] = useState<any>(null)

    // Flights State
    const [showFlightResults, setShowFlightResults] = useState(false)
    const [flightResults, setFlightResults] = useState<any>(null)
    const [searchedFlightParams, setSearchedFlightParams] = useState<any>(null)

    const router = useRouter()

    const handleStaysSearch = async (params: any) => {
        setLoading(true)
        setSearchedParams(params)

        try {
            const res = await fetch('/api/stays/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            })
            const data = await res.json()

            if (data.results) {
                setHotelResults(data.results)
                setShowHotelResults(true)
            } else {
                toast.error("No results found")
            }
        } catch (e) {
            toast.error("Failed to search stays")
        } finally {
            setLoading(false)
        }
    }

    const handleFlightsSearch = async (params: any) => {
        setLoading(true)
        setSearchedFlightParams(params)

        try {
            const res = await fetch('/api/flights/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            })
            const data = await res.json()

            if (data.offers) {
                setFlightResults(data)
                setShowFlightResults(true)
            } else {
                toast.error("No flights found. Try broader dates.")
            }
        } catch (e) {
            toast.error("Failed to search flights")
        } finally {
            setLoading(false)
        }
    }

    // Handle initial prompt from parent
    useEffect(() => {
        if (initialPrompt) {
            setInput(initialPrompt)
            const timer = setTimeout(() => {
                const triggerSearch = document.getElementById('trigger-search-btn')
                if (triggerSearch) triggerSearch.click()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [initialPrompt])

    // Rotate placeholder every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const list = isHalal ? halalPlaceholderSuggestions : placeholderSuggestions
            setPlaceholderIndex((prev) => (prev + 1) % list.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [isHalal])

    // Rotate Hero Image every 5 seconds (Faster Pace)
    useEffect(() => {
        const interval = setInterval(() => {
            const list = isHalal ? HALAL_HERO_IMAGES : HERO_IMAGES
            setCurrentImageIndex((prev) => (prev + 1) % list.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [isHalal])

    // Reset index when mode toggles
    useEffect(() => {
        setCurrentImageIndex(0)
    }, [isHalal])

    const activeImages = isHalal ? HALAL_HERO_IMAGES : HERO_IMAGES

    const handlePlanTrip = async () => {
        if (!input.trim()) return

        setLoading(true)
        const toastId = toast.loading("Consulting the Neural Net...")

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input, isHalal })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Failed to generate")

            toast.dismiss(toastId)
            toast.success("Itinerary Ready", {
                description: `Created: ${data.trip_name}`,
                duration: 3000
            })

            if (data.id) {
                router.push(`/trip/generated/${data.id}`)
            } else {
                setTripData(data)
            }
        } catch (err) {
            toast.dismiss(toastId)
            toast.error("Planning Failed", {
                description: "Our AI agents are currently overwhelmed."
            })
        } finally {
            setLoading(false)
        }
    }

    if (tripData) {
        return (
            <section className="relative min-h-screen py-24 flex items-center justify-center bg-black/90">
                <div className="absolute inset-0 z-0">
                    <img
                        src={activeImages[currentImageIndex].url}
                        alt="Background"
                        className="w-full h-full object-cover opacity-20 blur-sm"
                    />
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <TripItinerary data={tripData} onReset={() => setTripData(null)} isHalal={isHalal} />
                </div>
            </section>
        )
    }

    return (
        <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
            {/* Cinematic Background Slider */}
            <div className="absolute inset-0 z-0 bg-black">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }} // Crossfade
                        className="absolute inset-0"
                    >
                        {/* Ken Burns Scale Effect */}
                        <motion.img
                            src={activeImages[currentImageIndex].url}
                            alt={activeImages[currentImageIndex].location}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1.00 }}
                            transition={{ duration: 12, ease: "linear" }}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback or skip to next
                                console.error("Image failed:", activeImages[currentImageIndex].url)
                                e.currentTarget.style.display = 'none'
                            }}
                        />
                        {/* Location Credit Overlay - Centered */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-white/50 text-center">
                            <span className="text-xs uppercase tracking-[0.2em] font-light border-b border-white/20 pb-1 mb-1">Location</span>
                            <span className="text-sm font-medium text-white/90">{activeImages[currentImageIndex].location}</span>
                            <span className="text-[10px] text-white/30">Photo by {activeImages[currentImageIndex].credit}</span>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Global Overlay for legibility */}
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-1000 z-10 ${isHalal ? "from-emerald-950/80 via-transparent to-black/20" : "from-black via-transparent to-black/20"
                    }`} />
            </div>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center gap-6 w-full max-w-4xl px-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-medium text-white tracking-wider uppercase mb-4">
                        <Sparkles className="size-3 text-yellow-400" />
                        The Future of Travel is Autonomous
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white text-center">
                        Experience the World, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-400 italic font-serif">Effortlessly.</span>
                    </h1>

                    {/* Halal Toggle - Global */}
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-2">
                        <Moon className={`size-4 ${isHalal ? "text-emerald-400 fill-emerald-400" : "text-white/50"}`} />
                        <span className={`text-sm font-medium transition-colors ${isHalal ? "text-emerald-100" : "text-white/70"}`}>
                            Halal Trip Mode
                        </span>
                        <Switch
                            checked={isHalal}
                            onCheckedChange={setIsHalal}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-2">
                        <button
                            onClick={() => {
                                setMode('ai')
                                setIsHalal(false)
                            }}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'ai' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            AI Planner
                        </button>
                        <button
                            onClick={() => setMode('stays')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'stays' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            Find Hotels
                        </button>
                        <button
                            onClick={() => setMode('flights')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'flights' ? 'bg-sky-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            Find Flights
                        </button>
                    </div>

                    {mode === 'ai' && (
                        <>
                            <p className="text-lg text-white/70 max-w-2xl text-center">
                                SafarAI is your personal autonomous concierge. Just say where you want to go.
                            </p>

                            <div className="w-full max-w-2xl mt-4 flex flex-col items-center gap-4">


                                <div className="relative group w-full">
                                    <div className={`absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 bg-gradient-to-r ${isHalal ? "from-emerald-500 to-teal-500" : "from-blue-500 to-purple-500"
                                        }`}></div>
                                    <div className="relative flex items-center gap-4 p-2 pl-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                                        <Sparkles className={`size-5 ${loading ? "animate-spin text-emerald-400" : "text-white/50"}`} />
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handlePlanTrip()}
                                            disabled={loading}
                                            placeholder={(isHalal ? halalPlaceholderSuggestions : placeholderSuggestions)[placeholderIndex % (isHalal ? halalPlaceholderSuggestions : placeholderSuggestions).length]}
                                            className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-white/50 text-lg py-3"
                                            suppressHydrationWarning
                                        />
                                        <Button
                                            id="trigger-search-btn"
                                            size="lg"
                                            variant="premium"
                                            onClick={handlePlanTrip}
                                            disabled={loading}
                                            className={`h-12 px-8 rounded-lg ${isHalal ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none" : ""}`}
                                        >
                                            <span className="mr-2">{loading ? "Thinking..." : "Go"}</span>
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-white/40 text-center">Try: "{isHalal ? "Family trip to Malaysia, alcohol-free hotels" : "10 days in Japan in April, business class"}"</p>
                            </div>
                        </>
                    )}

                    {mode === 'stays' && (
                        <div className="w-full flex flex-col items-center mt-4">
                            <StaysSearchForm
                                loading={loading}
                                onSearch={handleStaysSearch}
                            />
                        </div>
                    )}

                    {mode === 'flights' && (
                        <div className="w-full flex flex-col items-center mt-4">
                            <FlightsSearchForm
                                loading={loading}
                                onSearch={handleFlightsSearch}
                            />
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Stays Results Modal */}
            <HotelResultsModal
                isOpen={showHotelResults}
                onClose={() => setShowHotelResults(false)}
                results={hotelResults}
                searchParams={searchedParams}
                onSelectHotel={(id) => {
                    // Handled inside component
                }}
            />

            {/* Flights Results Modal */}
            <FlightResultsModal
                isOpen={showFlightResults}
                onClose={() => setShowFlightResults(false)}
                results={flightResults}
                searchParams={searchedFlightParams}
            />
        </section>
    )
}
