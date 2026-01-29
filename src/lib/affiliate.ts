export type AffiliateType = 'hotel' | 'activity' | 'flight' | 'general'

/**
 * Extracts a clean city name from a trip title or search query.
 * Removes prefixes like "X days in", "Trip to", "Staying at", etc.
 */
export function extractCleanCity(input: string): string {
    if (!input) return ''

    // Core regex to strip everything before "in", "to", "at", etc.
    // e.g., "5 days in Paris" -> "Paris"
    // "My trip to Tokyo" -> "Tokyo"
    const cleanupRegex = /^(?:\d+\s+days?\s+in\s+|trip\s+to\s+|stay(?:ing)?\s+at\s+|visiting\s+)/i
    let clean = input.replace(cleanupRegex, '').trim()

    // If it's still complex (e.g. "Paris: The City of Light"), take the first part
    clean = clean.split(/[:,-]/)[0].trim()

    // Final safety: don't let it be too short or too long if it was malformed
    return clean || input
}

export function generateAffiliateLink(
    type: AffiliateType,
    params: {
        destination?: string
        name?: string // Hotel name or Activity title
        checkIn?: string
        checkOut?: string
        origin?: string
    }
): string {
    const { destination = '', name = '', checkIn, checkOut, origin } = params

    // CLEAN DESTINATION: Crucial for avoiding "Things to Do" fallback on Expedia
    const cleanCity = extractCleanCity(destination)
    const searchQuery = extractCleanCity(name || destination)
    const encodedSearch = encodeURIComponent(searchQuery)
    const encodedCity = encodeURIComponent(cleanCity)

    // In a real app, these would be your actual affiliate IDs
    const affiliateId = process.env.NEXT_PUBLIC_EXPEDIA_AFFILIATE_ID || ''
    const affiliateParam = affiliateId ? `&refid=${affiliateId}` : ''

    switch (type) {
        case 'hotel':
            // Expedia Hotel Search - Use clean city and specific search query
            let hotelUrl = `https://www.expedia.com/Hotel-Search?destination=${encodedCity}${affiliateParam}`
            if (name && name !== destination) {
                // If we have a specific hotel name, search for that within the city
                hotelUrl = `https://www.expedia.com/Hotel-Search?destination=${encodedCity}&hotelName=${encodeURIComponent(name)}${affiliateParam}`
            }

            if (checkIn) hotelUrl += `&startDate=${checkIn}`
            if (checkOut) hotelUrl += `&endDate=${checkOut}`
            return hotelUrl

        case 'activity':
            // Expedia Things to Do - Use clean city
            let activityUrl = `https://www.expedia.com/things-to-do/search?location=${encodedCity}${affiliateParam}`
            if (checkIn) {
                // MM/DD/YYYY format for activity search
                const parts = checkIn.split('-')
                if (parts.length === 3) {
                    const [y, m, d] = parts
                    activityUrl += `&startDate=${m}%2F${d}%2F${y}`
                }
            }
            if (checkOut) {
                const parts = checkOut.split('-')
                if (parts.length === 3) {
                    const [y, m, d] = parts
                    activityUrl += `&endDate=${m}%2F${d}%2F${y}`
                }
            }
            return activityUrl

        case 'flight':
            // Expedia Flight Search - Leg-based format
            // If origin/dest are 3-letter codes, use them directly
            const flightOrigin = (origin && origin.length === 3) ? origin : encodeURIComponent(origin || 'any')
            const flightDest = (destination && destination.length === 3) ? destination : encodeURIComponent(cleanCity || 'any')

            let flightUrl = `https://www.expedia.com/Flights-Search?leg1=from:${flightOrigin},to:${flightDest}${affiliateParam}`
            if (checkIn) flightUrl += `,departure:${checkIn}`
            flightUrl += `&mode=search`
            return flightUrl

        case 'general':
        default:
            return `https://www.expedia.com/Search?city=${encodedSearch}`
    }
}
