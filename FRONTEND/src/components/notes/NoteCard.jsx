

import { useNavigate } from 'react-router-dom'
import { IoCalendarOutline } from 'react-icons/io5'
import { formatDate, truncateText } from '../../utils/formatters'
import './NoteCard.css'

const NoteCard = ({ note }) => {
  const navigate = useNavigate()

  return (
    <div className="note-card" onClick={() => navigate(`/notes/${note._id}`)}>
      <h3 className="note-card-title">{note.title}</h3>
      
      <div 
        className="note-card-content"
        dangerouslySetInnerHTML={{ 
          __html: note.contentHTML || truncateText(note.content, 200) 
        }}
      />

      <div className="note-card-footer">
        <div className="note-date">
          <IoCalendarOutline size={14} />
          <span>{formatDate(note.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

export default NoteCard
