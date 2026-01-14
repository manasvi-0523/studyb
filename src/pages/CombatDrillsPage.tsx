import { useState } from "react";
import type { DrillQuestion, Flashcard } from "../types";
import { StrategistPanel } from "../components/ai/StrategistPanel";

export function CombatDrillsPage() {
  const [questions, setQuestions] = useState<DrillQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const selectedQuestion =
    questions.find((q) => q.id === selectedQuestionId) ?? questions[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            Combat Drills
          </div>
          <div className="text-lg text-white/90">
            High-difficulty MCQs tuned for application and analysis.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-panel rounded-xl p-4">
          {selectedQuestion ? (
            <div className="space-y-3">
              <div className="text-xs text-accent uppercase tracking-[0.25em]">
                Q{questions.indexOf(selectedQuestion) + 1} / {questions.length}
              </div>
              <div className="text-sm text-white/90">{selectedQuestion.question}</div>
              <div className="space-y-2 mt-2">
                {selectedQuestion.options.map((option) => {
                  const picked = answers[selectedQuestion.id];
                  const isCorrect = option.id === selectedQuestion.correctOptionId;
                  const isPicked = picked === option.id;
                  let bg = "bg-surface/80 border-white/8";
                  if (picked) {
                    if (isCorrect) bg = "bg-accent/30 border-accent/60";
                    else if (isPicked) bg = "bg-urgent/30 border-urgent/60";
                  }
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [selectedQuestion.id]: option.id
                        }))
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs ${bg}`}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
              {answers[selectedQuestion.id] && (
                <div className="mt-3 text-[11px] text-white/70">
                  {selectedQuestion.explanation}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-white/50">
              Generate a combat drill set from your notes to begin.
            </div>
          )}
        </div>
        <div className="space-y-4">
          <StrategistPanel
            onGenerated={({ questions: qs, flashcards: cards }) => {
              setQuestions(qs);
              setFlashcards(cards);
              setSelectedQuestionId(qs[0]?.id ?? null);
            }}
          />
          <div className="glass-panel rounded-xl p-3 text-[11px] text-white/60">
            <div className="text-white/70 mb-1">Flashcards queued</div>
            <div>{flashcards.length} cards added to SRS queue.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

