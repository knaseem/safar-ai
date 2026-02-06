import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { chatRatelimit, isRateLimitEnabled, getRateLimitIdentifier } from "@/lib/ratelimit";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    // Rate limiting check
    if (isRateLimitEnabled()) {
      const identifier = getRateLimitIdentifier(req);
      const { success, remaining } = await chatRatelimit.limit(identifier);

      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment before trying again." },
          {
            status: 429,
            headers: { 'X-RateLimit-Remaining': remaining.toString() }
          }
        );
      }
    }

    const { prompt, isHalal, selection } = await req.json();

    // Input validation
    const MAX_PROMPT_LENGTH = 1000;
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: "Please provide a trip description." },
        { status: 400 }
      );
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      return NextResponse.json(
        { error: "Please provide a trip description." },
        { status: 400 }
      );
    }

    if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Trip description is too long. Please keep it under ${MAX_PROMPT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Get the user's "Travel DNA" (or default)
    const { data: { user } } = await supabase.auth.getUser();
    let profile = { archetype: "Explorer", traits: {} };

    if (user) {
      const { data: userProfile } = await supabase
        .from("travel_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (userProfile) profile = userProfile;
    }


    // 2. Construct the Prompt
    const systemPrompt = `
      You are SafarAI, an elite, autonomous high-end travel agent. 
      Your client is a "${profile.archetype}" with these traits: ${JSON.stringify(profile.traits)}.
      ${isHalal ? "CRITICAL REQUIREMENT: This is a HALAL trip. YOU MUST ONLY suggest hotels with no alcohol (or removal options), Halal food options nearby, and family-friendly activities. Avoid nightlife/clubs." : ""}
      
      Design an ultra-personalized itinerary based on their request: "${trimmedPrompt}".
      
      CRITICAL INSTRUCTION: Analyze the prompt for a specific duration (e.g., "5 days", "one week", "weekend"). 
      - If a duration is found, generate an itinerary for EXACTLY that many days.
      - If no duration is specified, default to a 3-day itinerary.

      Format the response as a valid JSON object with COMPLETED data (no placeholders) with this structure:
      {
        "trip_name": "Title of the trip",
        "trip_duration_days": 5, // Example: The number of days generated
        "sound_theme": "one of: city | nature | ocean | desert | cafe",
        "days": [
          {
            "day": 1,
            "theme": "Theme of the day",
            "coordinates": { "lat": 0.0, "lng": 0.0 },
            "morning": "Detailed morning activity description",
            "afternoon": "Detailed afternoon activity description",
            "evening": "Detailed evening activity description",
            "stay": "Hotel recommendation"
          }
        ]
      }
      IMPORTANT: Include ALL days requested (e.g., if 5 days asked, return 5 days). You must provide real approximate coordinates (lat/lng) for the main location of each day.
      Do not include markdown formatting like \`\`\`json. Just return the raw JSON.
    `;

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.error("AI Error: Empty text returned from model");
      throw new Error("The AI explorer is currently busy. Please try again in a moment.");
    }

    // Clean up markdown formatting and extract JSON
    let tripData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanedText = jsonMatch ? jsonMatch[0] : text;
      tripData = JSON.parse(cleanedText);

      if (!tripData || typeof tripData !== 'object') {
        throw new Error("Parsed data is not an object");
      }

      // Ensure basic structure exists
      if (!tripData.trip_name) tripData.trip_name = "My Bespoke Journey";
      if (!tripData.days) tripData.days = [];

      // Store selections if provided
      if (selection) {
        tripData.selection = selection;
      }

    } catch (parseError) {
      console.error("JSON Parse Error. Cleaned text:", text);
      throw new Error("Invalid AI response format");
    }

    // 4. Persistence: Save to temporary_trips to prevent loss on refresh
    const { data: tempTrip, error: tempError } = await supabase
      .from("temporary_trips")
      .insert({
        trip_data: tripData,
        is_halal: isHalal || false,
        search_query: prompt,
        user_id: user?.id || null
      })
      .select("id")
      .single();

    if (tempError || !tempTrip || !tempTrip.id) {
      console.error("Persistence Failure:", tempError || "No trip ID returned from DB");
      throw new Error(`Failed to lock in your itinerary: ${tempError?.message || 'Database rejection'}`);
    }

    // 5. Return Data
    const finalResponse = {
      ...tripData,
      id: tempTrip.id,
      _v: "v3-stable"
    };
    console.log("DEBUG: Final response payload:", JSON.stringify(finalResponse, null, 2));
    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Failed to generate trip" },
      { status: 500 }
    );
  }
}
