import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDuffel } from "@/lib/duffel";

// Duffel sends events via POST
// We need to parse the body and update our database
export async function POST(request: Request) {
    console.log("🔔 [Webhook] Received Duffel Event");

    try {
        const body = await request.json();
        const eventType = body.type;
        const data = body.data;

        console.log(`🔔 [Webhook] Event Type: ${eventType}`, data?.id);

        // Security check (Basic): In production, you should verify the webhook signature header 'x-duffel-signature'
        // For now, we trust the body structure for MVP.

        const supabase = await createClient();

        // Handle Order Created (Booking Confirmed)
        if (eventType === "order.created") {
            const order = data;
            const metadata = order.metadata || {};

            // We only care if it's our booking
            if (metadata.source === "safar-ai") {
                console.log(`✅ [Webhook] Processing Order Created: ${order.id}`);

                // Insert into bookings table
                // Note: We might have already inserted it on the success page,
                // so we use upsert (insert or update) to avoid duplicates.
                const { error } = await supabase
                    .from("bookings")
                    .upsert({
                        user_id: metadata.user_id,
                        duffel_order_id: order.id,
                        type: metadata.type || 'flight', // 'flight' or 'stay'
                        status: 'confirmed',
                        total_amount: order.total_amount,
                        currency: order.total_currency,
                        reference: order.booking_reference || order.reference,
                        details: order, // Store full JSON for future reference
                        created_at: order.created_at
                    }, { onConflict: 'duffel_order_id' });

                if (error) {
                    console.error("❌ [Webhook] Supabase Insert Error:", error);
                    return NextResponse.json({ error: "Database error" }, { status: 500 });
                }
            }
        }

        // Handle Order Changed (e.g. Flight Change or Cancellation)
        else if (eventType === "order.changed" || eventType === "order.cancelled") {
            const order = data;
            console.log(`⚠️ [Webhook] Processing Order Update: ${order.id} -> ${eventType}`);

            const { error } = await supabase
                .from("bookings")
                .update({
                    status: eventType === "order.cancelled" ? 'cancelled' : 'changed',
                    details: order // Update with new details
                })
                .eq('duffel_order_id', order.id);

            if (error) {
                console.error("❌ [Webhook] Supabase Update Error:", error);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("❌ [Webhook] Error processing request:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 400 }
        );
    }
}
