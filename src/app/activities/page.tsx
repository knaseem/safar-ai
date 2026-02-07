'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react'
import { ActivitiesSection } from '@/components/activities/activities-section'
import { Navbar } from '@/components/layout/navbar'

const POPULAR_DESTINATIONS = [
    { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800' },
    { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800' },
    { name: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800' },
    { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea904ac66de?auto=format&fit=crop&q=80&w=800' },
    { name: 'Rome', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800' },
    { name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800' },
]

export default function ActivitiesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeDestination, setActiveDestination] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(false)

    // Handle Search Submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            setIsSearching(true)
            setActiveDestination(searchQuery.trim())
            // Smooth scroll to results
            setTimeout(() => {
                document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        }
    }

    // Handle Quick Pick Selection
    const handleSelectDestination = (dest: string) => {
        setSearchQuery(dest)
        setActiveDestination(dest)
        setIsSearching(true)
        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500/30">
            <Navbar />

            {/* Hero Search Section */}
            <div className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000"
                        alt="Travel Background"
                        className="w-full h-full object-cover opacity-40 scale-105 animate-slow-pan"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-[#0A0A0A]/40 to-[#0A0A0A]" />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-4xl px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-bold mb-6 tracking-tight drop-shadow-2xl"
                    >
                        Find Unforgettable <span className="text-emerald-400">Experiences</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
                    >
                        Explore top-rated tours, activities, and attractions worldwide.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.form
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        onSubmit={handleSearch}
                        className="relative max-w-2xl mx-auto"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-70 blur transition duration-1000 group-hover:duration-200 group-hover:opacity-100" />
                            <div className="relative flex items-center bg-black/80 backdrop-blur-xl rounded-full p-2 border border-white/10 shadow-2xl">
                                <MapPin className="ml-4 text-white/50 size-5 shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Where are you going? (e.g. Paris, Tokyo)"
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/40 px-4 py-3 text-lg"
                                />
                                <button
                                    type="button" // Date is optional, just visual for now
                                    className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-colors text-white/60 text-sm border-l border-white/10 ml-2"
                                >
                                    <Calendar className="size-4" />
                                    <span>Any dates</span>
                                </button>
                                <button
                                    type="submit"
                                    className="ml-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <span>Search</span>
                                    <Search className="size-4" />
                                </button>
                            </div>
                        </div>
                    </motion.form>
                </div>
            </div>

            {/* Main Content Area */}
            <div id="results-section" className="relative z-10 -mt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Popular Destinations (Show if no search is active yet) */}
                <AnimatePresence mode="wait">
                    {!activeDestination && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    Popular & Trending
                                    <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Hot right now</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {POPULAR_DESTINATIONS.map((dest) => (
                                    <div
                                        key={dest.name}
                                        onClick={() => handleSelectDestination(dest.name)}
                                        className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-emerald-500/50 transition-all"
                                    >
                                        <img
                                            src={dest.image}
                                            alt={dest.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-4">
                                            <span className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{dest.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Results Section Using Reusable Components */}
                    {activeDestination && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 min-h-[500px]"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">
                                        Experiences in <span className="text-emerald-400">{activeDestination}</span>
                                    </h2>
                                    <p className="text-white/60">
                                        Curated list of top-rated activities and tours.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActiveDestination(null)}
                                    className="text-sm text-white/50 hover:text-white transition-colors underline decoration-white/20 hover:decoration-white"
                                >
                                    Clear Search
                                </button>
                            </div>

                            {/* The Polished Activities Component */}
                            <ActivitiesSection destination={activeDestination} />

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
