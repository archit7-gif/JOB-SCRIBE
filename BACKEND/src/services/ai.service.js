

const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({})

class AIService {
    async analyzeResumeForJob(resumeContent, jobDescription) {
        try {
            if (!process.env.GOOGLE_API_KEY) {
                console.error('GOOGLE_API_KEY not found')
                return this.getFallbackAnalysis()
            }

            const content = `Analyze this resume against the job description. Return only a JSON object with no extra text or markdown:

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Return this JSON format:
{"matchScore": 75, "suggestions": ["Add more React experience", "Include TypeScript skills"], "missingKeywords": ["React", "TypeScript"]}`

            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: content,
                config: {
                    temperature: 0.3,
                    systemInstruction: "Return only valid JSON. No markdown, no code blocks, no extra text."
                }
            })

            let responseText = response.text.trim()

            responseText = this.cleanJSONResponse(responseText)

            const analysis = JSON.parse(responseText)

            if (!this.isValidAnalysis(analysis)) {
                return this.getFallbackAnalysis()
            }

            return analysis

        } catch (error) {
            console.error('AI Analysis Error:', error.message)
            return this.getFallbackAnalysis()
        }
    }

    cleanJSONResponse(text) {
        text = text.replace(/```/g, '')

        const startIndex = text.indexOf('{')
        if (startIndex > 0) {
            text = text.substring(startIndex)
        }

        const endIndex = text.lastIndexOf('}')
        if (endIndex >= 0) {
            text = text.substring(0, endIndex + 1)
        }

        return text.trim()
    }

    isValidAnalysis(analysis) {
        return (
            analysis &&
            typeof analysis.matchScore === 'number' &&
            Array.isArray(analysis.suggestions) &&
            Array.isArray(analysis.missingKeywords)
        )
    }

    getFallbackAnalysis() {
        return {
            matchScore: 0,
            suggestions: ['AI analysis temporarily unavailable. Please try again later.'],
            missingKeywords: []
        }
    }

    async generateResumeOptimization(resumeContent, jobDescription) {
        try {
            const content = `Optimize this resume for the job. Return only JSON:

RESUME: ${resumeContent}
JOB: ${jobDescription}

Return: {"optimizedContent": "improved text", "changes": ["change1", "change2"]}`

            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: content,
                config: {
                    temperature: 0.6,
                    systemInstruction: "Return only valid JSON without markdown formatting."
                }
            })

            let responseText = this.cleanJSONResponse(response.text)
            return JSON.parse(responseText)

        } catch (error) {
            console.error('Resume Optimization Error:', error.message)
            return {
                optimizedContent: resumeContent,
                changes: ['Optimization currently unavailable']
            }
        }
    }
}

module.exports = new AIService()
