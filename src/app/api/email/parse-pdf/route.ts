import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseBookingEmail, isLikelyBookingEmail } from "@/lib/email-parser"
import { groupBookingsIntoTrips } from "@/lib/trip-merger"
import { chatRatelimit, isRateLimitEnabled, getRateLimitIdentifier } from "@/lib/ratelimit"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

// Use Gemini Vision to extract text from PDF
async function extractPdfText(buffer: Buffer, mimeType: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Convert buffer to base64
    const base64Data = buffer.toString('base64')

    const result = await model.generateContent([
        {
            inlineData: {
                mimeType: mimeType,
                data: base64Data
            }
        },
        "Extract ALL text content from this PDF document. Return the complete text exactly as it appears, preserving important details like confirmation numbers, dates, names, locations, flight numbers, and prices. Return ONLY the extracted text, no commentary."
    ])

    return result.response.text()
}

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

        // Get the form data with PDF file
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const saveToTrips = formData.get('saveToTrips') === 'true'

        if (!file) {
            return NextResponse.json(
                { error: "No PDF file provided" },
                { status: 400 }
            )
        }

        // Validate file type
        if (!file.type.includes('pdf')) {
            return NextResponse.json(
                { error: "File must be a PDF" },
                { status: 400 }
            )
        }

        // Size limit: 10MB (Gemini supports larger files)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "PDF must be under 10MB" },
                { status: 400 }
            )
        }

        // Convert file to buffer and extract text using Gemini
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        let extractedText: string
        try {
            extractedText = await extractPdfText(buffer, file.type)
        } catch (pdfError) {
            console.error("[PDFParse] Failed to extract text:", pdfError)
            return NextResponse.json({
                success: false,
                message: "Could not read PDF. Please try pasting the email text instead.",
                bookings: []
            })
        }

        // Check if it looks like a booking
        const isBooking = isLikelyBookingEmail(extractedText)

        if (!extractedText || !isBooking) {
            return NextResponse.json({
                success: false,
                message: "This PDF doesn't appear to contain booking information.",
                bookings: []
            })
        }

        // Parse the extracted text
        const parseResult = await parseBookingEmail(extractedText)

        if (!parseResult.success || parseResult.bookings.length === 0) {
            return NextResponse.json({
                success: false,
                message: parseResult.error || "No bookings found in the PDF",
                bookings: []
            })
        }

        // Group into trips
        const trips = groupBookingsIntoTrips(parseResult.bookings)

        // Optionally save
        if (saveToTrips && trips.length > 0) {
            for (const trip of trips) {
                // Insert to imported_bookings (optional, may not have table)
                const { error: bookingsError } = await supabase.from("imported_bookings").insert(
                    parseResult.bookings.map(booking => ({
                        user_id: user.id,
                        parsed_data: booking,
                        booking_type: booking.type,
                        confirmation_number: booking.confirmationNumber,
                        start_date: booking.startDate,
                        end_date: booking.endDate || booking.startDate
                    }))
                )

                if (bookingsError) {
                    console.error("[PDFParse] Failed to insert imported_bookings:", bookingsError.message)
                }

                // Insert to saved_trips
                const { data: savedTrip, error: tripError } = await supabase
                    .from("saved_trips")
                    .insert({
                        user_id: user.id,
                        trip_name: trip.trip_name,
                        trip_data: trip.tripData,
                        destination: trip.destination
                    })
                    .select('id')
                    .single()

                if (tripError) {
                    console.error("[PDFParse] Failed to insert saved_trips:", tripError.message)
                    return NextResponse.json({
                        success: false,
                        message: "Failed to save trip: " + tripError.message,
                        bookings: parseResult.bookings
                    })
                }

                // Return with trip ID for navigation
                return NextResponse.json({
                    success: true,
                    message: `Found ${parseResult.bookings.length} booking(s) - saved to "${trip.trip_name}"`,
                    bookings: parseResult.bookings,
                    savedTripId: savedTrip?.id,
                    trips: trips.map(t => ({
                        name: t.trip_name,
                        destination: t.destination,
                        startDate: t.startDate,
                        endDate: t.endDate,
                        bookingCount: t.bookings.length
                    }))
                })
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
        console.error("[PDFParse] Error:", error)
        return NextResponse.json(
            { error: "Failed to process PDF" },
            { status: 500 }
        )
    }
}
