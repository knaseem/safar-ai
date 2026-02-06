"use client"

import React, { Component, ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onReset?: () => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
        this.props.onReset?.()
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="max-w-md w-full text-center bg-neutral-900/50 border border-white/10 rounded-2xl p-8">
                        <div className="size-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="size-8 text-red-400" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-white/50 text-sm mb-6">
                            We encountered an unexpected error. Please try again or return to the home page.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-3 bg-black/50 rounded-lg text-left">
                                <p className="text-xs font-mono text-red-400 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                <RefreshCw className="size-4 mr-2" />
                                Try Again
                            </Button>
                            <Link href="/">
                                <Button
                                    variant="outline"
                                    className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                                >
                                    <Home className="size-4 mr-2" />
                                    Go Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// Functional wrapper for easier use
interface WithErrorBoundaryProps {
    children: ReactNode
    onReset?: () => void
}

export function WithErrorBoundary({ children, onReset }: WithErrorBoundaryProps) {
    return (
        <ErrorBoundary onReset={onReset}>
            {children}
        </ErrorBoundary>
    )
}
