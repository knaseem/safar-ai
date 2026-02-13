"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, CheckCircle, AlertTriangle, XCircle, ChevronDown, Search, Shield, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface VisaInfo {
    required: "none" | "visa_free" | "e_visa" | "visa_on_arrival" | "visa_required"
    duration: string
    notes: string
    documents?: string[]
}

interface VisaCheckerProps {
    destination?: string
    className?: string
}

// Curated visa data for popular routes (expandable)
const VISA_DATABASE: Record<string, Record<string, VisaInfo>> = {
    US: {
        JP: { required: "visa_free", duration: "90 days", notes: "Tourist visa waiver for US citizens", documents: ["Valid passport (6+ months)", "Return ticket", "Proof of accommodation"] },
        GB: { required: "visa_free", duration: "6 months", notes: "Standard visitor visa not required", documents: ["Valid passport", "Return ticket"] },
        FR: { required: "visa_free", duration: "90 days in 180 days", notes: "Schengen Area — 90/180 rule applies", documents: ["Valid passport", "Travel insurance recommended"] },
        DE: { required: "visa_free", duration: "90 days in 180 days", notes: "Schengen Area — 90/180 rule applies", documents: ["Valid passport", "Travel insurance recommended"] },
        IT: { required: "visa_free", duration: "90 days in 180 days", notes: "Schengen Area — 90/180 rule applies", documents: ["Valid passport", "Travel insurance recommended"] },
        ES: { required: "visa_free", duration: "90 days in 180 days", notes: "Schengen Area — 90/180 rule applies", documents: ["Valid passport", "Travel insurance recommended"] },
        NL: { required: "visa_free", duration: "90 days in 180 days", notes: "Schengen Area — 90/180 rule applies", documents: ["Valid passport", "Travel insurance recommended"] },
        AE: { required: "visa_free", duration: "30 days", notes: "Free visa on arrival for US citizens", documents: ["Valid passport (6+ months)"] },
        TH: { required: "visa_free", duration: "30 days", notes: "Visa exemption for tourism", documents: ["Valid passport (6+ months)", "Proof of onward travel"] },
        SG: { required: "visa_free", duration: "90 days", notes: "Visa not required for short visits", documents: ["Valid passport (6+ months)", "SG Arrival Card (digital)"] },
        MX: { required: "visa_free", duration: "180 days", notes: "No visa required for tourism", documents: ["Valid passport", "Immigration form"] },
        BR: { required: "e_visa", duration: "90 days", notes: "Electronic visa required since 2024", documents: ["Valid passport", "E-visa application", "Passport photo"] },
        IN: { required: "e_visa", duration: "30-90 days", notes: "E-visa available online", documents: ["Valid passport (6+ months)", "E-visa approval", "Passport photo"] },
        AU: { required: "e_visa", duration: "90 days", notes: "ETA (Electronic Travel Authority) required", documents: ["Valid passport", "ETA application"] },
        TR: { required: "e_visa", duration: "90 days", notes: "E-visa available at evisa.gov.tr", documents: ["Valid passport (6+ months)", "E-visa"] },
        EG: { required: "visa_on_arrival", duration: "30 days", notes: "Visa on arrival available at airport", documents: ["Valid passport (6+ months)", "$25 USD fee"] },
        SA: { required: "e_visa", duration: "90 days", notes: "Tourist e-visa available for US citizens", documents: ["Valid passport (6+ months)", "E-visa application"] },
        CN: { required: "visa_required", duration: "Varies", notes: "Tourist visa (L-type) required — apply at embassy", documents: ["Valid passport (6+ months)", "Visa application form", "Photo", "Itinerary", "Hotel booking", "Bank statements"] },
        RU: { required: "visa_required", duration: "30 days", notes: "Tourist visa required — apply in advance", documents: ["Valid passport", "Visa application", "Invitation letter", "Travel insurance"] },
    },
    GB: {
        US: { required: "visa_free", duration: "90 days", notes: "ESTA required for visa waiver", documents: ["Valid passport", "ESTA approval"] },
        JP: { required: "visa_free", duration: "90 days", notes: "Tourist visa waiver", documents: ["Valid passport"] },
        AE: { required: "visa_free", duration: "30 days", notes: "Free visa on arrival", documents: ["Valid passport (6+ months)"] },
        FR: { required: "visa_free", duration: "90 days in 180 days", notes: "Schengen visitor — passport stamped", documents: ["Valid passport"] },
        TH: { required: "visa_free", duration: "30 days", notes: "Visa exemption", documents: ["Valid passport (6+ months)"] },
    },
    IN: {
        AE: { required: "visa_on_arrival", duration: "14 days", notes: "Visa on arrival for Indian passport holders", documents: ["Valid passport (6+ months)", "Return ticket", "Hotel booking"] },
        TH: { required: "visa_on_arrival", duration: "15 days", notes: "Visa on arrival available", documents: ["Valid passport", "2000 THB fee", "Return ticket"] },
        SG: { required: "visa_required", duration: "30 days", notes: "Apply online or at VFS Global", documents: ["Valid passport", "Visa application", "Cover letter", "Bank statements"] },
        JP: { required: "visa_required", duration: "15-90 days", notes: "Apply at Japanese embassy", documents: ["Valid passport", "Visa application", "Photo", "Itinerary"] },
        US: { required: "visa_required", duration: "Up to 10 years (B1/B2)", notes: "DS-160 application + interview", documents: ["Valid passport", "DS-160", "Photo", "Bank statements", "Interview appointment"] },
        GB: { required: "visa_required", duration: "6 months", notes: "Standard visitor visa — apply online", documents: ["Valid passport", "Online application", "Supporting documents", "TB test certificate"] },
    },
    // Add more nationalities as needed
}

// Map destination names to ISO country codes
const DESTINATION_TO_CODE: Record<string, string> = {
    "japan": "JP", "tokyo": "JP", "osaka": "JP", "kyoto": "JP",
    "uk": "GB", "london": "GB", "england": "GB", "united kingdom": "GB",
    "france": "FR", "paris": "FR", "nice": "FR",
    "germany": "DE", "berlin": "DE", "munich": "DE", "frankfurt": "DE",
    "italy": "IT", "rome": "IT", "milan": "IT", "venice": "IT", "florence": "IT",
    "spain": "ES", "barcelona": "ES", "madrid": "ES",
    "netherlands": "NL", "amsterdam": "NL",
    "uae": "AE", "dubai": "AE", "abu dhabi": "AE",
    "thailand": "TH", "bangkok": "TH", "phuket": "TH",
    "singapore": "SG",
    "mexico": "MX", "cancun": "MX",
    "brazil": "BR", "rio": "BR", "sao paulo": "BR",
    "india": "IN", "delhi": "IN", "mumbai": "IN", "goa": "IN",
    "australia": "AU", "sydney": "AU", "melbourne": "AU",
    "turkey": "TR", "istanbul": "TR",
    "egypt": "EG", "cairo": "EG",
    "saudi arabia": "SA", "jeddah": "SA", "riyadh": "SA", "mecca": "SA", "medina": "SA",
    "china": "CN", "beijing": "CN", "shanghai": "CN",
    "russia": "RU", "moscow": "RU",
    "usa": "US", "new york": "US", "los angeles": "US", "miami": "US",
    "south korea": "KR", "seoul": "KR",
    "hong kong": "HK",
    "morocco": "MA", "marrakech": "MA",
}

const PASSPORT_OPTIONS = [
    { code: "US", label: "🇺🇸 United States", flag: "🇺🇸" },
    { code: "GB", label: "🇬🇧 United Kingdom", flag: "🇬🇧" },
    { code: "IN", label: "🇮🇳 India", flag: "🇮🇳" },
    { code: "CA", label: "🇨🇦 Canada", flag: "🇨🇦" },
    { code: "AU", label: "🇦🇺 Australia", flag: "🇦🇺" },
    { code: "DE", label: "🇩🇪 Germany", flag: "🇩🇪" },
    { code: "FR", label: "🇫🇷 France", flag: "🇫🇷" },
    { code: "AE", label: "🇦🇪 UAE", flag: "🇦🇪" },
    { code: "SA", label: "🇸🇦 Saudi Arabia", flag: "🇸🇦" },
    { code: "PK", label: "🇵🇰 Pakistan", flag: "🇵🇰" },
    { code: "JP", label: "🇯🇵 Japan", flag: "🇯🇵" },
    { code: "SG", label: "🇸🇬 Singapore", flag: "🇸🇬" },
]

export function VisaChecker({ destination, className }: VisaCheckerProps) {
    const [passport, setPassport] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [showDocs, setShowDocs] = useState(false)

    // Resolve destination to country code
    const destCode = useMemo(() => {
        if (!destination) return null
        const clean = destination.toLowerCase().trim()
        return DESTINATION_TO_CODE[clean] || null
    }, [destination])

    // Look up visa info
    const visaInfo = useMemo(() => {
        if (!passport || !destCode) return null
        return VISA_DATABASE[passport]?.[destCode] || null
    }, [passport, destCode])

    const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
        none: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "No Visa Required" },
        visa_free: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Visa-Free Entry" },
        e_visa: { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "E-Visa Available" },
        visa_on_arrival: { icon: Shield, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Visa on Arrival" },
        visa_required: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Visa Required" },
    }

    return (
        <div className={cn("rounded-2xl bg-white/5 border border-white/10 overflow-hidden", className)}>
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Globe className="size-4 text-blue-400" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-white">Visa & Entry Requirements</p>
                        <p className="text-[10px] text-white/40">
                            Check if you need a visa for {destination || "your destination"}
                        </p>
                    </div>
                </div>
                <ChevronDown className={cn("size-4 text-white/40 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 space-y-4">
                            {/* Passport Selector */}
                            <div>
                                <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">Your Passport</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {PASSPORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.code}
                                            onClick={() => setPassport(opt.code)}
                                            className={cn(
                                                "py-2 px-2 rounded-lg text-center transition-all text-sm",
                                                passport === opt.code
                                                    ? "bg-emerald-500/20 border border-emerald-500/30 text-white"
                                                    : "bg-white/5 border border-white/5 text-white/50 hover:bg-white/10"
                                            )}
                                        >
                                            <span className="text-lg block mb-0.5">{opt.flag}</span>
                                            <span className="text-[9px] font-medium">{opt.code}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Result */}
                            {passport && destCode && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    {visaInfo ? (
                                        <>
                                            {/* Status Badge */}
                                            {(() => {
                                                const sc = statusConfig[visaInfo.required] || statusConfig.visa_required
                                                const Icon = sc.icon
                                                return (
                                                    <div className={cn("flex items-center gap-3 p-4 rounded-xl border", sc.bg)}>
                                                        <Icon className={cn("size-5 shrink-0", sc.color)} />
                                                        <div>
                                                            <p className={cn("text-sm font-bold", sc.color)}>{sc.label}</p>
                                                            <p className="text-xs text-white/50 mt-0.5">Stay up to {visaInfo.duration}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })()}

                                            {/* Notes */}
                                            <div className="bg-white/5 rounded-xl p-3">
                                                <p className="text-xs text-white/60">{visaInfo.notes}</p>
                                            </div>

                                            {/* Required Documents */}
                                            {visaInfo.documents && (
                                                <div>
                                                    <button
                                                        onClick={() => setShowDocs(!showDocs)}
                                                        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors mb-2"
                                                    >
                                                        <FileText className="size-3" />
                                                        <span>Required Documents ({visaInfo.documents.length})</span>
                                                        <ChevronDown className={cn("size-3 transition-transform", showDocs && "rotate-180")} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {showDocs && (
                                                            <motion.ul
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="space-y-1.5 overflow-hidden"
                                                            >
                                                                {visaInfo.documents.map((doc, i) => (
                                                                    <li key={i} className="flex items-center gap-2 text-xs text-white/50 pl-1">
                                                                        <CheckCircle className="size-3 text-emerald-500/50 shrink-0" />
                                                                        {doc}
                                                                    </li>
                                                                ))}
                                                            </motion.ul>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                                            <Search className="size-5 text-white/30 shrink-0" />
                                            <div>
                                                <p className="text-sm text-white/60">Data not available</p>
                                                <p className="text-[10px] text-white/30">Check your embassy website for requirements</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Disclaimer */}
                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 mt-4">
                                <p className="text-[10px] text-amber-500/60 text-center leading-relaxed">
                                    <strong>LEGAL DISCLAIMER:</strong> This tool provides estimated requirements for planning purposes only.
                                    Visa rules change frequently. Safar AI is not a government agency.
                                    <br />
                                    <span className="opacity-80">You MUST verify all entry requirements with the official embassy or consulate of your destination before travel.</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
