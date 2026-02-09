"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, Moon, Anchor } from "lucide-react"
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

const privateJetSuggestions = [
    "One way flight London (LON) to Dubai (DXB)",
    "Round trip New York (TEB) to Miami (OPF)",
    "Private charter Paris (LBG) to Nice (NCE)",
    "Heavy jet Los Angeles (VNY) to Las Vegas (LAS)",
    "Group charter Singapore (XSP) to Phuket (HKT)",
    "Empty leg search Geneva (GVA) to Ibiza (IBZ)",
]

const yachtSuggestions = [
    "Weekly charter in Amalfi Coast, Italy",
    "Luxury catamaran rental in Maldives",
    "Day trip yacht in Dubai Marina",
    "Sailing holiday in Croatia (Split)",
    "Superyacht rental in French Riviera",
    "Private boat tour in Santorini",
]

const experienceSuggestions = [
    "Desert Safari in Dubai",
    "Sushi cooking class in Tokyo",
    "Private Louvre Museum tour in Paris",
    "Helicopter ride over NYC",
    "Snorkeling tour in Great Barrier Reef",
    "Northern Lights hunt in Reykjavik",
]

// ... (existing helper functions or render start)

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
    },
    {
        url: "/images/ai-hero/doha-hero.png", // Generated AI Image (Cyberpunk West Bay)
        location: "Doha, Qatar",
        credit: "SafarAI Imagination"
    }
]

const EXPERIENCE_HERO_IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2574&auto=format&fit=crop", // Santorini
        location: "Santorini, Greece",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2594&auto=format&fit=crop", // Tokyo Street
        location: "Tokyo, Japan",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2574&auto=format&fit=crop", // Cinque Terre
        location: "Cinque Terre, Italy",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=2574&auto=format&fit=crop", // Dubai Desert
        location: "Dubai Desert, UAE",
        credit: "Unsplash"
    }
]

const YACHT_HERO_IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1569263979104-45b0a27c2d96?q=80&w=2574&auto=format&fit=crop", // Yacht in Croatia
        location: "Split, Croatia",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1605281317010-fe5ffe79ba02?q=80&w=2669&auto=format&fit=crop", // Yacht in Maldives
        location: "Maldives",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=2670&auto=format&fit=crop", // Yacht Lifestyle
        location: "Amalfi Coast, Italy",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop", // Luxury Yacht
        location: "French Riviera",
        credit: "Unsplash"
    }
]

const JETS_HERO_IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2574&auto=format&fit=crop", // Private Jet Interior
        location: "Global 6000 Interior",
        credit: "Bombardier"
    },
    {
        url: "https://images.unsplash.com/photo-1624479590262-d98c255d644d?q=80&w=2567&auto=format&fit=crop", // Private Jet Runway
        location: "Private Terminal, Teterboro",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1583413230540-ddf90681a8f8?q=80&w=2574&auto=format&fit=crop", // Jet Window View
        location: "Above the Clouds",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1582260654082-cdb61239c094?q=80&w=2574&auto=format&fit=crop", // Jet Exterior
        location: "Gulfstream G650",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1559827260-dc66d52bec19?q=80&w=2670&auto=format&fit=crop", // Boarding Steps
        location: "Geneva Airport VIP",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1696229562768-466d71b34c03?q=80&w=2574&auto=format&fit=crop", // Modern Bright Interior
        location: "Challenger 350 Comfort",
        credit: "Bombardier"
    },
    {
        url: "https://images.unsplash.com/photo-1563823251941-b84dc6475fc6?q=80&w=2574&auto=format&fit=crop", // Lifestyle/Champagne
        location: "Luxury Service",
        credit: "Unsplash"
    },
    {
        url: "https://images.unsplash.com/photo-1610642372651-fe6e7bc209ef?q=80&w=2574&auto=format&fit=crop", // Wing View
        location: "Above the Alps",
        credit: "Unsplash"
    }
]

export function Hero({ initialPrompt }: HeroProps) {
    const [isHalal, setIsHalal] = useState(false)
    const [mode, setMode] = useState<'ai' | 'stays' | 'flights' | 'experiences' | 'yachts' | 'private-jets'>('ai')
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
            let list = HERO_IMAGES
            if (isHalal) list = HALAL_HERO_IMAGES
            else if (mode === 'experiences') list = EXPERIENCE_HERO_IMAGES
            else if (mode === 'yachts') list = YACHT_HERO_IMAGES
            else if (mode === 'private-jets') list = JETS_HERO_IMAGES

            setCurrentImageIndex((prev) => (prev + 1) % list.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [isHalal, mode])

    // Reset index when mode toggles
    useEffect(() => {
        setCurrentImageIndex(0)
    }, [isHalal, mode])

    const getActiveImages = () => {
        if (mode === 'experiences') return EXPERIENCE_HERO_IMAGES
        if (mode === 'yachts') return YACHT_HERO_IMAGES
        if (mode === 'private-jets') return JETS_HERO_IMAGES
        return isHalal ? HALAL_HERO_IMAGES : HERO_IMAGES
    }

    const activeImages = getActiveImages()

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

    const handleExperiencesSearch = () => {
        if (!input.trim()) return
        router.push(`/activities?query=${encodeURIComponent(input)}`)
    }

    const handleYachtSearch = () => {
        // Searadar Affiliate Link
        // Marker: 698501, TRS: 491790, Campaign: 258
        const marker = process.env.NEXT_PUBLIC_AFFILIATE_ID_SEARADAR_MARKER || "698501"
        const trs = process.env.NEXT_PUBLIC_AFFILIATE_ID_SEARADAR_TRS || "491790"
        const campaignId = process.env.NEXT_PUBLIC_AFFILIATE_ID_SEARADAR_CAMPAIGN || "258"
        // We'll try to pass the location if the user entered one, otherwise default to home
        const baseUrl = input.trim()
            ? `https://searadar.com?location=${encodeURIComponent(input.trim())}`
            : "https://searadar.com"

        const finalUrl = `https://tp.media/r?marker=${marker}&trs=${trs}&p=5907&u=${encodeURIComponent(baseUrl)}&campaign_id=${campaignId}`

        window.open(finalUrl, '_blank')
    }

    const handleJetSearch = () => {
        // Villiers Private Jet Affiliate Link
        // Placeholder ID: 57252 (or user provided). Standard entry is usually just home with ID.
        // We will default to a generic ID until user updates it.
        const affiliateId = process.env.NEXT_PUBLIC_AFFILIATE_ID_VILLIERS || "57252" // Placeholder / Default
        const finalUrl = `https://www.villiersjets.com/?id=${affiliateId}`
        window.open(finalUrl, '_blank')
    }

    if (tripData) {
        return (
            <section className="relative min-h-screen py-24 flex items-center justify-center bg-black/90">
                <div className="absolute inset-0 z-0">
                    <img
                        src={(activeImages[currentImageIndex] || activeImages[0]).url}
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
        <section className="relative h-screen min-h-[800px] flex items-center justify-center">
            {/* Cinematic Background Slider */}
            <div className="absolute inset-0 z-0 bg-black overflow-hidden">
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
                            src={(activeImages[currentImageIndex] || activeImages[0]).url}
                            alt={(activeImages[currentImageIndex] || activeImages[0]).location}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1.00 }}
                            transition={{ duration: 12, ease: "linear" }}
                            className="w-full h-full object-cover"
                            onError={() => {
                                // Skip to next image on error
                                setCurrentImageIndex((prev) => (prev + 1) % activeImages.length)
                            }}
                        />
                        {/* Location Credit Overlay - Centered */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-white/50 text-center">
                            <span className="text-xs uppercase tracking-[0.2em] font-light border-b border-white/20 pb-1 mb-1">Location</span>
                            <span className="text-sm font-medium text-white/90">{activeImages[currentImageIndex]?.location || "Unknown"}</span>
                            <span className="text-[10px] text-white/30">Photo by {activeImages[currentImageIndex]?.credit || "SafarAI"}</span>
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
                    className="flex flex-col items-center gap-6 w-full max-w-4xl px-4 mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-medium text-white tracking-wider uppercase mb-4">
                        <Sparkles className="size-3 text-yellow-400" />
                        The Future of Travel is Autonomous
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white text-center">
                        Experience the World, <span className={`text-transparent bg-clip-text bg-gradient-to-r italic font-serif transition-all duration-700 ${isHalal
                            ? "from-emerald-300 to-teal-500"
                            : "from-sky-300 to-blue-500"
                            }`}>Effortlessly.</span>
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

                    {/* Mode Tabs - Glassmorphism */}
                    <div className="flex p-1.5 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 mb-8 overflow-x-auto max-w-full shadow-2xl">
                        <button
                            onClick={() => {
                                setMode('ai')
                                setIsHalal(false)
                            }}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border ${mode === 'ai' ? 'bg-white/20 text-white border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-transparent text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            AI Planner
                        </button>
                        <button
                            onClick={() => setMode('flights')}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border ${mode === 'flights' ? 'bg-sky-500/30 text-sky-50 border-sky-400/50 shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'border-transparent text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            Flights
                        </button>
                        <button
                            onClick={() => setMode('private-jets')}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border ${mode === 'private-jets' ? 'bg-indigo-600/30 text-indigo-50 border-indigo-400/50 shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'border-transparent text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            Private Jets
                        </button>
                        <button
                            onClick={() => setMode('stays')}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border ${mode === 'stays' ? 'bg-emerald-500/30 text-emerald-50 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-transparent text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            Hotels
                        </button>
                        <button
                            onClick={() => setMode('yachts')}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border ${mode === 'yachts' ? 'bg-blue-600/30 text-blue-50 border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'border-transparent text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            Yachts
                        </button>
                        <button
                            onClick={() => setMode('experiences')}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border ${mode === 'experiences' ? 'bg-orange-500/30 text-orange-50 border-orange-400/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-transparent text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            Experiences
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

                    {mode === 'experiences' && (
                        <>
                            <p className="text-lg text-white/70 max-w-2xl text-center">
                                Discover unforgettable tours, attractions, and local experiences.
                            </p>

                            <div className="w-full max-w-xl mt-4 flex flex-col items-center gap-4">
                                <div className="relative group w-full">
                                    <div className="absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 bg-gradient-to-r from-orange-500 to-red-500"></div>
                                    <div className="relative flex items-center gap-4 p-2 pl-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleExperiencesSearch()}
                                            placeholder={experienceSuggestions[placeholderIndex % experienceSuggestions.length]}
                                            className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-white/50 text-lg py-3"
                                        />
                                        <Button
                                            size="lg"
                                            onClick={handleExperiencesSearch}
                                            className="h-12 px-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white border-none"
                                        >
                                            <span className="mr-2">Explore</span>
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    </div>
                                    <p className="mt-3 text-xs text-white/40 text-center">Try: "{experienceSuggestions[placeholderIndex % experienceSuggestions.length]}"</p>
                                </div>
                            </div>
                        </>
                    )}

                    {mode === 'yachts' && (
                        <>
                            <p className="text-lg text-white/70 max-w-2xl text-center">
                                Rent luxury yachts and catamarans worldwide. Powered by Searadar.
                            </p>

                            <div className="w-full max-w-xl mt-4 flex flex-col items-center gap-4">
                                <div className="relative group w-full">
                                    <div className="absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                                    <div className="relative flex items-center gap-4 p-2 pl-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                                        <Anchor className="size-5 text-blue-400" />
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleYachtSearch()}
                                            placeholder={yachtSuggestions[placeholderIndex % yachtSuggestions.length]}
                                            className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-white/50 text-lg py-3"
                                        />
                                        <Button
                                            size="lg"
                                            onClick={handleYachtSearch}
                                            className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-none"
                                        >
                                            <span className="mr-2">Search Yachts</span>
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    </div>
                                    <p className="mt-3 text-xs text-white/40 text-center">Try: "{yachtSuggestions[placeholderIndex % yachtSuggestions.length]}"</p>
                                </div>
                            </div>
                        </>
                    )}

                    {mode === 'private-jets' && (
                        <>
                            <p className="text-lg text-white/70 max-w-2xl text-center">
                                Access 10,000+ private jets globally. Powered by Villiers.
                            </p>

                            <div className="w-full max-w-xl mt-4 flex flex-col items-center gap-4">
                                <div className="relative group w-full">
                                    <div className="absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                    <div className="relative flex items-center gap-4 p-2 pl-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                                        <div className="size-5 flex items-center justify-center text-indigo-400">✈️</div>
                                        <input
                                            type="text"
                                            value={input} // Villiers often doesn't pre-fill easily, but we keep input for UX
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleJetSearch()}
                                            placeholder={privateJetSuggestions[placeholderIndex % privateJetSuggestions.length]}
                                            className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-white/50 text-lg py-3"
                                        />
                                        <Button
                                            size="lg"
                                            onClick={handleJetSearch}
                                            className="h-12 px-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                                        >
                                            <span className="mr-2">Find Jets</span>
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    </div>
                                    <p className="mt-3 text-xs text-white/40 text-center">Try: "{privateJetSuggestions[placeholderIndex % privateJetSuggestions.length]}"</p>
                                </div>
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
