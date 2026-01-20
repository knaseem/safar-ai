import Link from "next/link"
import { Sparkles, Clock, ArrowRight } from "lucide-react"
import { blogPosts } from "@/lib/blog-data"
import { Navbar } from "@/components/layout/navbar"

export const metadata = {
    title: "Travel Blog | SafarAI",
    description: "Discover expert travel guides, tips, and inspiration for your next adventure. From halal travel to luxury escapes.",
}

export default function BlogPage() {
    const featuredPosts = blogPosts.filter(post => post.featured)
    const regularPosts = blogPosts.filter(post => !post.featured)
    const categories = ["All", "Destinations", "Travel Tips", "Halal Travel", "Luxury & Lifestyle"]

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-16 px-6">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-black" />
                <div className="container mx-auto relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="size-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400 uppercase tracking-widest font-medium">Travel Journal</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        The SafarAI Blog
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl">
                        Expert guides, insider tips, and inspiration for the modern traveler.
                    </p>
                </div>
            </section>

            {/* Featured Posts */}
            <section className="px-6 pb-16">
                <div className="container mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Featured Stories</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 hover:border-emerald-500/50 transition-all duration-300"
                            >
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                            {post.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-white/40 text-xs">
                                            <Clock className="size-3" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Posts */}
            <section className="px-6 pb-24">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">All Articles</h2>
                        <span className="text-white/40 text-sm">{blogPosts.length} articles</span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {regularPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group"
                            >
                                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-neutral-900">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                    <span className="text-white/30">•</span>
                                    <span className="text-white/40 text-xs">{post.readTime} read</span>
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
                                    {post.title}
                                </h3>
                                <p className="text-white/50 text-sm line-clamp-2">
                                    {post.excerpt}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 pb-24">
                <div className="container mx-auto">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 border border-white/10 p-12 text-center">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Plan Your Trip?
                            </h2>
                            <p className="text-white/60 mb-8 max-w-xl mx-auto">
                                Let SafarAI's AI create your perfect personalized itinerary in seconds.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
                            >
                                Plan My Trip
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 px-6">
                <div className="container mx-auto text-center text-white/40 text-sm">
                    © 2025 SafarAI. All rights reserved.
                </div>
            </footer>
        </main>
    )
}
