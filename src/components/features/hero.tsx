"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Moon } from "lucide-react"
import { toast } from "sonner"
import { TripItinerary, TripData } from "./trip-itinerary"

export function Hero() {
    // ... inside Hero component
    const [isHalal, setIsHalal] = useState(false)
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [tripData, setTripData] = useState<TripData | null>(null)

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
                        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <TripItinerary data={tripData} onReset={() => setTripData(null)} />
                </div>
            </section>
        )
    }

    return (
        <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-1000 z-10 ${isHalal ? "from-emerald-950/80 via-transparent to-black/20" : "from-black via-transparent to-black/20"
                    }`} />
                <img
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
                    alt="Luxury Travel Background"
                    className="w-full h-full object-cover"
                />
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
                                Halal Mode
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
                                    placeholder={isHalal ? "Find me a private villa in Turkey..." : "Where do you want to wake up tomorrow?"}
                                    className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-white/50 text-lg py-3"
                                />
                                <Button
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
