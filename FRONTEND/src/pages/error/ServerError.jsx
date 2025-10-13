
import { useNavigate } from 'react-router-dom'
import { IoHome, IoRefresh } from 'react-icons/io5'
import Button from '../../components/common/Button'
import './ErrorPage.css'

const ServerError = () => {
  const navigate = useNavigate()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">500</div>
        <h1 className="error-title">Server Error</h1>
        <p className="error-message">
          Something went wrong on our end. Please try again later.
        </p>
        <div className="error-actions">
          <Button 
            variant="secondary" 
            onClick={handleRefresh}
            icon={<IoRefresh />}
          >
            Try Again
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard')}
            icon={<IoHome />}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ServerError
