import { NextResponse } from "next/server"
import { createFlightSearch } from "@/lib/duffel"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { origin, destination, departureDate, returnDate, adults } = body

        if (!origin || !destination || !departureDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        console.log(`✈️ [API] Searching flights: ${origin} -> ${destination} on ${departureDate}`)

        // Use the existing library function
        const duffelData = await createFlightSearch({
            origin,
            destination,
            departureDate,
            returnDate: returnDate || undefined,
            adults: adults || 1,
        })

        // The lib function 'createFlightSearch' already returns { offers: [...] } with applied markup
        // We just pass it through.
        return NextResponse.json(duffelData)

    } catch (error: any) {
        console.error("Flight Search Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to search flights" },
            { status: 500 }
        )
    }
}
