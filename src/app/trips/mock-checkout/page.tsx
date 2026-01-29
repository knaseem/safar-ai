"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plane, Building2, CreditCard, ShieldCheck } from "lucide-react"

export default function MockCheckoutPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const reference = searchParams.get('reference')
    const [status, setStatus] = useState<'review' | 'paying' | 'complete'>('review')

    const handlePay = () => {
        setStatus('paying')
        setTimeout(() => {
            setStatus('complete')
            setTimeout(() => {
                router.push(`/trips/success?order_id=ord_mock_${Math.random().toString(36).substring(7)}&reference=${reference}`)
            }, 1000)
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 p-8 flex flex-col items-center justify-center font-sans">
            <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="size-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                        <ShieldCheck className="size-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">Safar AI Secure Checkout</h1>
                        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Powered by Duffel (Mock)</p>
                    </div>
                </div>

                {status === 'review' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Plane className="size-5 text-slate-400" />
                                <span className="font-medium text-sm">Roundtrip Flight to Bali</span>
                            </div>
                            <span className="font-bold">$450.00</span>
                        </div>
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Building2 className="size-5 text-slate-400" />
                                <span className="font-medium text-sm">3 Nights at Zen Sanctuary</span>
                            </div>
                            <span className="font-bold">$540.00</span>
                        </div>

                        <div className="border-t border-slate-200 pt-4 flex justify-between items-center px-2">
                            <span className="text-slate-500 font-medium">Total Price</span>
                            <span className="text-2xl font-black text-slate-900">$990.00</span>
                        </div>

                        <button
                            onClick={handlePay}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
                        >
                            <CreditCard className="size-5" />
                            Pay Now
                        </button>
                    </motion.div>
                )}

                {status === 'paying' && (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="size-16 border-t-2 border-emerald-600 rounded-full animate-spin mb-6" />
                        <h2 className="text-xl font-bold">Authorizing Transaction...</h2>
                        <p className="text-slate-500 text-sm">Connecting with secure payment gateway</p>
                    </div>
                )}

                {status === 'complete' && (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="size-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-6">
                            <ShieldCheck className="size-10" />
                        </div>
                        <h2 className="text-xl font-bold text-emerald-600">Payment Verified</h2>
                        <p className="text-slate-500 text-sm">Redirecting to your itinerary</p>
                    </div>
                )}
            </div>

            <p className="mt-8 text-slate-400 text-xs italic">
                This is a development mock. No real charges will be made.
            </p>
        </div>
    )
}
