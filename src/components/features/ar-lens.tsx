"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Scan, MapPin, Sparkles, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ARLensProps {
    isOpen: boolean
    onClose: () => void
}

// Simulated "Hidden Gems" database
const HIDDEN_GEMS = [
    {
        id: "gem-1",
        title: "The Secret Jazz Cellar",
        category: "Nightlife",
        description: "Behind the red door, knock twice for the best speakeasy in town.",
        coordinates: "Safety Lock Engagement",
        type: "Secret"
    },
    {
        id: "gem-2",
        title: "Golden Hour Rooftop",
        category: "Viewpoint",
        description: "Access via the hotel freight elevator. Unbeatable sunset views.",
        coordinates: "Roof Access",
        type: "Vista"
    },
    {
        id: "gem-3",
        title: "Grandma's Ravioli",
        category: "Food",
        description: "Ask for the 'Nonna Special' - it's not on the printed menu.",
        coordinates: "Off-Menu",
        type: "Dining"
    }
]

export function ARLens({ isOpen, onClose }: ARLensProps) {
    const [isScanning, setIsScanning] = useState(false)
    const [foundGem, setFoundGem] = useState<any>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Simulate Camera Feed (using a gray placeholder or actual camera if we wanted to go specific, but avoiding permissions for now to keep it simple/robust)
    // We'll use a cool grid animation instead of real camera to avoid permission blocks in this demo phase.

    useEffect(() => {
        if (isOpen) {
            setFoundGem(null)
            setIsScanning(false)
        }
    }, [isOpen])

    const handleScan = () => {
        setIsScanning(true)
        setFoundGem(null)

        // Simulate scanning delay
        setTimeout(() => {
            setIsScanning(false)
            // Pick a random gem
            const randomGem = HIDDEN_GEMS[Math.floor(Math.random() * HIDDEN_GEMS.length)]
            setFoundGem(randomGem)
        }, 2500)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/50 border border-white/20 text-white"
                >
                    <X className="size-6" />
                </button>

                {/* Viewfinder UI */}
                <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">

                    {/* Simulated Camera Feed Background */}
                    <div className="absolute inset-0 bg-neutral-900">
                        <div className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}
                        />
                        {/* Animated Scanning Line */}
                        {isScanning && (
                            <motion.div
                                className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10"
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                    </div>

                    {/* HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
                        {/* Top HUD */}
                        <div className="flex justify-between items-start">
                            <div className="bg-black/40 backdrop-blur border border-white/10 px-3 py-1 rounded text-xs font-mono text-emerald-400">
                                AR SYSTEM :: ONLINE
                            </div>
                            <div className="bg-black/40 backdrop-blur border border-white/10 px-3 py-1 rounded text-xs font-mono text-white/70">
                                LOC: 40.7128° N, 74.0060° W
                            </div>
                        </div>

                        {/* Center Reticle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 border border-white/20 rounded-lg">
                            <div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-emerald-400 -mt-0.5 -ml-0.5" />
                            <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-emerald-400 -mt-0.5 -mr-0.5" />
                            <div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-emerald-400 -mb-0.5 -ml-0.5" />
                            <div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-emerald-400 -mb-0.5 -mr-0.5" />

                            {isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-emerald-400 font-mono text-xs tracking-widest animate-pulse">
                                        ANALYZING...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Controls */}
                        <div className="pointer-events-auto flex flex-col items-center gap-6 mb-8">
                            <div className="text-center">
                                <h3 className="text-white font-bold text-lg mb-1">SafarAI Lens</h3>
                                <p className="text-white/50 text-sm">Point at landmarks or menus to reveal hidden data.</p>
                            </div>

                            {!foundGem ? (
                                <Button
                                    size="lg"
                                    onClick={handleScan}
                                    className="rounded-full size-16 bg-white hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all scale-100 hover:scale-110 active:scale-95"
                                    disabled={isScanning}
                                >
                                    {isScanning ? <Loader2 className="size-8 animate-spin" /> : <Scan className="size-8" />}
                                </Button>
                            ) : (
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="bg-black/80 backdrop-blur-xl border border-emerald-500/50 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-500/20">
                                            {foundGem.type} Detected
                                        </div>
                                        <button onClick={() => setFoundGem(null)} className="text-white/30 hover:text-white">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                        {foundGem.title} <Sparkles className="size-4 text-yellow-400" />
                                    </h4>
                                    <p className="text-white/70 text-sm leading-relaxed mb-4">
                                        {foundGem.description}
                                    </p>
                                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-10 text-xs">
                                        Navigate There
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
