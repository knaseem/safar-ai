"use client"

import Link from "next/link"
import { AlertCircle, Home, MoveLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
            <div className="size-24 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse" />
                <AlertCircle className="size-10 text-emerald-500" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                404 <span className="text-emerald-500">.</span> Lost in Space?
            </h1>

            <p className="text-white/40 max-w-md mb-8 leading-relaxed">
                The destination you are looking for has clearly gone off the radar.
                It might have been moved, deleted, or never existed in this timeline.
            </p>

            <div className="flex gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
                >
                    <Home className="size-4" />
                    Return Base
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold border border-white/10 hover:bg-neutral-800 transition-colors"
                >
                    <MoveLeft className="size-4" />
                    Go Back
                </button>
            </div>
        </div>
    )
}
