

// src/services/resumeTemplate.service.js

function generateResumeHTML(data) {
  const ensureHTTPS = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('mailto:')) return url;
    return 'https://' + url;
  };

  const createLink = (url, text) => {
    if (!url) return text;
    const fullURL = ensureHTTPS(url);
    return `<a href="${fullURL}" target="_blank">${text || url}</a>`;
  };

  const get = (obj, path, defaultValue = '') => {
    try {
      return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Helvetica', Arial, sans-serif; 
          color: #000;
          padding: 35px 45px;
          font-size: 10.5pt;
          line-height: 1.4;
        }
        .name { 
          font-size: 20pt; 
          font-weight: bold; 
          text-align: center; 
          margin-bottom: 5px;
        }
        .contact { 
          text-align: center; 
          font-size: 9pt; 
          color: #333;
          margin-bottom: 15px;
        }
        .contact a { 
          color: #0066cc; 
          text-decoration: none; 
        }
        .contact a:hover { text-decoration: underline; }
        
        .section { margin-top: 14px; }
        .section-title { 
          font-size: 12pt; 
          font-weight: bold; 
          border-bottom: 1.2px solid #000;
          margin-bottom: 8px;
          padding-bottom: 2px;
        }
        .job-title { 
          font-weight: bold; 
          margin-top: 7px;
          font-size: 10.5pt;
        }
        .job-meta { 
          font-size: 9.5pt; 
          color: #555; 
          margin-bottom: 4px;
        }
        .project-links {
          font-size: 9pt;
          margin-top: 3px;
          margin-bottom: 3px;
          color: #0066cc;
        }
        .project-links a {
          color: #0066cc;
          text-decoration: none;
          margin-right: 15px;
          font-weight: 500;
        }
        .project-links a:hover { text-decoration: underline; }
        
        ul { 
          margin-left: 20px; 
          margin-top: 4px;
          margin-bottom: 4px;
        }
        li { 
          margin-bottom: 2.5px;
          font-size: 10pt;
        }
        
        .skill-item { 
          margin-bottom: 4px;
          font-size: 10pt;
        }
        .skill-category { font-weight: bold; }
        
        a { color: #0066cc; }
        
        p { 
          margin-bottom: 5px;
          font-size: 10pt;
        }
      </style>
    </head>
    <body>
      <!-- NAME -->
      <div class="name">${get(data, 'personalInfo.name', 'Resume')}</div>
      
      <!-- CONTACT -->
      <div class="contact">
        ${get(data, 'personalInfo.email') ? createLink('mailto:' + get(data, 'personalInfo.email'), get(data, 'personalInfo.email')) : ''}
        ${get(data, 'personalInfo.phone') ? ' | ' + get(data, 'personalInfo.phone') : ''}
        ${get(data, 'personalInfo.linkedin') ? ' | ' + createLink(get(data, 'personalInfo.linkedin'), 'LinkedIn') : ''}
        ${get(data, 'personalInfo.github') ? ' | ' + createLink(get(data, 'personalInfo.github'), 'GitHub') : ''}
        ${get(data, 'personalInfo.twitter') ? ' | ' + createLink(get(data, 'personalInfo.twitter'), 'Twitter') : ''}
        ${get(data, 'personalInfo.portfolio') ? ' | ' + createLink(get(data, 'personalInfo.portfolio'), 'Portfolio') : ''}
        ${get(data, 'personalInfo.location') ? ' | ' + get(data, 'personalInfo.location') : ''}
      </div>

      <!-- SUMMARY -->
      ${data.summary ? `
        <div class="section">
          <div class="section-title">PROFESSIONAL SUMMARY</div>
          <p>${data.summary}</p>
        </div>
      ` : ''}

      <!-- SKILLS -->
      ${data.skills && Object.keys(data.skills).length > 0 ? `
        <div class="section">
          <div class="section-title">SKILLS</div>
          ${Object.entries(data.skills).map(([category, skills]) => `
            <div class="skill-item">
              <span class="skill-category">${category}:</span> ${Array.isArray(skills) ? skills.join(', ') : skills}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- EXPERIENCE -->
      ${data.experience && data.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">PROFESSIONAL EXPERIENCE</div>
          ${data.experience.map(job => `
            <div class="job-title">
              ${job.title} | ${job.companyWebsite ? createLink(job.companyWebsite, job.company) : job.company}
            </div>
            <div class="job-meta">${job.location || ''} ${job.location && job.dates ? '|' : ''} ${job.dates || ''}</div>
            ${job.points && job.points.length > 0 ? `
              <ul>
                ${job.points.map(point => `<li>${point}</li>`).join('')}
              </ul>
            ` : ''}
          `).join('')}
        </div>
      ` : ''}

      <!-- PROJECTS WITH LINKS (ENHANCED DEBUG) -->
      ${data.projects && data.projects.length > 0 ? `
        <div class="section">
          <div class="section-title">PROJECTS</div>
          ${data.projects.map(project => {
            // Debug: Check all possible link fields
            const hasAnyLink = project.link || project.github || project.liveDemo || project.demo || project.url || project.repository;
            
            return `
              <div class="job-title">${project.name}${project.tech ? ' (' + project.tech + ')' : ''}</div>
              ${hasAnyLink ? `
                <div class="project-links">
                  ${project.link ? createLink(project.link, '🔗 Repository') + ' ' : ''}
                  ${project.github ? createLink(project.github, '🔗 GitHub') + ' ' : ''}
                  ${project.repository ? createLink(project.repository, '🔗 Repo') + ' ' : ''}
                  ${project.url ? createLink(project.url, '🔗 Link') + ' ' : ''}
                  ${project.liveDemo ? createLink(project.liveDemo, '🌐 Live Demo') + ' ' : ''}
                  ${project.demo ? createLink(project.demo, '🌐 Demo') + ' ' : ''}
                </div>
              ` : '<!-- No links found for this project -->'}
              ${project.points && project.points.length > 0 ? `
                <ul>
                  ${project.points.map(point => `<li>${point}</li>`).join('')}
                </ul>
              ` : ''}
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- EDUCATION -->
      ${data.education && data.education.length > 0 ? `
        <div class="section">
          <div class="section-title">EDUCATION</div>
          ${data.education.map(edu => `
            <div class="job-title">${edu.degree}</div>
            <div class="job-meta">
              ${edu.schoolWebsite ? createLink(edu.schoolWebsite, edu.school) : edu.school} ${edu.year ? '| ' + edu.year : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- CERTIFICATIONS -->
      ${data.certifications && data.certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">CERTIFICATIONS</div>
          <ul>
            ${data.certifications.map(cert => `
              <li>${typeof cert === 'string' ? cert : (cert.link ? createLink(cert.link, cert.name) : cert.name)}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- LANGUAGES -->
      ${data.languages && data.languages.length > 0 ? `
        <div class="section">
          <div class="section-title">LANGUAGES</div>
          <p>${data.languages.join(', ')}</p>
        </div>
      ` : ''}

    </body>
    </html>
  `;
}

module.exports = { generateResumeHTML };
