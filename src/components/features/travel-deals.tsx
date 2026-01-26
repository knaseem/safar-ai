"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plane, Hotel, ExternalLink, Sparkles, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateAffiliateLink } from "@/lib/affiliate"

interface FlightOffer {
    id: string
    price: { total: string, currency: string }
    itineraries: any[]
}

interface HotelOffer {
    hotel: { name: string, hotelId: string }
    offers: any[]
}

interface TravelDealsProps {
    archetype: string
}

export function TravelDeals({ archetype }: TravelDealsProps) {
    const [flights, setFlights] = useState<FlightOffer[]>([])
    const [hotels, setHotels] = useState<HotelOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const destinations: Record<string, string> = {
        "Adrenaline Junkie": "ZQN", // Queenstown
        "Quiet Luxury Nomad": "MLE", // Maldives
        "Culture Connoisseur": "HND", // Tokyo
        "Zen Master": "DPS", // Bali
        "Gastronomy Globetrotter": "CDG" // Paris
    }
    const dest = destinations[archetype] || "JFK"

    const handleAffiliateClick = (type: 'flight' | 'hotel', params: any) => {
        const link = generateAffiliateLink(type, params)
        window.open(link, '_blank')
    }

    useEffect(() => {
        async function fetchDeals() {
            setLoading(true)
            setError(null)
            try {
                // Mocking destination based on archetype for now
                // In production, this would be dynamic

                // Fetch Flights
                const flightRes = await fetch(`/api/flights/search?origin=SYD&destination=${dest}&departureDate=2026-06-01&adults=1`)
                const flightData = await flightRes.json()

                // Fetch Hotels
                const hotelRes = await fetch(`/api/hotels/search?cityCode=${dest}`)
                const hotelData = await hotelRes.json()

                if (flightData.error && flightData.error.includes('invalid_client')) {
                    // Gracefully handle key error for now with mock data if keys are invalid
                    setError("API keys are being activated. Here are some curated deals for you:")
                }

                setFlights(flightData.data || [])
                setHotels(hotelData.data || [])
            } catch (err) {
                console.error("Failed to fetch deals", err)
                setError("Unable to load live deals. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchDeals()
    }, [archetype])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-white/50 space-y-4">
                <Loader2 className="size-8 animate-spin text-emerald-500" />
                <p className="text-sm animate-pulse">Scanning live global markets for {archetype} vibes...</p>
            </div>
        )
    }

    // fallback data if keys are not working yet
    const displayFlights = flights.length > 0 ? flights : [
        { id: "1", price: { total: "1,240", currency: "USD" }, itineraries: [{ duration: "PT14H" }] },
        { id: "2", price: { total: "980", currency: "USD" }, itineraries: [{ duration: "PT16H" }] }
    ]

    const displayHotels = hotels.length > 0 ? hotels : [
        { hotel: { name: "Aman Tokyo", hotelId: "1" }, offers: [{ price: { total: "1,850", currency: "USD" } }] },
        { hotel: { name: "Four Seasons", hotelId: "2" }, offers: [{ price: { total: "1,200", currency: "USD" } }] }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-4 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Curated Deals for You</h3>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] italic">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Flights Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider">
                        <Plane className="size-3" />
                        <span>Featured Flights</span>
                    </div>
                    {displayFlights.map((flight, idx) => (
                        <motion.div
                            key={flight.id || idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Plane className="size-5 text-emerald-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">SYD → {archetype === "Quiet Luxury Nomad" ? "MLE" : "HND"}</div>
                                    <div className="text-[10px] text-white/40 uppercase">Economy · Non-stop</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-emerald-400">${flight.price.total}</div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-[10px] px-2 text-white/60 group-hover:text-white group-hover:bg-emerald-500/20"
                                    onClick={() => handleAffiliateClick('flight', {
                                        origin: 'SYD',
                                        destination: dest,
                                        checkIn: '2026-06-01'
                                    })}
                                >
                                    View on Expedia <ExternalLink className="size-3 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Hotels Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider">
                        <Hotel className="size-3" />
                        <span>Top Accommodations</span>
                    </div>
                    {displayHotels.map((hotel: any, idx) => {
                        const hotelName = hotel.hotel?.name || hotel.name || "Premium Stay";
                        const hotelId = hotel.hotel?.hotelId || hotel.hotelId || `hotel-${idx}`;
                        const price = hotel.offers?.[0]?.price?.total || "850";

                        return (
                            <motion.div
                                key={hotelId}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                        <Hotel className="size-5 text-cyan-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{hotelName}</div>
                                        <div className="text-[10px] text-white/40 uppercase">Recommended Stay</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-cyan-400">${price}</div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-[10px] px-2 text-white/60 group-hover:text-white group-hover:bg-cyan-500/20"
                                        onClick={() => handleAffiliateClick('hotel', {
                                            name: hotelName,
                                            destination: dest
                                        })}
                                    >
                                        Book on Expedia <ExternalLink className="size-3 ml-1" />
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold h-12 rounded-xl group">
                See Unlimited Explorer Results
                <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
        </div>
    )
}
