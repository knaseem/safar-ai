import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, source } = await req.json()

    if (!id || !source) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
        if (source === 'import') {
            // Hard delete for imports
            const { error } = await supabase.from("imported_bookings").delete().eq("id", id).eq("user_id", user.id)
            if (error) throw error
        } else if (source === 'concierge') {
            // Mark as cancelled
            const { error } = await supabase.from("booking_requests").update({ status: 'cancelled' }).eq("id", id).eq("user_id", user.id)
            if (error) throw error
        } else if (source === 'duffel') {
            // Mark as cancelled
            const { error } = await supabase.from("orders").update({ status: 'cancelled' }).eq("id", id).eq("user_id", user.id)
            if (error) throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete error:", error)
        return NextResponse.json({ error: "Failed to delete/cancel booking" }, { status: 500 })
    }
}
