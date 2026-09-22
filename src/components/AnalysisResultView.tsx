import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Copy, Check, Sparkles, Terminal } from "lucide-react";
import { motion } from "motion/react";
import { AnalysisResult } from "../types";

interface AnalysisResultViewProps {
  result: AnalysisResult;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  const { matchPercentage, matchingSkills, missingSkills, summary } = result;

  const formattedTextOutput = `Match: ${matchPercentage}%

Matching Skills:
${matchingSkills.length > 0 ? matchingSkills.map((s) => s).join("\n") : "None identified"}

Missing Skills:
${missingSkills.length > 0 ? missingSkills.map((s) => s).join("\n") : "None (All requirements met)"}

Summary:
${summary}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedTextOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Color scheme based on percentage
  const getMatchTheme = (score: number) => {
    if (score >= 80) {
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        bar: "bg-emerald-500",
        badge: "bg-emerald-100 text-emerald-800",
        label: "Strong Match",
      };
    }
    if (score >= 60) {
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        bar: "bg-amber-500",
        badge: "bg-amber-100 text-amber-800",
        label: "Moderate Match",
      };
    }
    return {
      bg: "bg-rose-50",
      text: "text-rose-800",
      border: "border-rose-200",
      bar: "bg-rose-500",
      badge: "bg-rose-100 text-rose-800",
      label: "Low Match",
    };
  };

  const theme = getMatchTheme(matchPercentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
    >
      {/* Top Header with Copy Action */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Analysis Results
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5" />
            {showRawText ? "Visual View" : "Plain Text View"}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Output
              </>
            )}
          </button>
        </div>
      </div>

      {showRawText ? (
        <div className="p-6">
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-indigo-600 selection:text-white">
            {formattedTextOutput}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Match Score Banner */}
          <div className={`p-5 rounded-xl border ${theme.border} ${theme.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Candidate Match Score
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-slate-900">
                  Match: {matchPercentage}%
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${theme.badge}`}>
                  {theme.label}
                </span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="sm:w-64 w-full">
              <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
                <span>Compatibility</span>
                <span>{matchPercentage} / 100</span>
              </div>
              <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${matchPercentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${theme.bar}`}
                />
              </div>
            </div>
          </div>

          {/* Grid of Matching vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Matching Skills */}
            <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/70 flex flex-col">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Matching Skills
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  {matchingSkills.length} Found
                </span>
              </div>

              {matchingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {matchingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-emerald-800 border border-emerald-200/80 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">
                  No overlapping skills identified.
                </p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/70 flex flex-col">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Missing Skills
                  </h3>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                  {missingSkills.length} Missing
                </span>
              </div>

              {missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {missingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-amber-900 border border-amber-200/80 shadow-2xs"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 font-medium py-2">
                  Candidate meets all required skills listed in the job description!
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/70">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Summary
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed font-normal">
              {summary}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
