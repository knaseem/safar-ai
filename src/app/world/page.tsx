import { WorldGlobe } from '@/components/features/world-globe'
import { Navbar } from '@/components/layout/navbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function WorldPage() {
    return (
        <main className="h-screen w-screen overflow-hidden bg-black text-white relative">
            <Navbar />
            {/* Subtle back button for users who want to leave the globe */}
            <div className="absolute top-24 left-6 z-20">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10"
                >
                    <ArrowLeft className="size-4" />
                    Back to Home
                </Link>
            </div>
            <WorldGlobe />
        </main>
    )
}
