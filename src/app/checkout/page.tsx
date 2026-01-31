"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plane, Calendar, Clock, Users, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckoutForm } from "@/components/features/checkout-form"
import { PolicyDisplay } from "@/components/features/policy-display"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Offer {
    id: string
    total_amount: string
    total_currency: string
    base_amount?: string
    owner: { name: string }
    slices: Array<{
        origin: { iata_code: string; name: string }
        destination: { iata_code: string; name: string }
        departure_date: string
        duration: string
        segments: Array<{
            operating_carrier: { name: string }
            operating_carrier_flight_number: string
            departure: { at: string }
            arrival: { at: string }
        }>
    }>
    passengers: Array<{ type: string }>
    conditions?: {
        refund_before_departure?: {
            allowed: boolean
            penalty_amount?: string
            penalty_currency?: string
        }
        change_before_departure?: {
            allowed: boolean
            penalty_amount?: string
            penalty_currency?: string
        }
    }
    expires_at: string
}

// Loading fallback for Suspense
function CheckoutLoading() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="size-12 text-emerald-500 animate-spin mx-auto mb-4" />
                <p className="text-white/60">Loading checkout...</p>
            </div>
        </div>
    )
}

// Main page wrapper with Suspense
export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutLoading />}>
            <CheckoutContent />
        </Suspense>
    )
}

function CheckoutContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()

    const offerId = searchParams.get("offer_id")
    const offerType = searchParams.get("type") || "flight" // flight or stay

    const [offer, setOffer] = useState<Offer | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [bookingComplete, setBookingComplete] = useState(false)
    const [orderDetails, setOrderDetails] = useState<any>(null)

    // Fetch offer details
    useEffect(() => {
        async function fetchOffer() {
            if (!offerId) {
                setError("No offer selected")
                setLoading(false)
                return
            }

            // Handle mock/test offers
            if (offerId.startsWith('mock_')) {
                const isHotel = offerType === 'stay' || offerId === 'mock_hotel_offer'
                setOffer({
                    id: offerId,
                    total_amount: isHotel ? "1250.00" : "850.00",
                    total_currency: "USD",
                    base_amount: isHotel ? "1000.00" : "750.00",
                    owner: { name: isHotel ? "Duffel Stays" : "Duffel Air" },
                    slices: [{
                        origin: { iata_code: isHotel ? "HOTEL" : "JFK", name: isHotel ? "Hotel Booking" : "New York" },
                        destination: { iata_code: isHotel ? "STAY" : "LHR", name: isHotel ? "Hotel Stay" : "London" },
                        departure_date: new Date().toISOString().split('T')[0],
                        duration: "PT7H",
                        segments: [{
                            operating_carrier: { name: isHotel ? "Grand Hyatt" : "British Airways" },
                            operating_carrier_flight_number: isHotel ? "" : "BA112",
                            departure: { at: new Date().toISOString() },
                            arrival: { at: new Date().toISOString() }
                        }]
                    }],
                    passengers: [{ type: "adult" }],
                    conditions: {},
                    expires_at: new Date(Date.now() + 3600000).toISOString()
                })
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/offers/${offerId}`)
                if (!response.ok) throw new Error("Failed to load offer")

                const data = await response.json()
                setOffer(data)
            } catch (err) {
                console.error("Error fetching offer:", err)
                setError("Failed to load booking details")
            } finally {
                setLoading(false)
            }
        }

        fetchOffer()
    }, [offerId, offerType])

    // Calculate markup
    const baseAmount = offer?.base_amount ? parseFloat(offer.base_amount) : 0
    const totalAmount = offer?.total_amount ? parseFloat(offer.total_amount) : 0
    const markupAmount = totalAmount - baseAmount
    const currency = offer?.total_currency || "USD"

    // Handle form submission
    const handleSubmit = async (passengers: any[]) => {
        if (!offer || !user) return

        setSubmitting(true)
        try {
            // Extract offer details for email
            const firstSlice = offer.slices?.[0]
            const firstSegment = firstSlice?.segments?.[0]
            const offerDetails = offerType === "flight" ? {
                origin: firstSlice?.origin?.iata_code,
                destination: firstSlice?.destination?.iata_code,
                departureDate: firstSlice?.departure_date,
                airline: firstSegment?.operating_carrier?.name,
            } : {
                hotelName: firstSegment?.operating_carrier?.name, // Using carrier name field for hotel name in mock
                checkIn: firstSlice?.departure_date,
            }

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    offerId: offer.id,
                    passengers,
                    totalAmount: offer.total_amount,
                    currency: offer.total_currency,
                    type: offerType,
                    offerDetails,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Booking failed")
            }

            const order = await response.json()
            setOrderDetails(order)
            setBookingComplete(true)
            toast.success("Booking confirmed!", {
                description: `Confirmation: ${order.booking_reference}`,
            })
        } catch (err: any) {
            console.error("Booking error:", err)
            toast.error("Booking failed", { description: err.message })
        } finally {
            setSubmitting(false)
        }
    }

    // Extraction of user details for pre-fill
    const userData = user ? {
        email: user.email,
        firstName: user.user_metadata?.full_name?.split(' ')[0],
        lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
    } : undefined

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="size-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading booking details...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error || !offer) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="size-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Booking Error</h1>
                    <p className="text-white/60 mb-6">{error || "Unable to load offer"}</p>
                    <Button onClick={() => router.push("/dashboard")} variant="outline">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    // Success state
    if (bookingComplete && orderDetails) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md bg-white/5 border border-white/10 rounded-2xl p-8"
                >
                    <div className="size-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="size-10 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h1>
                    <p className="text-white/60 mb-4">Your trip has been booked successfully</p>

                    <div className="bg-black/30 rounded-xl p-4 mb-6">
                        <p className="text-sm text-white/40 mb-1">Confirmation Code</p>
                        <p className="text-2xl font-mono font-bold text-emerald-400">
                            {orderDetails.booking_reference}
                        </p>
                    </div>

                    <p className="text-sm text-white/40 mb-6">
                        A confirmation email has been sent to your registered email address.
                    </p>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => router.push(`/trips/${orderDetails.id}`)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        >
                            View Booking
                        </Button>
                        <Button
                            onClick={() => router.push("/profile")}
                            variant="outline"
                            className="flex-1"
                        >
                            My Trips
                        </Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Main checkout UI
    const firstSlice = offer.slices[0]
    const firstSegment = firstSlice?.segments?.[0]
    const passengerCount = offer.passengers.length

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Back to search
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Complete Your Booking</h1>
                            <p className="text-white/60">Enter traveler details to finalize your reservation</p>
                        </div>

                        {/* Auth check */}
                        {!user && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                                <AlertCircle className="size-5 text-amber-500 flex-shrink-0" />
                                <div>
                                    <p className="text-amber-300 font-medium">Sign in required</p>
                                    <p className="text-amber-300/70 text-sm">Please sign in to complete your booking</p>
                                </div>
                            </div>
                        )}

                        {/* Traveler Form */}
                        <CheckoutForm
                            passengerCount={passengerCount}
                            onSubmit={handleSubmit}
                            disabled={!user || submitting}
                            submitting={submitting}
                            initialData={userData}
                        />

                        {/* Policy Display */}
                        <PolicyDisplay conditions={offer.conditions} />
                    </div>

                    {/* Right: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-white mb-4">Booking Summary</h2>

                            {/* Flight/Stay Card */}
                            <div className="bg-black/30 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="size-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                        <Plane className="size-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">
                                            {firstSlice?.origin?.iata_code} → {firstSlice?.destination?.iata_code}
                                        </p>
                                        <p className="text-sm text-white/60">{firstSegment?.operating_carrier?.name}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <Calendar className="size-4" />
                                        <span>{firstSlice?.departure_date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/60">
                                        <Clock className="size-4" />
                                        <span>{firstSlice?.duration?.replace("PT", "").toLowerCase()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/60">
                                        <Users className="size-4" />
                                        <span>{passengerCount} passenger{passengerCount > 1 ? "s" : ""}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-4">
                                {baseAmount > 0 && (
                                    <div className="flex justify-between text-white/60">
                                        <span>Base fare</span>
                                        <span>${baseAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {markupAmount > 0 && (
                                    <div className="flex justify-between text-white/60">
                                        <span>Service fee</span>
                                        <span>${markupAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-white/10 pt-3 flex justify-between text-white font-semibold">
                                    <span>Total</span>
                                    <span className="text-emerald-400 text-xl">
                                        ${totalAmount.toFixed(2)} {currency}
                                    </span>
                                </div>
                            </div>

                            {/* Expiry Warning */}
                            {offer.expires_at && (
                                <div className="text-xs text-amber-400/70 text-center">
                                    ⏳ Price valid for limited time
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
