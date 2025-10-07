

const PDFDocument = require('pdfkit')
const fs = require('fs')

class PDFGeneratorService {
    
    // Generate PDF buffer for download
    generateResumePDFBuffer(content) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 }
                })

                const buffers = []
                doc.on('data', buffers.push.bind(buffers))
                doc.on('end', () => resolve(Buffer.concat(buffers)))
                doc.on('error', reject)

                // Title
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .text('OPTIMIZED RESUME', { align: 'center' })
                   .moveDown(1.5)

                // Content
                doc.fontSize(11).font('Helvetica')
                
                const lines = content.split('\n')
                lines.forEach(line => {
                    const trimmedLine = line.trim()
                    
                    // Section headers (all caps or specific keywords)
                    if (trimmedLine.match(/^[A-Z\s]+:?$/) || 
                        trimmedLine.match(/^(SKILLS|EXPERIENCE|EDUCATION|SUMMARY|CERTIFICATIONS|PROJECTS|PROFESSIONAL SUMMARY|TECHNICAL SKILLS|PROFESSIONAL EXPERIENCE)/i)) {
                        doc.moveDown(0.5)
                           .fontSize(13)
                           .font('Helvetica-Bold')
                           .text(trimmedLine)
                           .moveDown(0.3)
                           .fontSize(11)
                           .font('Helvetica')
                    }
                    // Bullet points
                    else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                        doc.text(`  ${trimmedLine}`, { indent: 20 })
                    }
                    // Job titles or bold items (contains pipe or year)
                    else if (trimmedLine.includes('|') || trimmedLine.match(/\d{4}/)) {
                        doc.font('Helvetica-Bold')
                           .text(trimmedLine)
                           .font('Helvetica')
                    }
                    // Regular text
                    else if (trimmedLine) {
                        doc.text(trimmedLine)
                    } else {
                        doc.moveDown(0.3)
                    }
                })

                // Footer
                doc.moveDown(2)
                   .fontSize(8)
                   .fillColor('#666666')
                   .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' })

                doc.end()
                
            } catch (error) {
                reject(error)
            }
        })
    }

    // Generate PDF file (if needed for saving)
    generateResumePDF(content, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 }
                })

                const stream = fs.createWriteStream(outputPath)
                doc.pipe(stream)

                // Title styling
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .text('OPTIMIZED RESUME', { align: 'center' })
                   .moveDown(1.5)

                // Content styling
                doc.fontSize(11)
                   .font('Helvetica')
                
                const lines = content.split('\n')
                
                lines.forEach(line => {
                    const trimmedLine = line.trim()
                    
                    if (trimmedLine.match(/^[A-Z\s]+:?$/) || 
                        trimmedLine.match(/^(SKILLS|EXPERIENCE|EDUCATION|SUMMARY|CERTIFICATIONS|PROJECTS|PROFESSIONAL SUMMARY|TECHNICAL SKILLS|PROFESSIONAL EXPERIENCE)/i)) {
                        doc.moveDown(0.5)
                           .fontSize(13)
                           .font('Helvetica-Bold')
                           .text(trimmedLine, { continued: false })
                           .moveDown(0.3)
                           .fontSize(11)
                           .font('Helvetica')
                    }
                    else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                        doc.text(`  ${trimmedLine}`, { indent: 20 })
                    }
                    else if (trimmedLine.includes('|') || trimmedLine.match(/\d{4}/)) {
                        doc.font('Helvetica-Bold')
                           .text(trimmedLine)
                           .font('Helvetica')
                    }
                    else if (trimmedLine) {
                        doc.text(trimmedLine)
                    } else {
                        doc.moveDown(0.3)
                    }
                })

                doc.moveDown(2)
                   .fontSize(8)
                   .fillColor('#666666')
                   .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' })

                doc.end()

                stream.on('finish', () => resolve(outputPath))
                stream.on('error', reject)
                
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = new PDFGeneratorService()
