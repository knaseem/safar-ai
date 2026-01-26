"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, MapPin, Plane, User, Phone, Mail, Briefcase, Info, CheckCircle2, Loader2, Sparkles, ExternalLink } from "lucide-react"
import { BookingRequest } from "@/types/booking"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface BookingDetailModalProps {
    booking: any
    isOpen: boolean
    onClose: () => void
    onBookingUpdate?: (booking: any) => void
}

export function BookingDetailModal({ booking, isOpen, onClose, onBookingUpdate }: BookingDetailModalProps) {
    const [isConfirming, setIsConfirming] = useState(false)

    if (!booking) return null

    const handleConfirm = async () => {
        setIsConfirming(true)
        try {
            const res = await fetch('/api/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: booking.id, status: 'booked' })
            })

            if (res.ok) {
                const data = await res.json()
                toast.success("Booking Confirmed!", {
                    description: "Your Travel HUD is now active."
                })
                onBookingUpdate?.(data.booking)
            } else {
                throw new Error("Failed to update status")
            }
        } catch (error) {
            toast.error("Error confirming booking")
        } finally {
            setIsConfirming(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-transparent">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">{booking.trip_name || booking.destination}</h3>
                                <p className="text-white/40 text-xs tracking-widest uppercase">Request #{booking.id?.slice(0, 8)}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-xl border flex flex-col gap-3 ${booking.status === 'pending' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500' :
                                    booking.status === 'booked' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                                        'bg-white/5 border-white/10 text-white/60'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {booking.status === 'booked' ? <CheckCircle2 className="size-5" /> : <Info className="size-5" />}
                                    <div className="text-sm">
                                        <span className="font-bold uppercase tracking-wider mr-2">{booking.status}</span>
                                        {booking.status === 'booked' ?
                                            "Your booking is confirmed! Your Travel HUD and countdown are now live." :
                                            "Awaiting final booking confirmation from your end."
                                        }
                                    </div>
                                </div>

                                {booking.status === 'pending' && (
                                    <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Next Steps</p>
                                        <div className="grid gap-2 text-[11px] text-white/60">
                                            <div className="flex gap-2">
                                                <div className="size-4 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">1</div>
                                                <p>Click the affiliate links in your itinerary to complete your booking on the provider's site.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="size-4 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">2</div>
                                                <p>Once you have your confirmation from them, return here.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="size-4 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">3</div>
                                                <p>Click "Confirm My Booking" below to activate your premium SafarAI features.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Travel Details */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white/20 uppercase tracking-[0.2em]">Travel Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-white/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <Plane className="size-4 text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase">Departure From</p>
                                                <p className="text-sm font-medium">{booking.departure_city} ({booking.departure_code})</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-white/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <Calendar className="size-4 text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase">Dates</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-white/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <Briefcase className="size-4 text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase">Travel Class</p>
                                                <p className="text-sm font-medium capitalize">{booking.flight_class} Class</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preferences & Travelers */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white/20 uppercase tracking-[0.2em]">Preferences</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-white/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <User className="size-4 text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase">Travelers</p>
                                                <p className="text-sm font-medium">
                                                    {booking.travelers?.adults} Adults, {booking.travelers?.children} Children
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-white/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <CheckCircle2 className="size-4 text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase">Room Type</p>
                                                <p className="text-sm font-medium capitalize">{booking.room_type}</p>
                                            </div>
                                        </div>
                                        {booking.travel_insurance && (
                                            <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
                                                <CheckCircle2 className="size-4" />
                                                <p className="text-sm font-medium">Travel Insurance Included</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white/20 uppercase tracking-[0.2em]">Contact Information</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-white/60">
                                        <Mail className="size-4" />
                                        <span className="text-sm">{booking.contact_email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/60">
                                        <Phone className="size-4" />
                                        <span className="text-sm">{booking.contact_phone}</span>
                                    </div>
                                </div>
                            </div>

                            {booking.special_requests && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white/20 uppercase tracking-[0.2em]">Special Requests</h4>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 italic text-white/60 text-sm">
                                        "{booking.special_requests}"
                                    </div>
                                </div>
                            )}

                            {/* Estimated Pricing Only if Pending */}
                            <div className="bg-neutral-800 p-6 rounded-2xl flex justify-between items-center border border-white/5">
                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Estimated Budget</p>
                                    <p className="text-3xl font-bold text-white">${booking.estimated_price?.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-1 font-bold">Verified Pricing</p>
                                    <p className="text-white/40 text-xs">AI-Optimized Rate</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
                            {booking.status === 'pending' ? (
                                <>
                                    <Button
                                        onClick={onClose}
                                        variant="outline"
                                        className="flex-1 border-white/10 text-white hover:bg-white/5"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={isConfirming}
                                        className="flex-[2] bg-emerald-500 text-black hover:bg-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                                    >
                                        {isConfirming ? (
                                            <Loader2 className="size-4 animate-spin mr-2" />
                                        ) : (
                                            <Sparkles className="size-4 mr-2" />
                                        )}
                                        Confirm My Booking
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={onClose}
                                    className="w-full bg-white text-black hover:bg-white/90"
                                >
                                    Close View
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
