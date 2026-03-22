import { Link } from 'react-router-dom'
import {
  IoArrowForward,
  IoSparkles,
  IoBriefcaseOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoRocketOutline,
  IoTrophyOutline,
  IoBarChartOutline,
} from 'react-icons/io5'
import './Welcome.css'

const Welcome = () => {
  const features = [
    { icon: <IoDocumentTextOutline />, label: 'Upload & Store Resumes' },
    { icon: <IoSparkles />, label: 'AI-Powered Optimization' },
    { icon: <IoBriefcaseOutline />, label: 'Track Applications' },
    { icon: <IoBarChartOutline />, label: 'Resume Match Scoring' },
    { icon: <IoRocketOutline />, label: 'Interview Notes' },
    { icon: <IoTrophyOutline />, label: 'Download Optimized Text' },
  ]

  return (
    <div className="welcome-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <IoSparkles size={14} />
            <span>AI-Powered Job Search Toolkit</span>
          </div>

          <h1 className="hero-title">
            Land Your Dream Job with{' '}
            <span className="highlight">Smart Resume Optimization</span>
          </h1>

          <p className="hero-subtitle">
            Track applications, organize notes, and let AI tailor your resume for
            every job. Get more callbacks, faster.
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

          <div className="hero-proof">
            <div className="hero-proof-dots">
              <span className="hero-proof-dot" />
              <span className="hero-proof-dot" style={{ opacity: 0.5 }} />
              <span className="hero-proof-dot" style={{ opacity: 0.3 }} />
            </div>
            <span>Join thousands of job seekers already using JobScribe</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="process-section">
        <div className="section-header">
          <p className="section-eyebrow">How it works</p>
          <h2 className="section-title">Three steps to your next offer</h2>
          <p className="section-subtitle">
            From upload to interview in minutes — powered by AI that understands job requirements.
          </p>
        </div>

        <div className="process-grid">
          <div className="process-card">
            <div className="process-number">01</div>
            <div className="process-icon">
              <IoDocumentTextOutline />
            </div>
            <h3 className="process-title">Upload Resume</h3>
            <p className="process-description">
              Upload your resume in PDF or DOCX. Our AI reads your experience and skills to build your profile.
            </p>
          </div>

          <div className="process-card">
            <div className="process-number">02</div>
            <div className="process-icon">
              <IoBriefcaseOutline />
            </div>
            <h3 className="process-title">Add Jobs</h3>
            <p className="process-description">
              Save job listings you're interested in. Track status from saved to offer with a clean pipeline.
            </p>
          </div>

          <div className="process-card">
            <div className="process-number">03</div>
            <div className="process-icon">
              <IoSparkles />
            </div>
            <h3 className="process-title">Get Optimized</h3>
            <p className="process-description">
              Receive AI-tailored resumes for each job with match scoring. Apply with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">Everything you need in one place</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-item-icon">{f.icon}</div>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to land your dream job?</h2>
          <p className="cta-subtitle">
            Join thousands of job seekers optimizing their applications with AI-powered tools.
          </p>
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
