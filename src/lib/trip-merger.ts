import { ParsedBooking } from "./email-parser"
import { TripData } from "@/components/features/trip-itinerary"

export interface MergedTrip {
    trip_name: string
    startDate: string
    endDate: string
    destination: string
    bookings: ParsedBooking[]
    tripData: TripData
}

/**
 * Group bookings into trips based on date proximity
 * Bookings within 24 hours of each other are grouped together
 */
export function groupBookingsIntoTrips(bookings: ParsedBooking[]): MergedTrip[] {
    if (bookings.length === 0) return []

    // Sort bookings by start date
    const sorted = [...bookings].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

    const trips: MergedTrip[] = []
    let currentTrip: ParsedBooking[] = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
        const prevBooking = sorted[i - 1]
        const currentBooking = sorted[i]

        const prevEnd = prevBooking.endDate || prevBooking.startDate
        const currentStart = currentBooking.startDate

        // Check if bookings are within 24 hours
        const daysDiff = Math.abs(
            (new Date(currentStart).getTime() - new Date(prevEnd).getTime()) /
            (1000 * 60 * 60 * 24)
        )

        if (daysDiff <= 1) {
            // Same trip
            currentTrip.push(currentBooking)
        } else {
            // New trip
            trips.push(createMergedTrip(currentTrip))
            currentTrip = [currentBooking]
        }
    }

    // Don't forget the last trip
    if (currentTrip.length > 0) {
        trips.push(createMergedTrip(currentTrip))
    }

    return trips
}

/**
 * Create a MergedTrip from a group of bookings
 */
function createMergedTrip(bookings: ParsedBooking[]): MergedTrip {
    const sorted = [...bookings].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

    const startDate = sorted[0].startDate
    const endDates = sorted.map(b => b.endDate || b.startDate)
    const endDate = endDates.reduce((latest, current) =>
        new Date(current) > new Date(latest) ? current : latest
    )

    // Determine primary destination(s)
    const destinations = new Set(bookings.map(b => b.location.city))
    const destination = Array.from(destinations).join(' → ')

    // Generate trip name
    const tripName = generateTripName(bookings, startDate)

    // Create TripData format for display
    const tripData = createTripData(tripName, bookings, startDate, endDate)

    return {
        trip_name: tripName,
        startDate,
        endDate,
        destination,
        bookings,
        tripData
    }
}

/**
 * Generate a descriptive trip name
 */
function generateTripName(bookings: ParsedBooking[], startDate: string): string {
    const cities = [...new Set(bookings.map(b => b.location.city))]
    const date = new Date(startDate)
    const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    if (cities.length === 1) {
        return `${cities[0]} Trip - ${month}`
    } else if (cities.length === 2) {
        return `${cities[0]} to ${cities[1]} - ${month}`
    } else {
        return `Multi-City Trip - ${month}`
    }
}

/**
 * Create TripData format compatible with TripItinerary component
 */
function createTripData(
    tripName: string,
    bookings: ParsedBooking[],
    startDate: string,
    endDate: string
): TripData {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)

    const days: TripData['days'] = []

    for (let i = 0; i < numDays; i++) {
        const currentDate = new Date(start)
        currentDate.setDate(start.getDate() + i)
        const dateStr = currentDate.toISOString().split('T')[0]

        // Find bookings for this day
        const dayBookings = bookings.filter(b => {
            const bStart = new Date(b.startDate)
            const bEnd = b.endDate ? new Date(b.endDate) : bStart
            return currentDate >= bStart && currentDate <= bEnd
        })

        // Find hotel for this day
        const hotel = dayBookings.find(b => b.type === 'hotel')
        const flights = dayBookings.filter(b => b.type === 'flight')
        const activities = dayBookings.filter(b => b.type === 'activity')

        // Determine primary location for this day
        const primaryBooking = dayBookings[0] || bookings[0]
        const location = primaryBooking?.location || { city: 'Unknown', country: '' }

        // Create day entry
        days.push({
            day: i + 1,
            theme: `Day in ${location.city}`,
            coordinates: primaryBooking?.location?.coordinates || { lat: 0, lng: 0 },
            morning: formatMorningActivity(flights, activities, dateStr),
            afternoon: formatAfternoonActivity(activities),
            evening: formatEveningActivity(activities),
            stay: hotel ? formatHotelStay(hotel) : 'No accommodation booked'
        })
    }

    return {
        trip_name: tripName,
        days
    }
}

function formatMorningActivity(flights: ParsedBooking[], activities: ParsedBooking[], date: string): string {
    const morningFlight = flights.find(f => {
        const time = f.details.departureTime
        if (!time) return false
        const hour = parseInt(time.split(':')[0])
        return hour < 12
    })

    if (morningFlight) {
        return `✈️ Flight ${morningFlight.details.flightNumber || ''} from ${morningFlight.details.origin} to ${morningFlight.details.destination}`
    }

    const morningActivity = activities.find(a => {
        const time = a.details.meetingPoint || ''
        return time.toLowerCase().includes('morning') || time.toLowerCase().includes('am')
    })

    if (morningActivity) {
        return `🎯 ${morningActivity.details.activityName}`
    }

    return 'Free time / Explore the area'
}

function formatAfternoonActivity(activities: ParsedBooking[]): string {
    const afternoonActivity = activities.find(a => {
        const time = a.details.meetingPoint || ''
        return time.toLowerCase().includes('afternoon') || time.toLowerCase().includes('pm')
    })

    if (afternoonActivity) {
        return `🎯 ${afternoonActivity.details.activityName}`
    }

    return 'Explore local attractions'
}

function formatEveningActivity(activities: ParsedBooking[]): string {
    const eveningActivity = activities.find(a => {
        const time = a.details.meetingPoint || ''
        return time.toLowerCase().includes('evening') || time.toLowerCase().includes('night')
    })

    if (eveningActivity) {
        return `🎯 ${eveningActivity.details.activityName}`
    }

    return 'Dinner and evening leisure'
}

function formatHotelStay(hotel: ParsedBooking): string {
    const name = hotel.details.hotelName || hotel.provider
    const room = hotel.details.roomType ? ` (${hotel.details.roomType})` : ''
    return `${name}${room}`
}

/**
 * Merge a new booking into an existing trip if dates overlap
 */
export function mergeBookingIntoTrips(
    existingTrips: MergedTrip[],
    newBooking: ParsedBooking
): MergedTrip[] {
    const bookingStart = new Date(newBooking.startDate)
    const bookingEnd = new Date(newBooking.endDate || newBooking.startDate)

    // Find overlapping trip
    const overlappingIndex = existingTrips.findIndex(trip => {
        const tripStart = new Date(trip.startDate)
        const tripEnd = new Date(trip.endDate)

        // Check for overlap or adjacency (within 24 hours)
        const startDiff = Math.abs(bookingStart.getTime() - tripEnd.getTime()) / (1000 * 60 * 60 * 24)
        const endDiff = Math.abs(bookingEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)

        return (bookingStart <= tripEnd && bookingEnd >= tripStart) ||
            startDiff <= 1 || endDiff <= 1
    })

    if (overlappingIndex >= 0) {
        // Merge into existing trip
        const updatedBookings = [...existingTrips[overlappingIndex].bookings, newBooking]
        const updatedTrip = createMergedTrip(updatedBookings)

        return existingTrips.map((trip, i) =>
            i === overlappingIndex ? updatedTrip : trip
        )
    }

    // Create new trip
    const newTrip = createMergedTrip([newBooking])
    return [...existingTrips, newTrip].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
}
