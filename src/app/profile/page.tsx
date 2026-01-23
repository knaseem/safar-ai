"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookingRequest } from "@/types/booking"
import { Loader2, Plane, Calendar, MapPin, LogOut, User as UserIcon, X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PassportCard } from "@/components/features/passport-card"

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [bookings, setBookings] = useState<BookingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'trips' | 'bookings'>('bookings')
    const [showPassport, setShowPassport] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/')
                return
            }
            setUser(user)

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('travel_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (profileData) {
                setProfile(profileData)
            }

            // Fetch Bookings
            const response = await fetch('/api/bookings')
            if (response.ok) {
                const data = await response.json()
                setBookings(data.bookings || [])
            }
            setLoading(false)
        }

        fetchData()
    }, [router])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="size-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 pb-12">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="bg-neutral-900 border-white/10">
                            <CardHeader className="text-center">
                                <div className="size-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserIcon className="size-10 text-emerald-500" />
                                </div>
                                <CardTitle className="text-white">{user?.email?.split('@')[0]}</CardTitle>
                                <CardDescription>{user?.email}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="bg-white/5 p-3 rounded-lg text-center mb-4">
                                        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Travel DNA</p>
                                        <p className="text-emerald-400 font-medium">{profile?.archetype || "Undiscovered"}</p>
                                        {profile && (
                                            <button
                                                onClick={() => setShowPassport(true)}
                                                className="mt-2 text-[10px] text-white/40 hover:text-white uppercase tracking-wider border-b border-white/10 hover:border-white transition-all pb-0.5"
                                            >
                                                View Passport
                                            </button>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="size-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-white/10 pb-1">
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'bookings' ? 'text-white' : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                Concierge Requests
                                {activeTab === 'bookings' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('trips')}
                                className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'trips' ? 'text-white' : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                Saved Itineraries (AI)
                                {activeTab === 'trips' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                                )}
                            </button>
                        </div>

                        {/* Content Area */}
                        {activeTab === 'bookings' && (
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

                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-xs text-white/40 uppercase">Est. Budget</p>
                                                            <p className="text-lg font-semibold text-white">${booking.estimated_price?.toLocaleString()}</p>
                                                        </div>
                                                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'trips' && (
                            <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-white/5">
                                <Sparkles className="size-12 text-emerald-500/20 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">AI Trips Coming Soon</h3>
                                <p className="text-white/40 mb-4">Your saved AI-generated itineraries will appear here.</p>
                                <Button
                                    onClick={() => router.push('/')}
                                    className="bg-emerald-500 text-white hover:bg-emerald-600"
                                >
                                    Generate New Trip
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Passport Modal */}
            <AnimatePresence>
                {showPassport && profile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 perspective-1000"
                        onClick={() => setShowPassport(false)}
                    >
                        <div className="relative w-full max-w-md" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowPassport(false)}
                                className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors z-20"
                            >
                                <X className="size-6" />
                            </button>
                            <PassportCard
                                archetype={profile.archetype}
                                scores={profile.traits?.scores || {}}
                                onClose={() => setShowPassport(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}


