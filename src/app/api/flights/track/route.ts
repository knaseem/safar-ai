import { NextResponse } from "next/server"
import { generalRatelimit, isRateLimitEnabled, getRateLimitIdentifier } from "@/lib/ratelimit"
import { getAirport, getAirlineName, AIRPORT_COORDS } from "@/lib/airports-db"

// In-memory cache for flight tracking data (5-minute TTL)
const trackingCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(request: Request) {
    try {
        // Rate limiting
        if (isRateLimitEnabled()) {
            const identifier = getRateLimitIdentifier(request)
            const { success } = await generalRatelimit.limit(identifier)
            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests" },
                    { status: 429 }
                )
            }
        }

        const { searchParams } = new URL(request.url)
        const flightNumber = searchParams.get("flight")
        const depIata = searchParams.get("dep")
        const arrIata = searchParams.get("arr")
        const depTime = searchParams.get("dep_time") // ISO departure time

        if (!flightNumber) {
            return NextResponse.json(
                { error: "Missing flight number" },
                { status: 400 }
            )
        }

        // Check cache first
        const cacheKey = flightNumber.toUpperCase()
        const cached = trackingCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json(cached.data)
        }

        const apiKey = process.env.AVIATIONSTACK_API_KEY

        // If API key exists, try live tracking
        if (apiKey) {
            try {
                const res = await fetch(
                    `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`,
                    { next: { revalidate: 300 } }
                )
                const apiData = await res.json()

                if (apiData.data && apiData.data.length > 0) {
                    const flight = apiData.data[0]
                    const trackingData = {
                        status: flight.flight_status || "unknown",
                        live: flight.live ? {
                            latitude: flight.live.latitude,
                            longitude: flight.live.longitude,
                            altitude: flight.live.altitude,
                            speed_horizontal: flight.live.speed_horizontal,
                            direction: flight.live.direction,
                            is_ground: flight.live.is_ground,
                        } : null,
                        departure: {
                            airport: flight.departure?.airport,
                            iata: flight.departure?.iata,
                            scheduled: flight.departure?.scheduled,
                            actual: flight.departure?.actual,
                            terminal: flight.departure?.terminal,
                            gate: flight.departure?.gate,
                        },
                        arrival: {
                            airport: flight.arrival?.airport,
                            iata: flight.arrival?.iata,
                            scheduled: flight.arrival?.scheduled,
                            estimated: flight.arrival?.estimated,
                            terminal: flight.arrival?.terminal,
                            gate: flight.arrival?.gate,
                        },
                        airline: {
                            name: flight.airline?.name,
                            iata: flight.airline?.iata,
                        },
                        flight: {
                            number: flight.flight?.iata,
                        },
                        source: "live"
                    }

                    // Cache it
                    trackingCache.set(cacheKey, { data: trackingData, timestamp: Date.now() })
                    return NextResponse.json(trackingData)
                }
            } catch (apiErr) {
                console.error("AviationStack API error:", apiErr)
                // Fall through to simulated tracking
            }
        }

        // Simulated tracking based on departure time and route
        const simulatedData = generateSimulatedTracking(
            flightNumber,
            depIata || "JFK",
            arrIata || "LHR",
            depTime
        )

        trackingCache.set(cacheKey, { data: simulatedData, timestamp: Date.now() })
        return NextResponse.json(simulatedData)

    } catch (error: any) {
        console.error("Flight Track Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to track flight" },
            { status: 500 }
        )
    }
}

function generateSimulatedTracking(
    flightNumber: string, depIata: string, arrIata: string, depTime?: string | null
) {
    const dep = getAirport(depIata)
    const arr = getAirport(arrIata)

    // Calculate progress based on departure time
    const now = Date.now()
    const departure = depTime ? new Date(depTime).getTime() : now - 2 * 3600000 // default: 2h ago
    const flightDuration = calculateFlightDuration(dep, arr)
    const elapsed = now - departure
    const progress = Math.max(0, Math.min(1, elapsed / flightDuration))

    // Interpolate position along great circle
    const position = interpolateGreatCircle(dep, arr, progress)

    // Determine status
    let status = "scheduled"
    if (progress <= 0) status = "scheduled"
    else if (progress < 0.02) status = "departing"
    else if (progress >= 1) status = "landed"
    else status = "en-route"

    // Simulate altitude (cruise at ~35,000ft)
    let altitude = 0
    if (status === "en-route") {
        if (progress < 0.1) altitude = progress * 10 * 35000
        else if (progress > 0.9) altitude = (1 - progress) * 10 * 35000
        else altitude = 35000 + Math.sin(progress * Math.PI * 4) * 500
    }

    // Simulate speed (cruise ~550mph)
    const speed = status === "en-route" ? 550 + Math.sin(progress * Math.PI * 2) * 20 : 0

    return {
        status,
        live: status === "en-route" || status === "departing" ? {
            latitude: position.lat,
            longitude: position.lng,
            altitude: Math.round(altitude),
            speed_horizontal: Math.round(speed),
            direction: calculateBearing(position, arr),
            is_ground: false,
            progress: Math.round(progress * 100),
        } : null,
        departure: {
            airport: dep.name,
            iata: depIata.toUpperCase(),
            scheduled: new Date(departure).toISOString(),
            actual: progress > 0 ? new Date(departure).toISOString() : null,
        },
        arrival: {
            airport: arr.name,
            iata: arrIata.toUpperCase(),
            scheduled: new Date(departure + flightDuration).toISOString(),
            estimated: new Date(departure + flightDuration).toISOString(),
        },
        airline: {
            name: getAirlineName(flightNumber),
            iata: flightNumber.replace(/[0-9]/g, ""),
        },
        flight: { number: flightNumber.toUpperCase() },
        route: {
            departure: { lat: dep.lat, lng: dep.lng },
            arrival: { lat: arr.lat, lng: arr.lng },
            waypoints: generateGreatCircleWaypoints(dep, arr, 20),
        },
        source: "simulated"
    }
}

function calculateFlightDuration(
    dep: { lat: number; lng: number },
    arr: { lat: number; lng: number }
): number {
    // Haversine distance in km, then estimate time at ~850 km/h average
    const R = 6371
    const dLat = (arr.lat - dep.lat) * Math.PI / 180
    const dLon = (arr.lng - dep.lng) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(dep.lat * Math.PI / 180) * Math.cos(arr.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return (distance / 850) * 3600000 // time in ms
}

function interpolateGreatCircle(
    dep: { lat: number; lng: number },
    arr: { lat: number; lng: number },
    fraction: number
): { lat: number; lng: number } {
    const lat1 = dep.lat * Math.PI / 180
    const lng1 = dep.lng * Math.PI / 180
    const lat2 = arr.lat * Math.PI / 180
    const lng2 = arr.lng * Math.PI / 180

    const d = 2 * Math.asin(Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
    ))

    if (d < 0.0001) return { lat: dep.lat, lng: dep.lng }

    const A = Math.sin((1 - fraction) * d) / Math.sin(d)
    const B = Math.sin(fraction * d) / Math.sin(d)

    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2)
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2)
    const z = A * Math.sin(lat1) + B * Math.sin(lat2)

    return {
        lat: Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI,
        lng: Math.atan2(y, x) * 180 / Math.PI,
    }
}

function generateGreatCircleWaypoints(
    dep: { lat: number; lng: number },
    arr: { lat: number; lng: number },
    numPoints: number
): { lat: number; lng: number }[] {
    const points: { lat: number; lng: number }[] = []
    for (let i = 0; i <= numPoints; i++) {
        points.push(interpolateGreatCircle(dep, arr, i / numPoints))
    }
    return points
}

function calculateBearing(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
): number {
    const lat1 = from.lat * Math.PI / 180
    const lat2 = to.lat * Math.PI / 180
    const dLng = (to.lng - from.lng) * Math.PI / 180
    const y = Math.sin(dLng) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
}
