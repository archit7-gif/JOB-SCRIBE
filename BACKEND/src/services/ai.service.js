

const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({})
class AIService {
    // Step 1: Analysis with suggestions only
    async analyzeResumeForJob(resumeContent, jobDescription) {
        try {
            if (!process.env.GOOGLE_API_KEY) {
                console.error("GOOGLE_API_KEY not found");
                return this.getFallbackAnalysis();
            }

            const prompt = `
Analyze this resume against the job description and provide improvement suggestions.
Return only JSON in this format:

{
  "matchScore": 75,
  "strengths": ["What matches well", "..."],
  "suggestions": ["Add TypeScript to skills section", "Emphasize leadership experience", "Include metrics in achievements", "..."],
  "missingKeywords": ["TypeScript", "Docker", "AWS", "..."],
  "sectionsToImprove": ["Skills section needs cloud technologies", "Experience section lacks quantifiable results"]
}

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}
`;

            const model = ai.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction:
                    "Return only valid JSON. No markdown, no code blocks. Provide detailed, actionable suggestions.",
            });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text().trim();

            let cleaned = this.cleanJSONResponse(responseText);
            const analysis = JSON.parse(cleaned);

            if (!this.isValidAnalysis(analysis)) {
                console.warn("Invalid AI analysis structure");
                return this.getFallbackAnalysis();
            }

            // Ensure arrays are not empty
            analysis.strengths = analysis.strengths || ["Resume has relevant experience"];
            analysis.suggestions =
                analysis.suggestions?.length > 0
                    ? analysis.suggestions
                    : ["Resume is well-structured"];
            analysis.missingKeywords = analysis.missingKeywords || [];
            analysis.sectionsToImprove = analysis.sectionsToImprove || [];

            return analysis;
        } catch (error) {
            console.error("AI Analysis Error:", error.message);
            return this.getFallbackAnalysis();
        }
    }

    // Step 2: Generate complete optimized resume
    async generateResumeOptimization(resumeContent, jobDescription, suggestions) {
        try {
            if (!process.env.GOOGLE_API_KEY) {
                console.error("GOOGLE_API_KEY not found");
                return this.getFallbackOptimization(resumeContent);
            }

            const prompt = `
You are an expert resume writer. Rewrite this COMPLETE resume to perfectly match the job description while keeping all original information.

ORIGINAL RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

SUGGESTIONS TO IMPLEMENT:
${suggestions.join("\n- ")}

INSTRUCTIONS:
1. Rewrite the ENTIRE resume from top to bottom.
2. Keep the same structure (name, summary, skills, experience, education, certifications).
3. Add missing keywords naturally throughout.
4. Quantify achievements with metrics.
5. Emphasize relevant skills and experience.
6. Use action verbs and strong language.
7. Make it ATS-friendly.
8. Keep all dates, company names, and factual information accurate.

Return ONLY the complete optimized resume text. No JSON, no explanations, just the resume content.
`;

            const model = ai.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction:
                    "Return only the complete optimized resume text. No JSON, no markdown formatting, no extra commentary.",
            });

            const result = await model.generateContent(prompt);
            let optimizedContent = result.response.text().trim();

            // Clean any markdown formatting
            optimizedContent = optimizedContent
                .replace(/```[\s\S]*?```/g, "")
                .replace(/\*\*/g, "");

            if (optimizedContent.length < 100) {
                console.warn("Optimized content too short, using original");
                return this.getFallbackOptimization(resumeContent);
            }

            return {
                optimizedContent,
                success: true,
            };
        } catch (error) {
            console.error("Resume Optimization Error:", error.message);
            return this.getFallbackOptimization(resumeContent);
        }
    }

    cleanJSONResponse(text) {
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const startIndex = text.indexOf("{");
        if (startIndex > 0) {
            text = text.substring(startIndex);
        }

        const endIndex = text.lastIndexOf("}");
        if (endIndex >= 0) {
            text = text.substring(0, endIndex + 1);
        }

        return text.trim();
    }

    isValidAnalysis(analysis) {
        return (
            analysis &&
            typeof analysis.matchScore === "number" &&
            Array.isArray(analysis.suggestions)
        );
    }

    getFallbackAnalysis() {
        return {
            matchScore: 0,
            strengths: ["Resume structure is clear"],
            suggestions: [
                "AI analysis temporarily unavailable. Please try again later.",
            ],
            missingKeywords: [],
            sectionsToImprove: [],
        };
    }

    getFallbackOptimization(originalContent) {
        return {
            optimizedContent: originalContent,
            success: false,
            error: "Optimization temporarily unavailable",
        };
    }
}

module.exports = new AIService();