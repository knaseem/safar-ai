"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Calendar, Users, CheckCircle, Clock, XCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, subDays } from "date-fns"
import { PassportCard } from "@/components/features/passport-card"
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Activity, PieChart as PieChartIcon } from "lucide-react"

// Define interface matching Database Schema
interface AdminBooking {
    id: string
    user_id: string
    created_at: string
    trip_name: string
    destination: string
    is_halal: boolean
    status: 'pending' | 'processing' | 'booked' | 'cancelled'
    estimated_price: number
    travelers: { adults: number; children: number; infants: number }
    check_in: string
    check_out: string
    contact_first_name: string
    contact_last_name: string
    contact_email: string
    contact_phone: string
    special_requests?: string
    room_type: string
    flight_class: string
}

function KanbanColumn({ title, count, color, icon: Icon, children }: any) {
    return (
        <div className="flex-1 min-w-[280px] flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${color} bg-opacity-20`}>
                        <Icon className={`size-4 ${color.replace('bg-', 'text-')}`} />
                    </div>
                    <h3 className="font-semibold text-white/90">{title}</h3>
                </div>
                <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-1 rounded-full">{count}</span>
            </div>
            <div className="flex-1 rounded-2xl bg-white/5 border border-white/5 p-3 space-y-3 overflow-y-auto">
                {children}
            </div>
        </div>
    )
}

// Booking Card Component
function BookingCard({ booking, onClick }: { booking: AdminBooking, onClick: () => void }) {
    return (
        <motion.div
            layoutId={booking.id}
            onClick={onClick}
            className="group bg-neutral-900 border border-white/10 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-500/10"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="px-2 py-1 rounded bg-white/5 text-[10px] text-white/50 font-mono">
                    #{booking.id.slice(0, 6)}
                </div>
                {booking.is_halal && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium px-2 py-1 rounded bg-emerald-500/10">
                        <CheckCircle className="size-3" /> HALAL
                    </div>
                )}
            </div>

            <h4 className="font-bold text-white mb-1 truncate">{booking.trip_name || booking.destination}</h4>

            <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                <span className="flex items-center gap-1"><Users className="size-3" /> {booking.travelers.adults + booking.travelers.children}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="size-3" /> {format(new Date(booking.check_in), 'MMM d')}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {(booking.contact_first_name?.[0] || 'U')}{(booking.contact_last_name?.[0] || '')}
                    </div>
                    <span className="text-xs text-white/40 truncate max-w-[80px]">{booking.contact_last_name}</span>
                </div>
                <div className="text-sm font-semibold text-emerald-400">
                    ${booking.estimated_price?.toLocaleString()}
                </div>
            </div>
        </motion.div>
    )
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<AdminBooking[]>([])
    const [stats, setStats] = useState<any>({ revenue: [], archetypes: [] })
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const supabase = createClient()

        // Fetch Bookings
        const { data: bookingsData } = await supabase
            .from('booking_requests')
            .select('*')
            .order('created_at', { ascending: false })

        // Fetch Profiles for Analytics
        const { data: profilesData } = await supabase
            .from('travel_profiles')
            .select('archetype')

        if (bookingsData) {
            setBookings(bookingsData as AdminBooking[])
            processAnalytics(bookingsData, profilesData || [])
        }
        setLoading(false)
    }

    const updateStatus = async (id: string, newStatus: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from('booking_requests')
            .update({ status: newStatus })
            .eq('id', id)

        if (error) {
            toast.error("Failed to update status")
        } else {
            toast.success(`Booking ${newStatus} successfully`)
            // Update local state
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus as any } : b))
            setSelectedBooking(null)
            // Refresh stats
            fetchData()
        }
    }

    const processAnalytics = (bookings: any[], profiles: any[]) => {
        // 1. Revenue Over Time (Mocked based on booking dates for visual)
        const revenueMap: Record<string, number> = {}
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            revenueMap[format(subDays(new Date(), i), 'MMM d')] = 0
        }

        bookings.forEach(b => {
            const date = format(new Date(b.created_at), 'MMM d')
            if (revenueMap[date] !== undefined) {
                revenueMap[date] += b.estimated_price
            }
        })

        const revenueData = Object.keys(revenueMap).map(key => ({
            name: key,
            value: revenueMap[key]
        }))

        // 2. Archetype Distribution
        const archetypeCounts: Record<string, number> = {}
        profiles.forEach(p => {
            const type = p.archetype || 'Undiscovered'
            archetypeCounts[type] = (archetypeCounts[type] || 0) + 1
        })

        const archetypeData = Object.keys(archetypeCounts).map((name, index) => ({
            name,
            value: archetypeCounts[name],
            color: COLORS[index % COLORS.length]
        })).sort((a, b) => b.value - a.value).slice(0, 5)

        setStats({ revenue: revenueData, archetypes: archetypeData })
    }

    const getStats = () => {
        const total = bookings.reduce((acc, curr) => acc + (curr.estimated_price || 0), 0)
        const pending = bookings.filter(b => b.status === 'pending').length
        return { total, pending, count: bookings.length }
    }

    const { total, pending } = getStats()

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="size-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8 h-screen flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
                    <p className="text-white/40">Overview of concierge operations</p>
                </div>
                <div className="flex gap-4">
                    <Card className="bg-neutral-900 border-white/10 w-40">
                        <CardContent className="p-4">
                            <p className="text-xs text-white/40 uppercase mb-1">Pipeline Value</p>
                            <p className="text-xl font-bold text-emerald-400">${total.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-neutral-900 border-white/10 w-40">
                        <CardContent className="p-4">
                            <p className="text-xs text-white/40 uppercase mb-1">Pending Actions</p>
                            <p className="text-xl font-bold text-yellow-400">{pending}</p>
                        </CardContent>
                    </Card>
                </div>
            </header>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <Card className="bg-neutral-900 border-white/10 lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                            <TrendingUp className="size-4 text-emerald-500" /> Revenue Projection (7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenue}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Archetype Distribution */}
                <Card className="bg-neutral-900 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                            <PieChartIcon className="size-4 text-blue-500" /> User Travel DNA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.archetypes}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.archetypes.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{stats.archetypes.reduce((a: any, b: any) => a + b.value, 0)}</p>
                                <p className="text-[10px] text-white/40 uppercase">Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Live Activity Feed */}
            <Card className="bg-neutral-900 border-white/10 mb-8">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <Activity className="size-4 text-purple-500" /> Live Activity Feed
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {bookings.slice(0, 3).map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                                        <Sparkles className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">New Booking Request</p>
                                        <p className="text-xs text-white/40">
                                            {booking.contact_first_name} requested a trip to {booking.destination}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-white/30 font-mono">
                                    {format(new Date(booking.created_at), 'MMM d, h:mm a')}
                                </span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                                    <Users className="size-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">New User Registration</p>
                                    <p className="text-xs text-white/40">Verified via Email</p>
                                </div>
                            </div>
                            <span className="text-xs text-white/30 font-mono">Just now</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto -mx-8 px-8">
                <div className="flex gap-6 h-full pb-4 min-w-max pr-8">
                    {/* Incoming / Pending */}
                    <KanbanColumn
                        title="Incoming Requests"
                        count={bookings.filter(b => b.status === 'pending').length}
                        color="bg-yellow-500"
                        icon={Clock}
                    >
                        {bookings.filter(b => b.status === 'pending').map(booking => (
                            <BookingCard key={booking.id} booking={booking} onClick={() => setSelectedBooking(booking)} />
                        ))}
                    </KanbanColumn>

                    {/* Processing */}
                    <KanbanColumn
                        title="In Progress"
                        count={bookings.filter(b => b.status === 'processing').length}
                        color="bg-blue-500"
                        icon={Loader2}
                    >
                        {bookings.filter(b => b.status === 'processing').map(booking => (
                            <BookingCard key={booking.id} booking={booking} onClick={() => setSelectedBooking(booking)} />
                        ))}
                        {/* Empty State visual */}
                        {bookings.filter(b => b.status === 'processing').length === 0 && (
                            <div className="h-32 rounded-xl flex items-center justify-center text-white/20 text-sm italic">
                                No active trips
                            </div>
                        )}
                    </KanbanColumn>

                    {/* Confirmed */}
                    <KanbanColumn
                        title="Booked & Confirmed"
                        count={bookings.filter(b => b.status === 'booked').length}
                        color="bg-emerald-500"
                        icon={CheckCircle}
                    >
                        {bookings.filter(b => b.status === 'booked').map(booking => (
                            <BookingCard key={booking.id} booking={booking} onClick={() => setSelectedBooking(booking)} />
                        ))}
                    </KanbanColumn>

                    {/* Cancelled */}
                    <KanbanColumn
                        title="Cancelled"
                        count={bookings.filter(b => b.status === 'cancelled').length}
                        color="bg-red-500"
                        icon={XCircle}
                    >
                        {bookings.filter(b => b.status === 'cancelled').map(booking => (
                            <BookingCard key={booking.id} booking={booking} onClick={() => setSelectedBooking(booking)} />
                        ))}
                    </KanbanColumn>
                </div>
            </div>

            {/* Booking Details Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <BookingDetailModal
                        booking={selectedBooking}
                        onClose={() => setSelectedBooking(null)}
                        onUpdateStatus={updateStatus}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function BookingDetailModal({ booking, onClose, onUpdateStatus }: { booking: AdminBooking, onClose: () => void, onUpdateStatus: (id: string, status: string) => void }) {
    const [profile, setProfile] = useState<any>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient()
            if (!booking.user_id) {
                setLoadingProfile(false)
                return
            }
            const { data } = await supabase
                .from('travel_profiles')
                .select('*')
                .eq('user_id', booking.user_id)
                .single()
            setProfile(data)
            setLoadingProfile(false)
        }
        fetchProfile()
    }, [booking.user_id])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-5xl h-[80vh] flex overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Left: Trip Details */}
                <div className="flex-1 p-8 overflow-y-auto border-r border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                    booking.status === 'booked' ? 'bg-emerald-500/10 text-emerald-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {booking.status}
                                </span>
                                <span className="text-white/40 text-xs font-mono">#{booking.id.slice(0, 8)}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">{booking.trip_name || booking.destination}</h2>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-white/40 uppercase tracking-wider">Estimated Value</div>
                            <div className="text-2xl font-bold text-emerald-400">${booking.estimated_price?.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                                <Users className="size-4" /> Travelers
                            </h3>
                            <p className="text-white text-lg">{booking.travelers.adults} Adults, {booking.travelers.children} Children</p>
                            <p className="text-white/40 text-sm mt-1">{booking.room_type} Room • {booking.flight_class} Class</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                                <Calendar className="size-4" /> Dates
                            </h3>
                            <p className="text-white text-lg">{format(new Date(booking.check_in), 'MMM d, yyyy')}</p>
                            <p className="text-white/40 text-sm mt-1">to {format(new Date(booking.check_out), 'MMM d, yyyy')}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider mb-2">Contact Info</h3>
                            <div className="flex items-center gap-4 text-white">
                                <div className="flex items-center gap-2"><div className="size-8 rounded-full bg-white/10 flex items-center justify-center">{booking.contact_first_name?.[0]}</div> {booking.contact_first_name} {booking.contact_last_name}</div>
                                <div className="h-4 w-px bg-white/10" />
                                <div>{booking.contact_email}</div>
                                <div className="h-4 w-px bg-white/10" />
                                <div>{booking.contact_phone}</div>
                            </div>
                        </div>

                        {booking.special_requests && (
                            <div>
                                <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider mb-2">Special Requests</h3>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 text-sm leading-relaxed">
                                    "{booking.special_requests}"
                                </div>
                            </div>
                        )}

                        {/* Admin Actions */}
                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider mb-4">Concierge Actions</h3>
                            <div className="flex gap-3">
                                <Button
                                    className="bg-white text-black hover:bg-white/90"
                                    onClick={() => onUpdateStatus(booking.id, 'booked')}
                                    disabled={booking.status === 'booked'}
                                >
                                    <CheckCircle className="size-4 mr-2" />
                                    Mark as Booked
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                    onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                                    disabled={booking.status === 'cancelled'}
                                >
                                    <XCircle className="size-4 mr-2" />
                                    Cancel Request
                                </Button>
                                <Button className="ml-auto bg-purple-500 hover:bg-purple-600 text-white border-none">
                                    <Sparkles className="size-4 mr-2" />
                                    Draft AI Response
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Travel Passport (Premium Feature) */}
                <div className="w-[400px] bg-[#0a0a0a] p-8 border-l border-white/10 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                    <h3 className="text-white/50 text-xs uppercase tracking-widest mb-6 text-center">User DNA Analysis</h3>

                    {loadingProfile ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="size-8 text-white/20 animate-spin" />
                        </div>
                    ) : profile ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <PassportCard
                                archetype={profile.archetype}
                                scores={profile.traits?.scores || {}}
                                className="scale-90 origin-center shadow-none bg-transparent border-none"
                            />
                            <div className="text-center mt-6 p-4 bg-white/5 rounded-xl border border-white/5 w-full">
                                <p className="text-sm text-white/60 mb-1">Concierge Strategy</p>
                                <p className="text-emerald-400 font-medium text-sm">
                                    Suggest {profile.archetype.includes('Luxury') ? 'exclusive upgrades & private transfers' :
                                        profile.archetype.includes('Adventure') ? 'off-the-beaten-path excursions' :
                                            'curated local experiences'}.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
                            <div className="text-center">
                                <p className="mb-2">No Vibe Check Profile</p>
                                <p className="text-xs text-white/40">User hasn't completed the vibe assessment.</p>
                            </div>
                        </div>
                    )}

                    <button onClick={onClose} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
                        <XCircle className="size-8" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}
