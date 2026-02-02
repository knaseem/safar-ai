import { createClient } from "@/lib/supabase/server"
import { TripContent } from "@/components/features/trip-content"
import { Navbar } from "@/components/layout/navbar"
import { redirect } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export default async function TripPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/")
    }

    // Fetch Trip ensuring ownership
    const { data: trip, error } = await supabase
        .from("saved_trips")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

    if (error || !trip) {
        redirect("/profile")
    }

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-12">
                <Breadcrumb />
                <TripContent
                    tripId={trip.id}
                    tripData={trip.trip_data as any}
                    isHalal={trip.is_halal}
                />
            </div>
        </main>
    )
}
