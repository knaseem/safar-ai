import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
    try {
        const { messages, tripContext } = await req.json();

        const systemPrompt = `
      You are SafarAI, an elite, autonomous high-end travel concierge.
      
      CONTEXT:
      You are currently viewing a specific trip itinerary for a client.
      Here is the TRIP ITINERARY DATA:
      ${JSON.stringify(tripContext, null, 2)}

      YOUR ROLE:
      - Answer the user's questions specifically about THIS trip.
      - Be helpful, concise, and professional.
      - If they ask for recommendations (restaurants, activities), provide high-end, suitable options that fit the theme of the trip.
      - If they ask about logistics (distances, times), estimate based on your knowledge of the locations.
      - Maintain a premium, concierge-like tone.

      Current Conversation:
    `;

        // Construct the chat history for Gemini
        // Gemini 2.0 Flash supports multi-turn chat
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to assist with this specific itinerary." }]
                },
                ...messages.slice(0, -1).map((m: any) => ({
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
        console.error("AI Companion Error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
