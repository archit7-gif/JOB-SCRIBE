


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

async generateResumeOptimization(resumeContent, jobDescription, suggestions) {
    try {
        if (!this.genAI) return this.getFallbackOptimization(resumeContent)

        const prompt = `You are an expert ATS resume optimizer. Your goal is to maximize job match while staying 100% truthful.

ORIGINAL RESUME:
${resumeContent}

TARGET JOB DESCRIPTION:
${jobDescription}

SUGGESTIONS TO APPLY:
${suggestions.join("\n- ")}

OPTIMIZATION STRATEGY:

1. INTELLIGENT CONTENT TRANSFORMATION:
   ✓ Reframe existing experience to match job requirements
   ✓ If job asks for "Senior Developer" but candidate is fresher → Present projects as "development experience"
   ✓ Extract relevant skills from projects and highlight them
   ✓ Use job description keywords in bullet points naturally
   ✓ Quantify achievements with realistic metrics

2. SECTION HANDLING RULES:
   
   IF CANDIDATE HAS NO WORK EXPERIENCE:
   - DO NOT create a "Professional Experience" section with fake companies
   - INSTEAD: Make "Projects" section prominent and detailed
   - Frame projects as practical experience: "Developed...", "Built...", "Implemented..."
   - Add a strong "Professional Summary" highlighting technical abilities
   
   IF CANDIDATE HAS WORK EXPERIENCE:
   - Optimize existing experience section
   - Add project work if it strengthens the case
   - Align job responsibilities with target role
   
   IF JOB REQUIRES EXPERIENCE CANDIDATE DOESN'T HAVE:
   - Bridge the gap with: "Hands-on project experience in...", "Self-taught expertise in...", "Academic/personal projects demonstrating..."
   - DO NOT invent job titles or companies
   - Focus on demonstrable skills through projects

3. SMART KEYWORD INTEGRATION:
   ✓ Identify key technologies/skills from job description
   ✓ Weave them into existing content naturally
   ✓ Update skill categories to match job requirements
   ✓ Use industry-standard terminology from the job posting

4. CONTENT ENHANCEMENT (NOT FABRICATION):
   ✓ Add realistic metrics to project achievements
   ✓ Expand on technical implementations
   ✓ Highlight relevant coursework or certifications
   ✓ Emphasize learning and adaptability for entry-level roles
   ✓ For senior roles with junior candidates: Focus on depth of technical knowledge and potential

5. STRUCTURE OPTIMIZATION:
   ✓ Reorder sections to highlight strengths (e.g., Skills before Projects for technical roles)
   ✓ Expand summary to address job requirements
   ✓ Keep original section names OR use standard ones (Projects, Experience, etc.)
   ✓ Maintain professional ATS-friendly format

6. FORBIDDEN ACTIONS:
   ✗ DO NOT create fake companies, job titles, or employment dates
   ✗ DO NOT add sections with placeholder data like "| null" or "TBD"
   ✗ DO NOT claim certifications/degrees not mentioned in original
   ✗ DO NOT invent technologies never used by candidate

7. QUALITY TARGETS:
   - 60-80% content rewrite to maximize keyword match
   - Maintain honesty and verifiability
   - Professional tone matching job level
   - Complete resume (no truncation)

OUTPUT REQUIREMENTS:
- Return ONLY the optimized resume text
- No JSON, no markdown code blocks, no explanations
- Start directly with candidate name
- Complete all sections
- Ready for ATS parsing

BEGIN OPTIMIZATION:`

        const response = await this.genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: { 
                temperature: 0.5,  // Balanced: creative but controlled
                maxOutputTokens: 3500
            }
        })

        if (!response?.text) return this.getFallbackOptimization(resumeContent)

        const codeBlockPattern = /```/g
        let optimized = response.text.trim()
            .replace(codeBlockPattern, "")
            .replace(/\*\*/g, "")
            .trim()

        // INTELLIGENT POST-PROCESSING VALIDATION
        
        // 1. Remove fake experience indicators
        if (optimized.includes('| null') || optimized.includes('| TBD')) {
            console.warn('⚠️ Removing fake data indicators')
            optimized = optimized.split('\n')
                .filter(line => !line.includes('| null') && !line.includes('| TBD'))
                .join('\n')
        }
        
        // 2. Check if AI invented companies (only if original had no experience)
        const originalHasCompanies = /\b(pvt|ltd|inc|corp|company|technologies|solutions)\b/i.test(resumeContent)
        const optimizedHasCompanies = /\b(pvt|ltd|inc|corp|company|technologies|solutions)\b/i.test(optimized)
        
        if (!originalHasCompanies && optimizedHasCompanies) {
            console.warn('⚠️ AI may have added fake companies, validating...')
            
            // Check for "Current Focus" or similar fake sections
            if (/current focus|goals|learning path/i.test(optimized)) {
                console.warn('⚠️ Removing fake sections')
                const lines = optimized.split('\n')
                const cleanedLines = []
                let skipSection = false
                
                for (const line of lines) {
                    const lower = line.toLowerCase()
                    
                    if (lower.includes('professional experience') || 
                        lower.includes('current focus') || 
                        lower.includes('work experience')) {
                        skipSection = true
                        continue
                    }
                    
                    if (/^[A-Z\s]{2,}$/.test(line.trim()) && line.trim().length > 3) {
                        // New section header, stop skipping
                        skipSection = false
                    }
                    
                    if (!skipSection) {
                        cleanedLines.push(line)
                    }
                }
                
                optimized = cleanedLines.join('\n')
            }
        }

        // 3. Validate minimum quality
        if (optimized.length < resumeContent.length * 0.4) {
            console.warn('⚠️ Optimization too short, using original')
            return this.getFallbackOptimization(resumeContent)
        }
        
        // 4. Ensure name is present
        const firstLine = optimized.split('\n')
        if (!firstLine || firstLine.length < 3) {
            console.warn('⚠️ Invalid format, using original')
            return this.getFallbackOptimization(resumeContent)
        }

        console.log('✅ Optimization validated and cleaned')
        return { optimizedContent: optimized, success: true }
        
    } catch (error) {
        console.error('Optimization error:', error)
        return this.getFallbackOptimization(resumeContent)
    }
}



    async extractStructuredJSON(resumeContent) {
        try {
            if (!this.genAI) return this.getFallbackJSON(resumeContent)

            const prompt = `Extract ALL information including links from this resume. Return ONLY valid JSON:

{
  "personalInfo": {"name":"","email":"","phone":"","linkedin":"","github":"","twitter":"","portfolio":"","location":""},
  "summary": "",
  "skills": {},
  "experience": [{"title":"","company":"","location":"","dates":"","points":[]}],
  "projects": [{"name":"","tech":"","link":"","github":"","liveDemo":"","points":[]}],
  "education": [{"degree":"","school":"","year":""}],
  "certifications": [],
  "languages": []
}

CRITICAL - EXTRACT ALL LINKS:
- Profile links: LinkedIn, GitHub, Twitter, Portfolio (full URLs)
- Project links: Look for "Link:", "GitHub:", "Demo:", "Live:", or any http/https URLs near project names
- Extract URLs exactly as found (preserve format)

Resume:
${resumeContent}`

            const response = await this.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
                config: { temperature: 0.0 }
            })

            if (!response?.text) return this.getFallbackJSON(resumeContent)

            const cleaned = this.cleanJSON(response.text)
            const data = JSON.parse(cleaned)
            
            if (!data.personalInfo || !data.personalInfo.name) {
                return this.getFallbackJSON(resumeContent)
            }

            return {
                personalInfo: {
                    name: data.personalInfo?.name || "Resume",
                    email: data.personalInfo?.email || null,
                    phone: data.personalInfo?.phone || null,
                    linkedin: data.personalInfo?.linkedin || null,
                    github: data.personalInfo?.github || null,
                    twitter: data.personalInfo?.twitter || null,
                    portfolio: data.personalInfo?.portfolio || null,
                    location: data.personalInfo?.location || null
                },
                summary: data.summary || null,
                skills: data.skills || {},
                experience: Array.isArray(data.experience) ? data.experience : [],
                projects: Array.isArray(data.projects) ? data.projects : [],
                education: Array.isArray(data.education) ? data.education : [],
                certifications: Array.isArray(data.certifications) ? data.certifications : [],
                languages: Array.isArray(data.languages) ? data.languages : []
            }
        } catch (error) {
            console.error('Extraction error:', error)
            return this.getFallbackJSON(resumeContent)
        }
    }

cleanJSON(text) {
    text = text.replace(/```json/gi, "").replace(/```/g, "")
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    return start >= 0 && end >= 0 ? text.substring(start, end + 1) : text
}

    isValid(analysis) {
        return analysis && typeof analysis.matchScore === "number" && Array.isArray(analysis.suggestions)
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
        return { optimizedContent: content, success: false }
    }

    getFallbackJSON(content) {
        const lines = content.split('\n').filter(l => l.trim())
        let name = "Resume", email = null, phone = null
        
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim()
            if (i === 0 && line.length < 60) name = line
            if (line.includes('@') && !email) {
                const match = line.match(/[\w.-]+@[\w.-]+\.\w+/)
                if (match) email = match
            }
            if (line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) && !phone) {
                const match = line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)
                if (match) phone = match
            }
        }
        
        return {
            personalInfo: { name, email, phone, linkedin: null, github: null, twitter: null, portfolio: null, location: null },
            summary: content.substring(0, 300),
            skills: {},
            experience: [],
            projects: [],
            education: [],
            certifications: [],
            languages: []
        }
    }
}

module.exports = new AIService()
