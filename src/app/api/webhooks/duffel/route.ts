import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        // 1. In a real app, verify the Duffel Signature Header
        // const signature = request.headers.get('Duffel-Signature')
        // verify(signature, body)

        const event = await request.json()
        console.log("Webhook Received:", event.type)

        // 2. Handle 'order.created' (Successful Booking)
        if (event.type === "order.created") {
            const order = event.data.object
            const metadata = order.metadata || {}

            // We need a userId to associate the booking
            const userId = metadata.user_id

            if (userId) {
                const supabase = await createClient()

                // Insert into our bookings table
                const { error } = await supabase
                    .from("orders")
                    .upsert({
                        user_id: userId,
                        duffel_order_id: order.id,
                        type: "flight", // Duffel webhooks might be generic, ideally check lines/services
                        status: "confirmed",
                        total_amount: parseFloat(order.total_amount),
                        currency: order.total_currency,
                        passengers: order.passengers,
                        metadata: {
                            booking_reference: order.booking_reference,
                            created_at: order.created_at,
                            source: "webhook"
                        }
                    }, { onConflict: 'duffel_order_id' })

                if (error) {
                    console.error("DB Error saving webhook order:", error)
                    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
                }

                console.log(`Order ${order.id} saved for user ${userId}`)
            } else {
                console.warn("Webhook received order without user_id metadata")
            }
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error("Webhook Error:", error)
        return NextResponse.json(
            { error: error.message || "Webhook processing failed" },
            { status: 400 }
        )
    }
}
