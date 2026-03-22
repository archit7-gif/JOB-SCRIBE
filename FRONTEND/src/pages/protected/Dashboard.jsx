import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  IoBriefcaseOutline,
  IoDocumentTextOutline,
  IoCreateOutline,
  IoCheckmarkCircleOutline,
  IoAddOutline,
} from 'react-icons/io5'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import ProgressBar from '../../components/common/ProgressBar'
import LoadingSkeleton from '../../components/common/LoadingSkeleton'
import { setJobs } from '../../redux/slices/jobsSlice'
import { setResumes } from '../../redux/slices/resumesSlice'
import { setNotes } from '../../redux/slices/notesSlice'
import jobService from '../../services/jobService'
import resumeService from '../../services/resumeService'
import noteService from '../../services/noteService'
import { JOB_STATUSES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { jobs } = useSelector((state) => state.jobs)
  const { resumes } = useSelector((state) => state.resumes)
  const { notes } = useSelector((state) => state.notes)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [jobsRes, resumesRes, notesRes] = await Promise.all([
        jobService.getJobs(),
        resumeService.getResumes(),
        noteService.getAllNotes({ limit: 5 }),
      ])
      if (jobsRes.success) dispatch(setJobs(jobsRes.data))
      if (resumesRes.success) dispatch(setResumes(resumesRes.data))
      if (notesRes.success) dispatch(setNotes({ data: notesRes.data, count: notesRes.count }))
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalJobs: jobs.length,
    totalResumes: resumes.length,
    totalNotes: notes.length,
    activeApplications: jobs.filter(j => j.status === 'applied' || j.status === 'interviewing').length,
  }

  const jobStatusBreakdown = JOB_STATUSES.map(status => ({
    ...status,
    count: jobs.filter(j => j.status === status.value).length,
  }))

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="stats-grid">
          <LoadingSkeleton type="stat" count={4} />
        </div>
      </div>
    )
  }

  const statCards = [
    { icon: <IoBriefcaseOutline size={22} />, value: stats.totalJobs, label: 'Total Jobs', cls: 'stat-icon-jobs' },
    { icon: <IoDocumentTextOutline size={22} />, value: stats.totalResumes, label: 'Resumes', cls: 'stat-icon-resumes' },
    { icon: <IoCreateOutline size={22} />, value: stats.totalNotes, label: 'Notes', cls: 'stat-icon-notes' },
    { icon: <IoCheckmarkCircleOutline size={22} />, value: stats.activeApplications, label: 'Active Applications', cls: 'stat-icon-active' },
  ]

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Good to see you, {user?.fullname?.firstname || 'there'} 👋
          </h1>
          <p className="dashboard-subtitle">Here's where your job search stands today</p>
        </div>
        <Button variant="primary" size="small" onClick={() => navigate('/jobs/add')} icon={<IoAddOutline />}>
          Add Job
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <Card key={s.label} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-content">
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Two columns */}
      <div className="dashboard-grid">
        {/* Status breakdown */}
        <Card className="dashboard-card">
          <h3 className="card-title">Pipeline Overview</h3>
          <div className="status-breakdown">
            {jobStatusBreakdown.map((status) => (
              <div key={status.value} className="status-item">
                <ProgressBar
                  value={status.count}
                  max={stats.totalJobs || 1}
                  label={status.label}
                  color={status.color}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="dashboard-card">
          <h3 className="card-title">Recent Activity</h3>
          {recentJobs.length > 0 ? (
            <div className="activity-list">
              {recentJobs.map((job) => {
                const statusMeta = JOB_STATUSES.find(s => s.value === job.status)
                return (
                  <div
                    key={job._id}
                    className="activity-item"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    <div className="activity-content">
                      <p className="activity-title">{job.title}</p>
                      <p className="activity-company">{job.company}</p>
                    </div>
                    <div className="activity-meta">
                      <span
                        className="activity-status"
                        style={{
                          background: `${statusMeta?.color}18`,
                          color: statusMeta?.color,
                        }}
                      >
                        {statusMeta?.label}
                      </span>
                      <span className="activity-date">{formatDate(job.updatedAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-activity">
              <p>No jobs tracked yet</p>
              <Button variant="primary" size="small" onClick={() => navigate('/jobs/add')}>
                Add Your First Job
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <h3 className="section-heading">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Card className="quick-action-card" onClick={() => navigate('/jobs/add')} hoverable>
            <IoBriefcaseOutline size={28} className="quick-action-icon" />
            <p className="quick-action-title">Add Job</p>
          </Card>
          <Card className="quick-action-card" onClick={() => navigate('/resumes')} hoverable>
            <IoDocumentTextOutline size={28} className="quick-action-icon" />
            <p className="quick-action-title">Upload Resume</p>
          </Card>
          <Card className="quick-action-card" onClick={() => navigate('/notes')} hoverable>
            <IoCreateOutline size={28} className="quick-action-icon" />
            <p className="quick-action-title">Create Note</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
