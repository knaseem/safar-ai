import { apiSuccess, apiError } from "@/lib/api-handler"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkIsAdmin } from '@/lib/supabase/admin-check'

/**
 * Admin API: Fetch all users from Auth and join with Travel Profiles
 * Server-side admin email check + service role client
 */
export async function GET() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return apiError("Forbidden", 403)

    try {
        const supabase = createAdminClient()

        // 1. Fetch all users from Supabase Auth
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

        if (authError) {
            console.error("Admin user list auth error:", authError)
            return apiError(authError.message, 500)
        }

        // 2. Fetch all travel profiles
        const { data: profiles, error: profilesError } = await supabase
            .from("travel_profiles")
            .select("*")

        if (profilesError) {
            console.error("Admin user list profiles error:", profilesError)
            // We can continue with just auth data if profiles fail
        }

        // 3. Merge data
        const mergedUsers = users.map(user => {
            const profile = profiles?.find(p => p.user_id === user.id)
            return {
                id: user.id,
                email: user.email,
                last_sign_in_at: user.last_sign_in_at,
                created_at: user.created_at,
                plan_tier: profile?.plan_tier || 'free',
                archetype: profile?.archetype || 'Undiscovered',
                traits: profile?.traits || null
            }
        })

        return apiSuccess({ users: mergedUsers })
    } catch (error: any) {
        console.error("Admin user list generic error:", error)
        return apiError("Failed to fetch users", 500)
    }
}
