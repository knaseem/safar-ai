import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Simulate thinking/network delay (1-2 seconds)
    // This makes the "Agent" feel like it's actually doing work
    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
        const { item, type, originalPrice } = await request.json()

        // Simulate a price fluctuation (mostly finding a "better" deal)
        // 70% chance of finding a slightly lower price
        // 30% chance of same price
        const randomFactor = Math.random()
        let verifiedPrice = originalPrice
        let savings = 0
        let status = 'verified'

        if (randomFactor > 0.3) {
            // Found a deal!
            const discount = Math.floor(Math.random() * 15) + 5 // $5 to $20 off
            verifiedPrice = Math.max(originalPrice - discount, originalPrice * 0.9)
            savings = originalPrice - verifiedPrice
            status = 'deal_found'
        }

        return NextResponse.json({
            status,
            verifiedPrice: Math.round(verifiedPrice),
            savings: Math.round(savings),
            timestamp: new Date().toISOString(),
            source: type === 'hotel' ? 'Booking.com' : 'Viator'
        })

    } catch (error) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }
}
