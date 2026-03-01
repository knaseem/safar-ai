"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const ALL_DESTINATIONS = [
    // Asia
    {
        id: 1, title: "Kyoto, Japan", description: "Ancient temples meet modern autonomy.",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
        rating: "4.9", price: "From $8,500", tags: ["Culture", "History", "Nature"]
    },
    {
        id: 2, title: "Bali, Indonesia", description: "Spiritual healing in tropical paradise.",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop",
        rating: "4.7", price: "From $5,500", tags: ["Tropical", "Wellness", "Relax"]
    },
    {
        id: 5, title: "Maldives", description: "Overwater bungalows and crystal clear lagoons.",
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2065&auto=format&fit=crop",
        rating: "4.9", price: "From $15,000", tags: ["Luxury", "Beach", "Romance"]
    },
    {
        id: 6, title: "Petra, Jordan", description: "The Rose City, carved directly into rock.",
        image: "https://images.unsplash.com/photo-1579705745811-a32bef7856a3?q=80&w=2070&auto=format&fit=crop",
        rating: "4.8", price: "From $6,200", tags: ["History", "Desert", "Adventure"]
    },
    {
        id: 31, title: "Tokyo, Japan", description: "Neon lights, sushi, and tradition.",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop",
        rating: "4.8", price: "From $7,800", tags: ["City", "Food", "Tech"]
    },
    {
        id: 32, title: "Phuket, Thailand", description: "Tropical beaches and vibrant nightlife.",
        image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=2001&auto=format&fit=crop",
        rating: "4.6", price: "From $3,500", tags: ["Beach", "Party", "Relax"]
    },

    // Europe
    {
        id: 3, title: "Amalfi Coast, Italy", description: "Vertical landscapes and azure seas.",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2066&auto=format&fit=crop",
        rating: "4.8", price: "From $12,000", tags: ["Coastal", "Luxury", "Food"]
    },
    {
        id: 4, title: "Reykjavik, Iceland", description: "Northern lights and volcanic wonders.",
        image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2159&auto=format&fit=crop",
        rating: "4.9", price: "From $7,200", tags: ["Adventure", "Cold", "Nature"]
    },
    {
        id: 8, title: "Santorini, Greece", description: "White-washed buildings against the Aegean Sea.",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2079&auto=format&fit=crop",
        rating: "4.8", price: "From $9,500", tags: ["Romance", "Views", "Coastal"]
    },
    {
        id: 9, title: "Paris, France", description: "The city of light, love, and art.",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
        rating: "4.7", price: "From $8,900", tags: ["City", "Romance", "Art"]
    },
    {
        id: 10, title: "Swiss Alps, Switzerland", description: "Snow-capped peaks and pristine lakes.",
        image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2070&auto=format&fit=crop",
        rating: "4.9", price: "From $11,000", tags: ["Nature", "Mountains", "Luxury"]
    },
    {
        id: 26, title: "Barcelona, Spain", description: "Art, architecture, and vibrant street life.",
        image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070&auto=format&fit=crop",
        rating: "4.7", price: "From $6,800", tags: ["Art", "Architecture", "Food"]
    },

    // Americas
    {
        id: 11, title: "Machu Picchu, Peru", description: "Lost Incan city high in the Andes.",
        image: "https://images.unsplash.com/photo-1588665792942-ed011aaab0b3?q=80&w=2076&auto=format&fit=crop",
        rating: "4.9", price: "From $6,500", tags: ["History", "Hiking", "Adventure"]
    },
    {
        id: 12, title: "Tulum, Mexico", description: "Ancient ruins meeting Caribbean beaches.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop",
        rating: "4.6", price: "From $4,500", tags: ["Beach", "Ruins", "Relax"]
    },
    {
        id: 13, title: "Banff, Canada", description: "Turquoise lakes and Rocky Mountain peaks.",
        image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=2070&auto=format&fit=crop",
        rating: "4.8", price: "From $5,800", tags: ["Nature", "Mountains", "Hiking"]
    },
    {
        id: 14, title: "New York City, USA", description: "The city that never sleeps.",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop",
        rating: "4.7", price: "From $7,500", tags: ["City", "Energy", "Shopping"]
    },
    {
        id: 35, title: "Patagonia, Chile", description: "Granite peaks and glaciers.",
        image: "https://images.unsplash.com/photo-1550993806-38f321df75e3?q=80&w=2102&auto=format&fit=crop",
        rating: "4.9", price: "From $8,000", tags: ["Nature", "Hiking", "Adventure"]
    },

    // Africa & Middle East & Oceania
    {
        id: 36, title: "Dubai, UAE", description: "Futuristic architecture and luxury.",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=2009&auto=format&fit=crop",
        rating: "4.8", price: "From $6,500", tags: ["City", "Luxury", "Shopping"]
    },
    {
        id: 15, title: "Marrakech, Morocco", description: "A sensory feast of colors and spices.",
        image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2070&auto=format&fit=crop",
        rating: "4.6", price: "From $4,900", tags: ["Culture", "Markets", "Desert"]
    },
    {
        id: 16, title: "Cape Town, South Africa", description: "Where mountains meet the two oceans.",
        image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=2071&auto=format&fit=crop",
        rating: "4.8", price: "From $6,800", tags: ["Nature", "City", "Wine"]
    },
    {
        id: 17, title: "Serengeti, Tanzania", description: "Witness the Great Migration.",
        image: "https://images.unsplash.com/photo-1547471080-7fc2caa6f17f?q=80&w=2068&auto=format&fit=crop",
        rating: "5.0", price: "From $18,000", tags: ["Safari", "Wildlife", "Nature"]
    },
    {
        id: 29, title: "Cairo, Egypt", description: "Ancient pyramids and the mighty Nile.",
        image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=2070&auto=format&fit=crop",
        rating: "4.7", price: "From $5,200", tags: ["History", "Culture", "Desert"]
    },
    {
        id: 18, title: "Queenstown, New Zealand", description: "The adventure capital of the world.",
        image: "https://images.unsplash.com/photo-1507699622177-388898d9903d?q=80&w=2070&auto=format&fit=crop",
        rating: "4.9", price: "From $8,200", tags: ["Adventure", "Nature", "Mountains"]
    },
    {
        id: 30, title: "Sydney, Australia", description: "Iconic harbor and surf beaches.",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop",
        rating: "4.8", price: "From $7,900", tags: ["City", "Beach", "Harbor"]
    },
    {
        id: 19, title: "Bora Bora", description: "The pearl of the Pacific.",
        image: "https://images.unsplash.com/photo-1589979481223-deb893043163?q=80&w=2070&auto=format&fit=crop",
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
