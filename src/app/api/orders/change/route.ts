import { NextResponse } from "next/server"
import { createOrderChangeRequest, getOrderChangeOffer, confirmOrderChange } from "@/lib/duffel"

// POST: Search for alternatives (Create Request)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { orderId, sliceIds, origin, destination, departureDate } = body

        if (!orderId || !sliceIds || !departureDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const changeRequest = await createOrderChangeRequest({
            orderId,
            sliceIds,
            origin,
            destination,
            departureDate
        })

        return NextResponse.json(changeRequest)
    } catch (error: any) {
        console.error("Change Request Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to search for changes" },
            { status: 500 }
        )
    }
}

// GET: Get Quote (Preview Offer)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('offer_id')

    if (!offerId) {
        return NextResponse.json({ error: "Missing offer_id" }, { status: 400 })
    }

    try {
        const offer = await getOrderChangeOffer(offerId)
        return NextResponse.json(offer)
    } catch (error: any) {
        console.error("Change Quote Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to get quote" },
            { status: 500 }
        )
    }
}

// PUT: Confirm Change (Pay & Execute)
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { offerId, payment } = body

        if (!offerId || !payment) {
            return NextResponse.json({ error: "Missing offerId or payment details" }, { status: 400 })
        }

        const confirmed = await confirmOrderChange(offerId, payment)
        return NextResponse.json({ success: true, data: confirmed })
    } catch (error: any) {
        console.error("Confirm Change Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to confirm change" },
            { status: 500 }
        )
    }
}
