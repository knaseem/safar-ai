import { createClient as createServerClient } from './server'

export async function checkIsAdmin(): Promise<boolean> {
    const supabase = await createServerClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return false
    }

    // 2. Check travel_profiles for is_admin flag
    const { data: profile } = await supabase
        .from('travel_profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single()

    // 3. DB flag check (primary method)
    if (profile?.is_admin === true) {
        return true
    }

    // 4. Env var fallback
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        return true
    }

    return false
}
