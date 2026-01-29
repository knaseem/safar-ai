import { Duffel } from '@duffel/api';

let duffelInstance: Duffel | null = null;

/**
 * Initialize and get the Duffel client
 */
export function getDuffel() {
    if (!duffelInstance) {
        const accessToken = process.env.DUFFEL_ACCESS_TOKEN;

        if (!accessToken) {
            console.warn('DUFFEL_ACCESS_TOKEN missing. Booking features will use mock data.');
            return null;
        }

        duffelInstance = new Duffel({
            token: accessToken,
        });
    }
    return duffelInstance;
}

/**
 * Create a flight offer request (Search)
 */
export async function createFlightSearch(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
}) {
    const duffel = getDuffel();
    if (!duffel) {
        // Return mock search results if no API key
        return {
            id: 'mock_search_' + Math.random().toString(36).substring(7),
            offers: [
                {
                    id: 'off_mock_1',
                    total_amount: '450.00',
                    total_currency: 'USD',
                    owner: { name: 'Safar Airways' },
                    itineraries: []
                }
            ]
        };
    }

    try {
        const response = await duffel.offerRequests.create({
            slices: [
                {
                    origin: params.origin,
                    destination: params.destination,
                    departure_date: params.departureDate,
                } as any, // Bypass strict slice types for POC
                ...(params.returnDate ? [{
                    origin: params.destination,
                    destination: params.origin,
                    departure_date: params.returnDate,
                } as any] : []),
            ],
            passengers: Array(params.adults).fill({ type: 'adult' }),
            cabin_class: 'economy',
        });
        return response.data;
    } catch (error) {
        console.error('Duffel Search Error:', error);
        throw error;
    }
}

/**
 * Create a secure Duffel Link Session (Hosted Search & Book)
 */
export async function createLinkSession(params: {
    reference: string;
    travellerCurrency?: string;
    enableFlights?: boolean;
    enableStays?: boolean;
}) {
    const duffel = getDuffel();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!duffel) {
        // Mock link for sandbox/demo - Points to our local mock page
        return {
            url: `${appUrl}/trips/mock-checkout?reference=${params.reference}`,
            id: 'lnk_mock_' + Math.random().toString(36).substring(7)
        };
    }

    try {
        // Use the sessions endpoint as documented: https://duffel.com/docs/guides/duffel-links
        const response = await (duffel as any).links.sessions.create({
            reference: params.reference,
            success_url: `${appUrl}/trips/success`,
            failure_url: `${appUrl}/trips/failure`,
            abandonment_url: `${appUrl}/`,
            logo_url: 'https://safar-ai.com/logo.png', // Replace with your actual branded logo
            primary_color: '#10b981', // Safar AI Emerald
            traveller_currency: params.travellerCurrency || 'USD',
            flights: {
                enabled: params.enableFlights ?? true
            },
            stays: {
                enabled: params.enableStays ?? true
            }
        });
        return response.data;
    } catch (error) {
        console.error('Duffel Link Session Error:', error);
        throw error;
    }
}

/**
 * Create a Hotel Search (Duffel Stays)
 */
export async function searchStays(params: {
    location: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
}) {
    const duffel = getDuffel();
    if (!duffel) return [];

    try {
        // Duffel Stays API is currently in specific access/beta for some regions
        // This is a placeholder for the implementation
        const response = await (duffel as any).stays.search({
            location: params.location,
            check_in_date: params.checkInDate,
            check_out_date: params.checkOutDate,
            adults: params.adults,
        });
        return response.data || [];
    } catch (error) {
        console.error('Duffel Stays Error:', error);
        return [];
    }
}
