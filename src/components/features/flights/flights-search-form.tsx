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
    const [origin, setOrigin] = useState("") // IATA Code
    const [destination, setDestination] = useState("") // IATA Code

    // Autocomplete State
    const [fromSearch, setFromSearch] = useState("")
    const [toSearch, setToSearch] = useState("")
    const [fromSuggestions, setFromSuggestions] = useState<any[]>([])
    const [toSuggestions, setToSuggestions] = useState<any[]>([])
    const [showFromSuggestions, setShowFromSuggestions] = useState(false)
    const [showToSuggestions, setShowToSuggestions] = useState(false)
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
                        value={fromSearch}
                        onChange={(e) => {
                            setFromSearch(e.target.value)
                            if (e.target.value.length > 1) {
                                fetch(`/api/locations/search?keyword=${e.target.value}`)
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.data) {
                                            setFromSuggestions(data.data)
                                            setShowFromSuggestions(true)
                                        }
                                    })
                            } else {
                                setFromSuggestions([])
                                setShowFromSuggestions(false)
                            }
                        }}
                        placeholder="From"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium uppercase"
                    />
                    {showFromSuggestions && fromSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                            {fromSuggestions.map((suggestion: any, index: number) => (
                                <button
                                    key={index}
                                    className="w-full text-left px-4 py-3 hover:bg-white/10 text-white text-sm flex items-center justify-between transition-colors"
                                    onClick={() => {
                                        setFromSearch(`${suggestion.name} (${suggestion.iataCode})`)
                                        setOrigin(suggestion.iataCode)
                                        setShowFromSuggestions(false)
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{suggestion.name}</span>
                                        <span className="text-white/40 text-xs">{suggestion.address?.cityName || suggestion.name}</span>
                                    </div>
                                    <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-1 rounded">{suggestion.iataCode}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Destination Input */}
                <div className="flex-1 w-full relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        type="text"
                        value={toSearch}
                        onChange={(e) => {
                            setToSearch(e.target.value)
                            if (e.target.value.length > 1) {
                                fetch(`/api/locations/search?keyword=${e.target.value}`)
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.data) {
                                            setToSuggestions(data.data)
                                            setShowToSuggestions(true)
                                        }
                                    })
                            } else {
                                setToSuggestions([])
                                setShowToSuggestions(false)
                            }
                        }}
                        placeholder="To"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium uppercase"
                    />
                    {showToSuggestions && toSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                            {toSuggestions.map((suggestion: any, index: number) => (
                                <button
                                    key={index}
                                    className="w-full text-left px-4 py-3 hover:bg-white/10 text-white text-sm flex items-center justify-between transition-colors"
                                    onClick={() => {
                                        setToSearch(`${suggestion.name} (${suggestion.iataCode})`)
                                        setDestination(suggestion.iataCode)
                                        setShowToSuggestions(false)
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{suggestion.name}</span>
                                        <span className="text-white/40 text-xs">{suggestion.address?.cityName || suggestion.name}</span>
                                    </div>
                                    <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-1 rounded">{suggestion.iataCode}</span>
                                </button>
                            ))}
                        </div>
                    )}
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
