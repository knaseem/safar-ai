"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Shield, Rocket, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export function Membership() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const router = useRouter()

    const handleUpgrade = async (planId: string) => {
        if (planId === 'free') {
            router.push('/subscription')
            return
        }

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
        } finally {
            setIsLoading(null)
        }
    }

    const tiers = [
        {
            name: "Free",
            id: "free",
            price: "Free",
            description: "Essential intelligence for the casual explorer.",
            features: [
                "up to 5 Saved Itineraries",
                "1 PDF Export per month",
                "Standard AI Intelligence",
                "Basic Trip Planning",
                "Community Support"
            ],
            cta: "Get Started",
            highlight: false,
            badge: "Essentials"
        },
        {
            name: "Pro",
            id: "pro",
            price: billingCycle === 'monthly' ? "$14.99" : "$69.99",
            period: billingCycle === 'monthly' ? "/month" : "/year",
            description: "The ultimate concierge for elite travelers.",
            features: [
                "Unlimited Itineraries & PDFs",
                "AI Lens & Visual Search",
                "Real-time Travel Trends",
                "AI Budgeting Dashboard",
                "Priority Local Concierge",
                "24/7 Priority Support"
            ],
            cta: billingCycle === 'yearly' ? "Claim Founder Offer" : "Join the Elite",
            highlight: true,
            badge: billingCycle === 'yearly' ? "Founder's Special" : "Best Value",
            details: billingCycle === 'yearly' ? "Billed annually • Save 80%" : "Billed monthly"
        }
    ]

    return (
        <section id="membership" className="py-32 bg-black relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,rgba(0,0,0,1)_80%)]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-500/20"
                    >
                        <Sparkles className="size-3" />
                        Exclusive Access
                    </motion.div>

                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        One Plan for Global <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 italic">Excellence.</span>
                    </h2>

                    <p className="text-white/40 text-lg mb-12">
                        Transparent pricing for the modern nomad. No hidden fees, just pure travel intelligence.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-7 bg-white/10 rounded-full relative p-1 transition-colors hover:bg-white/20"
                        >
                            <motion.div
                                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                                className="w-5 h-5 bg-emerald-500 rounded-full"
                            />
                        </button>
                        <span className={`text-sm flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-white' : 'text-white/40'}`}>
                            Yearly
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">Save 80%</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {tiers.map((tier, idx) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 group
                                ${tier.highlight
                                    ? "bg-white/5 border-emerald-500/50 shadow-2xl shadow-emerald-500/10"
                                    : "bg-black/40 border-white/10 hover:border-white/20"
                                }`}
                        >
                            {tier.highlight && (
                                <>
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest shadow-xl">
                                        {tier.badge}
                                    </div>
                                    <div className="absolute inset-0 bg-emerald-500/5 blur-3xl -z-10 rounded-full" />
                                </>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tighter">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold text-white tracking-tighter">{tier.price}</span>
                                    {tier.period && <span className="text-white/40 text-lg">{tier.period}</span>}
                                </div>
                                {tier.details && <p className="text-emerald-400/60 text-xs font-medium mt-2 uppercase tracking-wide">{tier.details}</p>}
                            </div>

                            <p className="text-white/50 text-sm mb-8 leading-relaxed">
                                {tier.description}
                            </p>

                            <ul className="space-y-4 mb-10">
                                {tier.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start gap-3 group/item">
                                        <div className={`mt-0.5 p-0.5 rounded-full ${tier.highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                                            <Check className="size-3.5" />
                                        </div>
                                        <span className="text-sm text-white/70 group-hover/item:text-white transition-colors">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleUpgrade(tier.id)}
                                disabled={isLoading === tier.id}
                                className={`w-full h-14 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all
                                    ${tier.highlight
                                        ? "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                    }`}
                            >
                                {isLoading === tier.id ? (
                                    <div className="size-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {tier.cta}
                                        <ArrowRight className="size-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-white/20 text-sm">
                        All plans include 256-bit SSL security and dedicated data protection. <br className="hidden md:block" />
                        Join over 5,000 elite travelers who trust Safar AI.
                    </p>
                </div>
            </div>
        </section>
    )
}
