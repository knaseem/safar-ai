"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plane, ArrowRight, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface FlightResultsModalProps {
    isOpen: boolean
    onClose: () => void
    results: any
    searchParams: any
}

export function FlightResultsModal({ isOpen, onClose, results, searchParams }: FlightResultsModalProps) {
    const router = useRouter()

    const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'duration'>('price_asc')
    const [selectedAirline, setSelectedAirline] = useState<string>('all')

    const handleSelectFlight = (offer: any) => {
        const params = new URLSearchParams()
        params.set("offer_id", offer.id)
        params.set("type", "flight")
        params.set("price", offer.total_amount)
        params.set("currency", offer.total_currency)

        // Context
        params.set("origin", searchParams.origin)
        params.set("destination", searchParams.destination)
        if (searchParams.departureDate) params.set("date", new Date(searchParams.departureDate).toISOString())
        if (searchParams.adults) params.set("adults", searchParams.adults.toString())

        toast.loading("Redirecting to checkout...")
        router.push(`/checkout?${params.toString()}`)
    }

    if (!isOpen) return null

    // Process Results
    const offers = results?.offers || []

    // 1. Extract Unique Airlines
    const airlines = Array.from(new Set(offers.map((o: any) => {
        const segment = o.slices[0].segments[0];
        return segment.operating_carrier?.name || o.owner?.name || "Airline";
    }))).sort() as string[]

    // 2. Filter & Sort
    const filteredOffers = offers
        .filter((offer: any) => {
            if (selectedAirline === 'all') return true;
            const segment = offer.slices[0].segments[0];
            const carrier = segment.operating_carrier?.name || offer.owner?.name || "Airline";
            return carrier === selectedAirline;
        })
        .sort((a: any, b: any) => {
            if (sortBy === 'price_asc') return parseFloat(a.total_amount) - parseFloat(b.total_amount);
            if (sortBy === 'price_desc') return parseFloat(b.total_amount) - parseFloat(a.total_amount);
            if (sortBy === 'duration') {
                // Simple duration parsing (PT2H30M -> minutes)
                const getDuration = (iso: string) => {
                    // Very basic ISO8601 duration parser for sorting
                    // Duffel returns PTxxHxxM usually
                    return iso.length; // Proxy for now as parsing IS08601 fully is complex without libs
                };
                return getDuration(a.slices[0].duration) - getDuration(b.slices[0].duration);
            }
            return 0;
        });

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                onClick={onClose}
            >
                <div
                    className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 bg-neutral-900/95 backdrop-blur z-20">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Plane className="size-6 text-sky-400" />
                                Flights to {searchParams?.destination}
                            </h2>
                            <p className="text-white/50 text-sm">
                                {searchParams?.origin} → {searchParams?.destination} • {new Date(searchParams?.departureDate).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedAirline}
                                onChange={(e) => setSelectedAirline(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
                            >
                                <option value="all" className="bg-neutral-900">All Airlines</option>
                                {airlines.map(airline => (
                                    <option key={airline} value={airline} className="bg-neutral-900">{airline}</option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
                            >
                                <option value="price_asc" className="bg-neutral-900">Cheapest First</option>
                                <option value="price_desc" className="bg-neutral-900">Most Expensive</option>
                                {/* Duration sort is approximate strictly for sorting */}
                            </select>

                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {filteredOffers.length === 0 ? (
                            <div className="text-center py-20 text-white/40">
                                No flights found matching your filter.
                            </div>
                        ) : (
                            filteredOffers.map((offer: any) => {
                                // Assume first slice for display simplicity
                                const segment = offer.slices[0].segments[0];
                                const carrier = segment.operating_carrier?.name || offer.owner?.name || "Airline";
                                const duration = offer.slices[0].duration; // PT Format

                                // Format Duration (Simple)
                                const durationClean = duration?.replace("PT", "").toLowerCase() || "Direct";

                                return (
                                    filteredOffers.map((offer: any) => {
                                        // Iterate over slices to show Outbound + Return
                                        return (
                                            <div
                                                key={offer.id}
                                                className="bg-white/5 border border-white/10 hover:border-sky-500/50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group transition-all"
                                            >
                                                {/* Airline Info (Taken from first slice for simplicity, though could differ) */}
                                                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 min-w-[150px]">
                                                    <div className="size-12 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs uppercase overflow-hidden shrink-0">
                                                        {(offer.slices[0].segments[0].operating_carrier?.name || "AL").substring(0, 2)}
                                                    </div>
                                                    <div className="text-center md:text-left">
                                                        <h3 className="font-bold text-white text-sm">
                                                            {offer.owner?.name || offer.slices[0].segments[0].operating_carrier?.name}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {/* Slices (Outbound / Return) */}
                                                <div className="flex-1 flex flex-col gap-4 w-full">
                                                    {offer.slices.map((slice: any, sIdx: number) => {
                                                        const segment = slice.segments[0];
                                                        const duration = slice.duration?.replace("PT", "").toLowerCase() || "Direct";
                                                        const isReturn = sIdx > 0;

                                                        return (
                                                            <div key={sIdx} className="flex items-center justify-between gap-4 w-full bg-black/20 p-3 rounded-xl border border-white/5">
                                                                {/* Label */}
                                                                <div className="hidden md:block w-20 text-[10px] uppercase font-bold text-white/30 tracking-wider">
                                                                    {isReturn ? "Return" : "Outbound"}
                                                                </div>

                                                                {/* Origin */}
                                                                <div className="text-center">
                                                                    <div className="text-lg font-bold text-white leading-none">
                                                                        {new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                    <div className="text-xs text-white/40 font-mono mt-1">{segment.origin?.iata_code}</div>
                                                                </div>

                                                                {/* Duration Line */}
                                                                <div className="flex flex-col items-center gap-1 flex-1 px-4">
                                                                    <span className="text-[10px] text-white/30">{duration}</span>
                                                                    <div className="w-full h-px bg-white/10 relative">
                                                                        <Plane
                                                                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-3 text-white/30 ${isReturn ? '-rotate-90' : 'rotate-90'}`}
                                                                        />
                                                                    </div>
                                                                    <span className="text-[10px] text-emerald-400 font-medium whitespace-nowrap">
                                                                        {slice.segments.length > 1 ? `${slice.segments.length - 1} Stop` : "Direct"}
                                                                    </span>
                                                                </div>

                                                                {/* Dest */}
                                                                <div className="text-center">
                                                                    <div className="text-lg font-bold text-white leading-none">
                                                                        {new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                    <div className="text-xs text-white/40 font-mono mt-1">{segment.destination?.iata_code}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {/* Price & Action */}
                                                <div className="flex flex-col items-end gap-2 min-w-[120px] pl-4 border-l border-white/5">
                                                    <div className="text-2xl font-bold text-white">
                                                        {offer.total_currency} {Math.round(parseFloat(offer.total_amount))}
                                                    </div>
                                                    <Button
                                                        onClick={() => handleSelectFlight(offer)}
                                                        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl h-10 text-sm"
                                                    >
                                                        Select <ArrowRight className="size-4 ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )
                            }
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
