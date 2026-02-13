import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac, timingSafeEqual } from "crypto";

// ============================================
// SIGNATURE VERIFICATION
// ============================================

/**
 * Verify the Duffel webhook signature to ensure authenticity.
 * Duffel signs webhooks using HMAC-SHA256.
 * Header format: "t=<timestamp>,v1=<signature>"
 */
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
    const secret = process.env.DUFFEL_WEBHOOK_SECRET;

    if (!secret) {
        console.warn("⚠️ [Webhook] DUFFEL_WEBHOOK_SECRET not set — skipping verification");
        return true; // Allow in dev, but warn
    }

    if (!signatureHeader) {
        console.error("❌ [Webhook] Missing Duffel-Signature header");
        return false;
    }

    try {
        // Parse "t=<timestamp>,v1=<signature>"
        const parts = signatureHeader.split(",");
        const timestampPart = parts.find(p => p.startsWith("t="));
        const signaturePart = parts.find(p => p.startsWith("v1="));

        if (!timestampPart || !signaturePart) {
            console.error("❌ [Webhook] Malformed signature header:", signatureHeader);
            return false;
        }

        const timestamp = timestampPart.slice(2);
        const receivedSignature = signaturePart.slice(3);

        // Recreate the signed payload: "timestamp.body"
        const signedPayload = `${timestamp}.${rawBody}`;
        const expectedSignature = createHmac("sha256", secret)
            .update(signedPayload)
            .digest("base64");

        // Timing-safe comparison to prevent timing attacks
        const receivedBuffer = Buffer.from(receivedSignature, "base64");
        const expectedBuffer = Buffer.from(expectedSignature, "base64");

        if (receivedBuffer.length !== expectedBuffer.length) {
            console.error("❌ [Webhook] Signature length mismatch");
            return false;
        }

        const isValid = timingSafeEqual(receivedBuffer, expectedBuffer);

        if (!isValid) {
            console.error("❌ [Webhook] Signature mismatch — potential tampering");
        }

        // Optional: Check timestamp freshness (reject events older than 5 minutes)
        const eventAge = Math.abs(Date.now() / 1000 - parseInt(timestamp));
        if (eventAge > 300) {
            console.warn(`⚠️ [Webhook] Event is ${Math.round(eventAge)}s old — possible replay attack`);
            // Don't reject, but log. Duffel retries can cause delays.
        }

        return isValid;
    } catch (err) {
        console.error("❌ [Webhook] Signature verification error:", err);
        return false;
    }
}

// ============================================
// WEBHOOK HANDLER
// ============================================

// Duffel sends events via POST
export async function POST(request: Request) {
    console.log("🔔 [Webhook] Received Duffel Event");

    // 1. Read raw body for signature verification
    const rawBody = await request.text();

    // 2. Verify Signature
    const signatureHeader = request.headers.get("duffel-signature");
    if (!verifySignature(rawBody, signatureHeader)) {
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        );
    }

    try {
        const body = JSON.parse(rawBody);
        const eventType = body.type;
        const data = body.data;
        const eventId = data?.id;

        console.log(`🔔 [Webhook] Event Type: ${eventType}`, eventId);

        // 3. Initialize Admin Client (Bypasses RLS)
        const supabase = createAdminClient();

        // 4. Idempotency Check — skip if we've already processed this event
        if (eventId) {
            const { data: existing } = await supabase
                .from("webhook_events")
                .select("id, processed")
                .eq("event_id", eventId)
                .eq("provider", "duffel")
                .maybeSingle();

            if (existing?.processed) {
                console.log(`⏭️ [Webhook] Event ${eventId} already processed — skipping`);
                return NextResponse.json({ received: true, skipped: true });
            }
        }

        // 5. Log Event to Database (Best Effort)
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

        // 6. Process Event by Type
        try {
            switch (eventType) {
                // ---- FLIGHT ORDER EVENTS ----
                case "order.created": {
                    const order = data;
                    const metadata = order.metadata || {};

                    if (metadata.source === "safar-ai") {
                        console.log(`✅ [Webhook] Processing Order Created: ${order.id}`);

                        const { error } = await supabase
                            .from("orders")
                            .upsert({
                                user_id: metadata.user_id,
                                duffel_order_id: order.id,
                                type: metadata.type || 'flight',
                                status: 'confirmed',
                                total_amount: order.total_amount,
                                currency: order.total_currency,
                                passengers: order.passengers,
                                metadata: {
                                    ...metadata,
                                    reference: order.booking_reference || order.reference,
                                    source: 'webhook'
                                },
                                created_at: order.created_at
                            }, { onConflict: 'duffel_order_id' });

                        if (error) throw error;
                    }
                    break;
                }

                case "order.creation_failed": {
                    const order = data;
                    console.error(`❌ [Webhook] Order Creation Failed: ${order.id}`);

                    // Update status if the order exists in our DB
                    await supabase
                        .from("orders")
                        .update({ status: 'failed' })
                        .eq('duffel_order_id', order.id);
                    break;
                }

                case "order.airline_initiated_change_detected": {
                    const order = data;
                    console.warn(`⚠️ [Webhook] Airline-Initiated Change for Order: ${order.id}`);

                    await supabase
                        .from("orders")
                        .update({
                            status: 'airline_changed',
                        })
                        .eq('duffel_order_id', order.id);
                    break;
                }

                case "order_cancellation.confirmed": {
                    const cancellation = data;
                    const orderId = cancellation.order_id;
                    console.log(`🚫 [Webhook] Order Cancellation Confirmed: ${orderId}`);

                    await supabase
                        .from("orders")
                        .update({
                            status: 'cancelled',
                            metadata: {
                                cancellation_id: cancellation.id,
                                refund_amount: cancellation.refund_amount,
                                refund_currency: cancellation.refund_currency,
                                cancelled_at: new Date().toISOString()
                            }
                        })
                        .eq('duffel_order_id', orderId);
                    break;
                }

                // ---- PAYMENT EVENTS ----
                case "air.payment.failed": {
                    console.error(`❌ [Webhook] Air Payment Failed:`, data.id);
                    // Log for monitoring — payment failures need manual review
                    break;
                }

                // ---- AIRLINE CREDIT EVENTS ----
                case "air.airline_credit.created":
                case "air.airline_credit.spent":
                case "air.airline_credit.invalidated": {
                    console.log(`💳 [Webhook] Airline Credit Event: ${eventType}`, data.id);
                    // Logged for tracking — no DB action needed currently
                    break;
                }

                // ---- STAYS EVENTS ----
                case "stays.booking.created": {
                    const booking = data;
                    console.log(`🏨 [Webhook] Stay Booking Created: ${booking.id}`);

                    // Upsert stay booking into booking_requests
                    await supabase
                        .from("booking_requests")
                        .upsert({
                            duffel_order_id: booking.id,
                            status: 'booked',
                            trip_type: 'stay',
                            details: booking
                        }, { onConflict: 'duffel_order_id' });
                    break;
                }

                case "stays.booking.cancelled": {
                    const booking = data;
                    console.log(`🏨 [Webhook] Stay Booking Cancelled: ${booking.id}`);

                    await supabase
                        .from("booking_requests")
                        .update({ status: 'cancelled' })
                        .eq('duffel_order_id', booking.id);
                    break;
                }

                case "stays.booking_creation_failed": {
                    const booking = data;
                    console.error(`❌ [Webhook] Stay Booking Creation Failed:`, booking.id);

                    await supabase
                        .from("booking_requests")
                        .update({ status: 'failed' })
                        .eq('duffel_order_id', booking.id);
                    break;
                }

                default:
                    console.log(`ℹ️ [Webhook] Unhandled event type: ${eventType}`);
            }
        } catch (err: any) {
            console.error("❌ [Webhook] Processing Error:", err);

            // Update log with error
            if (logId) {
                await supabase
                    .from("webhook_events")
                    .update({ error: err.message })
                    .eq("id", logId);
            }

            throw err; // Re-throw to return 500
        }

        // 7. Update Log with Success
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
