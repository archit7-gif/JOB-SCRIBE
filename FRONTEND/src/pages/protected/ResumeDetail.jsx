

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { IoArrowBack, IoTrash } from 'react-icons/io5'
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
  const [deleting, setDeleting] = useState(false)
  const [currentOptimization, setCurrentOptimization] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchResumeDetails()
  }, [id])

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
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async (data) => {
    try {
      dispatch(setAnalyzing(true))
      const response = await resumeService.analyzeResume(id, data)
      if (response.success) {
        toast.success(response.message)
        fetchResumeDetails()
        setActiveTab('history')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Analysis failed')
    } finally {
      dispatch(setAnalyzing(false))
    }
  }

  const handleOptimize = async (analysisId) => {
    try {
      dispatch(setOptimizing(true))
      const response = await resumeService.optimizeResume(id, { analysisId })
      if (response.success) {
        toast.success('Resume optimized successfully')
        setCurrentOptimization(response.data.optimization)
        setShowPreviewModal(true)
        fetchResumeDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Optimization failed')
    } finally {
      dispatch(setOptimizing(false))
    }
  }

  const handleDownload = async () => {
    if (!currentOptimization) return

    try {
      setDownloading(true)
      const blob = await resumeService.downloadOptimizedResume(id, currentOptimization._id)
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedResume.title}_optimized.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Resume downloaded successfully')
    } catch (error) {
      toast.error('Failed to download resume')
      console.log(error)
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
      console.log(error)
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
        <Button 
          variant="danger" 
          onClick={() => setShowDeleteModal(true)}
          icon={<IoTrash />}
        >
          Delete
        </Button>
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
