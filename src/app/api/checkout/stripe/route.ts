import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16" as any,
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

        // 1. Determine the Price ID based on the selection
        // In a real app, these would be in your .env or a config file
        const getPriceId = () => {
            if (planId === 'pro') {
                return billingCycle === 'yearly'
                    ? process.env.STRIPE_PRICE_PRO_YEARLY
                    : process.env.STRIPE_PRICE_PRO_MONTHLY
            }
            return null
        }

        const priceId = getPriceId()

        if (!priceId) {
            // Fallback: If no Price ID is configured, we can use price_data for initial testing
            // But for long-term subscriptions, Price IDs are required.
            // For now, let's allow dynamic price creation for testing IF env is missing
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: `Safar AI Pro (${billingCycle})`,
                                description: billingCycle === 'yearly'
                                    ? "Founder's Special Annual Plan"
                                    : "Premium Travel Concierge Monthly",
                            },
                            unit_amount: billingCycle === 'yearly' ? 6999 : 1499,
                            recurring: {
                                interval: billingCycle === 'yearly' ? "year" : "month",
                            },
                        },
                        quantity: 1,
                    },
                ],
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
        }

        // Standard way: Use Price ID
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
    } catch (err: any) {
        console.error("Stripe Checkout Error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
