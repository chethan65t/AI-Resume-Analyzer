import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ResumeInput } from "./components/ResumeInput";
import { JobDescriptionInput } from "./components/JobDescriptionInput";
import { AnalysisResultView } from "./components/AnalysisResultView";
import { PresetSelector } from "./components/PresetSelector";
import { AnalysisResult, PresetSample } from "./types";
import { PRESET_SAMPLES } from "./data/presets";
import { Play, Loader2, AlertCircle, Sparkles } from "lucide-react";

export default function App() {
  const [resume, setResume] = useState<string>(PRESET_SAMPLES[0].resume);
  const [jobDescription, setJobDescription] = useState<string>(PRESET_SAMPLES[0].jobDescription);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to run analysis
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleAnalyze();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resume, jobDescription, isAnalyzing]);

  const handleSelectPreset = (preset: PresetSample) => {
    setResume(preset.resume);
    setJobDescription(preset.jobDescription);
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setResume("");
    setJobDescription("");
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!resume.trim()) {
      setError("Please provide the candidate's resume text.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please provide the job description text.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resume.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById("analysis-results-section");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasContent = Boolean(resume.trim() || jobDescription.trim() || result);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800">
      <Header onReset={handleReset} hasContent={hasContent} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Intro banner */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              HR Candidate & Job Match Evaluation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
              Compare candidate qualifications against your job requirements to instantly identify match percentage, matched skills, gaps, and an HR recruitment summary.
            </p>
          </div>

          <PresetSelector onSelect={handleSelectPreset} disabled={isAnalyzing} />
        </div>

        {/* Input Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <ResumeInput
            value={resume}
            onChange={(val) => {
              setResume(val);
              if (error) setError(null);
            }}
            disabled={isAnalyzing}
          />

          <JobDescriptionInput
            value={jobDescription}
            onChange={(val) => {
              setJobDescription(val);
              if (error) setError(null);
            }}
            disabled={isAnalyzing}
          />
        </div>

        {/* Action controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">
            <span className="hidden sm:inline">Tip: Press </span>
            <kbd className="px-2 py-0.5 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded shadow-xs">
              Ctrl / ⌘ + Enter
            </kbd>
            <span className="hidden sm:inline"> to analyze</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {(resume || jobDescription) && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isAnalyzing}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Clear Inputs
              </button>
            )}

            <button
              id="analyze-button"
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resume.trim() || !jobDescription.trim()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Analyze Match
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Unable to complete analysis</p>
              <p className="text-xs sm:text-sm text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div id="analysis-results-section" className="pt-2">
            <AnalysisResultView result={result} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-4 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-400">
          AI Resume Analyzer • HR Recruitment Assistant Powered by Gemini
        </div>
      </footer>
    </div>
  );
}
