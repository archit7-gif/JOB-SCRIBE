
const PDFDocument = require('pdfkit')
const fs = require('fs')


class PDFGeneratorService {
    
    // Generate PDF buffer for download
    generateResumePDFBuffer(content, resumeTitle) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 60, right: 50 }
                })


                const buffers = []
                doc.on('data', buffers.push.bind(buffers))
                doc.on('end', () => resolve(Buffer.concat(buffers)))
                doc.on('error', reject)


                const lines = content.split('\n')
                let currentSection = ''


                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i]
                    const trimmed = line.trim()
                    const nextLine = lines[i + 1]?.trim() || ''
                    const prevLine = lines[i - 1]?.trim() || ''
                    
                    // Skip empty lines but add space
                    if (!trimmed) {
                        if (i > 0 && prevLine) doc.moveDown(0.3)
                        continue
                    }


                    // ============ 1. NAME (First Line) ============
                    if (i === 0 || (i === 1 && !lines[0].trim())) {
                        doc.fontSize(16)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed, { align: 'center' })
                           .moveDown(0.4)
                        continue
                    }


                    // ============ 2. CONTACT INFO ============
                    if (trimmed.includes('@') || 
                        trimmed.toLowerCase().includes('linkedin') || 
                        trimmed.toLowerCase().includes('github') ||
                        trimmed.toLowerCase().includes('phone') ||
                        trimmed.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) ||
                        (i <= 3 && trimmed.includes('|'))) {
                        doc.fontSize(9)
                           .font('Helvetica')
                           .fillColor('#333333')
                           .text(trimmed, { align: 'center' })
                           .moveDown(0.2)
                        continue
                    }


                    // ============ 3. SECTION HEADERS (ALL CAPS) ============
                    if (trimmed.toUpperCase() === trimmed && 
                        trimmed.length > 2 && 
                        trimmed.length < 50 && 
                        !trimmed.match(/^[-•*]/) &&
                        !trimmed.includes(':')) {
                        
                        currentSection = trimmed.toUpperCase()
                        
                        doc.moveDown(0.6)
                           .fontSize(11)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed)
                        
                        // Underline
                        const textWidth = doc.widthOfString(trimmed)
                        const lineY = doc.y
                        doc.moveTo(doc.x, lineY)
                           .lineTo(doc.x + textWidth, lineY)
                           .lineWidth(1)
                           .strokeColor('#000000')
                           .stroke()
                        
                        doc.moveDown(0.4)
                        continue
                    }


                    // ============ 4. BULLET POINTS (-, •, *) ============
                    if (trimmed.match(/^[-•*]\s/)) {
                        const text = trimmed.replace(/^[-•*]\s+/, '')
                        doc.fontSize(10)
                           .font('Helvetica')
                           .fillColor('#000000')
                           .text('• ' + text, {
                               indent: 15,
                               paragraphGap: 3
                           })
                        continue
                    }


                    // ============ 5. SUB-HEADINGS WITH COLON (Frontend:, Backend:, etc) ============
                    if (trimmed.includes(':')) {
                        const [heading, ...rest] = trimmed.split(':')
                        const content = rest.join(':').trim()
                        
                        // Heading part (bold with bullet)
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text('• ' + heading + ':', {
                               indent: 15,
                               continued: content.length > 0
                           })
                        
                        // Content part (regular)
                        if (content) {
                            doc.font('Helvetica')
                               .text(' ' + content)
                        } else {
                            doc.text('') // End line
                        }
                        
                        doc.moveDown(0.15)
                        continue
                    }


                    // ============ 6. JOB TITLES / DATES (has years) ============
                    if (trimmed.match(/\d{4}/) && !trimmed.match(/^[-•*]/)) {
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed)
                           .moveDown(0.15)
                        continue
                    }


                    // ============ 7. PROJECT/ITEM TITLES ============
                    // (After section header, before bullets, not too long)
                    if (prevLine && 
                        (prevLine.toUpperCase() === prevLine || prevLine.includes(':')) &&
                        nextLine.match(/^[-•*]/) &&
                        trimmed.length < 80 &&
                        !trimmed.match(/^[-•*]/)) {
                        
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed)
                           .moveDown(0.15)
                        continue
                    }


                    // ============ 8. COMPANY/ORGANIZATION NAMES (has | but no bullets after) ============
                    if (trimmed.includes('|') && !nextLine.match(/^[-•*]/)) {
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed)
                           .moveDown(0.15)
                        continue
                    }


                    // ============ 9. REGULAR TEXT (everything else) ============
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#000000')
                       .text(trimmed, {
                           align: 'left',
                           lineGap: 2
                       })
                       .moveDown(0.25)
                }


                doc.end()
                
            } catch (error) {
                reject(error)
            }
        })
    }


    // Generate PDF file
    generateResumePDF(content, outputPath, resumeTitle) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 60, right: 50 }
                })


                const stream = fs.createWriteStream(outputPath)
                doc.pipe(stream)


                const lines = content.split('\n')
                let currentSection = ''


                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i]
                    const trimmed = line.trim()
                    const nextLine = lines[i + 1]?.trim() || ''
                    const prevLine = lines[i - 1]?.trim() || ''
                    
                    if (!trimmed) {
                        if (i > 0 && prevLine) doc.moveDown(0.3)
                        continue
                    }


                    // 1. NAME
                    if (i === 0 || (i === 1 && !lines[0].trim())) {
                        doc.fontSize(16)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed, { align: 'center' })
                           .moveDown(0.4)
                        continue
                    }


                    // 2. CONTACT INFO
                    if (trimmed.includes('@') || 
                        trimmed.toLowerCase().includes('linkedin') || 
                        trimmed.toLowerCase().includes('github') ||
                        trimmed.toLowerCase().includes('phone') ||
                        trimmed.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) ||
                        (i <= 3 && trimmed.includes('|'))) {
                        doc.fontSize(9)
                           .font('Helvetica')
                           .fillColor('#333333')
                           .text(trimmed, { align: 'center' })
                           .moveDown(0.2)
                        continue
                    }


                    // 3. SECTION HEADERS
                    if (trimmed.toUpperCase() === trimmed && 
                        trimmed.length > 2 && 
                        trimmed.length < 50 && 
                        !trimmed.match(/^[-•*]/) &&
                        !trimmed.includes(':')) {
                        
                        currentSection = trimmed.toUpperCase()
                        
                        doc.moveDown(0.6)
                           .fontSize(11)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed)
                        
                        const textWidth = doc.widthOfString(trimmed)
                        const lineY = doc.y
                        doc.moveTo(doc.x, lineY)
                           .lineTo(doc.x + textWidth, lineY)
                           .lineWidth(1)
                           .strokeColor('#000000')
                           .stroke()
                        
                        doc.moveDown(0.4)
                        continue
                    }


                    // 4. BULLET POINTS
                    if (trimmed.match(/^[-•*]\s/)) {
                        const text = trimmed.replace(/^[-•*]\s+/, '')
                        doc.fontSize(10)
                           .font('Helvetica')
                           .fillColor('#000000')
                           .text('• ' + text, {
                               indent: 15,
                               paragraphGap: 3
                           })
                        continue
                    }


                    // 5. SUB-HEADINGS WITH COLON
                    if (trimmed.includes(':')) {
                        const [heading, ...rest] = trimmed.split(':')
                        const content = rest.join(':').trim()
                        
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text('• ' + heading + ':', {
                               indent: 15,
                               continued: content.length > 0
                           })
                        
                        if (content) {
                            doc.font('Helvetica')
                               .text(' ' + content)
                        } else {
                            doc.text('')
                        }
                        
                        doc.moveDown(0.15)
                        continue
                    }


                    // 6. JOB TITLES / DATES
                    if (trimmed.match(/\d{4}/) && !trimmed.match(/^[-•*]/)) {
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed)
                           .moveDown(0.15)
                        continue
                    }


                    // 7. PROJECT/ITEM TITLES
                    if (prevLine && 
                        (prevLine.toUpperCase() === prevLine || prevLine.includes(':')) &&
                        nextLine.match(/^[-•*]/) &&
                        trimmed.length < 80 &&
                        !trimmed.match(/^[-•*]/)) {
                        
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed)
                           .moveDown(0.15)
                        continue
                    }


                    // 8. COMPANY/ORGANIZATION
                    if (trimmed.includes('|') && !nextLine.match(/^[-•*]/)) {
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .fillColor('#000000')
                           .text(trimmed)
                           .moveDown(0.15)
                        continue
                    }


                    // 9. REGULAR TEXT
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#000000')
                       .text(trimmed, {
                           align: 'left',
                           lineGap: 2
                       })
                       .moveDown(0.25)
                }


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