export interface BlogPost {
    slug: string
    title: string
    excerpt: string
    category: "Destinations" | "Travel Tips" | "Luxury & Lifestyle" | "Halal Travel"
    image: string
    readTime: string
    date: string
    featured?: boolean
}

export const blogPosts: BlogPost[] = [
    // DESTINATIONS (10)
    {
        slug: "ultimate-dubai-guide-halal-travelers",
        title: "Ultimate Dubai Guide for Halal Travelers",
        excerpt: "Discover the best halal restaurants, prayer facilities, and luxury experiences in the City of Gold.",
        category: "Halal Travel",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop",
        readTime: "8 min",
        date: "2025-01-15",
        featured: true
    },
    {
        slug: "7-day-tokyo-itinerary",
        title: "7-Day Tokyo Itinerary: From Shibuya to Senso-ji",
        excerpt: "The perfect week in Japan's capital—covering temples, tech, and the best ramen spots.",
        category: "Destinations",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop",
        readTime: "10 min",
        date: "2025-01-14"
    },
    {
        slug: "hidden-gems-of-bali",
        title: "Hidden Gems of Bali: Beyond the Tourist Crowds",
        excerpt: "Secret waterfalls, untouched beaches, and local warungs the guidebooks don't mention.",
        category: "Destinations",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop",
        readTime: "7 min",
        date: "2025-01-13"
    },
    {
        slug: "paris-beyond-eiffel-tower",
        title: "Paris Beyond the Eiffel Tower",
        excerpt: "Le Marais, Montmartre secrets, and where Parisians actually eat—a local's guide.",
        category: "Destinations",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
        readTime: "9 min",
        date: "2025-01-12"
    },
    {
        slug: "morocco-marrakech-to-sahara",
        title: "Morocco: Marrakech to the Sahara Desert",
        excerpt: "Spice markets, blue cities, and sleeping under the stars in the world's largest desert.",
        category: "Destinations",
        image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?q=80&w=2067&auto=format&fit=crop",
        readTime: "11 min",
        date: "2025-01-11",
        featured: true
    },
    {
        slug: "maldives-budget-guide",
        title: "Maldives on a Budget: Yes, It's Possible",
        excerpt: "Guesthouses, local islands, and how to experience paradise without the overwater villa price tag.",
        category: "Destinations",
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2065&auto=format&fit=crop",
        readTime: "6 min",
        date: "2025-01-10"
    },
    {
        slug: "istanbul-east-meets-west",
        title: "Istanbul: Where East Meets West",
        excerpt: "A city of minarets and modernity—navigating the best of two continents.",
        category: "Destinations",
        image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2071&auto=format&fit=crop",
        readTime: "8 min",
        date: "2025-01-09"
    },
    {
        slug: "singapore-food-tour-guide",
        title: "Singapore Food Tour: Hawker Centers to Michelin Stars",
        excerpt: "From $3 chicken rice to $300 tasting menus—the ultimate food lover's guide.",
        category: "Destinations",
        image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2052&auto=format&fit=crop",
        readTime: "7 min",
        date: "2025-01-08"
    },
    {
        slug: "swiss-alps-adventure-guide",
        title: "Swiss Alps Adventure Guide",
        excerpt: "Skiing, hiking, and the most scenic train rides on Earth—your complete Swiss adventure.",
        category: "Destinations",
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2070&auto=format&fit=crop",
        readTime: "9 min",
        date: "2025-01-07"
    },
    {
        slug: "santorini-complete-guide",
        title: "Santorini: Complete Island Guide",
        excerpt: "Blue domes, sunset spots, and the best caldera views—your Greek island dream awaits.",
        category: "Destinations",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2069&auto=format&fit=crop",
        readTime: "8 min",
        date: "2025-01-06"
    },

    // TRAVEL TIPS (10)
    {
        slug: "find-halal-food-anywhere",
        title: "How to Find Halal Food Anywhere in the World",
        excerpt: "Apps, phrases, and strategies for Muslim travelers to eat confidently abroad.",
        category: "Halal Travel",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
        readTime: "5 min",
        date: "2025-01-05",
        featured: true
    },
    {
        slug: "first-time-international-travel-checklist",
        title: "First-Time International Traveler Checklist",
        excerpt: "Everything you need to know before your first trip abroad—from passports to packing.",
        category: "Travel Tips",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop",
        readTime: "6 min",
        date: "2025-01-04"
    },
    {
        slug: "best-travel-credit-cards-2025",
        title: "Best Travel Credit Cards 2025",
        excerpt: "Points, miles, and perks—maximize your travel rewards with the right card.",
        category: "Travel Tips",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop",
        readTime: "8 min",
        date: "2025-01-03"
    },
    {
        slug: "pack-two-weeks-carry-on",
        title: "How to Pack for a 2-Week Trip in a Carry-On",
        excerpt: "The minimalist packing guide that will change how you travel forever.",
        category: "Travel Tips",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2787&auto=format&fit=crop",
        readTime: "5 min",
        date: "2025-01-02"
    },
    {
        slug: "airport-lounge-hacks",
        title: "Airport Lounge Hacks: Access Without Elite Status",
        excerpt: "Credit cards, day passes, and secret tricks to get into airport lounges.",
        category: "Travel Tips",
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop",
        readTime: "6 min",
        date: "2025-01-01"
    },
    {
        slug: "solo-travel-safety-guide",
        title: "Solo Travel Safety Guide",
        excerpt: "Tips for staying safe while exploring the world on your own—for all travelers.",
        category: "Travel Tips",
        image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop",
        readTime: "7 min",
        date: "2024-12-30"
    },
    {
        slug: "travel-insurance-explained",
        title: "Best Travel Insurance Explained",
        excerpt: "What's actually covered, when you need it, and our top recommendations.",
        category: "Travel Tips",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
        readTime: "6 min",
        date: "2024-12-29"
    },
    {
        slug: "ai-revolutionizing-travel-planning",
        title: "How AI is Revolutionizing Travel Planning",
        excerpt: "From personalized itineraries to dynamic pricing—the future of travel is here.",
        category: "Travel Tips",
        image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=2832&auto=format&fit=crop",
        readTime: "5 min",
        date: "2024-12-28"
    },
    {
        slug: "flying-business-class-for-less",
        title: "Flying Business Class for Less",
        excerpt: "Points hacking, fare sales, and upgrade strategies for premium cabin travel.",
        category: "Travel Tips",
        image: "https://images.unsplash.com/photo-1540339832862-474599807836?q=80&w=2787&auto=format&fit=crop",
        readTime: "7 min",
        date: "2024-12-27"
    },
    {
        slug: "digital-nomad-visa-guide",
        title: "Digital Nomad Visa Guide 2025",
        excerpt: "Which countries offer remote work visas and how to apply for them.",
        category: "Travel Tips",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
        readTime: "8 min",
        date: "2024-12-26"
    },

    // LUXURY & LIFESTYLE (5)
    {
        slug: "worlds-best-luxury-halal-resorts",
        title: "World's Best Luxury Halal Resorts",
        excerpt: "From Turkey to Thailand—the most exclusive halal-friendly luxury escapes.",
        category: "Luxury & Lifestyle",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        readTime: "9 min",
        date: "2024-12-25",
        featured: true
    },
    {
        slug: "private-villa-rentals-worth-it",
        title: "Private Villa Rentals: Worth the Cost?",
        excerpt: "When booking a villa beats a hotel—and how to find the best ones.",
        category: "Luxury & Lifestyle",
        image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop",
        readTime: "6 min",
        date: "2024-12-24"
    },
    {
        slug: "ultimate-yacht-charter-guide",
        title: "Ultimate Guide to Yacht Charters",
        excerpt: "Everything you need to know about chartering a yacht—from Croatia to the Caribbean.",
        category: "Luxury & Lifestyle",
        image: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?q=80&w=2070&auto=format&fit=crop",
        readTime: "8 min",
        date: "2024-12-23"
    },
    {
        slug: "best-airport-lounges-world",
        title: "Best Airport Lounges in the World",
        excerpt: "The lounges worth arriving early for—from Singapore to Istanbul.",
        category: "Luxury & Lifestyle",
        image: "https://images.unsplash.com/photo-1583997052103-b4a1cb974ce5?q=80&w=2069&auto=format&fit=crop",
        readTime: "7 min",
        date: "2024-12-22"
    },
    {
        slug: "destination-wedding-planning-guide",
        title: "How to Plan a Destination Wedding",
        excerpt: "From venue scouting to guest logistics—your complete destination wedding playbook.",
        category: "Luxury & Lifestyle",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
        readTime: "10 min",
        date: "2024-12-21"
    }
]
