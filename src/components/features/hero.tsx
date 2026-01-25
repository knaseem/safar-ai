"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, Moon } from "lucide-react"
import { toast } from "sonner"
import { TripItinerary, TripData } from "./trip-itinerary"

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
        url: "https://images.unsplash.com/photo-1559586616-361e18714958?q=80&w=2667&auto=format&fit=crop", // Reverting to safe, reliable AlUla (NEOM)
        location: "AlUla, Saudi Arabia",
        credit: "NEOM"
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

export function Hero({ initialPrompt }: HeroProps) {
    const [isHalal, setIsHalal] = useState(false)
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [tripData, setTripData] = useState<TripData | null>(null)
    const [placeholderIndex, setPlaceholderIndex] = useState(0)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Handle initial prompt from parent
    useEffect(() => {
        if (initialPrompt) {
            setInput(initialPrompt)
            // Small timeout to allow state to settle before triggering
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
            setPlaceholderIndex((prev) => (prev + 1) % placeholderSuggestions.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    // Rotate Hero Image every 5 seconds (Faster Pace)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

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

            setTripData(data)
            toast.dismiss(toastId)
            toast.success("Itinerary Ready", {
                description: `Created: ${data.trip_name}`,
                duration: 3000
            })
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
                        src={HERO_IMAGES[currentImageIndex].url}
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
                            src={HERO_IMAGES[currentImageIndex].url}
                            alt={HERO_IMAGES[currentImageIndex].location}
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1.15 }}
                            transition={{ duration: 12, ease: "linear" }}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback or skip to next
                                console.error("Image failed:", HERO_IMAGES[currentImageIndex].url)
                                e.currentTarget.style.display = 'none'
                            }}
                        />
                        {/* Location Credit Overlay */}
                        <div className="absolute bottom-6 right-8 z-20 flex flex-col items-end text-white/50 text-right">
                            <span className="text-xs uppercase tracking-[0.2em] font-light border-b border-white/20 pb-1 mb-1">Location</span>
                            <span className="text-sm font-medium text-white/90">{HERO_IMAGES[currentImageIndex].location}</span>
                            <span className="text-[10px] text-white/30">Photo by {HERO_IMAGES[currentImageIndex].credit}</span>
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
                    className="flex flex-col items-center gap-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-medium text-white tracking-wider uppercase">
                        <Sparkles className="size-3 text-yellow-400" />
                        The Future of Travel is Autonomous
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white max-w-4xl">
                        Experience the World, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 italic font-serif">Effortlessly.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                        SafarAI is your personal autonomous concierge. Just say where you want to go, and we'll handle the flights, hotels, and experiences.
                    </p>

                    {/* AI Input Mockup */}
                    <div className="w-full max-w-2xl mt-8 flex flex-col items-center gap-4">

                        {/* Halal Toggle */}
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
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
                                    placeholder={placeholderSuggestions[placeholderIndex]}
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
                        <p className="mt-3 text-xs text-white/40">Try: "{isHalal ? "Family trip to Malaysia, alcohol-free hotels" : "10 days in Japan in April, business class"}"</p>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
            >
                <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
                <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
            </motion.div>
        </section>
    )
}
