import React from "react";
import { UserCheck, Sparkles, RefreshCw } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  hasContent: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasContent }) => {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                AI Resume Analyzer
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-3 h-3" />
                HR Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Objective skill-matching and candidate suitability evaluation
            </p>
          </div>
        </div>

        {hasContent && (
          <button
            onClick={onReset}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Clear all fields"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset All
          </button>
        )}
      </div>
    </header>
  );
};
