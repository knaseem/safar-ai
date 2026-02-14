import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { checkUsageLimit, logUsageEvent, UsageEvent } from "@/lib/usage"

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { event } = await req.json()
        const usageEvent = event as UsageEvent

        const { allowed, current, limit } = await checkUsageLimit(user.id, usageEvent)

        if (!allowed) {
            return NextResponse.json({
                error: "Monthly limit reached",
                current,
                limit,
                code: 'LIMIT_REACHED'
            }, { status: 403 })
        }

        await logUsageEvent(user.id, usageEvent)

        return NextResponse.json({ success: true, current: current + 1, limit })
    } catch (error) {
        console.error("Usage tracking error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
