

import { useNavigate } from 'react-router-dom'
import { IoDocument, IoCloudUpload, IoAnalytics, IoCalendarOutline } from 'react-icons/io5'
import { formatDate, formatFileSize } from '../../utils/formatters'
import './ResumeCard.css'

const ResumeCard = ({ resume }) => {
  const navigate = useNavigate()
  const analysisCount = resume.aiAnalyses?.length || 0

  return (
    <div className="resume-card" onClick={() => navigate(`/resumes/${resume._id}`)}>
      <div className="resume-card-icon">
        {resume.type === 'file' ? (
          <IoCloudUpload size={32} />
        ) : (
          <IoDocument size={32} />
        )}
      </div>

      <div className="resume-card-content">
        <h3 className="resume-card-title">{resume.title}</h3>
        
        <div className="resume-card-meta">
          {resume.type === 'file' && resume.fileName && (
            <span className="resume-meta-item">
              {resume.fileName}
            </span>
          )}
          {resume.fileSize && (
            <span className="resume-meta-item">
              {formatFileSize(resume.fileSize)}
            </span>
          )}
        </div>

        <div className="resume-card-footer">
          <div className="resume-date">
            <IoCalendarOutline size={14} />
            <span>{formatDate(resume.updatedAt)}</span>
          </div>
          {analysisCount > 0 && (
            <div className="resume-analysis-count">
              <IoAnalytics size={14} />
              <span>{analysisCount} {analysisCount === 1 ? 'analysis' : 'analyses'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeCard
