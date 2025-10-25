
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { IoArrowBack, IoTrash, IoCreate } from 'react-icons/io5'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import AIAnalysisForm from '../../components/resumes/AIAnalysisForm'
import AIAnalysisCard from '../../components/resumes/AIAnalysisCard'
import OptimizedResumePreview from '../../components/resumes/OptimizedResumePreview'
import LoadingSkeleton from '../../components/common/LoadingSkeleton'
import EmptyState from '../../components/common/EmptyState'
import { 
  setSelectedResume,
  updateResume as updateResumeAction,
  deleteResume as deleteResumeAction,
  setAnalyzing,
  setOptimizing
} from '../../redux/slices/resumesSlice'
import resumeService from '../../services/resumeService'
import './ResumeDetail.css'



const ResumeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedResume, analyzing, optimizing } = useSelector((state) => state.resumes)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [currentOptimization, setCurrentOptimization] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  useEffect(() => {
    fetchResumeDetails()
  }, [id])

  useEffect(() => {
    if (selectedResume && showEditModal && selectedResume.type === 'text') {
      reset({
        title: selectedResume.title,
        content: selectedResume.content
      })
    } else if (selectedResume && showEditModal && selectedResume.type === 'file') {
      reset({
        title: selectedResume.title
      })
    }
  }, [selectedResume, showEditModal, reset])

  const fetchResumeDetails = async () => {
    try {
      setLoading(true)
      const response = await resumeService.getResume(id)
      if (response.success) {
        dispatch(setSelectedResume(response.data))
      }
    } catch (error) {
      toast.error('Failed to load resume')
      navigate('/resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateResume = async (data) => {
    try {
      setUpdating(true)
      const response = await resumeService.updateResume(id, data)
      if (response.success) {
        dispatch(updateResumeAction(response.data))
        dispatch(setSelectedResume(response.data))
        toast.success('Resume updated successfully')
        setShowEditModal(false)
      }
    } catch (error) {
      toast.error('Failed to update resume')
    } finally {
      setUpdating(false)
    }
  }


const handleAnalyze = async (data) => {
  try {
    dispatch(setAnalyzing(true))
    const response = await resumeService.analyzeResume(id, data)
    if (response.success) {
      // Check if from cache
      if (response.data.fromCache) {
        toast.info('Analysis retrieved from cache')
      } else {
        toast.success('Resume analyzed successfully')
      }
      fetchResumeDetails()
      setActiveTab('history')
    }
  } catch (error) {
    // Handle rate limit error
    if (error.response?.status === 429) {
      toast.error(error.response.data.message)
    } else {
      toast.error(error.response?.data?.message || 'Analysis failed')
    }
  } finally {
    dispatch(setAnalyzing(false))
  }
}

const handleOptimize = async (analysisId) => {
  try {
    dispatch(setOptimizing(true))
    const response = await resumeService.optimizeResume(id, { analysisId })
    if (response.success) {
      if (response.data.fromCache) {
        toast.info('Optimization retrieved from cache')
      } else {
        toast.success('Resume optimized successfully')
      }
      setCurrentOptimization({
        ...response.data.optimization,
        optimizationId: response.data.optimizationId
      })
      setShowPreviewModal(true)
      fetchResumeDetails()
    }
  } catch (error) {
    // Only show toast for non-429 errors
    if (error.response?.status !== 429) {
      toast.error(error.response?.data?.message || 'Optimization failed')
    }
    // Don't re-throw for 429 errors (prevents card from catching it)
    if (error.response?.status !== 429) {
      throw error
    }
  } finally {
    dispatch(setOptimizing(false))
  }
}




  const handleDownload = async () => {
    if (!currentOptimization) return

    try {
      setDownloading(true)
      const blob = await resumeService.downloadOptimizedResume(
        id, 
        currentOptimization.optimizationId || currentOptimization._id
      )
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedResume.title}_optimized.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Resume downloaded successfully')
    } catch (error) {
      toast.error('Failed to download resume')
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await resumeService.deleteResume(id)
      if (response.success) {
        dispatch(deleteResumeAction(id))
        toast.success('Resume deleted successfully')
        navigate('/resumes')
      }
    } catch (error) {
      toast.error('Failed to delete resume')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="resume-detail-page">
        <LoadingSkeleton type="card" count={1} />
      </div>
    )
  }

  if (!selectedResume) {
    return null
  }

  return (
    <div className="resume-detail-page">
      <div className="page-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/resumes')}
          icon={<IoArrowBack />}
        >
          Back to Resumes
        </Button>
        <div className="header-actions">
          <Button 
            variant="secondary" 
            onClick={() => setShowEditModal(true)}
            icon={<IoCreate />}
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
            icon={<IoTrash />}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card className="resume-detail-card">
        <h1 className="resume-detail-title">{selectedResume.title}</h1>
        <div className="resume-meta">
          <span className="resume-type-badge">
            {selectedResume.type === 'file' ? 'Uploaded File' : 'Text Content'}
          </span>
          {selectedResume.fileName && (
            <span className="resume-filename">{selectedResume.fileName}</span>
          )}
        </div>
      </Card>

      <div className="resume-tabs">
        <button
          className={`tab-button ${activeTab === 'content' ? 'tab-button-active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`tab-button ${activeTab === 'analyze' ? 'tab-button-active' : ''}`}
          onClick={() => setActiveTab('analyze')}
        >
          AI Analysis
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'tab-button-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History ({selectedResume.aiAnalyses?.length || 0})
        </button>
      </div>

      {activeTab === 'content' && (
        <Card className="tab-content">
          <pre className="resume-content">{selectedResume.content}</pre>
        </Card>
      )}

      {activeTab === 'analyze' && (
        <Card className="tab-content">
          <h3 className="tab-title">Analyze Resume for a Job</h3>
          <p className="tab-description">
            Paste a job description to get AI-powered match score, strengths, and suggestions
          </p>
          <AIAnalysisForm onSubmit={handleAnalyze} loading={analyzing} />
        </Card>
      )}

      {activeTab === 'history' && (
        <div className="tab-content">
          {selectedResume.aiAnalyses && selectedResume.aiAnalyses.length > 0 ? (
            <div className="analyses-list">
              {selectedResume.aiAnalyses.map((analysis) => (
                <AIAnalysisCard
                  key={analysis._id}
                  analysis={analysis}
                  onOptimize={handleOptimize}
                  optimizing={optimizing}
                />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon="📊"
                title="No analyses yet"
                message="Analyze this resume against job descriptions to see match scores and suggestions"
                actionText="Analyze Now"
                onAction={() => setActiveTab('analyze')}
              />
            </Card>
          )}
        </div>
      )}

      {/* Edit Resume Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Resume"
        size="medium"
      >
        <form onSubmit={handleSubmit(handleUpdateResume)} className="edit-resume-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className={`form-input ${errors.title ? 'form-input-error' : ''}`}
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          {selectedResume.type === 'text' && (
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea
                {...register('content', { required: 'Content is required' })}
                className={`form-input ${errors.content ? 'form-input-error' : ''}`}
                rows="12"
              />
              {errors.content && <span className="form-error">{errors.content.message}</span>}
            </div>
          )}

          {selectedResume.type === 'file' && (
            <p className="field-note">
              Note: File content cannot be edited. Only the title can be changed.
            </p>
          )}

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={updating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Resume"
        size="small"
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete this resume? All analyses and optimizations will be lost.</p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete Resume
            </Button>
          </div>
        </div>
      </Modal>

      <OptimizedResumePreview
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        optimization={currentOptimization}
        onDownload={handleDownload}
        downloading={downloading}
      />
    </div>
  )
}

export default ResumeDetail


