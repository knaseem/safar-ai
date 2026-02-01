"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MapPin, Users, Plane, Search } from "lucide-react"
import { toast } from "sonner"

interface FlightsSearchFormProps {
    onSearch: (params: any) => void
    loading: boolean
}

export function FlightsSearchForm({ onSearch, loading }: FlightsSearchFormProps) {
    const [origin, setOrigin] = useState("")
    const [destination, setDestination] = useState("")
    const [checkIn, setCheckIn] = useState<Date | null>(null) // Departure
    const [checkOut, setCheckOut] = useState<Date | null>(null) // Return (Optional)
    const [passengers, setPassengers] = useState(1)

    const handleSubmit = () => {
        if (!origin || !destination) {
            toast.error("Missing Details", { description: "Please enter both origin and destination cities." })
            return
        }
        if (!checkIn) {
            toast.error("Missing Date", { description: "Please select a departure date." })
            return
        }

        onSearch({
            origin,
            destination,
            departureDate: checkIn,
            returnDate: checkOut,
            adults: passengers
        })
    }

    return (
        <div className="w-full max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Origin Input */}
                <div className="flex-1 w-full relative group">
                    <Plane className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="From"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium uppercase"
                        maxLength={3}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/20 font-mono">IATA</span>
                </div>

                {/* Destination Input */}
                <div className="flex-1 w-full relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="To"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium uppercase"
                        maxLength={3}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/20 font-mono">IATA</span>
                </div>

                {/* Date Picker - Made Wider */}
                <div className="flex-[1.4] w-full relative z-40">
                    <DateRangePicker
                        checkIn={checkIn}
                        checkOut={checkOut}
                        fromLabel="Depart"
                        toLabel="Return"
                        onDateChange={(inDate, outDate) => {
                            setCheckIn(inDate)
                            setCheckOut(outDate)
                        }}
                        className="w-full"
                    />
                </div>

                {/* Passengers */}
                <div className="w-full md:w-32">
                    <div className="relative h-[58px] flex items-center bg-white/5 border border-white/10 rounded-xl px-4 hover:bg-white/10 transition-colors">
                        <Users className="size-5 text-white/50 mr-3" />
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-xs text-white/40 uppercase tracking-wider font-bold">Travelers</span>
                            <select
                                value={passengers}
                                onChange={(e) => setPassengers(Number(e.target.value))}
                                className="bg-transparent border-none outline-none text-sm font-medium text-white appearance-none cursor-pointer w-full"
                            >
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                    <option key={num} value={num} className="bg-neutral-900 text-white">{num}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full md:w-auto h-[58px] px-8 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all"
                >
                    {loading ? (
                        "Searching..."
                    ) : (
                        <>
                            <Search className="size-5 mr-2" />
                            Find Flights
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
