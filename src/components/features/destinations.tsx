"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const ALL_DESTINATIONS = [
    // Asia
    {
        id: 1, title: "Kyoto, Japan", description: "Ancient temples meet modern autonomy.",
        image: "/images/destinations/kyoto.jpg",
        rating: "4.9", price: "From $8,500", tags: ["Culture", "History", "Nature"]
    },
    {
        id: 2, title: "Bali, Indonesia", description: "Spiritual healing in tropical paradise.",
        image: "/images/destinations/bali.jpg",
        rating: "4.7", price: "From $5,500", tags: ["Tropical", "Wellness", "Relax"]
    },
    {
        id: 5, title: "Maldives", description: "Overwater bungalows and crystal clear lagoons.",
        image: "/images/destinations/maldives.jpg",
        rating: "4.9", price: "From $15,000", tags: ["Luxury", "Beach", "Romance"]
    },
    {
        id: 6, title: "Petra, Jordan", description: "The Rose City, carved directly into rock.",
        image: "/images/destinations/petra.jpg",
        rating: "4.8", price: "From $6,200", tags: ["History", "Desert", "Adventure"]
    },
    {
        id: 31, title: "Tokyo, Japan", description: "Neon lights, sushi, and tradition.",
        image: "/images/destinations/tokyo.jpg",
        rating: "4.8", price: "From $7,800", tags: ["City", "Food", "Tech"]
    },
    {
        id: 32, title: "Phuket, Thailand", description: "Tropical beaches and vibrant nightlife.",
        image: "/images/destinations/phuket.jpg",
        rating: "4.6", price: "From $3,500", tags: ["Beach", "Party", "Relax"]
    },

    // Europe
    {
        id: 3, title: "Amalfi Coast, Italy", description: "Vertical landscapes and azure seas.",
        image: "/images/destinations/amalfi.jpg",
        rating: "4.8", price: "From $12,000", tags: ["Coastal", "Luxury", "Food"]
    },
    {
        id: 4, title: "Reykjavik, Iceland", description: "Northern lights and volcanic wonders.",
        image: "/images/destinations/reykjavik.jpg",
        rating: "4.9", price: "From $7,200", tags: ["Adventure", "Cold", "Nature"]
    },
    {
        id: 8, title: "Santorini, Greece", description: "White-washed buildings against the Aegean Sea.",
        image: "/images/destinations/santorini.jpg",
        rating: "4.8", price: "From $9,500", tags: ["Romance", "Views", "Coastal"]
    },
    {
        id: 9, title: "Paris, France", description: "The city of light, love, and art.",
        image: "/images/destinations/paris.jpg",
        rating: "4.7", price: "From $8,900", tags: ["City", "Romance", "Art"]
    },
    {
        id: 10, title: "Swiss Alps, Switzerland", description: "Snow-capped peaks and pristine lakes.",
        image: "/images/destinations/swiss_alps.jpg",
        rating: "4.9", price: "From $11,000", tags: ["Nature", "Mountains", "Luxury"]
    },
    {
        id: 26, title: "Barcelona, Spain", description: "Art, architecture, and vibrant street life.",
        image: "/images/destinations/barcelona.jpg",
        rating: "4.7", price: "From $6,800", tags: ["Art", "Architecture", "Food"]
    },

    // Americas

    {
        id: 12, title: "Tulum, Mexico", description: "Ancient ruins meeting Caribbean beaches.",
        image: "/images/destinations/tulum.jpg",
        rating: "4.6", price: "From $4,500", tags: ["Beach", "Ruins", "Relax"]
    },
    {
        id: 13, title: "Banff, Canada", description: "Turquoise lakes and Rocky Mountain peaks.",
        image: "/images/destinations/banff.jpg",
        rating: "4.8", price: "From $5,800", tags: ["Nature", "Mountains", "Hiking"]
    },
    {
        id: 14, title: "New York City, USA", description: "The city that never sleeps.",
        image: "/images/destinations/nyc.jpg",
        rating: "4.7", price: "From $7,500", tags: ["City", "Energy", "Shopping"]
    },


    // Africa & Middle East & Oceania
    {
        id: 36, title: "Dubai, UAE", description: "Futuristic architecture and luxury.",
        image: "/images/destinations/dubai.jpg",
        rating: "4.8", price: "From $6,500", tags: ["City", "Luxury", "Shopping"]
    },
    {
        id: 15, title: "Marrakech, Morocco", description: "A sensory feast of colors and spices.",
        image: "/images/destinations/marrakech.jpg",
        rating: "4.6", price: "From $4,900", tags: ["Culture", "Markets", "Desert"]
    },
    {
        id: 16, title: "Cape Town, South Africa", description: "Where mountains meet the two oceans.",
        image: "/images/destinations/cape_town.jpg",
        rating: "4.8", price: "From $6,800", tags: ["Nature", "City", "Wine"]
    },

    {
        id: 29, title: "Cairo, Egypt", description: "Ancient pyramids and the mighty Nile.",
        image: "/images/destinations/cairo.jpg",
        rating: "4.7", price: "From $5,200", tags: ["History", "Culture", "Desert"]
    },

    {
        id: 30, title: "Sydney, Australia", description: "Iconic harbor and surf beaches.",
        image: "/images/destinations/sydney.jpg",
        rating: "4.8", price: "From $7,900", tags: ["City", "Beach", "Harbor"]
    },
    {
        id: 19, title: "Bora Bora", description: "The pearl of the Pacific.",
        image: "/images/destinations/bora_bora.jpg",
        rating: "5.0", price: "From $16,000", tags: ["Luxury", "Beach", "Romance"]
    }
]

// Simple seeded random function
function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Get shuffled destinations based on date
function getDailyDestinations() {
    if (typeof window === 'undefined') return ALL_DESTINATIONS

    // Create seed from YYYY-MM-DD
    const date = new Date()
    const seedString = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`
    let seed = parseInt(seedString)

    // Shuffle array copy
    const shuffled = [...ALL_DESTINATIONS]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed) * (i + 1))
        seed += 1
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
}

interface DestinationProps {
    onSelectDestination: (destination: string) => void;
}

export function CuratedDestinations({ onSelectDestination }: DestinationProps) {
    const [allDestinations, setAllDestinations] = React.useState(ALL_DESTINATIONS)
    const [visibleCount, setVisibleCount] = React.useState(4)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setAllDestinations(getDailyDestinations())
        setMounted(true)
    }, [])

    const handleShuffle = () => {
        const shuffled = [...allDestinations].sort(() => Math.random() - 0.5)
        setAllDestinations(shuffled)
        setVisibleCount(4)
    }

    const handleViewMore = () => {
        setVisibleCount(prev => Math.min(prev + 4, allDestinations.length))
    }

    if (!mounted) return null

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
                    <div className="flex gap-3">
                        <Button
                            className="hidden md:flex bg-black border border-white/20 text-white hover:bg-white hover:text-black transition-colors"
                            onClick={handleShuffle}
                        >
                            Shuffle Selection
                        </Button>
                        <Button
                            variant="default"
                            className="hidden md:flex bg-white text-black hover:bg-white/90 font-medium"
                            onClick={handleViewMore}
                            disabled={visibleCount >= allDestinations.length}
                        >
                            {visibleCount >= allDestinations.length ? "All Locations Shown" : "View More Locations"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {allDestinations.slice(0, visibleCount).map((dest, index) => (
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

                <div className="mt-8 flex flex-col gap-4 md:hidden">
                    <Button
                        className="w-full bg-black border border-white/20 text-white hover:bg-white hover:text-black transition-colors"
                        onClick={handleShuffle}
                    >
                        Shuffle Selection
                    </Button>
                    <Button
                        className="w-full bg-white text-black hover:bg-white/90 font-medium"
                        onClick={handleViewMore}
                        disabled={visibleCount >= allDestinations.length}
                    >
                        {visibleCount >= allDestinations.length ? "All Locations Shown" : "View More Locations"}
                    </Button>
                </div>
            </div>
        </section>
    )
}
