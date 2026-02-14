import { createClient } from "@/lib/supabase/server"
import { PlanTier, PLAN_LIMITS } from "./plans"
import { getUserPlan } from "./user-plan"

export type UsageEvent = 'pdf_export'

export async function checkUsageLimit(userId: string, event: UsageEvent): Promise<{ allowed: boolean; current: number; limit: number }> {
    const plan = await getUserPlan(userId)
    const limits = PLAN_LIMITS[plan]

    let limit = 0
    if (event === 'pdf_export') {
        limit = limits.maxPdfExports
    }

    if (limit === Infinity) {
        return { allowed: true, current: 0, limit }
    }

    const supabase = await createClient()

    // Get count for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('event_type', event)
        .gte('created_at', startOfMonth.toISOString())

    if (error) {
        console.error(`Error checking usage for ${event}:`, error)
        return { allowed: false, current: 0, limit }
    }

    const currentCount = count || 0
    return {
        allowed: currentCount < limit,
        current: currentCount,
        limit
    }
}

export async function logUsageEvent(userId: string, event: UsageEvent) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('usage_logs')
        .insert({
            user_id: userId,
            event_type: event
        })

    if (error) {
        console.error(`Error logging usage for ${event}:`, error)
    }
}
