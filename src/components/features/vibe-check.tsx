"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"
import { X, Heart, Sparkles, Plane, ChevronLeft, ChevronRight, Wand2, Fingerprint, MapPin, ArrowRight, Loader2, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PassportCard } from "./passport-card"
import { TravelDeals } from "./travel-deals"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type VibeCard = {
    id: string
    image: string
    label: string
    description: string
    trait: "Adventure" | "Luxury" | "Culture" | "Relaxation" | "Foodie"
}

// Sub-component for 3D Parallax Card
function ParallaxCard({ card, isCurrent, x, rotate, onDragEnd, children }: any) {
    const cardRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth spring animation for tilt
    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), { stiffness: 150, damping: 20 })
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), { stiffness: 150, damping: 20 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isCurrent) return
        const rect = cardRef.current?.getBoundingClientRect()
        if (rect) {
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            mouseX.set(e.clientX - centerX)
            mouseY.set(e.clientY - centerY)
        }
    }

    const handleMouseLeave = () => {
        mouseX.set(0)
        mouseY.set(0)
    }

    return (
        <motion.div
            ref={cardRef}
            drag={isCurrent ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={onDragEnd}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                x: isCurrent ? x : 0,
                rotate: isCurrent ? rotate : 0, // Swipe rotation
                zIndex: isCurrent ? 2 : 1,
                rotateX: isCurrent ? rotateX : 0, // Parallax tilt X
                rotateY: isCurrent ? rotateY : 0, // Parallax tilt Y
                perspective: 1000
            }}
            initial={false}
            animate={{
                scale: isCurrent ? 1 : 0.92,
                y: isCurrent ? 0 : 30,
                opacity: isCurrent ? 1 : 0.6
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing transform-style-3d will-change-transform"
        >
            {/* Parallax Image Layer (Moves slightly opposite to frame) */}
            <motion.div
                style={{ translateX: useTransform(rotateY, [-10, 10], [10, -10]), translateY: useTransform(rotateX, [-10, 10], [10, -10]) }}
                className="absolute inset-0 scale-110"
            >
                <img src={card.image} alt={card.label} className="w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </motion.div>

            {children}
        </motion.div>
    )

}

const vibeCards: VibeCard[] = [
    {
        id: "1",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
        label: "Secluded Villa",
        description: "Private infinity pool, butler service, and sunrise views",
        trait: "Luxury"
    },
    {
        id: "2",
        image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=2070&auto=format&fit=crop",
        label: "Bustling Night Market",
        description: "Street food, local crafts, and vibrant atmosphere",
        trait: "Foodie"
    },
    {
        id: "3",
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop",
        label: "Backcountry Camping",
        description: "Under the stars, off the grid, pure wilderness",
        trait: "Adventure"
    },
    {
        id: "4",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop",
        label: "Ancient Temple",
        description: "Sacred grounds, centuries of history, spiritual energy",
        trait: "Culture"
    },
    {
        id: "5",
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop",
        label: "5-Star Resort Spa",
        description: "Hot stone massage, ocean sounds, total serenity",
        trait: "Relaxation"
    },
    {
        id: "6",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
        label: "Untouched Beach",
        description: "Crystal waters, white sand, zero crowds",
        trait: "Relaxation"
    },
    {
        id: "7",
        image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=2026&auto=format&fit=crop",
        label: "Fine Dining Tasting",
        description: "Michelin stars, wine pairings, culinary art",
        trait: "Foodie"
    },
    {
        id: "8",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop",
        label: "Road Trip Adventure",
        description: "Open highway, scenic routes, freedom to explore",
        trait: "Adventure"
    },
    {
        id: "9",
        image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=2074&auto=format&fit=crop",
        label: "Art Gallery Tour",
        description: "Masterpieces, creative inspiration, thought-provoking exhibits",
        trait: "Culture"
    },
    {
        id: "10",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        label: "Private Yacht",
        description: "Champagne sunset, island hopping, ultimate exclusivity",
        trait: "Luxury"
    }
]

interface VibeCheckProps {
    isOpen: boolean
    onClose: () => void
}

export function VibeCheck({ isOpen, onClose }: VibeCheckProps) {
    useEffect(() => {
        if (isOpen) console.log("--- SafarAI VibeCheck Gateway: V4.1 STABLE ---");
    }, [isOpen]);
    const [showIntro, setShowIntro] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [complete, setComplete] = useState(false)
    const [direction, setDirection] = useState(0)
    const [saving, setSaving] = useState(false)
    const [showDeals, setShowDeals] = useState(false)
    const [showPivot, setShowPivot] = useState(false)
    const [customDestination, setCustomDestination] = useState("")
    const [pivotSelection, setPivotSelection] = useState<"surprise" | "search" | null>(null)
    const [resolvedDestination, setResolvedDestination] = useState<{ code: string; name: string } | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [isBaking, setIsBaking] = useState(false)
    const [originCity, setOriginCity] = useState("Charlotte")
    const [originCityCode, setOriginCityCode] = useState("CLT")
    const [isHalal, setIsHalal] = useState(false)

    const [scores, setScores] = useState<Record<string, number>>({
        Adventure: 0,
        Luxury: 0,
        Culture: 0,
        Relaxation: 0,
        Foodie: 0
    })

    const router = useRouter()
    const supabase = createClient()
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const loveOpacity = useTransform(x, [50, 150], [0, 1])
    const passOpacity = useTransform(x, [-150, -50], [1, 0])

    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(20)
        }
    }

    const handleSwipe = useCallback((dir: number) => {
        triggerHaptic() // Haptic feedback on swipe
        if (dir === 1) {
            const currentCard = vibeCards[currentIndex]
            setScores(prev => ({
                ...prev,
                [currentCard.trait]: prev[currentCard.trait] + 1
            }))
        }

        setDirection(dir)
        setTimeout(() => {
            if (currentIndex < vibeCards.length - 1) {
                setCurrentIndex(prev => prev + 1)
                setDirection(0)
                x.set(0)
            } else {
                setComplete(true)
            }
        }, 200)
    }, [currentIndex, x])

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen || complete || showIntro) return
            if (e.key === 'ArrowRight') handleSwipe(1)
            if (e.key === 'ArrowLeft') handleSwipe(-1)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, complete, showIntro, handleSwipe])

    const reset = () => {
        setCurrentIndex(0)
        setComplete(false)
        setDirection(0)
        setShowIntro(true)
        setShowDeals(false)
        setShowPivot(false)
        setCustomDestination("")
        setPivotSelection(null)
        setResolvedDestination(null)
        setIsSearching(false)
        x.set(0)
        setIsHalal(false)
        setScores({ Adventure: 0, Luxury: 0, Culture: 0, Relaxation: 0, Foodie: 0 })
    }

    const getArchetype = () => {
        const winningTrait = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        const map: Record<string, string> = {
            "Adventure": "Adrenaline Junkie",
            "Luxury": "Quiet Luxury Nomad",
            "Culture": "Culture Connoisseur",
            "Relaxation": "Zen Master",
            "Foodie": "Gastronomy Globetrotter"
        }
        return map[winningTrait] || "Balanced Explorer"
    }

    const saveAndClose = async () => {
        setSaving(true)
        const finalArchetype = getArchetype()
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                toast.error("Please login to save your profile")
                return
            }

            const { error } = await supabase.from('travel_profiles').upsert({
                user_id: user.id,
                archetype: finalArchetype,
                traits: { scores, total_swipes: vibeCards.length }
            }, { onConflict: 'user_id' })

            if (error) throw error

            toast.success("Travel DNA Saved", { description: `You are a ${finalArchetype}!`, duration: 3000 })
            setShowPivot(true)
        } catch (err) {
            console.error(err)
            toast.error("Failed to save", { description: "Please try again." })
        } finally {
            setSaving(false)
        }
    }

    const handleSearchDestination = async () => {
        if (!customDestination.trim()) return
        setIsSearching(true)
        try {
            const res = await fetch(`/api/locations/search?keyword=${encodeURIComponent(customDestination)}`)
            const data = await res.json()
            if (data.data && data.data.length > 0) {
                const first = data.data[0]
                const name = first.name || (first.address ? (first.address.cityName || first.address.cityCode) : 'Selected City')
                const code = first.iataCode || (first.address ? first.address.cityCode : first.iataCode)

                if (code) {
                    setResolvedDestination({ code, name })
                    setShowDeals(true)
                } else {
                    toast.error("Invalid city data", { description: "Try a different search." })
                }
            } else {
                toast.error("City not found", { description: "Try a larger city or check spelling." })
            }
        } catch (err) {
            console.error(err)
            toast.error("Search failed")
        } finally {
            setIsSearching(false)
        }
    }

    const handleProceedToItinerary = async (selection: { flight: any, hotel: any }) => {
        if (isBaking) {
            console.warn("Baking already in progress, ignoring duplicate call.");
            return;
        }

        console.log("Starting baking phase with selection:", selection);
        setIsBaking(true);
        const toastId = toast.loading("Baking your Hybrid Itinerary...");
        const archetype = getArchetype()
        const destName = resolvedDestination?.name || "Global"

        try {
            // Construct a hybrid prompt that enforces the selected flight and hotel
            const hotelName = selection.hotel.hotel?.name || selection.hotel.name || "Premium Hotel"
            const flightInfo = selection.flight.price ? `Flight ${selection.flight.id} for $${selection.flight.price.total}` : "Best available flight"

            const hybridPrompt = `
                Generate a 3-day itinerary for ${destName}. 
                The user has ALREADY SELECTED these deals:
                - FLIGHT: ${flightInfo}
                - HOTEL: ${hotelName}
                
                Please ensure Day 1 starts with their arrival, and the "stay" for all days is "${hotelName}".
                Base the activities on their ${archetype} vibe.
            `

            console.log("DEBUG: Baking Trip. Prompt:", hybridPrompt.substring(0, 40));
            const res = await fetch(`/api/chat?v=${Date.now()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: hybridPrompt,
                    isHalal,
                    selection: {
                        flight: selection.flight,
                        hotel: selection.hotel
                    }
                })
            })

            console.log("DEBUG: Fetch Status:", res.status, res.ok);
            const rawText = await res.text();
            console.log("DEBUG: Raw API Response (first 100 char):", rawText.substring(0, 100));

            let data;
            try {
                data = JSON.parse(rawText);
            } catch (e) {
                console.error("DEBUG: JSON Parse error on raw text:", rawText);
                throw new Error("Malformed response from AI kitchen.");
            }

            if (!res.ok) throw new Error(data.error || "Generation failed at source.");

            toast.dismiss(toastId)
            toast.success("Bespoke Journey Ready!", { description: `Locked in ${destName}` })

            if (data.id) {
                const path = `/trip/generated/${data.id}`
                console.log("Trip ready! Redirecting to:", path)

                // Immediate Router Push
                router.push(path)

                // Clear any existing baking state after a long timeout just in case navigation fails silently
                const safetyReset = setTimeout(() => {
                    if (window.location.pathname !== path) {
                        setIsBaking(false)
                    }
                }, 10000)

                // Force a hard redirect if the router is completely stuck
                setTimeout(() => {
                    if (window.location.pathname !== path) {
                        console.warn("Manual redirect triggered")
                        window.location.href = path
                    }
                }, 4000)

                // Close modal only after a safe buffer to allow router to initialize
                setTimeout(() => {
                    onClose()
                }, 1500)

                return // Keeping isBaking true for the overlay
            } else {
                console.error("STABLE-GATEWAY: Full API Data received without ID:", data)
                toast.error(`Baking Success, but Lock Failed. (V3)`, {
                    description: "Stale data detected. Please HARD REFRESH (Cmd+Shift+R) and try again.",
                    duration: 10000
                })
                setIsBaking(false)
            }
        } catch (err) {
            console.error("Itinerary Baking Error:", err)
            toast.dismiss(toastId)
            toast.error("Failed to bake itinerary")
            setIsBaking(false) // Only reset on error
        }
    }

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > 100) handleSwipe(1)
        else if (info.offset.x < -100) handleSwipe(-1)
        else x.set(0)
    }

    if (!isOpen) return null

    const progress = ((currentIndex) / vibeCards.length) * 100

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 perspective-1000"
            >
                <div className={cn("relative w-full transition-all duration-500", showDeals ? "max-w-4xl" : "max-w-md")}>
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors z-20"
                    >
                        <X className="size-6" />
                    </button>

                    {/* Intro Screen */}
                    {showIntro && !complete && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
                                <Wand2 className="size-10 text-emerald-400 -rotate-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3">The Vibe Check</h2>
                            <p className="text-white/60 mb-8 leading-relaxed">
                                Swipe through 10 travel experiences. <br />
                                <span className="text-emerald-400 font-medium">Love</span> the ones that excite you. <br />
                                <span className="text-red-400 font-medium">Pass</span> on the rest.
                            </p>

                            <Button
                                onClick={() => setShowIntro(false)}
                                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-lg rounded-xl hover:opacity-90"
                            >
                                Start Vibe Check
                            </Button>
                        </motion.div>
                    )}

                    {/* Card Stack */}
                    {!showIntro && !complete && (
                        <div className="relative h-[620px] w-full">
                            {/* Progress Bar */}
                            <div className="absolute -top-8 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            {vibeCards.map((card, index) => {
                                if (index < currentIndex) return null
                                if (index > currentIndex + 1) return null
                                const isCurrent = index === currentIndex

                                return (
                                    <ParallaxCard
                                        key={card.id}
                                        card={card}
                                        isCurrent={isCurrent}
                                        x={x}
                                        rotate={rotate}
                                        onDragEnd={handleDragEnd}
                                    >
                                        {/* Card Counter */}
                                        <div className="absolute top-5 left-5 right-5 flex justify-between items-center transform translate-z-20">
                                            <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                                                {index + 1} / {vibeCards.length}
                                            </div>
                                            <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs uppercase tracking-wider">
                                                <Sparkles className="size-3 inline mr-1 text-yellow-400" />
                                                {card.trait}
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="absolute bottom-28 left-6 right-6 transform translate-z-20">
                                            <h3 className="text-3xl font-bold text-white mb-2 text-shadow-lg">{card.label}</h3>
                                            <p className="text-white/80 text-sm font-medium text-shadow-md">{card.description}</p>
                                        </div>

                                        {/* Swipe Indicators */}
                                        {isCurrent && (
                                            <>
                                                <motion.div style={{ opacity: loveOpacity }} className="absolute top-16 left-8 border-4 border-emerald-500 rounded-xl px-4 py-2 -rotate-12 transform translate-z-30">
                                                    <span className="text-3xl font-bold text-emerald-500 uppercase tracking-widest">Love</span>
                                                </motion.div>
                                                <motion.div style={{ opacity: passOpacity }} className="absolute top-16 right-8 border-4 border-red-500 rounded-xl px-4 py-2 rotate-12 transform translate-z-30">
                                                    <span className="text-3xl font-bold text-red-500 uppercase tracking-widest">Pass</span>
                                                </motion.div>
                                            </>
                                        )}
                                    </ParallaxCard>
                                )
                            })}

                            {/* Action Buttons */}
                            <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center gap-6 items-center h-24">
                                <Button
                                    size="icon"
                                    className="h-16 w-16 rounded-full bg-red-500/10 border-2 border-red-500/50 text-red-500 hover:bg-red-500/20 hover:border-red-500 backdrop-blur-md transition-all active:scale-95"
                                    onClick={() => handleSwipe(-1)}
                                >
                                    <X className="size-7" />
                                </Button>
                                <Button
                                    size="icon"
                                    className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500 backdrop-blur-md transition-all active:scale-95"
                                    onClick={() => handleSwipe(1)}
                                >
                                    <Heart className="size-7 fill-current" />
                                </Button>
                            </div>

                            {/* Keyboard Hint */}
                            <div className="absolute -bottom-8 left-0 right-0 text-center text-white/30 text-xs">
                                Use ← → arrow keys or drag
                            </div>
                        </div>
                    )}

                    {/* Completion Screen: PASSPORT UI */}
                    {complete && !showPivot && !showDeals && (
                        <PassportCard
                            archetype={getArchetype()}
                            scores={scores}
                            actionButton={
                                <>
                                    <Button
                                        className="w-full h-12 bg-[#D4AF37] hover:bg-[#B5952F] text-black font-bold text-sm tracking-wider uppercase rounded-lg shadow-lg"
                                        onClick={saveAndClose}
                                        disabled={saving}
                                    >
                                        {saving ? "Stamping Passport..." : "Confirm Identity"}
                                    </Button>

                                    <button onClick={reset} className="w-full text-center text-[10px] text-[#D4AF37]/40 hover:text-[#D4AF37] uppercase tracking-widest transition-colors">
                                        Re-Analyze DNA
                                    </button>
                                </>
                            }
                        />
                    )}

                    {/* Pivot Screen */}
                    {showPivot && !showDeals && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Sparkles className="size-5 text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Vibe Applied</h2>
                            </div>

                            <p className="text-white/60 mb-8 leading-relaxed">
                                Your <span className="text-emerald-400 font-bold">{getArchetype()}</span> vibe is locked. <br />
                                Where should we apply it?
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.2em] px-1 font-bold">
                                        <Plane className="size-3" />
                                        <span>Leaving From</span>
                                    </div>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={originCity}
                                            onChange={(e) => {
                                                setOriginCity(e.target.value)
                                                // Simple heuristic: if 3 chars and uppercase, it's likely a code
                                                if (e.target.value.length === 3 && e.target.value === e.target.value.toUpperCase()) {
                                                    setOriginCityCode(e.target.value)
                                                }
                                            }}
                                            placeholder="Home City or Airport Code"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.2em] px-1 font-bold">
                                        <Sparkles className="size-3" />
                                        <span>Destination Choice</span>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mb-2">
                                            <div className="flex items-center gap-3">
                                                <Moon className={`size-4 ${isHalal ? "text-emerald-400 fill-emerald-400" : "text-white/40"}`} />
                                                <span className="text-sm font-medium text-white/80">Halal Trip Mode</span>
                                            </div>
                                            <button
                                                onClick={() => setIsHalal(!isHalal)}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${isHalal ? 'bg-emerald-500' : 'bg-white/20'}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isHalal ? 'left-5.5' : 'left-0.5'}`} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setShowDeals(true)}
                                            className="w-full group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left"
                                        >
                                            <div>
                                                <div className="text-white font-bold mb-0.5">Surprise Me</div>
                                                <div className="text-xs text-white/40 italic">Explore the best matching global markets</div>
                                            </div>
                                            <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                                <ChevronRight className="size-4" />
                                            </div>
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-emerald-400" />
                                        <input
                                            type="text"
                                            value={customDestination}
                                            onChange={(e) => setCustomDestination(e.target.value)}
                                            placeholder="Enter city (e.g. Dubai, London...)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSearchDestination()
                                            }}
                                        />
                                        {isSearching && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Loader2 className="size-4 animate-spin text-emerald-500" />
                                            </div>
                                        )}
                                    </div>
                                    {customDestination && (
                                        <Button
                                            onClick={handleSearchDestination}
                                            disabled={isSearching}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 rounded-xl mt-2"
                                        >
                                            {isSearching ? "Finding city..." : `Search ${customDestination}`} <ArrowRight className="size-4 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full mt-8 text-center text-xs text-white/20 hover:text-white transition-colors"
                            >
                                Not now, show me later
                            </button>
                        </motion.div>
                    )}

                    {/* Live Deals Screen */}
                    {showDeals && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-hide"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        {resolvedDestination ? `${resolvedDestination.name} Live intelligence` : "Passport Verified"}
                                    </h2>
                                    <p className="text-white/40 text-xs uppercase tracking-widest">
                                        {resolvedDestination ? `Applying ${getArchetype()} vibe to ${resolvedDestination.name}` : `Locked onto ${getArchetype()} market`}
                                    </p>
                                </div>
                                <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Sparkles className="size-6 text-emerald-400" />
                                </div>
                            </div>

                            <TravelDeals
                                archetype={getArchetype()}
                                customDestination={resolvedDestination?.code}
                                originCityCode={originCityCode}
                                onComplete={({ flight, hotel }) => {
                                    console.log("Confirmed selections. Passing to baker...");
                                    toast.success("Ready to bake your itinerary!");
                                    handleProceedToItinerary({ flight, hotel });
                                }}
                            />

                            <button
                                onClick={onClose}
                                disabled={isBaking}
                                className="w-full mt-6 text-center text-xs text-white/30 hover:text-white transition-colors"
                            >
                                Continue to Dashboard
                            </button>
                        </motion.div>
                    )}
                </div>

                {isBaking && (
                    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl">
                        <div className="relative scale-110">
                            <div className="size-24 rounded-full border-b-2 border-emerald-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="size-10 text-emerald-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="mt-10 text-center px-10">
                            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Baking Your Trip</h3>
                            <p className="text-white/40 text-sm max-w-[280px] mx-auto leading-relaxed mb-8">Merging your selected flight and hotel into a custom AI itinerary...</p>

                            <div className="space-y-4">
                                <div className="flex gap-2 justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 8 }}
                                    className="pt-4"
                                >
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest mb-4">Taking longer than expected?</p>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 h-12 rounded-xl"
                                            onClick={() => {
                                                setIsBaking(false)
                                                toast.error("Generation timed out. Please try again.")
                                            }}
                                        >
                                            Cancel & Try Again
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-white/20 hover:text-white text-[10px]"
                                            onClick={() => window.location.reload()}
                                        >
                                            Force Site Reload
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
