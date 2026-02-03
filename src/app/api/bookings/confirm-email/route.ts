import { NextResponse } from "next/server"
import { getOrder, getStayBooking } from "@/lib/duffel"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        const { bookingId, email: providedEmail } = await request.json()

        if (!bookingId) {
            return NextResponse.json(
                { error: "Missing booking ID" },
                { status: 400 }
            )
        }

        // Determine booking type and fetch details
        const isStayBooking = bookingId.startsWith('bk_stay') || bookingId.startsWith('htl_')
        let booking: any = null
        let bookingType: 'flight' | 'stay' = 'flight'

        if (isStayBooking) {
            booking = await getStayBooking(bookingId)
            bookingType = 'stay'
        } else {
            booking = await getOrder(bookingId)
            bookingType = 'flight'
        }

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            )
        }

        // Get user email from auth or provided email
        let recipientEmail = providedEmail
        if (!recipientEmail) {
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()
            recipientEmail = user?.email
        }

        if (!recipientEmail) {
            return NextResponse.json(
                { error: "No email address available" },
                { status: 400 }
            )
        }

        // Build email params based on booking type
        const emailParams = {
            to: recipientEmail,
            subject: `Booking Confirmed - ${booking.reference || booking.id}`,
            bookingReference: booking.reference || booking.booking_reference || booking.id,
            bookingType,
            totalAmount: booking.total_amount,
            currency: booking.total_currency,
            ...(bookingType === 'stay' ? {
                stayDetails: {
                    hotelName: booking.accommodation?.name || 'Hotel',
                    address: booking.accommodation?.address ?
                        `${booking.accommodation.address.line_one}, ${booking.accommodation.address.city}` : '',
                    checkInDate: booking.check_in_date ?
                        new Date(booking.check_in_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '',
                    checkOutDate: booking.check_out_date ?
                        new Date(booking.check_out_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '',
                    checkInTime: booking.accommodation?.check_in_time || '15:00',
                    checkOutTime: booking.accommodation?.check_out_time || '11:00',
                    roomType: booking.rooms?.[0]?.type || 'Standard Room',
                    guests: booking.rooms?.[0]?.guests?.map((g: any) => `${g.given_name} ${g.family_name}`) || ['Guest'],
                    keyCollectionInstructions: booking.key_collection?.instructions,
                    accessCode: booking.key_collection?.access_code,
                    hotelPhone: booking.accommodation?.phone_number
                }
            } : {
                flightDetails: {
                    origin: booking.slices?.[0]?.origin?.iata_code || booking.slices?.[0]?.origin?.city_name || 'Origin',
                    destination: booking.slices?.[0]?.destination?.iata_code || booking.slices?.[0]?.destination?.city_name || 'Destination',
                    departureDate: booking.slices?.[0]?.segments?.[0]?.departing_at ?
                        new Date(booking.slices[0].segments[0].departing_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '',
                    airline: booking.owner?.name || 'Airline',
                    passengers: booking.passengers?.map((p: any) => `${p.given_name} ${p.family_name}`) || ['Passenger']
                }
            })
        }

        const result = await sendBookingConfirmationEmail(emailParams)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to send email" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            emailId: result.emailId,
            sentTo: recipientEmail
        })
    } catch (error: any) {
        console.error("Error sending confirmation email:", error)
        return NextResponse.json(
            { error: error.message || "Failed to send confirmation email" },
            { status: 500 }
        )
    }
}
