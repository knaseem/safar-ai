const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log("Testing with API Key:", apiKey ? "Present" : "Missing");

    if (!apiKey) {
        console.error("No API Key found in environment");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent("Hello!");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error) {
        console.error("Gemini Error:", error.result?.error?.message || error.message);
    }
}

testGemini();
