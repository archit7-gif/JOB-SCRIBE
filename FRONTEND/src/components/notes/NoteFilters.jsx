import { useDispatch, useSelector } from 'react-redux'
import { setFilters } from '../../redux/slices/notesSlice'
import { IoSearchOutline } from 'react-icons/io5'
import './NoteFilters.css'

const NoteFilters = ({ jobs = [] }) => {
  const dispatch = useDispatch()
  const { filters } = useSelector((state) => state.notes)

  return (
    <div className="note-filters">
      <div className="note-filter-search-wrapper">
        <IoSearchOutline className="note-filter-search-icon" />
        <input
          type="text"
          placeholder="Search notes…"
          value={filters.search}
          onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
          className="note-filter-search-input"
        />
      </div>

      {jobs.length > 0 && (
        <select
          value={filters.jobId}
          onChange={(e) => dispatch(setFilters({ jobId: e.target.value }))}
          className="note-filter-select"
        >
          <option value="">All Jobs</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title} — {job.company}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default NoteFilters
