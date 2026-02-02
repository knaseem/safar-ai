
/**
 * Local Location Database for Safar AI
 * Replaces external API calls for Autocomplete to ensure speed and reliability.
 * Used for both Flight inputs (IATA) and Hotel inputs (City/Geo).
 */

export interface LocationResult {
    iataCode: string;
    name: string;
    subType: 'CITY' | 'AIRPORT';
    address: {
        cityName: string;
        cityCode: string;
        countryName?: string;
    };
    geoCode: {
        latitude: number;
        longitude: number;
    };
}

const LOCATION_DATA: LocationResult[] = [
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
    // Add more major hubs as needed
];

/**
 * Perform a local fuzzy search for locations
 * @param keyword User input string
 * @param type Optional filter for 'CITY' or 'AIRPORT'
 * @returns Array of matching LocationResults
 */
export async function searchLocations(keyword: string, type?: 'CITY' | 'AIRPORT'): Promise<LocationResult[]> {
    const upperKeyword = keyword.toUpperCase().trim();
    if (!upperKeyword) return [];

    let data = LOCATION_DATA;

    // Filter by type if provided
    if (type) {
        data = data.filter(l => l.subType === type);
    }

    // Prioritize CITIES if the keyword matches a city name exactly (and we haven't filtered them out)
    const cityMatches = data.filter(l =>
        l.subType === 'CITY' && (l.address.cityName === upperKeyword || l.name.toUpperCase() === upperKeyword)
    );

    // Fuzzy match remainder
    const otherMatches = data.filter(l => {
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
