export interface AnalysisResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  summary: string;
}

export interface PresetSample {
  id: string;
  title: string;
  role: string;
  resume: string;
  jobDescription: string;
}
