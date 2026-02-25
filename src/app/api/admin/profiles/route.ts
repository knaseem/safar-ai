import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || []

/**
 * Admin API: Fetch a user's travel profile by user_id
 * Server-side admin email check + service role client
 */
export async function GET(request: Request) {
    try {
        // Verify caller is admin
        const supabaseAuth = await createClient()
        const { data: { user } } = await supabaseAuth.auth.getUser()
        if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 })
        }

        const supabase = createAdminClient()

        const { data: profile, error } = await supabase
            .from("travel_profiles")
            .select("*")
            .eq("user_id", userId)
            .single()

        if (error && error.code !== "PGRST116") {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ profile: profile || null })
    } catch (error: any) {
        console.error("Admin profile fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}
