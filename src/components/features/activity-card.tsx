"use client"

import { ViatorActivity } from "@/lib/viator"
import { Star, Clock, Sparkles } from "lucide-react"

interface ActivityCardProps {
    activity: ViatorActivity
}

export function ViatorActivityCard({ activity }: ActivityCardProps) {
    return (
        <a
            href={activity.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300"
        >
            <div className="flex flex-col sm:flex-row h-full">
                {/* Image */}
                <div className="relative w-full sm:w-1/3 aspect-video sm:aspect-auto overflow-hidden">
                    <img
                        src={activity.images[0]?.url}
                        alt={activity.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-medium text-white flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {activity.duration}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                                {activity.title}
                            </h3>
                            <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold whitespace-nowrap bg-yellow-400/10 px-1.5 py-0.5 rounded">
                                <Star className="w-3 h-3 fill-yellow-400" />
                                {activity.rating.average}
                                <span className="text-white/40 font-normal ml-0.5">
                                    ({activity.rating.count})
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-white/60 line-clamp-2 mb-3">
                            {activity.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {activity.features.slice(0, 2).map((feature, i) => (
                                <span key={i} className="text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                        <div className="text-xs text-white/40">From Viator</div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">
                                {activity.price.formatted}
                            </span>
                            <span className="text-xs font-medium bg-white text-black px-3 py-1.5 rounded-full group-hover:bg-emerald-400 transition-colors">
                                Book Now
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    )
}
