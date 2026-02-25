import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.replaceAll(" ", "").split(",") || []

async function verifyAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
        return null
    }
    return user
}

export async function POST(req: Request) {
    const admin = await verifyAdmin()
    if (!admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const { email } = await req.json()

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email provided." }, { status: 400 })
        }

        const supabase = createAdminClient()

        // 1. Find user UUID by email using Auth Admin API
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()

        if (usersError) {
            console.error("Failed to list users:", usersError)
            return NextResponse.json({ error: "Failed to query system users." }, { status: 500 })
        }

        const targetUser = usersData.users.find(u => u.email === email)

        if (!targetUser) {
            return NextResponse.json({ error: "User not found. They must sign up first." }, { status: 404 })
        }

        // 2. Update their travel_profile to Pro
        const { error: updateError } = await supabase
            .from("travel_profiles")
            .update({
                subscription_tier: "pro",
                subscription_status: "active"
            })
            .eq("id", targetUser.id)

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
