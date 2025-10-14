

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { IoBriefcase, IoDocument, IoCreate, IoAdd, IoCheckmarkCircle } from 'react-icons/io5'
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [jobsRes, resumesRes, notesRes] = await Promise.all([
        jobService.getJobs(),
        resumeService.getResumes(),
        noteService.getAllNotes({ limit: 5 })
      ])

      if (jobsRes.success) dispatch(setJobs(jobsRes.data))
      if (resumesRes.success) dispatch(setResumes(resumesRes.data))
      if (notesRes.success) dispatch(setNotes({ data: notesRes.data, count: notesRes.count }))
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const stats = {
    totalJobs: jobs.length,
    totalResumes: resumes.length,
    totalNotes: notes.length,
    activeApplications: jobs.filter(j => j.status === 'applied' || j.status === 'interviewing').length
  }

  // Calculate job status breakdown
  const jobStatusBreakdown = JOB_STATUSES.map(status => ({
    ...status,
    count: jobs.filter(j => j.status === status.value).length
  }))

  // Recent activity (last 5 jobs updated)
  const recentJobs = [...jobs].sort((a, b) => 
    new Date(b.updatedAt) - new Date(a.updatedAt)
  ).slice(0, 5)

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <LoadingSkeleton type="block" />
        </div>
        <div className="stats-grid">
          <LoadingSkeleton type="stat" count={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Welcome back, {user?.fullname?.firstname || 'User'} ! 
          </h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your job search
          </p>
        </div>
        <div className="dashboard-actions">

        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon stat-icon-jobs">
            <IoBriefcase size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-value">{stats.totalJobs}</p>
            <p className="stat-label">Total Jobs</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon stat-icon-resumes">
            <IoDocument size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-value">{stats.totalResumes}</p>
            <p className="stat-label">Resumes</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon stat-icon-notes">
            <IoCreate size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-value">{stats.totalNotes}</p>
            <p className="stat-label">Notes</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon stat-icon-active">
            <IoCheckmarkCircle size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-value">{stats.activeApplications}</p>
            <p className="stat-label">Active Applications</p>
          </div>
        </Card>
      </div>

      <div className="dashboard-grid">
        {/* Job Status Breakdown */}
        <Card className="dashboard-card">
          <h3 className="card-title">Job Status Breakdown</h3>
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

        {/* Recent Activity */}
        <Card className="dashboard-card">
          <h3 className="card-title">Recent Activity</h3>
          {recentJobs.length > 0 ? (
            <div className="activity-list">
              {recentJobs.map((job) => (
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
                        background: `${JOB_STATUSES.find(s => s.value === job.status)?.color}20`,
                        color: JOB_STATUSES.find(s => s.value === job.status)?.color
                      }}
                    >
                      {JOB_STATUSES.find(s => s.value === job.status)?.label}
                    </span>
                    <span className="activity-date">{formatDate(job.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-activity">
              <p>No recent activity</p>
              <Button 
                variant="primary" 
                size="small"
                onClick={() => navigate('/jobs/add')}
              >
                Add Your First Job
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="section-heading">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Card className="quick-action-card" onClick={() => navigate('/jobs/add')} hoverable>
            <IoBriefcase size={32} className="quick-action-icon" />
            <p className="quick-action-title">Add Job</p>
          </Card>
          <Card className="quick-action-card" onClick={() => navigate('/resumes')} hoverable>
            <IoDocument size={32} className="quick-action-icon" />
            <p className="quick-action-title">Upload Resume</p>
          </Card>
          <Card className="quick-action-card" onClick={() => navigate('/notes')} hoverable>
            <IoCreate size={32} className="quick-action-icon" />
            <p className="quick-action-title">Create Note</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
