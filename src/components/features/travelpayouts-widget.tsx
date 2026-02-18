"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MapPin, Users, Plane, Search, Loader2, Building2 } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"

// Popular airports shown when input is empty/focused
const POPULAR_AIRPORTS = [
    { iataCode: 'JFK', name: 'New York JFK', cityName: 'New York' },
    { iataCode: 'LHR', name: 'London Heathrow', cityName: 'London' },
    { iataCode: 'DXB', name: 'Dubai International', cityName: 'Dubai' },
    { iataCode: 'CDG', name: 'Charles de Gaulle', cityName: 'Paris' },
    { iataCode: 'SIN', name: 'Singapore Changi', cityName: 'Singapore' },
    { iataCode: 'IST', name: 'Istanbul Airport', cityName: 'Istanbul' },
]

export function TravelpayoutsWidget({ className = '' }: { className?: string }) {
    const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights')

    // FLIGHTS STATE
    const [origin, setOrigin] = useState("") // IATA Code
    const [destination, setDestination] = useState("") // IATA Code
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
    const [checkIn, setCheckIn] = useState<Date | null>(null)
    const [checkOut, setCheckOut] = useState<Date | null>(null)
    const [passengers, setPassengers] = useState(1)

    // HOTELS STATE
    const [hotelLocation, setHotelLocation] = useState("")
    const [hotelSearch, setHotelSearch] = useState("")
    const [hotelSuggestions, setHotelSuggestions] = useState<any[]>([])
    const [showHotelSuggestions, setShowHotelSuggestions] = useState(false)
    const [hotelLoading, setHotelLoading] = useState(false)
    const [hotelHighlightIndex, setHotelHighlightIndex] = useState(-1)

    // Debounce
    const debouncedFromSearch = useDebounce(fromSearch, 300)
    const debouncedToSearch = useDebounce(toSearch, 300)
    const debouncedHotelSearch = useDebounce(hotelSearch, 300)

    // Refs
    const fromRef = useRef<HTMLDivElement>(null)
    const toRef = useRef<HTMLDivElement>(null)
    const hotelRef = useRef<HTMLDivElement>(null)

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (fromRef.current && !fromRef.current.contains(event.target as Node)) setShowFromSuggestions(false)
            if (toRef.current && !toRef.current.contains(event.target as Node)) setShowToSuggestions(false)
            if (hotelRef.current && !hotelRef.current.contains(event.target as Node)) setShowHotelSuggestions(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch Suggestions Helper
    const fetchLocations = async (keyword: string, setter: (data: any[]) => void, loader: (l: boolean) => void, shower: (s: boolean) => void) => {
        if (keyword.length > 1) {
            loader(true)
            try {
                const res = await fetch(`/api/locations/search?keyword=${encodeURIComponent(keyword)}`)
                const data = await res.json()
                if (data.data) {
                    setter(data.data)
                    shower(true)
                }
            } catch (err) {
                console.error("Location search failed", err)
            } finally {
                loader(false)
            }
        }
    }

    useEffect(() => { fetchLocations(debouncedFromSearch, setFromSuggestions, setFromLoading, setShowFromSuggestions) }, [debouncedFromSearch])
    useEffect(() => { fetchLocations(debouncedToSearch, setToSuggestions, setToLoading, setShowToSuggestions) }, [debouncedToSearch])
    useEffect(() => { fetchLocations(debouncedHotelSearch, setHotelSuggestions, setHotelLoading, setShowHotelSuggestions) }, [debouncedHotelSearch])

    // Handle Flight Search Redirect
    const handleFlightSearch = async () => {
        // If already loading, prevent double submissions
        if (fromLoading || toLoading) return

        let finalOrigin = origin
        let finalDest = destination

        // Formatting Helper
        const formatDate = (date: Date) => {
            const d = date.getDate().toString().padStart(2, '0')
            const m = (date.getMonth() + 1).toString().padStart(2, '0')
            return `${d}${m}`
        }

        // 1. Resolve Origin if missing but text exists
        if (!finalOrigin && fromSearch.trim()) {
            setFromLoading(true)
            try {
                const res = await fetch(`/api/locations/search?keyword=${encodeURIComponent(fromSearch.trim())}`)
                const data = await res.json()
                if (data.data && data.data.length > 0) {
                    finalOrigin = data.data[0].iataCode
                    setOrigin(finalOrigin) // Update state for future use
                    setFromSearch(data.data[0].name) // Update text to match resolved
                }
            } catch (error) {
                console.error("Failed to auto-resolve origin:", error)
            } finally {
                setFromLoading(false)
            }
        }

        // 2. Resolve Destination if missing but text exists
        if (!finalDest && toSearch.trim()) {
            setToLoading(true)
            try {
                const res = await fetch(`/api/locations/search?keyword=${encodeURIComponent(toSearch.trim())}`)
                const data = await res.json()
                if (data.data && data.data.length > 0) {
                    finalDest = data.data[0].iataCode
                    setDestination(finalDest)
                    setToSearch(data.data[0].name)
                }
            } catch (error) {
                console.error("Failed to auto-resolve destination:", error)
            } finally {
                setToLoading(false)
            }
        }

        // 3. Validation
        if (!finalOrigin || !finalDest || !checkIn) {
            toast.error("Please fill in all fields", {
                description: !finalOrigin ? "Origin city not found" : !finalDest ? "Destination city not found" : "Select a departure date"
            })
            return
        }

        // 4. Construct URL and Redirect
        const departStr = formatDate(checkIn)
        const returnStr = checkOut ? formatDate(checkOut) : ''
        // Pattern: origin + date (DDMM) + destination + return_date (DDMM) + passengers (1)

        const path = `${origin}${departStr}${destination}${returnStr}${passengers}`
        // Use internal route which now hosts the White Label
        const url = `/flights/${path}`

        console.log("Opening URL:", url);
        window.open(url, '_self')
    }

    // Handle Hotel Search Redirect
    const handleHotelSearch = () => {
        console.log("handleHotelSearch triggered", { hotelSearch, checkIn, passengers });

        if (!hotelSearch || !checkIn) {
            console.warn("Validation failed: Missing fields");
            toast.error("Please select a location and check-in date")
            return
        }
        // For hotels, the simple query param works best on WL
        // https://travel.safar-ai.co/hotels?destination=Name&checkIn=...

        const checkInStr = checkIn.toISOString().split('T')[0]
        const checkOutStr = checkOut ? checkOut.toISOString().split('T')[0] : checkInStr // Fallback if 1 day

        const params = new URLSearchParams()
        params.append('destination', hotelSearch) // Using text name as WL often resolves it or IATA if available
        params.append('checkIn', checkInStr)
        params.append('checkOut', checkOutStr)
        params.append('adults', passengers.toString())
        params.append('children', '0')
        params.append('currency', 'usd')
        params.append('language', 'en')

        const url = `/hotels?${params.toString()}`
        console.log("Opening URL:", url);
        window.open(url, '_self')
    }

    const renderSuggestion = (item: any, onClick: () => void) => (
        <button
            key={item.iataCode}
            onClick={onClick}
            className="w-full text-left px-4 py-3 text-white text-sm flex items-center justify-between hover:bg-white/10 transition-colors"
        >
            <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-white/40 text-xs block">{item.address?.cityName || item.name}</span>
            </div>
            {item.iataCode && <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded">{item.iataCode}</span>}
        </button>
    )

    return (
        <div className={`w-full ${className}`}>
            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-black/20 p-1 rounded-full border border-white/10 backdrop-blur-md flex gap-1">
                    <button
                        onClick={() => setActiveTab('flights')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'flights' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                    >
                        Flights
                    </button>
                    <button
                        onClick={() => setActiveTab('hotels')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'hotels' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                    >
                        Hotels
                    </button>
                </div>
            </div>

            {/* FLIGHTS FORM */}
            {activeTab === 'flights' && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Origin */}
                        <div ref={fromRef} className="flex-1 relative group">
                            <Plane className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50" />
                            <input
                                type="text"
                                placeholder="From"
                                value={fromSearch}
                                onChange={(e) => { setFromSearch(e.target.value); if (e.target.value.length < 2) setShowFromSuggestions(true) }}
                                onFocus={() => setShowFromSuggestions(true)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                            {showFromSuggestions && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                    {(fromSearch.length > 1 ? fromSuggestions : POPULAR_AIRPORTS).map(item =>
                                        renderSuggestion(item, () => {
                                            setFromSearch(item.name)
                                            setOrigin(item.iataCode)
                                            setShowFromSuggestions(false)
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Destination */}
                        <div ref={toRef} className="flex-1 relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50" />
                            <input
                                type="text"
                                placeholder="To"
                                value={toSearch}
                                onChange={(e) => { setToSearch(e.target.value); if (e.target.value.length < 2) setShowToSuggestions(true) }}
                                onFocus={() => setShowToSuggestions(true)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                            {showToSuggestions && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                    {(toSearch.length > 1 ? toSuggestions : POPULAR_AIRPORTS).map(item =>
                                        renderSuggestion(item, () => {
                                            setToSearch(item.name)
                                            setDestination(item.iataCode)
                                            setShowToSuggestions(false)
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-[2]">
                            <DateRangePicker
                                checkIn={checkIn}
                                checkOut={checkOut}
                                onDateChange={(inD, outD) => { setCheckIn(inD); setCheckOut(outD) }}
                                className="w-full"
                            />
                        </div>

                        <div className="flex-1 min-w-[140px]">
                            <div className="relative h-[50px] flex items-center bg-white/5 border border-white/10 rounded-xl px-4">
                                <Users className="size-5 text-white/50 mr-3" />
                                <select
                                    value={passengers}
                                    onChange={(e) => setPassengers(Number(e.target.value))}
                                    className="bg-transparent border-none outline-none text-white w-full cursor-pointer appearance-none"
                                >
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n} className="bg-neutral-900">{n} Passenger{n > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                        </div>

                        <Button
                            onClick={handleFlightSearch}
                            className="h-[50px] px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all whitespace-nowrap"
                        >
                            Search Flights
                        </Button>
                    </div>
                </div>
            )}

            {/* HOTELS FORM */}
            {activeTab === 'hotels' && (
                <div className="flex flex-col gap-4">
                    <div ref={hotelRef} className="relative group w-full">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50" />
                        <input
                            type="text"
                            placeholder="Data, City, or Hotel Name"
                            value={hotelSearch}
                            onChange={(e) => { setHotelSearch(e.target.value); if (e.target.value.length < 2) setShowHotelSuggestions(true) }}
                            onFocus={() => setShowHotelSuggestions(true)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                        {showHotelSuggestions && hotelSearch.length > 2 && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                {hotelSuggestions.map(item =>
                                    renderSuggestion(item, () => {
                                        setHotelSearch(item.name)
                                        // setHotelLocation(item.iataCode) // Hotels might use name
                                        setShowHotelSuggestions(false)
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-[2]">
                            <DateRangePicker
                                checkIn={checkIn}
                                checkOut={checkOut}
                                onDateChange={(inD, outD) => { setCheckIn(inD); setCheckOut(outD) }}
                                className="w-full"
                            />
                        </div>
                        <Button
                            onClick={handleHotelSearch}
                            className="h-[50px] px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all whitespace-nowrap"
                        >
                            Search Hotels
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
