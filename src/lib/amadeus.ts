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
 * Comprehensive airport fallback data for test mode
 * This provides fuzzy search matching across 80+ global airports
 */
/**
 * Comprehensive location data (Cities & Airports) for fallback/test mode
 * Includes Lat/Lng for Hotel Search
 */
const LOCATION_DATA = [
    // --- MAJOR CITIES (Better for Hotel Search) ---
    { iataCode: 'NYC', name: 'New York City', subType: 'CITY', address: { cityName: 'NEW YORK', cityCode: 'NYC', countryName: 'USA' }, geoCode: { latitude: 40.7128, longitude: -74.0060 } },
    { iataCode: 'LON', name: 'London', subType: 'CITY', address: { cityName: 'LONDON', cityCode: 'LON', countryName: 'UK' }, geoCode: { latitude: 51.5074, longitude: -0.1278 } },
    { iataCode: 'PAR', name: 'Paris', subType: 'CITY', address: { cityName: 'PARIS', cityCode: 'PAR', countryName: 'FRANCE' }, geoCode: { latitude: 48.8566, longitude: 2.3522 } },
    { iataCode: 'DXB', name: 'Dubai', subType: 'CITY', address: { cityName: 'DUBAI', cityCode: 'DXB', countryName: 'UAE' }, geoCode: { latitude: 25.2048, longitude: 55.2708 } },
    { iataCode: 'TYO', name: 'Tokyo', subType: 'CITY', address: { cityName: 'TOKYO', cityCode: 'TYO', countryName: 'JAPAN' }, geoCode: { latitude: 35.6762, longitude: 139.6503 } },
    { iataCode: 'IST', name: 'Istanbul', subType: 'CITY', address: { cityName: 'ISTANBUL', cityCode: 'IST', countryName: 'TURKEY' }, geoCode: { latitude: 41.0082, longitude: 28.9784 } },
    { iataCode: 'SIN', name: 'Singapore', subType: 'CITY', address: { cityName: 'SINGAPORE', cityCode: 'SIN', countryName: 'SINGAPORE' }, geoCode: { latitude: 1.3521, longitude: 103.8198 } },
    { iataCode: 'KUL', name: 'Kuala Lumpur', subType: 'CITY', address: { cityName: 'KUALA LUMPUR', cityCode: 'KUL', countryName: 'MALAYSIA' }, geoCode: { latitude: 3.1390, longitude: 101.6869 } },
    { iataCode: 'BKK', name: 'Bangkok', subType: 'CITY', address: { cityName: 'BANGKOK', cityCode: 'BKK', countryName: 'THAILAND' }, geoCode: { latitude: 13.7563, longitude: 100.5018 } },
    { iataCode: 'ROM', name: 'Rome', subType: 'CITY', address: { cityName: 'ROME', cityCode: 'ROM', countryName: 'ITALY' }, geoCode: { latitude: 41.9028, longitude: 12.4964 } },
    { iataCode: 'CHI', name: 'Chicago', subType: 'CITY', address: { cityName: 'CHICAGO', cityCode: 'CHI', countryName: 'USA' }, geoCode: { latitude: 41.8781, longitude: -87.6298 } },
    { iataCode: 'LAX', name: 'Los Angeles', subType: 'CITY', address: { cityName: 'LOS ANGELES', cityCode: 'LAX', countryName: 'USA' }, geoCode: { latitude: 34.0522, longitude: -118.2437 } },
    { iataCode: 'MIA', name: 'Miami', subType: 'CITY', address: { cityName: 'MIAMI', cityCode: 'MIA', countryName: 'USA' }, geoCode: { latitude: 25.7617, longitude: -80.1918 } },

    // --- AIRPORTS (Keep these for Flight Search) ---
    // US & Canada
    { iataCode: 'JFK', name: 'John F. Kennedy International', subType: 'AIRPORT', address: { cityName: 'NEW YORK', cityCode: 'NYC' }, geoCode: { latitude: 40.6413, longitude: -73.7781 } },
    { iataCode: 'LGA', name: 'LaGuardia', subType: 'AIRPORT', address: { cityName: 'NEW YORK', cityCode: 'NYC' }, geoCode: { latitude: 40.7769, longitude: -73.8740 } },
    { iataCode: 'EWR', name: 'Newark Liberty', subType: 'AIRPORT', address: { cityName: 'NEWARK', cityCode: 'NYC' }, geoCode: { latitude: 40.6895, longitude: -74.1745 } },
    { iataCode: 'LHR', name: 'London Heathrow', subType: 'AIRPORT', address: { cityName: 'LONDON', cityCode: 'LON' }, geoCode: { latitude: 51.4700, longitude: -0.4543 } },
    { iataCode: 'LGW', name: 'London Gatwick', subType: 'AIRPORT', address: { cityName: 'LONDON', cityCode: 'LON' }, geoCode: { latitude: 51.1537, longitude: -0.1821 } },
    { iataCode: 'CDG', name: 'Charles de Gaulle', subType: 'AIRPORT', address: { cityName: 'PARIS', cityCode: 'PAR' }, geoCode: { latitude: 49.0097, longitude: 2.5479 } },
    { iataCode: 'DXB', name: 'Dubai International', subType: 'AIRPORT', address: { cityName: 'DUBAI', cityCode: 'DXB' }, geoCode: { latitude: 25.2532, longitude: 55.3657 } },
    { iataCode: 'HND', name: 'Haneda', subType: 'AIRPORT', address: { cityName: 'TOKYO', cityCode: 'TYO' }, geoCode: { latitude: 35.5494, longitude: 139.7798 } },
    { iataCode: 'NRT', name: 'Narita', subType: 'AIRPORT', address: { cityName: 'TOKYO', cityCode: 'TYO' }, geoCode: { latitude: 35.7720, longitude: 140.3929 } },
];

/**
 * Fuzzy search locations by keyword (matches code, city, or name)
 */
function searchAirportFallbacks(keyword: string): any[] {
    const upperKeyword = keyword.toUpperCase().trim();
    if (!upperKeyword) return [];

    // Prioritize CITIES if the keyword matches a city name exactly
    const cityMatches = LOCATION_DATA.filter(l =>
        l.subType === 'CITY' && (l.address.cityName === upperKeyword || l.name.toUpperCase() === upperKeyword)
    );

    // Fuzzy match remainder
    const otherMatches = LOCATION_DATA.filter(l => {
        // Exclude what we already found
        if (cityMatches.includes(l)) return false;

        const cityName = l.address.cityName;
        const name = l.name.toUpperCase();
        const code = l.iataCode;

        return cityName.includes(upperKeyword) ||
            name.includes(upperKeyword) ||
            code.startsWith(upperKeyword);
    });

    // Combine: Cities first, then other matches
    return [...cityMatches, ...otherMatches].slice(0, 10);
}

/**
 * Search for locations (cities/airports)
 */
export async function searchLocations(keyword: string) {
    const amadeus = getAmadeus();
    if (!amadeus) return [];

    const upperKeyword = keyword.toUpperCase().trim();
    if (!upperKeyword) return [];

    // In test mode, always use expanded fallback data with fuzzy matching
    if (process.env.AMADEUS_HOSTNAME !== 'production') {
        const fallbackResults = searchAirportFallbacks(upperKeyword);
        if (fallbackResults.length > 0) {
            console.log('Using fuzzy fallback for keyword:', upperKeyword, '- Found:', fallbackResults.length, 'results');
            return fallbackResults;
        }
    }

    try {
        const response = await (amadeus as any).referenceData.locations.get({
            keyword: upperKeyword,
            subType: ['CITY', 'AIRPORT']
        });
        return response.data || [];
    } catch (error) {
        console.error('Amadeus Location Search Error:', error);
        // Fallback to local data if API fails
        const fallbackResults = searchAirportFallbacks(upperKeyword);
        if (fallbackResults.length > 0) {
            console.log('API failed, using fallback for:', upperKeyword);
            return fallbackResults;
        }
        return [];
    }
}
/**
 * Search for flight inspirations (cheapest destinations)
 */
export async function getFlightInspiration(params: {
    origin: string;
    maxPrice?: number;
}) {
    const amadeus = getAmadeus();
    if (!amadeus) return [];

    try {
        const response = await (amadeus as any).shopping.flightDestinations.get(params);
        return response.data || [];
    } catch (error) {
        console.error('Amadeus Inspiration Error:', error);
        return [];
    }
}
