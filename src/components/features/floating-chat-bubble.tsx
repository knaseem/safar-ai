"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, User, Bot, Mic, MicOff, Volume2, VolumeX, MessageCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'

type Message = {
    role: 'user' | 'model'
    content: string
}

const SUGGESTIONS = [
    "Where is good to visit in March?",
    "Plan a 5-day trip to Japan 🇯🇵",
    "Best beaches in Southeast Asia? 🏖️",
    "Halal-friendly food tour ideas 🍜",
    "Romantic destinations for couples ❤️",
    "Adventure activities in New Zealand 🏔️",
    "Budget-friendly European cities 💶",
    "Luxury resorts in Maldives 💎",
    "Solo travel safety tips 🛡️",
    "Unique hidden gems in Italy 🇮🇹",
    "Best places to see Northern Lights 🌌",
    "How to plan a Safari in Kenya 🦁",
    "Top attractions in Dubai 🏙️",
    "Best time to visit Riyadh 🇸🇦",
    "Historical sites in Cairo 🇪🇬",
    "Weekend in Doha itinerary 🇶🇦",
    "Cultural guide to Muscat 🇴🇲"
]

export function FloatingChatBubble() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [autoSpeak, setAutoSpeak] = useState(true)
    const [mounted, setMounted] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Voice hooks
    const { isListening, transcript, error: voiceError, isSupported: sttSupported, startListening, stopListening, resetTranscript } = useVoiceInput()
    const { speak, stop: stopSpeaking, isSpeaking, isSupported: ttsSupported } = useTextToSpeech()

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Handle voice transcript
    useEffect(() => {
        if (transcript && !isListening) {
            setInput(transcript)
            const timer = setTimeout(() => {
                if (transcript.trim()) {
                    handleSend(transcript)
                    resetTranscript()
                }
            }, 300)
            return () => clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, isListening, resetTranscript])

    // Auto-speak AI responses
    useEffect(() => {
        if (autoSpeak && ttsSupported && messages.length > 0) {
            const lastMessage = messages[messages.length - 1]
            if (lastMessage.role === 'model') {
                speak(lastMessage.content)
            }
        }
    }, [messages, autoSpeak, ttsSupported, speak])

    // Show voice errors
    useEffect(() => {
        if (voiceError) {
            toast.error("Voice Error", { description: voiceError })
        }
    }, [voiceError])

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return

        const newMessages = [...messages, { role: 'user', content: text } as Message]
        setMessages(newMessages)
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat/general', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'model', content: data.reply }])
        } catch (error) {
            toast.error("AI is currently busy", { description: "Please try again in a moment." })
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted) return null

    return createPortal(
        <>
            {/* Floating Bubble Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-[80] group"
                    >
                        {/* Glow effect with expansion */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-xl opacity-50"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        {/* Button with scale pulse */}
                        <motion.div
                            className="relative size-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <MessageCircle className="size-6 text-white" />
                        </motion.div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 right-0 px-3 py-1.5 rounded-lg bg-black/90 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                            Ask SafarAI ✨
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                        />

                        {/* Chat Window */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-6 right-6 w-[95vw] max-w-[420px] h-[70vh] max-h-[600px] bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/5 bg-neutral-900/95 backdrop-blur-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-white/5">
                                        <Sparkles className="size-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-white">SafarAI</h2>
                                        <p className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">Travel Concierge</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setMessages([])}
                                        className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                                        title="Clear Chat"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                        <div className="size-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                            <Bot className="size-7 text-white/20" />
                                        </div>
                                        <p className="text-white font-medium mb-1">How can I help?</p>
                                        <p className="text-white/40 text-sm max-w-xs mx-auto mb-6">
                                            Ask me anything about travel destinations, planning, or recommendations.
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                                            {SUGGESTIONS.map((suggestion, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSend(suggestion)}
                                                    className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 text-xs text-white/70 transition-all active:scale-[0.98]"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`shrink-0 size-7 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-white/10' : 'bg-emerald-500/10'
                                            }`}>
                                            {msg.role === 'user' ? <User className="size-3.5 text-white" /> : <Sparkles className="size-3.5 text-emerald-400" />}
                                        </div>
                                        <div className={`group relative max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-white text-black font-medium'
                                            : 'bg-white/5 border border-white/10 text-white/90'
                                            }`}>
                                            {msg.content}

                                            {/* Speaker button for AI messages */}
                                            {msg.role === 'model' && ttsSupported && (
                                                <button
                                                    onClick={() => speak(msg.content)}
                                                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/40 hover:text-emerald-400 transition-all"
                                                >
                                                    <Volume2 className="size-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="shrink-0 size-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <Sparkles className="size-3.5 text-emerald-400" />
                                        </div>
                                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                                            <div className="flex gap-1">
                                                <div className="size-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="size-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="size-1.5 bg-white/40 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-3 border-t border-white/10 bg-black/40">
                                {/* Auto-speak toggle */}
                                {ttsSupported && (
                                    <div className="flex items-center justify-end gap-2 mb-2">
                                        <button
                                            onClick={() => {
                                                if (isSpeaking) stopSpeaking()
                                                setAutoSpeak(!autoSpeak)
                                            }}
                                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider transition-all ${autoSpeak
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-white/5 text-white/40 border border-white/10'
                                                }`}
                                        >
                                            {autoSpeak ? <Volume2 className="size-2.5" /> : <VolumeX className="size-2.5" />}
                                            {autoSpeak ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                )}

                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="flex items-center gap-2"
                                >
                                    {/* Microphone button */}
                                    {sttSupported && (
                                        <button
                                            type="button"
                                            onClick={() => isListening ? stopListening() : startListening()}
                                            className={`p-2 rounded-lg transition-all ${isListening
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                                        </button>
                                    )}

                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={isListening ? "Listening..." : "Ask anything..."}
                                            disabled={isListening}
                                            className={`w-full bg-neutral-900 border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors ${isListening ? 'border-red-500/50' : 'border-white/10'
                                                }`}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading || isListening}
                                        className="p-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/20 transition-all"
                                    >
                                        <Send className="size-4" />
                                    </button>
                                </form>

                                {/* Listening indicator */}
                                {isListening && (
                                    <div className="mt-2 flex items-center justify-center gap-2 text-red-400 text-xs">
                                        <div className="flex gap-0.5">
                                            <motion.div className="w-1 h-2 bg-red-400 rounded-full" animate={{ scaleY: [1, 1.5, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
                                            <motion.div className="w-1 h-2 bg-red-400 rounded-full" animate={{ scaleY: [1, 1.8, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                                            <motion.div className="w-1 h-2 bg-red-400 rounded-full" animate={{ scaleY: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
                                        </div>
                                        <span>Speak now...</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>,
        document.body
    )
}
