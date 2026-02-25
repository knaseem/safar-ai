import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || []

async function verifyAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
        return null
    }
    return user
}

/**
 * Admin API: Fetch all booking requests (cross-user)
 * Server-side admin email check + service role client
 */
export async function GET() {
    const admin = await verifyAdmin()
    if (!admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const supabase = createAdminClient()

        // Fetch all booking requests (admin view)
        const { data: bookings, error } = await supabase
            .from("booking_requests")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Admin bookings fetch error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Fetch travel profiles for analytics
        const { data: profiles, error: profilesError } = await supabase
            .from("travel_profiles")
            .select("archetype")

        if (profilesError) {
            console.error("Admin profiles fetch error:", profilesError)
        }

        return NextResponse.json({
            bookings: bookings || [],
            profiles: profiles || []
        })
    } catch (error: any) {
        console.error("Admin data error:", error)
        return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const admin = await verifyAdmin()
    if (!admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const supabase = createAdminClient()
        const { id, status } = await req.json()

        if (!id || !status) {
            return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
        }

        const { error } = await supabase
            .from("booking_requests")
            .update({ status })
            .eq("id", id)

        if (error) {
            console.error("Admin status update error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Admin update error:", error)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }
}
