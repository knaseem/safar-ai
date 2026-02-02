
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
    { iataCode: 'DOH', name: 'Doha', subType: 'CITY', address: { cityName: 'DOHA', cityCode: 'DOH', countryName: 'QATAR' }, geoCode: { latitude: 25.2854, longitude: 51.5310 } },
    { iataCode: 'KHI', name: 'Karachi', subType: 'CITY', address: { cityName: 'KARACHI', cityCode: 'KHI', countryName: 'PAKISTAN' }, geoCode: { latitude: 24.8607, longitude: 67.0011 } },
    { iataCode: 'JED', name: 'Jeddah', subType: 'CITY', address: { cityName: 'JEDDAH', cityCode: 'JED', countryName: 'SAUDI ARABIA' }, geoCode: { latitude: 21.5433, longitude: 39.1728 } },
    { iataCode: 'RUH', name: 'Riyadh', subType: 'CITY', address: { cityName: 'RIYADH', cityCode: 'RUH', countryName: 'SAUDI ARABIA' }, geoCode: { latitude: 24.7136, longitude: 46.6753 } },
    { iataCode: 'CAI', name: 'Cairo', subType: 'CITY', address: { cityName: 'CAIRO', cityCode: 'CAI', countryName: 'EGYPT' }, geoCode: { latitude: 30.0444, longitude: 31.2357 } },
    { iataCode: 'BOM', name: 'Mumbai', subType: 'CITY', address: { cityName: 'MUMBAI', cityCode: 'BOM', countryName: 'INDIA' }, geoCode: { latitude: 19.0760, longitude: 72.8777 } },
    { iataCode: 'DEL', name: 'New Delhi', subType: 'CITY', address: { cityName: 'NEW DELHI', cityCode: 'DEL', countryName: 'INDIA' }, geoCode: { latitude: 28.6139, longitude: 77.2090 } },
    { iataCode: 'LHE', name: 'Lahore', subType: 'CITY', address: { cityName: 'LAHORE', cityCode: 'LHE', countryName: 'PAKISTAN' }, geoCode: { latitude: 31.5204, longitude: 74.3587 } },
    { iataCode: 'ISB', name: 'Islamabad', subType: 'CITY', address: { cityName: 'ISLAMABAD', cityCode: 'ISB', countryName: 'PAKISTAN' }, geoCode: { latitude: 33.6844, longitude: 73.0479 } },
    { iataCode: 'HKG', name: 'Hong Kong', subType: 'CITY', address: { cityName: 'HONG KONG', cityCode: 'HKG', countryName: 'HONG KONG' }, geoCode: { latitude: 22.3193, longitude: 114.1694 } },
    { iataCode: 'SYD', name: 'Sydney', subType: 'CITY', address: { cityName: 'SYDNEY', cityCode: 'SYD', countryName: 'AUSTRALIA' }, geoCode: { latitude: -33.8688, longitude: 151.2093 } },
    { iataCode: 'MEL', name: 'Melbourne', subType: 'CITY', address: { cityName: 'MELBOURNE', cityCode: 'MEL', countryName: 'AUSTRALIA' }, geoCode: { latitude: -37.8136, longitude: 144.9631 } },
    { iataCode: 'YTO', name: 'Toronto', subType: 'CITY', address: { cityName: 'TORONTO', cityCode: 'YTO', countryName: 'CANADA' }, geoCode: { latitude: 43.6532, longitude: -79.3832 } },
    { iataCode: 'AMS', name: 'Amsterdam', subType: 'CITY', address: { cityName: 'AMSTERDAM', cityCode: 'AMS', countryName: 'NETHERLANDS' }, geoCode: { latitude: 52.3676, longitude: 4.9041 } },
    { iataCode: 'FRA', name: 'Frankfurt', subType: 'CITY', address: { cityName: 'FRANKFURT', cityCode: 'FRA', countryName: 'GERMANY' }, geoCode: { latitude: 50.1109, longitude: 8.6821 } },
    { iataCode: 'MAD', name: 'Madrid', subType: 'CITY', address: { cityName: 'MADRID', cityCode: 'MAD', countryName: 'SPAIN' }, geoCode: { latitude: 40.4168, longitude: -3.7038 } },
    { iataCode: 'BCN', name: 'Barcelona', subType: 'CITY', address: { cityName: 'BARCELONA', cityCode: 'BCN', countryName: 'SPAIN' }, geoCode: { latitude: 41.3851, longitude: 2.1734 } },

    // --- AIRPORTS (Keep these for Flight Search) ---
    // US & Canada
    { iataCode: 'JFK', name: 'John F. Kennedy International', subType: 'AIRPORT', address: { cityName: 'NEW YORK', cityCode: 'NYC' }, geoCode: { latitude: 40.6413, longitude: -73.7781 } },
    { iataCode: 'LGA', name: 'LaGuardia', subType: 'AIRPORT', address: { cityName: 'NEW YORK', cityCode: 'NYC' }, geoCode: { latitude: 40.7769, longitude: -73.8740 } },
    { iataCode: 'EWR', name: 'Newark Liberty', subType: 'AIRPORT', address: { cityName: 'NEWARK', cityCode: 'NYC' }, geoCode: { latitude: 40.6895, longitude: -74.1745 } },
    { iataCode: 'LAX', name: 'Los Angeles International', subType: 'AIRPORT', address: { cityName: 'LOS ANGELES', cityCode: 'LAX' }, geoCode: { latitude: 33.9416, longitude: -118.4085 } },
    { iataCode: 'SFO', name: 'San Francisco International', subType: 'AIRPORT', address: { cityName: 'SAN FRANCISCO', cityCode: 'SFO' }, geoCode: { latitude: 37.6213, longitude: -122.3790 } },
    { iataCode: 'ORD', name: 'O\'Hare International', subType: 'AIRPORT', address: { cityName: 'CHICAGO', cityCode: 'CHI' }, geoCode: { latitude: 41.9742, longitude: -87.9073 } },
    { iataCode: 'MIA', name: 'Miami International', subType: 'AIRPORT', address: { cityName: 'MIAMI', cityCode: 'MIA' }, geoCode: { latitude: 25.7959, longitude: -80.2870 } },
    { iataCode: 'YYZ', name: 'Toronto Pearson', subType: 'AIRPORT', address: { cityName: 'TORONTO', cityCode: 'YTO' }, geoCode: { latitude: 43.6777, longitude: -79.6248 } },
    { iataCode: 'YVR', name: 'Vancouver International', subType: 'AIRPORT', address: { cityName: 'VANCOUVER', cityCode: 'YVR' }, geoCode: { latitude: 49.1947, longitude: -123.1762 } },

    // Europe
    { iataCode: 'LHR', name: 'London Heathrow', subType: 'AIRPORT', address: { cityName: 'LONDON', cityCode: 'LON' }, geoCode: { latitude: 51.4700, longitude: -0.4543 } },
    { iataCode: 'LGW', name: 'London Gatwick', subType: 'AIRPORT', address: { cityName: 'LONDON', cityCode: 'LON' }, geoCode: { latitude: 51.1537, longitude: -0.1821 } },
    { iataCode: 'CDG', name: 'Charles de Gaulle', subType: 'AIRPORT', address: { cityName: 'PARIS', cityCode: 'PAR' }, geoCode: { latitude: 49.0097, longitude: 2.5479 } },
    { iataCode: 'AMS', name: 'Amsterdam Schiphol', subType: 'AIRPORT', address: { cityName: 'AMSTERDAM', cityCode: 'AMS' }, geoCode: { latitude: 52.3105, longitude: 4.7683 } },
    { iataCode: 'FRA', name: 'Frankfurt Airport', subType: 'AIRPORT', address: { cityName: 'FRANKFURT', cityCode: 'FRA' }, geoCode: { latitude: 50.0379, longitude: 8.5622 } },
    { iataCode: 'IST', name: 'Istanbul Airport', subType: 'AIRPORT', address: { cityName: 'ISTANBUL', cityCode: 'IST' }, geoCode: { latitude: 41.2612, longitude: 28.7424 } },
    { iataCode: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', subType: 'AIRPORT', address: { cityName: 'MADRID', cityCode: 'MAD' }, geoCode: { latitude: 40.4839, longitude: -3.5680 } },
    { iataCode: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', subType: 'AIRPORT', address: { cityName: 'BARCELONA', cityCode: 'BCN' }, geoCode: { latitude: 41.2974, longitude: 2.0833 } },
    { iataCode: 'FCO', name: 'Rome Fiumicino', subType: 'AIRPORT', address: { cityName: 'ROME', cityCode: 'ROM' }, geoCode: { latitude: 41.8003, longitude: 12.2462 } },
    { iataCode: 'ZRH', name: 'Zurich Airport', subType: 'AIRPORT', address: { cityName: 'ZURICH', cityCode: 'ZRH' }, geoCode: { latitude: 47.4581, longitude: 8.5555 } },

    // Middle East
    { iataCode: 'DXB', name: 'Dubai International', subType: 'AIRPORT', address: { cityName: 'DUBAI', cityCode: 'DXB' }, geoCode: { latitude: 25.2532, longitude: 55.3657 } },
    { iataCode: 'DOH', name: 'Hamad International', subType: 'AIRPORT', address: { cityName: 'DOHA', cityCode: 'DOH' }, geoCode: { latitude: 25.2731, longitude: 51.6081 } },
    { iataCode: 'JED', name: 'King Abdulaziz International', subType: 'AIRPORT', address: { cityName: 'JEDDAH', cityCode: 'JED' }, geoCode: { latitude: 21.6800, longitude: 39.1722 } },
    { iataCode: 'RUH', name: 'King Khalid International', subType: 'AIRPORT', address: { cityName: 'RIYADH', cityCode: 'RUH' }, geoCode: { latitude: 24.9575, longitude: 46.6988 } },
    { iataCode: 'AUH', name: 'Zayed International', subType: 'AIRPORT', address: { cityName: 'ABU DHABI', cityCode: 'AUH' }, geoCode: { latitude: 24.4330, longitude: 54.6511 } },

    // Asia
    { iataCode: 'HND', name: 'Haneda', subType: 'AIRPORT', address: { cityName: 'TOKYO', cityCode: 'TYO' }, geoCode: { latitude: 35.5494, longitude: 139.7798 } },
    { iataCode: 'NRT', name: 'Narita', subType: 'AIRPORT', address: { cityName: 'TOKYO', cityCode: 'TYO' }, geoCode: { latitude: 35.7720, longitude: 140.3929 } },
    { iataCode: 'SIN', name: 'Singapore Changi', subType: 'AIRPORT', address: { cityName: 'SINGAPORE', cityCode: 'SIN' }, geoCode: { latitude: 1.3644, longitude: 103.9915 } },
    { iataCode: 'BKK', name: 'Suvarnabhumi', subType: 'AIRPORT', address: { cityName: 'BANGKOK', cityCode: 'BKK' }, geoCode: { latitude: 13.6900, longitude: 100.7501 } },
    { iataCode: 'HKG', name: 'Hong Kong International', subType: 'AIRPORT', address: { cityName: 'HONG KONG', cityCode: 'HKG' }, geoCode: { latitude: 22.3080, longitude: 113.9185 } },
    { iataCode: 'ICN', name: 'Incheon International', subType: 'AIRPORT', address: { cityName: 'SEOUL', cityCode: 'SEL' }, geoCode: { latitude: 37.4602, longitude: 126.4407 } },
    { iataCode: 'KUL', name: 'Kuala Lumpur International', subType: 'AIRPORT', address: { cityName: 'KUALA LUMPUR', cityCode: 'KUL' }, geoCode: { latitude: 2.7456, longitude: 101.7072 } },
    { iataCode: 'DEL', name: 'Indira Gandhi International', subType: 'AIRPORT', address: { cityName: 'NEW DELHI', cityCode: 'DEL' }, geoCode: { latitude: 28.5562, longitude: 77.1000 } },
    { iataCode: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', subType: 'AIRPORT', address: { cityName: 'MUMBAI', cityCode: 'BOM' }, geoCode: { latitude: 19.0896, longitude: 72.8656 } },
    { iataCode: 'KHI', name: 'Jinnah International', subType: 'AIRPORT', address: { cityName: 'KARACHI', cityCode: 'KHI' }, geoCode: { latitude: 24.9065, longitude: 67.1608 } },
    { iataCode: 'LHE', name: 'Allama Iqbal International', subType: 'AIRPORT', address: { cityName: 'LAHORE', cityCode: 'LHE' }, geoCode: { latitude: 31.5216, longitude: 74.4036 } },
    { iataCode: 'ISB', name: 'Islamabad International', subType: 'AIRPORT', address: { cityName: 'ISLAMABAD', cityCode: 'ISB' }, geoCode: { latitude: 33.5492, longitude: 72.8258 } },

    // Oceania
    { iataCode: 'SYD', name: 'Sydney Kingsford Smith', subType: 'AIRPORT', address: { cityName: 'SYDNEY', cityCode: 'SYD' }, geoCode: { latitude: -33.9399, longitude: 151.1753 } },
    { iataCode: 'MEL', name: 'Melbourne Airport', subType: 'AIRPORT', address: { cityName: 'MELBOURNE', cityCode: 'MEL' }, geoCode: { latitude: -37.6690, longitude: 144.8410 } },
    { iataCode: 'AKL', name: 'Auckland Airport', subType: 'AIRPORT', address: { cityName: 'AUCKLAND', cityCode: 'AKL' }, geoCode: { latitude: -37.0082, longitude: 174.7850 } },
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
