import { redirect } from 'next/navigation'
import { checkIsAdmin } from '@/lib/supabase/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminDashboardClient from '@/components/admin/admin-dashboard-client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    // 1. Secure the page using the DB role check
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
        redirect('/?error=unauthorized')
    }

    // 2. Fetch data securely on the server using service role
    const supabaseAdmin = createAdminClient()

    // Fetch bookings & profiles
    const [
        { data: bookings, error: bookingsError },
        { data: profiles, error: profilesError }
    ] = await Promise.all([
        supabaseAdmin.from('booking_requests').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('travel_profiles').select('user_id, archetype, plan_tier')
    ])

    if (bookingsError) {
        console.error("Admin page bookings fetch error:", bookingsError)
    }

    return (
        <AdminDashboardClient
            initialBookings={bookings || []}
            initialProfiles={profiles || []}
        />
    )
}
