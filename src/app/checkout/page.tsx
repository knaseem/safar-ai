"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, ShieldCheck, Lock } from "lucide-react"

// Loading fallback for Suspense
function CheckoutLoading() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="size-12 text-emerald-500 animate-spin mx-auto mb-4" />
                <p className="text-white/60">Initializing secure session...</p>
            </div>
        </div>
    )
}

// Main page wrapper with Suspense
export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutLoading />}>
            <CheckoutContent />
        </Suspense>
    )
}

function CheckoutContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const offerId = searchParams.get("offer_id")
    const offerType = searchParams.get("type") || "flight" // flight or stay
    const [status, setStatus] = useState("Preparing your secure checkout...")
    const [error, setError] = useState<string | null>(null)

    // On mount, create session and redirect
    useEffect(() => {
        async function initiateCheckout() {
            // Allow generic checkout (no specific offer) for Hotels or open search
            // if (!offerId) {
            //     setError("No booking selected")
            //     return
            // }

            try {
                // 1. Get additional details for context (Optional, but good for tracking)
                const price = searchParams.get('price')
                const currency = "USD"

                // Search Context
                const origin = searchParams.get('origin')
                const destination = searchParams.get('destination')
                const date = searchParams.get('date')
                const adults = parseInt(searchParams.get('adults') || '1')

                // 2. Call API to create session
                const res = await fetch('/api/checkout/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reference: `BOOK-${Date.now()}`, // Unique Ref
                        type: offerType,
                        offer_id: offerId,
                        amount: price,
                        currency: currency,
                        origin,
                        destination,
                        date,
                        adults
                    })
                })

                if (!res.ok) throw new Error("Failed to create session")

                const data = await res.json()

                if (data.url) {
                    setStatus("Redirecting to secure payment provider...")
                    // 3. Redirect to Duffel
                    window.location.href = data.url
                } else {
                    throw new Error("Invalid session response")
                }

            } catch (err: any) {
                console.error("Checkout init error:", err)
                setError("Failed to initialize secure checkout. Please try again.")
            }
        }

        initiateCheckout()
    }, [offerId, offerType, searchParams])

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="text-white underline hover:text-white/80"
                    >
                        Return to Search
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />

            <div className="relative z-10 text-center max-w-lg">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative inline-block"
                >
                    <div className="size-24 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10">
                        <ShieldCheck className="size-10 text-emerald-400" />
                    </div>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-2 border-t-2 border-emerald-500/50 rounded-full"
                    />
                </motion.div>

                <h1 className="text-3xl font-bold text-white mb-4">Secure Checkout</h1>
                <p className="text-lg text-white/60 mb-8">{status}</p>

                <div className="flex items-center justify-center gap-2 text-xs text-white/30 uppercase tracking-widest">
                    <Lock className="size-3" />
                    <span>Bank-Grade Encryption • PCI Compliant</span>
                </div>
            </div>
        </div>
    )
}
