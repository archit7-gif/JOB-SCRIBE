

const { GoogleGenAI } = require("@google/genai")

class AIService {
    constructor() {
        if (process.env.GOOGLE_API_KEY) {
            this.genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
        }
    }

    // Analyze resume against job description
    async analyzeResumeForJob(resumeContent, jobDescription) {
        try {
            if (!this.genAI) return this.getFallbackAnalysis()

            const prompt = `Analyze this resume against the job description. Return only valid JSON:

{"matchScore":75,"strengths":["..."],"suggestions":["..."],"missingKeywords":["..."],"sectionsToImprove":["..."]}

RESUME: ${resumeContent.substring(0, 5000)}
JOB: ${jobDescription.substring(0, 2000)}`

            const response = await this.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
                config: { temperature: 0.3 }
            })

            if (!response?.text) return this.getFallbackAnalysis()

            const analysis = JSON.parse(this.cleanJSON(response.text.trim()))
            if (!this.isValid(analysis)) return this.getFallbackAnalysis()

            return {
                matchScore: analysis.matchScore || 0,
                strengths: analysis.strengths?.length > 0 ? analysis.strengths : ["Resume has relevant experience"],
                suggestions: analysis.suggestions?.length > 0 ? analysis.suggestions : ["Resume is well-structured"],
                missingKeywords: analysis.missingKeywords || [],
                sectionsToImprove: analysis.sectionsToImprove || []
            }
        } catch (error) {
            console.error('Analysis error:', error)
            return this.getFallbackAnalysis()
        }
    }

    // Generate optimized resume content
    async generateResumeOptimization(resumeContent, jobDescription, suggestions) {
        try {
            if (!this.genAI) return this.getFallbackOptimization(resumeContent)

            const prompt = `You are an expert ATS resume optimizer. Rewrite this resume to perfectly match the job description while staying 100% truthful.

ORIGINAL RESUME:
${resumeContent}

TARGET JOB:
${jobDescription}

SUGGESTIONS TO APPLY:
${suggestions.join("\n- ")}

OPTIMIZATION RULES:
1. Rewrite 60-80% of content to match job requirements
2. If fresher → Make projects prominent, DO NOT create fake work experience
3. Use job keywords naturally, quantify achievements with metrics
4. Keep professional structure and formatting
5. FORBIDDEN: Fake companies, "| null", invented certifications, hallucinated experience

OUTPUT: Complete optimized resume text (no JSON, no markdown, start with candidate name)`

            const response = await this.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
                config: { temperature: 0.5, maxOutputTokens: 3500 }
            })

            if (!response?.text) return this.getFallbackOptimization(resumeContent)

            let optimized = response.text.trim().replace(/```/g,"")

            // Remove fake sections
            if (optimized.includes('| null') || /current focus|goals/i.test(optimized)) {
                optimized = optimized.split('\n')
                    .filter(line => !line.includes('| null') && !/current focus/i.test(line))
                    .join('\n')
            }

            // Validate output length
            if (optimized.length < resumeContent.length * 0.4) {
                return this.getFallbackOptimization(resumeContent)
            }

            return { optimizedContent: optimized, success: true }
        } catch (error) {
            console.error('Optimization error:', error)
            return this.getFallbackOptimization(resumeContent)
        }
    }

    // Clean JSON response from AI
    cleanJSON(text) {
        text = text.replace(/```json/gi, "").replace(/```/g,"")
        const start = text.indexOf("{")
        const end = text.lastIndexOf("}")
        return start >= 0 && end >= 0 ? text.substring(start, end + 1) : text
    }

    // Validate analysis response
    isValid(analysis) {
        return analysis && typeof analysis.matchScore === "number" && Array.isArray(analysis.suggestions)
    }

    // Fallback when AI unavailable
    getFallbackAnalysis() {
        return {
            matchScore: 0,
            strengths: ["Resume structure is clear"],
            suggestions: ["AI temporarily unavailable"],
            missingKeywords: [],
            sectionsToImprove: []
        }
    }

    // Fallback when optimization fails
    getFallbackOptimization(content) {
        return { optimizedContent: content, success: false }
    }
}

module.exports = new AIService()
