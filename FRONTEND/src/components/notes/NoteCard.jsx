import { useNavigate } from 'react-router-dom'
import { IoCalendarOutline, IoBriefcaseOutline } from 'react-icons/io5'
import { formatDate, truncateText } from '../../utils/formatters'
import './NoteCard.css'

const NoteCard = ({ note }) => {
  const navigate = useNavigate()

  return (
    <div className="note-card" onClick={() => navigate(`/notes/${note._id}`)}>
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title}</h3>
        {note.type && <span className="note-card-tag">{note.type}</span>}
      </div>

      {/* Preserve contentHTML rendering exactly as original — backend may return HTML */}
      <div
        className="note-card-preview"
        dangerouslySetInnerHTML={{
          __html: note.contentHTML || truncateText(note.content, 180)
        }}
      />

      <div className="note-card-footer">
        <div className="note-card-date">
          <IoCalendarOutline size={12} />
          <span>{formatDate(note.updatedAt)}</span>
        </div>
        {note.jobId && (
          <div className="note-card-job">
            <IoBriefcaseOutline size={12} />
            <span>{note.jobId?.title || 'Linked job'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteCard