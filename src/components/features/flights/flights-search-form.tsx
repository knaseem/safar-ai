"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MapPin, Users, Plane, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"

interface FlightsSearchFormProps {
    onSearch: (params: any) => void
    loading: boolean
}

// Popular airports shown when input is empty/focused
const POPULAR_AIRPORTS = [
    { iataCode: 'JFK', name: 'New York JFK', cityName: 'New York' },
    { iataCode: 'LAX', name: 'Los Angeles International', cityName: 'Los Angeles' },
    { iataCode: 'LHR', name: 'London Heathrow', cityName: 'London' },
    { iataCode: 'DXB', name: 'Dubai International', cityName: 'Dubai' },
    { iataCode: 'CDG', name: 'Charles de Gaulle', cityName: 'Paris' },
    { iataCode: 'SIN', name: 'Singapore Changi', cityName: 'Singapore' },
]

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
    const [fromLoading, setFromLoading] = useState(false)
    const [toLoading, setToLoading] = useState(false)
    const [fromHighlightIndex, setFromHighlightIndex] = useState(-1)
    const [toHighlightIndex, setToHighlightIndex] = useState(-1)

    const [checkIn, setCheckIn] = useState<Date | null>(null) // Departure
    const [checkOut, setCheckOut] = useState<Date | null>(null) // Return (Optional)
    const [passengers, setPassengers] = useState(1)

    // Debounced search values (300ms delay)
    const debouncedFromSearch = useDebounce(fromSearch, 300)
    const debouncedToSearch = useDebounce(toSearch, 300)

    // Refs for click-outside detection
    const fromRef = useRef<HTMLDivElement>(null)
    const toRef = useRef<HTMLDivElement>(null)

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
                setShowFromSuggestions(false)
                setFromHighlightIndex(-1)
            }
            if (toRef.current && !toRef.current.contains(event.target as Node)) {
                setShowToSuggestions(false)
                setToHighlightIndex(-1)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch suggestions for "From" input (debounced)
    useEffect(() => {
        if (debouncedFromSearch.length > 1) {
            setFromLoading(true)
            fetch(`/api/locations/search?keyword=${encodeURIComponent(debouncedFromSearch)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.data) {
                        setFromSuggestions(data.data)
                        setShowFromSuggestions(true)
                    }
                })
                .catch(err => console.error('From search error:', err))
                .finally(() => setFromLoading(false))
        } else if (debouncedFromSearch.length === 0) {
            setFromSuggestions([])
        }
    }, [debouncedFromSearch])

    // Fetch suggestions for "To" input (debounced)
    useEffect(() => {
        if (debouncedToSearch.length > 1) {
            setToLoading(true)
            fetch(`/api/locations/search?keyword=${encodeURIComponent(debouncedToSearch)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.data) {
                        setToSuggestions(data.data)
                        setShowToSuggestions(true)
                    }
                })
                .catch(err => console.error('To search error:', err))
                .finally(() => setToLoading(false))
        } else if (debouncedToSearch.length === 0) {
            setToSuggestions([])
        }
    }, [debouncedToSearch])

    // Keyboard navigation for From input
    const handleFromKeyDown = useCallback((e: React.KeyboardEvent) => {
        const suggestions = fromSearch.length > 1 ? fromSuggestions : POPULAR_AIRPORTS.map(a => ({
            iataCode: a.iataCode,
            name: a.name,
            address: { cityName: a.cityName }
        }))

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setFromHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setFromHighlightIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && fromHighlightIndex >= 0) {
            e.preventDefault()
            const selected = suggestions[fromHighlightIndex]
            if (selected) {
                setFromSearch(selected.name || selected.address?.cityName)
                setOrigin(selected.iataCode)
                setShowFromSuggestions(false)
                setFromHighlightIndex(-1)
            }
        } else if (e.key === 'Escape') {
            setShowFromSuggestions(false)
            setFromHighlightIndex(-1)
        }
    }, [fromSuggestions, fromHighlightIndex, fromSearch])

    // Keyboard navigation for To input
    const handleToKeyDown = useCallback((e: React.KeyboardEvent) => {
        const suggestions = toSearch.length > 1 ? toSuggestions : POPULAR_AIRPORTS.map(a => ({
            iataCode: a.iataCode,
            name: a.name,
            address: { cityName: a.cityName }
        }))

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setToHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setToHighlightIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && toHighlightIndex >= 0) {
            e.preventDefault()
            const selected = suggestions[toHighlightIndex]
            if (selected) {
                setToSearch(selected.name || selected.address?.cityName)
                setDestination(selected.iataCode)
                setShowToSuggestions(false)
                setToHighlightIndex(-1)
            }
        } else if (e.key === 'Escape') {
            setShowToSuggestions(false)
            setToHighlightIndex(-1)
        }
    }, [toSuggestions, toHighlightIndex, toSearch])

    const handleSubmit = async () => {
        let finalOrigin = origin
        let finalDest = destination

        // If origin is empty but user typed something, fetch and resolve it
        if (!finalOrigin && fromSearch.trim()) {
            try {
                const res = await fetch(`/api/locations/search?keyword=${encodeURIComponent(fromSearch.trim())}`)
                const data = await res.json()
                if (data.data && data.data.length > 0) {
                    finalOrigin = data.data[0].iataCode
                    setOrigin(finalOrigin)
                    setFromSearch(data.data[0].name)
                }
            } catch (err) {
                console.error('Failed to resolve origin:', err)
            }
        }

        // If destination is empty but user typed something, fetch and resolve it
        if (!finalDest && toSearch.trim()) {
            try {
                const res = await fetch(`/api/locations/search?keyword=${encodeURIComponent(toSearch.trim())}`)
                const data = await res.json()
                if (data.data && data.data.length > 0) {
                    finalDest = data.data[0].iataCode
                    setDestination(finalDest)
                    setToSearch(data.data[0].name)
                }
            } catch (err) {
                console.error('Failed to resolve destination:', err)
            }
        }

        if (!finalOrigin || !finalDest) {
            toast.error("Missing Details", { description: "Please enter valid origin and destination cities." })
            return
        }
        if (!checkIn) {
            toast.error("Missing Date", { description: "Please select a departure date." })
            return
        }

        onSearch({
            origin: finalOrigin,
            destination: finalDest,
            departureDate: checkIn,
            returnDate: checkOut,
            adults: passengers
        })
    }

    // Render suggestion item
    const renderSuggestionItem = (suggestion: any, index: number, isHighlighted: boolean, onClick: () => void) => (
        <button
            key={suggestion.iataCode + index}
            className={`w-full text-left px-4 py-3 text-white text-sm flex items-center justify-between transition-colors ${isHighlighted ? 'bg-emerald-500/20' : 'hover:bg-white/10'
                }`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
        >
            <div className="flex flex-col">
                <span className="font-medium">{suggestion.name}</span>
                <span className="text-white/40 text-xs">{suggestion.address?.cityName || suggestion.name}</span>
            </div>
            <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-1 rounded">
                {suggestion.iataCode}
            </span>
        </button>
    )

    return (
        <div className="w-full max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Origin Input */}
                <div ref={fromRef} className="flex-[1.5] w-full relative group min-w-[180px]">
                    <Plane className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
                    {fromLoading && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-emerald-400 animate-spin" />
                    )}
                    <input
                        type="text"
                        value={fromSearch}
                        onChange={(e) => {
                            setFromSearch(e.target.value)
                            setFromHighlightIndex(-1)
                            if (e.target.value.length <= 1) {
                                setShowFromSuggestions(true)
                            }
                        }}
                        onFocus={() => setShowFromSuggestions(true)}
                        onKeyDown={handleFromKeyDown}
                        placeholder="From"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium"
                    />
                    {showFromSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                            {fromSearch.length <= 1 && (
                                <div className="px-4 py-2 text-xs text-white/40 uppercase tracking-wider border-b border-white/10">
                                    Popular Destinations
                                </div>
                            )}
                            {(fromSearch.length > 1 ? fromSuggestions : POPULAR_AIRPORTS.map(a => ({
                                iataCode: a.iataCode,
                                name: a.name,
                                address: { cityName: a.cityName }
                            }))).length > 0 ? (
                                (fromSearch.length > 1 ? fromSuggestions : POPULAR_AIRPORTS.map(a => ({
                                    iataCode: a.iataCode,
                                    name: a.name,
                                    address: { cityName: a.cityName }
                                }))).map((suggestion, index) =>
                                    renderSuggestionItem(
                                        suggestion,
                                        index,
                                        index === fromHighlightIndex,
                                        () => {
                                            setFromSearch(suggestion.name)
                                            setOrigin(suggestion.iataCode)
                                            setShowFromSuggestions(false)
                                            setFromHighlightIndex(-1)
                                        }
                                    )
                                )
                            ) : fromSearch.length > 1 && !fromLoading ? (
                                <div className="px-4 py-3 text-white/40 text-sm text-center">
                                    No airports found for "{fromSearch}"
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Destination Input */}
                <div ref={toRef} className="flex-[1.5] w-full relative group min-w-[180px]">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
                    {toLoading && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-emerald-400 animate-spin" />
                    )}
                    <input
                        type="text"
                        value={toSearch}
                        onChange={(e) => {
                            setToSearch(e.target.value)
                            setToHighlightIndex(-1)
                            if (e.target.value.length <= 1) {
                                setShowToSuggestions(true)
                            }
                        }}
                        onFocus={() => setShowToSuggestions(true)}
                        onKeyDown={handleToKeyDown}
                        placeholder="To"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium"
                    />
                    {showToSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                            {toSearch.length <= 1 && (
                                <div className="px-4 py-2 text-xs text-white/40 uppercase tracking-wider border-b border-white/10">
                                    Popular Destinations
                                </div>
                            )}
                            {(toSearch.length > 1 ? toSuggestions : POPULAR_AIRPORTS.map(a => ({
                                iataCode: a.iataCode,
                                name: a.name,
                                address: { cityName: a.cityName }
                            }))).length > 0 ? (
                                (toSearch.length > 1 ? toSuggestions : POPULAR_AIRPORTS.map(a => ({
                                    iataCode: a.iataCode,
                                    name: a.name,
                                    address: { cityName: a.cityName }
                                }))).map((suggestion, index) =>
                                    renderSuggestionItem(
                                        suggestion,
                                        index,
                                        index === toHighlightIndex,
                                        () => {
                                            setToSearch(suggestion.name)
                                            setDestination(suggestion.iataCode)
                                            setShowToSuggestions(false)
                                            setToHighlightIndex(-1)
                                        }
                                    )
                                )
                            ) : toSearch.length > 1 && !toLoading ? (
                                <div className="px-4 py-3 text-white/40 text-sm text-center">
                                    No airports found for "{toSearch}"
                                </div>
                            ) : null}
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
                        <>
                            <Loader2 className="size-5 mr-2 animate-spin" />
                            Searching...
                        </>
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

