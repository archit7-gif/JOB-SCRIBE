

const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')

class FileParserService {

    async extractPDFText(buffer) {
        try {
            const data = await pdfParse(buffer, {
                max: 0 // Parse all pages
            })

            const text = data.text.trim()

            if (!text || text.length < 10) {
                throw new Error('PDF appears to be empty or contains no readable text')
            }

            return this.cleanExtractedText(text)
        } catch (error) {
            console.error('PDF extraction error:', error.message)
            throw new Error(`Failed to extract text from PDF: ${error.message}`)
        }
    }

    async extractDOCXText(buffer) {
        try {
            const result = await mammoth.extractRawText({ buffer })
            const text = result.value.trim()

            if (!text || text.length < 10) {
                throw new Error('DOCX appears to be empty or contains no readable text')
            }

            return this.cleanExtractedText(text)
        } catch (error) {
            console.error('DOCX extraction error:', error.message)
            throw new Error(`Failed to extract text from DOCX: ${error.message}`)
        }
    }

    cleanExtractedText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim()
    }
}

module.exports = new FileParserService()
