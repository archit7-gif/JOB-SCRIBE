

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

const prompt = `You are an expert resume strategist and ATS optimization specialist. Your task is to rewrite and enhance the following resume to perfectly match the target job title and job description, while keeping every detail authentic and realistic.

====================
ORIGINAL RESUME:
${resumeContent}

TARGET JOB DESCRIPTION:
${jobDescription}
====================

YOUR GOALS:
1. **Optimize for ATS (Applicant Tracking Systems):**
   - Ensure the rewritten resume achieves a 90+ ATS compatibility score.
   - Naturally insert keywords, tools, and technical terms directly from the job description.
   - Use correct naming conventions (e.g., “Node.js” instead of “Node”).

2. **Enhance Professional Impact:**
   - Make the language powerful, crisp, and results-driven.
   - Use action verbs like “Developed”, “Built”, “Optimized”, “Implemented”.
   - Emphasize measurable outcomes, performance improvements, or project impact wherever possible.

3. **Align Content With the Target Role:**
   - Adjust summary, skills, and project descriptions to match the tone, scope, and priorities of the target job.
   - Keep all original facts, companies, roles, and education intact, but rephrase and reorder them for clarity and relevance.
   - Reorganize sections to highlight the most job-relevant details first.

4. **Improve Structure and Clarity:**
   - Keep formatting professional, clean, and logical.
   - Maintain proper bullet hierarchy, spacing, and readability.
   - Ensure consistent tense, capitalization, and punctuation.

5. **Upgrade Project and Skills Presentation:**
   - Rewrite project summaries to show technical depth and business impact.
   - Mention tools, frameworks, deployment, scalability, or testing details where relevant.
   - Group skills logically (Frontend, Backend, Database, Tools, etc.) and prioritize those matching the job.

STRICT RULES:
- Do NOT invent fake experience, certifications, or education.
- Do NOT add unrealistic metrics or technologies the candidate never used.
- Avoid buzzwords like “career objectives”, “goals”, or “aspirations”.
- Remove placeholders like “TBD”, “null”, or “currently learning”.

FINAL OUTPUT REQUIREMENTS:
- Return ONLY the complete rewritten resume text.
- Start directly with the candidate’s name (no titles like “Resume” or “Profile”).
- Do NOT include JSON, markdown, or explanations.
- The final version should look ready to paste into a professional resume template.
- Rewrite around 60–80% of content while keeping true to the candidate’s actual background.

Begin rewriting the resume now.`


        const response = await this.genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: { 
                temperature: 0.7,  // Higher temperature for more creative rewriting
                maxOutputTokens: 4000
            }
        })

        if (!response?.text) return this.getFallbackOptimization(resumeContent)

        // ✅ FIX 1: close regex properly
        let optimized = response.text.trim().replace(/```/g, "")

        // Remove any fake sections
        optimized = optimized.split('\n')
            .filter(line => {
                const lower = line.toLowerCase()
                return !lower.includes('| null') && 
                       !lower.includes('current focus') && 
                       !lower.includes('career goals') &&
                       !lower.includes('| tbd')
            })
            .join('\n')

        // ✅ FIX 2: correctly get first line
        const firstLine = optimized.split('\n')[0].trim()
        if (firstLine.toUpperCase() === 'RESUME' || firstLine.toUpperCase() === 'CV') {
            optimized = optimized.split('\n').slice(1).join('\n').trim()
        }

        // Validate - must be at least 50% of original length
        if (optimized.length < resumeContent.length * 0.5) {
            console.warn('⚠️ Optimization too short, using original')
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
