import { NextResponse } from "next/server"
import { searchStays } from "@/lib/duffel"

export async function POST(request: Request) {
    try {
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
