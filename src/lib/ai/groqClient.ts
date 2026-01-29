import type { DrillQuestion, Flashcard, SubjectKey } from "../../types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface CombatDrillRequest {
    materialText: string;
    subjectId: SubjectKey;
    images?: {
        inlineData: {
            data: string;
            mimeType: string;
        };
    }[];
}

export interface CombatDrillResponse {
    questions: DrillQuestion[];
    flashcards: Flashcard[];
}

const SYSTEM_PROMPT =
    "You are a rigorous examiner for elite competitive exams. " +
    "Focus on application and analysis, not memorization. " +
    "Given study material, generate exactly 5 difficult MCQs as 'combatDrills' " +
    "and 10 spaced-repetition flashcards as 'flashcards'. " +
    "Return only minified JSON with fields { combatDrills: [...], flashcards: [...] } " +
    "where MCQs include id, question, options, correctOptionId, explanation, subjectId, difficulty='hard' " +
    "and flashcards include id, front, back, subjectId.";

function validateConfig() {
    if (!API_KEY) {
        throw new Error("CRITICAL: VITE_GROQ_API_KEY is missing from environment variables.");
    }
}

export async function generateCombatDrills(
    payload: CombatDrillRequest
): Promise<CombatDrillResponse> {
    validateConfig();

    const userPrompt =
        SYSTEM_PROMPT +
        "\n\nSubject: " +
        payload.subjectId +
        "\n\nStudy material:\n" +
        payload.materialText;

    // Groq uses OpenAI-compatible format
    const messages: any[] = [
        {
            role: "user",
            content: userPrompt
        }
    ];

    // If images are provided, use vision model with multimodal content
    if (payload.images && payload.images.length > 0) {
        messages[0].content = [
            { type: "text", text: userPrompt },
            ...payload.images.map(img => ({
                type: "image_url",
                image_url: {
                    url: `data:${img.inlineData.mimeType};base64,${img.inlineData.data}`
                }
            }))
        ];
    }

    const body = {
        model: payload.images && payload.images.length > 0
            ? "llama-3.2-11b-vision-preview"  // Smaller vision model - higher limits
            : "llama-3.1-8b-instant",          // Fast model with high rate limits
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000
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
        const errBody = await response.text();
        console.error("Groq API Error Response:", errBody);

        if (response.status === 429) {
            throw new Error("API Rate Limit Exceeded: You've sent too many requests. Please wait and try again.");
        }

        const keyHint = API_KEY ? `${API_KEY.substring(0, 8)}...` : "MISSING";
        throw new Error(`Failed to contact Groq API: ${response.status} ${response.statusText} (Key: ${keyHint}). Check console for details.`);
    }

    const data = await response.json();
    let text = data?.choices?.[0]?.message?.content ?? "";

    if (!text) {
        throw new Error("Groq API returned an empty response");
    }

    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        text = jsonMatch[1].trim();
    }

    // Also try to find JSON object directly
    const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
        text = jsonObjectMatch[0];
    }

    console.log("Cleaned AI response:", text.substring(0, 200) + "...");

    let parsed: { combatDrills: DrillQuestion[]; flashcards: Flashcard[] };
    try {
        parsed = JSON.parse(text);
    } catch (error) {
        console.error("Failed to parse Groq response:", text);
        throw new Error("Received malformed response from AI. Check console for raw output.");
    }

    const questions: DrillQuestion[] = parsed.combatDrills;
    const flashcards: Flashcard[] = (parsed.flashcards ?? []).map((card: Partial<Flashcard>, index: number) => {
        const dueAt = new Date();
        dueAt.setSeconds(dueAt.getSeconds() + (index * 5));

        return {
            id: card.id ?? crypto.randomUUID(),
            front: card.front ?? "",
            back: card.back ?? "",
            subjectId: card.subjectId ?? payload.subjectId,
            interval: 1,
            repetition: 0,
            ef: 2.5,
            dueAt: dueAt.toISOString()
        };
    }) as Flashcard[];

    return { questions, flashcards };
}
