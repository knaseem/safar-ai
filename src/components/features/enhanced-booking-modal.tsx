"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Plane, Building2, Car, CheckCircle, Sparkles,
    ChevronRight, ChevronLeft, Shield, User, Mail, Phone,
    BedDouble, Star, Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from "sonner"
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
    const [searchError, setSearchError] = useState<string | null>(null)
    const [showPackingList, setShowPackingList] = useState(false)
    const [portalUrl, setPortalUrl] = useState<string | null>(null)
    const [isPortalOpen, setIsPortalOpen] = useState(false)
    const [portalTitle, setPortalTitle] = useState("Secure Booking")
    const [providerName, setProviderName] = useState("Expedia")

    const { user } = useAuth()

    // Form state
    const [bookingType, setBookingType] = useState<'all' | 'flight' | 'hotel'>('all')
    const [budget, setBudget] = useState('')
    const [checkIn, setCheckIn] = useState<Date | null>(null)
    const [checkOut, setCheckOut] = useState<Date | null>(null)
    const [travelers, setTravelers] = useState<TravelerCount>({ adults: 2, children: 0, infants: 0 })
    const [departureAirport, setDepartureAirport] = useState<{ code: string; city: string } | null>(null)
    const [roomType, setRoomType] = useState<'single' | 'double' | 'suite'>('double')
    const [hotelClass, setHotelClass] = useState<'standard' | 'comfort' | 'luxury'>('comfort')
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
    const [flightDetails, setFlightDetails] = useState<{ airline: string; duration: string; flightNumber: string } | null>(null)
    const [offerId, setOfferId] = useState<string | null>(null)
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

    // Extract destination from trip data
    // Priority: searchQuery > trip_name (often contains city like "Barcelona Explorer") > days location
    // Avoid using theme as it contains activity names like "Gaudí's Grand Designs"
    const destinationRaw = searchQuery || tripData.trip_name || tripData.days[0]?.stay || 'Destination'
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
                } else {
                    // Fallback for common major cities if API fails
                    const commonMap: Record<string, string> = {
                        'new york': 'NYC', 'london': 'LON', 'paris': 'PAR', 'dubai': 'DXB', 'tokyo': 'TYO',
                        'singapore': 'SIN', 'los angeles': 'LAX', 'san francisco': 'SFO', 'miami': 'MIA'
                    }
                    const lowerDest = destination.toLowerCase()
                    if (commonMap[lowerDest]) setDestIata(commonMap[lowerDest])
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
                    setOfferId(cheapest.id)

                    // Extract flight details
                    const firstSegment = cheapest.itineraries?.[0]?.segments?.[0]
                    const duration = cheapest.itineraries?.[0]?.duration
                    if (firstSegment) {
                        setFlightDetails({
                            airline: firstSegment.carrierCode, // We might need a map for full names, using code for now
                            duration: duration,
                            flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`
                        })
                    }
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

    // Processing animation with REAL Check
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

            // Save booking (internal DB) regardless of flight search (it's a "Request")
            const saveBooking = async () => {
                if (!user) return
                try {
                    const supabase = createClient()
                    await supabase.from('booking_requests').insert({
                        // ... existing fields ...
                        user_id: user.id,
                        trip_name: tripData.trip_name,
                        destination: destination,
                        is_halal: isHalal,
                        departure_city: departureAirport?.city || '',
                        departure_code: departureAirport?.code || '',
                        check_in: checkIn?.toISOString().split('T')[0],
                        check_out: checkOut?.toISOString().split('T')[0],
                        travelers,
                        estimated_price: estimatedPrice,
                        booking_type: bookingType,
                    })
                } catch (error) {
                    console.error('Booking save error:', error)
                }
                setConfirmationCode(`SAFAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
            }

            saveBooking()

            const timeout = setTimeout(() => {
                clearInterval(interval)

                // CRITICAL CHECK: Did we actually find a flight?
                if (bookingType !== 'hotel' && !offerId) {
                    // Search failed or returned no results
                    setSearchError("We couldn't significantly confirm a flight for these dates in the Sandbox. Please try different dates.")
                    setStep('details') // Go back to let them fix it
                    toast.error("Flight Unavailability", { description: "No flight offers returned from the live system." })
                } else {
                    setStep('success')
                }
            }, 4800)

            return () => {
                clearInterval(interval)
                clearTimeout(timeout)
            }
        }
    }, [step, user, tripData, destination, isHalal, departureAirport, checkIn, checkOut, travelers, roomType, flightClass, contact, travelInsurance, specialRequests, estimatedPrice, offerId, bookingType])

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

                                {searchError && (
                                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-start gap-2">
                                        <div className="mt-0.5"><Shield className="size-4" /></div>
                                        <div>
                                            <p className="font-bold">Live Booking Error</p>
                                            <p>{searchError}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Halal Badge */}
                                {isHalal && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium mb-6 border border-emerald-500/30">
                                        <CheckCircle className="size-3" />
                                        Halal Trip
                                    </div>
                                )}

                                {/* Booking Type Selector */}
                                <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                                    {(['all', 'flight', 'hotel'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setBookingType(type)}
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${bookingType === type
                                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                                : 'text-white/40 hover:text-white'
                                                }`}
                                        >
                                            {type === 'all' ? 'Flight + Hotel' : type === 'flight' ? 'Flight Only' : 'Hotel Only'}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <DateRangePicker
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        onDateChange={(ci, co) => { setCheckIn(ci); setCheckOut(co) }}
                                        fromLabel={bookingType === 'hotel' ? "Check-In" : "Depart"}
                                        toLabel={bookingType === 'hotel' ? "Check-Out" : "Return"}
                                    />

                                    <TravelerSelector
                                        travelers={travelers}
                                        onChange={setTravelers}
                                    />

                                    {bookingType !== 'hotel' && (
                                        <AirportInput
                                            value={departureAirport}
                                            onChange={setDepartureAirport}
                                        />
                                    )}

                                    {/* Budget Input */}
                                    <div>
                                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Total Budget (Optional)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                            <input
                                                type="text"
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                placeholder="e.g. 5000"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {bookingType !== 'flight' && (
                                            <>
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
                                                    <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Hotel Class</label>
                                                    <div className="flex gap-2">
                                                        {(['standard', 'comfort', 'luxury'] as const).map((cls) => (
                                                            <button
                                                                key={cls}
                                                                type="button"
                                                                onClick={() => setHotelClass(cls)}
                                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${hotelClass === cls
                                                                    ? 'bg-emerald-500 text-black'
                                                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                {cls.charAt(0).toUpperCase() + cls.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {bookingType !== 'hotel' && (
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
                                        )}
                                    </div>

                                    {/* Advanced Preferences */}
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            {bookingType !== 'hotel' && (
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
                                            )}
                                            {bookingType !== 'hotel' && (
                                                <div>
                                                    <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">Checked Bags</label>
                                                    <div className="flex items-center justify-between bg-black/40 p-1 rounded-lg">
                                                        <button onClick={() => setBaggageCount(Math.max(0, baggageCount - 1))} className="size-8 rounded-md hover:bg-white/10 text-white/60">-</button>
                                                        <span className="text-sm font-bold text-white">{baggageCount}</span>
                                                        <button onClick={() => setBaggageCount(baggageCount + 1)} className="size-8 rounded-md hover:bg-white/10 text-white/60">+</button>
                                                    </div>
                                                </div>
                                            )}
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
                                            {bookingType !== 'hotel' && (
                                                <div className="flex justify-between text-white/70">
                                                    <span className="flex items-center gap-2"><Plane className="size-4" /> Flight</span>
                                                    <span className="text-white capitalize">{departureAirport?.city} → {destination}</span>
                                                </div>
                                            )}
                                            {bookingType !== 'flight' && (
                                                <div className="flex justify-between text-white/70">
                                                    <span className="flex items-center gap-2"><BedDouble className="size-4" /> Hotel</span>
                                                    <span className="text-white">{nights} nights • {roomType}</span>
                                                </div>
                                            )}
                                            {bookingType !== 'hotel' && (
                                                <div className="flex justify-between text-white/70">
                                                    <span className="flex items-center gap-2"><Star className="size-4" /> Class</span>
                                                    <span className="text-white capitalize">{flightClass}</span>
                                                </div>
                                            )}
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
                                    Proceed & Get Final Price • Est. ${estimatedPrice.toLocaleString()}
                                    <span className="block text-[10px] font-normal opacity-80">This is an estimate. Final price calculated at checkout.</span>
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
                                            // Redirect to internal checkout for Flights & Hotels
                                            try {
                                                // Create search params for checkout
                                                const params = new URLSearchParams()

                                                // Basic params
                                                // if (tripData.days[0]?.theme) params.set('offer_id', 'mock_offer_layout')

                                                // usage: if we have a real ID (from Duffel search), use it.
                                                // Otherwise fallback to dynamic mock ID
                                                if (offerId && !offerId.startsWith('mock_')) {
                                                    params.set('offer_id', offerId)
                                                } else {
                                                    toast.error("No valid flight offer found for this itinerary.")
                                                    return
                                                }

                                                params.set('type', bookingType === 'hotel' ? 'stay' : 'flight')

                                                // Pass dynamic details
                                                if (departureAirport) {
                                                    params.set('origin', departureAirport.code)
                                                    params.set('originCity', departureAirport.city)
                                                }

                                                if (travelers.adults) {
                                                    params.set('adults', travelers.adults.toString())
                                                }

                                                if (destIata) {
                                                    params.set('destination', destIata)
                                                } else if (destination) {
                                                    // Try one more fallback map check before giving up
                                                    const commonMap: Record<string, string> = {
                                                        'new york': 'NYC', 'london': 'LON', 'paris': 'PAR', 'dubai': 'DXB', 'tokyo': 'TYO',
                                                        'singapore': 'SIN', 'los angeles': 'LAX', 'san francisco': 'SFO', 'miami': 'MIA'
                                                    }
                                                    const cleanDest = destination.trim().toLowerCase()
                                                    const code = commonMap[cleanDest]

                                                    // DEBUG PROBIING
                                                    console.log(`[Checkout Debug] Dest: ${destination}, Clean: ${cleanDest}, IATA: ${destIata || code}`)

                                                    if (code) {
                                                        params.set('destination', code)
                                                    } else {
                                                        // Last resort: Use 3 chars but warn it might be wrong. 
                                                        // Better to send nothing than wrong code? 
                                                        // Sending nothing ensures at least Origin/Date triggers, 
                                                        // but route code requires ALL to carry over.
                                                        // Let's send substring but logging it.
                                                        console.log("Using raw substring for dest:", destination)
                                                        params.set('destination', destination.substring(0, 3).toUpperCase())
                                                    }
                                                }

                                                if (destination) params.set('destinationCity', destination)

                                                if (checkIn) params.set('date', checkIn.toISOString().split('T')[0])

                                                // Pass price and flight details if available
                                                if (liveFlightPrice) {
                                                    params.set('price', liveFlightPrice.toString())
                                                } else if (estimatedPrice) {
                                                    params.set('price', estimatedPrice.toString())
                                                }

                                                if (flightDetails) {
                                                    params.set('airline', flightDetails.airline)
                                                    params.set('duration', flightDetails.duration)
                                                    params.set('flightNumber', flightDetails.flightNumber)
                                                } else {
                                                    // Fallbacks if flight details (pricing API) didn't return
                                                    params.set('airline', 'Safar Airways')
                                                    params.set('duration', 'PT6H') // Generic duration
                                                    params.set('flightNumber', 'SA101')
                                                }

                                                // FINAL VALIDATION CHECK
                                                const hasOrigin = params.get('origin')
                                                const hasDest = params.get('destination')
                                                const hasDate = params.get('date')

                                                if (!hasOrigin || !hasDest || !hasDate) {
                                                    const missing = []
                                                    if (!hasOrigin) missing.push('Origin (Airport)')
                                                    if (!hasDest) missing.push('Destination (City)')
                                                    if (!hasDate) missing.push('Date')

                                                    toast.error(`Missing Checkout Data: ${missing.join(', ')}`)
                                                    // console.error("Missing params:", {hasOrigin, hasDest, hasDate})
                                                    return // Stop redirect
                                                }

                                                window.location.href = `/checkout?${params.toString()}`
                                            } catch (err) {
                                                console.error('Checkout redirect error:', err)
                                                toast.error("Failed to start checkout. Please try again.")
                                            }
                                        }}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-6 rounded-xl flex items-center justify-between px-6 transition-all shadow-lg shadow-blue-900/20 group"
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-xl">FINALIZE & PAY SECURELY</span>
                                            <span className="text-xs font-normal text-blue-200">Complete your entire trip booking in one step</span>
                                        </div>
                                        <div className="relative">
                                            <Plane className="size-8 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            <Sparkles className="absolute -top-1 -right-1 size-3 text-yellow-300 animate-pulse" />
                                        </div>
                                    </button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                // Redirect to internal checkout for Hotels (Generic Search)
                                                window.location.href = `/checkout?type=stay`
                                            }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center group"
                                        >
                                            <Building2 className="size-6 text-white/50 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
                                            <span className="text-sm font-medium text-white">Book Hotel</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                // Direct Viator link for activities
                                                const viatorUrl = `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination)}`
                                                window.open(viatorUrl, '_blank')
                                            }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center group"
                                        >
                                            <Car className="size-6 text-white/50 group-hover:text-amber-400 mx-auto mb-2 transition-colors" />
                                            <span className="text-sm font-medium text-white">Book Activities</span>
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
            </AnimatePresence >

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
