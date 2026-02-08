import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { id, source, tripId, label } = body

        if (!id || !source) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        let table = ''
        switch (source) {
            case 'duffel':
                table = 'orders'
                break
            case 'concierge':
                table = 'booking_requests'
                break
            case 'import':
                table = 'imported_bookings'
                break
            default:
                return NextResponse.json({ error: "Invalid source" }, { status: 400 })
        }

        const updates: any = {}
        if (tripId !== undefined) updates.trip_id = tripId
        if (label !== undefined) updates.booking_label = label

        const { error } = await supabase
            .from(table)
            .update(updates)
            .eq("id", id)
            .eq("user_id", user.id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Link booking error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
