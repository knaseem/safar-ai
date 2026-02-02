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

        // SECURITY: Verify Price & Calculate Markup
        let verifiedMarkupParams = undefined;

        if (offer_id) {
            const { getOffer } = await import('@/lib/duffel')
            const { applyMarkup } = await import('@/lib/pricing')

            // FLIGHTS: Strict Server-Side Verification
            if (type === 'flight') {
                try {
                    // 1. Fetch real flight offer
                    const offer = await getOffer(offer_id)
                    if (offer) {
                        const baseAmount = parseFloat(offer.base_amount || offer.total_amount)
                        const serverCalculatedTotal = applyMarkup(baseAmount, 'flight')
                        const markupValue = (serverCalculatedTotal - baseAmount).toFixed(2)

                        verifiedMarkupParams = {
                            amount: parseFloat(markupValue),
                            currency: offer.total_currency || currency || 'USD'
                        };

                        console.log(`🔒 [Security] Verified Flight Price: Base=${baseAmount}, Markup=${markupValue}`)
                    }
                } catch (err) {
                    console.error("Failed to verify flight offer:", err)
                }
            }

            // HOTELS: Markup Calculation (Rate verification skipped for MVP as rates are transient)
            else if (type === 'stay') {
                // For hotels, 'amount' from client is the Total (Base + Markup). We reverse calculate.
                // Ideally we would fetch the rate again here, but Duffel Stays API makes lookup by ID complex.
                // We revert to trusting the passed amount for the *Session Request* but strictly defining the markup.

                const clientTotal = parseFloat(amount || '0');
                if (clientTotal > 0) {
                    const markupRate = MARKUP_HOTEL_PERCENT / 100;
                    const baseEst = clientTotal / (1 + markupRate);
                    const markupVal = (clientTotal - baseEst).toFixed(2);

                    verifiedMarkupParams = {
                        amount: parseFloat(markupVal),
                        currency: currency || 'USD'
                    };
                    console.log(`ℹ️ [Info] Applied Hotel Markup: ${markupVal} (${MARKUP_HOTEL_PERCENT}%)`)
                }
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
                source: "safar-ai",
                type: type // 'flight' or 'stay'
            },
            // CRITICAL: Only pass 'offerId' if it is a Flight Offer (starts with 'off_')
            // Duffel Links only supports locking specific offers for Flights, not generic Hotel Rate IDs
            offerId: (type === 'flight' && offer_id?.startsWith('off_')) ? offer_id : undefined,
            markup: verifiedMarkupParams || markupParams,
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
