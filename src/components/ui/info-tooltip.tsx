"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InfoTooltipProps {
    content: string;
    size?: number;
    className?: string;
}

export function InfoTooltip({ content, size = 16, className = "" }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <Info
                size={size}
                className="text-white/40 hover:text-white transition-colors cursor-help"
            />

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-neutral-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-[100] pointer-events-none"
                    >
                        <p className="text-xs text-white/90 text-center leading-relaxed font-medium">
                            {content}
                        </p>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900/95" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
