import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(req: Request) {
    try {
        const { imageBase64 } = await req.json()

        if (!imageBase64) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 })
        }

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        // Strip the data:image/...;base64, prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")
        const mimeType = imageBase64.match(/data:(.*?);base64/)?.[1] || "image/jpeg"

        const prompt = `
You are a highly accurate financial OCR and data extraction system.
Analyze the provided receipt image and extract the following details. 

Return strictly valid JSON with NO markdown formatting, NO backticks, and NO extra text, using exactly this structure:
{
    "merchant_name": "String (Name of the store or service)",
    "total_amount": "Number as string (Just the final total amount, e.g. '45.99'. Do not include currency symbols)",
    "currency": "String (The 3-letter currency code, e.g. 'USD', 'EUR', 'GBP', 'JPY'. Default to 'USD' if completely unclear)",
    "date": "String in YYYY-MM-DD format (The date of the transaction. If no year is present, assume the current year)",
    "category": "String (Must be exactly one of: 'flight', 'hotel', 'activity', 'food', 'transport', 'shopping', 'entertainment', or 'other'. Infer this based on the merchant name and items)"
}`

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType
            }
        }

        const result = await model.generateContent([prompt, imagePart])
        const response = await result.response
        const text = response.text()

        // Safely parse the JSON response
        let parsed
        try {
            // Attempt to clean the text in case Gemini added markdown blocks like ```json ... ```
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            const cleanedText = jsonMatch ? jsonMatch[0] : text
            parsed = JSON.parse(cleanedText)
        } catch (e) {
            console.error("Failed to parse Gemini OCR JSON:", text)
            return NextResponse.json({ error: "Failed to parse receipt correctly. Please try again or enter manually." }, { status: 500 })
        }

        return NextResponse.json(parsed)

    } catch (error) {
        console.error("Receipt OCR API Error:", error)
        return NextResponse.json(
            { error: "Failed to process receipt image" },
            { status: 500 }
        )
    }
}
