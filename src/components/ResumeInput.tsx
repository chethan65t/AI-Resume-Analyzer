import React, { useRef } from "react";
import { FileText, Upload, Clipboard, X } from "lucide-react";

interface ResumeInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const ResumeInput: React.FC<ResumeInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        onChange(content);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again if needed
    e.target.value = "";
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch {
      // Clipboard access might be blocked by iframe permissions, safe fallback
    }
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-800">
            Candidate Resume
          </h2>
          <span className="text-xs text-slate-400">
            ({wordCount} words)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePaste}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition-colors disabled:opacity-50"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3 h-3" />
            Paste
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition-colors disabled:opacity-50"
            title="Upload text or markdown resume"
          >
            <Upload className="w-3 h-3" />
            Upload File
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.rtf,.json"
            onChange={handleFileUpload}
            className="hidden"
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 rounded-md transition-colors"
              title="Clear resume text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 p-3">
        <textarea
          id="candidate-resume-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste or type candidate resume details (experience, skills, projects, education)..."
          className="w-full h-72 sm:h-80 p-3 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 leading-relaxed font-mono"
        />
      </div>
    </div>
  );
};
