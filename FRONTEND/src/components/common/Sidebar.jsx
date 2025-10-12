import { useNavigate } from 'react-router-dom'
import { IoLocationOutline, IoCalendarOutline, IoLinkOutline } from 'react-icons/io5'
import { formatDate } from '../../utils/formatters'
import JobStatusBadge from './JobStatusBadge'
import './JobCard.css'

const JobCard = ({ job }) => {
  const navigate = useNavigate()

  return (
    <div className="job-card" onClick={() => navigate(`/jobs/${job._id}`)}>
      <div className="job-card-header">
        <h3 className="job-card-title">{job.title}</h3>
        <JobStatusBadge status={job.status} />
      </div>

      <p className="job-card-company">{job.company}</p>

      {job.location && (
        <div className="job-card-meta">
          <IoLocationOutline size={16} />
          <span>{job.location}</span>
        </div>
      )}

      {job.description && (
        <p className="job-card-description">
          {job.description.substring(0, 120)}
          {job.description.length > 120 ? '...' : ''}
        </p>
      )}

      <div className="job-card-footer">
        <div className="job-card-date">
          <IoCalendarOutline size={14} />
          <span>{formatDate(job.updatedAt)}</span>
        </div>
        {job.link && (
          <div className="job-card-link">
            <IoLinkOutline size={14} />
            <span>View Posting</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobCard
