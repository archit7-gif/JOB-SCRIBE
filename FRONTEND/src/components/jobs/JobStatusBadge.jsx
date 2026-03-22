import './JobStatusBadge.css'

const STATUS_STYLES = {
  saved:        { bg: 'rgba(139,148,158,0.12)', color: '#8b949e', dot: '#8b949e' },
  applied:      { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', dot: '#60a5fa' },
  interviewing: { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', dot: '#fbbf24' },
  offer:        { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', dot: '#34d399' },
  rejected:     { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', dot: '#f87171' },
}

const STATUS_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
}

const JobStatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.saved
  const label = STATUS_LABELS[status] || status

  return (
    <span
      className="status-badge"
      style={{ background: style.bg, color: style.color }}
    >
      <span className="status-badge-dot" style={{ background: style.dot }} />
      {label}
    </span>
  )
}

export default JobStatusBadge
