import { NextResponse } from "next/server"
import { createLinkSession } from "@/lib/duffel"
import { createClient } from "@/lib/supabase/server"
import { MARKUP_FLIGHT_PERCENT } from "@/lib/pricing"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { reference, type, offer_id, amount, currency, origin, destination, date, adults } = body

        if (!reference) {
            return NextResponse.json(
                { error: "Missing required field: reference" },
                { status: 400 }
            )
        }

        const { data: { user } } = await supabase.auth.getUser()

        // Calculate Markup if amount is provided
        let markupParams = undefined;
        if (amount) {
            // Re-calculate the markup portion. 
            // NOTE: The 'amount' passed from frontend is the TOTAL (Base + Markup).
            // We need to extract just the Markup amount to tell Duffel to add it on top of their base.

            // Formula: Total = Base * (1 + MarkupRate)
            // Base = Total / (1 + MarkupRate)
            // MarkupAmount = Total - Base

            const markupRate = MARKUP_FLIGHT_PERCENT / 100;
            const totalAmount = parseFloat(amount);
            const baseAmount = totalAmount / (1 + markupRate);
            const markupValue = (totalAmount - baseAmount).toFixed(2);

            markupParams = {
                amount: parseFloat(markupValue),
                currency: currency || 'USD'
            };
        }

        // Create a Duffel Link Session
        const session = await createLinkSession({
            reference,
            travellerCurrency: currency || 'USD',
            enableFlights: type === 'flight',
            enableStays: type === 'stay',
            metadata: {
                user_id: user?.id || 'guest',
                offer_id: offer_id,
                source: "safar-ai"
            },
            markup: markupParams,
            searchParams: (origin && destination && date) ? {
                origin,
                destination,
                departureDate: date,
                adults: adults || 1
            } : undefined
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error("Link session error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        )
    }
}
