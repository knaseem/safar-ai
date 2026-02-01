import { NextRequest, NextResponse } from 'next/server';
import { createFlightSearch } from '@/lib/duffel';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const originLocationCode = searchParams.get('origin');
    const destinationLocationCode = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    const returnDate = searchParams.get('returnDate');
    const adults = parseInt(searchParams.get('adults') || '1');
    const currency = searchParams.get('currency');

    console.log(`[Flight Search Debug]`, { originLocationCode, destinationLocationCode, departureDate, adults });

    if (!originLocationCode || !destinationLocationCode || !departureDate) {
        return NextResponse.json(
            { error: 'Missing required parameters: origin, destination, departureDate' },
            { status: 400 }
        );
    }

    try {
        console.log(`Searching flights via Duffel: ${originLocationCode}->${destinationLocationCode} on ${departureDate}`);

        // Use Duffel for search (now with valid token support)
        const duffelData = await createFlightSearch({
            origin: originLocationCode,
            destination: destinationLocationCode,
            departureDate,
            returnDate: returnDate || undefined,
            adults,
        });

        // Adapt Duffel Response to match existing Frontend (Amadeus-like) structure
        // Frontend expects: { price: { total }, itineraries: [{ segments: [{ carrierCode, number, duration }] }] }
        const adaptedFlights = duffelData.offers.map((offer: any) => {
            return {
                id: offer.id,
                // Map Price
                price: {
                    total: offer.total_amount,
                    currency: offer.total_currency,
                    base: offer.base_amount || offer.total_amount // Duffel might not expose base breakdown in simple offers
                },
                // Map Slices -> Itineraries
                itineraries: offer.slices.map((slice: any) => ({
                    duration: slice.duration,
                    segments: slice.segments.map((segment: any) => ({
                        departure: segment.departure, // { at: ... }
                        arrival: segment.arrival,     // { at: ... }
                        carrierCode: segment.operating_carrier?.iata_code || segment.marketing_carrier?.iata_code || 'XX',
                        number: segment.operating_carrier_flight_number || segment.marketing_carrier_flight_number,
                        aircraft: segment.aircraft,
                        duration: segment.duration
                    }))
                })),
                // Keep original Duffel object for checkout reference if needed
                source: 'duffel',
                validatingAirlineCodes: [offer.owner?.iata_code || 'XX'],
            };
        });

        return NextResponse.json({ data: adaptedFlights });
    } catch (error) {
        console.error('Flight Search Route Error:', error);
        return NextResponse.json(
            { error: 'Failed to search flights' },
            { status: 500 }
        );
    }
}
