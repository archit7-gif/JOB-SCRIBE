import { Link } from 'react-router-dom'
import { IoArrowForward, IoSparkles, IoBriefcase, IoDocument, IoCheckmarkCircle } from 'react-icons/io5'
import './Welcome.css'

const Welcome = () => {
  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <IoSparkles size={16} />
            <span>AI-Powered Job Search</span>
          </div>
          <h1 className="hero-title">
            Land Your Dream Job with <span className="highlight">Smart Resume Optimization</span>
          </h1>
          <p className="hero-subtitle">
            Track applications, organize notes, and let AI tailor your resume for every job. 
            Get more interviews, faster.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              Get Started Free
              <IoArrowForward />
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="process-section">
        <div className="process-grid">
          <div className="process-card">
            <div className="process-number">01</div>
            <div className="process-icon">
              <IoDocument />
            </div>
            <h3 className="process-title">Upload Resume</h3>
            <p className="process-description">
              Upload your resume in PDF or DOCX format. Our AI analyzes your experience and skills.
            </p>
          </div>

          <div className="process-card">
            <div className="process-number">02</div>
            <div className="process-icon">
              <IoBriefcase />
            </div>
            <h3 className="process-title">Add Jobs</h3>
            <p className="process-description">
              Save job listings you're interested in. Track application status from saved to offer.
            </p>
          </div>

          <div className="process-card">
            <div className="process-number">03</div>
            <div className="process-icon">
              <IoSparkles />
            </div>
            <h3 className="process-title">Get Optimized</h3>
            <p className="process-description">
              Receive AI-tailored resumes for each job. Download optimized text and apply with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
{/* Features Section */}
<section className="features-section">
  <div className="features-container">
    <h2 className="features-title">Features in Your Dashboard</h2>
    <div className="features-grid">
      <div className="feature-item">
        <IoCheckmarkCircle />
        <span>Upload & Store Resumes</span>
      </div>
      <div className="feature-item">
        <IoCheckmarkCircle />
        <span>AI-Powered Optimization</span>
      </div>
      <div className="feature-item">
        <IoCheckmarkCircle />
        <span>Track Job Applications</span>
      </div>
      <div className="feature-item">
        <IoCheckmarkCircle />
        <span>Resume Match Scoring</span>
      </div>
      <div className="feature-item">
        <IoCheckmarkCircle />
        <span>Organize Interview Notes</span>
      </div>
      <div className="feature-item">
        <IoCheckmarkCircle />
        <span>Download Optimized Text</span>
      </div>
    </div>
  </div>
</section>


      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Land Your Dream Job?</h2>
          <p className="cta-subtitle">Join thousands of job seekers optimizing their applications with AI</p>
          <Link to="/register" className="btn-primary btn-large">
            Start Free Today
            <IoArrowForward />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Welcome
