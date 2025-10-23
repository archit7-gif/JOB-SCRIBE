



import { IoDownload, IoClose, IoCopy } from 'react-icons/io5'
import { toast } from 'react-toastify'
import Modal from '../common/Modal'
import Button from '../common/Button'
import './OptimizedResumePreview.css'

const OptimizedResumePreview = ({ 
  isOpen, 
  onClose, 
  optimization, 
  onDownload, 
  downloading = false 
}) => {
  if (!optimization) return null

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(optimization.optimizedContent)
    toast.success('Resume copied to clipboard')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" title="Optimized Resume Preview">
      <div className="resume-preview-container">
        <div className="preview-header">
          <h3 className="preview-title">{optimization.jobTitle || 'Optimized Resume'}</h3>
          <p className="preview-subtitle">
            Applied {optimization.appliedSuggestions?.length || 0} AI suggestions
          </p>
        </div>

        <div className="preview-content">
          <pre className="resume-text">{optimization.optimizedContent}</pre>
        </div>

        <div className="preview-actions">
          <Button 
            variant="secondary" 
            onClick={onClose}
            icon={<IoClose />}
          >
            Close
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleCopyToClipboard}
            icon={<IoCopy />}
          >
            Copy Text
          </Button>
          <Button 
            variant="primary" 
            onClick={onDownload}
            loading={downloading}
            icon={<IoDownload />}
          >
            Download TXT
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default OptimizedResumePreview

