import { useState, useRef } from "react";
import { Plus, X, Sparkles } from "lucide-react";
import { generateCombatDrills } from "../../lib/ai/geminiClient";
import type { DrillQuestion, Flashcard, SubjectKey } from "../../types";

interface Props {
  onGenerated: (payload: { questions: DrillQuestion[]; flashcards: Flashcard[] }) => void;
}

import { extractTextFromFile, fileToBase64, isImageFile } from "../../lib/fileUtils";

export function StrategistPanel({ onGenerated }: Props) {
  const [subjectId, setSubjectId] = useState<SubjectKey>("biology");
  const [materialText, setMaterialText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File upload state
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!materialText.trim() && !attachedFile) return;
    try {
      setIsLoading(true);
      setError(null);

      let contextToProcess = materialText;
      let imagesData = undefined;

      if (attachedFile) {
        try {
          if (isImageFile(attachedFile)) {
            const base64 = await fileToBase64(attachedFile);
            imagesData = [{
              inlineData: {
                data: base64,
                mimeType: attachedFile.type
              }
            }];
            // Provide a context hint for the image
            if (!contextToProcess) contextToProcess = "See attached image for study material.";
          } else {
            // Text or PDF
            const fileText = await extractTextFromFile(attachedFile);
            contextToProcess = (contextToProcess + "\n\n" + fileText).trim();
          }
        } catch (fileErr: any) {
          console.error("File processing error:", fileErr);
          setError(`Failed to read file: ${fileErr.message || "Unknown error"}. Check console for details.`);
          setIsLoading(false);
          return;
        }
      }

      if (!contextToProcess && !imagesData) {
        setError("No content found in file or text area.");
        setIsLoading(false);
        return;
      }

      const result = await generateCombatDrills({
        subjectId,
        materialText: contextToProcess,
        images: imagesData
      });
      onGenerated(result);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`Failed to generate: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
      setShowAttachMenu(false);
    }
  };

  const clearFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

      <div className="relative">
        <textarea
          value={materialText}
          onChange={(e) => setMaterialText(e.target.value)}
          placeholder="Paste notes or summary from your PDF..."
          className="w-full h-32 bg-surface/80 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent/70 resize-none pb-10"
        />

        {/* Attachment UI */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {attachedFile && (
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md text-[10px] text-white/80 animate-in fade-in slide-in-from-bottom-1">
              <span className="max-w-[100px] truncate">{attachedFile.name}</span>
              <button onClick={clearFile} className="hover:text-urgent">
                <X size={12} />
              </button>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Plus size={16} />
            </button>

            {showAttachMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[140px] z-10 animate-in zoom-in-95 duration-100">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5 flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-secondary" />
                  <span>Local File</span>
                </button>
                <button
                  onClick={() => alert("Google Drive integration coming soon!")}
                  className="w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5 flex items-center gap-2"
                >
                  {/* Simple 'G' icon placeholder */}
                  <span className="font-bold text-blue-400 text-[10px] w-3.5 h-3.5 flex items-center justify-center border border-current rounded-sm">G</span>
                  <span>Google Drive</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && <div className="text-[11px] text-urgent">{error}</div>}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading || (!materialText.trim() && !attachedFile)}
        className="neon-button px-3 py-2 rounded-lg bg-accent text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed w-full"
      >
        {isLoading ? "Generating..." : "Generate Combat Drills + Flashcards"}
      </button>
    </div>
  );
}

