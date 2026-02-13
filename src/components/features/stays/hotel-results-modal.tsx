"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Star, MapPin, Wifi, BedDouble, Users, ArrowRight, Loader2, ArrowUpDown, TrendingDown, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Fallback hotel images when Duffel doesn't return media (common in test mode)
const FALLBACK_HOTEL_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800",
]

type SortOption = 'default' | 'price-low' | 'price-high' | 'rating'

interface HotelResultsModalProps {
    isOpen: boolean
    onClose: () => void
    results: any[]
    searchParams: any
    onSelectHotel: (hotelId: string) => void
}

export function HotelResultsModal({ isOpen, onClose, results, searchParams, onSelectHotel }: HotelResultsModalProps) {
    const router = useRouter()
    const [selectedHotel, setSelectedHotel] = useState<any | null>(null)
    const [rooms, setRooms] = useState<any[]>([])
    const [loadingRooms, setLoadingRooms] = useState(false)
    const [sortBy, setSortBy] = useState<SortOption>('default')

    // Sort results based on selected option
    const sortedResults = useMemo(() => {
        if (!results || results.length === 0) return []

        const sorted = [...results]
        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => {
                    const priceA = parseFloat(a.cheapest_rate_total_amount) || 0
                    const priceB = parseFloat(b.cheapest_rate_total_amount) || 0
                    return priceA - priceB
                })
            case 'price-high':
                return sorted.sort((a, b) => {
                    const priceA = parseFloat(a.cheapest_rate_total_amount) || 0
                    const priceB = parseFloat(b.cheapest_rate_total_amount) || 0
                    return priceB - priceA
                })
            case 'rating':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
            default:
                return sorted
        }
    }, [results, sortBy])

    // Reset when closing
    const handleClose = () => {
        setSelectedHotel(null)
        setRooms([])
        setSortBy('default')
        onClose()
    }

    const fetchRooms = async (hotel: any) => {
        setSelectedHotel(hotel)
        setLoadingRooms(true)
        try {
            const res = await fetch(`/api/stays/rates?id=${hotel.id}`)
            const data = await res.json()
            if (data.rates) {
                setRooms(data.rates)
            } else {
                toast.error("Could not fetch rates for this hotel.")
            }
        } catch (e) {
            toast.error("Failed to load rooms")
        } finally {
            setLoadingRooms(false)
        }
    }

    const handleBookRoom = (rate: any) => {
        // Prepare checkout parameters
        const params = new URLSearchParams()
        params.set("offer_id", rate.id) // Using Rate ID as Offer ID
        params.set("type", "stay")
        params.set("price", rate.total_amount)
        params.set("currency", rate.total_currency)

        // Context
        if (selectedHotel) params.set("destination", selectedHotel.name)
        if (searchParams?.checkIn) params.set("date", new Date(searchParams.checkIn).toISOString())
        if (searchParams?.guests) params.set("adults", searchParams.guests.toString())

        toast.loading("Redirecting to checkout...")
        router.push(`/checkout?${params.toString()}`)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                onClick={handleClose}
            >
                <div
                    className="relative w-full max-w-5xl max-h-[90vh] bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-900/95 backdrop-blur z-20 shrink-0">
                        <div>
                            {selectedHotel ? (
                                <div>
                                    <button
                                        onClick={() => setSelectedHotel(null)}
                                        className="text-xs text-white/50 hover:text-white uppercase tracking-wider mb-1 flex items-center gap-1"
                                    >
                                        ← Back to Results
                                    </button>
                                    <h2 className="text-2xl font-bold text-white">{selectedHotel.name}</h2>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-white">Stays in {searchParams?.locationName || searchParams?.location}</h2>
                                    <p className="text-white/50 text-sm">
                                        {searchParams?.checkIn ? new Date(searchParams.checkIn).toLocaleDateString() : ''}
                                        {searchParams?.checkOut ? ` - ${new Date(searchParams.checkOut).toLocaleDateString()}` : ''}
                                        {searchParams?.guests ? ` • ${searchParams.guests} Guests` : ''}
                                        {results.length > 0 && ` • ${results.length} hotels found`}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Sort Dropdown - Only show on hotel list */}
                            {!selectedHotel && results.length > 1 && (
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="appearance-none bg-white/10 border border-white/20 text-white text-sm rounded-xl px-4 py-2 pr-10 cursor-pointer hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="default" className="bg-neutral-900">Sort by</option>
                                        <option value="price-low" className="bg-neutral-900">Price: Low to High</option>
                                        <option value="price-high" className="bg-neutral-900">Price: High to Low</option>
                                        <option value="rating" className="bg-neutral-900">Rating: Best First</option>
                                    </select>
                                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-white/50 pointer-events-none" />
                                </div>
                            )}
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Area - Scrollable */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {!selectedHotel ? (
                            /* HOTEL LIST */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedResults.length === 0 ? (
                                    <div className="col-span-full text-center py-20 text-white/40">
                                        No hotels found directly. Try a different city or check affiliate partners.
                                    </div>
                                ) : (
                                    sortedResults.map((hotel, index) => (
                                        <motion.div
                                            key={hotel.id || index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group bg-black/40 border border-white/10 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
                                        >
                                            {/* Image - Always show, with fallback */}
                                            <div className="aspect-video bg-neutral-800 relative overflow-hidden">
                                                <img
                                                    src={hotel.media?.[0]?.url || FALLBACK_HOTEL_IMAGES[index % FALLBACK_HOTEL_IMAGES.length]}
                                                    alt={hotel.name || "Hotel"}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        // If image fails to load, use fallback
                                                        e.currentTarget.src = FALLBACK_HOTEL_IMAGES[index % FALLBACK_HOTEL_IMAGES.length]
                                                    }}
                                                />
                                                {/* Sort indicator badge */}
                                                {sortBy === 'price-low' && index === 0 && (
                                                    <div className="absolute top-2 left-2 bg-emerald-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                        <TrendingDown className="size-3" /> Best Price
                                                    </div>
                                                )}

                                                {/* Sustainable Badge (Deterministic Mock) */}
                                                {(hotel.id?.charCodeAt(0) || 0) % 3 === 0 && (
                                                    <div className="absolute bottom-2 right-2 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                                                        <Leaf className="size-3 fill-emerald-400" /> Eco-Certified
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors line-clamp-2">
                                                        {hotel.name}
                                                    </h3>
                                                    {hotel.rating && (
                                                        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ml-2">
                                                            <Star className="size-3 fill-current" />
                                                            {hotel.rating}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-white/50 text-sm mb-4 line-clamp-2">
                                                    {hotel.description || "Experience luxury and comfort in the heart of the city."}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase text-white/40 font-bold tracking-wider">From</span>
                                                        <span className="text-xl font-bold text-white">
                                                            {hotel.cheapest_rate_currency} {hotel.cheapest_rate_total_amount || "Check Rates"}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        onClick={() => fetchRooms(hotel)}
                                                        className="bg-white text-black hover:bg-emerald-400 font-bold rounded-xl"
                                                    >
                                                        View Rooms
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        ) : (
                            /* ROOM SELECTION */
                            <div className="space-y-6">
                                {loadingRooms ? (
                                    <div className="text-center py-20 text-white/50 flex flex-col items-center gap-4">
                                        <Loader2 className="size-8 text-emerald-500 animate-spin" />
                                        Checking availability...
                                    </div>
                                ) : rooms.length === 0 ? (
                                    <div className="text-center py-20 text-white/40">
                                        No rooms available for these dates.
                                    </div>
                                ) : (
                                    rooms.map((rate: any) => (
                                        <div key={rate.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-emerald-500/30 transition-all">
                                            <div className="size-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                <BedDouble className="size-8 text-white/70" />
                                            </div>

                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="text-xl font-bold text-white mb-1">
                                                    {/* Duffel sometimes nests room type info */}
                                                    {rate.room_type || "Standard Room"}
                                                </h3>
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/50 mb-3">
                                                    <span className="flex items-center gap-1"><Users className="size-4" /> 2 Guests</span>
                                                    <span className="flex items-center gap-1"><Wifi className="size-4" /> Free Wifi</span>
                                                    {rate.board_type && <span className="uppercase text-emerald-400 text-xs font-bold border border-emerald-500/20 px-2 py-0.5 rounded">{rate.board_type}</span>}
                                                </div>

                                                {/* Go-Live Compliance: Policies & Conditions */}
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {rate.conditions?.cancellation_deadline ? (
                                                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                                            Free Cancellation until {new Date(rate.conditions.cancellation_deadline).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded border border-white/10">
                                                            Non-Refundable
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-white/40">
                                                    {rate.conditions?.check_in_instructions && (
                                                        <p className="line-clamp-1" title={rate.conditions.check_in_instructions}>
                                                            Check-in: {rate.conditions.check_in_instructions}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center md:items-end gap-1 shrink-0">
                                                {/* Price Breakdown Tooltip/Display */}
                                                <div className="text-2xl font-bold text-white leading-none">
                                                    {rate.total_currency} {rate.total_amount}
                                                </div>
                                                <span className="text-xs text-white/40">Total for {searchParams?.guests} guests</span>

                                                {/* Tax & Fee Breakdown */}
                                                {(rate.tax_amount || rate.fee_amount) && (
                                                    <div className="text-[10px] text-white/30 text-right space-y-0.5 mb-2">
                                                        {rate.base_amount && <div>Base: {rate.total_currency} {rate.base_amount}</div>}
                                                        {rate.tax_amount && <div>+ Tax: {rate.total_currency} {rate.tax_amount}</div>}
                                                        {rate.fee_amount && <div>+ Fees: {rate.total_currency} {rate.fee_amount}</div>}
                                                        {rate.due_at_accommodation_amount && (
                                                            <div className="text-orange-400">
                                                                Due at hotel: {rate.total_currency} {rate.due_at_accommodation_amount}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <Button
                                                    onClick={() => handleBookRoom(rate)}
                                                    className="w-full md:w-auto px-8 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl flex items-center gap-2"
                                                >
                                                    Select Room <ArrowRight className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

