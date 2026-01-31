"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PassengerData {
    type: "adult" | "child" | "infant_without_seat"
    given_name: string
    family_name: string
    gender: "male" | "female"
    born_on: string
    email: string
    phone_number: string
    title: "mr" | "ms" | "mrs" | "miss" | "dr"
}

interface CheckoutFormProps {
    passengerCount: number
    onSubmit: (passengers: PassengerData[]) => void
    disabled?: boolean
    submitting?: boolean
    initialData?: {
        email?: string
        firstName?: string
        lastName?: string
        phone?: string
    }
}

export function CheckoutForm({ passengerCount, onSubmit, disabled, submitting, initialData }: CheckoutFormProps) {
    const [passengers, setPassengers] = useState<PassengerData[]>(
        Array(passengerCount).fill(null).map(() => ({
            type: "adult",
            given_name: initialData?.firstName || "",
            family_name: initialData?.lastName || "",
            gender: "male",
            born_on: "",
            email: initialData?.email || "",
            phone_number: initialData?.phone || "",
            title: "mr",
        }))
    )
    const [expandedPassenger, setExpandedPassenger] = useState(0)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const updatePassenger = (index: number, field: keyof PassengerData, value: string) => {
        setPassengers(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
        // Clear error for this field
        setErrors(prev => {
            const key = `${index}-${field}`
            const { [key]: _, ...rest } = prev
            return rest
        })
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        passengers.forEach((p, i) => {
            if (!p.given_name.trim()) newErrors[`${i}-given_name`] = "First name required"
            if (!p.family_name.trim()) newErrors[`${i}-family_name`] = "Last name required"
            if (!p.email.trim()) newErrors[`${i}-email`] = "Email required"
            if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
                newErrors[`${i}-email`] = "Invalid email"
            }
            if (!p.born_on) newErrors[`${i}-born_on`] = "Date of birth required"
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return
        onSubmit(passengers)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {passengers.map((passenger, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                >
                    {/* Header */}
                    <button
                        type="button"
                        onClick={() => setExpandedPassenger(expandedPassenger === index ? -1 : index)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <User className="size-5 text-emerald-500" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-white">
                                    Passenger {index + 1}
                                    {passenger.given_name && ` - ${passenger.given_name} ${passenger.family_name}`}
                                </p>
                                <p className="text-sm text-white/50">Adult</p>
                            </div>
                        </div>
                        <ChevronDown
                            className={`size-5 text-white/40 transition-transform ${expandedPassenger === index ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {/* Form Fields */}
                    {expandedPassenger === index && (
                        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-white/10">
                            {/* Title & Name Row */}
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Title</label>
                                    <select
                                        value={passenger.title}
                                        onChange={(e) => updatePassenger(index, "title", e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                                    >
                                        <option value="mr">Mr</option>
                                        <option value="ms">Ms</option>
                                        <option value="mrs">Mrs</option>
                                        <option value="miss">Miss</option>
                                        <option value="dr">Dr</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm text-white/60 mb-2">First Name *</label>
                                    <input
                                        type="text"
                                        value={passenger.given_name}
                                        onChange={(e) => updatePassenger(index, "given_name", e.target.value)}
                                        className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 ${errors[`${index}-given_name`] ? "border-red-500/50" : "border-white/10"
                                            }`}
                                        placeholder="As on passport"
                                    />
                                    {errors[`${index}-given_name`] && (
                                        <p className="text-xs text-red-400 mt-1">{errors[`${index}-given_name`]}</p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm text-white/60 mb-2">Last Name *</label>
                                    <input
                                        type="text"
                                        value={passenger.family_name}
                                        onChange={(e) => updatePassenger(index, "family_name", e.target.value)}
                                        className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 ${errors[`${index}-family_name`] ? "border-red-500/50" : "border-white/10"
                                            }`}
                                        placeholder="As on passport"
                                    />
                                    {errors[`${index}-family_name`] && (
                                        <p className="text-xs text-red-400 mt-1">{errors[`${index}-family_name`]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Gender & DOB Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Gender *</label>
                                    <select
                                        value={passenger.gender}
                                        onChange={(e) => updatePassenger(index, "gender", e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Date of Birth *</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                                        <input
                                            type="date"
                                            value={passenger.born_on}
                                            onChange={(e) => updatePassenger(index, "born_on", e.target.value)}
                                            className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-lg text-white focus:outline-none focus:border-emerald-500/50 ${errors[`${index}-born_on`] ? "border-red-500/50" : "border-white/10"
                                                }`}
                                        />
                                    </div>
                                    {errors[`${index}-born_on`] && (
                                        <p className="text-xs text-red-400 mt-1">{errors[`${index}-born_on`]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contact Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                                        <input
                                            type="email"
                                            value={passenger.email}
                                            onChange={(e) => updatePassenger(index, "email", e.target.value)}
                                            className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 ${errors[`${index}-email`] ? "border-red-500/50" : "border-white/10"
                                                }`}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    {errors[`${index}-email`] && (
                                        <p className="text-xs text-red-400 mt-1">{errors[`${index}-email`]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Phone (Optional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                                        <input
                                            type="tel"
                                            value={passenger.phone_number}
                                            onChange={(e) => updatePassenger(index, "phone_number", e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={disabled || submitting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
                {submitting ? (
                    <span className="flex items-center gap-2">
                        <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                    </span>
                ) : (
                    "Complete Booking"
                )}
            </Button>
        </form>
    )
}
