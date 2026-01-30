"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, MessageSquare, Send, Loader2, CheckCircle } from "lucide-react"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ContactPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !email || !message) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSubmitting(true)

        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSubmitted(true)
        toast.success("Message sent!", { description: "We'll get back to you soon." })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        <span className="text-sm">Back to SafarAI</span>
                    </Link>
                    <div className="flex items-center gap-2 text-emerald-400">
                        <MessageSquare className="size-4" />
                        <span className="text-xs uppercase tracking-wider font-medium">Contact Us</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Contact Us
                </h1>
                <p className="text-white/40 mb-12">Have a question or feedback? We'd love to hear from you.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="size-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                    <CheckCircle className="size-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                                <p className="text-white/60 mb-6">Thank you for reaching out. We'll respond within 24-48 hours.</p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsSubmitted(false)
                                        setName("")
                                        setEmail("")
                                        setSubject("")
                                        setMessage("")
                                    }}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">
                                        Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        placeholder="Your name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">
                                        Email <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        placeholder="What's this about?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">
                                        Message <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={5}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                                        placeholder="Tell us how we can help..."
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold h-12 rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="size-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
                            <p className="text-white/60 leading-relaxed">
                                Whether you have a question about our service, need help with your account,
                                or want to partner with us, we're here to help.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <Mail className="size-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Email Support</h4>
                                    <p className="text-white/40 text-sm">support@safar-ai.co</p>
                                    <p className="text-white/30 text-xs mt-1">Response within 24-48 hours</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="size-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="size-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Partnerships</h4>
                                    <p className="text-white/40 text-sm">partners@safarai.com</p>
                                    <p className="text-white/30 text-xs mt-1">For affiliate and business inquiries</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <p className="text-emerald-400/80 text-sm">
                                🛡️ Your privacy matters. We never share your contact information with third parties.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
