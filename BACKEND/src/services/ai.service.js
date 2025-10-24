

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

        const prompt = `You are an expert ATS analyzer. Analyze how well this resume matches the job description and provide a REALISTIC match score.

RESUME:
${resumeContent.substring(0, 5000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

SCORING GUIDELINES (BE REALISTIC):
- 90-100%: Perfect match - all key skills, experience level matches exactly
- 70-85%: Strong match - most skills present, experience close to requirements
- 50-70%: Moderate match - some skills match, experience level differs
- 30-50%: Weak match - few relevant skills, experience significantly different
- 0-30%: Poor match - completely different field or no relevant skills

YOUR TASK:
1. Calculate match score based on:
   - Skills overlap (40%)
   - Experience relevance (30%)
   - Keywords presence (20%)
   - Education/certifications fit (10%)

2. List specific strengths (what matches well)
3. Provide 3-5 actionable improvement suggestions
4. Identify missing keywords from job description
5. List resume sections needing improvement

Return ONLY valid JSON (no explanation):
{
  "matchScore": <realistic number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "sectionsToImprove": ["section1", "section2"]
}`

        const response = await this.genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: { 
                temperature: 0.4,  // Slightly higher for varied scores
                maxOutputTokens: 1500
            }
        })

        if (!response?.text) return this.getFallbackAnalysis()

        const cleaned = this.cleanJSON(response.text.trim())
        const analysis = JSON.parse(cleaned)

        // Validate match score
        if (!analysis.matchScore || 
            typeof analysis.matchScore !== 'number' || 
            analysis.matchScore < 0 || 
            analysis.matchScore > 100) {
            console.warn('⚠️ Invalid match score from AI, calculating fallback...')
            analysis.matchScore = this.calculateBasicMatchScore(resumeContent, jobDescription)
        }

        if (!this.isValid(analysis)) return this.getFallbackAnalysis()

        return {
            matchScore: Math.round(analysis.matchScore),
            strengths: analysis.strengths?.length > 0 ? analysis.strengths : ["Resume structure is clear"],
            suggestions: analysis.suggestions?.length > 0 ? analysis.suggestions : ["Consider adding more keywords"],
            missingKeywords: analysis.missingKeywords || [],
            sectionsToImprove: analysis.sectionsToImprove || []
        }
    } catch (error) {
        console.error('Analysis error:', error)
        return this.getFallbackAnalysis()
    }
}

// Add this helper method after analyzeResumeForJob
calculateBasicMatchScore(resumeContent, jobDescription) {
    try {
        const resumeLower = resumeContent.toLowerCase()
        const jobLower = jobDescription.toLowerCase()
        
        // Extract meaningful keywords from job description
        const stopWords = new Set([
            'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'will',
            'your', 'are', 'can', 'you', 'our', 'their', 'should', 'would', 'could'
        ])
        
        const jobKeywords = jobLower
            .match(/\b[a-z]{3,}\b/g)
            ?.filter(word => !stopWords.has(word)) || []
        
        if (jobKeywords.length === 0) return 50
        
        // Count keyword matches
        const matchedKeywords = jobKeywords.filter(keyword => resumeLower.includes(keyword))
        const matchPercentage = (matchedKeywords.length / jobKeywords.length) * 100
        
        // Scale to realistic range (25-85)
        const scaledScore = Math.min(85, Math.max(25, Math.round(matchPercentage)))
        
        console.log(`📊 Keyword-based score: ${scaledScore}% (${matchedKeywords.length}/${jobKeywords.length} keywords matched)`)
        
        return scaledScore
    } catch (error) {
        console.error('Keyword matching error:', error)
        return 50
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
