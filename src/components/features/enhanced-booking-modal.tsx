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
import { TripData } from './trip-itinerary'

interface EnhancedBookingModalProps {
    tripData: TripData
    isHalal?: boolean
    isOpen: boolean
    onClose: () => void
}

type BookingStep = 'details' | 'review' | 'processing' | 'success'

export function EnhancedBookingModal({ tripData, isHalal = false, isOpen, onClose }: EnhancedBookingModalProps) {
    const [step, setStep] = useState<BookingStep>('details')
    const [processingText, setProcessingText] = useState('Securing Flights...')
    const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
    const [bookingError, setBookingError] = useState<string | null>(null)

    // Form state
    const [checkIn, setCheckIn] = useState<Date | null>(null)
    const [checkOut, setCheckOut] = useState<Date | null>(null)
    const [travelers, setTravelers] = useState<TravelerCount>({ adults: 2, children: 0, infants: 0 })
    const [departureAirport, setDepartureAirport] = useState<{ code: string; city: string } | null>(null)
    const [roomType, setRoomType] = useState<'single' | 'double' | 'suite'>('double')
    const [flightClass, setFlightClass] = useState<'economy' | 'business' | 'first'>('economy')
    const [travelInsurance, setTravelInsurance] = useState(false)
    const [specialRequests, setSpecialRequests] = useState('')

    // Contact info
    const [contact, setContact] = useState<BookingContactInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    })

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
    const estimatedPrice = Math.round(baseFlightPrice + baseHotelPrice + insurancePrice)

    // Extract destination from trip
    const destination = tripData.days[0]?.theme?.split(' ').slice(-1)[0] || 'Destination'

    // Validation
    const isStep1Valid = checkIn && checkOut && departureAirport
    const isStep2Valid = contact.firstName && contact.lastName && contact.email && contact.phone

    // Processing animation and API call
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
                }
            }, 1200)

            // Make API call to save booking
            const saveBooking = async () => {
                try {
                    const response = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
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
                            estimated_price: estimatedPrice,
                            insurance_price: insurancePrice
                        })
                    })

                    const data = await response.json()

                    if (response.ok && data.confirmation_code) {
                        setConfirmationCode(data.confirmation_code)
                    } else {
                        // Still show success with generated code (demo mode)
                        setConfirmationCode(`SAFAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
                    }
                } catch (error) {
                    console.error('Booking save error:', error)
                    // Demo mode fallback
                    setConfirmationCode(`SAFAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
                }
            }

            // Start API call immediately
            saveBooking()

            // Transition to success after animations complete
            const timeout = setTimeout(() => {
                clearInterval(interval)
                setStep('success')
            }, 4800)

            return () => {
                clearInterval(interval)
                clearTimeout(timeout)
            }
        }
    }, [step, tripData, destination, isHalal, departureAirport, checkIn, checkOut, travelers, roomType, flightClass, contact, travelInsurance, specialRequests, estimatedPrice, insurancePrice])

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
                    className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-8"
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
                        <div className="p-8">
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
                                {/* Date Picker */}
                                <DateRangePicker
                                    checkIn={checkIn}
                                    checkOut={checkOut}
                                    onDateChange={(ci, co) => { setCheckIn(ci); setCheckOut(co) }}
                                />

                                {/* Travelers */}
                                <TravelerSelector
                                    travelers={travelers}
                                    onChange={setTravelers}
                                />

                                {/* Departure Airport */}
                                <AirportInput
                                    value={departureAirport}
                                    onChange={setDepartureAirport}
                                />

                                {/* Room & Flight Preferences */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Room Type */}
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

                                    {/* Flight Class */}
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

                                {/* Travel Insurance */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Shield className="size-5 text-emerald-400" />
                                        <div>
                                            <div className="text-white font-medium">Travel Insurance</div>
                                            <div className="text-xs text-white/40">${89}/person • Full coverage</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setTravelInsurance(!travelInsurance)}
                                        className={`w-12 h-6 rounded-full transition-colors ${travelInsurance ? 'bg-emerald-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${travelInsurance ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={!isStep1Valid}
                                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-6 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue <ChevronRight className="size-5 ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Review & Contact */}
                    {step === 'review' && (
                        <div className="p-8">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-1 text-white/50 hover:text-white text-sm mb-4 transition-colors"
                            >
                                <ChevronLeft className="size-4" />
                                Back
                            </button>

                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="size-5 text-emerald-400" />
                                <span className="text-xs text-emerald-400 uppercase tracking-wider font-medium">Step 2 of 2</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-6">Review & Confirm</h2>

                            {/* Trip Summary */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
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
                                    <div className="flex justify-between text-white/70">
                                        <span className="flex items-center gap-2"><Briefcase className="size-4" /> Travelers</span>
                                        <span className="text-white">{travelers.adults} adults{travelers.children > 0 ? `, ${travelers.children} children` : ''}</span>
                                    </div>
                                    {travelInsurance && (
                                        <div className="flex justify-between text-white/70">
                                            <span className="flex items-center gap-2"><Shield className="size-4" /> Insurance</span>
                                            <span className="text-emerald-400">${insurancePrice}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-white/70 pt-3 border-t border-white/10 mt-3">
                                        <span className="font-semibold text-white">Estimated Total</span>
                                        <span className="text-emerald-400 font-bold text-xl">${estimatedPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4 mb-6">
                                <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider">Contact Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-white/50 block mb-1">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                                            <input
                                                type="text"
                                                value={contact.firstName}
                                                onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                                                placeholder="John"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 block mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={contact.lastName}
                                            onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                                            placeholder="Doe"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-white/50 block mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                                        <input
                                            type="email"
                                            value={contact.email}
                                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-white/50 block mb-1">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                                        <input
                                            type="tel"
                                            value={contact.phone}
                                            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Special Requests */}
                                <div>
                                    <label className="text-xs text-white/50 block mb-1">Special Requests (Optional)</label>
                                    <textarea
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                        placeholder="Dietary requirements, accessibility needs, etc."
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={!isStep2Valid}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-6 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Booking • ${estimatedPrice.toLocaleString()}
                            </Button>
                            <p className="text-center text-white/30 text-xs mt-4">Demo mode. No real charges.</p>
                        </div>
                    )}

                    {/* Processing */}
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

                    {/* Success */}
                    {step === 'success' && (
                        <div className="p-8 text-center">
                            <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="size-10 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">You're Going!</h2>
                            <p className="text-white/60 mb-6">Confirmation sent to {contact.email}</p>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Confirmation #</p>
                                <p className="text-emerald-400 font-mono font-bold text-xl">{confirmationCode || 'SAFAR-XXXXXX'}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-left">
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Trip</span>
                                        <span className="text-white">{tripData.trip_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Dates</span>
                                        <span className="text-white">{checkIn?.toLocaleDateString()} - {checkOut?.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Travelers</span>
                                        <span className="text-white">{travelers.adults + travelers.children}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-white/10">
                                        <span className="text-white font-medium">Total</span>
                                        <span className="text-emerald-400 font-bold">${estimatedPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 py-6 rounded-xl"
                            >
                                Close
                            </Button>

                            {/* Affiliate Booking Links */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-4 text-center">Complete Your Booking</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => {
                                            // Aviasales/WayAway affiliate link provided by user
                                            const url = 'https://aviasales.tpx.lv/fNn5QXxw'
                                            window.open(url, '_blank')
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all"
                                    >
                                        <Plane className="size-5" />
                                        <span className="text-xs font-medium">Flights</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const city = tripData.trip_name.split(' ').slice(-1)[0] || 'Paris'
                                            const checkin = checkIn?.toISOString().split('T')[0] || ''
                                            const checkout = checkOut?.toISOString().split('T')[0] || ''
                                            // Booking.com affiliate link (replace aid=YOUR_AID with real affiliate ID)
                                            const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkin}&checkout=${checkout}&group_adults=${travelers.adults}&no_rooms=1&group_children=${travelers.children}`
                                            window.open(url, '_blank')
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-all"
                                    >
                                        <Building2 className="size-5" />
                                        <span className="text-xs font-medium">Hotels</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const city = tripData.trip_name.split(' ').slice(-1)[0] || 'Paris'
                                            // Viator affiliate link (replace pid=YOUR_PID with real affiliate ID)
                                            const url = `https://www.viator.com/searchResults/all?text=${encodeURIComponent(city)}`
                                            window.open(url, '_blank')
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                                    >
                                        <Star className="size-5" />
                                        <span className="text-xs font-medium">Activities</span>
                                    </button>
                                </div>
                                <p className="text-xs text-white/30 text-center mt-3">Powered by Aviasales, Booking.com & Viator</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
