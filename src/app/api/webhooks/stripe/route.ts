import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendSubscriptionEmail } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: "2026-01-28.clover",
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

    const supabase = createAdminClient()

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.userId
                const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null
                const userEmail = session.customer_details?.email
                const userName = session.customer_details?.name || "Traveler"

                if (!userId) {
                    // ALERT: A paying customer has no userId — their upgrade was missed!
                    const alertMsg = `❌ CRITICAL: Stripe checkout.session.completed missing userId. Session: ${session.id}, Customer: ${stripeCustomerId}, Email: ${userEmail}`
                    console.error(alertMsg)
                    // Send alert to admin so they can manually resolve
                    await sendSubscriptionEmail({
                        to: process.env.ADMIN_EMAILS || 'knaseem22@gmail.com',
                        subject: '⚠️ SafarAI: Stripe Upgrade Missed — Manual Action Required',
                        userName: 'Admin',
                        planName: 'Pro',
                        type: 'payment_failed',
                        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin`
                    })
                    break
                }

                // 1. Upgrade User in DB and store stripe_customer_id for portal link
                const profileUpdate: Record<string, unknown> = { plan_tier: 'pro' }
                if (stripeCustomerId) profileUpdate.stripe_customer_id = stripeCustomerId

                const { error: updateError } = await supabase
                    .from('travel_profiles')
                    .update(profileUpdate)
                    .eq('user_id', userId)

                if (updateError) {
                    // Profile may not exist yet — upsert
                    await supabase
                        .from('travel_profiles')
                        .upsert({
                            user_id: userId,
                            plan_tier: 'pro',
                            ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {})
                        }, { onConflict: 'user_id' })
                }

                console.log(`✅ Upgraded user ${userId} to Pro (customer: ${stripeCustomerId})`)

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
                const invoice = event.data.object as Stripe.Invoice
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
                const subscription = event.data.object as Stripe.Subscription
                let userId = subscription.metadata?.userId

                // Fallback: metadata may not be on the subscription object
                // Look up user by customer email via Stripe
                if (!userId && subscription.customer) {
                    try {
                        const customerId = typeof subscription.customer === 'string'
                            ? subscription.customer
                            : (subscription.customer as Stripe.Customer).id
                        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
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
