import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Flight Search | SafarAI',
    description: 'Search for the best flight deals worldwide.',
}

export default function FlightsPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-neutral-950 text-white">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Search Flights
                </h1>

                {/* Widget Containers */}
                <div className="space-y-8">
                    {/* Metasearch Widget Code */}
                    <div id="tpwl-search" className="min-h-[100px] w-full bg-neutral-900/50 rounded-xl p-4 backdrop-blur-sm border border-white/10" />

                    {/* Search Results Code */}
                    <div id="tpwl-tickets" className="min-h-[400px] w-full" />
                </div>
            </div>
        </main>
    )
}
