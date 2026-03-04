import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: "2026-01-28.clover",
})

/**
 * POST /api/billing-portal
 * Creates a Stripe Customer Portal session for the authenticated user
 * and returns the short-lived URL to redirect them to.
 */
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Look up the user's Stripe customer ID from our DB
        const supabaseAdmin = createAdminClient()
        const { data: profile } = await supabaseAdmin
            .from('travel_profiles')
            .select('stripe_customer_id, plan_tier')
            .eq('user_id', user.id)
            .single()

        if (!profile?.stripe_customer_id) {
            return NextResponse.json(
                { error: "No active subscription found. Please subscribe first." },
                { status: 404 }
            )
        }

        // Create a Stripe billing portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error("Billing portal error:", message)
        return NextResponse.json(
            { error: "Unable to open billing portal. Please try again." },
            { status: 500 }
        )
    }
}
