import GroqRAG from "groq-rag";

// Vision model for OCR
const VISION_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct";

let client: GroqRAG | null = null;

const getGroqClient = (): GroqRAG => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GROQ_API_KEY is missing from environment variables.");
    }

    if (!client) {
        client = new GroqRAG({ apiKey, dangerouslyAllowBrowser: true } as any);
    }

    return client;
};

export async function performOCR(base64Data: string, mimeType: string): Promise<string> {
    const groq = getGroqClient();

    const prompt = "Transcribe the text from this image exactly as it appears. If it's handwriting, do your best to be accurate. Return ONLY the transcribed text, no preamble or commentary.";

    try {
        const response = await groq.client.chat.completions.create({
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
        });

        const text = response?.choices?.[0]?.message?.content ?? "";

        if (!text) {
            throw new Error("No text could be extracted from this image.");
        }

        return text.trim();
    } catch (error: any) {
        console.error("OCR Error:", error);

        if (error?.status === 401) {
            throw new Error("Invalid API Key: Please check your VITE_GROQ_API_KEY in .env file.");
        }

        throw new Error(`OCR Failed: ${error?.message || "Unknown error"}`);
    }
}
