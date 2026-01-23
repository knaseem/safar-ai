"use client"

import { motion } from "framer-motion"
import { ArrowRight, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const destinations = [
    {
        id: 1,
        title: "Kyoto, Japan",
        description: "Ancient temples meet modern autonomy.",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
        rating: "4.9",
        price: "From $8,500",
        tags: ["Culture", "History", "Nature"]
    },
    {
        id: 2,
        title: "Amalfi Coast, Italy",
        description: "Vertical landscapes and azure seas.",
        image: "https://images.unsplash.com/photo-1533907650686-705761a08356?q=80&w=2034&auto=format&fit=crop",
        rating: "4.8",
        price: "From $12,000",
        tags: ["Coastal", "Luxury", "Food"]
    },
    {
        id: 3,
        title: "Reykjavik, Iceland",
        description: "Northern lights and volcanic wonders.",
        image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2159&auto=format&fit=crop",
        rating: "4.9",
        price: "From $7,200",
        tags: ["Adventure", "Cold", "Nature"]
    },
    {
        id: 4,
        title: "Bali, Indonesia",
        description: "Spiritual healing in tropical paradise.",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop",
        rating: "4.7",
        price: "From $5,500",
        tags: ["Tropical", "Wellness", "Relax"]
    }
]

interface DestinationProps {
    onSelectDestination: (destination: string) => void;
}

export function CuratedDestinations({ onSelectDestination }: DestinationProps) {
    return (
        <section id="destinations" className="py-24 bg-black relative overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Curated Destinations</h2>
                        <p className="text-white/60 max-w-xl text-lg">
                            Hand-picked locations optimized for autonomous travel experiences.
                        </p>
                    </div>
                    <Button variant="premium" className="hidden md:flex bg-white text-black hover:bg-white/90 font-medium">
                        View All Locations
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {destinations.map((dest, index) => (
                        <motion.div
                            key={dest.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
                            onClick={() => onSelectDestination(`Trip to ${dest.title}`)}
                        >
                            {/* Image */}
                            <img
                                src={dest.image}
                                alt={dest.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                {/* Tags */}
                                <div className="flex gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    {dest.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-white">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-bold text-white">{dest.title}</h3>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star className="size-4 fill-current" />
                                        <span className="text-sm font-medium">{dest.rating}</span>
                                    </div>
                                </div>

                                <p className="text-white/70 text-sm mb-4 line-clamp-2">
                                    {dest.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-white font-medium">{dest.price}</span>
                                    <div className="p-2 rounded-full bg-white/10 text-white group-hover:bg-white group-hover:text-black transition-all duration-300">
                                        <ArrowRight className="size-4" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Button variant="premium" className="w-full mt-8 bg-white text-black hover:bg-white/90 font-medium md:hidden">
                    View All Locations
                </Button>
            </div>
        </section>
    )
}
