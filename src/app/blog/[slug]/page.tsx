import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, Share2, Sparkles } from "lucide-react"
import { blogPosts, BlogPost } from "@/lib/blog-data"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"

interface Props {
    params: { slug: string }
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }))
}

export async function generateMetadata({ params }: Props) {
    const post = blogPosts.find((p) => p.slug === params.slug)
    if (!post) return { title: "Not Found" }

    return {
        title: `${post.title} | SafarAI Blog`,
        description: post.excerpt,
    }
}

// Simple content generator based on post data
function generateArticleContent(post: BlogPost): string[] {
    const intros: Record<string, string> = {
        "Destinations": `Planning a trip to experience ${post.title.split(':')[0]}? You're in for an unforgettable adventure. This comprehensive guide covers everything you need to know—from must-see attractions to hidden gems that only locals know about.`,
        "Travel Tips": `${post.excerpt} Whether you're a seasoned traveler or just getting started, these insights will transform how you approach your next journey.`,
        "Halal Travel": `Traveling as a Muslim comes with unique considerations, and ${post.title.split(':')[0]} has evolved to become one of the most welcoming destinations for halal-conscious travelers. Here's your complete guide.`,
        "Luxury & Lifestyle": `For those who appreciate the finer things in travel, ${post.title.split(':')[0]} represents the pinnacle of sophisticated exploration. Here's how to experience it in style.`,
    }

    return [
        intros[post.category] || post.excerpt,

        `## Why ${post.title.split(':')[0]}?\n\nThere's something magical about discovering a place that speaks to your soul. ${post.excerpt} The key is knowing where to look and how to make the most of your time.`,

        `## Best Time to Visit\n\nTiming can make or break any trip. For this destination, consider the shoulder seasons—you'll enjoy smaller crowds, better prices, and often the most pleasant weather. Peak season has its advantages too, with more events and activities, but book well in advance.`,

        `## Getting There\n\nMost major airlines offer convenient connections. Look for deals 6-8 weeks before your departure date, and consider flying mid-week for the best fares. Premium economy offers a great balance of comfort and value for longer flights.`,

        `## Where to Stay\n\nAccommodation options range from boutique hotels to luxury resorts. For the best experience, consider staying in a central location that puts you within walking distance of major attractions. Many properties offer special packages that include breakfast and local experiences.`,

        `## Must-Do Experiences\n\n1. **Explore like a local** - Skip the tourist traps and discover neighborhood gems\n2. **Taste the authentic cuisine** - Food tells the story of a place\n3. **Capture the moments** - The best photos are often at sunrise or sunset\n4. **Connect with the culture** - Learn a few local phrases, they go a long way`,

        `## Travel Tips\n\n- Download offline maps before you go\n- Always carry a portable charger\n- Book popular restaurants and experiences in advance\n- Leave room in your itinerary for spontaneous discoveries`,

        `## Budget Considerations\n\nExpect to spend moderately for a comfortable experience. Splurge on one or two special experiences that will become lasting memories—whether that's a sunset dinner, a spa day, or a private tour.`,

        `## Final Thoughts\n\nEvery journey begins with a single step—or in this case, a well-planned itinerary. ${post.excerpt} Ready to make it happen? SafarAI can create a personalized itinerary tailored to your preferences in seconds.`
    ]
}

export default function BlogArticlePage({ params }: Props) {
    const post = blogPosts.find((p) => p.slug === params.slug)

    if (!post) {
        notFound()
    }

    const content = generateArticleContent(post)
    const relatedPosts = blogPosts
        .filter((p) => p.category === post.category && p.slug !== post.slug)
        .slice(0, 3)

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-24">
                <div className="aspect-[21/9] max-h-[500px] overflow-hidden">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10 -mt-32">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Blog
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-white/50 text-sm">
                            <Clock className="size-4" />
                            {post.readTime} read
                        </span>
                        <span className="flex items-center gap-1 text-white/50 text-sm">
                            <Calendar className="size-4" />
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mb-6">
                        {post.title}
                    </h1>

                    <p className="text-xl text-white/70 max-w-3xl">
                        {post.excerpt}
                    </p>
                </div>
            </section>

            {/* Article Content */}
            <article className="container mx-auto px-6 py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="prose prose-invert prose-lg prose-emerald max-w-none">
                        {content.map((section, index) => (
                            <div key={index} className="mb-8">
                                {section.split('\n').map((line, lineIndex) => {
                                    if (line.startsWith('## ')) {
                                        return <h2 key={lineIndex} className="text-2xl font-bold text-white mt-12 mb-4">{line.replace('## ', '')}</h2>
                                    } else if (line.startsWith('1. ') || line.startsWith('- ')) {
                                        return <li key={lineIndex} className="text-white/70 mb-2 ml-6">{line.replace(/^[0-9]+\. |\*\*|^- /g, '').replace(/\*\*/g, '')}</li>
                                    } else if (line.trim()) {
                                        return <p key={lineIndex} className="text-white/70 leading-relaxed mb-4">{line}</p>
                                    }
                                    return null
                                })}
                            </div>
                        ))}
                    </div>

                    {/* CTA Box */}
                    <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-white/10 text-center">
                        <Sparkles className="size-8 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Ready to Plan Your Trip?</h3>
                        <p className="text-white/60 mb-6">Let SafarAI create your perfect personalized itinerary in seconds.</p>
                        <Link href="/">
                            <Button variant="premium" size="lg">
                                Plan My Trip Now
                            </Button>
                        </Link>
                    </div>

                    {/* Share */}
                    <div className="flex items-center justify-center gap-4 mt-12 pt-12 border-t border-white/10">
                        <span className="text-white/50">Share this article</span>
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                            <Share2 className="size-5" />
                        </button>
                    </div>
                </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="container mx-auto px-6 pb-24">
                    <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {relatedPosts.map((related) => (
                            <Link
                                key={related.slug}
                                href={`/blog/${related.slug}`}
                                className="group"
                            >
                                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-neutral-900">
                                    <img
                                        src={related.image}
                                        alt={related.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                    {related.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 px-6">
                <div className="container mx-auto text-center text-white/40 text-sm">
                    © 2025 SafarAI. All rights reserved.
                </div>
            </footer>
        </main>
    )
}
