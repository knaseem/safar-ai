"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { PlanTier, PlanLimits, PLAN_LIMITS, DEFAULT_PLAN } from "@/lib/plans"

interface SubscriptionContextType {
    plan: PlanTier
    limits: PlanLimits
    isPro: boolean
    loading: boolean
    refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth()
    const [plan, setPlan] = useState<PlanTier>(DEFAULT_PLAN)
    const [loading, setLoading] = useState(true)

    const fetchPlan = useCallback(async () => {
        if (!user) {
            setPlan(DEFAULT_PLAN)
            setLoading(false)
            return
        }

        try {
            const res = await fetch("/api/subscription/plan")
            if (res.ok) {
                const data = await res.json()
                setPlan(data.plan as PlanTier)
            }
        } catch (err) {
            console.error("Failed to fetch subscription plan:", err)
            setPlan(DEFAULT_PLAN)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!authLoading) {
            fetchPlan()
        }
    }, [authLoading, fetchPlan])

    return (
        <SubscriptionContext.Provider value={{
            plan,
            limits: PLAN_LIMITS[plan],
            isPro: plan === 'pro',
            loading: loading || authLoading,
            refresh: fetchPlan,
        }}>
            {children}
        </SubscriptionContext.Provider>
    )
}

export function useSubscription() {
    const context = useContext(SubscriptionContext)
    if (context === undefined) {
        throw new Error("useSubscription must be used within a SubscriptionProvider")
    }
    return context
}
