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

    // 3. Fallback logic for transition period: 
    // If DB is_admin isn't set up yet, fallback to the strict env var check to prevent breaking the app.
    // Once the DB migration is run in production, this fallback can be removed.
    if (profile?.is_admin === true) {
        return true
    }

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
    if (user.email && adminEmails.includes(user.email)) {
        return true
    }

    return false
}
