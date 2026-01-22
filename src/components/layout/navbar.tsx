"use client"

import * as React from "react"
import Link from "next/link"
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plane, User, LogOut, Map, ChevronDown } from "lucide-react"
import { VibeCheck } from "@/components/features/vibe-check"
import { AuthModal } from "@/components/features/auth-modal"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
    const { scrollY } = useScroll()
    const [scrolled, setScrolled] = React.useState(false)
    const [isVibeCheckOpen, setIsVibeCheckOpen] = React.useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
    const { user, loading, signOut } = useAuth()

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50)
    })

    const handleSignOut = async () => {
        await signOut()
        setIsUserMenuOpen(false)
    }

    return (
        <>
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
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="w-20 h-9 bg-white/10 rounded-lg animate-pulse" />
                        ) : user ? (
                            /* Logged In: User Menu */
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <div className="size-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                        <User className="size-4 text-emerald-400" />
                                    </div>
                                    <span className="text-sm text-white/80 hidden sm:block max-w-[120px] truncate">
                                        {user.email?.split("@")[0]}
                                    </span>
                                    <ChevronDown className={cn(
                                        "size-4 text-white/40 transition-transform",
                                        isUserMenuOpen && "rotate-180"
                                    )} />
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                                        >
                                            <div className="p-2">
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                                >
                                                    <Map className="size-4" />
                                                    <span className="text-sm font-medium">My Trips</span>
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut className="size-4" />
                                                    <span className="text-sm font-medium">Sign Out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            /* Logged Out: Sign In Button */
                            <Button
                                variant="ghost"
                                onClick={() => setIsAuthModalOpen(true)}
                                className="text-white hover:text-white hover:bg-white/10 hidden sm:flex"
                            >
                                Sign In
                            </Button>
                        )}
                        <Button variant="premium" size="sm" onClick={() => setIsVibeCheckOpen(true)}>
                            Plan My Trip
                        </Button>
                    </div>
                </div>
            </header>

            <VibeCheck isOpen={isVibeCheckOpen} onClose={() => setIsVibeCheckOpen(false)} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    )
}
