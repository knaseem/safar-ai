"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
            <div className="size-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
                <AlertTriangle className="size-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
                Systems Malfunction
            </h1>

            <p className="text-white/40 max-w-md mb-8 leading-relaxed">
                We encountered a critical error while processing your request.
                Our autonomous agents have been notified.
            </p>

            <div className="bg-neutral-900 rounded-lg p-4 mb-8 max-w-md w-full border border-white/5 overflow-hidden">
                <p className="font-mono text-xs text-red-400 break-all">
                    {error.message || "Unknown Application Error"}
                </p>
            </div>

            <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors"
            >
                <RefreshCw className="size-4" />
                Reboot System (Try Again)
            </button>
        </div>
    )
}
