import { useNavigate } from 'react-router-dom'
import { IoHomeOutline, IoArrowBackOutline } from 'react-icons/io5'
import Button from '../../components/common/Button'
import './ErrorPage.css'

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page not found</h1>
        <p className="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="error-actions">
          <Button variant="secondary" onClick={() => navigate(-1)} icon={<IoArrowBackOutline />}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => navigate('/dashboard')} icon={<IoHomeOutline />}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
