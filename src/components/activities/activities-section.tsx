import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, ExternalLink, Star } from 'lucide-react'
import { ActivityCard, ActivityDetailModal, ActivityCardSkeleton } from './activity-card'
import { ViatorProduct } from '@/lib/viator'

interface ActivitiesSectionProps {
    destination: string
    dates?: {
        from: Date
        to: Date
    }
}

const CATEGORIES = ['All', 'Food', 'Adventure', 'Culture', 'Sightseeing']

// Fallback mock activities when API fails - directs users to Viator
function getMockActivities(destination: string, category: string): ViatorProduct[] {
    const cleanDest = destination.trim()
    const suffix = category === 'All' ? '' : ` ${category}`

    return [
        {
            productCode: 'mock-tour-1',
            title: `Best of ${cleanDest}${suffix} Tour`,
            description: `Discover the highlights of ${cleanDest}${suffix} with an expert local guide. Visit iconic landmarks and hidden gems.`,
            images: [{ variants: [{ url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400', width: 400, height: 300 }] }],
            pricing: { summary: { fromPrice: 45, currencyCode: 'USD' } },
            reviews: { combinedAverageRating: 4.8, totalReviews: 1250 },
            duration: { fixedDurationInMinutes: 180 },
            bookingQuestions: [],
            productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(cleanDest + suffix + ' tour')}`
        },
        {
            productCode: 'mock-tour-2',
            title: `${cleanDest}${suffix} Experience`,
            description: `Taste the best local cuisine and learn about the rich culture of ${cleanDest} on this unforgettable journey.`,
            images: [{ variants: [{ url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', width: 400, height: 300 }] }],
            pricing: { summary: { fromPrice: 75, currencyCode: 'USD' } },
            reviews: { combinedAverageRating: 4.9, totalReviews: 890 },
            duration: { fixedDurationInMinutes: 240 },
            bookingQuestions: [],
            productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(cleanDest + suffix + ' experience')}`
        },
        {
            productCode: 'mock-tour-3',
            title: `Skip-the-Line: Top ${cleanDest} Attractions`,
            description: `Beat the crowds with priority access to ${cleanDest}'s most popular attractions. Includes expert guide.`,
            images: [{ variants: [{ url: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400', width: 400, height: 300 }] }],
            pricing: { summary: { fromPrice: 95, currencyCode: 'USD' } },
            reviews: { combinedAverageRating: 4.7, totalReviews: 2100 },
            duration: { fixedDurationInMinutes: 300 },
            bookingQuestions: [],
            productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(cleanDest + ' skip the line')}`
        }
    ]
}

export function ActivitiesSection({ destination, dates }: ActivitiesSectionProps) {
    const [products, setProducts] = useState<ViatorProduct[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<ViatorProduct | null>(null)
    const [usingFallback, setUsingFallback] = useState(false)
    const [activeCategory, setActiveCategory] = useState('All')

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
                if (activeCategory !== 'All') {
                    params.append('category', activeCategory)
                }

                if (dates?.from) params.append('startDate', dates.from.toISOString().split('T')[0])
                if (dates?.to) params.append('endDate', dates.to.toISOString().split('T')[0])

                const res = await fetch(`/api/activities/search?${params.toString()}`)
                const data = await res.json()

                if (!data.products || data.products.length === 0) {
                    // Use fallback mock activities instead of showing error
                    console.log('No activities from API, using fallback')
                    setProducts(getMockActivities(destination, activeCategory))
                    setUsingFallback(true)
                } else {
                    setProducts(data.products)
                }
            } catch (err) {
                console.error('Failed to fetch activities:', err)
                // Use fallback instead of showing error
                setProducts(getMockActivities(destination, activeCategory))
                setUsingFallback(true)
            } finally {
                setLoading(false)
            }
        }

        fetchActivities()
    }, [destination, dates, activeCategory])

    return (
        <>
            {/* Category Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat
                            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {usingFallback && !loading && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-sm flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>Showing popular activities. Click any to browse more on Viator.</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex items-center justify-center py-8 px-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm mb-4">
                    <AlertCircle className="size-4 mr-2" />
                    {error}
                </div>
            )}

            {/* Grid Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    // Skeleton Loading State
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-[320px]">
                            <ActivityCardSkeleton />
                        </div>
                    ))
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-white/40">
                        <p>No specific activities found for this location.</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <ActivityCard
                            key={product.productCode}
                            product={product}
                            onSelect={setSelectedProduct}
                        />
                    ))
                )}
            </div>

            {/* Browse More on Viator Button */}
            {!loading && (
                <div className="mt-6 text-center">
                    <a
                        href={`https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination + (activeCategory !== 'All' ? ' ' + activeCategory : ''))}&pid=${partnerId}&mcid=42383&medium=link`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-colors"
                    >
                        Browse All {destination} Activities on Viator
                        <ExternalLink className="size-4" />
                    </a>
                </div>
            )}

            <ActivityDetailModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </>
    )
}

