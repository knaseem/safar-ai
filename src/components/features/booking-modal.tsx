"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Plane, Building2, Car, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookingModalProps {
    tripName: string
    days: number
    isOpen: boolean
    onClose: () => void
}

export function BookingModal({ tripName, days, isOpen, onClose }: BookingModalProps) {
    const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
    const [processingText, setProcessingText] = useState('Securing Flights...')

    const estimatedPrice = Math.floor(1500 + (days * 350) + Math.random() * 500)

    // Processing animation
    useEffect(() => {
        if (step === 'processing') {
            const messages = [
                'Securing Flights...',
                'Reserving Hotels...',
                'Arranging Transportation...',
                'Finalizing Itinerary...'
            ]
            let i = 0
            const interval = setInterval(() => {
                i++
                if (i < messages.length) {
                    setProcessingText(messages[i])
                } else {
                    clearInterval(interval)
                    setStep('success')
                }
            }, 1200)
            return () => clearInterval(interval)
        }
    }, [step])

    const handleBookNow = () => {
        setStep('processing')
    }

    const handleClose = () => {
        setStep('form')
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <X className="size-4 text-white" />
                    </button>

                    {step === 'form' && (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Trip</h2>
                            <p className="text-white/50 text-sm mb-6">One-click booking. No hidden fees.</p>

                            {/* Trip Summary */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-3">{tripName}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-white/70">
                                        <span>Duration</span>
                                        <span className="text-white">{days} Days</span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>Guests</span>
                                        <span className="text-white">2 Adults</span>
                                    </div>
                                    <div className="flex justify-between text-white/70 pt-2 border-t border-white/10 mt-2">
                                        <span className="font-semibold text-white">Total</span>
                                        <span className="text-emerald-400 font-bold text-lg">${estimatedPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fake Payment Form */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Card Number</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            defaultValue="4242 4242 4242 4242"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            readOnly
                                        />
                                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-white/30" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Expiry</label>
                                        <input
                                            type="text"
                                            defaultValue="12/28"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">CVV</label>
                                        <input
                                            type="text"
                                            defaultValue="•••"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleBookNow}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-6 rounded-xl text-lg"
                            >
                                Book Now - ${estimatedPrice.toLocaleString()}
                            </Button>
                            <p className="text-center text-white/30 text-xs mt-4">Demo mode. No real charges.</p>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="p-8 h-80 flex flex-col items-center justify-center">
                            <div className="relative mb-6">
                                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                                    {processingText.includes('Flight') && <Plane className="size-8 text-emerald-400" />}
                                    {processingText.includes('Hotel') && <Building2 className="size-8 text-emerald-400" />}
                                    {processingText.includes('Transport') && <Car className="size-8 text-emerald-400" />}
                                    {processingText.includes('Itinerary') && <Sparkles className="size-8 text-emerald-400" />}
                                </div>
                                <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-emerald-500/50 border-t-transparent animate-spin" />
                            </div>
                            <p className="text-white text-lg font-medium">{processingText}</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="p-8 text-center">
                            <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="size-10 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">You're Going!</h2>
                            <p className="text-white/60 mb-6">Confirmation sent to your email. Your adventure awaits.</p>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Confirmation #</p>
                                <p className="text-emerald-400 font-mono font-bold text-xl">SAFAR-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 py-6 rounded-xl"
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
