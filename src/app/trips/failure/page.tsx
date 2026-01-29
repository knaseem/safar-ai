"use client"

import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function BookingFailurePage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
            >
                <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="size-10 text-red-400" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Booking Interrupted</h1>
                <p className="text-white/60 mb-8">
                    Your booking session was not completed. No charges have been made.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => router.back()}
                        className="w-full bg-white text-black hover:bg-white/90 py-6 rounded-xl text-lg font-bold"
                    >
                        <RefreshCw className="size-5 mr-2" /> Try Again
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="text-white/40 hover:text-white"
                    >
                        <ArrowLeft className="size-4 mr-2" /> Return Home
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
