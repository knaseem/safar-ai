"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Star, MapPin, Wifi, Coffee, Car, Check, BedDouble, Users, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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

    // Reset when closing
    const handleClose = () => {
        setSelectedHotel(null)
        setRooms([])
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
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
                onClick={handleClose}
            >
                <div
                    className="relative w-full max-w-5xl min-h-[80vh] bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-neutral-900/95 backdrop-blur z-20">
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
                                    <h2 className="text-2xl font-bold text-white">Stays in {searchParams?.location}</h2>
                                    <p className="text-white/50 text-sm">
                                        {searchParams?.checkIn ? new Date(searchParams.checkIn).toLocaleDateString() : ''}
                                        {searchParams?.checkOut ? ` - ${new Date(searchParams.checkOut).toLocaleDateString()}` : ''}
                                        {searchParams?.guests ? ` • ${searchParams.guests} Guests` : ''}
                                    </p>
                                </>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {!selectedHotel ? (
                            /* HOTEL LIST */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.length === 0 ? (
                                    <div className="col-span-full text-center py-20 text-white/40">
                                        No hotels found directly. Try a different city or check affiliate partners.
                                    </div>
                                ) : (
                                    results.map((hotel, index) => (
                                        <div
                                            key={hotel.id || index}
                                            className="group bg-black/40 border border-white/10 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
                                        >
                                            {/* Image (Mock if missing) */}
                                            <div className="aspect-video bg-neutral-800 relative">
                                                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                                    <MapPin className="size-8" />
                                                </div>
                                                {hotel.media?.[0]?.url && (
                                                    <img
                                                        src={hotel.media[0].url}
                                                        alt={hotel.name}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
                                                        {hotel.name}
                                                    </h3>
                                                    {hotel.rating && (
                                                        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full text-xs font-bold">
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
                                        </div>
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
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/50">
                                                    <span className="flex items-center gap-1"><Users className="size-4" /> 2 Guests</span>
                                                    <span className="flex items-center gap-1"><Wifi className="size-4" /> Free Wifi</span>
                                                    {rate.board_type && <span className="uppercase text-emerald-400 text-xs font-bold border border-emerald-500/20 px-2 py-0.5 rounded">{rate.board_type}</span>}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                                                <div className="text-2xl font-bold text-white">
                                                    {rate.total_currency} {rate.total_amount}
                                                </div>
                                                <span className="text-xs text-white/40">Total for {searchParams?.guests} guests</span>
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
