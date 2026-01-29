"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldCheck, ExternalLink, ArrowLeft, Lock, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConciergePortalProps {
    url: string | null
    isOpen: boolean
    onClose: () => void
    title?: string
    providerName?: string
}

export function ConciergePortal({ url, isOpen, onClose, title = "Secure Booking", providerName = "Expedia" }: ConciergePortalProps) {
    const [status, setStatus] = useState<'syncing' | 'redirecting' | 'completed' | 'blocked'>('syncing')
    const isInternalUrl = url?.startsWith('/') || url?.startsWith(window.location.origin)

    useEffect(() => {
        if (isOpen && url) {
            setStatus('syncing')

            const jitter = Math.random() * 500
            const syncTimer = setTimeout(() => {
                // If it's an internal mock URL, we can use the iframe
                if (isInternalUrl) {
                    setStatus('redirecting')
                } else {
                    // Real Duffel links block iframes. We must go external.
                    setStatus('blocked')
                }
            }, 1200 + jitter)

            return () => clearTimeout(syncTimer)
        }
    }, [isOpen, url, isInternalUrl])

    const handleOpenExternal = () => {
        if (url) {
            window.open(url, '_blank', 'noreferrer')
            setStatus('completed')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 text-center"
                >
                    {/* Minimal Branding Header */}
                    <div className="absolute top-0 inset-x-0 h-16 border-b border-white/5 px-6 flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all flex items-center gap-2"
                        >
                            <ArrowLeft className="size-5" />
                            <span className="text-sm font-bold">Cancel</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <Lock className="size-3 text-emerald-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] opacity-40">Secure Handover active</span>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/40">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className={`w-full transition-all duration-700 ${status === 'redirecting' || status === 'completed' ? 'max-w-6xl h-[80vh]' : 'max-w-md space-y-12 h-auto'}`}>
                        <AnimatePresence mode="wait">
                            {(status === 'syncing' || status === 'blocked') && (
                                <motion.div
                                    key="syncing-view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-12"
                                >
                                    {/* Status Icon */}
                                    <div className="relative mx-auto size-24">
                                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                                        <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
                                        <ShieldCheck className="absolute inset-0 m-auto size-10 text-emerald-500" />
                                    </div>

                                    {/* Messaging */}
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold text-white mb-2 italic">Syncing Security Protocols...</h2>
                                        <p className="text-white/40 text-sm">Initializing encrypted handover with {providerName}. Please remain on this screen.</p>
                                    </div>
                                </motion.div>
                            )}

                            {(status === 'redirecting' || status === 'completed') && url && (
                                <motion.div
                                    key="iframe-view"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative"
                                >
                                    <iframe
                                        src={url}
                                        className="w-full h-full border-0"
                                        title={title}
                                        onLoad={() => setStatus('completed')}
                                        allow="payment"
                                    />
                                    {status === 'redirecting' && (
                                        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4">
                                            <div className="size-16 rounded-full border-t-2 border-emerald-500 animate-spin" />
                                            <span className="text-white/40 text-sm font-medium">Loading Secure Checkout...</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {status === 'blocked' && (
                                <motion.div
                                    key="blocked-view"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="max-w-md mx-auto space-y-8"
                                >
                                    <div className="size-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <ExternalLink className="size-10 text-amber-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold text-white italic">External Handover Required</h2>
                                        <p className="text-white/40 text-sm leading-relaxed">
                                            For your security, {providerName} requires checkout to be completed in a dedicated secure session. Click below to continue.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleOpenExternal}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                                    >
                                        Proceed to Secure Checkout
                                        <ArrowRight className="size-5" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Info */}
                    <div className="absolute bottom-12 flex items-center gap-8 opacity-20">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Encrypted Handover</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Verified Partner</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
