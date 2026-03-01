"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Download, Map as MapIcon, Plane, BookOpen, AlertTriangle, CheckCircle, WifiOff, Lock, X, Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface OfflineSurvivalKitProps {
    destination: string
    tripName: string
    onClose?: () => void
    itineraryDays?: any[]
}

type GenerationStep = {
    id: string
    label: string
    icon: any
    status: "pending" | "generating" | "completed"
}

type PersonalContact = {
    name: string
    relation: string
    phone: string
    email: string
}

export function OfflineSurvivalKit({ destination, tripName, onClose, itineraryDays }: OfflineSurvivalKitProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const [progress, setProgress] = useState(0)
    const [hasPassport, setHasPassport] = useState(false)
    const [showReminder, setShowReminder] = useState(false)
    const [isScanningPassport, setIsScanningPassport] = useState(false)
    const [isCameraOpen, setIsCameraOpen] = useState(false)
    const [passportImage, setPassportImage] = useState<string | null>(null)
    const [personalContacts, setPersonalContacts] = useState<PersonalContact[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const addContact = () => {
        if (personalContacts.length >= 3) return
        setPersonalContacts([...personalContacts, { name: '', relation: '', phone: '', email: '' }])
    }

    const updateContact = (index: number, field: keyof PersonalContact, value: string) => {
        const newContacts = [...personalContacts]
        newContacts[index][field] = value
        setPersonalContacts(newContacts)
    }

    const removeContact = (index: number) => {
        setPersonalContacts(personalContacts.filter((_, i) => i !== index))
    }

    useEffect(() => {
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    const [steps, setSteps] = useState<GenerationStep[]>([
        { id: "itinerary", label: "Encrypting Itinerary Data", icon: Plane, status: "pending" },
        { id: "maps", label: "Caching Local Maps & Routes", icon: MapIcon, status: "pending" },
        { id: "docs", label: "Securing Travel Documents", icon: Shield, status: "pending" },
        { id: "phrases", label: "Generating Emergency Phrases", icon: BookOpen, status: "pending" },
    ])

    const startGeneration = () => {
        setIsGenerating(true)
        setIsComplete(false)
        setProgress(0)

        // Reset steps
        setSteps(prev => prev.map(s => ({ ...s, status: "pending" })))

        let currentStepNum = 0
        const totalSteps = steps.length

        const interval = setInterval(() => {
            if (currentStepNum < totalSteps) {
                setSteps(prev => prev.map((step, idx) => {
                    if (idx < currentStepNum) return { ...step, status: "completed" }
                    if (idx === currentStepNum) return { ...step, status: "generating" }
                    return step
                }))
                setProgress(Math.floor((currentStepNum / totalSteps) * 100))
                currentStepNum++
            } else {
                clearInterval(interval)
                setSteps(prev => prev.map(s => ({ ...s, status: "completed" })))
                setProgress(100)
                setTimeout(() => setIsComplete(true), 800)
            }
        }, 1200) // 1.2s per step
    }

    const handleScanClick = () => {
        fileInputRef.current?.click()
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            setIsCameraOpen(true)
            // Need a slight delay to ensure videoRef is rendered
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play().catch(e => console.error("Video play error:", e))
                }
            }, 100)
        } catch (err) {
            toast.error("Camera access denied", { description: "Please allow camera access to scan your passport." })
            // fallback to file input if camera fails
            fileInputRef.current?.click()
        }
    }

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d')
            if (context) {
                const maxDim = 800
                let width = videoRef.current.videoWidth
                let height = videoRef.current.videoHeight
                if (width > height && width > maxDim) {
                    height = Math.round((height * maxDim) / width)
                    width = maxDim
                } else if (height > width && height > maxDim) {
                    width = Math.round((width * maxDim) / height)
                    height = maxDim
                }

                canvasRef.current.width = width
                canvasRef.current.height = height
                context.drawImage(videoRef.current, 0, 0, width, height)
                const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6)

                // stop stream
                const stream = videoRef.current.srcObject as MediaStream
                stream?.getTracks().forEach(track => track.stop())

                setPassportImage(imageDataUrl)
                setIsCameraOpen(false)
                setIsScanningPassport(true)
                setTimeout(() => {
                    setIsScanningPassport(false)
                    setHasPassport(true)
                }, 1000)
            }
        }
    }

    const cancelCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
        }
        setIsCameraOpen(false)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setIsScanningPassport(true)

            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    const img = new Image()
                    img.onload = () => {
                        const maxDim = 800
                        let width = img.width
                        let height = img.height
                        if (width > height && width > maxDim) {
                            height = Math.round((height * maxDim) / width)
                            width = maxDim
                        } else if (height > width && height > maxDim) {
                            width = Math.round((width * maxDim) / height)
                            height = maxDim
                        }
                        const canvas = document.createElement('canvas')
                        canvas.width = width
                        canvas.height = height
                        const ctx = canvas.getContext('2d')
                        ctx?.drawImage(img, 0, 0, width, height)
                        setPassportImage(canvas.toDataURL('image/jpeg', 0.6))
                    }
                    if (typeof reader.result === 'string') {
                        img.src = reader.result
                    }
                }
                reader.readAsDataURL(file)
            } else if (file.type === 'application/pdf') {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPassportImage(reader.result as string)
                }
                reader.readAsDataURL(file)
            }

            setTimeout(() => {
                setIsScanningPassport(false)
                setHasPassport(true)
            }, 2000)
        }
    }

    const handleDownload = () => {
        // Create the actual bundle content
        const bundleData = {
            tripName: tripName,
            destination: destination,
            generatedAt: new Date().toISOString(),
            securityNote: "This data is encrypted when stored within the Safar app securely.",
            emergencyPhrases: emergencyPhrases,
            emergencyContacts: getEmergencyInfo(destination),
            personalContacts: personalContacts,
            hasPassport: hasPassport,
            passportImageData: passportImage,
            itineraryDays: itineraryDays || [],
            mockItineraryPath: "Encrypted securely. Open in Safar app to view.",
            mockPdfs: "Encrypted securely. Open in Safar app to view."
        }

        try {
            // Store data locally to pass to the new tab
            localStorage.setItem('safar_offline_bundle', JSON.stringify(bundleData))

            // Open new tab
            window.open('/offline-bundle', '_blank')

            toast.success("Secure Bundle Opened", {
                description: "Your offline survival kit has been opened in a new tab."
            })

            setTimeout(() => {
                if (onClose) onClose()
            }, 1000)
        } catch (error) {
            console.error("Storage error:", error)
            toast.error("Bundle too large", {
                description: "The passport image is too large. Please upload a smaller file."
            })
        }
    }

    // Mock Emergency Phrases based on destination
    const emergencyPhrases = [
        { eng: "I need a doctor / hospital", trans: getTranslation("doctor", destination) },
        { eng: "Can you help me? It's an emergency.", trans: getTranslation("help", destination) },
        { eng: "Where is the embassy/consulate?", trans: getTranslation("embassy", destination) },
        { eng: "I have lost my passport.", trans: getTranslation("passport", destination) },
        { eng: "Hello", trans: getTranslation("hello", destination) },
        { eng: "Thank you", trans: getTranslation("thanks", destination) },
        { eng: "Excuse me / Sorry", trans: getTranslation("excuse", destination) },
        { eng: "Do you speak English?", trans: getTranslation("english", destination) },
        { eng: "Where is the bathroom?", trans: getTranslation("bathroom", destination) },
        { eng: "How much does this cost?", trans: getTranslation("cost", destination) },
        { eng: "I would like to order", trans: getTranslation("order", destination) },
        { eng: "Can I have the bill, please?", trans: getTranslation("bill", destination) },
        { eng: "Where is the train station / bus stop?", trans: getTranslation("transport", destination) },
        { eng: "I am lost", trans: getTranslation("lost", destination) },
        { eng: "Yes / No", trans: getTranslation("yesno", destination) },
        { eng: "Water, please", trans: getTranslation("water", destination) },
    ]

    return (
        <div className="relative bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-w-md w-full mx-auto">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-orange-500/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <WifiOff className="size-5 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Offline Survival Kit</h2>
                        <p className="text-xs text-white/50">Encrypted backup for {destination}</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <X className="size-5" />
                    </button>
                )}
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {!isGenerating && !isComplete ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6 text-center"
                        >
                            <div className="flex justify-center mb-4">
                                <Shield className="size-16 text-white/20" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold text-white mb-2">Prepare for the Unexpected</h3>
                                <p className="text-sm text-white/60">
                                    Generate a secure, encrypted bundle of your itinerary, maps, travel documents, and emergency phrases. This ensures you have crucial information even if you lose cellular data or WiFi in remote areas.
                                </p>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-left hidden sm:flex">
                                <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-200/80">
                                    This bundle is encrypted using AES-256 and can only be decrypted within the Safar App on your verified device.
                                </p>
                            </div>

                            {/* Passport Scanner Mock UI */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        Travel Documents
                                        {hasPassport && <CheckCircle className="size-4 text-emerald-500" />}
                                    </h4>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Optional</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,application/pdf,.pdf"
                                    onChange={handleFileSelect}
                                />
                                {isCameraOpen ? (
                                    <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden border border-white/20">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        <canvas ref={canvasRef} className="hidden" />

                                        <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-xl m-4 pointer-events-none border-dashed opacity-50"></div>

                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4 z-10 pb-2">
                                            <Button variant="ghost" onClick={cancelCamera} className="bg-black/50 hover:bg-black/70 text-white backdrop-blur flex-1 border border-white/10">
                                                Cancel
                                            </Button>
                                            <Button onClick={captureImage} className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1 font-bold shadow-lg">
                                                Capture
                                            </Button>
                                        </div>
                                    </div>
                                ) : isScanningPassport ? (
                                    <div className="w-full bg-white/5 border border-white/20 border-dashed py-6 rounded-xl flex flex-col items-center justify-center gap-4">
                                        <div className="relative w-20 h-14 border-2 border-emerald-500/30 rounded-md flex items-center justify-center overflow-hidden bg-emerald-500/5">
                                            <motion.div
                                                className="absolute left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.5)]"
                                                animate={{ top: ["0%", "100%", "0%"] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            />
                                            <Camera className="size-5 text-emerald-500/40" />
                                        </div>
                                        <p className="text-xs text-white/60 animate-pulse font-medium tracking-wide">SCANNING DOCUMENT...</p>
                                    </div>
                                ) : !hasPassport ? (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={startCamera}
                                            className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 border-dashed py-6"
                                        >
                                            <Camera className="size-4 mr-2" /> Scan
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleScanClick}
                                            className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 border-dashed py-6"
                                        >
                                            <Upload className="size-4 mr-2" /> Upload
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Shield className="size-4 text-emerald-500" />
                                            <span className="text-sm text-emerald-100">Passport Scanned</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setHasPassport(false)
                                            setPassportImage(null)
                                        }} className="h-6 px-2 text-xs text-white/50 hover:text-white">Remove</Button>
                                    </div>
                                )}
                            </div>

                            {/* Personal Emergency Contacts UI */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        Personal Contacts (ICE)
                                    </h4>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Optional</span>
                                </div>

                                {personalContacts.map((contact, idx) => (
                                    <div key={idx} className="relative bg-black/20 p-3 rounded-lg border border-white/5 space-y-2 text-left">
                                        <button onClick={() => removeContact(idx)} className="absolute top-2 right-2 p-1 text-white/40 hover:text-red-400 bg-black/40 rounded-full hover:bg-black/60 transition-colors">
                                            <X className="size-3" />
                                        </button>
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <input
                                                placeholder="Name (e.g. Jane Doe)"
                                                className="bg-transparent border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                                                value={contact.name}
                                                onChange={e => updateContact(idx, 'name', e.target.value)}
                                            />
                                            <input
                                                placeholder="Relation (e.g. Parent)"
                                                className="bg-transparent border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                                                value={contact.relation}
                                                onChange={e => updateContact(idx, 'relation', e.target.value)}
                                            />
                                            <input
                                                placeholder="Phone Number"
                                                className="bg-transparent border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                                                value={contact.phone}
                                                onChange={e => updateContact(idx, 'phone', e.target.value)}
                                            />
                                            <input
                                                placeholder="Email Address"
                                                className="bg-transparent border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 col-span-2"
                                                value={contact.email}
                                                onChange={e => updateContact(idx, 'email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {personalContacts.length < 3 && (
                                    <Button
                                        variant="outline"
                                        onClick={addContact}
                                        className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 border-dashed py-5 text-sm font-medium mt-1"
                                    >
                                        + Add Contact
                                    </Button>
                                )}
                            </div>

                            <Button
                                onClick={startGeneration}
                                className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 gap-2"
                            >
                                <Lock className="size-4" /> Generate Secure Bundle
                            </Button>
                        </motion.div>
                    ) : !isComplete ? (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-white">Bundling Secure Data</h3>
                                <p className="text-sm text-white/50">Please do not close the application.</p>
                            </div>

                            <div className="space-y-4">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex items-center gap-4">
                                        <div className={cn(
                                            "size-8 rounded-full flex items-center justify-center border transition-colors",
                                            step.status === "completed" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                                                step.status === "generating" ? "bg-blue-500/20 border-blue-500/50 text-blue-400" :
                                                    "bg-white/5 border-white/10 text-white/30"
                                        )}>
                                            {step.status === "completed" ? <CheckCircle className="size-4" /> : <step.icon className={cn("size-4", step.status === "generating" && "animate-pulse")} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-sm font-medium transition-colors",
                                                step.status === "completed" ? "text-white" :
                                                    step.status === "generating" ? "text-white" : "text-white/40"
                                            )}>
                                                {step.label}
                                            </p>
                                        </div>
                                        {step.status === "generating" && (
                                            <div className="flex gap-1">
                                                <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : !showReminder ? (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <div className="mx-auto size-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="size-8" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">Bundle Ready</h3>
                                <p className="text-sm text-white/50">{tripName}_secure_bundle.aes</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Key Emergency Phrases Included</h4>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    {emergencyPhrases.map((phrase, idx) => (
                                        <div key={idx} className="flex flex-col gap-0.5">
                                            <p className="text-xs text-white/60">{phrase.eng}</p>
                                            <p className="text-sm font-medium text-white break-words">{phrase.trans}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowReminder(true)}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-6 gap-2"
                            >
                                <Lock className="size-4" /> Continue to Secure Bundle
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reminder"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <div className="mx-auto size-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="size-8" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">Crucial Step</h3>
                                <p className="text-sm text-white/50">Don't forget to save!</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center space-y-3">
                                <p className="text-sm text-white/80">
                                    The secure bundle will open in a new tab. In order to access it offline later, you MUST print it or save it as a PDF/screenshot now.
                                </p>
                                <p className="text-sm font-bold text-amber-400">
                                    It will not automatically save to your device.
                                </p>
                            </div>

                            <Button
                                onClick={handleDownload}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 gap-2"
                            >
                                <Download className="size-4" /> I Understand, Open Bundle
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Simple mock translation logic for the demo based on common destinations
function getTranslation(type: string, dest: string): string {
    const isJapan = dest.toLowerCase().includes("japan") || dest.toLowerCase().includes("tokyo")
    const isSpain = dest.toLowerCase().includes("spain") || dest.toLowerCase().includes("barcelona") || dest.toLowerCase().includes("madrid")
    const isFrance = dest.toLowerCase().includes("france") || dest.toLowerCase().includes("paris")

    if (type === "doctor") {
        if (isJapan) return "医者 / 病院が必要です (Isha / byōin ga hitsuyō desu)"
        if (isSpain) return "Necesito un médico / hospital"
        if (isFrance) return "J'ai besoin d'un médecin / d'un hôpital"
        return "I need a doctor / hospital"
    }
    if (type === "help") {
        if (isJapan) return "助けてください。緊急です (Tasukete kudasai. Kinkyū desu)"
        if (isSpain) return "¿Puede ayudarme? Es una emergencia."
        if (isFrance) return "Pouvez-vous m'aider ? C'est une urgence."
        return "Please help me. It's an emergency."
    }
    if (type === "embassy") {
        if (isJapan) return "大使館/領事館はどこですか？ (Taishikan/ryōjikan wa doko desu ka?)"
        if (isSpain) return "¿Dónde está la embajada/el consulado?"
        if (isFrance) return "Où se trouve l'ambassade/le consulat ?"
        return "Where is the embassy/consulate?"
    }
    if (type === "passport") {
        if (isJapan) return "パスポートをなくしました (Pasupōto o nakushimashita)"
        if (isSpain) return "He perdido mi pasaporte"
        if (isFrance) return "J'ai perdu mon passeport"
        return "I have lost my passport"
    }
    if (type === "hello") {
        if (isJapan) return "こんにちは (Konnichiwa)"
        if (isSpain) return "Hola"
        if (isFrance) return "Bonjour"
        return "Hello"
    }
    if (type === "thanks") {
        if (isJapan) return "ありがとう (Arigatou)"
        if (isSpain) return "Gracias"
        if (isFrance) return "Merci"
        return "Thank you"
    }
    if (type === "excuse") {
        if (isJapan) return "すみません (Sumimasen)"
        if (isSpain) return "Disculpe / Perdón"
        if (isFrance) return "Excusez-moi / Pardon"
        return "Excuse me / Sorry"
    }
    if (type === "english") {
        if (isJapan) return "英語を話せますか？ (Eigo o hanasemasu ka?)"
        if (isSpain) return "¿Habla inglés?"
        if (isFrance) return "Parlez-vous anglais ?"
        return "Do you speak English?"
    }
    if (type === "bathroom") {
        if (isJapan) return "トイレはどこですか？ (Toire wa doko desu ka?)"
        if (isSpain) return "¿Dónde está el baño?"
        if (isFrance) return "Où sont les toilettes ?"
        return "Where is the bathroom?"
    }
    if (type === "cost") {
        if (isJapan) return "これはいくらですか？ (Kore wa ikura desu ka?)"
        if (isSpain) return "¿Cuánto cuesta esto?"
        if (isFrance) return "Combien ça coûte ?"
        return "How much does this cost?"
    }
    if (type === "order") {
        if (isJapan) return "注文をお願いします (Chūmon o onegaishimasu)"
        if (isSpain) return "Me gustaría pedir"
        if (isFrance) return "Je voudrais commander"
        return "I would like to order"
    }
    if (type === "bill") {
        if (isJapan) return "お会計をお願いします (Okaikei o onegaishimasu)"
        if (isSpain) return "La cuenta, por favor"
        if (isFrance) return "L'addition, s'il vous plaît"
        return "Can I have the bill, please?"
    }
    if (type === "transport") {
        if (isJapan) return "駅 / バス停はどこですか？ (Eki / basutei wa doko desu ka?)"
        if (isSpain) return "¿Dónde está la estación de tren / parada de autobús?"
        if (isFrance) return "Où est la gare / l'arrêt de bus ?"
        return "Where is the train station / bus stop?"
    }
    if (type === "lost") {
        if (isJapan) return "道に迷いました (Michi ni mayoimashita)"
        if (isSpain) return "Estoy perdido/a"
        if (isFrance) return "Je suis perdu(e)"
        return "I am lost"
    }
    if (type === "yesno") {
        if (isJapan) return "はい / いいえ (Hai / Iie)"
        if (isSpain) return "Sí / No"
        if (isFrance) return "Oui / Non"
        return "Yes / No"
    }
    if (type === "water") {
        if (isJapan) return "お水をお願いします (Omizu o onegaishimasu)"
        if (isSpain) return "Agua, por favor"
        if (isFrance) return "De l'eau, s'il vous plaît"
        return "Water, please"
    }
    return "Translation unavailable"
}

// Helper for emergency numbers based on destination
function getEmergencyInfo(dest: string) {
    const isJapan = dest.toLowerCase().includes("japan") || dest.toLowerCase().includes("tokyo")
    const isSpain = dest.toLowerCase().includes("spain") || dest.toLowerCase().includes("barcelona") || dest.toLowerCase().includes("madrid")
    const isFrance = dest.toLowerCase().includes("france") || dest.toLowerCase().includes("paris")

    if (isJapan) {
        return {
            police: "110",
            medical: "119",
            embassy: "US Embassy Tokyo: +81 3-3224-5000"
        }
    }
    if (isSpain || isFrance) {
        return {
            police: "112 (EU Emergency)",
            medical: "112 (EU Emergency)",
            embassy: isSpain ? "US Embassy Madrid: +34 915 87 22 00" : "US Embassy Paris: +33 1 43 12 22 22"
        }
    }
    return {
        police: "911 / 112",
        medical: "911 / 112",
        embassy: "Check local listings"
    }
}
