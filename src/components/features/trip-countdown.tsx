"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plane, MapPin, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface TripCountdownProps {
    tripName: string
    destination: string
    departureDate: string // ISO date string
    className?: string
}

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
}

export function TripCountdown({ tripName, destination, departureDate, className }: TripCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime()
            const departure = new Date(departureDate).getTime()
            const diff = departure - now

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
                return
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
                total: diff,
            })
        }

        calculateTime()
        const interval = setInterval(calculateTime, 1000)
        return () => clearInterval(interval)
    }, [departureDate])

    if (!timeLeft) return null

    const isTomorrow = timeLeft.days === 1
    const isToday = timeLeft.days === 0 && timeLeft.total > 0
    const isPast = timeLeft.total <= 0

    // Calculate total trip preparation time (from 90 days out)
    const totalPrepTime = 90 * 24 * 60 * 60 * 1000
    const elapsed = totalPrepTime - timeLeft.total
    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalPrepTime) * 100))

    return (
        <motion.div
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
                "cursor-pointer select-none transition-all duration-300",
                className
            )}
        >
            {/* Compact Mode (for TravelHUD) */}
            {!isExpanded ? (
                <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group w-full relative overflow-hidden">
                    {/* Animated background pulse for "tomorrow" state */}
                    {isTomorrow && (
                        <motion.div
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent"
                        />
                    )}
                    {isToday && (
                        <motion.div
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent"
                        />
                    )}

                    <div className="relative">
                        <Plane className={cn(
                            "size-5 -rotate-45 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform",
                            isToday ? "text-amber-400" : "text-emerald-400"
                        )} />
                        <div className={cn(
                            "absolute top-0 right-0 w-1.5 h-1.5 rounded-full animate-pulse",
                            isToday ? "bg-amber-500" : "bg-emerald-500"
                        )} />
                    </div>

                    <div className="flex flex-col items-center leading-none mt-1 relative z-10">
                        <span className={cn(
                            "text-[8px] uppercase font-bold tracking-widest mb-0.5",
                            isToday ? "text-amber-500/60" : isPast ? "text-purple-500/60" : "text-emerald-500/60"
                        )}>
                            {isPast ? "Bon Voyage!" : isToday ? "Today!" : "Next Trip"}
                        </span>

                        {isPast ? (
                            <span className="text-xs font-bold text-purple-400">✈️ EN ROUTE</span>
                        ) : (
                            <div className="flex items-center gap-0.5">
                                <FlipDigit value={timeLeft.days} />
                                <span className="text-[8px] text-emerald-500/50 font-bold">D</span>
                                <FlipDigit value={timeLeft.hours} />
                                <span className="text-[8px] text-emerald-500/50 font-bold">H</span>
                                <FlipDigit value={timeLeft.minutes} />
                                <span className="text-[8px] text-emerald-500/50 font-bold">M</span>
                            </div>
                        )}
                    </div>

                    {/* Micro progress ring */}
                    <svg className="absolute -bottom-0.5 -right-0.5 size-6 opacity-30" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <circle
                            cx="12" cy="12" r="10" fill="none"
                            stroke={isToday ? "#f59e0b" : "#10b981"}
                            strokeWidth="2"
                            strokeDasharray={`${progressPercent * 0.628} 62.8`}
                            strokeLinecap="round"
                            transform="rotate(-90 12 12)"
                        />
                    </svg>
                </div>
            ) : (
                /* Expanded Mode */
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-neutral-900/95 border border-white/10 backdrop-blur-xl w-64 shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className={cn(
                            "size-8 rounded-lg flex items-center justify-center",
                            isToday ? "bg-amber-500/20" : "bg-emerald-500/20"
                        )}>
                            <Plane className={cn("size-4 -rotate-45", isToday ? "text-amber-400" : "text-emerald-400")} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white truncate max-w-[150px]">{tripName}</p>
                            <p className="text-[10px] text-white/40 flex items-center gap-1">
                                <MapPin className="size-2.5" />{destination}
                            </p>
                        </div>
                    </div>

                    {/* Countdown Grid */}
                    {!isPast ? (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            <CountdownUnit value={timeLeft.days} label="Days" highlight={isToday || isTomorrow} />
                            <CountdownUnit value={timeLeft.hours} label="Hours" />
                            <CountdownUnit value={timeLeft.minutes} label="Mins" />
                            <CountdownUnit value={timeLeft.seconds} label="Secs" animate />
                        </div>
                    ) : (
                        <div className="text-center py-3 mb-3">
                            <Sparkles className="size-6 text-purple-400 mx-auto mb-1 animate-pulse" />
                            <p className="text-sm font-bold text-white">Your trip has begun!</p>
                            <p className="text-[10px] text-white/40">Enjoy every moment ✨</p>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={cn(
                                "absolute inset-y-0 left-0 rounded-full",
                                isToday
                                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                    : "bg-gradient-to-r from-emerald-500 to-cyan-400"
                            )}
                        />
                    </div>
                    <p className="text-[9px] text-white/20 text-center mt-1.5 uppercase tracking-wider">
                        {Math.round(progressPercent)}% closer to departure
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}

function FlipDigit({ value }: { value: number }) {
    return (
        <motion.span
            key={value}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xs font-bold text-emerald-400 font-mono w-[14px] text-center inline-block"
        >
            {value.toString().padStart(2, "0")}
        </motion.span>
    )
}

function CountdownUnit({ value, label, highlight, animate }: { value: number; label: string; highlight?: boolean; animate?: boolean }) {
    return (
        <div className="text-center">
            <motion.div
                key={animate ? value : undefined}
                initial={animate ? { scale: 1.1 } : undefined}
                animate={animate ? { scale: 1 } : undefined}
                className={cn(
                    "text-lg font-bold font-mono rounded-lg py-1",
                    highlight ? "text-amber-400 bg-amber-500/10" : "text-white bg-white/5"
                )}
            >
                {value.toString().padStart(2, "0")}
            </motion.div>
            <p className="text-[9px] text-white/30 uppercase tracking-wider mt-1">{label}</p>
        </div>
    )
}
