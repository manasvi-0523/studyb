import Groq from "groq-sdk";
import type { DrillQuestion, Flashcard, SubjectKey } from "../../types";

// Initialize Groq client with API key from environment
const getGroqClient = () => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GROQ_API_KEY is missing from environment variables. Please add it to your .env file.");
    }
    return new Groq({
        apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    });
};

export interface CombatDrillRequest {
    materialText: string;
    subjectId: SubjectKey;
}

export interface CombatDrillResponse {
    questions: DrillQuestion[];
    flashcards: Flashcard[];
}

export interface MindMapNode {
    id: string;
    label: string;
    children?: MindMapNode[];
}

export interface MindMapResponse {
    title: string;
    nodes: MindMapNode[];
}

const QUIZ_SYSTEM_PROMPT = `You are an expert educational content creator. Generate high-quality multiple choice questions from the given study material.

For each question:
- Create challenging but fair questions that test understanding, not just memorization
- Include 4 options labeled A, B, C, D
- Provide clear explanations for the correct answer
- Vary difficulty levels

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
    "combatDrills": [
        {
            "id": "q1",
            "question": "Question text here?",
            "options": [
                {"id": "a", "text": "Option A"},
                {"id": "b", "text": "Option B"},
                {"id": "c", "text": "Option C"},
                {"id": "d", "text": "Option D"}
            ],
            "correctOptionId": "a",
            "explanation": "Explanation of why this is correct",
            "difficulty": "medium"
        }
    ]
}`;

const FLASHCARD_SYSTEM_PROMPT = `You are an expert educational content creator specializing in spaced repetition learning. Create effective flashcards from the given study material.

Guidelines:
- Front: Ask a clear, focused question or present a term/concept
- Back: Provide a concise but complete answer
- Cover key concepts, definitions, formulas, and important facts
- Make them suitable for active recall practice

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
    "flashcards": [
        {
            "id": "f1",
            "front": "What is [concept]?",
            "back": "Clear, concise answer"
        }
    ]
}`;

const MINDMAP_SYSTEM_PROMPT = `You are an expert at organizing information hierarchically. Create a mind map structure from the given study material.

Guidelines:
- Identify the main topic as the root
- Organize subtopics logically
- Include key details as leaf nodes
- Keep labels concise but meaningful
- Create a balanced tree structure (3-5 main branches, 2-4 sub-items each)

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
    "title": "Main Topic",
    "nodes": [
        {
            "id": "n1",
            "label": "Subtopic 1",
            "children": [
                {"id": "n1a", "label": "Detail 1"},
                {"id": "n1b", "label": "Detail 2"}
            ]
        },
        {
            "id": "n2",
            "label": "Subtopic 2",
            "children": [
                {"id": "n2a", "label": "Detail 1"}
            ]
        }
    ]
}`;

// Parse JSON from potential markdown code blocks
function extractJSON(text: string): string {
    // Try to extract from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        return jsonMatch[1].trim();
    }
    // Try to find raw JSON object
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        return objectMatch[0];
    }
    return text;
}

export async function generateQuiz(
    materialText: string,
    subjectId: SubjectKey,
    questionCount: number = 5
): Promise<DrillQuestion[]> {
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: QUIZ_SYSTEM_PROMPT
            },
            {
                role: "user",
                content: `Generate ${questionCount} multiple choice questions from this study material about ${subjectId}:\n\n${materialText}`
            }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const cleanedJSON = extractJSON(responseText);

    try {
        const parsed = JSON.parse(cleanedJSON);
        const questions: DrillQuestion[] = (parsed.combatDrills || []).map((q: any, idx: number) => ({
            id: q.id || `q${idx + 1}`,
            question: q.question,
            options: q.options,
            correctOptionId: q.correctOptionId,
            explanation: q.explanation,
            subjectId: subjectId,
            difficulty: q.difficulty || "medium"
        }));
        return questions;
    } catch (error) {
        console.error("Failed to parse quiz response:", responseText);
        throw new Error("Failed to parse AI response. Please try again.");
    }
}

export async function generateFlashcards(
    materialText: string,
    subjectId: SubjectKey,
    cardCount: number = 10
): Promise<Flashcard[]> {
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: FLASHCARD_SYSTEM_PROMPT
            },
            {
                role: "user",
                content: `Generate ${cardCount} flashcards from this study material about ${subjectId}:\n\n${materialText}`
            }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const cleanedJSON = extractJSON(responseText);

    try {
        const parsed = JSON.parse(cleanedJSON);
        const flashcards: Flashcard[] = (parsed.flashcards || []).map((card: any, idx: number) => {
            const dueAt = new Date();
            dueAt.setSeconds(dueAt.getSeconds() + (idx * 5));

            return {
                id: card.id || `f${idx + 1}`,
                front: card.front,
                back: card.back,
                subjectId: subjectId,
                interval: 1,
                repetition: 0,
                ef: 2.5,
                dueAt: dueAt.toISOString()
            };
        });
        return flashcards;
    } catch (error) {
        console.error("Failed to parse flashcard response:", responseText);
        throw new Error("Failed to parse AI response. Please try again.");
    }
}

export async function generateMindMap(
    materialText: string,
    subjectId: SubjectKey
): Promise<MindMapResponse> {
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: MINDMAP_SYSTEM_PROMPT
            },
            {
                role: "user",
                content: `Create a mind map structure from this study material about ${subjectId}:\n\n${materialText}`
            }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const cleanedJSON = extractJSON(responseText);

    try {
        const parsed = JSON.parse(cleanedJSON);
        return {
            title: parsed.title || "Mind Map",
            nodes: parsed.nodes || []
        };
    } catch (error) {
        console.error("Failed to parse mind map response:", responseText);
        throw new Error("Failed to parse AI response. Please try again.");
    }
}

// Legacy function for backwards compatibility
export async function generateCombatDrills(
    payload: CombatDrillRequest
): Promise<CombatDrillResponse> {
    const [questions, flashcards] = await Promise.all([
        generateQuiz(payload.materialText, payload.subjectId, 5),
        generateFlashcards(payload.materialText, payload.subjectId, 10)
    ]);

    return { questions, flashcards };
}
