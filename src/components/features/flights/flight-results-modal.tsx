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

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
                onClick={onClose}
            >
                <div
                    className="relative w-full max-w-4xl min-h-[60vh] bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-neutral-900/95 backdrop-blur z-20">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Plane className="size-6 text-sky-400" />
                                Flights to {searchParams?.destination}
                            </h2>
                            <p className="text-white/50 text-sm">
                                {searchParams?.origin} → {searchParams?.destination} • {new Date(searchParams?.departureDate).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Results List */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {(!results.offers || results.offers.length === 0) ? (
                            <div className="text-center py-20 text-white/40">
                                No flights found. Try different dates or airports (e.g. JFK to LHR).
                            </div>
                        ) : (
                            results.offers.map((offer: any) => {
                                // Assume first slice for display simplicity
                                const segment = offer.slices[0].segments[0];
                                const carrier = segment.operating_carrier?.name || offer.owner?.name || "Airline";
                                const duration = offer.slices[0].duration; // PT Format

                                // Format Duration (Simple)
                                const durationClean = duration?.replace("PT", "").toLowerCase() || "Direct";

                                return (
                                    <div
                                        key={offer.id}
                                        className="bg-white/5 border border-white/10 hover:border-sky-500/50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group transition-all"
                                    >
                                        {/* Airline Logo/Name */}
                                        <div className="flex items-center gap-4 min-w-[200px]">
                                            <div className="size-12 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs uppercase overflow-hidden">
                                                {/* If we had logos, we'd put them here. Initials for now */}
                                                {carrier.substring(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{carrier}</h3>
                                                <span className="text-xs text-white/40">Flight {segment.operating_carrier_flight_number}</span>
                                            </div>
                                        </div>

                                        {/* Schedule */}
                                        <div className="flex-1 flex items-center justify-center gap-8 text-center">
                                            <div>
                                                <div className="text-xl font-bold text-white">
                                                    {segment.departing_at ? new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </div>
                                                <div className="text-xs text-white/40">{segment.origin?.iata_code || 'N/A'}</div>
                                            </div>

                                            <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                                <span className="text-xs text-white/30">{durationClean}</span>
                                                <div className="w-full h-px bg-white/20 relative">
                                                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-3 text-white/50 rotate-90" />
                                                </div>
                                                <span className="text-[10px] text-emerald-400 font-medium">Direct</span>
                                            </div>

                                            <div>
                                                <div className="text-xl font-bold text-white">
                                                    {segment.arriving_at ? new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </div>
                                                <div className="text-xs text-white/40">{segment.destination?.iata_code || 'N/A'}</div>
                                            </div>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="flex flex-col items-end gap-2 min-w-[150px]">
                                            <div className="text-2xl font-bold text-white">
                                                {offer.total_currency} {offer.total_amount}
                                            </div>
                                            <Button
                                                onClick={() => handleSelectFlight(offer)}
                                                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl"
                                            >
                                                Select <ArrowRight className="size-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
