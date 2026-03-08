import { NextRequest, NextResponse } from "next/server"

const ALADHAN_BASE_URL = "https://api.aladhan.com/v1"

// Cache prayer times for 24 hours
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// Simple IP-based rate limiting: 30 req/min
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW = 60 * 1000 // 1 minute

export async function GET(request: NextRequest) {
    try {
        // IP rate limiting
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
        const now = Date.now()
        const rateEntry = rateLimitMap.get(ip)
        if (rateEntry && now < rateEntry.resetAt) {
            if (rateEntry.count >= RATE_LIMIT) {
                return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
            }
            rateEntry.count++
        } else {
            rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
        }

        const { searchParams } = new URL(request.url)
        const lat = searchParams.get("lat")
        const lng = searchParams.get("lng")
        const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

        if (!lat || !lng) {
            return NextResponse.json(
                { error: "lat and lng are required" },
                { status: 400 }
            )
        }

        const cacheKey = `${lat},${lng},${date}`
        const cached = cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json(cached.data)
        }

        // Fetch prayer times from Aladhan API
        const [day, month, year] = [
            date.split("-")[2],
            date.split("-")[1],
            date.split("-")[0]
        ]

        const res = await fetch(
            `${ALADHAN_BASE_URL}/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=2`,
            { next: { revalidate: 86400 } }
        )

        if (!res.ok) {
            throw new Error(`Aladhan API error: ${res.status}`)
        }

        const json = await res.json()
        const timings = json?.data?.timings

        if (!timings) {
            throw new Error("No prayer times returned")
        }

        const result = {
            prayers: {
                Fajr: timings.Fajr,
                Sunrise: timings.Sunrise,
                Dhuhr: timings.Dhuhr,
                Asr: timings.Asr,
                Maghrib: timings.Maghrib,
                Isha: timings.Isha,
            },
            date,
            location: { lat: parseFloat(lat), lng: parseFloat(lng) },
            method: json?.data?.meta?.method?.name || "Islamic Society of North America"
        }

        // Cache the result
        cache.set(cacheKey, { data: result, timestamp: Date.now() })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Prayer times error:", error)
        return NextResponse.json(
            { error: "Failed to fetch prayer times" },
            { status: 500 }
        )
    }
}
