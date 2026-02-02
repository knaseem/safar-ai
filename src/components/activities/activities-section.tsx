import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle } from 'lucide-react'
import { ActivityCard, ActivityDetailModal } from './activity-card'
import { ViatorProduct } from '@/lib/viator'

interface ActivitiesSectionProps {
    destination: string
    dates?: {
        from: Date
        to: Date
    }
}

export function ActivitiesSection({ destination, dates }: ActivitiesSectionProps) {
    const [products, setProducts] = useState<ViatorProduct[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<ViatorProduct | null>(null)

    useEffect(() => {
        async function fetchActivities() {
            if (!destination) return

            setLoading(true)
            setError(null)
            try {
                const params = new URLSearchParams()
                params.append('query', destination)

                if (dates?.from) params.append('startDate', dates.from.toISOString().split('T')[0])
                if (dates?.to) params.append('endDate', dates.to.toISOString().split('T')[0])

                const res = await fetch(`/api/activities/search?${params.toString()}`)
                const data = await res.json()

                if (!data.products) {
                    // If API fails or returns error structure
                    throw new Error(data.error || 'Failed to load activities')
                }

                setProducts(data.products)
            } catch (err) {
                console.error('Failed to fetch activities:', err)
                setError('Could not load specific activities for this location.')
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <ActivityCard
                        key={product.productCode}
                        product={product}
                        onSelect={setSelectedProduct}
                    />
                ))}
            </div>

            <ActivityDetailModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </>
    )
}
