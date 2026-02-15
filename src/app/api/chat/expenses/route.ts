import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { chatRatelimit, isRateLimitEnabled } from "@/lib/ratelimit";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting check
        if (isRateLimitEnabled()) {
            const identifier = `user:${user.id}`;
            const { success, remaining } = await chatRatelimit.limit(identifier);

            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please wait a moment." },
                    { status: 429 }
                );
            }
        }

        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // 1. Fetch relevant user data (trips and expenses) to provide as context
        // In a production app, we would use RAG (Vector Search). 
        // Here, we'll fetch recent active trips and expenses.

        const { data: trips } = await supabase
            .from("saved_trips")
            .select("id, trip_name, start_date, end_date")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);

        const { data: expenses } = await supabase
            .from("expenses")
            .select("*, saved_trips(trip_name)")
            .eq("user_id", user.id)
            .order("date", { ascending: false }); // Fetch all for now, or limit if too many

        // 2. Construct System Prompt with Context
        const systemPrompt = `
      You are SafarAI's Finance Assistant. Your goal is to answer the user's questions about their travel expenses.

      Context Data:
      Trips: ${JSON.stringify(trips)}
      Expenses: ${JSON.stringify(expenses)}

      User Question: "${prompt}"

      Instructions:
      - Analyze the user's question.
      - Calculate totals, find specific transactions, or summarize spending by category/trip as requested.
      - Return a concise, natural language response.
      - If you can't find the answer in the data, say so clearly.
      - Format currency as USD ($).
      - Keep the tone professional, helpful, and concise.
      - IMPORTANT: Dates are stored as YYYY-MM-DD. Treat them as the user's local date. DO NOT apply timezone conversions that would shift the date (e.g. 2026-02-14 is February 14th, not 15th).
    `;

        // 3. Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });

    } catch (error) {
        console.error("AI Expenses Error:", error);
        return NextResponse.json(
            { error: "Failed to process query" },
            { status: 500 }
        );
    }
}
