import { createClient as createServerClient } from './server'

export async function checkIsAdmin(): Promise<boolean> {
    const supabase = await createServerClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log("[admin-check] user:", user?.email, "authError:", authError)

    if (authError || !user) {
        console.log("[admin-check] Returning false because no user or auth error")
        return false
    }

    // 2. Check travel_profiles for is_admin flag
    const { data: profile } = await supabase
        .from('travel_profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single()

    console.log("[admin-check] profile is_admin:", profile?.is_admin)

    // 3. Fallback logic for transition period
    if (profile?.is_admin === true) {
        console.log("[admin-check] Returning true from profile.is_admin")
        return true
    }

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    console.log("[admin-check] adminEmails env:", adminEmails)
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        console.log("[admin-check] Returning true from env var check")
        return true
    }

    console.log("[admin-check] Returning false at the end")
    return false
}
