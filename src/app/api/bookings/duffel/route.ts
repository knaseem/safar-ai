import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Duffel sends events via POST
export async function POST(request: Request) {
    console.log("🔔 [Webhook] Received Duffel Event");

    try {
        const body = await request.json();
        const eventType = body.type;
        const data = body.data;

        console.log(`🔔 [Webhook] Event Type: ${eventType}`, data?.id);

        const supabase = await createClient();

        // Handle Order Created (Booking Confirmed)
        if (eventType === "order.created") {
            const order = data;
            const metadata = order.metadata || {};

            // We only care if it's our booking
            if (metadata.source === "safar-ai") {
                console.log(`✅ [Webhook] Processing Order Created: ${order.id}`);

                // Upsert into 'orders' table
                const { error } = await supabase
                    .from("orders")
                    .upsert({
                        user_id: metadata.user_id,
                        duffel_order_id: order.id,
                        type: metadata.type || 'flight',
                        status: 'confirmed',
                        total_amount: order.total_amount,
                        currency: order.total_currency,
                        passengers: order.passengers, // Store full passenger list
                        metadata: {
                            ...metadata,
                            reference: order.booking_reference || order.reference,
                            source: 'webhook'
                        },
                        created_at: order.created_at
                    }, { onConflict: 'duffel_order_id' });

                if (error) {
                    console.error("❌ [Webhook] Supabase Insert Error:", error);
                    return NextResponse.json({ error: "Database error" }, { status: 500 });
                }
            }
        }

        // Handle Order Changed or Cancelled
        else if (eventType === "order.changed" || eventType === "order.cancelled") {
            const order = data;
            console.log(`⚠️ [Webhook] Processing Order Update: ${order.id} -> ${eventType}`);

            // We can't update 'details' (doesn't exist) or merge metadata easily.
            // Just update status for now.
            const status = eventType === "order.cancelled" ? 'cancelled' : 'changed';

            const { error } = await supabase
                .from("orders")
                .update({ status: status })
                .eq('duffel_order_id', order.id);

            if (error) {
                console.error("❌ [Webhook] Supabase Update Error:", error);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
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
