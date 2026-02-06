import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { BookingRequest } from "@/types/booking"

// GET: Retrieve user's booking history
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: bookings, error } = await supabase
            .from("booking_requests")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching bookings:", error)
            return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
        }

        return NextResponse.json({ bookings })
    } catch (error) {
        console.error("Booking GET error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST: Save a new booking request
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body: Omit<BookingRequest, 'status'> = await req.json()

        // Validate required fields
        if (!body.trip_name || !body.check_in || !body.check_out || !body.contact?.email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const bookingData = {
            user_id: user.id,
            trip_id: body.trip_id || null,
            trip_name: body.trip_name,
            destination: body.destination,
            is_halal: body.is_halal || false,
            departure_city: body.departure_city,
            departure_code: body.departure_code,
            check_in: body.check_in,
            check_out: body.check_out,
            travelers: body.travelers,
            room_type: body.room_type,
            flight_class: body.flight_class,
            seat_preference: body.seat_preference || 'no-preference',
            baggage_count: body.baggage_count || 1,
            dietary_requirements: body.dietary_requirements || null,
            is_special_occasion: body.is_special_occasion || false,
            occasion_type: body.occasion_type || null,
            contact_first_name: body.contact.firstName,
            contact_last_name: body.contact.lastName,
            contact_email: body.contact.email,
            contact_phone: body.contact.phone,
            travel_insurance: body.travel_insurance || false,
            special_requests: body.special_requests || null,
            estimated_price: body.estimated_price,
            insurance_price: body.insurance_price || 0,
            status: 'pending'
        }

        const { data: booking, error } = await supabase
            .from("booking_requests")
            .insert(bookingData)
            .select()
            .single()

        if (error) {
            console.error("Error saving booking:", error)
            return NextResponse.json({ error: "Failed to save booking" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            booking,
            confirmation_code: `SAFAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        })
    } catch (error) {
        console.error("Booking POST error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PATCH: Update booking status (User marking complete)
export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id, status } = await req.json()

        if (!id || status !== 'booked') {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const { data: updated, error } = await supabase
            .from("booking_requests")
            .update({ status: 'booked' })
            .eq("id", id)
            .eq("user_id", user.id) // Security: Must own the booking
            .select()
            .single()

        if (error) {
            console.error("Error updating booking:", error)
            return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
        }

        return NextResponse.json({ success: true, booking: updated })
    } catch (error) {
        console.error("Booking PATCH error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE: Remove a booking request
export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 })
        }

        const { error } = await supabase
            .from("booking_requests")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id) // Security: Must own the booking

        if (error) {
            console.error("Error deleting booking:", error)
            return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Booking DELETE error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
