import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { sendSubscriptionEmail } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16" as any,
})

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    let event: Stripe.Event

    // Verify the webhook signature when secret is available
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            )
        } catch (err: any) {
            console.error(`⚠️ Webhook signature verification failed:`, err.message)
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        }
    } else if (process.env.NODE_ENV === 'production') {
        // In production, ALWAYS require signature verification
        console.error("❌ STRIPE_WEBHOOK_SECRET not set in production — rejecting request")
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    } else {
        // Fallback for local development only
        console.warn("⚠️ STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev only)")
        event = JSON.parse(body) as Stripe.Event
    }

    const supabase = await createClient()

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as any
                const userId = session.metadata?.userId
                const userEmail = session.customer_details?.email
                const userName = session.customer_details?.name || "Traveler"

                if (!userId) {
                    console.error("❌ No userId in session metadata")
                    break
                }

                // 1. Upgrade User in DB
                const { error: updateError } = await supabase
                    .from('travel_profiles')
                    .update({ plan_tier: 'pro' })
                    .eq('user_id', userId)

                if (updateError) {
                    // Profile may not exist yet — upsert
                    await supabase
                        .from('travel_profiles')
                        .upsert({
                            user_id: userId,
                            plan_tier: 'pro'
                        }, { onConflict: 'user_id' })
                }

                console.log(`✅ Upgraded user ${userId} to Pro`)

                // 2. Trigger Welcome Email
                if (userEmail) {
                    await sendSubscriptionEmail({
                        to: userEmail,
                        subject: "Welcome to Safar AI Pro! ✨",
                        userName: userName,
                        planName: "Pro",
                        type: 'welcome_pro',
                        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
                    })
                }
                break
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as any
                const userEmail = invoice.customer_email

                if (userEmail) {
                    await sendSubscriptionEmail({
                        to: userEmail,
                        subject: "Action Required: Payment Failed for Safar AI Pro ⚠️",
                        userName: "Traveler",
                        planName: "Pro",
                        type: 'payment_failed',
                        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`
                    })
                }
                break
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as any
                let userId = subscription.metadata?.userId

                // Fallback: metadata may not be on the subscription object
                // Look up user by customer email via Stripe
                if (!userId && subscription.customer) {
                    try {
                        const customer = await stripe.customers.retrieve(subscription.customer) as any
                        if (customer?.email) {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('id')
                                .eq('email', customer.email)
                                .single()
                            if (profile) userId = profile.id
                        }
                    } catch (e) {
                        console.error("Failed to look up customer for downgrade:", e)
                    }
                }

                if (userId) {
                    // Downgrade User to Free
                    await supabase
                        .from('travel_profiles')
                        .update({ plan_tier: 'free' })
                        .eq('user_id', userId)

                    console.log(`⬇️ Downgraded user ${userId} to Free`)
                } else {
                    console.error("❌ Could not determine userId for subscription cancellation")
                }
                break
            }

            default:
                console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (err: any) {
        console.error(`Stripe Webhook Error: ${err.message}`)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
    }
}
