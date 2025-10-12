

import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { IoAdd, IoDocumentOutline } from 'react-icons/io5'
import Button from '../../components/common/Button'
import ResumeCard from '../../components/resumes/ResumeCard'
import ResumeUploadModal from '../../components/resumes/ResumeUploadModal'
import LoadingSkeleton from '../../components/common/LoadingSkeleton'
import EmptyState from '../../components/common/EmptyState'
import { setResumes, setLoading } from '../../redux/slices/resumesSlice'
import resumeService from '../../services/resumeService'
import './ResumesList.css'

const ResumesList = () => {
//   const navigate = useNavigate()
  const dispatch = useDispatch()
  const { resumes, loading } = useSelector((state) => state.resumes)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      dispatch(setLoading(true))
      const response = await resumeService.getResumes()
      if (response.success) {
        dispatch(setResumes(response.data))
      }
    } catch (error) {
      toast.error('Failed to load resumes')
      console.log(error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="resumes-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resumes</h1>
          <p className="page-subtitle">Manage and optimize your resumes with AI</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowUploadModal(true)}
          icon={<IoAdd />}
        >
          Create Resume
        </Button>
      </div>

      {loading ? (
        <div className="resumes-grid">
          <LoadingSkeleton type="card" count={4} />
        </div>
      ) : resumes.length > 0 ? (
        <div className="resumes-grid">
          {resumes.map((resume) => (
            <ResumeCard key={resume._id} resume={resume} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IoDocumentOutline size={64} />}
          title="No resumes yet"
          message="Upload your first resume to get started with AI-powered optimization"
          actionText="Create Resume"
          onAction={() => setShowUploadModal(true)}
        />
      )}

      <ResumeUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  )
}

export default ResumesList
