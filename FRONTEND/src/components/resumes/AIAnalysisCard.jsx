
import { useState } from 'react'
import { IoChevronDown, IoChevronUp, IoTrophy, IoWarning, IoKey, IoConstruct } from 'react-icons/io5'
import ProgressBar from '../common/ProgressBar'
import { formatDate } from '../../utils/formatters'
import './AIAnalysisCard.css'

const AIAnalysisCard = ({ analysis, onOptimize, optimizing = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-success)'
    if (score >= 60) return 'var(--color-warning)'
    return 'var(--color-danger)'
  }

  return (
    <div className="ai-analysis-card">
      <div 
        className="analysis-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="analysis-header-content">
          <h4 className="analysis-title">{analysis.jobTitle || 'Job Analysis'}</h4>
          <p className="analysis-date">{formatDate(analysis.createdAt)}</p>
        </div>
        <div className="analysis-header-right">
          <div className="analysis-score" style={{ color: getScoreColor(analysis.matchScore) }}>
            {analysis.matchScore}%
          </div>
          <button type="button" className="analysis-toggle">
            {isExpanded ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="analysis-body">
          <div className="analysis-section">
            <ProgressBar 
              value={analysis.matchScore} 
              max={100}
              label="Match Score"
              color={getScoreColor(analysis.matchScore)}
            />
          </div>

          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="analysis-section">
              <div className="section-header">
                <IoTrophy className="section-icon" />
                <h5 className="section-title">Strengths</h5>
              </div>
              <ul className="analysis-list">
                {analysis.strengths.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="analysis-section">
              <div className="section-header">
                <IoConstruct className="section-icon" />
                <h5 className="section-title">Suggestions</h5>
              </div>
              <ul className="analysis-list">
                {analysis.suggestions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
            <div className="analysis-section">
              <div className="section-header">
                <IoKey className="section-icon" />
                <h5 className="section-title">Missing Keywords</h5>
              </div>
              <div className="keyword-tags">
                {analysis.missingKeywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>
          )}

          {analysis.sectionsToImprove && analysis.sectionsToImprove.length > 0 && (
            <div className="analysis-section">
              <div className="section-header">
                <IoWarning className="section-icon" />
                <h5 className="section-title">Sections to Improve</h5>
              </div>
              <ul className="analysis-list">
                {analysis.sectionsToImprove.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="analysis-actions">
            <Button
              variant="primary"
              onClick={() => onOptimize(analysis._id)}
              loading={optimizing}
              fullWidth
            >
              Generate Optimized Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAnalysisCard
