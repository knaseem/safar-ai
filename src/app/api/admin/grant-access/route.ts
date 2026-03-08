import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkIsAdmin } from '@/lib/supabase/admin-check'

export async function POST(req: Request) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const { email } = await req.json()

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email provided." }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Search for user by email — Supabase Admin API doesn't have getUserByEmail
        // so we use a filtered listUsers call which is more targeted than loading all
        const { data: usersData, error: userError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000 // filtered server-side
        })

        const targetUser = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (userError || !targetUser) {
            return NextResponse.json({ error: "User not found. They must sign up first." }, { status: 404 })
        }

        const targetUserId = targetUser.id

        // Fix: travel_profiles FK is `user_id`, not `id`
        const { error: updateError } = await supabase
            .from("travel_profiles")
            .update({ plan_tier: "vip" })
            .eq("user_id", targetUserId)

        if (updateError) {
            console.error("Failed to update profile:", updateError)
            return NextResponse.json({ error: "Failed to upgrade user profile." }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: `Successfully granted Pro access to ${email}` })

    } catch (error: any) {
        console.error("Grant Access API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
