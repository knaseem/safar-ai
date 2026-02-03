import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendBookingConfirmation, sendCancellationConfirmation } from "@/lib/booking-emails"
import crypto from "crypto"

// Environment variable for webhook secret (set in Vercel after creating webhook in Duffel)
const WEBHOOK_SECRET = process.env.DUFFEL_WEBHOOK_SECRET

/**
 * Verify Duffel webhook signature using HMAC SHA-256
 * Based on Duffel's official Python example:
 * - Secret is base64 encoded, must be decoded to bytes first
 * - Format: t=<timestamp>,v1=<signature>
 * - Signature is computed over: timestamp.payload (as bytes)
 * - Result is hex-encoded lowercase
 */
function verifySignature(payload: string, signatureHeader: string | null): boolean {
    if (!WEBHOOK_SECRET) {
        console.warn("⚠️ DUFFEL_WEBHOOK_SECRET not set - skipping signature verification")
        return true // Allow in development, but warn
    }

    if (!signatureHeader) {
        console.error("❌ No signature header present")
        return false
    }

    console.log("📝 Signature header:", signatureHeader)

    // Parse: t=<timestamp>,v1=<signature>
    const parts = signatureHeader.split(",")
    const timestampPart = parts.find(p => p.startsWith("t="))
    const signaturePart = parts.find(p => p.startsWith("v1="))

    if (!timestampPart || !signaturePart) {
        console.error("❌ Invalid signature format - missing t= or v1=")
        console.log("Parts found:", parts)
        return false
    }

    const timestamp = timestampPart.replace("t=", "")
    const receivedSignature = signaturePart.replace("v1=", "").toLowerCase()

    console.log("📝 Timestamp:", timestamp)
    console.log("📝 Received signature (first 20):", receivedSignature.substring(0, 20))

    // Decode the base64 secret to raw bytes
    // The secret "iiRC1FatIvFdn1m2Vl3hLg==" is base64 encoded
    const secretBytes = Buffer.from(WEBHOOK_SECRET, "base64")

    // Build signed payload: timestamp.payload (as bytes)
    const signedPayload = `${timestamp}.${payload}`

    // Compute HMAC-SHA256 and hex encode (lowercase)
    const expectedSignature = crypto
        .createHmac("sha256", secretBytes)
        .update(signedPayload)
        .digest("hex")
        .toLowerCase()

    console.log("📝 Expected signature (first 20):", expectedSignature.substring(0, 20))

    // Compare signatures
    if (receivedSignature.length !== expectedSignature.length) {
        console.error("❌ Signature length mismatch:", receivedSignature.length, "vs", expectedSignature.length)
        return false
    }

    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(receivedSignature, "utf8"),
            Buffer.from(expectedSignature, "utf8")
        )

        if (isValid) {
            console.log("✅ Signature verified successfully!")
        } else {
            console.error("❌ Signature mismatch")
        }

        return isValid
    } catch (e) {
        console.error("❌ Signature comparison error:", e)
        return false
    }
}

/**
 * Duffel Webhook Handler
 * Handles: order.created, order.cancellation_confirmed, stays.booking_created, 
 *          stays.booking_cancelled, air.payment_failed
 */
export async function POST(request: Request) {
    try {
        // 1. Get raw body for signature verification
        const rawBody = await request.text()

        // 2. Get signature header (Duffel uses X-Duffel-Signature)
        const signature = request.headers.get("X-Duffel-Signature") || request.headers.get("Duffel-Signature")

        // 3. Verify signature
        if (!verifySignature(rawBody, signature)) {
            console.error("❌ Webhook signature verification failed")
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            )
        }

        console.log("✅ Webhook signature verified")

        // 3. Parse event
        const event = JSON.parse(rawBody)
        console.log(`📥 Webhook received: ${event.type}`)

        const supabase = await createClient()

        // 4. Handle different event types
        switch (event.type) {
            // =============================================
            // FLIGHT EVENTS
            // =============================================
            case "order.created": {
                const order = event.data.object
                const metadata = order.metadata || {}
                const userId = metadata.user_id

                console.log(`✈️ Flight order created: ${order.id}`)

                if (userId) {
                    // Save to database
                    const { error } = await supabase
                        .from("orders")
                        .upsert({
                            user_id: userId,
                            duffel_order_id: order.id,
                            type: "flight",
                            status: "confirmed",
                            total_amount: parseFloat(order.total_amount),
                            currency: order.total_currency,
                            passengers: order.passengers,
                            metadata: {
                                booking_reference: order.booking_reference,
                                created_at: order.created_at,
                                source: "webhook",
                                slices: order.slices
                            }
                        }, { onConflict: "duffel_order_id" })

                    if (error) {
                        console.error("DB Error:", error)
                    } else {
                        console.log(`✅ Order ${order.id} saved for user ${userId}`)
                    }

                    // Send confirmation email
                    const passenger = order.passengers?.[0]
                    if (passenger?.email) {
                        const slice = order.slices?.[0]
                        await sendBookingConfirmation({
                            to: passenger.email,
                            passengerName: `${passenger.given_name} ${passenger.family_name}`,
                            bookingReference: order.booking_reference,
                            type: "flight",
                            totalAmount: order.total_amount,
                            currency: order.total_currency,
                            details: {
                                origin: slice?.origin?.iata_code,
                                destination: slice?.destination?.iata_code,
                                departureDate: slice?.segments?.[0]?.departing_at,
                                airline: slice?.segments?.[0]?.operating_carrier?.name
                            }
                        })
                        console.log(`📧 Confirmation email sent to ${passenger.email}`)
                    }
                } else {
                    console.warn("⚠️ Order without user_id metadata")
                }
                break
            }

            case "order.cancellation_confirmed": {
                const cancellation = event.data.object
                const orderId = cancellation.order_id

                console.log(`❌ Flight cancellation confirmed: ${orderId}`)

                // Update order status in database
                const { error } = await supabase
                    .from("orders")
                    .update({
                        status: "cancelled",
                        metadata: {
                            cancelled_at: new Date().toISOString(),
                            refund_amount: cancellation.refund_amount,
                            refund_currency: cancellation.refund_currency
                        }
                    })
                    .eq("duffel_order_id", orderId)

                if (error) {
                    console.error("DB Error updating cancellation:", error)
                }

                // Get order details for email
                const { data: orderData } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("duffel_order_id", orderId)
                    .single()

                if (orderData?.passengers?.[0]?.email) {
                    await sendCancellationConfirmation({
                        to: orderData.passengers[0].email,
                        passengerName: `${orderData.passengers[0].given_name} ${orderData.passengers[0].family_name}`,
                        bookingReference: orderData.metadata?.booking_reference || orderId,
                        refundAmount: cancellation.refund_amount,
                        currency: cancellation.refund_currency
                    })
                    console.log(`📧 Cancellation email sent`)
                }
                break
            }

            // =============================================
            // STAYS EVENTS
            // =============================================
            case "stays.booking_created": {
                const booking = event.data.object
                const metadata = booking.metadata || {}
                const userId = metadata.user_id

                console.log(`🏨 Stay booking created: ${booking.id}`)

                if (userId) {
                    const { error } = await supabase
                        .from("orders")
                        .upsert({
                            user_id: userId,
                            duffel_order_id: booking.id,
                            type: "stay",
                            status: "confirmed",
                            total_amount: parseFloat(booking.total_amount),
                            currency: booking.total_currency,
                            passengers: booking.guests,
                            metadata: {
                                booking_reference: booking.reference,
                                created_at: booking.created_at,
                                source: "webhook",
                                accommodation: booking.accommodation,
                                check_in_date: booking.check_in_date,
                                check_out_date: booking.check_out_date
                            }
                        }, { onConflict: "duffel_order_id" })

                    if (error) {
                        console.error("DB Error:", error)
                    }

                    // Send confirmation email
                    if (booking.email) {
                        const guest = booking.guests?.[0]
                        await sendBookingConfirmation({
                            to: booking.email,
                            passengerName: guest ? `${guest.given_name} ${guest.family_name}` : "Guest",
                            bookingReference: booking.reference,
                            type: "stay",
                            totalAmount: booking.total_amount,
                            currency: booking.total_currency,
                            details: {
                                hotelName: booking.accommodation?.name,
                                checkIn: booking.check_in_date,
                                checkOut: booking.check_out_date
                            }
                        })
                        console.log(`📧 Stay confirmation email sent to ${booking.email}`)
                    }
                }
                break
            }

            case "stays.booking_cancelled": {
                const booking = event.data.object

                console.log(`❌ Stay booking cancelled: ${booking.id}`)

                const { error } = await supabase
                    .from("orders")
                    .update({
                        status: "cancelled",
                        metadata: {
                            cancelled_at: new Date().toISOString()
                        }
                    })
                    .eq("duffel_order_id", booking.id)

                if (error) {
                    console.error("DB Error:", error)
                }
                break
            }

            // =============================================
            // PAYMENT EVENTS
            // =============================================
            case "air.payment_failed": {
                const payment = event.data.object

                console.log(`💳 Payment failed: ${payment.id}`)

                // Log payment failure for monitoring
                // In production, you might want to notify support or the user
                console.error("Payment failure details:", {
                    payment_id: payment.id,
                    error: payment.failure_reason,
                    amount: payment.amount,
                    currency: payment.currency
                })
                break
            }

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error("Webhook processing error:", error)
        return NextResponse.json(
            { error: error.message || "Webhook processing failed" },
            { status: 400 }
        )
    }
}
