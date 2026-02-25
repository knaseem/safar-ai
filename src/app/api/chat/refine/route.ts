import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { limitByUserTier, isRateLimitEnabled } from "@/lib/ratelimit"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: "Please sign in to refine your itinerary." },
                { status: 401 }
            )
        }

        // Rate limiting
        if (isRateLimitEnabled()) {
            const { success, remaining } = await limitByUserTier(user.id, 'chat')
            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please wait a moment." },
                    { status: 429, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
                )
            }
        }

        const { tripId, message, currentTripData } = await req.json()

        if (!tripId || !message || !currentTripData) {
            return NextResponse.json(
                { error: "Missing required fields: tripId, message, currentTripData" },
                { status: 400 }
            )
        }

        // Input validation
        if (typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json({ error: "Please provide a message." }, { status: 400 })
        }
        if (message.length > 500) {
            return NextResponse.json({ error: "Message too long (max 500 chars)." }, { status: 400 })
        }

        // Fetch conversation history (last 20 messages)
        const { data: history } = await supabase
            .from("chat_messages")
            .select("role, content")
            .eq("trip_id", tripId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: true })
            .limit(20)

        // Build conversation context for Gemini
        const conversationHistory = (history || [])
            .map(msg => `${msg.role === 'user' ? 'Traveler' : 'SafarAI'}: ${msg.content}`)
            .join("\n")

        const systemPrompt = `
You are SafarAI, an elite AI travel concierge helping a traveler refine their existing itinerary.

CURRENT ITINERARY (JSON):
${JSON.stringify(currentTripData, null, 2)}

CONVERSATION HISTORY:
${conversationHistory || "No previous messages — this is the first refinement."}

TRAVELER'S REQUEST: "${message.trim()}"

INSTRUCTIONS:
1. Understand what the traveler wants to change about their itinerary.
2. Apply the requested changes to the itinerary.
3. Return a JSON response with this exact structure:

{
    "reply": "A friendly, concise explanation of what you changed (1-3 sentences max)",
    "updatedTrip": { ...the full updated itinerary JSON with changes applied... },
    "changesApplied": ["Brief description of each change made"]
}

RULES:
- Only modify what the traveler asked for. Keep everything else the same.
- The "updatedTrip" must have the same structure as the current itinerary.
- If the request doesn't make sense or is impossible, explain why in "reply" and return the original itinerary unchanged in "updatedTrip".
- Do not include markdown formatting. Return raw JSON only.
`

        // Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
        const result = await model.generateContent(systemPrompt)
        const response = await result.response
        const text = response.text()

        if (!text) {
            throw new Error("Empty response from AI")
        }

        // Parse response
        let parsed
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            const cleanedText = jsonMatch ? jsonMatch[0] : text
            parsed = JSON.parse(cleanedText)

            if (!parsed.reply || !parsed.updatedTrip) {
                throw new Error("Missing required fields in AI response")
            }
        } catch (parseError) {
            console.error("AI response parse error:", text)
            throw new Error("Failed to parse AI response")
        }

        // Save user message to chat history
        await supabase.from("chat_messages").insert({
            trip_id: tripId,
            user_id: user.id,
            role: "user",
            content: message.trim()
        })

        // Save assistant response to chat history
        await supabase.from("chat_messages").insert({
            trip_id: tripId,
            user_id: user.id,
            role: "assistant",
            content: parsed.reply,
            trip_changes: parsed.changesApplied || []
        })

        // Update the saved trip with new data
        const { error: updateError } = await supabase
            .from("saved_trips")
            .update({ trip_data: parsed.updatedTrip })
            .eq("id", tripId)
            .eq("user_id", user.id)

        if (updateError) {
            console.error("Failed to update trip:", updateError)
            // Still return the response even if persistence fails
        }

        return NextResponse.json({
            reply: parsed.reply,
            updatedTrip: parsed.updatedTrip,
            changesApplied: parsed.changesApplied || []
        })
    } catch (error: any) {
        console.error("Chat refine error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to refine itinerary" },
            { status: 500 }
        )
    }
}

// GET: Fetch chat history for a trip
export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const tripId = searchParams.get("tripId")

        if (!tripId) {
            return NextResponse.json({ error: "tripId required" }, { status: 400 })
        }

        const { data: messages, error } = await supabase
            .from("chat_messages")
            .select("id, role, content, trip_changes, created_at")
            .eq("trip_id", tripId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: true })

        if (error) {
            throw error
        }

        return NextResponse.json({ messages: messages || [] })
    } catch (error: any) {
        console.error("Chat history error:", error)
        return NextResponse.json(
            { error: "Failed to fetch chat history" },
            { status: 500 }
        )
    }
}
