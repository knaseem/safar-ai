import { headers } from 'next/headers'

// Define types for Viator API responses
export interface ViatorProduct {
    productCode: string
    title: string
    description: string
    images: {
        variants: {
            url: string
            width: number
            height: number
        }[]
    }[]
    pricing: {
        summary: {
            fromPrice: number
            fromPriceBeforeDiscount?: number
            currency: string
        }
    }
    reviews: {
        combinedAverageRating: number
        totalReviews: number
    }
    duration: {
        fixedDurationInMinutes: number
    }
    bookingQuestions: string[]
    productUrl: string
    destinations: {
        ref: string
        primary: boolean
    }[]
    tags: string[]
}

export interface ViatorDestination {
    destinationId: number
    destinationName: string
    destinationType: string
    latitude: number
    longitude: number
    parentId?: number
    lookupId: string
}

const VIATOR_API_KEY = process.env.VIATOR_API_KEY
const VIATOR_API_URL = 'https://api.viator.com/partner'

/**
 * Helper to make authenticated requests to Viator API
 */
async function viatorRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!VIATOR_API_KEY) {
        throw new Error('VIATOR_API_KEY is not configured')
    }

    const response = await fetch(`${VIATOR_API_URL}${endpoint}`, {
        ...options,
        headers: {
            'exp-api-key': VIATOR_API_KEY,
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en-US',
            ...options.headers,
        },
    })

    if (!response.ok) {
        const errorBody = await response.text()
        console.error(`Viator API Error (${response.status}):`, errorBody)
        throw new Error(`Viator API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

/**
 * Resolve a destination name (e.g., "Paris") to a Viator Destination ID
 */
export async function resolveDestination(query: string): Promise<ViatorDestination | null> {
    // First, search for the destination
    const searchResponse = await viatorRequest<{ data: ViatorDestination[] }>('/v1/taxonomy/destinations', {
        method: 'GET',
    })

    // Basic client-side filtering since v1/taxonomy/destinations returns a large list
    // In a real prod app, you'd want to cache this or use a better search endpoint if available
    // For basic access, we might need to rely on exact matches or filtered lists

    // Note: For better performance with Basic Access, we should cache the common destinations
    // tailored to our use case (e.g., major cities).

    const normalizedQuery = query.toLowerCase()
    const match = searchResponse.data.find(d =>
        d.destinationName.toLowerCase() === normalizedQuery &&
        d.destinationType === 'CITY'
    )

    return match || null
}

/**
 * Search for products in a specific destination
 */
export async function searchProducts(
    destinationId: number,
    filters: {
        startDate?: string,
        endDate?: string,
        topX?: string
    } = {}
): Promise<ViatorProduct[]> {
    const body: any = {
        filtering: {
            destination: destinationId.toString(),
        },
        sorting: {
            sort: 'TOP_BOOKED', // Show popular items first
        },
        pagination: {
            start: 1,
            count: 20 // Limit to 20 filters
        },
        currency: 'USD'
    }

    if (filters.startDate && filters.endDate) {
        body.filtering.startDate = filters.startDate
        body.filtering.endDate = filters.endDate
    }

    const response = await viatorRequest<{ products: ViatorProduct[] }>('/products/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    })

    return response.products
}

/**
 * Get detailed information for a single product
 */
export async function getProductDetails(productCode: string): Promise<ViatorProduct> {
    const response = await viatorRequest<ViatorProduct>(`/products/${productCode}`, {
        method: 'GET',
    })
    return response
}
