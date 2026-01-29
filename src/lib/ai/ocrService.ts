const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Current valid Groq vision model (as of Jan 2026)
const VISION_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct";

export async function performOCR(base64Data: string, mimeType: string): Promise<string> {
    if (!API_KEY) {
        throw new Error("VITE_GROQ_API_KEY is missing.");
    }

    const prompt = "Transcribe the text from this image exactly as it appears. If it's handwriting, do your best to be accurate. Return ONLY the transcribed text, no preamble or commentary.";

    const body = {
        model: VISION_MODEL,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64Data}`
                        }
                    }
                ]
            }
        ],
        temperature: 0.3,
        max_tokens: 2000
    };

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OCR API Error:", errorText);

        if (response.status === 401) {
            throw new Error("Invalid API Key: Please check your VITE_GROQ_API_KEY in .env file.");
        }

        throw new Error(`OCR Failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    if (!text) {
        throw new Error("No text could be extracted from this image.");
    }

    return text.trim();
}
