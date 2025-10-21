

const puppeteer = require('puppeteer');
const { generateResumeHTML } = require('../services/resumeTemplate.service');
const aiService = require('../services/ai.service');

class PDFGeneratorService {
    
    // NEW METHOD: Generate PDF with pre-extracted links
    async generateResumePDFWithLinks(optimizedContent, extractedLinks, resumeTitle) {
        let browser;
        try {
            console.log('=== Starting PDF Generation ===')
            console.log('Optimized content length:', optimizedContent.length)
            console.log('Extracted links:', JSON.stringify(extractedLinks, null, 2))
            
            // Extract structure from optimized content
            let structuredData = await aiService.extractStructuredJSON(optimizedContent)
            
            // Inject stored links into structured data
            if (extractedLinks) {
                structuredData = this.injectLinks(structuredData, extractedLinks)
            }
            
            console.log('=== Final Data for PDF ===')
            console.log('Name:', structuredData.personalInfo?.name)
            console.log('Profile Links:', structuredData.personalInfo)
            console.log('Projects:', structuredData.projects?.map(p => ({ 
                name: p.name, 
                link: p.link, 
                github: p.github, 
                liveDemo: p.liveDemo 
            })))
            console.log('==========================')
            
            // Generate HTML
            const html = generateResumeHTML(structuredData)
            
            // Launch browser
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            })
            
            const page = await browser.newPage()
            await page.setContent(html, { waitUntil: 'networkidle0' })
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0', bottom: '0', left: '0', right: '0' }
            })
            
            await browser.close()
            console.log('PDF generated successfully')
            return pdfBuffer
            
        } catch (error) {
            if (browser) await browser.close()
            console.error('PDF generation error:', error)
            throw new Error('Failed to generate PDF')
        }
    }
    
    // Inject extracted links into structured data
    injectLinks(structuredData, extractedLinks) {
        // Inject profile links
        if (extractedLinks.personalInfo) {
            structuredData.personalInfo = {
                ...structuredData.personalInfo,
                linkedin: extractedLinks.personalInfo.linkedin || structuredData.personalInfo.linkedin,
                github: extractedLinks.personalInfo.github || structuredData.personalInfo.github,
                twitter: extractedLinks.personalInfo.twitter || structuredData.personalInfo.twitter,
                portfolio: extractedLinks.personalInfo.portfolio || structuredData.personalInfo.portfolio,
                email: extractedLinks.personalInfo.email || structuredData.personalInfo.email
            }
        }
        
        // Inject project links (match by name similarity)
        if (extractedLinks.projects && structuredData.projects) {
            structuredData.projects = structuredData.projects.map(project => {
                const matchedOriginal = this.findMatchingProject(project.name, extractedLinks.projects)
                
                if (matchedOriginal) {
                    return {
                        ...project,
                        link: matchedOriginal.link || project.link,
                        github: matchedOriginal.github || project.github,
                        liveDemo: matchedOriginal.liveDemo || project.liveDemo,
                        demo: matchedOriginal.demo || project.demo,
                        url: matchedOriginal.url || project.url
                    }
                }
                
                return project
            })
        }
        
        return structuredData
    }
    
    // Find matching project by name (fuzzy)
    findMatchingProject(name, projects) {
        const nameLower = name.toLowerCase().replace(/[^a-z0-9]/g, '')
        
        for (const project of projects) {
            const projectNameLower = project.name.toLowerCase().replace(/[^a-z0-9]/g, '')
            
            if (nameLower.includes(projectNameLower) || projectNameLower.includes(nameLower)) {
                return project
            }
        }
        
        return null
    }
    
    // Legacy method (backward compatibility)
    async generateResumePDFBuffer(content, resumeTitle) {
        return this.generateResumePDFWithLinks(content, null, resumeTitle)
    }
}

module.exports = new PDFGeneratorService()
