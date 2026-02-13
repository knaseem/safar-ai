import { NextResponse } from "next/server"
import { createStayQuote, createStayBooking } from "@/lib/duffel"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Auth guard — require logged-in user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json(
                { error: "Authentication required to book a stay" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { rateId, passengers, email, phone_number, tripName, destination } = body

        // 1. Create a Quote (Lock Price)
        const quote = await createStayQuote(rateId)
        if (!quote) {
            throw new Error("Failed to create quote. Rate may be unavailable.")
        }

        // 2. Create Booking
        const booking = await createStayBooking({
            quoteId: quote.id,
            passengers,
            email,
            phone_number
        })

        // 3. Save to Database (Booking Request & Saved Trip)
        // user already verified from auth guard above
        // Log the booking
        await supabase.from('booking_requests').insert({
            user_id: user.id,
            trip_name: tripName || `Hotel Booking in ${destination}`,
            destination: destination || 'Unknown',
            status: 'booked',
            duffel_order_id: booking.id,
            trip_type: 'stay',
            details: booking // Save full booking response
        })

        // Save to My Trips
        await supabase.from('saved_trips').insert({
            user_id: user.id,
            trip_name: tripName || `Hotel Stay - ${destination}`,
            destination: destination,
            is_halal: false,
            trip_data: {
                type: 'stay_booking',
                bookingId: booking.id,
                reference: booking.reference,
                details: booking
            }
        })

        return NextResponse.json({ booking })
    } catch (error: any) {
        console.error("Stay Booking API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to book stay" },
            { status: 500 }
        )
    }
}
