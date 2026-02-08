// Forced recompile
import { NextRequest, NextResponse } from 'next/server'
import { searchProducts, resolveDestination } from '@/lib/viator'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!query) {
        return NextResponse.json({ error: 'Missing destination query' }, { status: 400 })
    }

    try {
        // 1. Resolve destination (query -> destinationId)
        const destination = await resolveDestination(query)

        if (!destination) {
            return NextResponse.json({
                products: [],
                message: `No destination found for "${query}"`
            })
        }

        // 2. Search products for that destination
        const products = await searchProducts(destination.destinationId, {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            keyword: category || undefined
        })

        return NextResponse.json({
            products,
            destination
        })

    } catch (error) {
        console.error('Activities Search Error:', error)

        return NextResponse.json(
            { error: 'Failed to fetch activities' },
            { status: 500 }
        )
    }
}
