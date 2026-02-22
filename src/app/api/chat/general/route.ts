import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatRatelimit, isRateLimitEnabled } from "@/lib/ratelimit";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Please sign in to use the chat." },
                { status: 401 }
            );
        }

        // Rate limiting check
        if (isRateLimitEnabled()) {
            const identifier = `user:${user.id}`;
            const { success } = await chatRatelimit.limit(identifier);

            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please wait a moment." },
                    { status: 429 }
                );
            }
        }

        const { messages } = await req.json();

        const systemPrompt = `
You are SafarAI, an elite AI travel assistant and concierge.

YOUR CAPABILITIES:
- Answer travel-related questions (destinations, visa info, best times to visit, etc.)
- Provide personalized trip suggestions based on user preferences
- Recommend destinations, activities, restaurants, and experiences
- Help with travel logistics and planning
- Share cultural insights and travel tips

YOUR STYLE:
- Be warm, enthusiastic, and inspiring about travel
- Be concise but helpful - aim for 2-3 paragraphs max
- Suggest using our Vibe Check feature for personalized itineraries
- Maintain a premium, concierge-like tone

If a user wants a full trip itinerary, encourage them to try our "Discover Your Vibe" feature which creates personalized 3-day itineraries.
`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: "Hello! I'm SafarAI, your personal travel concierge. I'd love to help you plan your next adventure. What destination or type of experience are you dreaming about?" }]
                },
                ...messages.slice(0, -1).map((m: { role: string; content: string }) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }))
            ]
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error) {
        console.error("AI General Chat Error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
