import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isRateLimitEnabled } from "@/lib/ratelimit"
import { limitByUserTier } from "@/lib/ratelimit"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Wait... actually, let's keep it anonymous-friendly for the chat part
        // We'll enforce auth only when they try to SAVE the trip.
        // Let's use IP-based rate limiting for anonymous users later if needed.

        const { messages, planningState, isHalalMode } = await req.json()

        const systemPrompt = `
You are SafarAI, an elite AI travel concierge. Your goal is to help users plan amazing trips conversationally!

CURRENT PLANNING STATE:
${JSON.stringify(planningState, null, 2)}
Halal Mode Active: ${isHalalMode ? 'YES' : 'NO'}

YOUR JOB:
1. Act as a friendly, expert travel agent. Keep responses short (1-3 sentences max).
2. Look at the CURRENT PLANNING STATE. If any core fields (destination, dates/duration, travelers, vibe) are missing, gently ask the user about them one by one. Do not ask for everything at once!
3. If they mention a place, time, group size, or vibe, update the planningState object.
4. If Halal Mode is YES, proactively assure them you are prioritizing halal food, prayer times, and modesty-friendly options.
5. If all core fields are filled, act hyped and tell them you're ready to "Generate My Trip ✨".

YOU MUST RETURN JSON ONLY with this exact structure:
{
    "reply": "Your conversational response",
    "smartChips": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4"],
    "updatedState": {
        "destination": "Extracted destination or null",
        "dates": "Extracted dates/duration or null",
        "travelers": "Extracted traveler info or null",
        "vibe": "Extracted vibe or null",
        "estimatedBudget": "Rough cost estimate (e.g. $1,500 - $2,500) if destination+travelers known, else null",
        "readyToGenerate": boolean (true ONLY if destination, dates, travelers, and vibe are ALL filled)
    }
}

RULES FOR SMART CHIPS:
- Provide 3-4 clickable quick replies that help answer your current question.
- If asking "where from", suggest "From New York", "From London", etc.
- If asking "who", suggest "Just me", "Couple", "Family of 4".
- If asking "vibe", suggest "Relaxing beach", "Action packed", "Culture & history".
- If readyToGenerate is true, the ONLY chip should be: "Generate My Trip ✨"
`

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        // Just pass the full prompt + messages
        const prompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\nRespond in strictly valid JSON format.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse JSON safely
        let parsed
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            const cleanedText = jsonMatch ? jsonMatch[0] : text
            parsed = JSON.parse(cleanedText)
        } catch (e) {
            console.error("Failed to parse JSON:", text)
            // Fallback
            return NextResponse.json({
                reply: text.replace(/```json/g, '').replace(/```/g, ''),
                smartChips: ["Start over", "Need help"],
                updatedState: planningState
            })
        }

        return NextResponse.json(parsed)
    } catch (error) {
        console.error("AI Conversational Builder Error:", error)
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        )
    }
}
