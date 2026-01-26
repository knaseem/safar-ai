import { createClient } from "@/lib/supabase/server"
import { TripItinerary } from "@/components/features/trip-itinerary"
import { Navbar } from "@/components/layout/navbar"
import { notFound } from "next/navigation"

interface GeneratedTripPageProps {
    params: Promise<{ id: string }>
}

export default async function GeneratedTripPage({ params }: GeneratedTripPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: trip, error } = await supabase
        .from("temporary_trips")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !trip) {
        return notFound()
    }

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            {/* Context Header */}
            <div className="pt-28 pb-4 text-center px-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                    <span>AI Generated Itinerary Preview</span>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <TripItinerary
                    data={trip.trip_data as any}
                    isHalal={trip.is_halal}
                    // We don't mark as shared because we want the user to be able to save it
                    isShared={false}
                />
            </div>
        </main>
    )
}
