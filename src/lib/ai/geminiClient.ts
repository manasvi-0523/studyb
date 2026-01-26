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


export async function generateCombatDrills(
  payload: CombatDrillRequest
): Promise<CombatDrillResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const parts: any[] = [
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

  const response = await fetch(GEMINI_API_URL + "?key=" + apiKey, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("Failed to contact Gemini API");
  }

  const data = (await response.json()) as any;

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.[0]?.response_metadata?.json ??
    "";

  const parsed = JSON.parse(text);

  const questions: DrillQuestion[] = parsed.combatDrills;
  const flashcards: Flashcard[] = parsed.flashcards.map((card: any) => ({
    ...card,
    interval: 1,
    repetition: 0,
    ef: 2.5,
    dueAt: new Date().toISOString()
  }));

  return { questions, flashcards };
}

