import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get("tripId")

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // SCENARIO 1: Bulk Fetch (No tripId provided)
    if (!tripId) {
        const { data, error } = await supabase
            .from("travel_budgets")
            .select("*")
            .eq("user_id", user.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json(data)
    }

    // SCENARIO 2: Single Fetch (tripId provided)
    const { data, error } = await supabase
        .from("travel_budgets")
        .select("*")
        .eq("trip_id", tripId)
        .eq("user_id", user.id)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || {
        total_budget: 2500, // Default for demo if not set
        currency: "USD",
        categories: { lodging: 0, flights: 0, food: 0, activities: 0, other: 0 }
    })
}

export async function POST(request: Request) {
    const body = await request.json()
    const { tripId, total_budget, currency, categories } = body

    if (!tripId) {
        return NextResponse.json({ error: "Trip ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("travel_budgets")
        .upsert({
            user_id: user.id,
            trip_id: tripId,
            total_budget,
            currency,
            categories
        }, { onConflict: 'user_id,trip_id' })
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
}
