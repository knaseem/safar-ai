import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: "2026-01-28.clover",
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { planId, billingCycle } = body // 'pro', 'monthly' | 'yearly'

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Determine the Price ID based on the selection
        const getPriceId = () => {
            if (planId === 'pro') {
                return billingCycle === 'yearly'
                    ? process.env.STRIPE_PRICE_PRO_YEARLY
                    : process.env.STRIPE_PRICE_PRO_MONTHLY
            }
            return null
        }

        const priceId = getPriceId()

        // Price ID is required — no dynamic fallback in production
        if (!priceId) {
            console.error(`Stripe checkout: no Price ID configured for plan "${planId}" / "${billingCycle}"`)
            return NextResponse.json(
                { error: "Checkout is temporarily unavailable. Please try again later." },
                { status: 503 }
            )
        }

        // Create the checkout session using the configured Price ID
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
            customer_email: user.email,
            metadata: {
                userId: user.id,
                planTier: planId,
                billingCycle: billingCycle
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error("Stripe Checkout Error:", message)
        // Return a safe generic message — never expose Stripe internals to the client
        return NextResponse.json(
            { error: "Unable to initiate checkout. Please try again." },
            { status: 500 }
        )
    }
}
