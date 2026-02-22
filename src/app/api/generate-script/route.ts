import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { dayData, tripName } = await req.json()

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 })
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const prompt = `
            You are a charismatic, friendly travel podcast host. 
            Write a 30-45 second spoken intro for a traveler's day.
            
            Trip: ${tripName}
            Day Theme: ${dayData.theme}
            Morning Activities: ${dayData.morning}
            Afternoon Activities: ${dayData.afternoon}
            Evening Activities: ${dayData.evening}

            Rules:
            1. Speak directly to the traveler ("You're going to love...", "Imagine walking...").
            2. Use short, punchy sentences. avoid long complex clauses.
            3. Be enthusiastic but chill. Like a cool local friend.
            4. Connect the activities into a story. Don't simply list them.
            5. Start with a hook like "Day 1 is all about..." or "Good Morning!".
            6. Do NOT use emojis or hashtags. Just spoken text.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const script = response.text()

        return NextResponse.json({ script })

    } catch (error: any) {
        console.error("Script generation error details:", error)
        console.error("API Key present:", !!process.env.GOOGLE_API_KEY)
        return NextResponse.json({
            error: "Failed to generate script",
            details: error?.message || "Unknown error"
        }, { status: 500 })
    }
}
