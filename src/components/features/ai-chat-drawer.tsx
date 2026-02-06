"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, User, Bot, Command, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TripData } from './trip-itinerary'
import { toast } from 'sonner'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'

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
    const [autoSpeak, setAutoSpeak] = useState(true)

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

    // Handle voice transcript - using ref to avoid dependency issues
    useEffect(() => {
        if (transcript && !isListening) {
            setInput(transcript)
            // Auto-send after voice input completes
            const timer = setTimeout(() => {
                if (transcript.trim()) {
                    // Call handleSend inline to avoid stale closure
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
                                <div className="flex gap-4">
                                    <div className="shrink-0 size-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Sparkles className="size-4 text-emerald-400" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                                        <div className="flex gap-1.5">
                                            <div className="size-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="size-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="size-1.5 bg-white/40 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl">
                            {/* Auto-speak toggle */}
                            {ttsSupported && (
                                <div className="flex items-center justify-end gap-2 mb-3">
                                    <button
                                        onClick={() => {
                                            if (isSpeaking) stopSpeaking()
                                            setAutoSpeak(!autoSpeak)
                                        }}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider transition-all ${autoSpeak
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-white/5 text-white/40 border border-white/10'
                                            }`}
                                    >
                                        {autoSpeak ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
                                        Auto-speak {autoSpeak ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                            )}

                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center gap-2"
                            >
                                {/* Microphone button */}
                                {sttSupported && (
                                    <button
                                        type="button"
                                        onClick={() => isListening ? stopListening() : startListening()}
                                        className={`relative p-3 rounded-xl transition-all ${isListening
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {isListening && (
                                            <motion.div
                                                className="absolute inset-0 rounded-xl bg-red-500"
                                                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            />
                                        )}
                                        {isListening ? <MicOff className="size-5 relative z-10" /> : <Mic className="size-5" />}
                                    </button>
                                )}

                                <div className="flex-1 relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 text-white/30 hidden md:block">
                                        <Command className="size-3" />
                                    </div>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={isListening ? "Listening..." : "Ask your concierge..."}
                                        disabled={isListening}
                                        className={`w-full bg-neutral-900 border rounded-2xl pl-4 md:pl-12 pr-12 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 hover:bg-white/5 transition-colors disabled:opacity-50 ${isListening ? 'border-red-500/50' : 'border-white/10'
                                            }`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading || isListening}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/20 transition-all font-medium"
                                    >
                                        <Send className="size-4" />
                                    </button>
                                </div>
                            </form>

                            {/* Listening indicator */}
                            {isListening && (
                                <div className="mt-2 flex items-center justify-center gap-2 text-red-400 text-xs">
                                    <div className="flex gap-0.5">
                                        <motion.div className="w-1 h-3 bg-red-400 rounded-full" animate={{ scaleY: [1, 1.5, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
                                        <motion.div className="w-1 h-3 bg-red-400 rounded-full" animate={{ scaleY: [1, 1.8, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                                        <motion.div className="w-1 h-3 bg-red-400 rounded-full" animate={{ scaleY: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
                                        <motion.div className="w-1 h-3 bg-red-400 rounded-full" animate={{ scaleY: [1, 1.6, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }} />
                                    </div>
                                    <span>Speak now...</span>
                                </div>
                            )}
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
                // Handle bullet points
                if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                    const cleanLine = line.trim().substring(2)
                    // Format bold within bullet
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
                // Handle regular lines with bold
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

export function ConciergeButton({ onClick, tripName }: { onClick: () => void, tripName: string }) {
    return (
        <div className="relative group/concierge">
            {/* Glowing Ring Animation */}
            <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-25"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Button Scale Animation */}
            <motion.button
                onClick={onClick}
                className="relative p-2 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-emerald-400 shadow-xl"
                animate={{
                    scale: [1, 1.1, 1]
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Sparkles className="size-4" />
            </motion.button>
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/80 text-[10px] text-white opacity-0 group-hover/concierge:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10 z-50">
                Ask AI Concierge
            </div>
        </div>
    )
}
