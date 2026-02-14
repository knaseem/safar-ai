import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendSubscriptionEmail } from "@/lib/email"

// Mock Stripe init (You'll add the real one later)
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
    const body = await req.text()
    // const signature = req.headers.get("stripe-signature")!

    // In the future, you'll verify the signature here:
    // let event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    // For now, let's assume the event object structure:
    const event = JSON.parse(body)

    const supabase = await createClient()

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object
                const userId = session.metadata.userId
                const userEmail = session.customer_details.email
                const userName = session.customer_details.name || "Traveler"

                // 1. Upgrade User in DB
                await supabase
                    .from('travel_profiles')
                    .update({ plan_tier: 'pro' })
                    .eq('user_id', userId)

                // 2. Trigger Welcome Email
                await sendSubscriptionEmail({
                    to: userEmail,
                    subject: "Welcome to Safar AI Pro! ✨",
                    userName: userName,
                    planName: "Pro Annual",
                    type: 'welcome_pro',
                    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
                })
                break
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object
                const userEmail = invoice.customer_email

                // Fetch user profile to get name
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', invoice.subscription ? (await (async () => {
                        try {
                            // In a real scenario, you'd fetch the subscription to get metadata
                            return ""
                        } catch { return "" }
                    })()) : "")
                    .single()

                // Trigger Payment Failure Email (with Grace Period notice)
                await sendSubscriptionEmail({
                    to: userEmail,
                    subject: "Action Required: Payment Failed for Safar AI Pro ⚠️",
                    userName: (profile as any)?.full_name || "Traveler",
                    planName: "Pro",
                    type: 'payment_failed',
                    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`
                })
                break
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object
                const userId = subscription.metadata.userId

                // Downgrade User to Free
                await supabase
                    .from('travel_profiles')
                    .update({ plan_tier: 'free' })
                    .eq('user_id', userId)
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (err: any) {
        console.error(`Stripe Webhook Error: ${err.message}`)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
    }
}
