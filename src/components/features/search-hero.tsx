"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { TravelpayoutsWidget } from "./travelpayouts-widget"
import { Sparkles, ChevronLeft, Plane } from "lucide-react"

const HERO_IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?q=80&w=2670&auto=format&fit=crop",
        location: "Burj Khalifa, Dubai",
        credit: "Unsplash"
    },
    {
        url: "https://images.pexels.com/photos/11215343/pexels-photo-11215343.jpeg?auto=compress&cs=tinysrgb&w=2600",
        location: "Elephant Rock, AlUla",
        credit: "Pexels"
    },
    {
        url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop",
        location: "Kyoto, Japan",
        credit: "Sorasak"
    },
    {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop",
        location: "Zermatt, Switzerland",
        credit: "Jrg"
    },
    {
        url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2673&auto=format&fit=crop",
        location: "Paris, France",
        credit: "Anthony DELANOIX"
    }
]

export function SearchHero() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Rotate Hero Image every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Cinematic Background Slider */}
            <div className="absolute inset-0 z-0 bg-black">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {/* Ken Burns Scale Effect */}
                        <motion.img
                            src={HERO_IMAGES[currentImageIndex].url}
                            alt={HERO_IMAGES[currentImageIndex].location}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1.00 }}
                            transition={{ duration: 12, ease: "linear" }}
                            className="w-full h-full object-cover"
                        />
                        {/* Location Credit Overlay */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-white/50 text-center">
                            <span className="text-xs uppercase tracking-[0.2em] font-light border-b border-white/20 pb-1 mb-1">Location</span>
                            <span className="text-sm font-medium text-white/90">{HERO_IMAGES[currentImageIndex].location}</span>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Global Overlay */}
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10 transition-colors duration-1000" />
            </div>

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all group"
                >
                    <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>

                {/* Centered Logo */}
                <div className="absolute left-1/2 top-6 -translate-x-1/2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-white p-1.5 rounded-lg">
                            <Plane className="size-5 text-black" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Safar<span className="text-white/60">AI</span>
                        </span>
                    </Link>
                </div>
            </div>

            {/* Content Layer */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">

                {/* Cinematic Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2">
                        Experience the World,
                    </h1>
                    <span className="text-5xl md:text-7xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-500">
                        Effortlessly.
                    </span>
                </motion.div>

                {/* Widget Container - Centered & Glassmorphic */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-[1100px] relative group z-30"
                >
                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                        <TravelpayoutsWidget />
                    </div>
                </motion.div>

            </div>
        </section>
    )
}
