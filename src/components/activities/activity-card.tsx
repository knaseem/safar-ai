import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, X, ExternalLink, MapPin, Check, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViatorProduct } from '@/lib/viator'

interface ActivityCardProps {
    product: ViatorProduct
    onSelect: (product: ViatorProduct) => void
}

export function ActivityCard({ product, onSelect }: ActivityCardProps) {
    const imageUrl = product.images?.[0]?.variants?.find(v => v.width >= 400)?.url || product.images?.[0]?.variants?.[0]?.url
    const price = product.pricing?.summary?.fromPrice
    const rating = product.reviews?.combinedAverageRating
    const reviewCount = product.reviews?.totalReviews

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer flex flex-col h-full"
            onClick={() => onSelect(product)}
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                        <MapPin className="size-8" />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white">
                    {product.duration?.fixedDurationInMinutes
                        ? `${Math.round(product.duration.fixedDurationInMinutes / 60)} hours`
                        : 'Flexible'}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-medium text-white line-clamp-2 mb-2 group-hover:text-emerald-400 transition-colors">
                    {product.title}
                </h3>

                <div className="mt-auto space-y-3">
                    {/* Rating */}
                    <div className="flex items-center text-xs text-white/60">
                        <Star className="size-3 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-white font-medium mr-1">{rating?.toFixed(1) || 'New'}</span>
                        <span>({reviewCount || 0})</span>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div>
                            <div className="text-[10px] text-white/40 uppercase tracking-wider">From</div>
                            <div className="text-lg font-semibold text-emerald-400">
                                ${price || 'Check'}
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 text-xs bg-white/10 border-white/30 text-white hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50">
                            Details
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

interface ActivityDetailModalProps {
    product: ViatorProduct | null
    isOpen: boolean
    onClose: () => void
}

export function ActivityDetailModal({ product, isOpen, onClose }: ActivityDetailModalProps) {
    if (!product) return null

    const partnerId = process.env.NEXT_PUBLIC_VIATOR_PARTNER_ID || 'P00285711'
    const separator = product.productUrl.includes('?') ? '&' : '?'
    const affiliateUrl = `${product.productUrl}${separator}pid=${partnerId}&mcid=42383&medium=link`
    const imageUrl = product.images?.[0]?.variants?.find(v => v.width >= 800)?.url || product.images?.[0]?.variants?.[0]?.url

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-auto md:top-[5%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl md:h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden flex flex-col"
                    >
                        {/* Header Image */}
                        <div className="relative h-64 md:h-80 shrink-0">
                            <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                            <button
                                onClick={onClose}
                                className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-colors text-sm font-medium"
                            >
                                <ChevronLeft className="size-4" />
                                Back
                            </button>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="max-w-3xl mx-auto space-y-8">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{product.title}</h2>
                                    <div className="flex flex-wrap gap-4 text-sm text-white/60">
                                        <div className="flex items-center">
                                            <Star className="size-4 text-yellow-400 fill-yellow-400 mr-2" />
                                            <span className="text-white font-medium">{product.reviews?.combinedAverageRating?.toFixed(1)}</span>
                                            <span className="mx-1">·</span>
                                            <span>{product.reviews?.totalReviews} reviews</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="size-4 text-white/60 mr-2" />
                                            <span>{Math.round((product.duration?.fixedDurationInMinutes || 0) / 60)} hours</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <h3 className="text-lg font-semibold text-white mb-2">About this activity</h3>
                                    <p className="text-white/70 leading-relaxed whitespace-pre-line">{product.description}</p>
                                </div>

                                {product.bookingQuestions?.length > 0 && (
                                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Good to Know</h3>
                                        <ul className="space-y-2">
                                            {/* Just show a sample generic message as we process raw questions which are IDs usually */}
                                            <li className="flex items-start text-sm text-white/70">
                                                <Check className="size-4 text-emerald-400 mr-3 mt-0.5 shrink-0" />
                                                <span>Mobile ticket accepted</span>
                                            </li>
                                            <li className="flex items-start text-sm text-white/70">
                                                <Check className="size-4 text-emerald-400 mr-3 mt-0.5 shrink-0" />
                                                <span>Free cancellation up to 24 hours in advance</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-4 md:p-6 border-t border-white/10 bg-[#0A0A0A] shrink-0">
                            <div className="max-w-3xl mx-auto flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Price</div>
                                    <div className="text-2xl font-bold text-white">
                                        ${product.pricing?.summary?.fromPrice}
                                    </div>
                                </div>
                                <Button
                                    className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20"
                                    onClick={() => window.open(affiliateUrl, '_blank')}
                                >
                                    <span>Check Availability on Viator</span>
                                    <ExternalLink className="size-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
