const { GoogleGenAI } = require("@google/genai")

class AIService {
    constructor() {
        if (process.env.GOOGLE_API_KEY) {
            this.genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
        }
    }

    async analyzeResumeForJob(resumeContent, jobDescription) {
        try {
            if (!this.genAI) return this.getFallbackAnalysis()

            // Truncate to avoid token limits
            const resume = resumeContent.substring(0, 5000)
            const job = jobDescription.substring(0, 2000)

            const prompt = `Analyze this resume against the job description. Return only valid JSON:

{"matchScore":75,"strengths":["..."],"suggestions":["..."],"missingKeywords":["..."],"sectionsToImprove":["..."]}

RESUME: ${resume}
JOB: ${job}`

            const response = await this.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
                config: { temperature: 0.3 }
            })

            if (!response?.text) return this.getFallbackAnalysis()

            const cleaned = this.cleanJSON(response.text.trim())
            const analysis = JSON.parse(cleaned)

            if (!this.isValid(analysis)) return this.getFallbackAnalysis()

            return {
                matchScore: analysis.matchScore || 0,
                strengths: analysis.strengths?.length > 0 
                    ? analysis.strengths 
                    : ["Resume has relevant experience"],
                suggestions: analysis.suggestions?.length > 0 
                    ? analysis.suggestions 
                    : ["Resume is well-structured"],
                missingKeywords: analysis.missingKeywords || [],
                sectionsToImprove: analysis.sectionsToImprove || []
            }
        } catch (error) {
            return this.getFallbackAnalysis()
        }
    }

    async generateResumeOptimization(resumeContent, jobDescription, suggestions) {
        try {
            if (!this.genAI) return this.getFallbackOptimization(resumeContent)

            const prompt = `Rewrite this COMPLETE resume to match the job description.

ORIGINAL: ${resumeContent}
JOB: ${jobDescription}
APPLY: ${suggestions.join(", ")}

Return ONLY the optimized resume text. No JSON, no markdown.`

            const response = await this.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
                config: { temperature: 0.6 }
            })

            if (!response?.text) return this.getFallbackOptimization(resumeContent)

            // Clean markdown and code blocks
            const optimized = response.text
                .trim()
                .replace(/``````/gi, "")
                .replace(/\*\*/g, "")
                .trim()

            return optimized.length > 100
                ? { optimizedContent: optimized, success: true }
                : this.getFallbackOptimization(resumeContent)
        } catch (error) {
            return this.getFallbackOptimization(resumeContent)
        }
    }

    cleanJSON(text) {
        // Remove markdown code blocks
        text = text.replace(/``````/gi, "").trim()
        
        // Extract JSON object
        const start = text.indexOf("{")
        const end = text.lastIndexOf("}")
        
        return start >= 0 && end >= 0 ? text.substring(start, end + 1) : text
    }

    isValid(analysis) {
        return (
            analysis && 
            typeof analysis.matchScore === "number" && 
            Array.isArray(analysis.suggestions)
        )
    }

    getFallbackAnalysis() {
        return {
            matchScore: 0,
            strengths: ["Resume structure is clear"],
            suggestions: ["AI temporarily unavailable"],
            missingKeywords: [],
            sectionsToImprove: []
        }
    }

    getFallbackOptimization(content) {
        return { 
            optimizedContent: content, 
            success: false 
        }
    }
}


module.exports = new AIService()

