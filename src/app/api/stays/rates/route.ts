import { NextResponse } from "next/server"
import { fetchStayRates } from "@/lib/duffel"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const searchResultId = searchParams.get("id")

    if (!searchResultId) {
        return NextResponse.json(
            { error: "Missing search_result_id" },
            { status: 400 }
        )
    }

    try {
        const data = await fetchStayRates(searchResultId)
        // fetchStayRates returns { rates: [...] }, so we return it directly
        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Fetch Rates API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to fetch rates" },
            { status: 500 }
        )
    }
}
