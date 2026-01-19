"use client"

import * as React from "react"
import Link from "next/link"
import { useScroll, useMotionValueEvent, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plane } from "lucide-react"

export function Navbar() {
    const { scrollY } = useScroll()
    const [scrolled, setScrolled] = React.useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50)
    })

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled ? "glass-dark py-3" : "py-6 bg-transparent"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <motion.div
                        animate={{
                            boxShadow: [
                                "0px 0px 0px rgba(255,255,255,0)",
                                "0px 0px 20px rgba(255,255,255,0.8)",
                                "0px 0px 0px rgba(255,255,255,0)"
                            ],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 10,
                            ease: "easeInOut"
                        }}
                        className="bg-white p-1.5 rounded-lg group-hover:bg-primary transition-colors"
                    >
                        <Plane className="size-5 text-black group-hover:text-white transition-colors" />
                    </motion.div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Safar<span className="text-white/60">AI</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
                    <Link href="#destinations" className="hover:text-white transition-colors">Destinations</Link>
                    <Link href="#experience" className="hover:text-white transition-colors">The Experience</Link>
                    <Link href="#membership" className="hover:text-white transition-colors">Membership</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 hidden sm:flex">
                        Sign In
                    </Button>
                    <Button variant="premium" size="sm">
                        Plan My Trip
                    </Button>
                </div>
            </div>
        </header>
    )
}
