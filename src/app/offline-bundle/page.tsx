"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Shield, Map as MapIcon, Plane, BookOpen, AlertTriangle, CheckCircle, Smartphone, Battery, Phone, Building } from "lucide-react"

export default function OfflineBundleView() {
    const [bundleData, setBundleData] = useState<any>(null)
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)

    useEffect(() => {
        let url: string | null = null
        // Read the data passed from the Survival Kit modal
        const data = localStorage.getItem('safar_offline_bundle')
        if (data) {
            const parsedData = JSON.parse(data)
            setBundleData(parsedData)

            // Convert base64 PDF to a Blob URL to bypass browser top-frame navigation blocks for data URIs
            if (parsedData.passportImageData && parsedData.passportImageData.startsWith('data:application/pdf')) {
                try {
                    const base64Data = parsedData.passportImageData.split(',')[1]
                    const byteCharacters = atob(base64Data)
                    const byteNumbers = new Array(byteCharacters.length)
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i)
                    }
                    const byteArray = new Uint8Array(byteNumbers)
                    const blob = new Blob([byteArray], { type: 'application/pdf' })
                    url = URL.createObjectURL(blob)
                    setPdfBlobUrl(url)
                } catch (e) {
                    console.error("Failed to parse PDF", e)
                }
            }
        }

        return () => {
            if (url) URL.revokeObjectURL(url)
        }
    }, [])

    if (!bundleData) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-8 text-center text-white">
                <p>No offline bundle found. Please generate one from your trip itinerary.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 print:bg-white print:text-black">
            {/* Minimalist printable header */}
            <header className="border-b border-white/10 bg-neutral-900 px-8 py-6 print:py-4 flex justify-between items-center print:border-neutral-200 print:bg-neutral-50">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white print:text-black">{bundleData.tripName}</h1>
                    <p className="text-neutral-400 font-medium print:text-neutral-500">{bundleData.destination} • Offline Survival Kit</p>
                </div>
                <div className="text-right text-sm text-neutral-500 print:text-neutral-400">
                    <p>Generated: {new Date(bundleData.generatedAt).toLocaleDateString()}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-emerald-500 font-medium print:text-emerald-600">
                        <Shield className="size-3" /> AES-256 Encrypted
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-8 space-y-12">

                {/* Emergency Critical Info */}
                <section className="bg-red-950/20 border border-red-900/50 rounded-2xl p-6 print:bg-red-50 print:border-red-500">
                    <h2 className="text-red-400 font-bold text-lg mb-4 flex items-center gap-2 print:text-red-800">
                        <AlertTriangle className="size-5" /> Critical Emergency Info
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-900/50 text-red-400 rounded-lg shrink-0 print:bg-red-100 print:text-red-700">
                                    <Phone className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-red-300 print:text-red-900">Local Police</p>
                                    <p className="text-lg font-mono text-white print:text-black">{bundleData.emergencyContacts.police}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-900/50 text-red-400 rounded-lg shrink-0 print:bg-red-100 print:text-red-700">
                                    <Phone className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-red-300 print:text-red-900">Ambulance / Medical</p>
                                    <p className="text-lg font-mono text-white print:text-black">{bundleData.emergencyContacts.medical}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-900/50 text-blue-400 rounded-lg shrink-0 print:bg-blue-100 print:text-blue-700">
                                <Building className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-blue-300 print:text-blue-900">Nearest Embassy</p>
                                <p className="text-md font-medium text-white print:text-black">{bundleData.emergencyContacts.embassy}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Secure Documents */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white print:text-black">
                        <Shield className="size-5 text-neutral-500" /> Secure Documents
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <a href="#itinerary" className="p-4 border border-white/10 rounded-xl bg-white/5 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer print:border-neutral-200 print:bg-neutral-50 print:cursor-auto">
                            <div className="size-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shrink-0 print:bg-emerald-100 print:text-emerald-600">
                                <CheckCircle className="size-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white print:text-black">Trip Itinerary</p>
                                <p className="text-xs text-neutral-400 print:text-neutral-500">Jump to Itinerary</p>
                            </div>
                        </a>
                        <div id="map" className="p-4 border border-white/10 rounded-xl bg-white/5 flex flex-col gap-3 print:border-neutral-200 print:bg-neutral-50">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shrink-0 print:bg-emerald-100 print:text-emerald-600">
                                    <MapIcon className="size-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-white print:text-black">Local Area Map</p>
                                    <p className="text-xs text-neutral-400 print:text-neutral-500">Cached Offline</p>
                                </div>
                            </div>
                            {bundleData.itineraryDays?.[0]?.coordinates && (
                                <div className="mt-2 rounded-lg overflow-hidden h-64 w-full bg-neutral-900 border border-white/10 relative">
                                    <iframe
                                        src={`https://maps.google.com/maps?q=${bundleData.itineraryDays[0].coordinates.lat},${bundleData.itineraryDays[0].coordinates.lng}&z=14&output=embed&hl=en&iwloc=near`}
                                        className="w-full h-full border-0 absolute"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            )}
                        </div>
                        {bundleData.hasPassport && (
                            <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-4 border border-emerald-500/30 rounded-xl bg-emerald-500/5 p-4 print:border-emerald-200 print:bg-emerald-50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 bg-emerald-500 text-black rounded-full flex items-center justify-center shrink-0 print:text-white">
                                        <Shield className="size-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-emerald-300 print:text-emerald-900">Secure Document Scan</p>
                                        <p className="text-xs text-emerald-500/70 print:text-emerald-700">Decrypted for offline view</p>
                                    </div>
                                </div>
                                {bundleData.passportImageData ? (
                                    <div className="rounded-lg overflow-hidden border border-emerald-500/20 bg-black/50 print:bg-white print:border-emerald-200/50">
                                        {bundleData.passportImageData.startsWith('data:application/pdf') ? (
                                            pdfBlobUrl ? (
                                                <iframe src={pdfBlobUrl} title="Scanned PDF Document" className="w-full h-[600px] bg-white border-0">
                                                    <p className="text-emerald-400 text-sm p-4 text-center">PDF Saved Offline</p>
                                                </iframe>
                                            ) : (
                                                <div className="w-full h-[600px] flex items-center justify-center text-emerald-400 font-medium bg-black/50">
                                                    Decrypting PDF...
                                                </div>
                                            )
                                        ) : (
                                            <img src={bundleData.passportImageData} alt="Scanned Document" className="w-full max-w-sm h-auto object-contain mx-auto" />
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full max-w-sm h-32 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 border-dashed print:bg-emerald-100/50">
                                        <p className="text-emerald-400 text-sm font-medium print:text-emerald-700">Document Encrypted</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Itinerary Details */}
                {bundleData.itineraryDays && bundleData.itineraryDays.length > 0 && (
                    <section id="itinerary" className="mt-12 scroll-mt-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white print:text-black">
                            <MapIcon className="size-5 text-neutral-500" /> Itinerary Details
                        </h2>
                        <div className="space-y-4">
                            {bundleData.itineraryDays.map((day: any, idx: number) => (
                                <div key={idx} className="p-5 border border-white/10 rounded-xl bg-white/5 flex flex-col gap-4 print:border-neutral-200 print:bg-neutral-50">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-3 print:border-neutral-200">
                                        <h3 className="text-lg font-bold text-white print:text-black">Day {day.day}</h3>
                                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{day.theme}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Morning</p>
                                            <p className="text-sm font-medium text-neutral-300 print:text-black">{day.morning}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Afternoon</p>
                                            <p className="text-sm font-medium text-neutral-300 print:text-black">{day.afternoon}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Evening & Stay</p>
                                            <p className="text-sm font-medium text-neutral-300 mb-2 print:text-black">{day.evening}</p>
                                            <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs font-bold text-neutral-300 print:bg-neutral-200 print:text-neutral-800">
                                                <Building className="size-3" /> {day.stay}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Emergency Phrases */}
                <section className="mt-12">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white print:text-black">
                        <BookOpen className="size-5 text-neutral-500" /> Key Phrases
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bundleData.emergencyPhrases.map((phrase: any, idx: number) => (
                            <div key={idx} className="p-4 border border-white/10 rounded-xl print:border-neutral-200">
                                <p className="text-xs text-neutral-500 mb-1">{phrase.eng}</p>
                                <p className="text-md font-bold text-white break-words print:text-neutral-900">{phrase.trans}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Print Banner */}
                <div className="bg-neutral-900 border border-white/10 text-white rounded-xl p-6 flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Smartphone className="size-8 text-neutral-400" />
                        <div>
                            <p className="font-bold">Keep this tab open</p>
                            <p className="text-sm text-neutral-400">Or take a screenshot for immediate access without cellular data.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                        Print Backup
                    </button>
                </div>
            </main>
        </div>
    )
}
