"use client"

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react"
import { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
    signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null; needsVerification?: boolean }>
    signInWithOAuth: (provider: "google" | "facebook") => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error: Error | null }>
    resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)

            // Show one-time welcome toast on first sign-in
            if (_event === "SIGNED_IN" && session?.user) {
                const welcomeKey = `safar_welcome_shown_${session.user.id}`
                if (!localStorage.getItem(welcomeKey)) {
                    localStorage.setItem(welcomeKey, "true")
                    setTimeout(() => {
                        toast("🎉 Welcome to SafarAI!", {
                            description: "Unlock Trends, AI Lens & unlimited itineraries with Pro.",
                            action: {
                                label: "Explore Pro →",
                                onClick: () => window.location.href = "/subscription"
                            },
                            duration: 8000,
                        })
                    }, 1500)
                }
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error as Error | null }
    }

    const signUpWithEmail = async (email: string, password: string) => {
        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        })

        // Check if email confirmation is required
        const needsVerification = (!error && data.user && !data.session) ? true : undefined
        return { error: error as Error | null, needsVerification }
    }

    const signInWithOAuth = async (provider: "google" | "facebook") => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
        return { error: error as Error | null }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
    }

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
        })
        return { error: error as Error | null }
    }

    const resendVerificationEmail = async (email: string) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        })
        return { error: error as Error | null }
    }

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signInWithEmail,
            signUpWithEmail,
            signInWithOAuth,
            signOut,
            resetPassword,
            resendVerificationEmail
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
