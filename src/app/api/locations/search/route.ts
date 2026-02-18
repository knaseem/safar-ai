
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')

    if (!keyword || keyword.length < 2) {
        return NextResponse.json({ data: [] })
    }

    try {
        // Use Travelpayouts (Aviasales) Autocomplete API
        // Docs: https://support.travelpayouts.com/hc/en-us/articles/203956173-Search-API
        const response = await fetch(
            `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(keyword)}&locale=en&types[]=city&types[]=airport`,
            { headers: { 'Accept': 'application/json' } }
        )

        if (!response.ok) {
            console.error('Travelpayouts API error:', response.status, await response.text())
            // Fallback empty
            return NextResponse.json({ data: [] })
        }

        const data = await response.json()

        // Transform to our internal format
        const suggestions = data.map((item: any) => ({
            iataCode: item.code,
            name: item.name,
            address: {
                cityName: item.city_name || item.name,
                countryName: item.country_name
            },
            type: item.type // 'city' or 'airport'
        }))

        return NextResponse.json({ data: suggestions })
    } catch (error) {
        console.error('Locations search error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch suggestions' },
            { status: 500 }
        )
    }
}
