"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { X, Heart, Sparkles, Plane, ChevronLeft, ChevronRight, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export type VibeCard = {
    id: string
    image: string
    label: string
    description: string
    trait: "Adventure" | "Luxury" | "Culture" | "Relaxation" | "Foodie"
    value: number
}

// Expanded Deck with descriptions
const vibeCards: VibeCard[] = [
    {
        id: "1",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
        label: "Secluded Villa",
        description: "Private infinity pool, butler service, and sunrise views",
        trait: "Luxury",
        value: 1
    },
    {
        id: "2",
        image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=2070&auto=format&fit=crop",
        label: "Bustling Night Market",
        description: "Street food, local crafts, and vibrant atmosphere",
        trait: "Foodie",
        value: 1
    },
    {
        id: "3",
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop",
        label: "Backcountry Camping",
        description: "Under the stars, off the grid, pure wilderness",
        trait: "Adventure",
        value: 1
    },
    {
        id: "4",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop",
        label: "Ancient Temple",
        description: "Sacred grounds, centuries of history, spiritual energy",
        trait: "Culture",
        value: 1
    },
    {
        id: "5",
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop",
        label: "5-Star Resort Spa",
        description: "Hot stone massage, ocean sounds, total serenity",
        trait: "Relaxation",
        value: 1
    },
    {
        id: "6",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
        label: "Untouched Beach",
        description: "Crystal waters, white sand, zero crowds",
        trait: "Relaxation",
        value: 1
    },
    {
        id: "7",
        image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=2026&auto=format&fit=crop",
        label: "Fine Dining Tasting",
        description: "Michelin stars, wine pairings, culinary art",
        trait: "Foodie",
        value: 1
    },
    {
        id: "8",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop",
        label: "Road Trip Adventure",
        description: "Open highway, scenic routes, freedom to explore",
        trait: "Adventure",
        value: 1
    },
    {
        id: "9",
        image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=2074&auto=format&fit=crop",
        label: "Art Gallery Tour",
        description: "Masterpieces, creative inspiration, thought-provoking exhibits",
        trait: "Culture",
        value: 1
    },
    {
        id: "10",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        label: "Private Yacht",
        description: "Champagne sunset, island hopping, ultimate exclusivity",
        trait: "Luxury",
        value: 1
    }
]

interface VibeCheckProps {
    isOpen: boolean
    onClose: () => void
}

export function VibeCheck({ isOpen, onClose }: VibeCheckProps) {
    const [showIntro, setShowIntro] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [complete, setComplete] = useState(false)
    const [direction, setDirection] = useState(0)
    const [saving, setSaving] = useState(false)

    const [scores, setScores] = useState<Record<string, number>>({
        Adventure: 0,
        Luxury: 0,
        Culture: 0,
        Relaxation: 0,
        Foodie: 0
    })

    const supabase = createClient()
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const loveOpacity = useTransform(x, [50, 150], [0, 1])
    const passOpacity = useTransform(x, [-150, -50], [1, 0])
    const cardBg = useTransform(x, [-150, 0, 150], ["rgba(239, 68, 68, 0.2)", "rgba(0,0,0,0)", "rgba(16, 185, 129, 0.2)"])

    const handleSwipe = useCallback((dir: number) => {
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
        x.set(0)
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
            const { error } = await supabase.from('travel_profiles').insert({
                archetype: finalArchetype,
                traits: { scores, total_swipes: vibeCards.length }
            })
            if (error) throw error
            toast.success("Travel DNA Saved", { description: `You are a ${finalArchetype}!`, duration: 3000 })
            onClose()
        } catch (err) {
            console.error(err)
            toast.error("Failed to save", { description: "Please try again." })
        } finally {
            setSaving(false)
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
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            >
                <div className="relative w-full max-w-md">
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

                            <div className="flex items-center justify-center gap-6 mb-8 text-sm text-white/40">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center">
                                        <ChevronLeft className="size-5" />
                                    </div>
                                    <span>Pass</span>
                                </div>
                                <div className="text-white/20">or drag</div>
                                <div className="flex items-center gap-2">
                                    <span>Love</span>
                                    <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center">
                                        <ChevronRight className="size-5" />
                                    </div>
                                </div>
                            </div>

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
                                    <motion.div
                                        key={card.id}
                                        drag={isCurrent ? "x" : false}
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={0.7}
                                        onDragEnd={handleDragEnd}
                                        style={{
                                            x: isCurrent ? x : 0,
                                            rotate: isCurrent ? rotate : 0,
                                            zIndex: isCurrent ? 2 : 1,
                                            backgroundColor: isCurrent ? cardBg : "transparent"
                                        }}
                                        initial={false}
                                        animate={
                                            isCurrent && direction !== 0
                                                ? { x: direction * 500, opacity: 0 }
                                                : { scale: isCurrent ? 1 : 0.92, y: isCurrent ? 0 : 30, opacity: isCurrent ? 1 : 0.6 }
                                        }
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing"
                                    >
                                        <img src={card.image} alt={card.label} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                                        {/* Card Counter */}
                                        <div className="absolute top-5 left-5 right-5 flex justify-between items-center">
                                            <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                                                {index + 1} / {vibeCards.length}
                                            </div>
                                            <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs uppercase tracking-wider">
                                                <Sparkles className="size-3 inline mr-1 text-yellow-400" />
                                                {card.trait}
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="absolute bottom-28 left-6 right-6">
                                            <h3 className="text-3xl font-bold text-white mb-2">{card.label}</h3>
                                            <p className="text-white/60 text-sm">{card.description}</p>
                                        </div>

                                        {/* Swipe Indicators */}
                                        {isCurrent && (
                                            <>
                                                <motion.div style={{ opacity: loveOpacity }} className="absolute top-16 left-8 border-4 border-emerald-500 rounded-xl px-4 py-2 -rotate-12">
                                                    <span className="text-3xl font-bold text-emerald-500 uppercase tracking-widest">Love</span>
                                                </motion.div>
                                                <motion.div style={{ opacity: passOpacity }} className="absolute top-16 right-8 border-4 border-red-500 rounded-xl px-4 py-2 rotate-12">
                                                    <span className="text-3xl font-bold text-red-500 uppercase tracking-widest">Pass</span>
                                                </motion.div>
                                            </>
                                        )}
                                    </motion.div>
                                )
                            })}

                            {/* Action Buttons */}
                            <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center gap-6 items-center h-24">
                                <Button
                                    size="icon"
                                    className="h-16 w-16 rounded-full bg-red-500/10 border-2 border-red-500/50 text-red-500 hover:bg-red-500/20 hover:border-red-500 backdrop-blur-md transition-all"
                                    onClick={() => handleSwipe(-1)}
                                >
                                    <X className="size-7" />
                                </Button>
                                <Button
                                    size="icon"
                                    className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500 backdrop-blur-md transition-all"
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

                    {/* Completion Screen */}
                    {complete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Plane className="size-10 text-violet-400" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete</h2>
                            <p className="text-white/60 mb-8">Your travel DNA has been decoded.</p>

                            <div className="space-y-4">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
                                    <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Your Archetype</div>
                                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                        {getArchetype()}
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.entries(scores).map(([trait, score]) => (
                                        <div key={trait} className="p-2 rounded-lg bg-white/5 text-center">
                                            <div className="text-lg font-bold text-white">{score}</div>
                                            <div className="text-[8px] uppercase tracking-wider text-white/40 truncate">{trait}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                className="w-full mt-8 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-lg rounded-xl"
                                onClick={saveAndClose}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Continue to AI Trip Planner"}
                            </Button>

                            <button onClick={reset} className="mt-4 text-xs text-white/40 hover:text-white underline">
                                Retake Vibe Check
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
