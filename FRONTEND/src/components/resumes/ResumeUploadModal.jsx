
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { IoCloudUpload, IoDocument, IoCheckmarkCircle } from 'react-icons/io5'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { FILE_TYPES } from '../../utils/constants'
import { formatFileSize, validateFileType, validateFileSize } from '../../utils/formatters'
import { validationRules } from '../../utils/validators'
import resumeService from '../../services/resumeService'
import { addResume } from '../../redux/slices/resumesSlice'
import './ResumeUploadModal.css'

const ResumeUploadModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('text')
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const textForm = useForm()
  const fileForm = useForm()

  // Handle text resume submission
  const handleTextSubmit = async (data) => {
    try {
      setLoading(true)
      const response = await resumeService.createResumeFromText(data)
      
      if (response.success) {
        dispatch(addResume(response.data))
        toast.success(response.isDuplicate ? 'Duplicate resume found' : 'Resume created successfully')
        textForm.reset()
        onClose()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create resume')
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload
  const handleFileSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    try {
      setLoading(true)
      const response = await resumeService.uploadResumeFile(selectedFile, data.title)
      
      if (response.success) {
        dispatch(addResume(response.data))
        toast.success(response.isDuplicate ? 'Duplicate resume found' : 'Resume uploaded successfully')
        fileForm.reset()
        setSelectedFile(null)
        onClose()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume')
    } finally {
      setLoading(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateFileType(file, FILE_TYPES.RESUME.allowedTypes)) {
      toast.error('Only PDF and DOCX files are allowed')
      return
    }

    if (!validateFileSize(file, FILE_TYPES.RESUME.maxSize)) {
      toast.error('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
  }

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!validateFileType(file, FILE_TYPES.RESUME.allowedTypes)) {
      toast.error('Only PDF and DOCX files are allowed')
      return
    }

    if (!validateFileSize(file, FILE_TYPES.RESUME.maxSize)) {
      toast.error('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Resume" size="large">
      <div className="resume-upload-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'text' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <IoDocument size={18} />
          From Text
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'file' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('file')}
        >
          <IoCloudUpload size={18} />
          From File
        </button>
      </div>

      {activeTab === 'text' ? (
        <form onSubmit={textForm.handleSubmit(handleTextSubmit)} className="resume-form">
          <div className="form-group">
            <label className="form-label">Resume Title *</label>
            <input
              type="text"
              {...textForm.register('title', validationRules.resumeTitle)}
              className={`form-input ${textForm.formState.errors.title ? 'form-input-error' : ''}`}
              placeholder="e.g., Software Engineer Resume"
            />
            {textForm.formState.errors.title && (
              <span className="form-error">{textForm.formState.errors.title.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Resume Content *</label>
            <textarea
              {...textForm.register('content', validationRules.resumeContent)}
              className={`form-textarea ${textForm.formState.errors.content ? 'form-input-error' : ''}`}
              rows="12"
              placeholder="Paste your resume content here..."
            ></textarea>
            {textForm.formState.errors.content && (
              <span className="form-error">{textForm.formState.errors.content.message}</span>
            )}
          </div>

          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Create Resume
          </Button>
        </form>
      ) : (
        <form onSubmit={fileForm.handleSubmit(handleFileSubmit)} className="resume-form">
          <div className="form-group">
            <label className="form-label">Resume Title *</label>
            <input
              type="text"
              {...fileForm.register('title', validationRules.resumeTitle)}
              className={`form-input ${fileForm.formState.errors.title ? 'form-input-error' : ''}`}
              placeholder="e.g., Software Engineer Resume"
            />
            {fileForm.formState.errors.title && (
              <span className="form-error">{fileForm.formState.errors.title.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Upload File *</label>
            <div
              className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'file-selected' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="file-preview">
                  <IoCheckmarkCircle size={48} className="file-check-icon" />
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                  <button
                    type="button"
                    className="file-change-btn"
                    onClick={() => setSelectedFile(null)}
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <>
                  <IoCloudUpload size={48} className="upload-icon" />
                  <p className="drop-text">Drag and drop your resume here</p>
                  <p className="drop-subtext">or</p>
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileSelect}
                      className="file-input-hidden"
                    />
                    Choose File
                  </label>
                  <p className="file-requirements">PDF or DOCX • Max 5MB</p>
                </>
              )}
            </div>
          </div>

          <Button type="submit" variant="primary" loading={loading} fullWidth disabled={!selectedFile}>
            Upload Resume
          </Button>
        </form>
      )}
    </Modal>
  )
}

export default ResumeUploadModal
