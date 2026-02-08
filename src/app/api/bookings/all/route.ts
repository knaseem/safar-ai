import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { UnifiedBooking } from "@/types/booking"

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Fetch all data sources in parallel
        const [ordersRes, requestsRes, importsRes, tripsRes] = await Promise.all([
            supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
            supabase.from("booking_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
            supabase.from("imported_bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
            supabase.from("saved_trips").select("id, trip_name").eq("user_id", user.id)
        ])

        if (ordersRes.error) throw ordersRes.error
        if (requestsRes.error) throw requestsRes.error
        // Imports fetch might fail if table strictly doesn't exist yet, but we created migration.
        // If it fails, we treat as empty to avoid crashing if migration not run.
        const imports = importsRes.error ? [] : importsRes.data
        const trips = tripsRes.data || []

        const tripMap = new Map(trips.map(t => [t.id, t.trip_name]))

        const unifiedBookings: UnifiedBooking[] = []

        // 1. Process Duffel Orders
        ordersRes.data.forEach((order: any) => {
            const isFlight = order.type === 'flight'
            const details = order.metadata?.offer_details || {}

            unifiedBookings.push({
                id: order.id,
                source: 'duffel',
                type: order.type || 'flight',
                status: order.status,
                tripId: order.trip_id,
                tripName: order.trip_id ? tripMap.get(order.trip_id) : undefined,
                label: order.booking_label,
                bookingReference: order.metadata?.booking_reference,
                details: {
                    title: isFlight
                        ? `${details.origin || 'Unknown'} → ${details.destination || 'Unknown'}`
                        : (details.hotelName || 'Hotel Booking'),
                    subtitle: isFlight
                        ? (details.airline || 'Flight')
                        : (details.checkIn ? `${details.checkIn} - ${details.checkOut}` : undefined),
                    date: order.created_at,
                    price: order.total_amount?.toString(),
                    currency: order.currency,
                    pnr: order.metadata?.booking_reference,
                },
                actions: {
                    canCancel: order.status === 'confirmed',
                    canModify: order.status === 'confirmed' && isFlight,
                    canLink: true
                },
                originalData: order,
                createdAt: order.created_at
            })
        })

        // 2. Process Concierge Requests
        requestsRes.data.forEach((req: any) => {
            unifiedBookings.push({
                id: req.id,
                source: 'concierge',
                type: 'custom',
                status: req.status,
                tripId: req.trip_id,
                tripName: req.trip_id ? tripMap.get(req.trip_id) : undefined,
                label: req.booking_label,
                bookingReference: undefined, // Concierge might add later
                details: {
                    title: req.trip_name || req.destination,
                    subtitle: `Concierge Request - ${req.destination}`,
                    date: req.check_in,
                    price: req.estimated_price?.toString(),
                    currency: 'USD',
                    location: req.destination
                },
                actions: {
                    canCancel: req.status === 'pending',
                    canModify: false,
                    canLink: true // Already linked usually, but can change
                },
                originalData: req,
                createdAt: req.created_at
            })
        })

        // 3. Process Imported Bookings
        imports.forEach((imp: any) => {
            const data = imp.parsed_data || {}
            const type = imp.booking_type || data.type || 'flight'
            const isFlight = type === 'flight'

            let title = 'Imported Booking'
            let subtitle = ''

            if (isFlight) {
                // Try to construct route
                const leg = data.details?.flightNumber || ''
                const origin = data.details?.origin || ''
                const dest = data.details?.destination || ''
                title = origin && dest ? `${origin} → ${dest}` : `Flight ${leg}`
                subtitle = data.details?.airline || 'Airline'
            } else if (type === 'hotel') {
                title = data.details?.hotelName || 'Hotel Stay'
                subtitle = data.details?.address || ''
            }

            unifiedBookings.push({
                id: imp.id,
                source: 'import',
                type: type,
                status: 'confirmed', // Imports are usually confirmed
                tripId: imp.trip_id,
                tripName: imp.trip_id ? tripMap.get(imp.trip_id) : undefined,
                label: imp.booking_label,
                bookingReference: imp.confirmation_number || data.confirmationNumber,
                details: {
                    title,
                    subtitle,
                    date: imp.start_date || data.startDate,
                    price: data.price?.amount?.toString(),
                    currency: data.price?.currency,
                    pnr: imp.confirmation_number || data.confirmationNumber
                },
                actions: {
                    canCancel: false, // Cannot cancel imports via app
                    canModify: false,
                    canLink: true
                },
                originalData: imp,
                createdAt: imp.created_at
            })
        })

        // Sort by Created At Descending
        unifiedBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json({ bookings: unifiedBookings })

    } catch (error: any) {
        console.error("Unified bookings fetch error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
