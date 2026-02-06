"use client"

import * as React from "react"
import Link from "next/link"
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plane, User, LogOut, Map, ChevronDown, Volume2, VolumeX } from "lucide-react"
import { VibeCheck } from "@/components/features/vibe-check"
import { AuthModal } from "@/components/features/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { useSound } from "@/components/features/ambient-sound-provider"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="relative group px-1 py-1"
        >
            <span className="relative z-10 hover:text-white transition-colors duration-300">{children}</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300 ease-out" />
            <span className="absolute inset-0 bg-white/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </Link>
    )
}

export function Navbar() {
    const { scrollY } = useScroll()
    const [scrolled, setScrolled] = React.useState(false)
    const [isVibeCheckOpen, setIsVibeCheckOpen] = React.useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
    const { user, loading, signOut } = useAuth()
    const { isMuted, toggleMute } = useSound()

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
                                scale: [1, 1.15, 1]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                repeatDelay: 2,
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

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
                        <NavLink href="/#destinations">Destinations</NavLink>
                        <NavLink href="/#experience">The Experience</NavLink>
                        <NavLink href="/#membership">Membership</NavLink>
                        <NavLink href="/trends">Trends</NavLink>
                        <NavLink href="/budget">Planning</NavLink>
                        <NavLink href="/blog">Blog</NavLink>
                    </nav>

                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="w-20 h-9 bg-white/10 rounded-lg animate-pulse" />
                        ) : user ? (
                            /* Logged In: User Menu */
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    aria-label="User menu"
                                    aria-expanded={isUserMenuOpen}
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
                                                    href="/profile"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                                >
                                                    <Map className="size-4" />
                                                    <span className="text-sm font-medium">My Profile</span>
                                                </Link>
                                                {/* Mobile Navigation Links */}
                                                <div className="md:hidden mt-2 pt-2 border-t border-white/10">
                                                    <Link href="/#membership" onClick={() => setIsUserMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                                                        Membership
                                                    </Link>
                                                    <Link href="/budget" onClick={() => setIsUserMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                                                        Budget
                                                    </Link>
                                                    <Link href="/trends" onClick={() => setIsUserMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                                                        Trends
                                                    </Link>
                                                    <Link href="/blog" onClick={() => setIsUserMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                                                        Blog
                                                    </Link>
                                                </div>
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


                        {/* Ambient Sound Toggle */}
                        <button
                            onClick={toggleMute}
                            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            title={isMuted ? "Play Ambience" : "Mute Ambience"}
                        >
                            {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                        </button>

                        <Button variant="premium" size="sm" onClick={() => setIsVibeCheckOpen(true)} className="!bg-white !text-black font-bold hover:!bg-gray-100">
                            Find My Travel Vibe
                        </Button>
                    </div>
                </div>
            </header >

            <VibeCheck isOpen={isVibeCheckOpen} onClose={() => setIsVibeCheckOpen(false)} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    )
}
