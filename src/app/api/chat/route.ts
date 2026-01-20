import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt, isHalal } = await req.json();
    const supabase = await createClient();

    // 1. Get the user's "Travel DNA"
    const { data: profiles, error } = await supabase
      .from("travel_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    const profile = profiles?.[0] || { archetype: "Explorer", traits: {} };

    // 2. Construct the Prompt
    const systemPrompt = `
      You are SafarAI, an elite, autonomous high-end travel agent. 
      Your client is a "${profile.archetype}" with these traits: ${JSON.stringify(profile.traits)}.
      ${isHalal ? "CRITICAL REQUIREMENT: This is a HALAL trip. YOU MUST ONLY suggest hotels with no alcohol (or removal options), Halal food options nearby, and family-friendly activities. Avoid nightlife/clubs." : ""}
      
      Design a 3-day ultra-personalized itinerary based on their request: "${prompt}".
      
      Format the response as a valid JSON object with this structure:
      {
        "trip_name": "Title of the trip",
        "days": [
          {
            "day": 1,
            "theme": "Theme of the day",
            "coordinates": { "lat": 0.0, "lng": 0.0 },
            "morning": "Activity description",
            "afternoon": "Activity description",
            "evening": "Activity description",
            "stay": "Hotel recommendation"
          }
        ]
      }
      IMPORTANT: You must provide real approximate coordinates (lat/lng) for the main location of each day to enable the 3D map flyover.
      Do not include markdown formatting like \`\`\`json. Just return the raw JSON.
    `;

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown formatting if present
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // 4. Return Data
    return NextResponse.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Failed to generate trip" },
      { status: 500 }
    );
  }
}
