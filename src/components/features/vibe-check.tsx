"use client"

import { useState } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { X, Heart, Sparkles, CheckCircle, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export type VibeCard = {
    id: string
    image: string
    label: string
    trait: "Adventure" | "Luxury" | "Culture" | "Relaxation" | "Foodie"
    value: number
}

// Expanded Deck: 10 Cards covering 5 major travel vibes
const vibeCards: VibeCard[] = [
    {
        id: "1",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
        label: "Secluded Villa",
        trait: "Luxury",
        value: 1
    },
    {
        id: "2",
        image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=2070&auto=format&fit=crop",
        label: "Bustling Night Market",
        trait: "Foodie",
        value: 1
    },
    {
        id: "3",
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop",
        label: "Backcountry Camping",
        trait: "Adventure",
        value: 1
    },
    {
        id: "4",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop",
        label: "Ancient Temple",
        trait: "Culture",
        value: 1
    },
    {
        id: "5",
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop",
        label: "5-Star Resort Spa",
        trait: "Relaxation",
        value: 1
    },
    {
        id: "6",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
        label: "Untouched Beach",
        trait: "Relaxation",
        value: 1
    },
    {
        id: "7",
        image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=2026&auto=format&fit=crop",
        label: "Fine Dining Tasting",
        trait: "Foodie",
        value: 1
    },
    {
        id: "8",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop",
        label: "Road Trip Adventure",
        trait: "Adventure",
        value: 1
    },
    {
        id: "9",
        image: "https://images.unsplash.com/photo-1499856871940-a09627c6d7db?q=80&w=2020&auto=format&fit=crop",
        label: "Art Gallery Tour",
        trait: "Culture",
        value: 1
    },
    {
        id: "10",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        label: "Private Yacht",
        trait: "Luxury",
        value: 1
    }
]

interface VibeCheckProps {
    isOpen: boolean
    onClose: () => void
}

export function VibeCheck({ isOpen, onClose }: VibeCheckProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [complete, setComplete] = useState(false)
    const [direction, setDirection] = useState(0)
    const [saving, setSaving] = useState(false)

    // Scoring State
    const [scores, setScores] = useState<Record<string, number>>({
        Adventure: 0,
        Luxury: 0,
        Culture: 0,
        Relaxation: 0,
        Foodie: 0
    })

    const supabase = createClient()
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-30, 30])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
    const loveOpacity = useTransform(x, [50, 150], [0, 1])
    const passOpacity = useTransform(x, [-150, -50], [1, 0])

    const handleSwipe = (dir: number) => {
        // Update Score if "Loved" (Right Swipe)
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
    }

    const reset = () => {
        setCurrentIndex(0)
        setComplete(false)
        setDirection(0)
        x.set(0)
        setScores({ Adventure: 0, Luxury: 0, Culture: 0, Relaxation: 0, Foodie: 0 })
    }

    // Determine Archetype logic
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
                traits: {
                    scores: scores,
                    total_swipes: vibeCards.length
                }
            })

            if (error) throw error

            toast.success("Travel DNA Saved", {
                description: `You are a ${finalArchetype}! Profile locked.`
            })
            onClose()
        } catch (err) {
            console.error(err)
            toast.error("Failed to save profile", {
                description: "Please check your network and try again."
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > 100) handleSwipe(1)
        else if (info.offset.x < -100) handleSwipe(-1)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <div className="relative w-full max-w-md">
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="size-6" />
                    </button>

                    {!complete ? (
                        <div className="relative h-[600px] w-full perspective-1000">
                            {vibeCards.map((card, index) => {
                                if (index < currentIndex) return null
                                if (index > currentIndex + 1) return null
                                const isCurrent = index === currentIndex

                                return (
                                    <motion.div
                                        key={card.id}
                                        drag={isCurrent ? "x" : false}
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={0.6}
                                        onDragEnd={handleDragEnd}
                                        style={{
                                            x: isCurrent ? x : 0,
                                            rotate: isCurrent ? rotate : 0,
                                            zIndex: isCurrent ? 2 : 1
                                        }}
                                        initial={false}
                                        animate={
                                            isCurrent && direction !== 0
                                                ? { x: direction * 500, opacity: 0 }
                                                : { scale: isCurrent ? 1 : 0.95, y: isCurrent ? 0 : 20, opacity: 1 }
                                        }
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing"
                                    >
                                        <img src={card.image} alt={card.label} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                                            <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/60 text-[10px] uppercase tracking-widest">
                                                Card {index + 1} / {vibeCards.length}
                                            </div>
                                        </div>

                                        <div className="absolute bottom-24 left-6 right-6 select-none">
                                            <h3 className="text-3xl font-bold text-white mb-2">{card.label}</h3>
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs uppercase tracking-wider">
                                                <Sparkles className="size-3 text-yellow-400" />
                                                {card.trait}
                                            </div>
                                        </div>

                                        {isCurrent && (
                                            <>
                                                <motion.div style={{ opacity: loveOpacity }} className="absolute top-10 left-10 border-4 border-emerald-500 rounded-xl px-4 py-2 -rotate-12 transform">
                                                    <span className="text-4xl font-bold text-emerald-500 uppercase tracking-widest">Love</span>
                                                </motion.div>
                                                <motion.div style={{ opacity: passOpacity }} className="absolute top-10 right-10 border-4 border-red-500 rounded-xl px-4 py-2 rotate-12 transform">
                                                    <span className="text-4xl font-bold text-red-500 uppercase tracking-widest">Pass</span>
                                                </motion.div>
                                            </>
                                        )}
                                    </motion.div>
                                )
                            })}

                            <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center gap-8 items-center h-20">
                                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-red-500/50 text-red-500 hover:bg-red-950/30 hover:text-red-400 bg-black/40 backdrop-blur-md" onClick={() => handleSwipe(-1)}>
                                    <X className="size-6" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-emerald-500/50 text-emerald-500 hover:bg-emerald-950/30 hover:text-emerald-400 bg-black/40 backdrop-blur-md" onClick={() => handleSwipe(1)}>
                                    <Heart className="size-6 fill-current" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Plane className="size-10 text-violet-400" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete</h2>
                            <p className="text-white/60 mb-8">
                                SafarAI has decoded your travel personality.
                            </p>

                            <div className="space-y-4">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-xs text-white/40 uppercase tracking-widest">Your Archetype</div>
                                        <Sparkles className="size-4 text-emerald-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                        {getArchetype()}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(scores)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 2)
                                        .map(([trait, score]) => (
                                            <div key={trait} className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                                                <div className="text-xl font-bold text-white">{score}</div>
                                                <div className="text-[10px] uppercase tracking-widest text-white/40">{trait}</div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <Button
                                className="w-full mt-8 h-12 bg-white text-black hover:bg-white/90 font-medium"
                                onClick={saveAndClose}
                                disabled={saving}
                            >
                                {saving ? "Saving to Neural Net..." : "Complete Booking"}
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
