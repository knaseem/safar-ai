import { NextResponse } from "next/server"
import { createLinkSession } from "@/lib/duffel"
import { createClient } from "@/lib/supabase/server"
import { MARKUP_FLIGHT_PERCENT, MARKUP_HOTEL_PERCENT } from "@/lib/pricing"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { reference, type, offer_id, amount, currency, origin, destination, date, adults } = body

        // Debugging logs to trace why params might be missing
        console.log("----------------------------------------------------------------")
        console.log("🛒 [API] Checkout Session - Incoming Request")
        console.log("📦 Params:", { origin, destination, date, adults })
        console.log("----------------------------------------------------------------")

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

            let markupRate = 0;
            if (type === 'stay') {
                markupRate = MARKUP_HOTEL_PERCENT / 100;
            } else {
                markupRate = MARKUP_FLIGHT_PERCENT / 100;
            }

            const totalAmount = parseFloat(amount);
            const baseAmount = totalAmount / (1 + markupRate);
            const markupValue = (totalAmount - baseAmount).toFixed(2);

            markupParams = {
                amount: parseFloat(markupValue),
                currency: currency || 'USD'
            };
        }

        // Create Search Params object
        const searchCriteria = (origin && destination && date) ? {
            origin,
            destination,
            departureDate: date,
            adults: adults || 1
        } : undefined

        // SECURITY: Ignore client 'amount'. Fetch REAL price from provider + apply OUR markup
        let verifiedMarkupParams = undefined;
        let finalType = type;

        if (offer_id) {
            const { getOffer } = await import('@/lib/duffel')
            const { applyMarkup } = await import('@/lib/pricing')

            // 1. Fetch the real offer from provider (Duffel)
            // This ensures the price comes from the source of truth, not the URL
            try {
                const offer = await getOffer(offer_id)
                if (offer) {
                    // 2. Calculate Markup safely on server
                    // The 'getOffer' util already returns a marked up 'total_amount'
                    // but we need to extract the specific markup amount for the session params
                    const baseAmount = parseFloat(offer.base_amount || offer.total_amount)
                    const serverCalculatedTotal = applyMarkup(baseAmount, type === 'stay' ? 'hotel' : 'flight')

                    const markupValue = (serverCalculatedTotal - baseAmount).toFixed(2)

                    verifiedMarkupParams = {
                        amount: parseFloat(markupValue),
                        currency: offer.total_currency || currency || 'USD'
                    };

                    console.log(`🔒 [Security] Verified Price: Base=${baseAmount}, Markup=${markupValue}, Total=${serverCalculatedTotal}`)
                }
            } catch (err) {
                console.error("Failed to verify offer price:", err)
                // If verification fails, we might choose to blocking the transaction 
                // or proceed with caution. For high security, we should ideally block.
            }
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
            offerId: offer_id, // Pass specifically to lock the flight offer
            markup: verifiedMarkupParams, // Use the SECURE params
            searchParams: searchCriteria
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
