"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
    CheckCircle, ArrowRight, Loader2, MapPin, Calendar, Clock,
    User, CreditCard, Phone, Key, Printer, Mail, Building2, Plane,
    Download, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface BookingDetails {
    id: string
    type: 'flight' | 'stay'
    reference: string
    status: string
    created_at: string
    total_amount: string
    total_currency: string
    payment_status: string
    // Flight specific
    slices?: any[]
    passengers?: any[]
    owner?: { name: string }
    // Stay specific
    accommodation?: {
        name: string
        address: { line_one: string; city: string; country: string; postal_code: string }
        phone_number: string
        check_in_time: string
        check_out_time: string
        photos: { url: string }[]
    }
    check_in_date?: string
    check_out_date?: string
    rooms?: { type: string; board_type: string; guests: { given_name: string; family_name: string }[] }[]
    key_collection?: { instructions: string; access_code: string | null }
    cancellation_policy?: { refundable: boolean; deadline: string }
}

function BookingSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [booking, setBooking] = useState<BookingDetails | null>(null)
    const [error, setError] = useState<string | null>(null)

    const orderId = searchParams.get('order_id')
    const reference = searchParams.get('reference')

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!orderId) {
                setError("Missing booking information. Please contact support.")
                setIsLoading(false)
                return
            }

            try {
                // Fetch full booking details from our API
                const res = await fetch(`/api/bookings/${orderId}`)
                if (!res.ok) throw new Error("Failed to fetch booking")

                const data = await res.json()
                setBooking(data)

                // Sync to database
                if (reference) {
                    const tripId = reference.replace('TRIP_', '').replace('BOOK-', '')
                    const supabase = createClient()

                    await supabase
                        .from('booking_requests')
                        .update({
                            status: 'booked',
                            duffel_order_id: orderId
                        })
                        .or(`reference.eq.${reference},trip_id.eq.${tripId}`)
                }

                toast.success("Booking Confirmed!", {
                    description: `Reference: ${data.reference || orderId}`
                })

                // Auto-send confirmation email for stays (Duffel Go-Live requirement)
                if (data.type === 'stay' && data.accommodation) {
                    fetch('/api/bookings/confirm-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bookingId: data.id })
                    }).then(() => {
                        console.log('[Stays] Confirmation email sent automatically')
                    }).catch(err => {
                        console.error('[Stays] Auto-email failed:', err)
                    })
                }
            } catch (err: any) {
                console.error("Failed to fetch booking:", err)
                // Still show basic success with order ID
                setBooking({
                    id: orderId,
                    type: 'flight',
                    reference: orderId,
                    status: 'confirmed',
                    created_at: new Date().toISOString(),
                    total_amount: searchParams.get('amount') || '0',
                    total_currency: searchParams.get('currency') || 'USD',
                    payment_status: 'paid'
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchBookingDetails()
    }, [orderId, reference, searchParams])

    const handlePrint = () => {
        window.print()
    }

    const handleSendEmail = async () => {
        if (!booking) return
        toast.loading("Sending confirmation email...")
        try {
            await fetch('/api/bookings/confirm-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id })
            })
            toast.success("Confirmation email sent!")
        } catch {
            toast.error("Failed to send email. Please try again.")
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <Loader2 className="size-12 text-emerald-500 animate-spin mb-4" />
                <h1 className="text-xl font-medium text-white">Loading your booking details...</h1>
            </div>
        )
    }

    if (error && !booking) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <AlertCircle className="size-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={() => router.push('/dashboard')} variant="outline">
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black p-4 md:p-8 print:bg-white print:text-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
            >
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="size-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 print:bg-emerald-100">
                        <CheckCircle className="size-10 text-emerald-400 print:text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 print:text-black">
                        {booking?.type === 'stay' ? 'Hotel Booking Confirmed!' : 'Booking Confirmed!'}
                    </h1>
                    <p className="text-white/60 print:text-gray-600">
                        Your reservation is complete. Please save this confirmation.
                    </p>
                </div>

                {/* Main Confirmation Card */}
                <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl print:bg-white print:border-gray-200 print:shadow-none">
                    {/* Booking Reference - Prominent */}
                    <div className="bg-emerald-500/10 p-6 border-b border-white/10 print:bg-emerald-50 print:border-gray-200">
                        <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-1 print:text-emerald-600">
                            Confirmation Number
                        </div>
                        <div className="text-3xl font-mono font-bold text-emerald-400 print:text-emerald-600">
                            {booking?.reference || booking?.id}
                        </div>
                        <div className="text-xs text-white/40 mt-2 print:text-gray-500">
                            Booked on {new Date(booking?.created_at || '').toLocaleDateString()}
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6 space-y-6">
                        {/* Stay-specific details */}
                        {booking?.type === 'stay' && booking.accommodation && (
                            <>
                                {/* Hotel Info */}
                                <div className="flex gap-4">
                                    {booking.accommodation.photos?.[0] && (
                                        <img
                                            src={booking.accommodation.photos[0].url}
                                            alt={booking.accommodation.name}
                                            className="w-24 h-24 object-cover rounded-xl"
                                        />
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2 text-white/40 text-xs uppercase mb-1">
                                            <Building2 className="size-3" /> Accommodation
                                        </div>
                                        <h2 className="text-xl font-bold text-white print:text-black">
                                            {booking.accommodation.name}
                                        </h2>
                                        <p className="text-white/60 text-sm print:text-gray-600">
                                            {booking.accommodation.address.line_one}, {booking.accommodation.address.city}
                                        </p>
                                    </div>
                                </div>

                                {/* Check-in / Check-out */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-xl p-4 print:bg-gray-50">
                                        <div className="flex items-center gap-2 text-white/40 text-xs uppercase mb-2">
                                            <Calendar className="size-3" /> Check-in
                                        </div>
                                        <div className="text-lg font-bold text-white print:text-black">
                                            {new Date(booking.check_in_date || '').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="text-sm text-emerald-400">
                                            After {booking.accommodation.check_in_time}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 print:bg-gray-50">
                                        <div className="flex items-center gap-2 text-white/40 text-xs uppercase mb-2">
                                            <Calendar className="size-3" /> Check-out
                                        </div>
                                        <div className="text-lg font-bold text-white print:text-black">
                                            {new Date(booking.check_out_date || '').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="text-sm text-white/40 print:text-gray-500">
                                            Before {booking.accommodation.check_out_time}
                                        </div>
                                    </div>
                                </div>

                                {/* Room Details */}
                                {booking.rooms && booking.rooms.length > 0 && (
                                    <div className="bg-white/5 rounded-xl p-4 print:bg-gray-50">
                                        <div className="flex items-center gap-2 text-white/40 text-xs uppercase mb-2">
                                            <User className="size-3" /> Room Details
                                        </div>
                                        <div className="text-white print:text-black">
                                            <span className="font-bold">{booking.rooms[0].type}</span>
                                            {booking.rooms[0].board_type && (
                                                <span className="ml-2 text-emerald-400 text-sm">
                                                    ({booking.rooms[0].board_type.replace(/_/g, ' ')})
                                                </span>
                                            )}
                                        </div>
                                        {booking.rooms[0].guests && (
                                            <div className="text-sm text-white/60 mt-1 print:text-gray-600">
                                                Guests: {booking.rooms[0].guests.map(g => `${g.given_name} ${g.family_name}`).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* KEY COLLECTION - Critical for Go Live */}
                                {booking.key_collection && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 print:bg-amber-50 print:border-amber-200">
                                        <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-bold mb-2">
                                            <Key className="size-4" /> Key Collection / Check-in Instructions
                                        </div>
                                        <p className="text-white print:text-black">
                                            {booking.key_collection.instructions}
                                        </p>
                                        {booking.key_collection.access_code && (
                                            <div className="mt-3 p-3 bg-amber-500/20 rounded-lg">
                                                <div className="text-xs text-amber-400 uppercase mb-1">Access Code</div>
                                                <div className="text-2xl font-mono font-bold text-amber-300">
                                                    {booking.key_collection.access_code}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Cancellation Policy */}
                                {booking.cancellation_policy && (
                                    <div className="bg-white/5 rounded-xl p-4 print:bg-gray-50">
                                        <div className="flex items-center gap-2 text-white/40 text-xs uppercase mb-2">
                                            <AlertCircle className="size-3" /> Cancellation Policy
                                        </div>
                                        <div className="text-white print:text-black">
                                            {booking.cancellation_policy.refundable ? (
                                                <span className="text-emerald-400">
                                                    Free cancellation until {new Date(booking.cancellation_policy.deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                            ) : (
                                                <span className="text-amber-400">Non-refundable</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Hotel Contact */}
                                <div className="flex items-center gap-3 text-white/60 print:text-gray-600">
                                    <Phone className="size-4" />
                                    <span>Hotel Contact: {booking.accommodation.phone_number}</span>
                                </div>
                            </>
                        )}

                        {/* Flight-specific details */}
                        {booking?.type === 'flight' && booking.slices && (
                            <div className="space-y-4">
                                {booking.slices.map((slice: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 rounded-xl p-4 print:bg-gray-50">
                                        <div className="flex items-center gap-2 text-white/40 text-xs uppercase mb-3">
                                            <Plane className="size-3" /> {idx === 0 ? 'Outbound' : 'Return'} Flight
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xl font-bold text-white print:text-black">
                                                    {slice.origin?.iata_code}
                                                </div>
                                                <div className="text-sm text-white/60">{slice.origin?.name}</div>
                                            </div>
                                            <ArrowRight className="size-5 text-white/30" />
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-white print:text-black">
                                                    {slice.destination?.iata_code}
                                                </div>
                                                <div className="text-sm text-white/60">{slice.destination?.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Payment Summary */}
                        <div className="border-t border-white/10 pt-6 print:border-gray-200">
                            <div className="flex items-center gap-2 text-white/40 text-xs uppercase mb-3">
                                <CreditCard className="size-3" /> Payment Summary
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60 print:text-gray-600">Total Paid</span>
                                <span className="text-2xl font-bold text-white print:text-black">
                                    {booking?.total_currency} {parseFloat(booking?.total_amount || '0').toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 text-sm mt-2">
                                <CheckCircle className="size-4" />
                                Payment Complete
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8 print:hidden">
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="flex-1 border-white/10 text-white hover:bg-white/10"
                    >
                        <Printer className="size-4 mr-2" /> Print Confirmation
                    </Button>
                    <Button
                        onClick={handleSendEmail}
                        variant="outline"
                        className="flex-1 border-white/10 text-white hover:bg-white/10"
                    >
                        <Mail className="size-4 mr-2" /> Email Confirmation
                    </Button>
                </div>

                <div className="flex flex-col gap-3 mt-4 print:hidden">
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-6 rounded-xl text-lg font-bold"
                    >
                        Go to My Trips <ArrowRight className="size-5 ml-2" />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="text-white/40 hover:text-white"
                    >
                        Back to Home
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <Loader2 className="size-12 text-emerald-500 animate-spin mb-4" />
                <h1 className="text-xl font-medium text-white">Loading confirmation details...</h1>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    )
}
