"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Check, ChevronDown, Heart, Plane, Briefcase, Clock2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface InsuranceCardProps {
    travelers: number
    onSelect: (plan: "none" | "basic" | "premium") => void
    selectedPlan?: "none" | "basic" | "premium"
    className?: string
}

const plans = [
    {
        id: "basic" as const,
        name: "Essential Cover",
        price: 49,
        badge: "Popular",
        color: "emerald",
        features: [
            { icon: Heart, label: "Medical up to $50,000" },
            { icon: Plane, label: "Trip cancellation up to $2,500" },
            { icon: Briefcase, label: "Lost baggage up to $1,000" },
        ],
        excluded: ["Flight delay compensation", "Adventure sports", "Pre-existing conditions"],
    },
    {
        id: "premium" as const,
        name: "Premium Shield",
        price: 89,
        badge: "Best Value",
        color: "amber",
        features: [
            { icon: Heart, label: "Medical up to $100,000" },
            { icon: Plane, label: "Trip cancellation up to $10,000" },
            { icon: Briefcase, label: "Lost baggage up to $3,000" },
            { icon: Clock2, label: "Flight delay $200/6hrs" },
            { icon: AlertTriangle, label: "Adventure sports covered" },
        ],
        excluded: [],
    },
]

export function InsuranceCard({ travelers, onSelect, selectedPlan = "none", className }: InsuranceCardProps) {
    const [expanded, setExpanded] = useState(false)
    const [showDetails, setShowDetails] = useState<string | null>(null)

    return (
        <div className={cn("rounded-2xl bg-white/5 border border-white/10 overflow-hidden", className)}>
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-indigo-500/20 flex items-center justify-center relative">
                        <Shield className="size-5 text-indigo-400" />
                        {selectedPlan !== "none" && (
                            <div className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                <Check className="size-2.5 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-white">Travel Insurance</p>
                        <p className="text-[10px] text-white/40">
                            {selectedPlan === "none"
                                ? "Protect your trip from the unexpected"
                                : `${selectedPlan === "basic" ? "Essential" : "Premium"} — $${(selectedPlan === "basic" ? 49 : 89) * travelers} total`
                            }
                        </p>
                    </div>
                </div>
                <ChevronDown className={cn("size-4 text-white/40 transition-transform", expanded && "rotate-180")} />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            {/* Trust badges */}
                            <div className="flex items-center justify-center gap-4 py-2 px-3 bg-white/[0.03] rounded-lg">
                                <TrustBadge label="A+ Rated" />
                                <TrustBadge label="24/7 Claims" />
                                <TrustBadge label="Licensed" />
                            </div>

                            {/* Plan Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                {plans.map((plan) => {
                                    const isSelected = selectedPlan === plan.id
                                    const borderColor = plan.color === "amber"
                                        ? isSelected ? "border-amber-500/50" : "border-white/5"
                                        : isSelected ? "border-emerald-500/50" : "border-white/5"
                                    const bgColor = plan.color === "amber"
                                        ? isSelected ? "bg-amber-500/10" : "bg-white/5"
                                        : isSelected ? "bg-emerald-500/10" : "bg-white/5"
                                    const buttonColor = plan.color === "amber"
                                        ? "bg-amber-500 hover:bg-amber-600 text-black"
                                        : "bg-emerald-500 hover:bg-emerald-600 text-black"

                                    return (
                                        <motion.div
                                            key={plan.id}
                                            whileHover={{ scale: 1.02 }}
                                            className={cn(
                                                "rounded-xl border p-3 transition-all relative",
                                                borderColor, bgColor
                                            )}
                                        >
                                            {/* Badge */}
                                            <div className={cn(
                                                "absolute -top-2 left-3 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider",
                                                plan.color === "amber"
                                                    ? "bg-amber-500 text-black"
                                                    : "bg-emerald-500 text-black"
                                            )}>
                                                {plan.badge}
                                            </div>

                                            <p className="text-xs font-bold text-white mt-1">{plan.name}</p>
                                            <div className="flex items-baseline gap-0.5 my-2">
                                                <span className="text-2xl font-bold text-white">${plan.price}</span>
                                                <span className="text-[10px] text-white/30">/person</span>
                                            </div>

                                            {/* Features */}
                                            <ul className="space-y-1.5 mb-3">
                                                {plan.features.map((f, i) => (
                                                    <li key={i} className="flex items-center gap-1.5 text-[10px] text-white/60">
                                                        <Check className="size-3 text-emerald-500 shrink-0" />
                                                        <span className="leading-tight">{f.label}</span>
                                                    </li>
                                                ))}
                                                {plan.excluded.map((f, i) => (
                                                    <li key={`ex-${i}`} className="flex items-center gap-1.5 text-[10px] text-white/25 line-through">
                                                        <span className="size-3 shrink-0" />
                                                        <span className="leading-tight">{f}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Select Button */}
                                            <button
                                                onClick={() => onSelect(isSelected ? "none" : plan.id)}
                                                className={cn(
                                                    "w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors",
                                                    isSelected
                                                        ? buttonColor
                                                        : "bg-white/10 text-white/60 hover:bg-white/20"
                                                )}
                                            >
                                                {isSelected ? "✓ Selected" : "Select"}
                                            </button>

                                            {travelers > 1 && (
                                                <p className="text-[9px] text-white/20 text-center mt-1.5">
                                                    ${plan.price * travelers} for {travelers} travelers
                                                </p>
                                            )}
                                        </motion.div>
                                    )
                                })}
                            </div>

                            {/* Skip option */}
                            <button
                                onClick={() => onSelect("none")}
                                className={cn(
                                    "w-full text-center text-[10px] text-white/30 hover:text-white/50 transition-colors py-1",
                                    selectedPlan === "none" && "text-white/50 font-medium"
                                )}
                            >
                                {selectedPlan === "none" ? "✓ No insurance selected" : "Skip insurance"}
                            </button>

                            {/* Disclaimer */}
                            <p className="text-[8px] text-white/15 text-center leading-relaxed">
                                Underwritten by SafarGuard Insurance Ltd. Terms & conditions apply.
                                Claims processed within 5 business days.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function TrustBadge({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-1">
            <Shield className="size-3 text-indigo-400/50" />
            <span className="text-[9px] text-white/30 font-medium">{label}</span>
        </div>
    )
}
