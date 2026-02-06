import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export interface ParsedBooking {
    type: 'flight' | 'hotel' | 'train' | 'activity' | 'car_rental'
    confirmationNumber: string
    provider: string
    startDate: string // ISO date string
    endDate?: string // ISO date string
    location: {
        city: string
        country: string
        coordinates?: { lat: number; lng: number }
    }
    details: {
        // Flight specific
        origin?: string
        destination?: string
        airline?: string
        flightNumber?: string
        departureTime?: string
        arrivalTime?: string
        passengers?: string[]
        // Hotel specific
        hotelName?: string
        address?: string
        checkInTime?: string
        checkOutTime?: string
        roomType?: string
        guests?: number
        // Activity specific
        activityName?: string
        duration?: string
        meetingPoint?: string
        // Generic
        [key: string]: unknown
    }
    rawAmount?: string
    currency?: string
}

export interface EmailParseResult {
    success: boolean
    bookings: ParsedBooking[]
    error?: string
}

const EXTRACTION_PROMPT = `You are an expert at extracting booking information from confirmation emails.

Analyze the following email content and extract ALL booking information. Return a JSON array of bookings found.

For each booking, extract:
- type: "flight", "hotel", "train", "activity", or "car_rental"
- confirmationNumber: the booking/confirmation reference
- provider: airline name, hotel chain, tour company, etc.
- startDate: ISO date format (YYYY-MM-DD)
- endDate: ISO date format if applicable
- location: { city, country }
- details: object with type-specific fields

For flights include: origin, destination, airline, flightNumber, departureTime, arrivalTime, passengers
For hotels include: hotelName, address, checkInTime, checkOutTime, roomType, guests
For activities include: activityName, duration, meetingPoint
For all: rawAmount and currency if price is shown

If you cannot find a confirmation email or cannot parse booking info, return an empty array.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.

Email content:
---
{EMAIL_CONTENT}
---

JSON output:`

/**
 * Parse email content and extract booking information using AI
 */
export async function parseBookingEmail(emailContent: string): Promise<EmailParseResult> {
    if (!emailContent || emailContent.trim().length < 50) {
        return {
            success: false,
            bookings: [],
            error: "Email content is too short or empty"
        }
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const prompt = EXTRACTION_PROMPT.replace("{EMAIL_CONTENT}", emailContent)

        const result = await model.generateContent(prompt)
        const response = result.response.text()

        // Clean up response - remove markdown code blocks if present
        let cleanedResponse = response.trim()
        if (cleanedResponse.startsWith("```json")) {
            cleanedResponse = cleanedResponse.slice(7)
        }
        if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.slice(3)
        }
        if (cleanedResponse.endsWith("```")) {
            cleanedResponse = cleanedResponse.slice(0, -3)
        }
        cleanedResponse = cleanedResponse.trim()

        // Parse the JSON response
        const bookings: ParsedBooking[] = JSON.parse(cleanedResponse)

        if (!Array.isArray(bookings)) {
            return {
                success: false,
                bookings: [],
                error: "AI response was not an array"
            }
        }

        // Validate and normalize each booking
        const validBookings = bookings.filter(booking => {
            return (
                booking.type &&
                booking.confirmationNumber &&
                booking.startDate &&
                booking.location?.city
            )
        }).map(booking => ({
            ...booking,
            // Normalize dates to ISO format
            startDate: normalizeDate(booking.startDate),
            endDate: booking.endDate ? normalizeDate(booking.endDate) : undefined,
        }))

        return {
            success: true,
            bookings: validBookings
        }
    } catch (error) {
        console.error("[EmailParser] Parse error:", error)
        return {
            success: false,
            bookings: [],
            error: error instanceof Error ? error.message : "Failed to parse email"
        }
    }
}

/**
 * Extract plain text from HTML email content
 */
export function extractTextFromHtml(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

    // Convert common HTML elements to readable text
    text = text.replace(/<br\s*\/?>/gi, '\n')
    text = text.replace(/<\/p>/gi, '\n\n')
    text = text.replace(/<\/div>/gi, '\n')
    text = text.replace(/<\/tr>/gi, '\n')
    text = text.replace(/<\/li>/gi, '\n')
    text = text.replace(/<\/h[1-6]>/gi, '\n\n')

    // Remove remaining HTML tags
    text = text.replace(/<[^>]+>/g, '')

    // Decode HTML entities
    text = text.replace(/&nbsp;/gi, ' ')
    text = text.replace(/&amp;/gi, '&')
    text = text.replace(/&lt;/gi, '<')
    text = text.replace(/&gt;/gi, '>')
    text = text.replace(/&quot;/gi, '"')
    text = text.replace(/&#39;/gi, "'")

    // Clean up whitespace
    text = text.replace(/\t/g, ' ')
    text = text.replace(/ +/g, ' ')
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n')

    return text.trim()
}

/**
 * Normalize various date formats to ISO string
 */
function normalizeDate(dateStr: string): string {
    try {
        // If already ISO format, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr
        }

        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]
        }

        return dateStr
    } catch {
        return dateStr
    }
}

/**
 * Determine if email appears to be a booking confirmation
 */
export function isLikelyBookingEmail(content: string): boolean {
    const lowerContent = content.toLowerCase()

    const bookingKeywords = [
        'confirmation',
        'booking reference',
        'reservation',
        'itinerary',
        'e-ticket',
        'check-in',
        'check-out',
        'departure',
        'arrival',
        'flight',
        'hotel',
        'accommodation',
        'passenger',
        'guest',
        'booking number',
        'pnr',
        'locator'
    ]

    const matchCount = bookingKeywords.filter(keyword =>
        lowerContent.includes(keyword)
    ).length

    return matchCount >= 2
}
