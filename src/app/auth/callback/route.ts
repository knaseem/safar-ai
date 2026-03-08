import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    // Validate `next` is a relative path only — prevents open redirect attacks
    const next = searchParams.get("next") ?? "/"
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/"

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(`${origin}${safeNext}`)
        }
    }

    // Return to home with error
    return NextResponse.redirect(`${origin}/?auth_error=true`)
}
