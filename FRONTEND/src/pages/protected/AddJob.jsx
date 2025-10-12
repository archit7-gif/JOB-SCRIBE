import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { IoArrowBack } from 'react-icons/io5'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import JobForm from '../../components/jobs/JobForm'
import { addJob } from '../../redux/slices/jobsSlice'
import { setResumes } from '../../redux/slices/resumesSlice'
import jobService from '../../services/jobService'
import resumeService from '../../services/resumeService'
import './AddJob.css'

const AddJob = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { resumes } = useSelector((state) => state.resumes)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await resumeService.getResumes()
      if (response.success) {
        dispatch(setResumes(response.data))
      }
    } catch (error) {
      console.error('Failed to load resumes')
      console.log(error)
    }
  }

  const handleSubmit = async (data) => {
    try {
      setLoading(true)
      const response = await jobService.createJob(data)
      if (response.success) {
        dispatch(addJob(response.data))
        toast.success('Job added successfully')
        navigate('/jobs')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-job-page">
      <div className="page-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          icon={<IoArrowBack />}
        >
          Back to Jobs
        </Button>
      </div>

      <Card className="add-job-card">
        <h1 className="form-page-title">Add New Job</h1>
        <p className="form-page-subtitle">Track a new job opportunity</p>
        <JobForm onSubmit={handleSubmit} loading={loading} resumes={resumes} />
      </Card>
    </div>
  )
}

export default AddJob
