"use client"

import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"

const tiers = [
    {
        name: "Voyager",
        price: "Pay as you go",
        description: "Perfect for the occasional luxury escape.",
        features: [
            "Access to Autonomous Booking",
            "Curated Hotel Collection",
            "24/7 AI Concierge Support",
            "Standard Itinerary Generation",
            "5% Booking Fee"
        ],
        cta: "Start Planning",
        highlight: false,
        glow: false
    },
    {
        name: "Explorer",
        price: "$29/month",
        period: "or $299/year",
        description: "For the frequent traveler seeking smarter trips.",
        features: [
            "Zero Booking Fees",
            "Early Access to Deals",
            "Advanced 'Deep Dive' AI",
            "3 Saved Trip Profiles",
            "Priority Support"
        ],
        cta: "Start Free Trial",
        highlight: true,
        badge: "Most Popular",
        glow: "emerald"
    },
    {
        name: "Citizen",
        price: "$499/month",
        description: "The ultimate lifestyle for the modern nomad.",
        features: [
            "Dedicated Human Concierge",
            "Private Jet & Yacht Integration",
            "Exclusive 'Hidden' Locations",
            "Impossible Reservations",
            "Vetted Villa Rentals"
        ],
        cta: "Apply for Citizenship",
        highlight: false,
        badge: "Exclusive",
        glow: "gold"
    }
]

export function Membership() {
    return (
        <section id="membership" className="py-32 bg-black relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,rgba(0,0,0,1)_70%)]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Unlock the World
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg">
                        Choose the travel lifestyle that suits your journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative p-8 rounded-3xl border flex flex-col items-start h-full group transition-all duration-500 hover:-translate-y-2
                        ${tier.highlight
                                    ? "bg-white/5 border-emerald-500/50 shadow-2xl shadow-emerald-900/20"
                                    : "bg-transparent border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                                }`}
                        >
                            {/* Glow Effects */}
                            {tier.glow === "emerald" && (
                                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl -z-10 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            )}
                            {tier.glow === "gold" && (
                                <div className="absolute inset-0 bg-amber-500/5 blur-3xl -z-10 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            )}

                            {/* Badge */}
                            {tier.badge && (
                                <span className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg
                                    ${tier.badge === "Most Popular"
                                        ? "bg-gradient-to-r from-emerald-400 to-emerald-600 text-black"
                                        : "bg-gradient-to-r from-amber-200 to-amber-500 text-black"
                                    }`}>
                                    {tier.badge}
                                </span>
                            )}

                            <h3 className={`text-2xl font-bold mb-2 ${tier.name === "Citizen" ? "text-amber-200" : "text-white"}`}>{tier.name}</h3>
                            <div className="mb-4">
                                <span className="text-3xl font-serif italic text-white">{tier.price}</span>
                                {tier.period && <span className="text-sm text-white/40 block mt-1">{tier.period}</span>}
                            </div>
                            <p className="text-white/50 mb-8 min-h-[48px]">{tier.description}</p>

                            <ul className="space-y-4 mb-10 flex-1 w-full">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-white/70">
                                        <div className={`p-1 rounded-full mt-0.5 ${tier.highlight ? "bg-emerald-500/20" : "bg-white/10"}`}>
                                            <Check className={`size-3 ${tier.highlight ? "text-emerald-400" : "text-white/60"}`} />
                                        </div>
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full h-12 text-base font-medium transition-all duration-300
                                    ${tier.highlight
                                        ? "bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                    }`}
                            >
                                {tier.cta}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <footer className="mt-32 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-white/30 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white/50">SafarAI</span>
                        <span>© 2026 Inc.</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </footer>
            </div>
        </section>
    )
}
