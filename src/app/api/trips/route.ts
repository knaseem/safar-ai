import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const MAX_FREE_TRIPS = 10

// GET: Fetch user's saved trips
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: trips, error } = await supabase
            .from("saved_trips")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json({ trips })
    } catch (error) {
        console.error("GET trips error:", error)
        return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
    }
}

// POST: Save a new trip
export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check trip limit
        const { count } = await supabase
            .from("saved_trips")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)

        if (count && count >= MAX_FREE_TRIPS) {
            return NextResponse.json({
                error: `Trip limit reached (${MAX_FREE_TRIPS} max)`
            }, { status: 403 })
        }

        const { trip_name, trip_data, is_halal, destination } = await req.json()

        // Check for duplicate trip names
        const { data: existing } = await supabase
            .from("saved_trips")
            .select("id")
            .eq("user_id", user.id)
            .eq("trip_name", trip_name)
            .single()

        if (existing) {
            return NextResponse.json({
                error: "A trip with this name already exists"
            }, { status: 409 })
        }

        const { data: trip, error } = await supabase
            .from("saved_trips")
            .insert({
                user_id: user.id,
                trip_name,
                trip_data,
                is_halal: is_halal || false,
                destination: destination || null
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ trip }, { status: 201 })
    } catch (error) {
        console.error("POST trip error:", error)
        return NextResponse.json({ error: "Failed to save trip" }, { status: 500 })
    }
}

// DELETE: Remove a trip
export async function DELETE(req: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const tripId = searchParams.get("id")

        if (!tripId) {
            return NextResponse.json({ error: "Trip ID required" }, { status: 400 })
        }

        const { error } = await supabase
            .from("saved_trips")
            .delete()
            .eq("id", tripId)
            .eq("user_id", user.id) // Ensure user owns the trip

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("DELETE trip error:", error)
        return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 })
    }
}
