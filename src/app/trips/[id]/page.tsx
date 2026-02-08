import { createClient } from "@/lib/supabase/server"
import { TripContent } from "@/components/features/trip-content"
import { Navbar } from "@/components/layout/navbar"
import { redirect } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { UnifiedBooking } from "@/types/booking"

export default async function TripPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/")
    }

    // Fetch Trip ensuring ownership
    const { data: trip, error } = await supabase
        .from("saved_trips")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

    if (error || !trip) {
        redirect("/profile")
    }

    // Fetch Linked Bookings (Orders, Imports, Concierge)
    const [ordersRes, importsRes, requestsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("trip_id", params.id),
        supabase.from("imported_bookings").select("*").eq("trip_id", params.id),
        supabase.from("booking_requests").select("*").eq("trip_id", params.id)
    ])

    const linkedBookings: UnifiedBooking[] = []

    // Normalize Orders
    ordersRes.data?.forEach((order: any) => {
        const isFlight = order.type === 'flight'
        const details = order.metadata?.offer_details || {}
        linkedBookings.push({
            id: order.id,
            source: 'duffel',
            type: order.type || 'flight',
            status: order.status,
            tripId: order.trip_id,
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
            actions: { canCancel: true, canModify: true, canLink: true },
            originalData: order,
            createdAt: order.created_at
        })
    })

    // Normalize Imports
    importsRes.data?.forEach((imp: any) => {
        const data = imp.parsed_data || {}
        const type = imp.booking_type || data.type || 'flight'
        const isFlight = type === 'flight'

        let title = 'Imported Booking'
        let subtitle = ''

        if (isFlight) {
            const leg = data.details?.flightNumber || ''
            const origin = data.details?.origin || ''
            const dest = data.details?.destination || ''
            title = origin && dest ? `${origin} → ${dest}` : `Flight ${leg}`
            subtitle = data.details?.airline || 'Airline'
        } else if (type === 'hotel') {
            title = data.details?.hotelName || 'Hotel Stay'
            subtitle = data.details?.address || ''
        }

        linkedBookings.push({
            id: imp.id,
            source: 'import',
            type: type,
            status: 'confirmed',
            tripId: imp.trip_id,
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
            actions: { canCancel: false, canModify: false, canLink: true },
            originalData: imp,
            createdAt: imp.created_at
        })
    })

    // Normalize Concierge Requests
    requestsRes.data?.forEach((req: any) => {
        linkedBookings.push({
            id: req.id,
            source: 'concierge',
            type: 'custom',
            status: req.status,
            tripId: req.trip_id,
            label: req.booking_label,
            details: {
                title: req.trip_name || req.destination,
                subtitle: `Concierge Request - ${req.destination}`,
                date: req.check_in,
                price: req.estimated_price?.toString(),
                currency: 'USD',
                location: req.destination
            },
            actions: { canCancel: true, canModify: false, canLink: true },
            originalData: req,
            createdAt: req.created_at
        })
    })

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-12">
                <Breadcrumb />
                <TripContent
                    tripId={trip.id}
                    tripData={trip.trip_data as any}
                    isHalal={trip.is_halal}
                    linkedBookings={linkedBookings}
                />
            </div>
        </main>
    )
}
