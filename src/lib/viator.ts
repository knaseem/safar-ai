
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
        bookingLink: "https://www.viator.com/tours/Paris/Private-Food-Tour/d479-5678XE",
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
        bookingLink: "https://www.viator.com/tours/Paris/Louvre-Museum-Tour/d479-9012YZ",
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
        bookingLink: "https://www.viator.com/tours/Paris/Seine-Cruise/d479-3456AB",
        features: ["Instant Confirmation", "Mobile Ticket"]
    },
    {
        productCode: "7890CD",
        title: "Private Desert Safari in Dubai with BBQ Dinner",
        description: "Dune bashing, camel riding, and a starry BBQ dinner in the Dubai desert.",
        price: {
            amount: 75.00,
            currency: "USD",
            formatted: "$75.00"
        },
        rating: {
            average: 4.8,
            count: 3200
        },
        images: [
            { url: "https://images.unsplash.com/photo-1547234935-80c7142ee969?auto=format&fit=crop&q=80&w=800" }
        ],
        duration: "6 hours",
        bookingLink: "https://www.viator.com/tours/Dubai/Desert-Safari/d828-7890CD",
        features: ["Hotel Pickup", "Dinner Included"]
    },
    {
        productCode: "1234EF",
        title: "Tokyo Full-Day Sightseeing Tour - Meiji Shrine & Asakusa",
        description: "Discover Tokyo's best shrines, temples, and shopping districts in one day.",
        price: {
            amount: 110.00,
            currency: "USD",
            formatted: "$110.00"
        },
        rating: {
            average: 4.6,
            count: 1500
        },
        images: [
            { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800" }
        ],
        duration: "8 hours",
        bookingLink: "https://www.viator.com/tours/Tokyo/City-Tour/d334-1234EF",
        features: ["English Guide", "Lunch Included"]
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

    // 1. Try to find specific mocks
    if (options?.mockDestinationName) {
        const city = options.mockDestinationName
        const specific = MOCK_VIATOR_PRODUCTS.filter(p =>
            p.title.toLowerCase().includes(city.toLowerCase()) ||
            p.description.toLowerCase().includes(city.toLowerCase())
        )
        if (specific.length > 0) return specific

        // 2. Generate generic mocks for the city
        return [
            {
                productCode: `GEN-${city}-1`,
                title: `Best of ${city} Private City Tour`,
                description: `Discover the highlights of ${city} with a local expert guide. Visit top landmarks and hidden gems.`,
                productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(city)}`,
                pricing: { summary: { fromPrice: 89, currencyCode: 'USD' } },
                reviews: { combinedAverageRating: 4.8, totalReviews: Math.floor(Math.random() * 500) + 100 },
                images: [{ variants: [{ url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800", width: 800, height: 600 }] }],
                duration: { fixedDurationInMinutes: 240 },
                bookingQuestions: []
            },
            {
                productCode: `GEN-${city}-2`,
                title: `${city} Food & Culture Walking Tour`,
                description: `Taste the authentic flavors of ${city} on this guided food tour. Sample local delicacies and learn about the culinary history.`,
                productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(city)}`,
                pricing: { summary: { fromPrice: 65, currencyCode: 'USD' } },
                reviews: { combinedAverageRating: 4.7, totalReviews: Math.floor(Math.random() * 500) + 50 },
                images: [{ variants: [{ url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800", width: 800, height: 600 }] }],
                duration: { fixedDurationInMinutes: 180 },
                bookingQuestions: []
            },
            {
                productCode: `GEN-${city}-3`,
                title: `Full-Day ${city} Highlights & Hidden Gems`,
                description: `See the best of ${city} in one day. From iconic sights to local secrets, this tour covers it all.`,
                productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(city)}`,
                pricing: { summary: { fromPrice: 120, currencyCode: 'USD' } },
                reviews: { combinedAverageRating: 4.9, totalReviews: Math.floor(Math.random() * 1000) + 200 },
                images: [{ variants: [{ url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&q=80&w=800", width: 800, height: 600 }] }],
                duration: { fixedDurationInMinutes: 480 },
                bookingQuestions: []
            },
            {
                productCode: `GEN-${city}-4`,
                title: `${city} by Night: Evening Tour & Dinner`,
                description: `Experience the magic of ${city} after dark. Includes a panoramic tour and a delicious dinner at a top-rated local restaurant.`,
                productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(city)}`,
                pricing: { summary: { fromPrice: 95, currencyCode: 'USD' } },
                reviews: { combinedAverageRating: 4.6, totalReviews: Math.floor(Math.random() * 300) + 80 },
                images: [{ variants: [{ url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800", width: 800, height: 600 }] }],
                duration: { fixedDurationInMinutes: 240 },
                bookingQuestions: []
            },
            {
                productCode: `GEN-${city}-5`,
                title: `Skip-the-Line: ${city} Museum & Art Tour`,
                description: `Avoid the crowds with priority access to ${city}'s most famous museums and art galleries.`,
                productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(city)}`,
                pricing: { summary: { fromPrice: 55, currencyCode: 'USD' } },
                reviews: { combinedAverageRating: 4.5, totalReviews: Math.floor(Math.random() * 400) + 120 },
                images: [{ variants: [{ url: "https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&q=80&w=800", width: 800, height: 600 }] }],
                duration: { fixedDurationInMinutes: 150 },
                bookingQuestions: []
            }
        ]
    }

    return MOCK_VIATOR_PRODUCTS
}


