"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<"signin" | "signup">("signin")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth()

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return

        setLoading(true)
        try {
            if (mode === "signin") {
                const { error } = await signInWithEmail(email, password)
                if (error) throw error
                toast.success("Welcome back!", { description: "Signed in successfully" })
                onClose()
            } else {
                const { error, needsVerification } = await signUpWithEmail(email, password)
                if (error) throw error

                if (needsVerification) {
                    toast.success("Check your email!", {
                        description: "We sent you a verification link",
                        duration: 6000
                    })
                    onClose()
                } else {
                    toast.success("Account created!", { description: "Welcome to SafarAI" })
                    onClose()
                }
            }
        } catch (err: any) {
            toast.error("Authentication failed", {
                description: err.message || "Please try again"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOAuth = async (provider: "google" | "facebook") => {
        setLoading(true)
        const { error } = await signInWithOAuth(provider)
        if (error) {
            toast.error("OAuth failed", { description: error.message })
            setLoading(false)
        }
        // OAuth will redirect, so we don't close modal
    }

    const resetForm = () => {
        setEmail("")
        setPassword("")
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-md bg-gradient-to-b from-neutral-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors z-10"
                        >
                            <X className="size-4" />
                        </button>

                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 text-center border-b border-white/5">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                                <User className="size-7 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                {mode === "signin" ? "Welcome Back" : "Create Account"}
                            </h2>
                            <p className="text-white/50 text-sm mt-1">
                                {mode === "signin"
                                    ? "Sign in to save and manage your trips"
                                    : "Join SafarAI to unlock your travel potential"}
                            </p>
                        </div>

                        <div className="p-8">
                            {/* OAuth Buttons */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => handleOAuth("google")}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
                                >
                                    <svg className="size-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <button
                                    onClick={() => handleOAuth("facebook")}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white font-medium rounded-xl hover:bg-[#1877F2]/90 transition-colors disabled:opacity-50"
                                >
                                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Continue with Facebook
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative flex items-center justify-center my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <span className="relative px-4 text-xs text-white/40 bg-neutral-900">or continue with email</span>
                            </div>

                            {/* Email Form */}
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        required
                                        minLength={6}
                                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
                                >
                                    {loading ? (
                                        <Loader2 className="size-5 animate-spin" />
                                    ) : mode === "signin" ? (
                                        "Sign In"
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </form>

                            {/* Toggle Mode */}
                            <p className="mt-6 text-center text-sm text-white/50">
                                {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    onClick={() => {
                                        setMode(mode === "signin" ? "signup" : "signin")
                                        resetForm()
                                    }}
                                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                >
                                    {mode === "signin" ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
