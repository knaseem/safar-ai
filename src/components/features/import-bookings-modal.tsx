"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Upload, Loader2, CheckCircle, AlertCircle, Copy, Plane, Hotel, Train, Ticket, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ImportBookingsModalProps {
    isOpen: boolean
    onClose: () => void
    onImportSuccess?: () => void
    userImportEmail?: string
}

interface ParsedBooking {
    type: 'flight' | 'hotel' | 'train' | 'activity'
    confirmationNumber: string
    provider: string
    startDate: string
    endDate?: string
    location: { city: string; country?: string }
    details: {
        origin?: string
        destination?: string
        airline?: string
        flightNumber?: string | string[]
        departureTime?: string
        arrivalTime?: string
        passengers?: string[]
        hotelName?: string
        roomType?: string
        activityName?: string
    }
    price?: number
    currency?: string
    priceRaw?: string
}

export function ImportBookingsModal({ isOpen, onClose, onImportSuccess, userImportEmail }: ImportBookingsModalProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'forward'>('paste')
    const [emailContent, setEmailContent] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [savedTripId, setSavedTripId] = useState<string | null>(null)
    const [result, setResult] = useState<{
        success: boolean
        message: string
        bookings: ParsedBooking[]
    } | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleParse = async (save: boolean = false) => {
        if (!emailContent.trim()) {
            toast.error("Please paste your confirmation email")
            return
        }

        setIsLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/email/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailContent,
                    saveToTrips: save
                })
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to parse email")
                return
            }

            setResult({
                success: data.success,
                message: data.message,
                bookings: data.bookings || []
            })

            if (data.success && data.bookings?.length > 0) {
                if (save) {
                    toast.success("Bookings imported successfully!")
                    onImportSuccess?.()
                }
            } else {
                toast.warning(data.message || "No bookings found")
            }
        } catch (error) {
            toast.error("Failed to process email")
        } finally {
            setIsLoading(false)
        }
    }

    const copyForwardAddress = () => {
        if (userImportEmail) {
            navigator.clipboard.writeText(userImportEmail)
            toast.success("Email address copied!")
        }
    }

    const handleClose = () => {
        setEmailContent('')
        setSelectedFile(null)
        setResult(null)
        setSavedTripId(null)
        onClose()
    }

    const handleFileSelect = (file: File) => {
        if (!file.type.includes('pdf')) {
            toast.error("Please select a PDF file")
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("PDF must be under 5MB")
            return
        }
        setSelectedFile(file)
        setResult(null)
    }

    const handleParsePdf = async (save: boolean = false) => {
        if (!selectedFile) {
            toast.error("Please select a PDF file")
            return
        }

        setIsLoading(true)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('saveToTrips', save.toString())

            const res = await fetch('/api/email/parse-pdf', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to parse PDF")
                return
            }

            setResult({
                success: data.success,
                message: data.message,
                bookings: data.bookings || []
            })

            if (data.success && data.bookings?.length > 0) {
                toast.success(`Found ${data.bookings.length} booking(s)!`)
                if (save && data.savedTripId) {
                    setSavedTripId(data.savedTripId)
                    toast.success("Bookings imported successfully!")
                    onImportSuccess?.()
                }
            } else {
                toast.warning(data.message || "No bookings found")
            }
        } catch (error) {
            toast.error("Failed to process PDF")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileSelect(file)
    }

    const getBookingIcon = (type: string) => {
        switch (type) {
            case 'flight': return <Plane className="size-4" />
            case 'hotel': return <Hotel className="size-4" />
            case 'train': return <Train className="size-4" />
            default: return <Ticket className="size-4" />
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div>
                            <h2 className="text-xl font-bold text-white">Import Bookings</h2>
                            <p className="text-sm text-white/60 mt-1">Add your existing reservations to your trip</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="size-5 text-white/60" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('paste')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'paste'
                                ? 'text-white border-b-2 border-emerald-500'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <Upload className="size-4 inline-block mr-2" />
                            Paste
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'upload'
                                ? 'text-white border-b-2 border-emerald-500'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <FileText className="size-4 inline-block mr-2" />
                            Upload PDF
                        </button>
                        <button
                            onClick={() => setActiveTab('forward')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'forward'
                                ? 'text-white border-b-2 border-emerald-500'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <Mail className="size-4 inline-block mr-2" />
                            Forward
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[50vh]">
                        {activeTab === 'paste' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Paste your confirmation email here
                                    </label>
                                    <textarea
                                        ref={textareaRef}
                                        value={emailContent}
                                        onChange={e => setEmailContent(e.target.value)}
                                        placeholder="Copy and paste the full email content from your booking confirmation..."
                                        className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none resize-none"
                                    />
                                </div>

                                {/* Results */}
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-xl border ${result.success
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-amber-500/10 border-amber-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {result.success ? (
                                                <CheckCircle className="size-5 text-emerald-400 mt-0.5" />
                                            ) : (
                                                <AlertCircle className="size-5 text-amber-400 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <p className={`font-medium ${result.success ? 'text-emerald-300' : 'text-amber-300'}`}>
                                                    {result.message}
                                                </p>
                                                {result.bookings.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {result.bookings.map((booking, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-center gap-3 p-2 bg-black/20 rounded-lg"
                                                            >
                                                                <div className="p-1.5 rounded-md bg-white/10">
                                                                    {getBookingIcon(booking.type)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm text-white font-medium truncate">
                                                                        {booking.provider}
                                                                    </p>
                                                                    <p className="text-xs text-white/50">
                                                                        {booking.confirmationNumber} • {booking.location.city}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs text-white/40">
                                                                    {new Date(booking.startDate).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : activeTab === 'upload' ? (
                            <div className="space-y-4">
                                {/* Drop zone */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : selectedFile
                                            ? 'border-emerald-500/50 bg-emerald-500/5'
                                            : 'border-white/20 hover:border-white/40'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleFileSelect(file)
                                        }}
                                        className="hidden"
                                    />
                                    {selectedFile ? (
                                        <div className="space-y-2">
                                            <FileText className="size-10 text-emerald-400 mx-auto" />
                                            <p className="text-white font-medium">{selectedFile.name}</p>
                                            <p className="text-white/50 text-sm">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                                                className="text-xs text-white/40 hover:text-white underline"
                                            >
                                                Choose a different file
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <FileText className="size-10 text-white/40 mx-auto" />
                                            <p className="text-white/80">Drop your confirmation PDF here</p>
                                            <p className="text-white/40 text-sm">or click to browse</p>
                                        </div>
                                    )}
                                </div>

                                {/* Results */}
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-xl border ${result.success
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-amber-500/10 border-amber-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {result.success ? (
                                                <CheckCircle className="size-5 text-emerald-400 mt-0.5" />
                                            ) : (
                                                <AlertCircle className="size-5 text-amber-400 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <p className={`font-medium ${result.success ? 'text-emerald-300' : 'text-amber-300'}`}>
                                                    {result.message}
                                                </p>
                                                {result.bookings.length > 0 && (
                                                    <div className="mt-3 space-y-3">
                                                        {result.bookings.map((booking, i) => (
                                                            <div
                                                                key={i}
                                                                className="p-3 bg-black/30 rounded-xl border border-white/10"
                                                            >
                                                                {/* Header with provider and price */}
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1.5 rounded-md bg-emerald-500/20">
                                                                            {getBookingIcon(booking.type)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-white font-medium">
                                                                                {booking.provider}
                                                                            </p>
                                                                            <p className="text-xs text-white/50">
                                                                                PNR: {booking.confirmationNumber}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {booking.price && (
                                                                        <div className="text-right">
                                                                            <p className="text-emerald-400 font-semibold">
                                                                                {booking.currency || 'USD'} {booking.price.toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Flight route */}
                                                                {booking.type === 'flight' && booking.details?.origin && (
                                                                    <div className="flex items-center gap-2 py-2 px-3 bg-white/5 rounded-lg text-sm">
                                                                        <span className="text-white/70">{booking.details.origin}</span>
                                                                        <span className="text-emerald-400">→</span>
                                                                        <span className="text-white">{booking.details.destination || booking.location.city}</span>
                                                                        {booking.details.flightNumber && (
                                                                            <span className="ml-auto text-xs text-white/40">
                                                                                {Array.isArray(booking.details.flightNumber)
                                                                                    ? booking.details.flightNumber.join(' / ')
                                                                                    : booking.details.flightNumber}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Hotel details */}
                                                                {booking.type === 'hotel' && booking.details?.hotelName && (
                                                                    <div className="py-2 px-3 bg-white/5 rounded-lg text-sm">
                                                                        <p className="text-white">{booking.details.hotelName}</p>
                                                                        {booking.details.roomType && (
                                                                            <p className="text-xs text-white/50">{booking.details.roomType}</p>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Date */}
                                                                <div className="mt-2 flex items-center justify-between text-xs text-white/40">
                                                                    <span>
                                                                        📅 {new Date(booking.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        {booking.endDate && booking.endDate !== booking.startDate && (
                                                                            <> - {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center py-6">
                                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
                                        <Mail className="size-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Forward Your Confirmations</h3>
                                    <p className="text-white/60 text-sm max-w-sm mx-auto">
                                        Forward any booking confirmation emails to your personal import address below
                                    </p>
                                </div>

                                {userImportEmail ? (
                                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                        <p className="text-xs text-white/50 mb-2">Your Import Email Address</p>
                                        <div className="flex items-center gap-3">
                                            <code className="flex-1 text-emerald-400 font-mono text-sm bg-emerald-500/10 px-3 py-2 rounded-lg truncate">
                                                {userImportEmail}
                                            </code>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={copyForwardAddress}
                                                className="shrink-0"
                                            >
                                                <Copy className="size-4 mr-2" />
                                                Copy
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                                        <p className="text-amber-300 text-sm">
                                            Email forwarding will be available soon. For now, use the paste or upload options.
                                        </p>
                                    </div>
                                )}

                                <div className="bg-black/20 rounded-xl p-4 space-y-3">
                                    <p className="text-sm font-medium text-white/80">Supported Booking Types</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-white/60">
                                        <div className="flex items-center gap-2">
                                            <Plane className="size-4" /> Airlines
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Hotel className="size-4" /> Hotels
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Train className="size-4" /> Trains
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Ticket className="size-4" /> Tours & Activities
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {(activeTab === 'paste' || activeTab === 'upload') && (
                        <div className="p-6 border-t border-white/10 flex gap-3">
                            {savedTripId ? (
                                // Success state with View Trip button
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setResult(null)
                                            setEmailContent('')
                                            setSelectedFile(null)
                                            setSavedTripId(null)
                                        }}
                                        className="flex-1"
                                    >
                                        Import Another
                                    </Button>
                                    <Button
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black"
                                        onClick={() => {
                                            handleClose()
                                            router.push(`/trips/${savedTripId}`)
                                        }}
                                    >
                                        <ArrowRight className="size-4 mr-2" />
                                        View Trip
                                    </Button>
                                </>
                            ) : result?.success && result.bookings.length > 0 ? (
                                // Parsed but not saved yet
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setResult(null)
                                            setEmailContent('')
                                            setSelectedFile(null)
                                        }}
                                        className="flex-1"
                                    >
                                        Parse Another
                                    </Button>
                                    <Button
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black"
                                        onClick={() => activeTab === 'paste' ? handleParse(true) : handleParsePdf(true)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="size-4 animate-spin mr-2" />
                                        ) : (
                                            <CheckCircle className="size-4 mr-2" />
                                        )}
                                        Save to My Trips
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleClose}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black"
                                        onClick={() => activeTab === 'paste' ? handleParse(false) : handleParsePdf(false)}
                                        disabled={isLoading || (activeTab === 'paste' ? !emailContent.trim() : !selectedFile)}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="size-4 animate-spin mr-2" />
                                        ) : (
                                            <Upload className="size-4 mr-2" />
                                        )}
                                        {activeTab === 'paste' ? 'Parse Email' : 'Parse PDF'}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence >
    )
}
