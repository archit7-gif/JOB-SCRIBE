

import { useNavigate } from 'react-router-dom'
import { IoHome } from 'react-icons/io5'
import Button from '../../components/common/Button'
import './ErrorPage.css'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/dashboard')}
          icon={<IoHome />}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}

export default NotFound
