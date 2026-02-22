"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Sparkles, Zap, Globe, Plane, Rocket } from "lucide-react"
import { PLAN_LIMITS } from "@/lib/plans"
import { useAuth } from "@/lib/auth-context"
import { useSubscription } from "@/lib/subscription-context"
import { AuthModal } from "@/components/features/auth-modal"
import { toast } from "sonner"

const PLAN_ICONS = {
    free: Plane,
    pro: Rocket
}

const PLAN_DESCRIPTIONS = {
    free: "Essential intelligence for the casual explorer.",
    pro: "Full concierge power with unlimited access."
}

function SubscriptionPageContent() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const { user } = useAuth()
    const { plan: currentPlan, refresh } = useSubscription()
    const searchParams = useSearchParams()

    // Poll for plan update after successful Stripe checkout
    useEffect(() => {
        if (searchParams.get('success') !== 'true') return
        if (currentPlan === 'pro') {
            toast.success("Welcome to Pro!", { description: "Your plan has been upgraded." })
            return
        }

        const interval = setInterval(async () => {
            await refresh()
        }, 2000)
        const timeout = setTimeout(() => clearInterval(interval), 15000)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [searchParams, currentPlan, refresh])

    const handleUpgrade = async (planId: string) => {
        if (!user) {
            setIsAuthModalOpen(true)
            return
        }

        if (planId === 'free') return

        setIsLoading(planId)
        try {
            const res = await fetch("/api/checkout/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId,
                    billingCycle,
                }),
            })

            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || "Failed to create checkout session")
            }
        } catch (err: any) {
            console.error("Checkout error:", err)
            toast.error("Checkout failed", { description: err.message || "Please try again" })
        } finally {
            setIsLoading(null)
        }
    }

    const prices = {
        free: { monthly: "$0", yearly: "$0" },
        pro: { monthly: "$14.99", yearly: "$69.99" }
    }

    const PLAN_DESCRIPTIONS = {
        free: "Essential intelligence for the casual explorer.",
        pro: "The ultimate concierge for elite travelers."
    }

    const PRO_FEATURES = [
        "Unlimited Saved Itineraries",
        "Unlimited PDF Exports",
        "Book Experiences, Yachts & Private Jets",
        "AI Lens & Visual Exploration",
        "Premium Travel Trends Dashboard",
        "AI Budgeting & Expense Dashboard",
        "24/7 Priority Travel Concierge",
        "Real-time Local Destination Data"
    ]

    const FREE_FEATURES = [
        "up to 5 Saved Itineraries",
        "1 PDF Export per month",
        "Book Experiences, Yachts & Private Jets",
        "Standard AI Intelligence",
        "AI-Powered Trip Planning",
        "Community Support"
    ]

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <Navbar />

            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    >
                        <Sparkles className="size-3" />
                        Subscription Plans
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white tracking-tight"
                    >
                        Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Travel Intelligence</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 max-w-2xl mx-auto text-lg"
                    >
                        Choose the tier that matches your journey. Simple, transparent pricing for every explorer.
                    </motion.p>

                    {/* Billing Toggle */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-4 pt-4"
                    >
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                        >
                            Monthly
                        </button>
                        <div
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-12 h-6 rounded-full bg-white/10 border border-white/10 p-1 cursor-pointer flex items-center"
                        >
                            <motion.div
                                animate={{ x: billingCycle === 'yearly' ? 24 : 0 }}
                                className="size-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </div>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                        >
                            Yearly
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                Save 80%
                            </span>
                        </button>
                    </motion.div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {Object.entries(PLAN_LIMITS).map(([tier, limits], index) => {
                        const Icon = PLAN_ICONS[tier as keyof typeof PLAN_ICONS]
                        const isPro = tier === 'pro'
                        const price = prices[tier as keyof typeof prices][billingCycle]
                        const features = isPro ? PRO_FEATURES : FREE_FEATURES

                        return (
                            <motion.div
                                key={tier}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className={`relative group p-8 rounded-3xl border transition-all duration-500 ${isPro
                                    ? "bg-neutral-900 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.1)] scale-105 z-10"
                                    : "bg-neutral-900/50 border-white/5 hover:border-white/10"
                                    }`}
                            >
                                {isPro && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                                        {billingCycle === 'yearly' ? "Founder's Special Offer" : "Most Flexible"}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className={`size-12 rounded-2xl flex items-center justify-center ${isPro ? "bg-emerald-500 text-black" : "bg-white/5 text-white/60"
                                        }`}>
                                        <Icon className="size-6" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-white capitalize">{tier}</h3>
                                        <p className="text-sm text-white/40 mt-2">{PLAN_DESCRIPTIONS[tier as keyof typeof PLAN_DESCRIPTIONS]}</p>
                                    </div>

                                    <div className="flex flex-col h-16 justify-center">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-white">{price}</span>
                                            {tier !== 'free' && (
                                                <span className="text-white/40 text-sm">
                                                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                                                </span>
                                            )}
                                        </div>
                                        {isPro && billingCycle === 'yearly' && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-xs text-emerald-400 font-medium mt-1"
                                            >
                                                One-time payment for limited-time access
                                            </motion.p>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                        {features.map((feature, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-3 text-sm">
                                                <Check className={`size-4 ${isPro ? "text-emerald-500" : "text-white/40"}`} />
                                                <span className={isPro ? "text-white/80" : "text-white/40"}>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => handleUpgrade(tier)}
                                        disabled={isLoading === tier}
                                        className={`w-full h-12 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${isPro
                                            ? "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                            : "bg-white/5 text-white hover:bg-white/10"
                                            }`}
                                    >
                                        {isLoading === tier ? (
                                            <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        ) : currentPlan === tier ? (
                                            'Current Plan'
                                        ) : isPro ? (
                                            billingCycle === 'yearly' ? 'Claim Founder Offer' : 'Go Pro'
                                        ) : (
                                            'Downgrade'
                                        )}
                                    </Button>
                                </div>

                                {/* Background glow for Pro */}
                                {isPro && (
                                    <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl -z-10 blur-2xl" />
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                {/* Footer Notes */}
                <div className="pt-12 text-center">
                    <p className="text-white/20 text-sm max-w-xl mx-auto">
                        All plans include core AI itinerary generation and real-time destination data.
                        Yearly billing is a limited-time offer for our founding members.
                    </p>
                </div>
            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </main>
    )
}

export default function SubscriptionPage() {
    return (
        <Suspense>
            <SubscriptionPageContent />
        </Suspense>
    )
}
