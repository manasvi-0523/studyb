import GroqRAG from "groq-rag";
import type { DrillQuestion, Flashcard, SubjectKey } from "../../types";

// Initialize Groq RAG client
let client: GroqRAG | null = null;
let isRAGInitialized = false;

const getGroqClient = (): GroqRAG => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GROQ_API_KEY is missing from environment variables. Please add it to your .env file.");
    }

    if (!client) {
        // dangerouslyAllowBrowser is needed for browser environments
        // groq-rag passes this to the underlying groq-sdk client
        client = new GroqRAG({
            apiKey,
            dangerouslyAllowBrowser: true
        } as any);
    }

    return client;
};

// Initialize RAG system with in-memory vector store
export async function initializeRAG(): Promise<void> {
    if (isRAGInitialized) return;

    const groq = getGroqClient();
    await groq.initRAG({
        embedding: { provider: "groq" },
        vectorStore: { provider: "memory" },
        chunking: {
            strategy: "recursive",
            chunkSize: 1000,
            chunkOverlap: 200
        }
    });
    isRAGInitialized = true;
}

// Response with timing info
export interface GenerationResult<T> {
    data: T;
    executionTime: number; // milliseconds
    tokensUsed?: number;
    source?: string;
}

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

// Web search result
export interface WebSearchResult {
    content: string;
    sources: string[];
    executionTime: number;
}

// URL fetch result
export interface URLFetchResult {
    content: string;
    url: string;
    executionTime: number;
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

// ==================== WEB SEARCH ====================

export interface SearchOptions {
    maxResults?: number;
    maxSnippetLength?: number;
    maxTotalContentLength?: number;
}

export async function searchWeb(
    query: string,
    options: SearchOptions = {}
): Promise<WebSearchResult> {
    const {
        maxResults = 5,
        maxSnippetLength = 300,
        maxTotalContentLength = 3000
    } = options;

    const startTime = performance.now();
    const groq = getGroqClient();

    try {
        const response = await groq.chat.withWebSearch({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: query }],
            maxResults,
            maxSnippetLength,
            maxTotalContentLength
        });

        const endTime = performance.now();
        const content = response.content || "";
        const sources = response.sources?.map((r) => r.url) || [];

        return {
            content,
            sources,
            executionTime: Math.round(endTime - startTime)
        };
    } catch (error) {
        console.error("Web search error:", error);
        throw new Error("Web search failed. Please try again.");
    }
}

// ==================== URL FETCH ====================

export interface FetchOptions {
    maxContentLength?: number;
    maxTokens?: number;
}

export async function fetchURL(
    url: string,
    prompt: string = "Summarize this content",
    options: FetchOptions = {}
): Promise<URLFetchResult> {
    const {
        maxContentLength = 5000,
        maxTokens = 1500
    } = options;

    const startTime = performance.now();
    const groq = getGroqClient();

    try {
        const response = await groq.chat.withUrl({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            url,
            maxContentLength,
            maxTokens
        });

        const endTime = performance.now();
        const content = response.content || "";

        return {
            content,
            url,
            executionTime: Math.round(endTime - startTime)
        };
    } catch (error) {
        console.error("URL fetch error:", error);
        throw new Error("Failed to fetch URL content. Please check the URL and try again.");
    }
}

// ==================== RAG WITH DOCUMENTS ====================

export async function queryWithRAG(
    question: string,
    documents: string[],
    maxChunks: number = 5
): Promise<GenerationResult<string>> {
    const startTime = performance.now();
    const groq = getGroqClient();

    try {
        // Initialize RAG if not already done
        await initializeRAG();
        const retriever = await groq.getRetriever();

        // Add documents to the retriever
        for (const doc of documents) {
            await retriever.addDocument(doc);
        }

        const response = await groq.chat.withRAG({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: question }],
            topK: maxChunks
        });

        const endTime = performance.now();
        const content = response.content || "";

        return {
            data: content,
            executionTime: Math.round(endTime - startTime),
            tokensUsed: response.usage?.totalTokens,
            source: "RAG"
        };
    } catch (error) {
        console.error("RAG query error:", error);
        throw new Error("RAG query failed. Please try again.");
    }
}

// ==================== QUIZ GENERATION ====================

export async function generateQuiz(
    materialText: string,
    subjectId: SubjectKey,
    questionCount: number = 5,
    useWebSearch: boolean = false
): Promise<GenerationResult<DrillQuestion[]>> {
    const startTime = performance.now();
    const groq = getGroqClient();

    let augmentedMaterial = materialText;

    // Optionally augment with web search
    if (useWebSearch) {
        try {
            const searchResult = await searchWeb(`${subjectId} key concepts: ${materialText.slice(0, 200)}`, { maxResults: 3 });
            augmentedMaterial = `${materialText}\n\nAdditional context from web:\n${searchResult.content}`;
        } catch (e) {
            console.warn("Web search augmentation failed, continuing with original material");
        }
    }

    const completion = await groq.complete({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: QUIZ_SYSTEM_PROMPT },
            { role: "user", content: `Generate ${questionCount} multiple choice questions from this study material about ${subjectId}:\n\n${augmentedMaterial}` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
    });

    const endTime = performance.now();
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

        return {
            data: questions,
            executionTime: Math.round(endTime - startTime),
            tokensUsed: completion.usage?.total_tokens,
            source: useWebSearch ? "AI + Web Search" : "AI"
        };
    } catch (error) {
        console.error("Failed to parse quiz response:", responseText);
        throw new Error("Failed to parse AI response. Please try again.");
    }
}

// ==================== FLASHCARD GENERATION ====================

export async function generateFlashcards(
    materialText: string,
    subjectId: SubjectKey,
    cardCount: number = 10,
    useWebSearch: boolean = false
): Promise<GenerationResult<Flashcard[]>> {
    const startTime = performance.now();
    const groq = getGroqClient();

    let augmentedMaterial = materialText;

    // Optionally augment with web search
    if (useWebSearch) {
        try {
            const searchResult = await searchWeb(`${subjectId} definitions and concepts: ${materialText.slice(0, 200)}`, { maxResults: 3 });
            augmentedMaterial = `${materialText}\n\nAdditional context from web:\n${searchResult.content}`;
        } catch (e) {
            console.warn("Web search augmentation failed, continuing with original material");
        }
    }

    const completion = await groq.complete({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: FLASHCARD_SYSTEM_PROMPT },
            { role: "user", content: `Generate ${cardCount} flashcards from this study material about ${subjectId}:\n\n${augmentedMaterial}` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
    });

    const endTime = performance.now();
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

        return {
            data: flashcards,
            executionTime: Math.round(endTime - startTime),
            tokensUsed: completion.usage?.total_tokens,
            source: useWebSearch ? "AI + Web Search" : "AI"
        };
    } catch (error) {
        console.error("Failed to parse flashcard response:", responseText);
        throw new Error("Failed to parse AI response. Please try again.");
    }
}

// ==================== MIND MAP GENERATION ====================

export async function generateMindMap(
    materialText: string,
    subjectId: SubjectKey
): Promise<GenerationResult<MindMapResponse>> {
    const startTime = performance.now();
    const groq = getGroqClient();

    const completion = await groq.complete({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: MINDMAP_SYSTEM_PROMPT },
            { role: "user", content: `Create a mind map structure from this study material about ${subjectId}:\n\n${materialText}` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
    });

    const endTime = performance.now();
    const responseText = completion.choices[0]?.message?.content || "";
    const cleanedJSON = extractJSON(responseText);

    try {
        const parsed = JSON.parse(cleanedJSON);
        return {
            data: {
                title: parsed.title || "Mind Map",
                nodes: parsed.nodes || []
            },
            executionTime: Math.round(endTime - startTime),
            tokensUsed: completion.usage?.total_tokens,
            source: "AI"
        };
    } catch (error) {
        console.error("Failed to parse mind map response:", responseText);
        throw new Error("Failed to parse AI response. Please try again.");
    }
}

// ==================== GENERATE FROM URL ====================

export async function generateFromURL(
    url: string,
    subjectId: SubjectKey,
    mode: "quiz" | "flashcards"
): Promise<GenerationResult<DrillQuestion[] | Flashcard[]>> {
    const startTime = performance.now();

    // First fetch and extract content from URL
    const fetchResult = await fetchURL(url, "Extract the main educational content from this page. Include key concepts, definitions, and important information.");

    // Then generate based on mode
    if (mode === "quiz") {
        const result = await generateQuiz(fetchResult.content, subjectId, 5, false);
        const endTime = performance.now();
        return {
            ...result,
            executionTime: Math.round(endTime - startTime),
            source: `URL: ${url}`
        };
    } else {
        const result = await generateFlashcards(fetchResult.content, subjectId, 10, false);
        const endTime = performance.now();
        return {
            ...result,
            executionTime: Math.round(endTime - startTime),
            source: `URL: ${url}`
        };
    }
}

// ==================== AI CHAT ====================

export interface ChatOptions {
    maxTokens?: number;
    searchMaxResults?: number;
    searchMaxSnippetLength?: number;
}

export async function chat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    useWebSearch: boolean = false,
    options: ChatOptions = {}
): Promise<GenerationResult<string>> {
    const {
        maxTokens = 2000,
        searchMaxResults = 3,
        searchMaxSnippetLength = 200
    } = options;

    const startTime = performance.now();
    const groq = getGroqClient();

    try {
        let content: string;
        let tokensUsed: number | undefined;

        if (useWebSearch) {
            // Use web search augmented chat with token limits
            const response = await groq.chat.withWebSearch({
                model: "llama-3.3-70b-versatile",
                messages,
                maxResults: searchMaxResults,
                maxSnippetLength: searchMaxSnippetLength,
                maxTotalContentLength: 2000
            });
            content = response.content || "";
        } else {
            // Regular chat
            const response = await groq.complete({
                model: "llama-3.3-70b-versatile",
                messages,
                temperature: 0.7,
                max_tokens: maxTokens
            });
            content = response.choices[0]?.message?.content || "";
            tokensUsed = response.usage?.total_tokens;
        }

        const endTime = performance.now();

        return {
            data: content,
            executionTime: Math.round(endTime - startTime),
            tokensUsed,
            source: useWebSearch ? "AI + Web Search" : "AI"
        };
    } catch (error) {
        console.error("Chat error:", error);
        throw new Error("Chat failed. Please try again.");
    }
}

// Legacy function for backwards compatibility
export async function generateCombatDrills(
    payload: CombatDrillRequest
): Promise<CombatDrillResponse> {
    const [quizResult, flashcardsResult] = await Promise.all([
        generateQuiz(payload.materialText, payload.subjectId, 5),
        generateFlashcards(payload.materialText, payload.subjectId, 10)
    ]);

    return {
        questions: quizResult.data,
        flashcards: flashcardsResult.data
    };
}
