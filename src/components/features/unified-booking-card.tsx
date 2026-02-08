"use client"

import { useState } from "react"
import { UnifiedBooking } from "@/types/booking"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Hotel, Calendar, MapPin, Link as LinkIcon, Edit2, Check, X, Loader2, Trash2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface UnifiedBookingCardProps {
    booking: UnifiedBooking
    trips: { id: string, name: string }[]
    onUpdate: (updated: Partial<UnifiedBooking>) => void
    onDelete: () => void
}

export function UnifiedBookingCard({ booking, trips, onUpdate, onDelete }: UnifiedBookingCardProps) {
    const [isRenaming, setIsRenaming] = useState(false)
    const [tempLabel, setTempLabel] = useState(booking.label || "")
    const [loadingLink, setLoadingLink] = useState(false)
    const [loadingRename, setLoadingRename] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)

    async function handleLinkTrip(tripId: string) {
        setLoadingLink(true)
        try {
            const res = await fetch('/api/bookings/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: booking.id,
                    source: booking.source,
                    tripId: tripId === 'none' ? null : tripId
                })
            })

            if (!res.ok) throw new Error("Failed to link trip")

            const tripName = tripId === 'none' ? undefined : trips.find(t => t.id === tripId)?.name
            onUpdate({ tripId: tripId === 'none' ? undefined : tripId, tripName })
            toast.success(tripId === 'none' ? "Booking unlinked" : `Linked to ${tripName}`)
        } catch (error) {
            toast.error("Failed to update trip link")
        } finally {
            setLoadingLink(false)
        }
    }

    async function handleRename() {
        setLoadingRename(true)
        try {
            const res = await fetch('/api/bookings/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: booking.id,
                    source: booking.source,
                    label: tempLabel
                })
            })

            if (!res.ok) throw new Error("Failed to rename")

            onUpdate({ label: tempLabel })
            setIsRenaming(false)
            toast.success("Booking renamed")
        } catch (error) {
            toast.error("Failed to rename booking")
        } finally {
            setLoadingRename(false)
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to remove this booking? This cannot be undone.")) return

        setLoadingDelete(true)
        try {
            const res = await fetch('/api/bookings/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: booking.id,
                    source: booking.source
                })
            })

            if (!res.ok) throw new Error("Failed to delete")

            onDelete()
            toast.success("Booking removed")
        } catch (error) {
            toast.error("Failed to remove booking")
        } finally {
            setLoadingDelete(false)
        }
    }

    const TypeIcon = booking.type === 'flight' ? Plane
        : booking.type === 'hotel' ? Hotel
            : MapPin

    return (
        <Card className="relative bg-neutral-900 border-white/10 hover:border-emerald-500/30 transition-all group">
            <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Left: Icon & Info */}
                    <div className="flex gap-4 flex-1">
                        <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${booking.type === 'flight' ? "bg-blue-500/10 text-blue-400"
                            : booking.type === 'hotel' ? "bg-purple-500/10 text-purple-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                            <TypeIcon className="size-6" />
                        </div>

                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant="outline" className={`uppercase text-[10px] tracking-wider border-0 ${booking.status === 'confirmed' || booking.status === 'booked' ? 'bg-emerald-500/10 text-emerald-500'
                                    : booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400'
                                        : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {booking.status}
                                </Badge>
                                {booking.source === 'import' && (
                                    <Badge variant="outline" className="bg-white/5 text-white/40 border-0 text-[10px]">
                                        Imported
                                    </Badge>
                                )}
                                <span className="text-white/30 text-xs font-mono">
                                    #{booking.bookingReference || booking.id.slice(0, 8)}
                                </span>
                            </div>

                            {/* Title / Rename View */}
                            {isRenaming ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={tempLabel}
                                        onChange={(e) => setTempLabel(e.target.value)}
                                        className="h-8 bg-black/50 border-white/10 text-white w-full max-w-[200px]"
                                        placeholder="Name this booking..."
                                        autoFocus
                                    />
                                    <Button size="icon" variant="ghost" className="size-8 text-emerald-400 hover:bg-emerald-500/10" onClick={handleRename} disabled={loadingRename}>
                                        {loadingRename ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="size-8 text-red-400 hover:bg-red-500/10" onClick={() => setIsRenaming(false)}>
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group/title">
                                    <h3 className="text-lg font-bold text-white">
                                        {booking.label || booking.details.title}
                                    </h3>
                                    <button
                                        onClick={() => { setTempLabel(booking.label || booking.details.title); setIsRenaming(true); }}
                                        className="opacity-0 group-hover/title:opacity-100 transition-opacity text-white/20 hover:text-white"
                                    >
                                        <Edit2 className="size-3" />
                                    </button>
                                </div>
                            )}

                            {!isRenaming && (
                                <button
                                    onClick={handleDelete}
                                    disabled={loadingDelete}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 absolute right-4 top-4"
                                    title="Remove Booking"
                                >
                                    {loadingDelete ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                </button>
                            )}

                            <p className="text-white/50 text-sm">
                                {booking.label ? booking.details.title : booking.details.subtitle}
                            </p>

                            <div className="flex items-center gap-4 text-white/40 text-xs pt-1">
                                {booking.details.date && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3" />
                                        {new Date(booking.details.date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions & Metadata */}
                    <div className="flex flex-col items-end gap-3 min-w-[200px]">
                        {booking.details.price && (
                            <div className="text-right">
                                <p className="text-xs text-white/40 uppercase tracking-wider">Total</p>
                                <p className="text-lg font-bold text-white">
                                    {booking.details.currency} {parseFloat(booking.details.price).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {/* Trip Link Dropdown */}
                        <div className="w-full">
                            <Select
                                value={booking.tripId || "none"}
                                onValueChange={handleLinkTrip}
                                disabled={loadingLink}
                            >
                                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white/70 h-8 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                        <LinkIcon className="size-3 shrink-0" />
                                        <span className="truncate">
                                            {booking.tripName ? `Linked: ${booking.tripName}` : "Assign to Trip..."}
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-white/10">
                                    <SelectItem value="none" className="text-white/50">No Trip (Unlinked)</SelectItem>
                                    {trips.map(trip => (
                                        <SelectItem key={trip.id} value={trip.id} className="text-white">
                                            {trip.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
