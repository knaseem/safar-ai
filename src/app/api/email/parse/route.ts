import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseBookingEmail, extractTextFromHtml, isLikelyBookingEmail } from "@/lib/email-parser"
import { groupBookingsIntoTrips } from "@/lib/trip-merger"
import { chatRatelimit, isRateLimitEnabled, getRateLimitIdentifier } from "@/lib/ratelimit"

export async function POST(request: Request) {
    try {
        // Rate limiting
        if (isRateLimitEnabled()) {
            const identifier = getRateLimitIdentifier(request)
            const { success, remaining } = await chatRatelimit.limit(identifier)

            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please wait a moment." },
                    { status: 429, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
                )
            }
        }

        // Auth check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { emailContent, saveToTrips = false } = body

        if (!emailContent || typeof emailContent !== 'string') {
            return NextResponse.json(
                { error: "Email content is required" },
                { status: 400 }
            )
        }

        // Clean up HTML if present
        const textContent = emailContent.includes('<') && emailContent.includes('>')
            ? extractTextFromHtml(emailContent)
            : emailContent

        // Quick sanity check - is this likely a booking email?
        if (!isLikelyBookingEmail(textContent)) {
            return NextResponse.json({
                success: false,
                message: "This doesn't appear to be a booking confirmation email. Please paste the full email content.",
                bookings: []
            })
        }

        // Parse the email
        const parseResult = await parseBookingEmail(textContent)

        if (!parseResult.success || parseResult.bookings.length === 0) {
            return NextResponse.json({
                success: false,
                message: parseResult.error || "No bookings found in the email",
                bookings: []
            })
        }

        // Group into trips
        const trips = groupBookingsIntoTrips(parseResult.bookings)

        // Optionally save to database
        if (saveToTrips && trips.length > 0) {
            // Save each merged trip
            for (const trip of trips) {
                // Store raw bookings for reference
                await supabase.from("imported_bookings").insert(
                    parseResult.bookings.map(booking => ({
                        user_id: user.id,
                        parsed_data: booking,
                        booking_type: booking.type,
                        confirmation_number: booking.confirmationNumber,
                        start_date: booking.startDate,
                        end_date: booking.endDate || booking.startDate
                    }))
                )

                // Create the trip
                const { error: tripError } = await supabase
                    .from("saved_trips")
                    .insert({
                        user_id: user.id,
                        trip_name: trip.trip_name,
                        trip_data: trip.tripData,
                        destination: trip.destination,
                        source: 'email_import'
                    })

                if (tripError) {
                    console.error("[EmailParse] Failed to save trip:", tripError)
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Found ${parseResult.bookings.length} booking(s) in ${trips.length} trip(s)`,
            bookings: parseResult.bookings,
            trips: trips.map(t => ({
                name: t.trip_name,
                destination: t.destination,
                startDate: t.startDate,
                endDate: t.endDate,
                bookingCount: t.bookings.length
            }))
        })

    } catch (error) {
        console.error("[EmailParse] Error:", error)
        return NextResponse.json(
            { error: "Failed to parse email" },
            { status: 500 }
        )
    }
}
