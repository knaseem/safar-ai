import { motion } from "framer-motion"
import { Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PassportCardProps {
    archetype: string
    scores: Record<string, number>
    onClose?: () => void
    actionButton?: React.ReactNode
    className?: string
}

export function PassportCard({ archetype, scores, onClose, actionButton, className }: PassportCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className={cn("bg-[#1a1a1a] border-2 border-[#D4AF37] rounded-3xl p-1 shadow-2xl overflow-hidden relative max-w-md w-full mx-auto", className)}
        >
            {/* Inner Passport Frame */}
            <div className="border border-[#D4AF37]/30 rounded-[20px] p-6 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5 relative text-center">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-block p-3 rounded-full border-2 border-[#D4AF37] mb-4">
                        <Fingerprint className="size-8 text-[#D4AF37]" />
                    </div>
                    <h2 className="text-2xl font-serif text-[#D4AF37] uppercase tracking-widest mb-1">Travel DNA</h2>
                    <p className="text-xs text-[#D4AF37]/60 uppercase tracking-widest">Official Document</p>
                </div>

                <div className="space-y-6 relative">
                    {/* Stamp Effect */}
                    <div className="absolute -right-4 top-10 w-32 h-32 border-4 border-emerald-500/20 rounded-full flex items-center justify-center -rotate-12 pointer-events-none">
                        <span className="text-emerald-500/20 text-xs font-bold uppercase">Verified</span>
                    </div>

                    {/* Main Archetype */}
                    <div className="text-center py-6 bg-black/40 rounded-xl border border-[#D4AF37]/20 relative z-10">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Classified As</div>
                        <div className="text-2xl md:text-3xl font-bold text-white font-serif italic text-shadow-sm">
                            "{archetype}"
                        </div>
                    </div>

                    {/* Traits List (Passport Data) */}
                    <div className="grid grid-cols-2 gap-3 text-left bg-black/20 p-4 rounded-xl relative z-10">
                        {Object.entries(scores || {})
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 4)
                            .map(([trait, score]) => (
                                <div key={trait} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                    <span className="text-xs text-[#D4AF37]/80 uppercase tracking-wider font-medium">{trait}</span>
                                    <span className="text-white font-mono text-sm">LVL {score}</span>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="mt-8 space-y-3">
                    {actionButton}
                </div>
            </div>
        </motion.div>
    )
}
