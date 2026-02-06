import { NextResponse } from "next/server"
import { searchStays } from "@/lib/duffel"
import { chatRatelimit, isRateLimitEnabled, getRateLimitIdentifier } from "@/lib/ratelimit"

export async function POST(request: Request) {
    try {
        // Rate limiting check
        if (isRateLimitEnabled()) {
            const identifier = getRateLimitIdentifier(request)
            const { success, remaining } = await chatRatelimit.limit(identifier)

            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please wait a moment before trying again." },
                    { status: 429, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
                )
            }
        }

        const body = await request.json()
        const { location, checkIn, checkOut, adults } = body

        if (!location || !checkIn || !checkOut) {
            return NextResponse.json(
                { error: "Missing required fields: location, checkIn, checkOut" },
                { status: 400 }
            )
        }

        const results = await searchStays({
            location,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            adults: adults || 1
        })

        return NextResponse.json(results)
    } catch (error: any) {
        console.error("Stays Search API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to search stays" },
            { status: 500 }
        )
    }
}
