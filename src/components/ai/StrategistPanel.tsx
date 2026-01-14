import { useState } from "react";
import { generateCombatDrills } from "../../lib/ai/geminiClient";
import type { DrillQuestion, Flashcard, SubjectKey } from "../../types";

interface Props {
  onGenerated: (payload: { questions: DrillQuestion[]; flashcards: Flashcard[] }) => void;
}

export function StrategistPanel({ onGenerated }: Props) {
  const [subjectId, setSubjectId] = useState<SubjectKey>("biology");
  const [materialText, setMaterialText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!materialText.trim()) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await generateCombatDrills({ subjectId, materialText });
      onGenerated(result);
    } catch (err) {
      setError("Failed to generate combat drills");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-white/80">The Strategist</div>
          <div className="text-[11px] text-white/40">
            Drop material. Receive drills and flashcards.
          </div>
        </div>
      </div>
      <select
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value as SubjectKey)}
        className="w-full bg-surface/80 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent/70"
      >
        <option value="biology">Biology</option>
        <option value="physics">Physics</option>
        <option value="chemistry">Chemistry</option>
        <option value="maths">Maths</option>
        <option value="other">Other</option>
      </select>
      <textarea
        value={materialText}
        onChange={(e) => setMaterialText(e.target.value)}
        placeholder="Paste notes or summary from your PDF. PDF upload can be wired to Supabase storage."
        className="w-full h-32 bg-surface/80 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent/70 resize-none"
      />
      {error && <div className="text-[11px] text-urgent">{error}</div>}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading || !materialText.trim()}
        className="neon-button px-3 py-2 rounded-lg bg-accent text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isLoading ? "Generating..." : "Generate Combat Drills + Flashcards"}
      </button>
    </div>
  );
}

