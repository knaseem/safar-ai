import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createOrderChangeRequest, getOrderChangeOffer, confirmOrderChange } from "@/lib/duffel"

// POST: Search for alternatives (Create Request)
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        const body = await request.json()
        const { orderId, sliceIds, origin, destination, departureDate } = body

        if (!orderId || !sliceIds || !departureDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Verify the user owns this order
        const { data: order } = await supabase
            .from("orders")
            .select("duffel_order_id")
            .eq("duffel_order_id", orderId)
            .eq("user_id", user.id)
            .maybeSingle()

        if (!order) {
            // Also try matching by local id
            const { data: orderById } = await supabase
                .from("orders")
                .select("duffel_order_id")
                .eq("id", orderId)
                .eq("user_id", user.id)
                .maybeSingle()

            if (!orderById) {
                return NextResponse.json({ error: "Order not found or access denied" }, { status: 403 })
            }
        }

        const changeRequest = await createOrderChangeRequest({
            orderId,
            sliceIds,
            origin,
            destination,
            departureDate
        })

        return NextResponse.json(changeRequest)
    } catch (error: any) {
        console.error("Change Request Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to search for changes" },
            { status: 500 }
        )
    }
}

// GET: Get Quote (Preview Offer)
export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const offerId = searchParams.get('offer_id')

        if (!offerId) {
            return NextResponse.json({ error: "Missing offer_id" }, { status: 400 })
        }

        const offer = await getOrderChangeOffer(offerId)
        return NextResponse.json(offer)
    } catch (error: any) {
        console.error("Change Quote Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to get quote" },
            { status: 500 }
        )
    }
}

// PUT: Confirm Change (Pay & Execute)
export async function PUT(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        const body = await request.json()
        const { offerId, payment, orderId } = body

        if (!offerId || !payment) {
            return NextResponse.json({ error: "Missing offerId or payment details" }, { status: 400 })
        }

        const confirmed = await confirmOrderChange(offerId, payment)

        // Update the local order record if orderId is provided
        if (orderId) {
            await supabase
                .from("orders")
                .update({
                    total_amount: parseFloat(payment.amount),
                    metadata: {
                        change_confirmed_at: new Date().toISOString(),
                        change_offer_id: offerId,
                    }
                })
                .eq("duffel_order_id", orderId)
                .eq("user_id", user.id)
        }

        return NextResponse.json({ success: true, data: confirmed })
    } catch (error: any) {
        console.error("Confirm Change Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to confirm change" },
            { status: 500 }
        )
    }
}
