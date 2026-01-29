"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Heart, Sparkles, Plane, Hotel, ExternalLink, Loader2, ArrowRight, Zap, Shield, MapPin, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateAffiliateLink } from "@/lib/affiliate"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const SkeletonCard = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-4 mb-3">
            <div className="size-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
            </div>
        </div>
        <div className="flex justify-between items-center pt-2">
            <div className="h-6 bg-white/10 rounded w-1/4" />
            <div className="h-7 bg-white/10 rounded w-1/3" />
        </div>
    </div>
)

interface FlightOffer {
    id: string
    price: { total: string, currency: string }
    itineraries: any[]
    duffel_offer_id?: string // Added for Duffel support
}

interface HotelOffer {
    hotel: { name: string, hotelId: string }
    offers: any[]
    duffel_stay_id?: string // Added for Duffel support
}

interface TravelDealsProps {
    archetype: string
    customDestination?: string
    originCityCode?: string
    onComplete?: (selection: { flight: any, hotel: any }) => void
}

export function TravelDeals({ archetype, customDestination, originCityCode = "CLT", onComplete }: TravelDealsProps) {
    const [flights, setFlights] = useState<FlightOffer[]>([])
    const [hotels, setHotels] = useState<HotelOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedFlight, setSelectedFlight] = useState<string | null>(null)
    const [selectedHotel, setSelectedHotel] = useState<string | null>(null)
    const [intel, setIntel] = useState<any>(null)
    const [loadingIntel, setLoadingIntel] = useState(false)

    const destinations: Record<string, string> = {
        "Adrenaline Junkie": "ZQN", // Queenstown
        "Quiet Luxury Nomad": "MLE", // Maldives
        "Culture Connoisseur": "HND", // Tokyo
        "Zen Master": "DPS", // Bali
        "Gastronomy Globetrotter": "CDG" // Paris
    }
    const dest = customDestination || destinations[archetype] || "JFK"

    const handleAffiliateClick = (type: 'flight' | 'hotel', params: any) => {
        const link = generateAffiliateLink(type, params)
        window.open(link, '_blank')
    }

    useEffect(() => {
        async function fetchDeals() {
            setLoading(true)
            setError(null)
            try {
                // Calculate dynamic dates: 1 month from now
                const today = new Date()
                const futureDate = new Date()
                futureDate.setMonth(today.getMonth() + 2) // 2 months out for better data availability in test env
                const departureStr = futureDate.toISOString().split('T')[0]

                const checkOut = new Date(futureDate)
                checkOut.setDate(futureDate.getDate() + 5)
                const checkOutStr = checkOut.toISOString().split('T')[0]

                // Fetch Flights
                const flightRes = await fetch(`/api/flights/search?origin=${originCityCode}&destination=${dest}&departureDate=${departureStr}&adults=1`)
                const flightData = await flightRes.json()

                // Fetch Hotels
                const hotelRes = await fetch(`/api/hotels/search?cityCode=${dest}`)
                const hotelData = await hotelRes.json()

                if (flightData.error && flightData.error.includes('invalid_client')) {
                    setError("API keys are being activated. Here are some curated deals for you:")
                }

                setFlights(flightData.data || [])
                setHotels(hotelData.data || [])

                // Fetch Intelligence (using mock coordinates for the city if no hotels found, or first hotel's)
                if (hotelData.data?.[0]?.geoCode) {
                    fetchIntel(hotelData.data[0].geoCode.latitude, hotelData.data[0].geoCode.longitude)
                } else {
                    // Default coords for city center if no hotels returned (e.g. Tokyo)
                    const cityCoords: Record<string, { lat: number, lng: number }> = {
                        'HND': { lat: 35.5494, lng: 139.7798 },
                        'MLE': { lat: 4.1755, lng: 73.5093 },
                        'CDG': { lat: 49.0097, lng: 2.5479 },
                        'DPS': { lat: -8.7482, lng: 115.1671 },
                        'ZQN': { lat: -45.0110, lng: 168.7390 },
                        'DXB': { lat: 25.2532, lng: 55.3657 }
                    }
                    const coords = cityCoords[dest] || cityCoords['HND']
                    fetchIntel(coords.lat, coords.lng)
                }
            } catch (err) {
                console.error("Failed to fetch deals", err)
                setError("Unable to load live deals. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        async function fetchIntel(lat: number, lng: number) {
            setLoadingIntel(true)
            try {
                const res = await fetch(`/api/locations/intelligence?latitude=${lat}&longitude=${lng}`)
                const json = await res.json()
                setIntel(json.data)
            } catch (err) {
                console.error("Failed to fetch intelligence", err)
            } finally {
                setLoadingIntel(false)
            }
        }

        fetchDeals()
    }, [archetype, customDestination, dest])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4 opacity-50">
                    <Sparkles className="size-4 text-emerald-500 animate-spin" />
                    <div className="h-4 bg-white/10 rounded w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded w-32 mb-4" />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded w-32 mb-4" />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
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
            <div className="sticky top-0 z-30 bg-neutral-900/40 backdrop-blur-md -mx-4 px-4 py-4 mb-2 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Market Intelligence</h3>
                </div>

                <Button
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold h-10 px-6 rounded-lg group shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all"
                    onClick={() => {
                        console.log("Proceed clicked. Selected Flight:", selectedFlight, "Selected Hotel:", selectedHotel);
                        if (selectedFlight && selectedHotel) {
                            const flight = displayFlights.find((f, idx) => (f.id || idx.toString()) === selectedFlight) || displayFlights[0];
                            const hotel = displayHotels.find((h: any, idx: number) => {
                                const hId = h.hotel?.hotelId || h.hotelId || h.id || `hotel-${idx}`;
                                return hId === selectedHotel;
                            }) || displayHotels[0];

                            // Ensure we pass the clean city code for deep linking
                            const enrichedFlight = { ...flight, origin: originCityCode, destination: dest };
                            const enrichedHotel = { ...hotel, destination: dest };

                            console.log("Passing onComplete with:", { flight: enrichedFlight, hotel: enrichedHotel });
                            onComplete?.({ flight: enrichedFlight, hotel: enrichedHotel });
                        } else {
                            toast.error("Please select both a flight and a hotel to proceed.");
                        }
                    }}
                >
                    <span className="hidden sm:inline">
                        {selectedFlight && selectedHotel ? "Proceed to Secure Booking" : "See Unlimited Explorer Results"}
                    </span>
                    <span className="sm:hidden">
                        {selectedFlight && selectedHotel ? "Checkout" : "Explore Results"}
                    </span>
                    <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] italic">
                    {error}
                </div>
            )}

            {/* AI Intelligence / Vibe Scores */}
            {(intel || loadingIntel) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Gauge className="size-16 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Sparkles className="size-3.5 text-emerald-400" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Neighborhood Intelligence</h4>
                        {!intel?.scores && (
                            <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[7px] text-white/40 uppercase tracking-tighter">
                                Test Env: Fallback Data
                            </div>
                        )}
                    </div>

                    {loadingIntel ? (
                        <div className="flex items-center gap-4 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex-1 h-3 bg-white/10 rounded-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Vibe', score: intel.scores?.nightlife, icon: '🔥' },
                                { label: 'Culture', score: intel.scores?.sightseeing, icon: '🏛️' },
                                { label: 'Safety', score: intel.safety?.overall, icon: '🛡️' },
                                { label: 'Dining', score: intel.scores?.restaurant, icon: '🍷' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-[8px] uppercase tracking-wider text-white/40">
                                        <span>{item.icon} {item.label}</span>
                                        <span className="text-emerald-400">{Math.round((item.score || 50))}</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.score || 50)}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Flights Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-white/90 uppercase tracking-widest font-bold">
                        <Plane className="size-3 text-emerald-400" />
                        <span>Featured Flights</span>
                    </div>
                    {displayFlights.map((flight, idx) => (
                        <motion.div
                            key={flight.id || idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -2, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-shadow">
                                    <Plane className="size-5 text-emerald-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{originCityCode} → {dest}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="text-[10px] text-white/40 uppercase font-medium">Economy · {flight.itineraries?.[0]?.duration?.replace('PT', '').toLowerCase() || '14h'}</div>
                                        <div className="size-1 rounded-full bg-white/20" />
                                        <div className="flex items-center gap-1 text-[9px] text-emerald-400/80">
                                            <Zap className="size-2.5" /> Direct
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right relative z-10">
                                <div className="text-xs text-white/30 line-through mb-0.5">${(parseFloat(flight.price.total.replace(',', '')) * 1.2).toFixed(2)}</div>
                                <div className="text-lg font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">${flight.price.total}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-[10px] px-2 text-white/60 hover:text-white hover:bg-emerald-500/20 transition-all"
                                        onClick={() => handleAffiliateClick('flight', {
                                            origin: originCityCode,
                                            destination: dest,
                                            checkIn: '2026-06-01'
                                        })}
                                    >
                                        Compare <ExternalLink className="size-3 ml-1" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className={cn(
                                            "h-7 text-[10px] px-3 transition-all rounded-full",
                                            selectedFlight === (flight.id || idx.toString())
                                                ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400"
                                                : "text-white/60 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white"
                                        )}
                                        onClick={() => {
                                            const id = flight.id || idx.toString()
                                            const isSelecting = selectedFlight !== id
                                            setSelectedFlight(isSelecting ? id : null)
                                            toast.success(isSelecting ? "Flight selected for Safar" : "Flight removed")
                                        }}
                                    >
                                        {selectedFlight === (flight.id || idx.toString()) ? "Selected" : "Select"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Hotels Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-white/90 uppercase tracking-widest font-bold">
                        <Hotel className="size-3 text-cyan-400" />
                        <span>Top Accommodations</span>
                    </div>
                    {displayHotels.map((hotel: any, idx) => {
                        const hotelName = hotel.hotel?.name || hotel.name || "Premium Stay";
                        const hotelId = hotel.hotel?.hotelId || hotel.hotelId || `hotel-${idx}`;
                        const price = hotel.offers?.[0]?.price?.total || "850";

                        return (
                            <motion.div
                                key={hotelId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -2, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-shadow">
                                        <Hotel className="size-5 text-cyan-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{hotelName}</div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="flex items-center gap-1 text-[9px] text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                                                <Sparkles className="size-2.5" /> Top Rated
                                            </div>
                                            <div className="flex items-center gap-1 text-[9px] text-white/40 uppercase">
                                                <MapPin className="size-2.5" /> {dest}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <div className="text-lg font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">${price}</div>
                                    <div className="text-[8px] text-white/30 uppercase tracking-tighter mb-2">Per Night</div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-[10px] px-2 text-white/60 hover:text-white hover:bg-cyan-500/20 transition-all"
                                            onClick={() => handleAffiliateClick('hotel', {
                                                name: hotelName,
                                                destination: dest
                                            })}
                                        >
                                            Compare <ExternalLink className="size-3 ml-1" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className={cn(
                                                "h-7 text-[10px] px-3 transition-all rounded-full",
                                                selectedHotel === (hotelId)
                                                    ? "bg-cyan-500/20 border border-cyan-500 text-cyan-400"
                                                    : "text-white/60 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-white"
                                            )}
                                            onClick={() => {
                                                const isSelecting = selectedHotel !== hotelId
                                                setSelectedHotel(isSelecting ? hotelId : null)
                                                toast.success(isSelecting ? "Accommodation selected" : "Accommodation removed")
                                            }}
                                        >
                                            {selectedHotel === (hotelId) ? "Selected" : "Select"}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

        </div>
    )
}
