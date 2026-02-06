import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createOrder } from "@/lib/duffel"
import { sendBookingConfirmation } from "@/lib/booking-emails"
import { MARKUP_FLIGHT_PERCENT, MARKUP_HOTEL_PERCENT } from "@/lib/pricing"

// POST - Create a new order (book)
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { offerId, passengers, totalAmount, currency, type, offerDetails } = body

        if (!offerId || !passengers || !totalAmount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Calculate markup amount using centralized constants
        const markupPercentage = type === "stay"
            ? MARKUP_HOTEL_PERCENT / 100
            : MARKUP_FLIGHT_PERCENT / 100
        const baseAmount = parseFloat(totalAmount) / (1 + markupPercentage)
        const markupAmount = parseFloat(totalAmount) - baseAmount

        // Create order via Duffel
        const order = await createOrder({
            offerId,
            passengers,
            paymentType: "balance",
            totalAmount,
            currency: currency || "USD",
            metadata: {
                user_id: user.id,
                source: "safar-ai",
            },
        })

        // Save order to database
        const { data: savedOrder, error: dbError } = await supabase
            .from("orders")
            .insert({
                user_id: user.id,
                duffel_order_id: order.id,
                type: type || "flight",
                status: "confirmed",
                total_amount: parseFloat(totalAmount),
                markup_amount: markupAmount,
                currency: currency || "USD",
                passengers: passengers,
                metadata: {
                    booking_reference: order.booking_reference,
                    created_at: order.created_at,
                    offer_details: offerDetails,
                },
            })
            .select()
            .single()

        if (dbError) {
            console.error("Database error saving order:", dbError)
            // Order was created in Duffel, but failed to save locally
            // Still return success with the Duffel order info
        }

        // Send confirmation email to first passenger (or user email)
        const primaryPassenger = passengers[0]
        if (primaryPassenger?.email) {
            await sendBookingConfirmation({
                to: primaryPassenger.email,
                passengerName: `${primaryPassenger.given_name} ${primaryPassenger.family_name}`,
                bookingReference: order.booking_reference,
                type: type || "flight",
                totalAmount: totalAmount,
                currency: currency || "USD",
                details: offerDetails,
            })
        }

        return NextResponse.json({
            id: savedOrder?.id || order.id,
            booking_reference: order.booking_reference,
            status: (order as any).status || "confirmed",
            total_amount: totalAmount,
            currency: currency || "USD",
        })
    } catch (error: any) {
        console.error("Create order error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to create order" },
            { status: 500 }
        )
    }
}

// GET - List user's orders
export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            )
        }

        const { data: orders, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) {
            throw error
        }

        return NextResponse.json(orders || [])
    } catch (error: any) {
        console.error("List orders error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to fetch orders" },
            { status: 500 }
        )
    }
}
