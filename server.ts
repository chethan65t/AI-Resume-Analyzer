import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function analyzeWithHeuristics(resume: string, jobDescription: string) {
  const resumeLower = resume.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  // Known skill repository to identify relevant technical skills, tools, and methodologies
  const knownSkills = [
    "Python", "SQL", "Machine Learning", "AWS", "Django", "JavaScript", "TypeScript",
    "React", "Node.js", "Express", "Next.js", "Docker", "Kubernetes", "PostgreSQL",
    "MongoDB", "Redis", "Git", "CI/CD", "Linux", "PyTorch", "TensorFlow", "Pandas",
    "NumPy", "Scikit-Learn", "C++", "Java", "C#", "Go", "Rust", "GraphQL", "REST APIs",
    "FastAPI", "Flask", "GCP", "Azure", "HTML5", "CSS3", "Tailwind CSS", "Redux",
    "Webpack", "Vite", "Jest", "Cypress", "Kafka", "Elasticsearch", "Microservices",
    "System Design", "Agile", "Scrum", "DevOps", "Cybersecurity", "Data Analysis",
    "Deep Learning", "NLP", "Computer Vision", "ETL", "Tableau", "Power BI"
  ];

  // Also parse explicit requirement bullet points or capitalized phrases from JD
  const extractedFromJD: string[] = [];

  for (const skill of knownSkills) {
    // Regex matching whole word/term
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}([^a-zA-Z0-9#+]|$)`, "i");
    if (regex.test(jdLower)) {
      extractedFromJD.push(skill);
    }
  }

  // If no predefined skills matched, extract key phrases from lines with bullet points
  if (extractedFromJD.length === 0) {
    const lines = jobDescription.split("\n");
    for (const line of lines) {
      const trimmed = line.replace(/^[-•*–\d.]+\s*/, "").trim();
      if (trimmed.length > 2 && trimmed.length < 40 && !trimmed.endsWith(":") && !trimmed.toLowerCase().includes("requirement")) {
        extractedFromJD.push(trimmed);
      }
    }
  }

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of extractedFromJD) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}([^a-zA-Z0-9#+]|$)`, "i");
    if (regex.test(resumeLower)) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const total = matchingSkills.length + missingSkills.length;
  let matchPercentage = 75; // sensible baseline default if very few items
  if (total > 0) {
    matchPercentage = Math.round((matchingSkills.length / total) * 100);
  }

  // Generate concise HR summary
  let summary = "";
  if (matchingSkills.length > 0 && missingSkills.length > 0) {
    summary = `The candidate has several skills required for the job but may need experience with ${missingSkills.slice(0, 3).join(" and ")}.`;
  } else if (matchingSkills.length > 0 && missingSkills.length === 0) {
    summary = `The candidate possesses all of the core key skills and qualifications explicitly outlined in the job description.`;
  } else if (matchingSkills.length === 0 && missingSkills.length > 0) {
    summary = `The candidate is currently missing key required qualifications such as ${missingSkills.slice(0, 3).join(", ")}, presenting a lower match for this specific role.`;
  } else {
    summary = `The candidate profile partially aligns with the general domain requirements, though further technical screening is recommended.`;
  }

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
    summary,
  };
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "5mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Resume Analysis API
  app.post("/api/analyze-resume", async (req, res) => {
    try {
      const { resume, jobDescription } = req.body;

      if (!resume || typeof resume !== "string" || !resume.trim()) {
        return res.status(400).json({ error: "Candidate resume text is required." });
      }

      if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
        return res.status(400).json({ error: "Job description text is required." });
      }

      const ai = getGeminiClient();

      const prompt = `Candidate Resume:
${resume.trim()}

Job Description:
${jobDescription.trim()}

Please analyze how well the candidate's skills and experience match the job requirements as an HR recruitment assistant.
Identify:
1. Match percentage (0-100% integer based on direct requirement overlap, core skills, and qualifications).
2. Matching skills (skills clearly present in both candidate resume and job requirements).
3. Missing skills (skills required or preferred in the job description that are missing from the resume).
4. Short summary of the candidate's suitability (concise, clear, and direct assessment of suitability and any gaps).`;

      const config = {
        systemInstruction: `You are an AI Resume Analyzer and HR recruitment assistant.
Your role is to compare the candidate's resume with the given job description and identify how well the candidate's skills and experience match the job requirements.
Keep the response simple, clear, and concise. Always adhere to the requested schema.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchPercentage: {
              type: Type.INTEGER,
              description: "Match score percentage from 0 to 100",
            },
            matchingSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "List of skills and qualifications matched",
            },
            missingSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "List of required or desired skills not found in the resume",
            },
            summary: {
              type: Type.STRING,
              description: "Short, direct summary of the candidate's suitability and key gaps",
            },
          },
          required: ["matchPercentage", "matchingSkills", "missingSkills", "summary"],
        },
        temperature: 0.2,
      };

      let responseText: string | undefined;

      // Try primary model (gemini-3.8-flash)
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config,
        });
        responseText = response.text;
      } catch (err: any) {
        console.warn("Primary model error, attempting fallback model:", err.message);
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config,
          });
          responseText = fallbackResponse.text;
        } catch (fallbackErr: any) {
          console.warn("Fallback model also returned error:", fallbackErr.message);
        }
      }

      if (responseText) {
        const parsed = JSON.parse(responseText);
        const result = {
          matchPercentage: Math.max(0, Math.min(100, Math.round(Number(parsed.matchPercentage) || 0))),
          matchingSkills: Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [],
          missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
          summary: typeof parsed.summary === "string" ? parsed.summary : "Analysis completed.",
        };
        return res.json(result);
      }

      // Robust HR heuristic fallback if Gemini quota is exhausted
      const heuristicResult = analyzeWithHeuristics(resume, jobDescription);
      return res.json(heuristicResult);
    } catch (error: any) {
      console.error("Resume analysis error:", error);
      try {
        const heuristicResult = analyzeWithHeuristics(req.body?.resume || "", req.body?.jobDescription || "");
        return res.json(heuristicResult);
      } catch {
        return res.status(500).json({
          error: error.message || "Failed to analyze resume. Please check your inputs and try again.",
        });
      }
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
