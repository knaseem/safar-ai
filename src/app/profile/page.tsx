import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from '@/components/profile/profile-client'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // 2. Fetch all required user data concurrently
    const [
        { data: baseProfile },
        { data: travelProfile },
        { data: savedTrips }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('travel_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('saved_trips').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    // 3. Construct unified profile payload
    const initialProfile = {
        ...baseProfile,
        ...travelProfile,
        archetype_scores: travelProfile?.traits?.scores || {}
    }

    // Note: Unified bookings relies on external API integrations (Amadeus/Duffel), 
    // so it generally stays as a client fetch to avoid blocking the initial HTML render 
    // if those APIs are slow. However, DB data loads instantly.

    return (
        <ProfileClient
            initialUser={user}
            initialProfile={initialProfile}
            initialSavedTrips={savedTrips || []}
        />
    )
}
