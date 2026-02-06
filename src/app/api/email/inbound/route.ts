import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseBookingEmail, extractTextFromHtml, isLikelyBookingEmail } from "@/lib/email-parser"
import { groupBookingsIntoTrips } from "@/lib/trip-merger"
import crypto from "crypto"

// Verify Resend webhook signature
function verifyResendSignature(payload: string, signature: string | null, secret: string): boolean {
    if (!signature || !secret) return false

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )
}

export async function POST(request: Request) {
    try {
        const rawBody = await request.text()
        const signature = request.headers.get('resend-signature')
        const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

        // Verify webhook signature if secret is configured
        if (webhookSecret && !verifyResendSignature(rawBody, signature, webhookSecret)) {
            console.warn("[EmailInbound] Invalid webhook signature")
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }

        const payload = JSON.parse(rawBody)

        // Resend inbound email payload structure
        const {
            from,
            to,
            subject,
            text,
            html
        } = payload

        // Extract user from recipient email
        // Format: {user-token}@import.safar-ai.com
        const recipientEmail = Array.isArray(to) ? to[0] : to
        const userToken = recipientEmail?.split('@')[0]

        if (!userToken) {
            console.warn("[EmailInbound] No user token in recipient email")
            return NextResponse.json({ error: "Invalid recipient" }, { status: 400 })
        }

        // Look up user by their import token
        const supabase = await createClient()
        const { data: userProfile, error: profileError } = await supabase
            .from("travel_profiles")
            .select("user_id")
            .eq("import_token", userToken)
            .single()

        if (profileError || !userProfile) {
            console.warn("[EmailInbound] User not found for token:", userToken)
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const userId = userProfile.user_id

        // Get email content - prefer text, fall back to HTML
        const emailContent = text || (html ? extractTextFromHtml(html) : '')

        if (!emailContent || !isLikelyBookingEmail(emailContent)) {
            console.log("[EmailInbound] Email does not appear to be a booking:", subject)
            // Still acknowledge receipt
            return NextResponse.json({
                success: true,
                message: "Email received but does not appear to be a booking confirmation"
            })
        }

        // Parse the email
        const parseResult = await parseBookingEmail(emailContent)

        if (!parseResult.success || parseResult.bookings.length === 0) {
            console.log("[EmailInbound] No bookings found in email:", subject)
            return NextResponse.json({
                success: true,
                message: "Email received but no bookings could be extracted"
            })
        }

        // Store raw email for reference
        await supabase.from("imported_bookings").insert(
            parseResult.bookings.map(booking => ({
                user_id: userId,
                raw_email: emailContent.substring(0, 10000), // Limit storage
                parsed_data: booking,
                booking_type: booking.type,
                confirmation_number: booking.confirmationNumber,
                start_date: booking.startDate,
                end_date: booking.endDate || booking.startDate
            }))
        )

        // Group and create trips
        const trips = groupBookingsIntoTrips(parseResult.bookings)

        for (const trip of trips) {
            // Check if trip with same date range exists
            const { data: existingTrip } = await supabase
                .from("saved_trips")
                .select("id, trip_data")
                .eq("user_id", userId)
                .eq("source", "email_import")
                .gte("created_at", new Date(new Date(trip.startDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
                .single()

            if (existingTrip) {
                // Update existing trip with new bookings
                console.log("[EmailInbound] Merging with existing trip:", existingTrip.id)
                // For now, skip - could implement merge logic
            } else {
                // Create new trip
                const { error: tripError } = await supabase
                    .from("saved_trips")
                    .insert({
                        user_id: userId,
                        trip_name: trip.trip_name,
                        trip_data: trip.tripData,
                        destination: trip.destination,
                        source: 'email_import'
                    })

                if (tripError) {
                    console.error("[EmailInbound] Failed to create trip:", tripError)
                } else {
                    console.log("[EmailInbound] Created trip:", trip.trip_name)
                }
            }
        }

        // TODO: Send user a notification that their booking was imported

        return NextResponse.json({
            success: true,
            message: `Imported ${parseResult.bookings.length} booking(s)`,
            bookingsCount: parseResult.bookings.length,
            tripsCount: trips.length
        })

    } catch (error) {
        console.error("[EmailInbound] Error:", error)
        return NextResponse.json(
            { error: "Failed to process email" },
            { status: 500 }
        )
    }
}
