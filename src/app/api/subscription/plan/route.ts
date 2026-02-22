import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_PLAN, PLAN_LIMITS, PlanTier } from "@/lib/plans"

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({
                plan: DEFAULT_PLAN,
                limits: PLAN_LIMITS[DEFAULT_PLAN],
                authenticated: false
            })
        }

        // Fetch the user's plan from travel_profiles
        const { data: profile, error } = await supabase
            .from("travel_profiles")
            .select("plan_tier")
            .eq("user_id", user.id)
            .single()

        const plan: PlanTier = (profile?.plan_tier as PlanTier) || DEFAULT_PLAN

        return NextResponse.json({
            plan,
            limits: PLAN_LIMITS[plan],
            authenticated: true
        })
    } catch (error) {
        console.error("Error fetching user plan:", error)
        return NextResponse.json({
            plan: DEFAULT_PLAN,
            limits: PLAN_LIMITS[DEFAULT_PLAN],
            authenticated: false
        })
    }
}
