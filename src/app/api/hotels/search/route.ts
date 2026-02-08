import { NextRequest, NextResponse } from 'next/server';
import { searchStays, fetchStayRates } from '@/lib/duffel';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const cityCode = searchParams.get('cityCode');
    const hotelIds = searchParams.get('hotelIds');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');
    const adults = parseInt(searchParams.get('adults') || '1');

    try {
        // If hotelIds are provided, fetch specific offers/rates for a property
        // Note: Duffel 'fetchStayRates' expects a search_result_id, not a hotelId directly usually check docs
        // But for our abstraction, we might interpret hotelIds as a search_result_id if passed from a previous search
        if (hotelIds) {
            // For now, if we have a specific ID, we assume it's a Duffel Search Result ID to get rates for
            const rates = await fetchStayRates(hotelIds);
            return NextResponse.json({ data: rates.rates || [] });
        }

        // Search for hotels in a city (Duffel Stays)
        if (!cityCode) {
            return NextResponse.json(
                { error: 'Missing cityCode or location parameter' },
                { status: 400 }
            );
        }

        // Duffel Stays requires dates. If not provided, we can't search real availability.
        // We'll default to 2 weeks from now if missing, or return empty.
        const effectiveCheckIn = checkInDate || new Date(Date.now() + 12096e5).toISOString().split('T')[0];
        const effectiveCheckOut = checkOutDate || new Date(Date.now() + 1296e6).toISOString().split('T')[0];

        const stays = await searchStays({
            location: cityCode, // Duffel location search (radius or coords)
            checkInDate: effectiveCheckIn,
            checkOutDate: effectiveCheckOut,
            adults
        });

        return NextResponse.json({ data: stays.results || [] });
    } catch (error) {
        console.error('Hotel Search Route Error:', error);
        return NextResponse.json(
            { error: 'Failed to search hotels via Duffel' },
            { status: 500 }
        );
    }
}
