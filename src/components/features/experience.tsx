"use client"

import { motion } from "framer-motion"
import { Sparkles, Globe, CreditCard, CheckCircle } from "lucide-react"

const features = [
    {
        icon: Sparkles,
        title: "1. You Dream",
        description: "Tell AI your desires. 'A week in Tuscany, under $5k, wine focused.'",
        color: "text-yellow-400"
    },
    {
        icon: Globe,
        title: "2. We Plan",
        description: "SafarAI builds a minute-by-minute itinerary, tailored to your pace.",
        color: "text-blue-400"
    },
    {
        icon: CreditCard,
        title: "3. We Book",
        description: "Flights, hotels, and dinners reserved instantly. One click, done.",
        color: "text-purple-400"
    }
]

export function Experience() {
    return (
        <section id="experience" className="py-32 bg-neutral-900 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-sm uppercase tracking-widest text-white/50 mb-4 block"
                    >
                        How It Works
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        Autonomous Travel, <br />
                        <span className="text-white/30">Redefined.</span>
                    </motion.h2>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg">
                        Forget 20 open tabs. SafarAI is the first agentic travel concierge that handles the logistics, so you can focus on the journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="relative pt-8 group"
                        >
                            {/* Dot on line */}
                            <div className="hidden md:block absolute top-[43px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-neutral-900 border-2 border-white/20 group-hover:border-white group-hover:bg-white transition-colors z-10" />

                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors h-full text-center">
                                <div className={`inline-flex p-4 rounded-xl bg-white/5 mb-6 ${feature.color} mb-6`}>
                                    <feature.icon className="size-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-white/60 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badges */}
                <div className="mt-32 pt-16 border-t border-white/10 flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {['Expedia', 'Marriott', 'Emirates', 'Uber'].map((brand) => (
                        <span key={brand} className="text-xl font-serif text-white/60 font-bold tracking-widest uppercase">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}
