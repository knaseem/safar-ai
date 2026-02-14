"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, User as UserIcon, X, Sparkles, Trash2, Upload, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PassportCard } from "@/components/features/passport-card"
import { VibeCheck } from "@/components/features/vibe-check"
import { toast } from "sonner"
import { ImportBookingsModal } from "@/components/features/import-bookings-modal"
import { User } from "@supabase/supabase-js"
import { UnifiedBooking } from "@/types/booking"
import { UnifiedBookingCard } from "@/components/features/unified-booking-card"

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
    plan_tier?: string
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

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<TravelProfile | null>(null)
    const [unifiedBookings, setUnifiedBookings] = useState<UnifiedBooking[]>([])
    const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'all' | 'trips'>('all')
    const [showPassport, setShowPassport] = useState(false)
    const [showVibeCheck, setShowVibeCheck] = useState(false)
    const [deletingTripId, setDeletingTripId] = useState<string | null>(null)
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

            // Fetch Unified Bookings
            const bookingsRes = await fetch('/api/bookings/all')
            if (bookingsRes.ok) {
                const data = await bookingsRes.json()
                setUnifiedBookings(data.bookings || [])
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

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="size-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    const bookingList = unifiedBookings

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
                                    <p className="text-white/40 font-mono text-sm tracking-widest uppercase flex items-center gap-3">
                                        Agent ID: {user?.id?.slice(0, 8)}
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                            profile?.plan_tier === 'pro'
                                                ? "bg-gradient-to-r from-yellow-400 to-amber-600 text-black border-yellow-400"
                                                : "bg-white/5 text-white/40 border-white/10"
                                        )}>
                                            {profile?.plan_tier || 'Free'} Subscription
                                        </span>
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
                            onClick={() => setActiveTab('all')}
                            className={cn(
                                "pb-4 text-sm font-bold uppercase tracking-widest relative transition-colors whitespace-nowrap",
                                activeTab === 'all' ? "text-emerald-500" : "text-white/40 hover:text-white"
                            )}
                        >
                            All Bookings
                            {activeTab === 'all' && (
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
                        {/* Unified Bookings Tab */}
                        {activeTab === 'all' && (
                            <div className="grid gap-4">
                                {bookingList.length === 0 ? (
                                    <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-white/5">
                                        <Sparkles className="size-12 text-white/10 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-white mb-2">No Bookings Found</h3>
                                        <p className="text-white/40 mb-4">You haven't made any bookings yet.</p>
                                        <Button onClick={() => router.push('/')} className="bg-white text-black hover:bg-white/90">
                                            Plan a Trip
                                        </Button>
                                    </div>
                                ) : (
                                    bookingList.map((booking, i) => (
                                        <UnifiedBookingCard
                                            key={`${booking.source}-${booking.id}`}
                                            booking={booking}
                                            index={i}
                                            trips={savedTrips.map(t => ({ id: t.id, name: t.trip_name }))}
                                            onUpdate={(updated) => {
                                                setUnifiedBookings(prev => prev.map(b => b.id === booking.id ? { ...b, ...updated } : b))
                                            }}
                                            onDelete={() => {
                                                setUnifiedBookings(prev => prev.filter(b => b.id !== booking.id))
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Saved Trips Tab */}
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
                                bookings={unifiedBookings.map(b => ({ id: b.id, destination: b.details.location || b.details.title, check_in: b.details.date || new Date().toISOString() }))}
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
