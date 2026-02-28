import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkIsAdmin } from '@/lib/supabase/admin-check'
import { apiSuccess, apiError } from "@/lib/api-handler"

/**
 * Admin API: Fetch a user's travel profile by user_id
 * Server-side admin email check + service role client
 */
export async function GET(request: Request) {
    try {
        // Verify caller is admin
        const isAdmin = await checkIsAdmin()
        if (!isAdmin) return apiError("Forbidden", 403)
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (!userId) return apiError("userId required", 400)

        const supabase = createAdminClient()

        const { data: profile, error } = await supabase
            .from("travel_profiles")
            .select("*")
            .eq("user_id", userId)
            .single()

        if (error && error.code !== "PGRST116") {
            return apiError(error.message, 500)
        }

        return apiSuccess({ profile: profile || null })
    } catch (error: any) {
        console.error("Admin profile fetch error:", error)
        return apiError("Failed to fetch profile", 500)
    }
}
