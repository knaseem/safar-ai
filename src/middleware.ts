import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

    // Admin email whitelist — evaluated per-request so env changes take effect without redeploy
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

    // Protect /admin page routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth'
            url.searchParams.set('redirect', '/admin')
            return NextResponse.redirect(url)
        }

        const userEmail = user.email?.toLowerCase() || ''

        if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(userEmail)) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // Defense-in-depth: also protect /api/admin routes at middleware level
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userEmail = user.email?.toLowerCase() || ''
        if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(userEmail)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        // Protect admin pages and API routes
        '/admin/:path*',
        '/api/admin/:path*',
        // Refresh auth on all non-static routes (recommended by Supabase)
        '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
