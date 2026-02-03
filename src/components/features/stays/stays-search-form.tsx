"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MapPin, Users, Search } from "lucide-react"
import { toast } from "sonner"

interface StaysSearchFormProps {
    onSearch: (params: any) => void
    loading: boolean
}

export function StaysSearchForm({ onSearch, loading }: StaysSearchFormProps) {
    const [location, setLocation] = useState("") // Actual value sent to API (lat,lng)
    const [displayLocation, setDisplayLocation] = useState("") // Value shown in input
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [checkIn, setCheckIn] = useState<Date | null>(null)
    const [checkOut, setCheckOut] = useState<Date | null>(null)
    const [guests, setGuests] = useState(2)

    const handleSubmit = () => {
        if (!location) {
            toast.error("Where are you going?", { description: "Please enter a location." })
            return
        }
        if (!checkIn || !checkOut) {
            toast.error("When are you going?", { description: "Please select check-in and check-out dates." })
            return
        }

        onSearch({
            location, // coordinates for API
            locationName: displayLocation, // friendly name for UI
            checkIn,
            checkOut,
            guests
        })
    }

    return (
        <div className="w-full max-w-4xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Location Input */}
                <div className="flex-1 w-full relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        type="text"
                        value={displayLocation}
                        onChange={(e) => {
                            setDisplayLocation(e.target.value)
                            // Basic debounce manually or just fetch on every keystroke for now (optimize later if needed)
                            if (e.target.value.length > 2) {
                                fetch(`/api/locations/search?keyword=${e.target.value}&type=CITY`)
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.data) {
                                            setSuggestions(data.data)
                                            setShowSuggestions(true)
                                        }
                                    })
                                    .catch(err => console.error(err))
                            } else {
                                setSuggestions([])
                                setShowSuggestions(false)
                            }
                        }}
                        placeholder="Where to? (e.g. London, New York)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion: any, index: number) => (
                                <button
                                    key={index}
                                    className="w-full text-left px-4 py-3 hover:bg-white/10 text-white text-sm flex items-center gap-2 transition-colors"
                                    onClick={() => {
                                        setDisplayLocation(suggestion.name) // Show Name "NEW YORK"
                                        // Pass "lat,lng" to the actual location state used for search
                                        const lat = suggestion.geoCode?.latitude || 0
                                        const lng = suggestion.geoCode?.longitude || 0
                                        setLocation(`${lat},${lng}`)
                                        setShowSuggestions(false)
                                    }}
                                >
                                    <MapPin className="size-4 text-emerald-400" />
                                    <span>{suggestion.name}</span>
                                    {suggestion.iataCode && <span className="text-white/30 text-xs ml-auto font-mono">{suggestion.iataCode}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date Picker */}
                <div className="flex-1 w-full relative z-40">
                    <DateRangePicker
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onDateChange={(inDate, outDate) => {
                            setCheckIn(inDate)
                            setCheckOut(outDate)
                        }}
                        className="w-full"
                    />
                </div>

                {/* Guests */}
                <div className="w-full md:w-32">
                    <div className="relative h-[58px] flex items-center bg-white/5 border border-white/10 rounded-xl px-4 hover:bg-white/10 transition-colors">
                        <Users className="size-5 text-white/50 mr-3" />
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-xs text-white/40 uppercase tracking-wider font-bold">Guests</span>
                            <select
                                value={guests}
                                onChange={(e) => setGuests(Number(e.target.value))}
                                className="bg-transparent border-none outline-none text-sm font-medium text-white appearance-none cursor-pointer w-full"
                            >
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                    <option key={num} value={num} className="bg-neutral-900 text-white">{num} Guests</option>
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
                    className="w-full md:w-auto h-[58px] px-8 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
                >
                    {loading ? (
                        "Searching..."
                    ) : (
                        <>
                            <Search className="size-5 mr-2" />
                            Search
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
