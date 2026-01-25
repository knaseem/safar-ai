"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Fingerprint, X, ShieldCheck, Award, Star, BookOpen, Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import { PassportStamp } from "./passport-stamp"

interface PassportCardProps {
    archetype: string
    scores: Record<string, number>
    bookings?: any[]
    onClose?: () => void
    className?: string
}

export function PassportCard({ archetype, scores, bookings = [], onClose, className }: PassportCardProps) {
    const [isOpened, setIsOpened] = useState(false)

    // Calculate Traveler Tier
    const bookingCount = bookings.length
    const getTier = () => {
        if (bookingCount >= 10) return { name: "Platinum Explorer", color: "text-cyan-400", bg: "bg-cyan-500/10", borderColor: "border-cyan-500/50" }
        if (bookingCount >= 5) return { name: "Gold Nomad", color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10", borderColor: "border-[#D4AF37]/50" }
        if (bookingCount >= 1) return { name: "Silver Scout", color: "text-slate-300", bg: "bg-slate-300/10", borderColor: "border-slate-300/50" }
        return { name: "Bronze Traveler", color: "text-amber-600", bg: "bg-amber-600/10", borderColor: "border-amber-600/50" }
    }
    const tier = getTier()

    return (
        <div className={cn("relative perspective-2000 w-full max-w-4xl mx-auto h-[600px]", className)}>
            <AnimatePresence mode="wait">
                {!isOpened ? (
                    /* PASSPORT COVER */
                    <motion.div
                        key="cover"
                        onClick={() => setIsOpened(true)}
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: -90, transition: { duration: 0.8, ease: "easeInOut" } }}
                        className="absolute inset-0 z-20 cursor-pointer group origin-left"
                    >
                        <div className="w-full max-w-md mx-auto aspect-[3/4] bg-[#2a1a1a] border-2 border-[#D4AF37] rounded-r-3xl rounded-l-md p-8 flex flex-col items-center justify-between shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
                            <div className="text-center">
                                <h1 className="text-3xl font-serif text-[#D4AF37] tracking-[0.3em] uppercase mb-1">Passport</h1>
                                <p className="text-[10px] text-[#D4AF37]/60 tracking-[0.2em] font-light">WORLDWIDE TRAVEL DOCUMENT</p>
                            </div>

                            <div className="size-40 border-4 border-[#D4AF37]/30 rounded-full flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-4 border border-[#D4AF37]/20 rounded-full animate-spin-slow" />
                                <Fingerprint className="size-20 text-[#D4AF37] group-hover:scale-110 transition-transform duration-500" />
                            </div>

                            <div className="text-center space-y-4">
                                <div className="p-3 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl">
                                    <div className="text-[10px] text-[#D4AF37]/40 uppercase tracking-widest mb-1">Official Specimen</div>
                                    <div className="text-xl font-serif text-white italic">"{archetype}"</div>
                                </div>
                                <div className="flex items-center gap-2 justify-center text-[#D4AF37]/60 animate-pulse">
                                    <BookOpen className="size-4" />
                                    <span className="text-xs uppercase tracking-widest">Click to Open</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* PASSPORT INSIDE (SPREAD) */
                    <motion.div
                        key="inside"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 grid grid-cols-2 gap-0 origin-left"
                    >
                        {/* LEFT PAGE: BIO & ARCHETYPE */}
                        <div className="bg-[#f5f5f0] rounded-l-3xl p-8 shadow-inner border-r border-black/10 overflow-hidden relative">
                            {/* Security Guilloche Pattern Overlay */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-serif text-neutral-800 uppercase tracking-tight">Travel Identity</h2>
                                        <p className="text-xs text-neutral-400 font-mono italic">Verified Document ID: {Math.random().toString(36).slice(2, 10).toUpperCase()}</p>
                                    </div>
                                    <ShieldCheck className="size-8 text-neutral-300" />
                                </div>

                                <div className="flex-1 space-y-8">
                                    {/* Profile Summary */}
                                    <div className="flex gap-6 items-center">
                                        <div className="size-24 bg-neutral-200 rounded-lg border-2 border-neutral-300 flex items-center justify-center p-1 shadow-sm">
                                            <div className="w-full h-full bg-neutral-100 rounded flex items-center justify-center overflow-hidden grayscale">
                                                <Fingerprint className="size-12 text-neutral-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="bg-neutral-800 text-white px-3 py-1 rounded-sm text-sm font-bold skew-x-[-10deg]">
                                                {archetype}
                                            </div>
                                            <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", tier.bg, tier.color, tier.borderColor)}>
                                                <Award className="size-3" />
                                                {tier.name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Traits Analysis */}
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-200 pb-1">Cognitive Archetype Scores</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {Object.entries(scores || {}).map(([trait, score]) => (
                                                <div key={trait} className="flex items-center justify-between group">
                                                    <span className="text-xs text-neutral-600 uppercase tracking-wider">{trait}</span>
                                                    <div className="flex items-center gap-3 flex-1 px-4">
                                                        <div className="h-1 bg-neutral-200 flex-1 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(score / 10) * 100}%` }}
                                                                className="h-full bg-neutral-600"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-mono font-bold text-neutral-400">LVL {score}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-neutral-200 flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[8px] uppercase tracking-widest text-neutral-400">Issuing Authority</p>
                                        <p className="text-sm font-serif italic text-neutral-600">SafarAI Global Intelligence</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] uppercase tracking-widest text-neutral-400">Total Expeditions</p>
                                        <p className="text-2xl font-bold text-neutral-800">{bookingCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PAGE: STAMPS GALLERY */}
                        <div className="bg-[#f5f5f0] rounded-r-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')]" />

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-serif text-neutral-800 uppercase tracking-widest">Visa & Entry Stamps</h2>
                                    <Star className="size-5 text-neutral-300 fill-neutral-300" />
                                </div>

                                <div className="flex-1 overflow-y-auto scrollbar-hide">
                                    {bookings.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-6">
                                            <Plane className="size-12 mb-4" />
                                            <p className="text-sm font-serif italic uppercase tracking-wider">No stamps issued yet.<br />Book a trip via AI Concierge to earn your first stamp.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 p-2">
                                            {bookings.map((booking, idx) => (
                                                <PassportStamp
                                                    key={booking.id}
                                                    destination={booking.trip_name || booking.destination}
                                                    date={new Date(booking.check_in).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                    color={idx % 2 === 0 ? 'emerald' : 'cyan'}
                                                    vibe={idx % 3 === 0 ? 'luxury' : 'adventure'}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-center gap-4">
                                    <button
                                        onClick={() => setIsOpened(false)}
                                        className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-800 transition-colors border-b border-transparent hover:border-neutral-800"
                                    >
                                        Back to Cover
                                    </button>
                                </div>
                            </div>

                            {/* Close Button UI when inside */}
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 transition-colors z-[110]"
                                >
                                    <X className="size-5" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

