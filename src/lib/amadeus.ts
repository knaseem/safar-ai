import Amadeus from 'amadeus';

let amadeusInstance: Amadeus | null = null;

export function getAmadeus() {
    if (!amadeusInstance) {
        const clientId = process.env.AMADEUS_CLIENT_ID;
        const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
        const hostname = process.env.AMADEUS_HOSTNAME || 'test';

        if (!clientId || !clientSecret) {
            console.warn('Amadeus API keys missing. Intelligence features will be limited.');
            return null;
        }

        amadeusInstance = new Amadeus({
            clientId,
            clientSecret,
            hostname: hostname as 'test' | 'production'
        });
    }
    return amadeusInstance;
}

export default getAmadeus;

/**
 * Interface for Location Score data from Amadeus
 */
export interface AmadeusLocationScore {
    sightseeing: number;
    shopping: number;
    nightlife: number;
    restaurant: number;
}

/**
 * Fetch safety and vibe intelligence for a set of coordinates
 */
export async function fetchLocationIntelligence(lat: number, lng: number) {
    const amadeus = getAmadeus();
    if (!amadeus) return { scores: null, safety: null };

    try {
        // 1. Fetch Location Scores (Neighborhood Vibes)
        const locationResponse = await amadeus.location.analytics.categoryRatedAreas.get({
            latitude: lat,
            longitude: lng
        });

        // 2. Fetch Safety Scores (Safe Place)
        const safetyResponse = await amadeus.safety.safetyRatedLocations.get({
            latitude: lat,
            longitude: lng
        });

        return {
            scores: locationResponse.data?.[0]?.categoryScores || null,
            safety: safetyResponse.data?.[0]?.safetyScores || null
        };
    } catch (error) {
        console.error('Amadeus Intelligence Error:', error);
        return { scores: null, safety: null };
    }
}

/**
 * Fetch sentiment analysis for a hotel
 */
export async function fetchHotelSentiment(hotelIds: string[]) {
    const amadeus = getAmadeus();
    if (!amadeus) return [];

    try {
        const response = await (amadeus as any).ereputation.hotelSentiments.get({
            hotelIds: hotelIds.join(',')
        });
        return response.data || [];
    } catch (error) {
        console.error('Amadeus Sentiment Error:', error);
        return [];
    }
}

/**
 * Search for flights
 */
export async function searchFlights(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    max?: number;
}) {
    const amadeus = getAmadeus();
    if (!amadeus) return [];

    try {
        const response = await (amadeus as any).shopping.flightOffersSearch.get(params);
        let data = response.data || [];

        // Fallback for Demo: If no flights found for DXB in test mode, return a mock offer
        if (data.length === 0 && process.env.AMADEUS_HOSTNAME === 'test' && params.destinationLocationCode === 'DXB') {
            data = [{
                id: 'mock-dxb-1',
                price: { total: '1254.50', currency: 'USD' },
                itineraries: [{ duration: 'PT14H30M', segments: [{ departure: { iataCode: params.originLocationCode }, arrival: { iataCode: 'DXB' } }] }]
            }];
        }
        return data;
    } catch (error) {
        console.error('Amadeus Flight Search Error:', error);
        return [];
    }
}

/**
 * Search for hotels in a city
 */
export async function searchHotels(params: {
    cityCode: string;
    radius?: number;
    radiusUnit?: string;
    hotelSource?: string;
}) {
    const amadeus = getAmadeus();
    if (!amadeus) return [];

    try {
        const response = await (amadeus as any).referenceData.locations.hotels.byCity.get(params);
        return response.data || [];
    } catch (error) {
        console.error('Amadeus Hotel Search Error:', error);
        return [];
    }
}

/**
 * Get hotel offers for specific hotels
 */
export async function getHotelOffers(params: {
    hotelIds: string;
    adults: number;
    checkInDate: string;
    checkOutDate: string;
    roomQuantity?: number;
    priceRange?: string;
    currency?: string;
}) {
    const amadeus = getAmadeus();
    if (!amadeus) return [];

    try {
        const response = await (amadeus as any).shopping.hotelOffersSearch.get(params);
        return response.data || [];
    } catch (error) {
        console.error('Amadeus Hotel Offers Error:', error);
        return [];
    }
}
/**
 * Search for locations (cities/airports)
 */
export async function searchLocations(keyword: string) {
    const amadeus = getAmadeus();
    if (!amadeus) return [];

    // Test Data Fallbacks (Amadeus Test API has limited coverage)
    const upperKeyword = keyword.toUpperCase();
    const fallbacks: Record<string, any> = {
        'DUBAI': [{ iataCode: 'DXB', name: 'DUBAI', address: { cityName: 'DUBAI', cityCode: 'DXB' } }],
        'ABU DHABI': [{ iataCode: 'AUH', name: 'ABU DHABI', address: { cityName: 'ABU DHABI', cityCode: 'AUH' } }],
        'DXB': [{ iataCode: 'DXB', name: 'DUBAI', address: { cityName: 'DUBAI', cityCode: 'DXB' } }],
        'AUH': [{ iataCode: 'AUH', name: 'ABU DHABI', address: { cityName: 'ABU DHABI', cityCode: 'AUH' } }]
    };

    if (process.env.AMADEUS_HOSTNAME === 'test' && fallbacks[upperKeyword]) {
        return fallbacks[upperKeyword];
    }

    try {
        const response = await (amadeus as any).referenceData.locations.get({
            keyword: upperKeyword, // Force uppercase for better matching
            subType: ['CITY', 'AIRPORT']
        });
        return response.data || [];
    } catch (error) {
        console.error('Amadeus Location Search Error:', error);
        return [];
    }
}
