export type AffiliateType = 'hotel' | 'activity' | 'flight' | 'general'

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
    const query = encodeURIComponent(`${name} ${destination}`.trim())

    // In a real app, these would be your actual affiliate IDs
    // const BOOKING_AID = '123456'
    // const VIATOR_PID = '78910'

    switch (type) {
        case 'hotel':
            // Expedia Hotel Search
            let hotelUrl = `https://www.expedia.com/Hotel-Search?destination=${query}`
            if (checkIn) hotelUrl += `&startDate=${checkIn}`
            if (checkOut) hotelUrl += `&endDate=${checkOut}`
            return hotelUrl

        case 'activity':
            // Expedia Things to Do
            return `https://www.expedia.com/Activities-Search?query=${query}`

        case 'flight':
            // Expedia Flight Search
            // Format: leg1=from:Origin,to:Destination,departure:YYYY-MM-DD
            const flightOrigin = origin || 'any'
            const flightDest = destination || 'any'
            let flightUrl = `https://www.expedia.com/Flights-Search?leg1=from:${flightOrigin},to:${flightDest}`
            if (checkIn) flightUrl += `,departure:${checkIn}`
            return flightUrl

        case 'general':
        default:
            return `https://www.expedia.com/Search?city=${query}`
    }
}
