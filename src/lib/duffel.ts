import { Duffel } from '@duffel/api';
import { applyMarkup } from './pricing';

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
                    total_amount: '517.50', // Mock with 15% markup manual for demo
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

        // Apply Markups to real search results
        const dataWithMarkup = {
            ...response.data,
            offers: response.data.offers.map((offer: any) => ({
                ...offer,
                base_amount: offer.total_amount,
                total_amount: applyMarkup(offer.total_amount, 'flight').toFixed(2)
            }))
        };

        return dataWithMarkup;
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
    metadata?: Record<string, any>;
    markup?: {
        amount: number;
        currency: string;
    };
    searchParams?: {
        origin: string;
        destination: string;
        departureDate: string;
        adults: number;
    };
    offerId?: string; // Add offerId to interface
}) {
    const duffel = getDuffel();
    // Prioritize localhost in development to prevent redirecting to production (and losing session)
    const appUrl = (process.env.NODE_ENV === 'development')
        ? 'http://localhost:3000'
        : (process.env.NEXT_PUBLIC_APP_URL || 'https://www.safar-ai.co');

    if (!duffel) {
        // Mock link for sandbox/demo - Points to our local mock page
        return {
            url: `${appUrl}/trips/mock-checkout?reference=${params.reference}`,
            id: 'lnk_mock_' + Math.random().toString(36).substring(7)
        };
    }

    try {
        console.log('[Duffel Debug] Client Keys:', Object.keys(duffel));
        if ((duffel as any).links) {
            console.log('[Duffel Debug] Links Keys:', Object.keys((duffel as any).links));
        } else {
            console.log('[Duffel Debug] Links property is missing on Duffel client');
        }

        // Use the sessions endpoint as documented: https://duffel.com/docs/guides/duffel-links
        // Use raw request to bypass SDK typing issues/version mismatch
        const response = await (duffel as any).client.request({
            method: 'POST',
            path: '/links/sessions',
            data: {
                reference: params.reference,
                success_url: `${appUrl}/trips/success`,
                failure_url: `${appUrl}/trips/failure`,
                abandonment_url: `${appUrl}/`,
                logo_url: 'https://safar-ai.com/logo.png',
                primary_color: '#10b981',
                traveller_currency: params.travellerCurrency || 'USD',
                flights: {
                    enabled: params.enableFlights ?? true,
                    // If we have an offer ID, use it to lock the selection!
                    selected_offers: params.offerId ? [params.offerId] : undefined,
                    default_search_criteria: params.searchParams ? {
                        origin: params.searchParams.origin,
                        destination: params.searchParams.destination,
                        departure_date: params.searchParams.departureDate,
                        passengers: Array(params.searchParams.adults).fill({ type: 'adult' })
                    } : undefined
                },
                stays: {
                    enabled: params.enableStays ?? true
                },
                metadata: params.metadata,
                markup_amount: params.markup?.amount ? String(params.markup.amount) : undefined,
                markup_currency: params.markup?.currency || params.travellerCurrency || 'USD'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Duffel Link Session Error:', error);
        // Fallback to mock checkout if Links is not available (common with test tokens)
        console.log('[Duffel] Falling back to mock checkout - Links may not be enabled for this token');
        return {
            url: `${appUrl}/trips/mock-checkout?reference=${params.reference}&offer_id=${params.offerId || 'none'}`,
            id: 'lnk_fallback_' + Math.random().toString(36).substring(7)
        };
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
        // Duffel Stays Search
        // Note: Duffel Stays requires strict date format YYYY-MM-DD
        const checkIn = new Date(params.checkInDate).toISOString().split('T')[0];
        const checkOut = new Date(params.checkOutDate).toISOString().split('T')[0];

        // Handle location: if it looks like lat,long use coordinates, otherwise mock or radius
        let location: any = {
            radius: 5, // Default 5km radius
            geographic_coordinates: {
                latitude: 51.5072, // Default London
                longitude: 0.1276
            }
        };

        if (params.location.includes(',')) {
            const [lat, lng] = params.location.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                location = {
                    radius: 10,
                    geographic_coordinates: {
                        latitude: lat,
                        longitude: lng
                    }
                };
            }
        }

        const response = await (duffel as any).stays.search({
            location,
            check_in_date: checkIn,
            check_out_date: checkOut,
            rooms: 1,
            guests: Array(params.adults).fill({ type: 'adult' })
        });

        return response.data;
    } catch (error) {
        console.error('Duffel Stays Search Error:', error);
        throw error;
    }
}

/**
 * Fetch all available rates for a specific search result (Hotel)
 */
export async function fetchStayRates(searchResultId: string) {
    const duffel = getDuffel();
    if (!duffel) return [];

    try {
        const response = await (duffel as any).stays.searchResults.fetchAllRates(searchResultId);
        return response.data;
    } catch (error) {
        console.error('Duffel Fetch Rates Error:', error);
        throw error;
    }
}

/**
 * Create a Quote for a specific Rate (Lock Price)
 */
export async function createStayQuote(rateId: string) {
    const duffel = getDuffel();
    if (!duffel) return null;

    try {
        const response = await (duffel as any).stays.quotes.create(rateId);
        return response.data;
    } catch (error) {
        console.error('Duffel Create Quote Error:', error);
        throw error;
    }
}

/**
 * Create a Booking from a Quote
 */
export async function createStayBooking(params: {
    quoteId: string;
    passengers: Passenger[];
    email: string;
    phone_number: string;
}) {
    const duffel = getDuffel();
    if (!duffel) {
        return {
            id: 'bk_stay_mock_' + Math.random().toString(36).substring(7),
            reference: 'STAY-' + Math.random().toString(36).substring(7).toUpperCase(),
            status: 'confirmed'
        };
    }

    try {
        const response = await (duffel as any).stays.bookings.create({
            quote_id: params.quoteId,
            guests: params.passengers.map(p => ({
                given_name: p.given_name,
                family_name: p.family_name,
                born_on: p.born_on, // YYYY-MM-DD
            })),
            email: params.email,
            phone_number: params.phone_number,
        });
        return response.data;
    } catch (error) {
        console.error('Duffel Stay Booking Error:', error);
        throw error;
    }
}

// ============================================
// ORDER MANAGEMENT APIs (Custom Checkout)
// ============================================

export interface Passenger {
    type: 'adult' | 'child' | 'infant_without_seat';
    given_name: string;
    family_name: string;
    gender: 'male' | 'female';
    born_on: string; // YYYY-MM-DD
    email: string;
    phone_number?: string;
    title?: 'mr' | 'ms' | 'mrs' | 'miss' | 'dr';
}

export interface CreateOrderParams {
    offerId: string;
    passengers: Passenger[];
    paymentType: 'balance' | 'arc_bsp_cash';
    totalAmount: string; // Your marked-up price
    currency: string;
    metadata?: Record<string, string>;
}

/**
 * Create an order (Book a flight with payment)
 * This is where YOUR marked-up price gets charged
 */
export async function createOrder(params: CreateOrderParams) {
    const duffel = getDuffel();

    if (!duffel || params.offerId.startsWith('mock_')) {
        // Mock order for testing without API key or for mock offers
        return {
            id: 'ord_mock_' + Math.random().toString(36).substring(7),
            booking_reference: 'SFRMCK',
            status: 'confirmed',
            total_amount: params.totalAmount,
            total_currency: params.currency,
            passengers: params.passengers,
            created_at: new Date().toISOString(),
        };
    }

    try {
        const response = await duffel.orders.create({
            type: 'instant',
            selected_offers: [params.offerId],
            passengers: params.passengers.map((p, i) => ({
                ...p,
                id: `pas_${i}`, // Duffel requires passenger IDs
            })),
            payments: [{
                type: params.paymentType,
                amount: params.totalAmount,
                currency: params.currency,
            }],
            metadata: params.metadata,
        } as any);

        return response.data;
    } catch (error) {
        console.error('Duffel Create Order Error:', error);
        throw error;
    }
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string) {
    const duffel = getDuffel();

    if (!duffel || orderId.startsWith('ord_mock_')) {
        return {
            id: orderId,
            booking_reference: 'SFRMCK',
            status: 'confirmed',
            total_amount: '525.00',
            total_currency: 'USD',
            created_at: new Date().toISOString(),
            slices: [],
            passengers: [],
        };
    }

    try {
        const response = await duffel.orders.get(orderId);
        return response.data;
    } catch (error) {
        console.error('Duffel Get Order Error:', error);
        throw error;
    }
}

/**
 * Get cancellation quote for an order (check refund amount)
 */
export async function getOrderCancellationQuote(orderId: string) {
    const duffel = getDuffel();

    if (!duffel) {
        return {
            id: 'occ_mock_' + Math.random().toString(36).substring(7),
            order_id: orderId,
            refund_amount: '500.00',
            refund_currency: 'USD',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            confirmed_at: null,
        };
    }

    try {
        // Create a cancellation request to get the quote
        const response = await duffel.orderCancellations.create({
            order_id: orderId,
        });
        return response.data;
    } catch (error) {
        console.error('Duffel Cancellation Quote Error:', error);
        throw error;
    }
}

/**
 * Confirm order cancellation (actually cancel and refund)
 */
export async function confirmOrderCancellation(cancellationId: string) {
    const duffel = getDuffel();

    if (!duffel) {
        return {
            id: cancellationId,
            status: 'confirmed',
            refund_amount: '500.00',
            refund_currency: 'USD',
            confirmed_at: new Date().toISOString(),
        };
    }

    try {
        const response = await duffel.orderCancellations.confirm(cancellationId);
        return response.data;
    } catch (error) {
        console.error('Duffel Confirm Cancellation Error:', error);
        throw error;
    }
}

/**
 * Get an offer by ID (to display on checkout page)
 */
export async function getOffer(offerId: string) {
    const duffel = getDuffel();

    if (!duffel || offerId.startsWith('mock_')) {
        // Mock offer for testing
        return {
            id: offerId,
            total_amount: '525.00',
            total_currency: 'USD',
            base_amount: '500.00',
            owner: { name: 'Safar Airways' },
            slices: [{
                origin: { iata_code: 'JFK', name: 'John F. Kennedy International' },
                destination: { iata_code: 'DXB', name: 'Dubai International' },
                departure_date: '2026-03-15',
                duration: 'PT14H30M',
                segments: [{
                    operating_carrier: { name: 'Emirates' },
                    operating_carrier_flight_number: 'EK204',
                    departure: { at: '2026-03-15T22:00:00' },
                    arrival: { at: '2026-03-16T12:30:00' },
                }]
            }],
            passengers: [{ type: 'adult' }],
            conditions: {
                refund_before_departure: {
                    allowed: true,
                    penalty_amount: '150.00',
                    penalty_currency: 'USD',
                },
                change_before_departure: {
                    allowed: true,
                    penalty_amount: '75.00',
                    penalty_currency: 'USD',
                }
            },
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        };
    }

    try {
        const response = await duffel.offers.get(offerId);

        // Apply markup to the offer
        const { applyMarkup } = await import('./pricing');
        const offer = response.data;

        return {
            ...offer,
            base_amount: offer.total_amount,
            total_amount: applyMarkup(offer.total_amount, 'flight').toFixed(2),
        };
    } catch (error) {
        console.error('Duffel Get Offer Error:', error);
        throw error;
    }
}

// ============================================
// ORDER CHANGE APIs (Modifications)
// ============================================

/**
 * Initialize an Order Change Request
 * This searches for alternative flights for a specific slice of an existing order
 */
export async function createOrderChangeRequest(params: {
    orderId: string;
    sliceIds: string[]; // The slices (flights) you want to remove/change
    origin: string;
    destination: string;
    departureDate: string;
}) {
    const duffel = getDuffel();

    if (!duffel) {
        // Mock Response
        return {
            id: 'ocr_mock_' + Math.random().toString(36).substring(7),
            offers: [
                {
                    id: 'off_change_mock_1',
                    total_amount: '150.00', // Cost difference
                    total_currency: 'USD',
                    price: { amount: '150.00', currency: 'USD' }, // Consistency
                    penalty_amount: '50.00',
                    penalty_currency: 'USD',
                    slices: []
                }
            ]
        };
    }

    try {
        const response = await (duffel as any).orderChangeRequests.create({
            order_id: params.orderId,
            slices: {
                remove: params.sliceIds,
                add: [
                    {
                        origin: params.origin,
                        destination: params.destination,
                        departure_date: params.departureDate,
                        cabin_class: 'economy' // Defaulting for simplicity
                    }
                ]
            }
        });
        return response.data;
    } catch (error) {
        console.error('Duffel Create Change Request Error:', error);
        throw error;
    }
}

/**
 * Get an Order Change Offer details (Preview the new flight cost)
 */
export async function getOrderChangeOffer(offerId: string) {
    const duffel = getDuffel();

    if (!duffel) return null;

    try {
        const response = await (duffel as any).orderChangeOffers.get(offerId);
        return response.data;
    } catch (error) {
        console.error('Duffel Get Change Offer Error:', error);
        throw error;
    }
}

/**
 * Confirm and Pay for an Order Change
 */
export async function confirmOrderChange(changeOfferId: string, payment: {
    amount: string;
    currency: string;
}) {
    const duffel = getDuffel();

    if (!duffel) {
        return {
            id: 'och_mock_confirmed',
            status: 'confirmed'
        };
    }

    try {
        const response = await (duffel as any).orderChangeOffers.create({
            id: changeOfferId,
            payment: {
                amount: payment.amount,
                currency: payment.currency,
                type: 'balance' // We pay airline from balance
            }
        });
        return response.data;
    } catch (error) {
        console.error('Duffel Confirm Change Error:', error);
        throw error;
    }
}
