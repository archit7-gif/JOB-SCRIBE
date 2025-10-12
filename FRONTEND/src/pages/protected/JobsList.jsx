
// import { useEffect, useState } from 'react'
import { useEffect, } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { IoAdd, IoBriefcaseOutline } from 'react-icons/io5'
import Button from '../../components/common/Button'
import JobCard from '../../components/jobs/JobCard'
import JobFilters from '../../components/jobs/JobFilters'
import LoadingSkeleton from '../../components/common/LoadingSkeleton'
import EmptyState from '../../components/common/EmptyState'
import { setJobs, setLoading } from '../../redux/slices/jobsSlice'
import jobService from '../../services/jobService'
import './JobsList.css'

const JobsList = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { jobs, filters, loading } = useSelector((state) => state.jobs)

  useEffect(() => {
    fetchJobs()
  }, [filters])

  const fetchJobs = async () => {
    try {
      dispatch(setLoading(true))
      const response = await jobService.getJobs(filters)
      if (response.success) {
        dispatch(setJobs(response.data))
      }
    } catch (error) {
      toast.error('Failed to load jobs')
      console.log(error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = !filters.status || job.status === filters.status
    const matchesSearch = !filters.search || 
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="jobs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">Track and manage your job applications</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/jobs/add')}
          icon={<IoAdd />}
        >
          Add Job
        </Button>
      </div>

      <JobFilters />

      {loading ? (
        <div className="jobs-grid">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IoBriefcaseOutline size={64} />}
          title={filters.search || filters.status ? "No jobs found" : "No jobs yet"}
          message={filters.search || filters.status ? "Try adjusting your filters" : "Start by adding your first job application"}
          actionText={!filters.search && !filters.status ? "Add Job" : null}
          onAction={() => navigate('/jobs/add')}
        />
      )}
    </div>
  )
}

export default JobsList
