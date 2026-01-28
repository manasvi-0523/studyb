import type { DrillQuestion, Flashcard, SubjectKey } from "../../types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

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


interface GeminiPart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

interface GeminiCandidate {
  content: {
    parts: GeminiPart[];
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function validateConfig() {
  if (!API_KEY) {
    throw new Error("CRITICAL: VITE_GEMINI_API_KEY is missing from environment variables.");
  }
}

export async function generateCombatDrills(
  payload: CombatDrillRequest
): Promise<CombatDrillResponse> {
  validateConfig();

  const parts: GeminiPart[] = [
    {
      text:
        SYSTEM_PROMPT +
        "\n\nSubject: " +
        payload.subjectId +
        "\n\nStudy material:\n" +
        payload.materialText
    }
  ];

  if (payload.images) {
    parts.push(...payload.images);
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: parts
      }
    ]
  };

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Failed to contact Gemini API: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as GeminiResponse;

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text) {
    throw new Error("Gemini API returned an empty response");
  }

  let parsed: { combatDrills: DrillQuestion[]; flashcards: Flashcard[] };
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Received malformed response from AI");
  }

  const questions: DrillQuestion[] = parsed.combatDrills;
  const flashcards: Flashcard[] = (parsed.flashcards ?? []).map((card: Partial<Flashcard>) => ({
    id: card.id ?? crypto.randomUUID(),
    front: card.front ?? "",
    back: card.back ?? "",
    subjectId: card.subjectId ?? payload.subjectId,
    interval: 1,
    repetition: 0,
    ef: 2.5,
    dueAt: new Date().toISOString()
  })) as Flashcard[];

  return { questions, flashcards };
}

