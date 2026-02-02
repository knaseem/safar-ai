'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

export function Breadcrumb() {
    const pathname = usePathname()
    // Clean pathname to remove query params if any (usePathname doesn't include them usually, but safe)
    const cleanPath = pathname.split('?')[0]
    const segments = cleanPath.split('/').filter(Boolean)

    if (segments.length === 0) return null

    // Helper to format labels
    const getLabel = (segment: string) => {
        // If it looks like a uuid or long ID
        if (segment.length > 20 || /^[0-9a-f-]+$/.test(segment) || /^\d+$/.test(segment)) {
            return "Details"
        }

        // Capitalize
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    }

    return (
        <nav className="flex items-center text-sm text-white/50 mb-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
            <Link href="/" className="hover:text-emerald-400 transition-colors flex items-center shrink-0">
                <Home className="size-4 mr-1" />
                Home
            </Link>
            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join('/')}`
                const isLast = index === segments.length - 1
                const label = getLabel(segment)

                return (
                    <div key={href} className="flex items-center shrink-0">
                        <ChevronRight className="size-4 mx-2 text-white/20" />
                        {isLast ? (
                            <span className="text-white font-medium">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-emerald-400 transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
