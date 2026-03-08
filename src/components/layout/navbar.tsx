"use client"

import * as React from "react"
import Link from "next/link"
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Plane, User, LogOut, Map, ChevronDown, Volume2, VolumeX,
    Scan, Receipt, Menu, X, CreditCard, TrendingUp, BookOpen,
    PieChart, Globe
} from "lucide-react"
import { VibeCheck } from "@/components/features/vibe-check"
import { ARLens } from "@/components/features/ar-lens"
import { AuthModal } from "@/components/features/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { useSound } from "@/components/features/ambient-sound-provider"
import { useSubscription } from "@/lib/subscription-context"
import { toast } from "sonner"

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

const NAV_LINKS = [
    { href: "/#destinations", label: "Destinations", icon: Globe },
    { href: "/#experience", label: "The Experience", icon: Scan },
    { href: "/subscription", label: "Subscription", icon: CreditCard },
    { href: "/trends", label: "Trends", icon: TrendingUp },
    { href: "/budget", label: "Planning", icon: PieChart },
    { href: "/receipts", label: "Receipts", icon: Receipt },
    { href: "/blog", label: "Blog", icon: BookOpen },
]

export function Navbar() {
    const { scrollY } = useScroll()
    const [scrolled, setScrolled] = React.useState(false)
    const [isVibeCheckOpen, setIsVibeCheckOpen] = React.useState(false)
    const [isARLensOpen, setIsARLensOpen] = React.useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const { user, loading, signOut } = useAuth()
    const { isMuted, toggleMute } = useSound()
    const { isPro } = useSubscription()

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50)
    })

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false)
        setIsUserMenuOpen(false)
    }, [])

    const handleSignOut = async () => {
        await signOut()
        setIsUserMenuOpen(false)
        setIsMobileMenuOpen(false)
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
                    {/* Logo */}
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

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
                        {NAV_LINKS.map(link => (
                            <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
                        ))}
                    </nav>

                    {/* Desktop Right Controls */}
                    <div className="flex items-center gap-3">
                        {/* Ambient Sound Toggle */}
                        <button
                            onClick={toggleMute}
                            aria-label={isMuted ? "Play ambient sound" : "Mute ambient sound"}
                            className="hidden sm:flex p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            title={isMuted ? "Play Ambience" : "Mute Ambience"}
                        >
                            {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                        </button>

                        {/* AR Lens Toggle */}
                        <button
                            onClick={() => {
                                if (!isPro) {
                                    toast("Pro Feature", {
                                        description: "AI Lens is available on the Pro plan.",
                                        action: { label: "Upgrade", onClick: () => window.location.href = "/subscription" }
                                    })
                                    return
                                }
                                setIsARLensOpen(true)
                            }}
                            aria-label="Open AI Lens"
                            className="hidden sm:flex p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors"
                            title="Open AR Lens"
                        >
                            <Scan className="size-5" />
                        </button>

                        {loading ? (
                            <div className="w-20 h-9 bg-white/10 rounded-lg animate-pulse" />
                        ) : user ? (
                            /* Logged In: Desktop User Menu */
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    aria-label="User menu"
                                    aria-expanded={isUserMenuOpen}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <div className="size-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                        <User className="size-4 text-emerald-400" />
                                    </div>
                                    <span className="text-sm text-white/80 max-w-[120px] truncate">
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
                                                <Link
                                                    href="/receipts"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                                >
                                                    <Receipt className="size-4" />
                                                    <span className="text-sm font-medium">Receipts</span>
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
                            /* Logged Out: Sign In — visible on ALL screen sizes */
                            <Button
                                variant="ghost"
                                onClick={() => setIsAuthModalOpen(true)}
                                className="text-white hover:text-white hover:bg-white/10"
                            >
                                Sign In
                            </Button>
                        )}

                        {/* Vibe Check CTA — desktop only */}
                        <Button
                            variant="premium"
                            size="sm"
                            onClick={() => setIsVibeCheckOpen(true)}
                            className="!bg-white !text-black font-bold hover:!bg-gray-100 hidden md:flex"
                        >
                            Find My Travel Vibe
                        </Button>

                        {/* Mobile Hamburger — always visible on mobile */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Open menu"
                            aria-expanded={isMobileMenuOpen}
                            className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer — full screen slide-down */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-0 z-40 md:hidden"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Drawer Panel */}
                        <div className="absolute top-0 left-0 right-0 bg-neutral-950 border-b border-white/10 pt-24 pb-8 px-6 shadow-2xl">
                            {/* Nav Links */}
                            <nav className="space-y-1 mb-6">
                                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <Icon className="size-4 text-white/40" />
                                        <span className="text-sm font-medium">{label}</span>
                                    </Link>
                                ))}
                            </nav>

                            <div className="border-t border-white/10 pt-6 space-y-3">
                                {user ? (
                                    <>
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <User className="size-4 text-white/40" />
                                            <span className="text-sm font-medium">My Profile</span>
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut className="size-4" />
                                            <span className="text-sm font-medium">Sign Out</span>
                                        </button>
                                    </>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false)
                                            setIsAuthModalOpen(true)
                                        }}
                                    >
                                        Sign In / Sign Up
                                    </Button>
                                )}

                                <Button
                                    variant="premium"
                                    className="w-full !bg-white !text-black font-bold hover:!bg-gray-100"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false)
                                        setIsVibeCheckOpen(true)
                                    }}
                                >
                                    Find My Travel Vibe
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <VibeCheck isOpen={isVibeCheckOpen} onClose={() => setIsVibeCheckOpen(false)} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <ARLens isOpen={isARLensOpen} onClose={() => setIsARLensOpen(false)} />
        </>
    )
}
