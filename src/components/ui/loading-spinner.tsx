"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg"
    text?: string
    className?: string
    fullScreen?: boolean
}

const sizes = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12"
}

export function LoadingSpinner({
    size = "md",
    text,
    className,
    fullScreen = false
}: LoadingSpinnerProps) {
    const content = (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                <Loader2 className={cn(sizes[size], "text-emerald-500 animate-spin")} />
            </motion.div>
            {text && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/60 text-sm"
                >
                    {text}
                </motion.p>
            )}
        </div>
    )

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                {content}
            </div>
        )
    }

    return content
}
