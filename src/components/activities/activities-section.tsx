import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, ExternalLink, Star, Clock, MapPin } from 'lucide-react'
import { ActivityCard, ActivityDetailModal } from './activity-card'
import { ViatorProduct } from '@/lib/viator'

interface ActivitiesSectionProps {
    destination: string
    dates?: {
        from: Date
        to: Date
    }
}

// Fallback mock activities when API fails - directs users to Viator
function getMockActivities(destination: string): ViatorProduct[] {
    const cleanDest = destination.trim()

    return [
        {
            productCode: 'mock-tour-1',
            title: `Best of ${cleanDest} Walking Tour`,
            description: `Discover the highlights of ${cleanDest} with an expert local guide. Visit iconic landmarks and hidden gems.`,
            images: [{ variants: [{ url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400', width: 400, height: 300 }] }],
            pricing: { summary: { fromPrice: 45, currency: 'USD' } },
            reviews: { combinedAverageRating: 4.8, totalReviews: 1250 },
            duration: { fixedDurationInMinutes: 180 },
            bookingQuestions: [],
            productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(cleanDest + ' tour')}`,
            destinations: [],
            tags: ['Walking Tour', 'Sightseeing']
        },
        {
            productCode: 'mock-tour-2',
            title: `${cleanDest} Food & Culture Experience`,
            description: `Taste the best local cuisine and learn about the rich culture of ${cleanDest} on this unforgettable culinary journey.`,
            images: [{ variants: [{ url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', width: 400, height: 300 }] }],
            pricing: { summary: { fromPrice: 75, currency: 'USD' } },
            reviews: { combinedAverageRating: 4.9, totalReviews: 890 },
            duration: { fixedDurationInMinutes: 240 },
            bookingQuestions: [],
            productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(cleanDest + ' food tour')}`,
            destinations: [],
            tags: ['Food Tour', 'Cultural']
        },
        {
            productCode: 'mock-tour-3',
            title: `Skip-the-Line: Top ${cleanDest} Attractions`,
            description: `Beat the crowds with priority access to ${cleanDest}'s most popular attractions. Includes expert guide.`,
            images: [{ variants: [{ url: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400', width: 400, height: 300 }] }],
            pricing: { summary: { fromPrice: 95, currency: 'USD' } },
            reviews: { combinedAverageRating: 4.7, totalReviews: 2100 },
            duration: { fixedDurationInMinutes: 300 },
            bookingQuestions: [],
            productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(cleanDest + ' skip the line')}`,
            destinations: [],
            tags: ['Skip-the-Line', 'Must-See']
        }
    ]
}

export function ActivitiesSection({ destination, dates }: ActivitiesSectionProps) {
    const [products, setProducts] = useState<ViatorProduct[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<ViatorProduct | null>(null)
    const [usingFallback, setUsingFallback] = useState(false)

    // Retrieve partner ID from env or fallback
    const partnerId = process.env.NEXT_PUBLIC_VIATOR_PARTNER_ID || 'P00285711'

    useEffect(() => {
        async function fetchActivities() {
            if (!destination) return

            setLoading(true)
            setError(null)
            setUsingFallback(false)
            try {
                const params = new URLSearchParams()
                params.append('query', destination)

                if (dates?.from) params.append('startDate', dates.from.toISOString().split('T')[0])
                if (dates?.to) params.append('endDate', dates.to.toISOString().split('T')[0])

                const res = await fetch(`/api/activities/search?${params.toString()}`)
                const data = await res.json()

                if (!data.products || data.products.length === 0) {
                    // Use fallback mock activities instead of showing error
                    console.log('No activities from API, using fallback')
                    setProducts(getMockActivities(destination))
                    setUsingFallback(true)
                } else {
                    setProducts(data.products)
                }
            } catch (err) {
                console.error('Failed to fetch activities:', err)
                // Use fallback instead of showing error
                setProducts(getMockActivities(destination))
                setUsingFallback(true)
            } finally {
                setLoading(false)
            }
        }

        fetchActivities()
    }, [destination, dates])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <Loader2 className="size-8 animate-spin mb-2" />
                <p className="text-sm">Curating best experiences...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-8 px-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
                <AlertCircle className="size-4 mr-2" />
                {error}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-white/40">
                <p>No specific activities found for this location.</p>
            </div>
        )
    }

    return (
        <>
            {usingFallback && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-sm flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>Showing popular activities. Click any to browse more on Viator.</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <ActivityCard
                        key={product.productCode}
                        product={product}
                        onSelect={setSelectedProduct}
                    />
                ))}
            </div>

            {/* Browse More on Viator Button */}
            <div className="mt-6 text-center">
                <a
                    href={`https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination)}&pid=${partnerId}&mcid=42383&medium=link`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-colors"
                >
                    Browse All {destination} Activities on Viator
                    <ExternalLink className="size-4" />
                </a>
            </div>

            <ActivityDetailModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </>
    )
}

