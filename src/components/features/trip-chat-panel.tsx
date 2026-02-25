"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    MessageCircle, Send, X, Loader2, Sparkles,
    ChevronDown, Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    trip_changes?: string[]
    created_at: string
}

interface TripChatPanelProps {
    tripId: string
    tripData: any
    onTripUpdate: (updatedTrip: any) => void
    isOpen: boolean
    onToggle: () => void
}

const SUGGESTIONS = [
    "Make day 2 more relaxing",
    "Add a cooking class",
    "Swap the hotel for something cheaper",
    "Add a beach day",
    "Make it more halal-friendly",
    "Extend the trip by 1 day",
    "Add a local market visit",
    "Change the evening to fine dining",
]

export function TripChatPanel({ tripId, tripData, onTripUpdate, isOpen, onToggle }: TripChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(true)
    const [showSuggestions, setShowSuggestions] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Load chat history
    useEffect(() => {
        if (!isOpen) return
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/chat/refine?tripId=${tripId}`)
                if (res.ok) {
                    const data = await res.json()
                    setMessages(data.messages || [])
                    if (data.messages?.length > 0) setShowSuggestions(false)
                }
            } catch {
                // Silently fail — empty chat is fine
            } finally {
                setLoadingHistory(false)
            }
        }
        fetchHistory()
    }, [isOpen, tripId])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300)
        }
    }, [isOpen])

    const handleSend = async (text?: string) => {
        const msg = (text || input).trim()
        if (!msg || loading) return

        setInput("")
        setShowSuggestions(false)
        setLoading(true)

        // Optimistically add user message
        const userMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            role: "user",
            content: msg,
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, userMsg])

        try {
            const res = await fetch("/api/chat/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tripId,
                    message: msg,
                    currentTripData: tripData
                })
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to refine")
            }

            const data = await res.json()

            // Add assistant response
            const assistantMsg: ChatMessage = {
                id: `temp-${Date.now()}-ai`,
                role: "assistant",
                content: data.reply,
                trip_changes: data.changesApplied,
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, assistantMsg])

            // Update trip data in parent
            if (data.updatedTrip) {
                onTripUpdate(data.updatedTrip)
                toast.success("Itinerary updated!")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to refine itinerary")
            // Remove optimistic user message on error
            setMessages(prev => prev.filter(m => m.id !== userMsg.id))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Floating Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={onToggle}
                        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-105 group"
                    >
                        <MessageCircle className="size-6 text-white group-hover:rotate-12 transition-transform" />
                        {messages.length > 0 && (
                            <span className="absolute -top-1 -right-1 size-5 bg-white text-emerald-600 text-[10px] font-bold rounded-full flex items-center justify-center">
                                {messages.length}
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%", opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                                        <Sparkles className="size-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">
                                            AI Trip Refiner
                                        </h3>
                                        <p className="text-[10px] text-white/40">
                                            Refine your itinerary conversationally
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onToggle}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="size-4 text-white/60" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="size-5 text-emerald-400 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-12 space-y-4">
                                    <div className="mx-auto p-4 bg-emerald-500/10 rounded-2xl w-fit">
                                        <MessageCircle className="size-8 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/70 font-medium">
                                            Refine Your Trip
                                        </p>
                                        <p className="text-xs text-white/30 mt-1 max-w-xs mx-auto">
                                            Ask me to modify your itinerary — swap hotels,
                                            add activities, change the pace, or extend your trip.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-3",
                                            msg.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="p-1.5 bg-emerald-500/20 rounded-lg h-fit mt-0.5">
                                                <Sparkles className="size-3 text-emerald-400" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-2.5",
                                            msg.role === "user"
                                                ? "bg-emerald-500/20 border border-emerald-500/30 text-white/90"
                                                : "bg-white/5 border border-white/5 text-white/80"
                                        )}>
                                            <p className="text-sm leading-relaxed">
                                                {msg.content}
                                            </p>
                                            {msg.trip_changes && msg.trip_changes.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-white/5">
                                                    <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-bold mb-1">
                                                        Changes Applied
                                                    </p>
                                                    {msg.trip_changes.map((change, i) => (
                                                        <p key={i} className="text-[11px] text-white/40 flex items-start gap-1.5">
                                                            <span className="text-emerald-500 mt-0.5">•</span>
                                                            {change}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                                        <Sparkles className="size-3 text-emerald-400" />
                                    </div>
                                    <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="size-3 text-emerald-400 animate-spin" />
                                            <span className="text-xs text-white/40">
                                                Refining your itinerary...
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions */}
                        <AnimatePresence>
                            {showSuggestions && !loading && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-white/5 px-4 py-3 overflow-hidden"
                                >
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Lightbulb className="size-3 text-amber-400/60" />
                                        <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold">
                                            Try asking
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SUGGESTIONS.slice(0, 4).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleSend(s)}
                                                className="text-[11px] px-3 py-1.5 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 rounded-full text-white/50 hover:text-emerald-300 transition-all"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 bg-black/50">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend()
                                        }
                                    }}
                                    placeholder="Refine your itinerary..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                    disabled={loading}
                                />
                                <Button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || loading}
                                    size="sm"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-3 py-2.5 disabled:opacity-30"
                                >
                                    {loading ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Send className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
