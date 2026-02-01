import { NextResponse } from "next/server"
import { getOffer } from "@/lib/duffel"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15+
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { error: "Offer ID required" },
                { status: 400 }
            )
        }

        const offer = await getOffer(id)

        if (!offer) {
            return NextResponse.json(
                { error: "Offer not found or expired" },
                { status: 404 }
            )
        }

        return NextResponse.json(offer)
    } catch (error: any) {
        console.error("Get Offer Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to fetch offer details" },
            { status: 500 }
        )
    }
}
