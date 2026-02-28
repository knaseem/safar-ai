import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkIsAdmin } from '@/lib/supabase/admin-check'
import { apiSuccess, apiError } from "@/lib/api-handler"

/**
 * Admin API: Fetch all booking requests (cross-user)
 * Server-side admin email check + service role client
 */
export async function GET() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return apiError("Forbidden", 403)

    try {
        const supabase = createAdminClient()

        // Fetch all booking requests (admin view)
        const { data: bookings, error } = await supabase
            .from("booking_requests")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Admin bookings fetch error:", error)
            return apiError(error.message, 500)
        }

        // Fetch travel profiles for analytics
        const { data: profiles, error: profilesError } = await supabase
            .from("travel_profiles")
            .select("archetype, plan_tier")

        if (profilesError) {
            console.error("Admin profiles fetch error:", profilesError)
        }

        return apiSuccess({
            bookings: bookings || [],
            profiles: profiles || []
        })
    } catch (error: any) {
        console.error("Admin data error:", error)
        return apiError("Failed to fetch admin data", 500)
    }
}

export async function PATCH(req: Request) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return apiError("Forbidden", 403)

    try {
        const supabase = createAdminClient()
        const { id, status } = await req.json()

        if (!id || !status) return apiError("Missing id or status", 400)

        const { error } = await supabase
            .from("booking_requests")
            .update({ status })
            .eq("id", id)

        if (error) {
            console.error("Admin status update error:", error)
            return apiError(error.message, 500)
        }

        return apiSuccess({ success: true }, "Status updated successfully")
    } catch (error: any) {
        console.error("Admin update error:", error)
        return apiError("Failed to update status", 500)
    }
}
