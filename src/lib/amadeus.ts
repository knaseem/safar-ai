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

        // Fallback for Demo: If no flights found in test mode, return a mock offer to allow UI verification
        if (data.length === 0 && process.env.AMADEUS_HOSTNAME === 'test') {
            const basePrice = 300 + Math.random() * 1000;
            const markedUpPrice = basePrice * 1.05; // 5% flight markup
            data = [{
                id: `mock-${params.destinationLocationCode.toLowerCase()}-1`,
                price: {
                    total: markedUpPrice.toFixed(2),
                    base_total: basePrice.toFixed(2),
                    currency: 'USD'
                },
                itineraries: [{
                    duration: 'PT12H',
                    segments: [{
                        departure: { iataCode: params.originLocationCode, at: params.departureDate + 'T10:00:00' },
                        arrival: { iataCode: params.destinationLocationCode, at: params.departureDate + 'T22:00:00' }
                    }]
                }]
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
        let data = response.data || [];

        // Fallback for Demo in Test Mode
        if (data.length === 0 && process.env.AMADEUS_HOSTNAME === 'test') {
            data = [
                { hotelId: 'MOCKHOTEL1', name: 'Luxury Palace', geoCode: { latitude: 0, longitude: 0 } },
                { hotelId: 'MOCKHOTEL2', name: 'Grand View Resort', geoCode: { latitude: 0, longitude: 0 } }
            ];
        }
        return data;
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
 * Comprehensive airport fallback data for test mode
 * This provides fuzzy search matching across 80+ global airports
 */
const AIRPORT_FALLBACKS = [
    // US & Canada - Major Hubs
    { iataCode: 'JFK', name: 'John F. Kennedy International', address: { cityName: 'NEW YORK', cityCode: 'NYC' } },
    { iataCode: 'LAX', name: 'Los Angeles International', address: { cityName: 'LOS ANGELES', cityCode: 'LAX' } },
    { iataCode: 'ORD', name: "O'Hare International", address: { cityName: 'CHICAGO', cityCode: 'CHI' } },
    { iataCode: 'DFW', name: 'Dallas/Fort Worth International', address: { cityName: 'DALLAS', cityCode: 'DFW' } },
    { iataCode: 'DEN', name: 'Denver International', address: { cityName: 'DENVER', cityCode: 'DEN' } },
    { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta', address: { cityName: 'ATLANTA', cityCode: 'ATL' } },
    { iataCode: 'SFO', name: 'San Francisco International', address: { cityName: 'SAN FRANCISCO', cityCode: 'SFO' } },
    { iataCode: 'SEA', name: 'Seattle-Tacoma International', address: { cityName: 'SEATTLE', cityCode: 'SEA' } },
    { iataCode: 'MIA', name: 'Miami International', address: { cityName: 'MIAMI', cityCode: 'MIA' } },
    { iataCode: 'BOS', name: 'Logan International', address: { cityName: 'BOSTON', cityCode: 'BOS' } },
    { iataCode: 'EWR', name: 'Newark Liberty International', address: { cityName: 'NEWARK', cityCode: 'NYC' } },
    { iataCode: 'LGA', name: 'LaGuardia', address: { cityName: 'NEW YORK', cityCode: 'NYC' } },
    { iataCode: 'MCO', name: 'Orlando International', address: { cityName: 'ORLANDO', cityCode: 'ORL' } },
    { iataCode: 'LAS', name: 'Harry Reid International', address: { cityName: 'LAS VEGAS', cityCode: 'LAS' } },
    { iataCode: 'CLT', name: 'Charlotte Douglas International', address: { cityName: 'CHARLOTTE', cityCode: 'CLT' } },
    { iataCode: 'PHX', name: 'Phoenix Sky Harbor', address: { cityName: 'PHOENIX', cityCode: 'PHX' } },
    { iataCode: 'IAH', name: 'George Bush Intercontinental', address: { cityName: 'HOUSTON', cityCode: 'HOU' } },
    { iataCode: 'YYZ', name: 'Pearson International', address: { cityName: 'TORONTO', cityCode: 'YTO' } },
    { iataCode: 'YVR', name: 'Vancouver International', address: { cityName: 'VANCOUVER', cityCode: 'YVR' } },
    { iataCode: 'YUL', name: 'Pierre Elliott Trudeau', address: { cityName: 'MONTREAL', cityCode: 'YMQ' } },
    { iataCode: 'AUS', name: 'Austin-Bergstrom International', address: { cityName: 'AUSTIN', cityCode: 'AUS' } },
    { iataCode: 'BNA', name: 'Nashville International', address: { cityName: 'NASHVILLE', cityCode: 'BNA' } },
    { iataCode: 'IAD', name: 'Dulles International', address: { cityName: 'WASHINGTON DC', cityCode: 'WAS' } },
    { iataCode: 'DCA', name: 'Reagan National', address: { cityName: 'WASHINGTON DC', cityCode: 'WAS' } },
    { iataCode: 'PHL', name: 'Philadelphia International', address: { cityName: 'PHILADELPHIA', cityCode: 'PHL' } },
    { iataCode: 'DTW', name: 'Detroit Metropolitan', address: { cityName: 'DETROIT', cityCode: 'DTT' } },
    { iataCode: 'MSP', name: 'Minneapolis-Saint Paul', address: { cityName: 'MINNEAPOLIS', cityCode: 'MSP' } },
    { iataCode: 'SLC', name: 'Salt Lake City International', address: { cityName: 'SALT LAKE CITY', cityCode: 'SLC' } },
    { iataCode: 'FLL', name: 'Fort Lauderdale-Hollywood', address: { cityName: 'FORT LAUDERDALE', cityCode: 'FLL' } },
    { iataCode: 'SAN', name: 'San Diego International', address: { cityName: 'SAN DIEGO', cityCode: 'SAN' } },
    { iataCode: 'TPA', name: 'Tampa International', address: { cityName: 'TAMPA', cityCode: 'TPA' } },
    { iataCode: 'HNL', name: 'Daniel K. Inouye International', address: { cityName: 'HONOLULU', cityCode: 'HNL' } },
    { iataCode: 'PDX', name: 'Portland International', address: { cityName: 'PORTLAND', cityCode: 'PDX' } },
    // Europe - Major Hubs
    { iataCode: 'LHR', name: 'London Heathrow', address: { cityName: 'LONDON', cityCode: 'LON' } },
    { iataCode: 'LGW', name: 'London Gatwick', address: { cityName: 'LONDON', cityCode: 'LON' } },
    { iataCode: 'STN', name: 'London Stansted', address: { cityName: 'LONDON', cityCode: 'LON' } },
    { iataCode: 'LCY', name: 'London City', address: { cityName: 'LONDON', cityCode: 'LON' } },
    { iataCode: 'CDG', name: 'Charles de Gaulle', address: { cityName: 'PARIS', cityCode: 'PAR' } },
    { iataCode: 'ORY', name: 'Paris Orly', address: { cityName: 'PARIS', cityCode: 'PAR' } },
    { iataCode: 'FRA', name: 'Frankfurt Airport', address: { cityName: 'FRANKFURT', cityCode: 'FRA' } },
    { iataCode: 'AMS', name: 'Schiphol', address: { cityName: 'AMSTERDAM', cityCode: 'AMS' } },
    { iataCode: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', address: { cityName: 'MADRID', cityCode: 'MAD' } },
    { iataCode: 'BCN', name: 'Josep Tarradellas Barcelona–El Prat', address: { cityName: 'BARCELONA', cityCode: 'BCN' } },
    { iataCode: 'IST', name: 'Istanbul Airport', address: { cityName: 'ISTANBUL', cityCode: 'IST' } },
    { iataCode: 'MUC', name: 'Munich Airport', address: { cityName: 'MUNICH', cityCode: 'MUC' } },
    { iataCode: 'FCO', name: 'Leonardo da Vinci–Fiumicino', address: { cityName: 'ROME', cityCode: 'ROM' } },
    { iataCode: 'ZRH', name: 'Zurich Airport', address: { cityName: 'ZURICH', cityCode: 'ZRH' } },
    { iataCode: 'VIE', name: 'Vienna International', address: { cityName: 'VIENNA', cityCode: 'VIE' } },
    { iataCode: 'CPH', name: 'Copenhagen Airport', address: { cityName: 'COPENHAGEN', cityCode: 'CPH' } },
    { iataCode: 'DUB', name: 'Dublin Airport', address: { cityName: 'DUBLIN', cityCode: 'DUB' } },
    { iataCode: 'OSL', name: 'Oslo Gardermoen', address: { cityName: 'OSLO', cityCode: 'OSL' } },
    { iataCode: 'ARN', name: 'Stockholm Arlanda', address: { cityName: 'STOCKHOLM', cityCode: 'STO' } },
    { iataCode: 'HEL', name: 'Helsinki-Vantaa', address: { cityName: 'HELSINKI', cityCode: 'HEL' } },
    { iataCode: 'ATH', name: 'Athens International', address: { cityName: 'ATHENS', cityCode: 'ATH' } },
    { iataCode: 'LIS', name: 'Humberto Delgado', address: { cityName: 'LISBON', cityCode: 'LIS' } },
    { iataCode: 'MXP', name: 'Malpensa', address: { cityName: 'MILAN', cityCode: 'MIL' } },
    { iataCode: 'GVA', name: 'Geneva Airport', address: { cityName: 'GENEVA', cityCode: 'GVA' } },
    { iataCode: 'WAW', name: 'Chopin Airport', address: { cityName: 'WARSAW', cityCode: 'WAW' } },
    { iataCode: 'BRU', name: 'Brussels Airport', address: { cityName: 'BRUSSELS', cityCode: 'BRU' } },
    { iataCode: 'MAN', name: 'Manchester Airport', address: { cityName: 'MANCHESTER', cityCode: 'MAN' } },
    { iataCode: 'EDI', name: 'Edinburgh Airport', address: { cityName: 'EDINBURGH', cityCode: 'EDI' } },
    { iataCode: 'NCE', name: 'Nice Côte d\'Azur', address: { cityName: 'NICE', cityCode: 'NCE' } },
    { iataCode: 'KEF', name: 'Keflavík International', address: { cityName: 'REYKJAVIK', cityCode: 'REK' } },
    // Middle East
    { iataCode: 'DXB', name: 'Dubai International', address: { cityName: 'DUBAI', cityCode: 'DXB' } },
    { iataCode: 'DOH', name: 'Hamad International', address: { cityName: 'DOHA', cityCode: 'DOH' } },
    { iataCode: 'AUH', name: 'Zayed International', address: { cityName: 'ABU DHABI', cityCode: 'AUH' } },
    { iataCode: 'JED', name: 'King Abdulaziz International', address: { cityName: 'JEDDAH', cityCode: 'JED' } },
    { iataCode: 'RUH', name: 'King Khalid International', address: { cityName: 'RIYADH', cityCode: 'RUH' } },
    { iataCode: 'MED', name: 'Prince Mohammad bin Abdulaziz', address: { cityName: 'MEDINA', cityCode: 'MED' } },
    { iataCode: 'CAI', name: 'Cairo International', address: { cityName: 'CAIRO', cityCode: 'CAI' } },
    { iataCode: 'AMM', name: 'Queen Alia International', address: { cityName: 'AMMAN', cityCode: 'AMM' } },
    { iataCode: 'MCT', name: 'Muscat International', address: { cityName: 'MUSCAT', cityCode: 'MCT' } },
    { iataCode: 'KWI', name: 'Kuwait International', address: { cityName: 'KUWAIT CITY', cityCode: 'KWI' } },
    { iataCode: 'BAH', name: 'Bahrain International', address: { cityName: 'BAHRAIN', cityCode: 'BAH' } },
    { iataCode: 'TLV', name: 'Ben Gurion', address: { cityName: 'TEL AVIV', cityCode: 'TLV' } },
    // Asia
    { iataCode: 'SIN', name: 'Changi', address: { cityName: 'SINGAPORE', cityCode: 'SIN' } },
    { iataCode: 'HND', name: 'Haneda', address: { cityName: 'TOKYO', cityCode: 'TYO' } },
    { iataCode: 'NRT', name: 'Narita International', address: { cityName: 'TOKYO', cityCode: 'TYO' } },
    { iataCode: 'ICN', name: 'Incheon International', address: { cityName: 'SEOUL', cityCode: 'SEL' } },
    { iataCode: 'HKG', name: 'Hong Kong International', address: { cityName: 'HONG KONG', cityCode: 'HKG' } },
    { iataCode: 'BKK', name: 'Suvarnabhumi', address: { cityName: 'BANGKOK', cityCode: 'BKK' } },
    { iataCode: 'PEK', name: 'Capital International', address: { cityName: 'BEIJING', cityCode: 'BJS' } },
    { iataCode: 'PVG', name: 'Pudong International', address: { cityName: 'SHANGHAI', cityCode: 'SHA' } },
    { iataCode: 'DEL', name: 'Indira Gandhi International', address: { cityName: 'NEW DELHI', cityCode: 'DEL' } },
    { iataCode: 'BOM', name: 'Chhatrapati Shivaji Maharaj', address: { cityName: 'MUMBAI', cityCode: 'BOM' } },
    { iataCode: 'KUL', name: 'Kuala Lumpur International', address: { cityName: 'KUALA LUMPUR', cityCode: 'KUL' } },
    { iataCode: 'SGN', name: 'Tan Son Nhat', address: { cityName: 'HO CHI MINH CITY', cityCode: 'SGN' } },
    { iataCode: 'MNL', name: 'Ninoy Aquino', address: { cityName: 'MANILA', cityCode: 'MNL' } },
    { iataCode: 'CGK', name: 'Soekarno-Hatta', address: { cityName: 'JAKARTA', cityCode: 'JKT' } },
    { iataCode: 'TPE', name: 'Taoyuan International', address: { cityName: 'TAIPEI', cityCode: 'TPE' } },
    { iataCode: 'DPS', name: 'Ngurah Rai International', address: { cityName: 'BALI', cityCode: 'DPS' } },
    { iataCode: 'KIX', name: 'Kansai International', address: { cityName: 'OSAKA', cityCode: 'OSA' } },
    // Oceania
    { iataCode: 'SYD', name: 'Kingsford Smith', address: { cityName: 'SYDNEY', cityCode: 'SYD' } },
    { iataCode: 'MEL', name: 'Tullamarine', address: { cityName: 'MELBOURNE', cityCode: 'MEL' } },
    { iataCode: 'BNE', name: 'Brisbane Airport', address: { cityName: 'BRISBANE', cityCode: 'BNE' } },
    { iataCode: 'AKL', name: 'Auckland Airport', address: { cityName: 'AUCKLAND', cityCode: 'AKL' } },
    // Latin America
    { iataCode: 'MEX', name: 'Benito Juárez International', address: { cityName: 'MEXICO CITY', cityCode: 'MEX' } },
    { iataCode: 'GRU', name: 'Guarulhos International', address: { cityName: 'SAO PAULO', cityCode: 'SAO' } },
    { iataCode: 'BOG', name: 'El Dorado International', address: { cityName: 'BOGOTA', cityCode: 'BOG' } },
    { iataCode: 'LIM', name: 'Jorge Chávez International', address: { cityName: 'LIMA', cityCode: 'LIM' } },
    { iataCode: 'SCL', name: 'Arturo Merino Benítez', address: { cityName: 'SANTIAGO', cityCode: 'SCL' } },
    { iataCode: 'EZE', name: 'Ministro Pistarini', address: { cityName: 'BUENOS AIRES', cityCode: 'BUE' } },
    { iataCode: 'PTY', name: 'Tocumen International', address: { cityName: 'PANAMA CITY', cityCode: 'PTY' } },
    // Africa
    { iataCode: 'JNB', name: 'O.R. Tambo International', address: { cityName: 'JOHANNESBURG', cityCode: 'JNB' } },
    { iataCode: 'CPT', name: 'Cape Town International', address: { cityName: 'CAPE TOWN', cityCode: 'CPT' } },
    { iataCode: 'CMN', name: 'Mohammed V International', address: { cityName: 'CASABLANCA', cityCode: 'CAS' } },
    { iataCode: 'LOS', name: 'Murtala Muhammed International', address: { cityName: 'LAGOS', cityCode: 'LOS' } },
    { iataCode: 'NBO', name: 'Jomo Kenyatta International', address: { cityName: 'NAIROBI', cityCode: 'NBO' } },
];

/**
 * Fuzzy search airports by keyword (matches code, city, or name)
 */
function searchAirportFallbacks(keyword: string): any[] {
    const upperKeyword = keyword.toUpperCase().trim();
    if (!upperKeyword) return [];

    // First, check for exact IATA code match
    const exactMatch = AIRPORT_FALLBACKS.filter(a => a.iataCode === upperKeyword);
    if (exactMatch.length > 0) {
        return exactMatch;
    }

    // Fuzzy match on city name, airport name, or partial IATA code
    const matches = AIRPORT_FALLBACKS.filter(airport => {
        const cityName = airport.address.cityName;
        const airportName = airport.name.toUpperCase();
        const iataCode = airport.iataCode;

        return cityName.includes(upperKeyword) ||
            airportName.includes(upperKeyword) ||
            iataCode.startsWith(upperKeyword);
    });

    // Sort: exact city matches first, then by city name
    matches.sort((a, b) => {
        const aExact = a.address.cityName === upperKeyword ? 0 : 1;
        const bExact = b.address.cityName === upperKeyword ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;
        return a.address.cityName.localeCompare(b.address.cityName);
    });

    return matches.slice(0, 10); // Limit to 10 results
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
