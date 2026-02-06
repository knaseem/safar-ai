"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookingRequest } from "@/types/booking"
import { Loader2, Plane, Calendar, MapPin, User as UserIcon, X, Sparkles, Trash2, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PassportCard } from "@/components/features/passport-card"
import { VibeCheck } from "@/components/features/vibe-check"
import { toast } from "sonner"
import { BookingDetailModal } from "@/components/features/booking-detail-modal"
import { NeighborhoodRadar } from "@/components/features/neighborhood-radar"
import { DuffelBookings } from "@/components/features/duffel-bookings"
import { ImportBookingsModal } from "@/components/features/import-bookings-modal"
import { getCoordinates } from "@/lib/geocoding"
import { User } from "@supabase/supabase-js"

// Type definitions for profile page
interface UserProfile {
    id: string
    full_name?: string
    avatar_url?: string
    created_at?: string
}

interface TravelProfile extends UserProfile {
    archetype?: string
    traits?: {
        scores?: Record<string, number>
        [key: string]: unknown
    }
    archetype_scores?: Record<string, number>
}

interface SavedTrip {
    id: string
    trip_name: string
    destination?: string
    trip_data: Record<string, unknown>
    is_halal: boolean
    created_at: string
    user_id: string
}

interface ProfileBooking extends Omit<BookingRequest, 'contact'> {
    id: string
    user_id: string
    created_at: string
    contact_first_name: string
    contact_last_name: string
    contact_email: string
    contact_phone: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<TravelProfile | null>(null)
    const [bookings, setBookings] = useState<ProfileBooking[]>([])
    const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'duffel' | 'bookings' | 'trips'>('duffel')
    const [showPassport, setShowPassport] = useState(false)
    const [showVibeCheck, setShowVibeCheck] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<ProfileBooking | null>(null)
    const [deletingTripId, setDeletingTripId] = useState<string | null>(null)
    const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null)
    const [showImportModal, setShowImportModal] = useState(false)

    useEffect(() => {
        async function loadProfile() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth')
                return
            }

            setUser(user)

            // Fetch base profile info
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            // Fetch travel identity (archetype, scores)
            const { data: travelData } = await supabase
                .from('travel_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (profileData || travelData) {
                setProfile({
                    ...profileData,
                    ...travelData,
                    // Map traits.scores to the expected archetype_scores field
                    archetype_scores: travelData?.traits?.scores || {}
                })
            }

            // Fetch bookings
            const response = await fetch('/api/bookings')
            const bookingsJson = await response.json()
            if (bookingsJson.bookings) {
                setBookings(bookingsJson.bookings)
            }

            // Fetch saved trips
            const { data: tripsData } = await supabase
                .from('saved_trips')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (tripsData) {
                setSavedTrips(tripsData)
            }

            setLoading(false)
        }

        loadProfile()
    }, [router])

    const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (deletingTripId !== id) {
            setDeletingTripId(id)
            return
        }

        const supabase = createClient()
        const { error } = await supabase
            .from('saved_trips')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error("Failed to delete itinerary")
        } else {
            setSavedTrips(prev => prev.filter(t => t.id !== id))
            toast.success("Itinerary removed")
        }
        setDeletingTripId(null)
    }

    const handleDeleteBooking = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (deletingBookingId !== id) {
            setDeletingBookingId(id)
            return
        }

        try {
            const res = await fetch(`/api/bookings?id=${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                setBookings(prev => prev.filter(b => b.id !== id))
                toast.success("Booking request removed")
            } else {
                throw new Error("Failed to delete")
            }
        } catch (err) {
            toast.error("Failed to delete booking")
        } finally {
            setDeletingBookingId(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="size-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <Navbar />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Profile Header */}
                <Card className="bg-neutral-900 border-white/10 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-emerald-900/40 via-neutral-900 to-neutral-900" />
                    <CardContent className="-mt-12 p-8 relative">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-end gap-6">
                                <div className="size-32 rounded-3xl bg-neutral-800 border-4 border-black flex items-center justify-center shadow-2xl relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <UserIcon className="size-16 text-white/10" />
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-3xl font-bold text-white mb-1">
                                        {profile?.full_name || user?.email?.split('@')[0]}
                                    </h1>
                                    <p className="text-white/40 font-mono text-sm tracking-widest uppercase">
                                        Agent ID: {user?.id?.slice(0, 8)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pb-2">
                                <Button
                                    onClick={() => {
                                        if (profile?.archetype) {
                                            setShowPassport(true)
                                        } else {
                                            toast.error("Vibe Identity Not Found", {
                                                description: "Complete a Vibe Check to unlock your Travel Passport."
                                            })
                                        }
                                    }}
                                    className="bg-white text-black hover:bg-neutral-200 font-bold"
                                >
                                    View Travel Passport
                                </Button>
                                <Button
                                    onClick={() => setShowVibeCheck(true)}
                                    className="bg-neutral-800 text-white hover:bg-neutral-700 border border-white/10 font-bold"
                                >
                                    Retake Vibe Check
                                </Button>
                                <Button
                                    onClick={() => setShowImportModal(true)}
                                    className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold"
                                >
                                    <Upload className="size-4 mr-2" />
                                    Import Bookings
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Tabs */}
                <div className="space-y-6">
                    <div className="flex gap-8 border-b border-white/5 px-2 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('duffel')}
                            className={cn(
                                "pb-4 text-sm font-bold uppercase tracking-widest relative transition-colors whitespace-nowrap",
                                activeTab === 'duffel' ? "text-emerald-500" : "text-white/40 hover:text-white"
                            )}
                        >
                            My Bookings
                            {activeTab === 'duffel' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={cn(
                                "pb-4 text-sm font-bold uppercase tracking-widest relative transition-colors whitespace-nowrap",
                                activeTab === 'bookings' ? "text-emerald-500" : "text-white/40 hover:text-white"
                            )}
                        >
                            Concierge Requests
                            {activeTab === 'bookings' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('trips')}
                            className={cn(
                                "pb-4 text-sm font-bold uppercase tracking-widest relative transition-colors whitespace-nowrap",
                                activeTab === 'trips' ? "text-emerald-500" : "text-white/40 hover:text-white"
                            )}
                        >
                            Saved Itineraries
                            {activeTab === 'trips' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                            )}
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[400px]">
                        {/* Duffel Direct Bookings */}
                        {activeTab === 'duffel' && (
                            <DuffelBookings />
                        )}

                        {/* Concierge Booking Requests */}
                        {activeTab === 'bookings' && (
                            <div className="grid gap-8">
                                {/* Destination Intelligence Section */}
                                {bookings.filter(b => b.status === 'booked').slice(0, 1).map(nextTrip => {
                                    const coords = getCoordinates(nextTrip.destination);
                                    if (!coords) return null;
                                    return (
                                        <div key="intelligence" className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Sparkles className="size-4 text-emerald-400" />
                                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em]">Upcoming Destination Intelligence</h3>
                                            </div>
                                            <div className="grid lg:grid-cols-3 gap-6">
                                                <div className="lg:col-span-1">
                                                    <NeighborhoodRadar
                                                        lat={coords.lat}
                                                        lng={coords.lng}
                                                        cityName={nextTrip.destination}
                                                    />
                                                </div>
                                                <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 p-8 flex flex-col justify-center">
                                                    <div className="space-y-4">
                                                        <h4 className="text-2xl font-bold text-white">Why {nextTrip.destination}?</h4>
                                                        <p className="text-white/60 leading-relaxed">
                                                            Our AI is cross-referencing live Amadeus data with your traveler archetype.
                                                            We've identified this neighborhood as a high-match for your preferred pace.
                                                            The safety scores are verified, and the "Nightlife/Dining" balance aligns with your recent vibe checks.
                                                        </p>
                                                        <div className="flex gap-4 pt-4">
                                                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-bold uppercase tracking-wider">
                                                                AI Verified
                                                            </div>
                                                            <div className="px-4 py-2 bg-white/10 border border-white/10 rounded-full text-xs text-white/40 font-bold uppercase tracking-wider">
                                                                Live Amadeus Feed
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                <div className="grid gap-4">
                                    {bookings.length === 0 ? (
                                        <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-white/5">
                                            <Plane className="size-12 text-white/10 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-white mb-2">No Bookings Yet</h3>
                                            <p className="text-white/40 mb-4">You haven't requested any concierge bookings.</p>
                                            <Button
                                                onClick={() => router.push('/')}
                                                className="bg-white text-black hover:bg-white/90"
                                            >
                                                Plan a Trip
                                            </Button>
                                        </div>
                                    ) : (
                                        bookings.map((booking: any) => (
                                            <Card key={booking.id} className="bg-neutral-900 border-white/10 hover:border-emerald-500/30 transition-all">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                    booking.status === 'booked' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                        'bg-white/10 text-white/60'
                                                                    }`}>
                                                                    {booking.status}
                                                                </span>
                                                                <span className="text-white/40 text-sm">#{booking.id.slice(0, 8)}</span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-white mb-1">{booking.trip_name || booking.destination}</h3>
                                                            <div className="flex items-center gap-4 text-white/60 text-sm">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="size-4" />
                                                                    {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="size-4" />
                                                                    {booking.destination}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-xs text-white/40 uppercase">Est. Budget</p>
                                                            <p className="text-lg font-semibold text-white">${booking.estimated_price?.toLocaleString()}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="bg-transparent border-white/10 text-white hover:bg-white/10"
                                                                onClick={() => setSelectedBooking(booking)}
                                                            >
                                                                View Details
                                                            </Button>
                                                            <AnimatePresence mode="wait">
                                                                {deletingBookingId === booking.id ? (
                                                                    <motion.div
                                                                        key="confirm-booking-wrap"
                                                                        initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                setDeletingBookingId(null)
                                                                            }}
                                                                            className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => handleDeleteBooking(booking.id, e)}
                                                                            className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all whitespace-nowrap"
                                                                        >
                                                                            Confirm Delete
                                                                        </button>
                                                                    </motion.div>
                                                                ) : (
                                                                    <motion.button
                                                                        key="trash-booking"
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        exit={{ opacity: 0 }}
                                                                        onClick={(e) => handleDeleteBooking(booking.id, e)}
                                                                        className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all self-end"
                                                                        title="Delete Booking"
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </motion.button>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'trips' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                {savedTrips.length === 0 ? (
                                    <div className="col-span-full text-center py-12 bg-neutral-900/50 rounded-xl border border-white/5">
                                        <Sparkles className="size-12 text-emerald-500/20 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-white mb-2">No Saved Trips</h3>
                                        <p className="text-white/40 mb-4">Your AI-generated itineraries will appear here.</p>
                                        <Button
                                            onClick={() => router.push('/')}
                                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                                        >
                                            Generate New Trip
                                        </Button>
                                    </div>
                                ) : (
                                    savedTrips.map((trip) => (
                                        <Card key={trip.id} className="bg-neutral-900 border-white/10 hover:border-emerald-500/30 transition-all group overflow-hidden">
                                            <div className="h-32 bg-neutral-800 relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-black" />
                                                <div className="absolute bottom-3 left-4 right-4">
                                                    <h3 className="text-lg font-bold text-white truncate">{trip.trip_name}</h3>
                                                    <p className="text-xs text-white/60 flex items-center gap-1">
                                                        <MapPin className="size-3" />
                                                        {trip.destination || "Multiple Destinations"}
                                                    </p>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xs text-white/40">
                                                        {new Date(trip.created_at).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {trip.is_halal && (
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium uppercase tracking-wider border border-emerald-500/20">
                                                                Halal
                                                            </span>
                                                        )}
                                                        <AnimatePresence mode="wait">
                                                            {deletingTripId === trip.id ? (
                                                                <motion.div
                                                                    key="confirm-trip-wrap"
                                                                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setDeletingTripId(null)
                                                                        }}
                                                                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleDeleteTrip(trip.id, e)}
                                                                        className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all whitespace-nowrap"
                                                                    >
                                                                        Confirm Delete
                                                                    </button>
                                                                </motion.div>
                                                            ) : (
                                                                <motion.button
                                                                    key="trash"
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    onClick={(e) => handleDeleteTrip(trip.id, e)}
                                                                    className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                                    title="Delete Itinerary"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </motion.button>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="w-full bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white group-hover:border-emerald-500/30"
                                                    onClick={() => {
                                                        router.push(`/trips/${trip.id}`)
                                                    }}
                                                >
                                                    View Itinerary
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Passport Modal */}
            <AnimatePresence>
                {showPassport && profile && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPassport(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl"
                        >
                            <PassportCard
                                archetype={profile.archetype || "Explorer"}
                                scores={profile.archetype_scores || {}}
                                bookings={bookings}
                                onClose={() => setShowPassport(false)}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Vibe Check Modal */}
            <AnimatePresence>
                {showVibeCheck && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <div className="w-full max-w-4xl relative">
                            <button
                                onClick={() => setShowVibeCheck(false)}
                                className="absolute top-4 right-4 text-white/40 hover:text-white z-50"
                            >
                                <X className="size-6" />
                            </button>
                            <VibeCheck
                                isOpen={showVibeCheck}
                                onClose={() => {
                                    setShowVibeCheck(false)
                                    // Optionally re-fetch profile if needed
                                }}
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Booking Detail Modal */}
            <BookingDetailModal
                booking={selectedBooking}
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                onBookingUpdate={(updated) => {
                    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
                    setSelectedBooking(updated)
                }}
            />

            {/* Import Bookings Modal */}
            <ImportBookingsModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImportSuccess={() => {
                    // Refresh trips list after import
                    window.location.reload()
                }}
            />
        </main>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
