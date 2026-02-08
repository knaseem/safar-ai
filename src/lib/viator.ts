
export interface ViatorActivity {
    productCode: string
    title: string
    description: string
    price: {
        amount: number
        currency: string
        formatted: string
    }
    rating: {
        average: number
        count: number
    }
    images: {
        url: string
        caption?: string
    }[]
    duration: string
    bookingLink: string // Deep link with PID
    features: string[] // e.g. "Free Cancellation", "Skip the Line"
}

// Complex interface matching the existing components (Activities Section & Modal)
export interface ViatorProduct {
    productCode: string
    title: string
    description: string
    productUrl: string
    pricing: {
        summary: {
            fromPrice: number
            currencyCode: string
        }
    }
    reviews: {
        combinedAverageRating: number
        totalReviews: number
    }
    images: {
        variants: {
            url: string
            width: number
            height: number
        }[]
    }[]
    duration: {
        fixedDurationInMinutes: number
    }
    bookingQuestions: any[]
}

// Simple mock data for Itinerary Card (your new features)
export const MOCK_VIATOR_ACTIVITIES: ViatorActivity[] = [
    {
        productCode: "5678XE",
        title: "Exclusive Private Food Tour in Paris with local expert",
        description: "Taste your way through the streets of Paris on this private food tour. Sample the best croissants, cheeses, and wines the city has to offer.",
        price: {
            amount: 145.00,
            currency: "USD",
            formatted: "$145.00"
        },
        rating: {
            average: 4.9,
            count: 1245
        },
        images: [
            { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800" }
        ],
        duration: "3 hours",
        bookingLink: "https://www.viator.com/tours/Paris/Private-Food-Tour/d479-5678XE?pid=YOUR_PID_HERE",
        features: ["Free Cancellation", "Private Tour", "Food & Drinks Included"]
    },
    {
        productCode: "9012YZ",
        title: "Skip-the-Line Louvre Museum Guided Tour",
        description: "Bypass the long queues and head straight to the masterpieces on this guided tour of the Louvre. See the Mona Lisa, Venus de Milo, and more.",
        price: {
            amount: 89.00,
            currency: "USD",
            formatted: "$89.00"
        },
        rating: {
            average: 4.7,
            count: 3890
        },
        images: [
            { url: "https://images.unsplash.com/photo-1499856871940-a09627c6ac02?auto=format&fit=crop&q=80&w=800" }
        ],
        duration: "2.5 hours",
        bookingLink: "https://www.viator.com/tours/Paris/Louvre-Museum-Tour/d479-9012YZ?pid=YOUR_PID_HERE",
        features: ["Skip the Line", "Expert Guide", "Headsets Included"]
    },
    {
        productCode: "3456AB",
        title: "Sunset Seine River Cruise with Champagne",
        description: "Experience the romance of Paris at twilight on this Seine River cruise. Sip champagne as you glide past illuminated landmarks.",
        price: {
            amount: 45.00,
            currency: "USD",
            formatted: "$45.00"
        },
        rating: {
            average: 4.5,
            count: 850
        },
        images: [
            { url: "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&q=80&w=800" }
        ],
        duration: "1 hour",
        bookingLink: "https://www.viator.com/tours/Paris/Seine-Cruise/d479-3456AB?pid=YOUR_PID_HERE",
        features: ["Instant Confirmation", "Mobile Ticket"]
    }
]

// Mapping logic to create MOCK_VIATOR_PRODUCTS from MOCK_VIATOR_ACTIVITIES
const MOCK_VIATOR_PRODUCTS: ViatorProduct[] = MOCK_VIATOR_ACTIVITIES.map(activity => ({
    productCode: activity.productCode,
    title: activity.title,
    description: activity.description,
    productUrl: activity.bookingLink,
    pricing: {
        summary: {
            fromPrice: activity.price.amount,
            currencyCode: activity.price.currency
        }
    },
    reviews: {
        combinedAverageRating: activity.rating.average,
        totalReviews: activity.rating.count
    },
    images: activity.images.map(img => ({
        variants: [
            { url: img.url, width: 1000, height: 800 },
            { url: img.url, width: 400, height: 300 }
        ]
    })),
    duration: {
        fixedDurationInMinutes: parseInt(activity.duration) * 60 || 120
    },
    bookingQuestions: []
}))


export async function searchViatorActivities(keyword: string): Promise<ViatorActivity[]> {
    await new Promise(resolve => setTimeout(resolve, 800))
    return MOCK_VIATOR_ACTIVITIES
}

export async function resolveDestination(query: string) {
    // If real API key present, fetch real destination ID via Free Text Search
    const apiKey = process.env.VIATOR_API_KEY
    if (apiKey) {
        try {
            console.log(`[Viator] Resolving destination: ${query}`)
            const response = await fetch('https://api.viator.com/partner/search/freetext', {
                method: 'POST',
                headers: {
                    'exp-api-key': apiKey,
                    'Accept-Language': 'en-US',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json;version=2.0'
                },
                body: JSON.stringify({
                    searchTerm: query,
                    currency: "USD",
                    searchTypes: [
                        {
                            searchType: "DESTINATIONS",
                            pagination: { start: 1, count: 1 }
                        }
                    ]
                })
            })

            if (response.ok) {
                const data = await response.json()
                const dest = data.destinations?.results?.[0]

                if (dest) {
                    console.log(`[Viator] Resolved '${query}' to ID: ${dest.id} (${dest.name})`)
                    return {
                        destinationId: dest.id,
                        destinationName: dest.name,
                        destinationType: 'CITY'
                    }
                } else {
                    console.warn(`[Viator] No destination found for '${query}'`)
                }
            } else {
                const err = await response.text()
                console.error('[Viator] Destination resolve error:', response.status, err)
            }
        } catch (e) {
            console.error('[Viator] Destination resolve failed:', e)
        }
    }

    // Fallback Mock Logic
    await new Promise(resolve => setTimeout(resolve, 500))
    if (query.toLowerCase().includes('paris')) {
        return { destinationId: 479, destinationName: 'Paris, France', destinationType: 'CITY' }
    }
    // Default fallback to London area if resolution fails
    return { destinationId: 684, destinationName: query, destinationType: 'CITY' }
}


// This function is used by the API route /api/activities/search
export async function searchProducts(destinationId: number | string, options?: any) {
    const apiKey = process.env.VIATOR_API_KEY

    // If API Key exists, use it
    if (apiKey) {
        try {
            console.log(`[Viator] Searching products via API for dest: ${destinationId} with keyword: ${options?.keyword || 'None'}`)

            const requestBody: any = {
                filtering: {
                    destination: destinationId.toString(),
                    startDate: options?.startDate ? options.startDate : undefined,
                    endDate: options?.endDate ? options.endDate : undefined
                },
                currency: "USD",
                pagination: { start: 1, count: 15 }
            }

            // Add keyword search if present (e.g. for Category filtering)
            if (options?.keyword) {
                requestBody.searchTerm = options.keyword
            }

            const response = await fetch('https://api.viator.com/partner/products/search', {
                method: 'POST',
                headers: {
                    'exp-api-key': apiKey,
                    'Accept-Language': 'en-US',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json;version=2.0'
                },
                body: JSON.stringify(requestBody)
            })

            if (!response.ok) {
                const text = await response.text()
                console.error('[Viator Error]', response.status, text)
                // Fallback on error
            } else {
                const data = await response.json()
                if (data && data.products) {
                    return data.products // Real data likely matches ViatorProduct interface mostly
                }
            }
        } catch (e) {
            console.error('[Viator] API request failed, falling back to mock:', e)
        }
    } else {
        console.warn('[Viator] No VIATOR_API_KEY found, using mock data.')
    }

    // Fallback Mock
    await new Promise(resolve => setTimeout(resolve, 800))
    return MOCK_VIATOR_PRODUCTS
}


