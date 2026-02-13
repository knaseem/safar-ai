"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users, ThumbsUp, ThumbsDown, Heart, MessageCircle,
    Lock, Send, Link2, Copy, CheckCircle, Share2,
    Plane, Building2, Calendar, MapPin, Crown, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CollaborationPageProps {
    tripId: string
}

interface TripOption {
    id: string
    type: "destination" | "hotel" | "activity" | "date" | "flight"
    title: string
    subtitle?: string
    image?: string
    votes: { up: string[]; down: string[]; heart: string[] }
    locked: boolean
    comments: { user: string; text: string; timestamp: number }[]
}

interface Collaborator {
    id: string
    name: string
    avatar?: string
    color: string
    isOwner: boolean
}

const AVATAR_COLORS = [
    "bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500",
    "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-orange-500",
]

// Demo data for when the page loads without a real trip
const DEMO_OPTIONS: TripOption[] = [
    {
        id: "opt1", type: "destination", title: "Tokyo, Japan", subtitle: "Cherry blossom season",
        votes: { up: ["owner"], down: [], heart: ["owner"] }, locked: false,
        comments: [{ user: "owner", text: "Always wanted to go here! 🌸", timestamp: Date.now() - 86400000 }]
    },
    {
        id: "opt2", type: "destination", title: "Barcelona, Spain", subtitle: "Mediterranean vibes",
        votes: { up: [], down: [], heart: [] }, locked: false, comments: []
    },
    {
        id: "opt3", type: "hotel", title: "Park Hyatt Tokyo", subtitle: "Lost in Translation vibes ✨",
        votes: { up: ["owner"], down: [], heart: [] }, locked: false, comments: []
    },
    {
        id: "opt4", type: "hotel", title: "W Barcelona", subtitle: "Beachfront luxury",
        votes: { up: [], down: [], heart: [] }, locked: false, comments: []
    },
    {
        id: "opt5", type: "activity", title: "Cooking Class", subtitle: "Local cuisine experience",
        votes: { up: [], down: [], heart: [] }, locked: false, comments: []
    },
    {
        id: "opt6", type: "activity", title: "City Bike Tour", subtitle: "Explore the streets",
        votes: { up: [], down: [], heart: [] }, locked: false, comments: []
    },
]

export default function CollaboratePage({ params }: { params: Promise<{ id: string }> }) {
    const [tripId, setTripId] = useState<string>("")
    const [userName, setUserName] = useState("")
    const [isJoined, setIsJoined] = useState(false)
    const [options, setOptions] = useState<TripOption[]>(DEMO_OPTIONS)
    const [collaborators, setCollaborators] = useState<Collaborator[]>([
        { id: "owner", name: "Trip Owner", color: AVATAR_COLORS[0], isOwner: true }
    ])
    const [commentText, setCommentText] = useState<Record<string, string>>({})
    const [activeComment, setActiveComment] = useState<string | null>(null)

    useEffect(() => {
        params.then(p => setTripId(p.id))
    }, [params])

    const handleJoin = () => {
        if (!userName.trim()) return
        const newCollab: Collaborator = {
            id: `user-${Date.now()}`,
            name: userName.trim(),
            color: AVATAR_COLORS[collaborators.length % AVATAR_COLORS.length],
            isOwner: false,
        }
        setCollaborators(prev => [...prev, newCollab])
        setIsJoined(true)
        toast.success(`Welcome, ${userName}! 🎉`)
    }

    const handleVote = (optionId: string, voteType: "up" | "down" | "heart") => {
        if (!isJoined) return
        setOptions(prev => prev.map(opt => {
            if (opt.id !== optionId || opt.locked) return opt
            const userId = userName
            const votes = { ...opt.votes }
            // Toggle vote
            if (votes[voteType].includes(userId)) {
                votes[voteType] = votes[voteType].filter(v => v !== userId)
            } else {
                votes[voteType] = [...votes[voteType], userId]
                // Remove from opposite vote if voting up/down
                if (voteType === "up") votes.down = votes.down.filter(v => v !== userId)
                if (voteType === "down") votes.up = votes.up.filter(v => v !== userId)
            }
            return { ...opt, votes }
        }))
    }

    const handleAddComment = (optionId: string) => {
        const text = commentText[optionId]?.trim()
        if (!text || !isJoined) return
        setOptions(prev => prev.map(opt => {
            if (opt.id !== optionId) return opt
            return {
                ...opt,
                comments: [...opt.comments, { user: userName, text, timestamp: Date.now() }]
            }
        }))
        setCommentText(prev => ({ ...prev, [optionId]: "" }))
    }

    const handleCopyLink = () => {
        const url = window.location.href
        navigator.clipboard.writeText(url)
        toast.success("Collaboration link copied! Share it with your travel buddies 🔗")
    }

    const typeIcon: Record<string, any> = {
        destination: MapPin,
        hotel: Building2,
        activity: Sparkles,
        date: Calendar,
        flight: Plane,
    }

    if (!isJoined) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="relative w-full max-w-sm bg-neutral-900/95 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl"
                >
                    <div className="size-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="size-8 text-emerald-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">Group Trip Planning</h1>
                    <p className="text-sm text-white/40 mb-6">
                        You&apos;ve been invited to plan a trip together! Enter your name to join.
                    </p>

                    <input
                        type="text"
                        placeholder="Your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/30 mb-4"
                    />

                    <Button
                        onClick={handleJoin}
                        disabled={!userName.trim()}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-5 rounded-xl"
                    >
                        Join Trip Planning
                    </Button>

                    <p className="text-[10px] text-white/20 mt-4">No account needed — just enter your name</p>
                </motion.div>
            </div>
        )
    }

    // Group options by type
    const grouped = useMemo(() => {
        const groups: Record<string, TripOption[]> = {}
        options.forEach(opt => {
            if (!groups[opt.type]) groups[opt.type] = []
            groups[opt.type].push(opt)
        })
        return groups
    }, [options])

    return (
        <div className="min-h-screen bg-black">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-3xl mx-auto px-4 pt-24 pb-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Trip Planning Board</h1>
                            <p className="text-sm text-white/40">Vote on options to decide together</p>
                        </div>
                        <Button
                            onClick={handleCopyLink}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/10 gap-2"
                        >
                            <Share2 className="size-4" />
                            Share Link
                        </Button>
                    </div>

                    {/* Collaborators */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mr-1">Team:</span>
                        {collaborators.map((c, i) => (
                            <div
                                key={c.id}
                                className={cn(
                                    "size-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-black",
                                    c.color
                                )}
                                title={c.name}
                            >
                                {c.name.charAt(0).toUpperCase()}
                                {c.isOwner && (
                                    <Crown className="size-2.5 text-amber-400 absolute -top-1 -right-1" />
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Options by Category */}
                {Object.entries(grouped).map(([type, opts], gi) => {
                    const TypeIcon = typeIcon[type] || MapPin
                    return (
                        <motion.div
                            key={type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: gi * 0.1 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <TypeIcon className="size-4 text-white/30" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider capitalize">{type}s</h2>
                            </div>

                            <div className="space-y-3">
                                {opts.map((option) => {
                                    const totalScore = option.votes.up.length - option.votes.down.length + option.votes.heart.length * 2
                                    return (
                                        <div
                                            key={option.id}
                                            className={cn(
                                                "bg-white/5 border rounded-2xl overflow-hidden transition-all",
                                                option.locked ? "border-amber-500/30 bg-amber-500/5" : "border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-bold text-white">{option.title}</h3>
                                                            {option.locked && (
                                                                <Lock className="size-3 text-amber-400" />
                                                            )}
                                                        </div>
                                                        {option.subtitle && (
                                                            <p className="text-xs text-white/40 mt-0.5">{option.subtitle}</p>
                                                        )}
                                                    </div>

                                                    {/* Score */}
                                                    <div className={cn(
                                                        "px-2.5 py-1 rounded-lg text-xs font-bold",
                                                        totalScore > 0 ? "bg-emerald-500/10 text-emerald-400" :
                                                            totalScore < 0 ? "bg-red-500/10 text-red-400" :
                                                                "bg-white/5 text-white/30"
                                                    )}>
                                                        {totalScore > 0 ? `+${totalScore}` : totalScore}
                                                    </div>
                                                </div>

                                                {/* Vote Buttons */}
                                                <div className="flex items-center gap-2 mt-3">
                                                    <VoteButton
                                                        icon={ThumbsUp}
                                                        count={option.votes.up.length}
                                                        active={option.votes.up.includes(userName)}
                                                        color="emerald"
                                                        onClick={() => handleVote(option.id, "up")}
                                                        disabled={option.locked}
                                                    />
                                                    <VoteButton
                                                        icon={ThumbsDown}
                                                        count={option.votes.down.length}
                                                        active={option.votes.down.includes(userName)}
                                                        color="red"
                                                        onClick={() => handleVote(option.id, "down")}
                                                        disabled={option.locked}
                                                    />
                                                    <VoteButton
                                                        icon={Heart}
                                                        count={option.votes.heart.length}
                                                        active={option.votes.heart.includes(userName)}
                                                        color="pink"
                                                        onClick={() => handleVote(option.id, "heart")}
                                                        disabled={option.locked}
                                                    />

                                                    <div className="flex-1" />

                                                    {/* Comment Toggle */}
                                                    <button
                                                        onClick={() => setActiveComment(activeComment === option.id ? null : option.id)}
                                                        className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition-colors"
                                                    >
                                                        <MessageCircle className="size-3.5" />
                                                        {option.comments.length > 0 && <span>{option.comments.length}</span>}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Comments Section */}
                                            <AnimatePresence>
                                                {activeComment === option.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-white/5 overflow-hidden"
                                                    >
                                                        <div className="p-3 space-y-2">
                                                            {option.comments.map((c, i) => (
                                                                <div key={i} className="flex items-start gap-2">
                                                                    <div className="size-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-white shrink-0 mt-0.5">
                                                                        {c.user.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-white/50">{c.user}</span>
                                                                        <p className="text-xs text-white/40">{c.text}</p>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {/* Add Comment */}
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Add a comment..."
                                                                    value={commentText[option.id] || ""}
                                                                    onChange={(e) => setCommentText(prev => ({ ...prev, [option.id]: e.target.value }))}
                                                                    onKeyDown={(e) => e.key === "Enter" && handleAddComment(option.id)}
                                                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/30"
                                                                />
                                                                <button
                                                                    onClick={() => handleAddComment(option.id)}
                                                                    className="size-7 rounded-lg bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                                                                >
                                                                    <Send className="size-3 text-emerald-400" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

function VoteButton({ icon: Icon, count, active, color, onClick, disabled }: {
    icon: any; count: number; active: boolean; color: string; onClick: () => void; disabled: boolean
}) {
    const colors: Record<string, { active: string; inactive: string }> = {
        emerald: { active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", inactive: "bg-white/5 text-white/30 border-white/5" },
        red: { active: "bg-red-500/20 text-red-400 border-red-500/30", inactive: "bg-white/5 text-white/30 border-white/5" },
        pink: { active: "bg-pink-500/20 text-pink-400 border-pink-500/30", inactive: "bg-white/5 text-white/30 border-white/5" },
    }
    const c = colors[color] || colors.emerald

    return (
        <motion.button
            whileTap={!disabled ? { scale: 0.9 } : undefined}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                active ? c.active : c.inactive,
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <Icon className="size-3.5" />
            {count > 0 && <span>{count}</span>}
        </motion.button>
    )
}
