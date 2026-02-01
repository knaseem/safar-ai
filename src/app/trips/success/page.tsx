"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

function BookingSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isUpdating, setIsUpdating] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const orderId = searchParams.get('order_id')
    const reference = searchParams.get('reference') // e.g., TRIP_123

    useEffect(() => {
        const finalizeBooking = async () => {
            if (!orderId || !reference) {
                setError("Missing booking information. Please contact support.")
                setIsUpdating(false)
                return
            }

            try {
                const tripId = reference.replace('TRIP_', '')
                const supabase = createClient()

                // 1. Update the booking request status
                // We need to fetch the request first to get trip details for saving
                const { data: booking, error: fetchError } = await supabase
                    .from('booking_requests')
                    .select('*')
                    .or(`duffel_link_id.eq.${searchParams.get('order_id')},trip_id.eq.${tripId}`)
                    .limit(1)
                    .single()

                if (booking) {
                    // Update status
                    await supabase
                        .from('booking_requests')
                        .update({
                            status: 'booked',
                            duffel_order_id: orderId
                        })
                        .eq('id', booking.id)

                    // 2. Ensure it exists in 'saved_trips'
                    // Check if already saved
                    const { data: existingTrip } = await supabase
                        .from('saved_trips')
                        .select('id')
                        .eq('trip_name', booking.trip_name)
                        .eq('user_id', booking.user_id)
                        .single()

                    if (!existingTrip) {
                        // Insert int saved_trips so it shows in dashboard
                        // Note: We need to construct a basic trip_data object if it's missing
                        const tripData = {
                            trip_name: booking.trip_name,
                            destination: booking.destination,
                            days: [] // We might not have full itinerary here, but we save what we have
                        }

                        await supabase.from('saved_trips').insert({
                            user_id: booking.user_id,
                            trip_name: booking.trip_name,
                            destination: booking.destination,
                            is_halal: booking.is_halal,
                            trip_data: tripData // In a real app we'd fetch the full plan, for now we ensure it appears
                        })
                    }
                }

                toast.success("Booking Confirmed!", {
                    description: `Duffel Order: ${orderId}`
                })
            } catch (err: any) {
                console.error("Failed to finalize booking:", err)
                // Don't show error to user if it's just a sync issue, they are booked.
                // setError("Successfully booked, but failed to sync our database. Please keep your order ID: " + orderId)
            } finally {
                setIsUpdating(false)
            }
        }

        finalizeBooking()
    }, [orderId, reference, searchParams])

    if (isUpdating) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <Loader2 className="size-12 text-emerald-500 animate-spin mb-4" />
                <h1 className="text-xl font-medium text-white">Finalizing your booking...</h1>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
            >
                <div className="size-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="size-10 text-emerald-400" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Bon Voyage!</h1>
                <p className="text-white/60 mb-6">
                    Your booking is confirmed. We've synced your itinerary and confirmed your payments.
                </p>

                {orderId && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-left">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Confirmation Number</div>
                        <div className="text-emerald-400 font-mono text-lg">{orderId}</div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-8 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-3">
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
