import { NextResponse } from "next/server"
import { getOrder, getStayBooking } from "@/lib/duffel"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bookingId } = await params

        if (!bookingId) {
            return NextResponse.json(
                { error: "Missing booking ID" },
                { status: 400 }
            )
        }

        // Determine booking type based on ID prefix
        const isStayBooking = bookingId.startsWith('bk_stay') || bookingId.startsWith('htl_')
        const isFlightOrder = bookingId.startsWith('ord_')
        const isMockStay = bookingId.startsWith('bk_stay_mock')
        const isMockFlight = bookingId.startsWith('ord_mock')

        let bookingDetails: any = null
        let type: 'flight' | 'stay' = 'flight'

        if (isStayBooking || isMockStay) {
            type = 'stay'
            bookingDetails = await getStayBooking(bookingId)
        } else if (isFlightOrder || isMockFlight) {
            type = 'flight'
            bookingDetails = await getOrder(bookingId)
        } else {
            // Try flight first (most common), fallback to stay
            try {
                bookingDetails = await getOrder(bookingId)
                type = 'flight'
            } catch {
                bookingDetails = await getStayBooking(bookingId)
                type = 'stay'
            }
        }

        if (!bookingDetails) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            )
        }

        // Normalize response for frontend consumption
        const normalizedResponse = {
            id: bookingDetails.id,
            type,
            reference: bookingDetails.booking_reference || bookingDetails.reference || bookingDetails.id,
            status: bookingDetails.status || 'confirmed',
            created_at: bookingDetails.created_at,

            // Payment info
            total_amount: bookingDetails.total_amount,
            total_currency: bookingDetails.total_currency,
            payment_status: bookingDetails.payment_status || 'paid',

            // Type-specific details
            ...(type === 'flight' ? {
                // Flight-specific
                slices: bookingDetails.slices,
                passengers: bookingDetails.passengers,
                owner: bookingDetails.owner,
                conditions: bookingDetails.conditions
            } : {
                // Stay-specific
                accommodation: bookingDetails.accommodation,
                check_in_date: bookingDetails.check_in_date,
                check_out_date: bookingDetails.check_out_date,
                rooms: bookingDetails.rooms,
                key_collection: bookingDetails.key_collection,
                cancellation_policy: bookingDetails.cancellation_policy
            })
        }

        return NextResponse.json(normalizedResponse)
    } catch (error: any) {
        console.error("Error fetching booking:", error)
        return NextResponse.json(
            { error: error.message || "Failed to fetch booking details" },
            { status: 500 }
        )
    }
}
