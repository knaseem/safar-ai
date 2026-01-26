"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, MapPin, Plane, User, Phone, Mail, Briefcase, Info, CheckCircle2 } from "lucide-react"
import { BookingRequest } from "@/types/booking"
import { Button } from "@/components/ui/button"

interface BookingDetailModalProps {
    booking: any // Using any to avoid strict type issues if schema differs slightly
    isOpen: boolean
    onClose: () => void
}

export function BookingDetailModal({ booking, isOpen, onClose }: BookingDetailModalProps) {
    if (!booking) return null

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
                                <p className="text-white/40 text-xs tracking-widest uppercase">Request #{booking.id.slice(0, 8)}</p>
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
                            <div className={`p-4 rounded-xl border flex items-center gap-3 ${booking.status === 'pending' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500' :
                                booking.status === 'booked' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                                    'bg-white/5 border-white/10 text-white/60'
                                }`}>
                                <Info className="size-5" />
                                <div className="text-sm">
                                    <span className="font-bold uppercase tracking-wider mr-2">{booking.status}</span>
                                    {booking.status === 'pending' ?
                                        "Our concierge team is reviewing your request. Expect a quote within 24 hours." :
                                        "Your booking is confirmed. Check your email for final documentation."
                                    }
                                </div>
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
                                                    {booking.travelers.adults} Adults, {booking.travelers.children} Children
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
                            <Button
                                onClick={onClose}
                                className="flex-1 bg-white text-black hover:bg-white/90"
                            >
                                Close View
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-white/10 text-white hover:bg-white/5"
                                onClick={() => {
                                    // Placeholder for cancellation or modification
                                    alert("To modify or cancel this request, please contact concierge@safar-ai.travel")
                                }}
                            >
                                Help & Support
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
