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
            "Standard Itinerary Generation"
        ],
        cta: "Start Planning",
        popular: false
    },
    {
        name: "Citizen",
        price: "$499/month",
        description: "For the modern nomad using global travel as a lifestyle.",
        features: [
            "Zero Booking Fees",
            "Priority AI Processing",
            "Exclusive 'Hidden' Locations",
            "Private Jet & Yacht Integration",
            "Dedicated Human Agent Backup"
        ],
        cta: "Apply for Citizenship",
        popular: true
    }
]

export function Membership() {
    return (
        <section id="membership" className="py-32 bg-black relative">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.2)_0%,rgba(0,0,0,1)_70%)]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Unlock the World
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg">
                        Join a community of travelers who value time, freedom, and frictionless experiences.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative p-10 rounded-3xl border flex flex-col items-start h-full
                        ${tier.popular
                                    ? "bg-white/10 border-white/20 backdrop-blur-xl"
                                    : "bg-transparent border-white/5"
                                }`}
                        >
                            {tier.popular && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                    Most Popular
                                </span>
                            )}

                            <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                            <div className="text-3xl font-serif italic text-white/80 mb-4">{tier.price}</div>
                            <p className="text-white/50 mb-8">{tier.description}</p>

                            <ul className="space-y-4 mb-10 flex-1">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-white/70">
                                        <div className="p-1 bg-white/10 rounded-full mt-0.5">
                                            <Check className="size-3 text-emerald-400" />
                                        </div>
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full h-12 text-base ${tier.popular
                                    ? "bg-white text-black hover:bg-white/90"
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
