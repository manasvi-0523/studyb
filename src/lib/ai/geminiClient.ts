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

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Failed to contact Gemini API: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as any;

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    // @ts-ignore - response_metadata might be present in some versions/proxy responses
    data?.candidates?.[0]?.content?.parts?.[0]?.response_metadata?.json ??
    "";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Received malformed response from AI");
  }

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

