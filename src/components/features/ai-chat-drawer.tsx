"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, User, Bot, Command } from 'lucide-react'
import { TripData } from './trip-itinerary'
import { toast } from 'sonner'

interface AIChatDrawerProps {
    isOpen: boolean
    onClose: () => void
    tripData: TripData
}

type Message = {
    role: 'user' | 'model'
    content: string
}

const SUGGESTIONS = [
    "Recommend a dinner spot for Day 1",
    "What's the weather forecast?",
    "Is this area walkable?",
    "Find a hidden gem nearby",
    "How do I get around the city?",
    "What are the must-try local foods?",
    "Any cultural etiquette I should know?",
    "Suggest a unique souvenir to buy"
]

export function AIChatDrawer({ isOpen, onClose, tripData }: AIChatDrawerProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return

        const newMessages = [...messages, { role: 'user', content: text } as Message]
        setMessages(newMessages)
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat/companion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    tripContext: tripData
                })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'model', content: data.reply }])
        } catch (error) {
            toast.error("Concierge is currently busy", { description: "Please try again in a moment." })
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 z-[90]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-[100] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-neutral-900/95 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-white/5">
                                    <Sparkles className="size-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">SafarAI Concierge</h2>
                                    <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase">Always Online</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Bot className="size-8 text-white/20" />
                                    </div>
                                    <p className="text-white font-medium text-lg mb-2">How can I assist you?</p>
                                    <p className="text-white/40 text-sm max-w-xs mx-auto mb-8">
                                        I have your full itinerary details. Ask me about logistics, recommendations, or hidden spots.
                                    </p>

                                    <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                                        {SUGGESTIONS.map((suggestion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(suggestion)}
                                                className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 text-xs text-white/70 transition-all active:scale-[0.98]"
                                            >
                                                "{suggestion}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`shrink-0 size-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-white/10' : 'bg-emerald-500/10'
                                        }`}>
                                        {msg.role === 'user' ? <User className="size-4 text-white" /> : <Sparkles className="size-4 text-emerald-400" />}
                                    </div>
                                    <div className={`group relative max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-white text-black font-medium'
                                        : 'bg-white/5 border border-white/10 text-white/90 shadow-lg'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            msg.content
                                        ) : (
                                            <FormattedMessage content={msg.content} />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-1.5 p-4 bg-white/5 rounded-2xl w-fit">
                                    <div className="size-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="size-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="size-1.5 bg-white/40 rounded-full animate-bounce" />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center gap-2"
                            >
                                <div className="flex-1 relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 text-white/30 hidden md:block">
                                        <Command className="size-3" />
                                    </div>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask your concierge..."
                                        className="w-full bg-neutral-900 border border-white/10 rounded-2xl pl-4 md:pl-12 pr-12 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 hover:bg-white/5 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/20 transition-all font-medium"
                                    >
                                        <Send className="size-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

function FormattedMessage({ content }: { content: string }) {
    return (
        <div className="space-y-2">
            {content.split('\n').map((line, j) => {
                if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                    const cleanLine = line.trim().substring(2)
                    const parts = cleanLine.split(/(\*\*.*?\*\*)/g)
                    return (
                        <div key={j} className="flex gap-2 pl-1">
                            <span className="text-emerald-400 mt-1.5">•</span>
                            <span>
                                {parts.map((part, k) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={k} className="font-semibold text-emerald-100">{part.slice(2, -2)}</strong>
                                    }
                                    return part
                                })}
                            </span>
                        </div>
                    )
                }
                const parts = line.split(/(\*\*.*?\*\*)/g)
                return (
                    <p key={j} className={line.trim() === '' ? 'h-2' : ''}>
                        {parts.map((part, k) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={k} className="font-semibold text-emerald-100">{part.slice(2, -2)}</strong>
                            }
                            return part
                        })}
                    </p>
                )
            })}
        </div>
    )
}

export function ConciergeButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="relative group/concierge">
            <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-25"
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.button
                onClick={onClick}
                className="relative p-2 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-emerald-400 shadow-xl"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
            >
                <Sparkles className="size-4" />
            </motion.button>
        </div>
    )
}
