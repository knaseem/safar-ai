import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Duffel sends events via POST
export async function POST(request: Request) {
    console.log("🔔 [Webhook] Received Duffel Event");

    try {
        const body = await request.json();
        const eventType = body.type;
        const data = body.data;
        const eventId = data?.id;

        console.log(`🔔 [Webhook] Event Type: ${eventType}`, eventId);

        // 1. Initialize Admin Client (Bypasses RLS)
        const supabase = createAdminClient();

        // 2. Log Event to Database (Best Effort)
        let logId: string | undefined;
        try {
            const { data: logData, error: logError } = await supabase
                .from("webhook_events")
                .insert({
                    event_type: eventType,
                    event_id: eventId,
                    payload: body,
                    provider: 'duffel'
                })
                .select()
                .single();

            if (logError) {
                console.error("❌ [Webhook] Failed to log event to DB:", logError);
            } else {
                logId = logData.id;
            }
        } catch (err) {
            console.error("❌ [Webhook] Logging exception:", err);
        }

        // 3. Process Event
        let processingError: string | undefined;

        try {
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

                    if (error) throw error;
                }
            }

            // Handle Order Changed or Cancelled
            else if (eventType === "order.changed" || eventType === "order.cancelled") {
                const order = data;
                console.log(`⚠️ [Webhook] Processing Order Update: ${order.id} -> ${eventType}`);

                const status = eventType === "order.cancelled" ? 'cancelled' : 'changed';

                const { error } = await supabase
                    .from("orders")
                    .update({ status: status })
                    .eq('duffel_order_id', order.id);

                if (error) throw error;
            }

        } catch (err: any) {
            console.error("❌ [Webhook] Processing Error:", err);
            processingError = err.message;
            throw err; // Re-throw to return 500
        }

        // 4. Update Log with Success
        if (logId) {
            await supabase
                .from("webhook_events")
                .update({ processed: true })
                .eq("id", logId);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("❌ [Webhook] Error processing request:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
