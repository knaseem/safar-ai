import { createClient } from "@/lib/supabase/server"
import { PlanTier, PLAN_LIMITS, DEFAULT_PLAN } from "./plans"

export async function getUserPlan(userId: string): Promise<PlanTier> {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('travel_profiles')
            .select('plan_tier')
            .eq('user_id', userId)
            .single()

        if (error || !data?.plan_tier) {
            return DEFAULT_PLAN
        }

        return data.plan_tier as PlanTier
    } catch (error) {
        console.error("Error fetching user plan:", error)
        return DEFAULT_PLAN
    }
}

export async function checkTripLimit(userId: string): Promise<{ allowed: boolean; count: number; limit: number }> {
    const plan = await getUserPlan(userId)
    const limit = PLAN_LIMITS[plan].maxTrips

    if (limit === Infinity) {
        return { allowed: true, count: 0, limit }
    }

    const supabase = await createClient()
    const { count, error } = await supabase
        .from("saved_trips")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

    if (error) {
        console.error("Error checking trip limit:", error)
        return { allowed: false, count: 0, limit }
    }

    const currentCount = count || 0
    return {
        allowed: currentCount < limit,
        count: currentCount,
        limit
    }
}
