
import { Link } from 'react-router-dom'
import { IoCheckmarkCircle, IoRocketSharp, IoBriefcase, IoDocument } from 'react-icons/io5'
import './Welcome.css'

const Welcome = () => {
  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Struggling to Get <span className="highlight">Interviews</span>?
          </h1>
          <p className="hero-subtitle">
            Let AI optimize your resume for every job application. Track applications, 
            organize notes, and land your dream job faster.
          </p>
          <Link to="/register" className="cta-button">
            <IoRocketSharp size={20} />
            Get Started Free
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
      
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon step-icon-1">
              <IoDocument size={32} />
            </div>
            <h3 className="step-title">1. Upload Your Resume</h3>
            <p className="step-description">
              Upload your resume or paste the content. Support for PDF and DOCX formats.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon step-icon-2">
              <IoBriefcase size={32} />
            </div>
            <h3 className="step-title">2. Add Job Listings</h3>
            <p className="step-description">
              Save job postings you're interested in. Track status from saved to offer.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon step-icon-3">
              <IoCheckmarkCircle size={32} />
            </div>
            <h3 className="step-title">3. AI-Powered Analysis</h3>
            <p className="step-description">
              Get AI-optimized resumes tailored for each job. Download professionally formatted PDFs.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-item">
            <IoCheckmarkCircle className="feature-icon" />
            <span>AI Resume Optimization</span>
          </div>
          <div className="feature-item">
            <IoCheckmarkCircle className="feature-icon" />
            <span>Job Application Tracking</span>
          </div>
          <div className="feature-item">
            <IoCheckmarkCircle className="feature-icon" />
            <span>Interview Notes</span>
          </div>
          <div className="feature-item">
            <IoCheckmarkCircle className="feature-icon" />
            <span>Match Score Analysis</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Welcome
