import { useNavigate } from 'react-router-dom'
import { IoDocumentTextOutline, IoCloudUploadOutline, IoBarChartOutline, IoCalendarOutline } from 'react-icons/io5'
import { formatDate, formatFileSize } from '../../utils/formatters'
import './ResumeCard.css'

const ResumeCard = ({ resume }) => {
  const navigate = useNavigate()
  const analysisCount = resume.aiAnalyses?.length || 0

  return (
    <div className="resume-card" onClick={() => navigate(`/resumes/${resume._id}`)}>
      <div className="resume-card-header">
        <div className="resume-card-icon">
          {resume.type === 'file'
            ? <IoCloudUploadOutline size={22} />
            : <IoDocumentTextOutline size={22} />
          }
        </div>
        <div className="resume-card-info">
          <h3 className="resume-card-name">{resume.title}</h3>
          {/* Preserve fileName display from original */}
          {resume.type === 'file' && resume.fileName
            ? <span className="resume-card-type">{resume.fileName}</span>
            : <span className="resume-card-type">{resume.type === 'file' ? 'Uploaded File' : 'Text Resume'}</span>
          }
        </div>
      </div>

      <div className="resume-card-footer">
        <div className="resume-card-date">
          <IoCalendarOutline size={12} />
          <span>{formatDate(resume.updatedAt)}</span>
        </div>
        {resume.fileSize
          ? <span className="resume-card-size">{formatFileSize(resume.fileSize)}</span>
          : analysisCount > 0 && (
            <div className="resume-card-date">
              <IoBarChartOutline size={12} />
              <span>{analysisCount} {analysisCount === 1 ? 'analysis' : 'analyses'}</span>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default ResumeCard