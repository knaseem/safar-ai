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
// Fallback mock activities when API fails - directs users to Viator
function getMockActivities(destination: string, category: string): ViatorProduct[] {
    const cleanDest = destination.trim()

    // Generate category-specific templates
    const getTemplates = (cat: string) => {
        switch (cat) {
            case 'Food':
                return [
                    {
                        title: `Best of ${cleanDest} Food Tour`,
                        desc: `Discover the culinary delights of ${cleanDest} with an expert local foodie. Taste diverse dishes and street food.`,
                        query: 'food tour'
                    },
                    {
                        title: `${cleanDest} Culinary Experience`,
                        desc: `A premium tasting journey through ${cleanDest}'s best restaurants and hidden local gems.`,
                        query: 'culinary experience'
                    },
                    {
                        title: `Private ${cleanDest} Market & Tasting Walk`,
                        desc: `Explore the vibrant local markets of ${cleanDest} and sample fresh ingredients and traditional snacks.`,
                        query: 'market tour'
                    }
                ]
            case 'Adventure':
                return [
                    {
                        title: `${cleanDest} Adventure Safari`,
                        desc: `Get your adrenaline pumping with this thrilling outdoor adventure in ${cleanDest}.`,
                        query: 'adventure'
                    },
                    {
                        title: `Hiking & Nature in ${cleanDest}`,
                        desc: `Explore the beautiful landscapes surrounding ${cleanDest} with an experienced guide.`,
                        query: 'hiking'
                    },
                    {
                        title: `${cleanDest} Action Sports Experience`,
                        desc: `Experience the thrill of action sports in the heart of ${cleanDest}.`,
                        query: 'sports'
                    }
                ]
            case 'Culture':
                return [
                    {
                        title: `Best of ${cleanDest} dedicated Culture Tour`,
                        desc: `Immerse yourself in the rich history and heritage of ${cleanDest}.`,
                        query: 'culture tour'
                    },
                    {
                        title: `${cleanDest} Historical Walk`,
                        desc: `Visit ancient landmarks and learn about the fascinating past of ${cleanDest}.`,
                        query: 'history walk'
                    },
                    {
                        title: `Art & Traditions of ${cleanDest}`,
                        desc: `Discover the local art scene and traditional customs of ${cleanDest}.`,
                        query: 'art culture'
                    }
                ]
            case 'Sightseeing':
                return [
                    {
                        title: `${cleanDest} City Highlights Tour`,
                        desc: `See all the major landmarks of ${cleanDest} in this comprehensive sightseeing tour.`,
                        query: 'sightseeing'
                    },
                    {
                        title: `Hop-on Hop-off ${cleanDest}`,
                        desc: `Explore ${cleanDest} at your own pace with a flexible bus tour of top attractions.`,
                        query: 'bus tour'
                    },
                    {
                        title: `Iconic ${cleanDest} Photography Tour`,
                        desc: `Capture the best views and hidden angles of ${cleanDest} with a pro photographer.`,
                        query: 'photo tour'
                    }
                ]
            default: // 'All'
                return [
                    {
                        title: `Best of ${cleanDest} City Tour`,
                        desc: `Discover the highlights of ${cleanDest} with an expert local guide. Visit iconic landmarks and hidden gems.`,
                        query: 'tour'
                    },
                    {
                        title: `${cleanDest} Cultural Experience`,
                        desc: `Learn about the rich culture and history of ${cleanDest} on this unforgettable journey.`,
                        query: 'culture'
                    },
                    {
                        title: `Skip-the-Line: Top ${cleanDest} Attractions`,
                        desc: `Beat the crowds with priority access to ${cleanDest}'s most popular attractions.`,
                        query: 'skip the line'
                    }
                ]
        }
    }

    const templates = getTemplates(category)

    return templates.map((t, i) => ({
        productCode: `mock-${category.toLowerCase()}-${i}`,
        title: t.title,
        description: t.desc,
        images: [{
            variants: [{
                url: category === 'Food'
                    ? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
                    : category === 'Adventure'
                        ? 'https://images.unsplash.com/photo-1533669955200-c43eef6551b8?w=400'
                        : 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400',
                width: 400,
                height: 300
            }]
        }],
        pricing: { summary: { fromPrice: 45 + (i * 20), currencyCode: 'USD' } },
        reviews: { combinedAverageRating: 4.5 + (i * 0.1), totalReviews: 100 + (i * 50) },
        duration: { fixedDurationInMinutes: 180 + (i * 60) },
        bookingQuestions: [],
        productUrl: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination + ' ' + t.query)}`
    }))
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

