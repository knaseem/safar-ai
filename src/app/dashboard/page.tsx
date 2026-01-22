"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Map, Calendar, Trash2, Heart, ArrowLeft, Loader2, Plane, Sparkles, X, Eye } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { TripItinerary, TripData } from "@/components/features/trip-itinerary"

interface SavedTrip {
    id: string
    trip_name: string
    trip_data: TripData
    is_halal: boolean
    destination: string | null
    created_at: string
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [trips, setTrips] = useState<SavedTrip[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [viewingTrip, setViewingTrip] = useState<SavedTrip | null>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/")
            return
        }

        if (user) {
            fetchTrips()
        }
    }, [user, authLoading, router])

    const fetchTrips = async () => {
        try {
            const res = await fetch("/api/trips")
            const data = await res.json()
            if (res.ok) {
                setTrips(data.trips || [])
            }
        } catch (error) {
            toast.error("Failed to load trips")
        } finally {
            setLoading(false)
        }
    }

    const deleteTrip = async (id: string) => {
        setDeletingId(id)
        try {
            const res = await fetch(`/api/trips?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                setTrips(trips.filter(t => t.id !== id))
                toast.success("Trip deleted")
            } else {
                throw new Error()
            }
        } catch {
            toast.error("Failed to delete trip")
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    }

    if (authLoading || (!user && !authLoading)) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="size-8 text-emerald-500 animate-spin" />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            {/* Hero Header */}
            <section className="relative pt-32 pb-12 px-6">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-black" />
                <div className="container mx-auto relative z-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Home
                    </Link>

                    <div className="flex items-center gap-2 mb-4">
                        <Map className="size-5 text-emerald-400" />
                        <span className="text-sm text-emerald-400 uppercase tracking-widest font-medium">My Trips</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Welcome back, {user?.email?.split("@")[0]}
                    </h1>
                    <p className="text-white/50">
                        {trips.length === 0
                            ? "You haven't saved any trips yet. Plan your first adventure!"
                            : `You have ${trips.length} saved trip${trips.length === 1 ? "" : "s"}`}
                    </p>
                </div>
            </section>

            {/* Trips Grid */}
            <section className="px-6 pb-24">
                <div className="container mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="size-8 text-emerald-500 animate-spin" />
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                                <Plane className="size-10 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">No trips yet</h2>
                            <p className="text-white/50 mb-8 max-w-md mx-auto">
                                Start by generating a trip on the home page and save it to see it here.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
                            >
                                <Sparkles className="size-4" />
                                Plan My First Trip
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trips.map((trip, index) => (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setViewingTrip(trip)}
                                    className="group relative bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 cursor-pointer"
                                >
                                    {/* Trip Header */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                {trip.is_halal && (
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-wider font-medium border border-emerald-500/20">
                                                        Halal
                                                    </span>
                                                )}
                                                <span className="text-white/40 text-xs flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {formatDate(trip.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setViewingTrip(trip); }}
                                                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                                    title="View Trip"
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id); }}
                                                    disabled={deletingId === trip.id}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                                                    title="Delete Trip"
                                                >
                                                    {deletingId === trip.id ? (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                                            {trip.trip_name}
                                        </h3>

                                        {trip.destination && (
                                            <p className="text-white/50 text-sm mb-4 flex items-center gap-2">
                                                <Map className="size-4" />
                                                {trip.destination}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-white/30 text-sm">
                                                {trip.trip_data?.days?.length || 0} days
                                            </span>
                                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                                <Heart className="size-4 fill-current" />
                                                Saved
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Trip Limit Notice */}
                    {trips.length > 0 && (
                        <div className="mt-8 text-center text-white/30 text-sm">
                            {trips.length}/10 trips saved
                        </div>
                    )}
                </div>
            </section>

            {/* Trip View Modal */}
            <AnimatePresence>
                {viewingTrip && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/90 backdrop-blur-sm pt-8 pb-8"
                        onClick={() => setViewingTrip(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl mx-4"
                        >
                            {/* Close Button - positioned inside modal */}
                            <button
                                onClick={() => setViewingTrip(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors z-30 border border-white/20"
                            >
                                <X className="size-5" />
                            </button>

                            {/* Trip Itinerary Display */}
                            <TripItinerary
                                data={viewingTrip.trip_data}
                                onReset={() => setViewingTrip(null)}
                                isHalal={viewingTrip.is_halal}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
