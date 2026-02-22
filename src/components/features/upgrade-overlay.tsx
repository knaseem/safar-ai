"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/features/auth-modal"

interface UpgradeOverlayProps {
    feature: string
    description?: string
}

export function UpgradeOverlay({ feature, description }: UpgradeOverlayProps) {
    const { user } = useAuth()
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    const isSignedOut = !user

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
        >
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
                className="max-w-md mx-4 text-center"
            >
                {/* Lock Icon */}
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                    <Lock className="size-8 text-emerald-400" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-3">
                    {feature}
                </h2>
                <p className="text-white/40 mb-2 text-sm uppercase tracking-widest font-medium">
                    {isSignedOut ? "Sign In Required" : "Pro Feature"}
                </p>
                <p className="text-white/50 text-base mb-8 max-w-sm mx-auto">
                    {isSignedOut
                        ? (description || `Sign in to access ${feature} and start exploring premium travel intelligence.`)
                        : (description || `Upgrade to SafarAI Pro to unlock ${feature} and other premium travel intelligence features.`)
                    }
                </p>

                {/* CTA */}
                {isSignedOut ? (
                    <Button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold px-8 py-6 rounded-xl text-base hover:scale-105 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                    >
                        <Sparkles className="size-4 mr-2" />
                        Sign In to Continue
                    </Button>
                ) : (
                    <Link href="/subscription">
                        <Button
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold px-8 py-6 rounded-xl text-base hover:scale-105 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                        >
                            <Sparkles className="size-4 mr-2" />
                            Upgrade to Pro
                            <ArrowRight className="size-4 ml-2" />
                        </Button>
                    </Link>
                )}

                {/* Dismiss */}
                <div className="mt-6">
                    <Link
                        href="/"
                        className="text-white/30 text-sm hover:text-white/50 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </motion.div>

            {isSignedOut && (
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            )}
        </motion.div>
    )
}
