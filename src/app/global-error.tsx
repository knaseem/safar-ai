"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface GlobalErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Report error to Sentry
        Sentry.captureException(error)
    }, [error])

    return (
        <html lang="en">
            <body className="bg-black text-white">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-2xl p-8 text-center">
                        <div className="size-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="size-8 text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-white/60 mb-6">
                            We've been notified and are working to fix the issue.
                        </p>

                        {error.digest && (
                            <p className="text-xs text-white/30 mb-6 font-mono">
                                Error ID: {error.digest}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={reset}
                                className="flex-1 bg-white text-black hover:bg-neutral-200"
                            >
                                <RefreshCw className="size-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="outline"
                                className="flex-1 border-white/10 text-white hover:bg-white/5"
                            >
                                <Home className="size-4 mr-2" />
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
