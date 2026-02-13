import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Admin email whitelist from environment variable
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session (important for Supabase auth)
    const { data: { user } } = await supabase.auth.getUser()

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            // Not logged in — redirect to auth
            const url = request.nextUrl.clone()
            url.pathname = '/auth'
            url.searchParams.set('redirect', '/admin')
            return NextResponse.redirect(url)
        }

        const userEmail = user.email?.toLowerCase() || ''

        // If ADMIN_EMAILS is configured, enforce whitelist
        if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(userEmail)) {
            // Unauthorized — redirect to home
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        // Run on admin routes
        '/admin/:path*',
        // Also refresh auth on all routes (recommended by supabase)
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
