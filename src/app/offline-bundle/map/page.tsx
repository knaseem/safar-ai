"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Map as MapIcon, Shield } from "lucide-react"
import Link from "next/link"
import { CinemaMap } from "@/components/features/cinema-map"

export default function OfflineMapView() {
    const [bundleData, setBundleData] = useState<any>(null)
    const [activeDayIndex, setActiveDayIndex] = useState(0)

    useEffect(() => {
        // Read the data passed from the Survival Kit modal
        const data = localStorage.getItem('safar_offline_bundle')
        if (data) {
            setBundleData(JSON.parse(data))
        }
    }, [])

    if (!bundleData) {
        return (
            <div className="min-h-screen bg-neutral-950 flex justify-center items-center text-white">
                <p>Loading encrypted map data...</p>
            </div>
        )
    }

    if (!bundleData.itineraryDays || bundleData.itineraryDays.length === 0) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center text-white space-y-4">
                <MapIcon className="size-12 text-neutral-600" />
                <p>No map coordinates available in this offline bundle.</p>
                <Link href="/offline-bundle" className="text-emerald-500 hover:text-emerald-400 font-medium">
                    ← Back to Secure Bundle
                </Link>
            </div>
        )
    }

    // Extract coordinates and days for the CinemaMap
    const locations = bundleData.itineraryDays.map((d: any) => d.coordinates)
    const days = bundleData.itineraryDays.map((d: any) => ({ day: d.day, theme: d.theme }))

    return (
        <div className="h-screen w-full bg-neutral-950 overflow-hidden relative flex flex-col">
            {/* Top Navigation Bar Component */}
            <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
                <Link
                    href="/offline-bundle"
                    className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white/90 hover:bg-white/10 hover:text-white transition-all pointer-events-auto"
                >
                    <ArrowLeft className="size-4" />
                    <span className="text-sm font-medium">Back to Bundle</span>
                </Link>

                <div className="text-right pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                    <h1 className="text-base font-bold text-white">{bundleData.tripName}</h1>
                    <div className="flex items-center justify-end gap-1 mt-0.5 text-emerald-400 text-xs font-medium">
                        <Shield className="size-3" /> Secure Offline Map
                    </div>
                </div>
            </header>

            {/* Main Interactive Map Component */}
            <div className="flex-1 w-full h-full relative z-0">
                <CinemaMap
                    locations={locations}
                    days={days}
                    activeIndex={activeDayIndex}
                    onMarkerClick={(index) => setActiveDayIndex(index)}
                />
            </div>

            {/* Bottom Info Overlay */}
            <motion.div
                key={activeDayIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4"
            >
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl pointer-events-auto">
                    <h2 className="text-2xl font-bold text-white mb-1">Day {days[activeDayIndex].day}</h2>
                    <p className="text-emerald-400 font-medium uppercase tracking-widest text-xs mb-3">{days[activeDayIndex].theme}</p>

                    <div className="space-y-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <p className="text-[10px] text-white/40 uppercase mb-1">Morning Focus</p>
                            <p className="text-sm text-white/90 leading-tight">{bundleData.itineraryDays[activeDayIndex].morning.substring(0, 100)}...</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
