import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const supabase = await createClient()

        // Fetch just the trip details needed for the public view
        // Explicitly NOT selecting user_id to prevent leaking owner info
        const { data: trip, error } = await supabase
            .from("saved_trips")
            .select("id, trip_name, trip_data, is_halal, destination, created_at")
            .eq("id", params.id)
            .single()

        if (error || !trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 })
        }

        return NextResponse.json({ trip })
    } catch (error) {
        console.error("GET public trip error:", error)
        return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 })
    }
}
