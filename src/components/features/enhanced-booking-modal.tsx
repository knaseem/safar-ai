"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Plane, Building2, Car, CheckCircle, Sparkles,
    ChevronRight, ChevronLeft, Shield, User, Mail, Phone,
    BedDouble, Star, Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { TravelerSelector } from '@/components/ui/traveler-selector'
import { AirportInput } from '@/components/ui/airport-input'
import { TravelerCount, BookingContactInfo } from '@/types/booking'
import { createClient } from '@/lib/supabase/client'
import { TripData } from './trip-itinerary'
import { PackingList } from './packing-list'
import { generateAffiliateLink, extractCleanCity } from '@/lib/affiliate'
import { ConciergePortal } from './concierge-portal'
import { useAuth } from '@/lib/auth-context'

interface EnhancedBookingModalProps {
    tripData: TripData
    isHalal?: boolean
    isOpen: boolean
    searchQuery?: string
    onClose: () => void
}

type BookingStep = 'details' | 'review' | 'processing' | 'success'

export function EnhancedBookingModal({ tripData, isHalal = false, isOpen, searchQuery, onClose }: EnhancedBookingModalProps) {
    const [step, setStep] = useState<BookingStep>('details')
    const [processingText, setProcessingText] = useState('Securing Flights...')
    const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
    const [showPackingList, setShowPackingList] = useState(false)
    const [portalUrl, setPortalUrl] = useState<string | null>(null)
    const [isPortalOpen, setIsPortalOpen] = useState(false)
    const [portalTitle, setPortalTitle] = useState("Secure Booking")
    const [providerName, setProviderName] = useState("Expedia")

    const { user } = useAuth()

    // Form state
    const [checkIn, setCheckIn] = useState<Date | null>(null)
    const [checkOut, setCheckOut] = useState<Date | null>(null)
    const [travelers, setTravelers] = useState<TravelerCount>({ adults: 2, children: 0, infants: 0 })
    const [departureAirport, setDepartureAirport] = useState<{ code: string; city: string } | null>(null)
    const [roomType, setRoomType] = useState<'single' | 'double' | 'suite'>('double')
    const [flightClass, setFlightClass] = useState<'economy' | 'business' | 'first'>('economy')
    const [travelInsurance, setTravelInsurance] = useState(false)
    const [specialRequests, setSpecialRequests] = useState('')
    const [seatPreference, setSeatPreference] = useState<'aisle' | 'window' | 'no-preference'>('no-preference')
    const [baggageCount, setBaggageCount] = useState<number>(1)
    const [dietaryRequirements, setDietaryRequirements] = useState<string>('')
    const [isSpecialOccasion, setIsSpecialOccasion] = useState(false)
    const [occasionType, setOccasionType] = useState('')

    // Contact info
    const [contact, setContact] = useState<BookingContactInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    })

    // Pricing & Live Data
    const [liveFlightPrice, setLiveFlightPrice] = useState<number | null>(null)
    const [destIata, setDestIata] = useState<string | null>(null)
    const [isLivePricing, setIsLivePricing] = useState(false)

    // Calculate pricing
    const nights = checkIn && checkOut
        ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : tripData.days.length

    const totalTravelers = travelers.adults + travelers.children
    const flightMultiplier = flightClass === 'economy' ? 1 : flightClass === 'business' ? 2.5 : 4
    const roomMultiplier = roomType === 'single' ? 0.8 : roomType === 'double' ? 1 : 1.8

    const baseFlightPrice = 450 * totalTravelers * flightMultiplier
    const baseHotelPrice = 180 * nights * roomMultiplier

    const insurancePrice = travelInsurance ? 89 * totalTravelers : 0
    const estimatedPrice = Math.round((liveFlightPrice || baseFlightPrice) + baseHotelPrice + insurancePrice)

    // Extract destination from trip, with search context fallback
    // Extract destination from trip data, preferring the first day's location/theme
    // This is more reliable than trip_name which might be "Anniversary Trip"
    const destinationRaw = tripData.days[0]?.theme || tripData.trip_name || searchQuery || 'Destination'
    const destination = extractCleanCity(destinationRaw)

    // Validation
    const isStep1Valid = checkIn && checkOut && departureAirport
    const isStep2Valid = contact.firstName && contact.lastName && contact.email && contact.phone

    // Pre-fill Departure from Profile
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!isOpen || !user) return
            const supabase = createClient()
            const { data: travelProfile } = await supabase
                .from('travel_profiles')
                .select('traits')
                .eq('user_id', user.id)
                .single()

            if (travelProfile) {
                const { data: lastBookings } = await supabase
                    .from('booking_requests')
                    .select('departure_city, departure_code')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)

                if (lastBookings && lastBookings.length > 0) {
                    setDepartureAirport({
                        city: lastBookings[0].departure_city,
                        code: lastBookings[0].departure_code
                    })
                }
            }
        }
        fetchProfileData()
    }, [isOpen, user])

    // Sync Destination IATA Code
    useEffect(() => {
        const resolveDest = async () => {
            if (!destination || destination === 'Destination') return
            try {
                const res = await fetch(`/api/locations/search?keyword=${encodeURIComponent(destination)}`)
                const data = await res.json()
                if (data.data && data.data.length > 0) {
                    setDestIata(data.data[0].iataCode || data.data[0].address.cityCode)
                }
            } catch (err) {
                console.error('Dest resolve error:', err)
            }
        }
        resolveDest()
    }, [destination])

    // Fetch Live Pricing on change
    useEffect(() => {
        const fetchPricing = async () => {
            if (!departureAirport || !destIata || !checkIn) return

            setIsLivePricing(true)
            try {
                const depDate = checkIn.toISOString().split('T')[0]
                const res = await fetch(`/api/flights/search?origin=${departureAirport.code}&destination=${destIata}&departureDate=${depDate}&adults=${travelers.adults}`)
                const data = await res.json()

                if (data.data && data.data.length > 0) {
                    const cheapest = data.data[0]
                    setLiveFlightPrice(parseFloat(cheapest.price.total))
                }
            } catch (err) {
                console.error('Pricing error:', err)
            } finally {
                setIsLivePricing(false)
            }
        }

        const timer = setTimeout(fetchPricing, 500)
        return () => clearTimeout(timer)
    }, [departureAirport, destIata, checkIn, travelers.adults, flightClass])

    // Processing animation
    useEffect(() => {
        if (step === 'processing') {
            const messages = [
                'Checking Availability...',
                'Finding Best Rates...',
                'Syncing with Partners...',
                'Finalizing Itinerary...'
            ]
            let i = 0
            const interval = setInterval(() => {
                i++
                if (i < messages.length) {
                    setProcessingText(messages[i])
                }
            }, 1200)

            const saveBooking = async () => {
                if (!user) return
                try {
                    const supabase = createClient()
                    await supabase.from('booking_requests').insert({
                        user_id: user.id,
                        trip_name: tripData.trip_name,
                        destination: destination,
                        is_halal: isHalal,
                        departure_city: departureAirport?.city || '',
                        departure_code: departureAirport?.code || '',
                        check_in: checkIn?.toISOString().split('T')[0],
                        check_out: checkOut?.toISOString().split('T')[0],
                        travelers,
                        room_type: roomType,
                        flight_class: flightClass,
                        contact,
                        travel_insurance: travelInsurance,
                        special_requests: specialRequests || undefined,
                        seat_preference: seatPreference,
                        baggage_count: baggageCount,
                        dietary_requirements: dietaryRequirements,
                        is_special_occasion: isSpecialOccasion,
                        occasion_type: occasionType,
                        estimated_price: estimatedPrice,
                    })
                    setConfirmationCode(`SAFAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
                } catch (error) {
                    console.error('Booking save error:', error)
                    setConfirmationCode(`SAFAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
                }
            }

            saveBooking()

            const timeout = setTimeout(() => {
                clearInterval(interval)
                setStep('success')
            }, 4800)

            return () => {
                clearInterval(interval)
                clearTimeout(timeout)
            }
        }
    }, [step, user, tripData, destination, isHalal, departureAirport, checkIn, checkOut, travelers, roomType, flightClass, contact, travelInsurance, specialRequests, estimatedPrice])

    const handleClose = () => {
        setStep('details')
        onClose()
    }

    const handleBack = () => {
        if (step === 'review') setStep('details')
    }

    const handleNext = () => {
        if (step === 'details' && isStep1Valid) setStep('review')
        if (step === 'review' && isStep2Valid) setStep('processing')
    }

    if (!isOpen) return null

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-4 max-h-[92vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X className="size-4 text-white" />
                        </button>

                        {/* Progress Indicator */}
                        {(step === 'details' || step === 'review') && (
                            <div className="flex items-center gap-2 px-8 pt-6">
                                <div className={`flex-1 h-1 rounded-full ${step === 'details' || step === 'review' ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                <div className={`flex-1 h-1 rounded-full ${step === 'review' ? 'bg-emerald-500' : 'bg-white/10'}`} />
                            </div>
                        )}

                        {/* Step 1: Trip Details */}
                        {step === 'details' && (
                            <div className="flex-1 overflow-y-auto p-8 pt-6 CustomScrollbar">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="size-5 text-emerald-400" />
                                    <span className="text-xs text-emerald-400 uppercase tracking-wider font-medium">Step 1 of 2</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">Book Your Trip</h2>
                                <p className="text-white/50 text-sm mb-6">{tripData.trip_name}</p>

                                {/* Halal Badge */}
                                {isHalal && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium mb-6 border border-emerald-500/30">
                                        <CheckCircle className="size-3" />
                                        Halal Trip
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <DateRangePicker
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        onDateChange={(ci, co) => { setCheckIn(ci); setCheckOut(co) }}
                                    />

                                    <TravelerSelector
                                        travelers={travelers}
                                        onChange={setTravelers}
                                    />

                                    <AirportInput
                                        value={departureAirport}
                                        onChange={setDepartureAirport}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Room Type</label>
                                            <div className="flex gap-2">
                                                {(['single', 'double', 'suite'] as const).map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setRoomType(type)}
                                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${roomType === type
                                                            ? 'bg-emerald-500 text-black'
                                                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Flight Class</label>
                                            <div className="flex gap-2">
                                                {(['economy', 'business', 'first'] as const).map((cls) => (
                                                    <button
                                                        key={cls}
                                                        type="button"
                                                        onClick={() => setFlightClass(cls)}
                                                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${flightClass === cls
                                                            ? 'bg-emerald-500 text-black'
                                                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {cls.charAt(0).toUpperCase() + cls.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Preferences */}
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">Seat Preference</label>
                                                <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
                                                    {(['aisle', 'window', 'no-preference'] as const).map((pref) => (
                                                        <button
                                                            key={pref}
                                                            type="button"
                                                            onClick={() => setSeatPreference(pref)}
                                                            className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-bold uppercase transition-all ${seatPreference === pref
                                                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                                                : 'text-white/40 hover:text-white'
                                                                }`}
                                                        >
                                                            {pref.split('-')[0]}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">Checked Bags</label>
                                                <div className="flex items-center justify-between bg-black/40 p-1 rounded-lg">
                                                    <button onClick={() => setBaggageCount(Math.max(0, baggageCount - 1))} className="size-8 rounded-md hover:bg-white/10 text-white/60">-</button>
                                                    <span className="text-sm font-bold text-white">{baggageCount}</span>
                                                    <button onClick={() => setBaggageCount(baggageCount + 1)} className="size-8 rounded-md hover:bg-white/10 text-white/60">+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">Dietary Requirements</label>
                                            <input
                                                type="text"
                                                value={dietaryRequirements}
                                                onChange={(e) => setDietaryRequirements(e.target.value)}
                                                placeholder={isHalal ? "Already marked as Halal. Any others?" : "e.g. Vegan, Nut Allergy..."}
                                                className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/30"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-8 rounded-lg flex items-center justify-center transition-colors ${isSpecialOccasion ? 'bg-pink-500/20 text-pink-400' : 'bg-white/5 text-white/20'}`}>
                                                    <Sparkles className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">Special Occasion?</div>
                                                    {isSpecialOccasion && (
                                                        <input
                                                            type="text"
                                                            value={occasionType}
                                                            onChange={(e) => setOccasionType(e.target.value)}
                                                            placeholder="Anniversary, Birthday..."
                                                            className="mt-1 bg-transparent border-0 border-b border-pink-500/30 outline-none text-pink-400 text-xs py-0 w-32 placeholder:text-pink-500/20"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsSpecialOccasion(!isSpecialOccasion)}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${isSpecialOccasion ? 'bg-pink-500' : 'bg-white/20'}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isSpecialOccasion ? 'left-5.5' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleNext}
                                    disabled={!isStep1Valid}
                                    className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-6 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed sticky bottom-0 z-10"
                                >
                                    Continue <ChevronRight className="size-5 ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Review & Confirm */}
                        {step === 'review' && (
                            <div className="flex-1 overflow-y-auto p-8 pt-6 CustomScrollbar">
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1 text-white/50 hover:text-white text-sm mb-4 transition-colors"
                                >
                                    <ChevronLeft className="size-4" />
                                    Back
                                </button>
                                <h2 className="text-2xl font-bold text-white mb-6">Review & Confirm</h2>

                                <div className="space-y-4 mb-8">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-4">{tripData.trip_name}</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-white/70">
                                                <span className="flex items-center gap-2"><Plane className="size-4" /> Flight</span>
                                                <span className="text-white">{departureAirport?.city} → {destination}</span>
                                            </div>
                                            <div className="flex justify-between text-white/70">
                                                <span className="flex items-center gap-2"><BedDouble className="size-4" /> Hotel</span>
                                                <span className="text-white">{nights} nights • {roomType}</span>
                                            </div>
                                            <div className="flex justify-between text-white/70">
                                                <span className="flex items-center gap-2"><Star className="size-4" /> Class</span>
                                                <span className="text-white capitalize">{flightClass}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-white/50 block mb-1">First Name</label>
                                            <input
                                                type="text"
                                                value={contact.firstName}
                                                onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-white/50 block mb-1">Last Name</label>
                                            <input
                                                type="text"
                                                value={contact.lastName}
                                                onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 block mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={contact.email}
                                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 block mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={contact.phone}
                                            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleNext}
                                    disabled={!isStep2Valid}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-6 rounded-xl text-lg sticky bottom-0 z-10"
                                >
                                    Confirm Booking • ${estimatedPrice.toLocaleString()}
                                </Button>
                            </div>
                        )}

                        {/* Step 3: Processing */}
                        {step === 'processing' && (
                            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                <div className="relative size-20 mb-8">
                                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                                    <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin" />
                                    <Sparkles className="absolute inset-0 m-auto size-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{processingText}</h3>
                                <p className="text-white/40 text-sm italic">Almost there, securing your paradise...</p>
                            </div>
                        )}

                        {/* Step 4: Success */}
                        {step === 'success' && (
                            <div className="flex-1 overflow-y-auto p-8 text-center scrollbar-hide">
                                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="size-10 text-emerald-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Booking Reserved!</h2>
                                <p className="text-white/60 mb-8 max-w-md mx-auto">Your itinerary is synced. Complete your payment with our partners to finalize.</p>

                                <div className="space-y-4 mb-8">
                                    <button
                                        onClick={async () => {
                                            // Create a Duffel Link Session for a unified checkout
                                            try {
                                                const res = await fetch('/api/bookings/duffel/link', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        tripId: (tripData as any).id || null,
                                                        userId: user?.id || null
                                                    })
                                                });
                                                const json = await res.json();
                                                if (json.data?.url) {
                                                    setPortalUrl(json.data.url);
                                                    setPortalTitle("Secure Unified Checkout");
                                                    setProviderName("Duffel");
                                                    setIsPortalOpen(true);
                                                    return;
                                                }
                                            } catch (err) {
                                                console.error("Duffel session failed, falling back to affiliate", err);
                                            }

                                            // Fallback to affiliate
                                            const url = generateAffiliateLink('flight', {
                                                origin: departureAirport?.code || 'any',
                                                destination: extractCleanCity(destination),
                                                checkIn: checkIn?.toISOString().split('T')[0]
                                            })
                                            setPortalUrl(url)
                                            setPortalTitle("Flight Secure Booking")
                                            setProviderName("Expedia")
                                            setIsPortalOpen(true)
                                        }}
                                        className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 transition-all hover:scale-[1.01] shadow-xl shadow-blue-500/20"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-30"><Sparkles className="size-6 text-white" /></div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-left">
                                                <div className="text-xl font-black text-white mb-1 uppercase tracking-tight">Finalize & Pay Securely</div>
                                                <div className="text-white/60 text-xs">Complete your entire trip booking in one step</div>
                                            </div>
                                            <Plane className="size-8 text-white group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                const url = generateAffiliateLink('hotel', {
                                                    name: extractCleanCity(destination),
                                                    destination: extractCleanCity(destination),
                                                    checkIn: checkIn?.toISOString().split('T')[0],
                                                    checkOut: checkOut?.toISOString().split('T')[0]
                                                })
                                                setPortalUrl(url)
                                                setPortalTitle("Hotel Secure Booking")
                                                setProviderName("Expedia")
                                                setIsPortalOpen(true)
                                            }}
                                            className="group flex flex-col items-center justify-center rounded-xl bg-white/5 border border-white/10 p-4 transition-all hover:bg-white/10"
                                        >
                                            <Building2 className="size-5 text-white/60 mb-2" />
                                            <div className="text-sm font-medium text-white">Book Hotel</div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                const url = generateAffiliateLink('activity', {
                                                    destination: extractCleanCity(destination),
                                                    checkIn: checkIn?.toISOString().split('T')[0],
                                                    checkOut: checkOut?.toISOString().split('T')[0],
                                                    name: `Things to do in ${extractCleanCity(destination)}`
                                                })
                                                setPortalUrl(url)
                                                setPortalTitle("Activity Secure Booking")
                                                setProviderName("Expedia")
                                                setIsPortalOpen(true)
                                            }}
                                            className="group flex flex-col items-center justify-center rounded-xl bg-white/5 border border-white/10 p-4 transition-all hover:bg-white/10"
                                        >
                                            <Star className="size-5 text-white/60 mb-2" />
                                            <div className="text-sm font-medium text-white">Book Activities</div>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-center gap-4 sticky bottom-0 bg-neutral-900 py-4 border-t border-white/5">
                                    <button onClick={handleClose} className="text-sm text-white/40 hover:text-white transition-colors">Close</button>
                                    <Button variant="outline" onClick={() => window.location.href = '/profile'} className="border-emerald-500/20 text-emerald-400">View in Profile</Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            <ConciergePortal
                isOpen={isPortalOpen}
                url={portalUrl}
                onClose={() => setIsPortalOpen(false)}
                title={portalTitle}
                providerName={providerName}
            />
        </>
    )
}
