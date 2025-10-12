

import { useDispatch, useSelector } from 'react-redux'
import { setFilters } from '../../redux/slices/notesSlice'
import { IoSearch } from 'react-icons/io5'
import './NoteFilters.css'

const NoteFilters = ({ jobs = [] }) => {
  const dispatch = useDispatch()
  const { filters } = useSelector((state) => state.notes)

  const handleSearchChange = (e) => {
    dispatch(setFilters({ search: e.target.value }))
  }

  const handleJobFilter = (e) => {
    dispatch(setFilters({ jobId: e.target.value }))
  }

  return (
    <div className="note-filters">
      <div className="filter-group">
        <div className="search-input-wrapper">
          <IoSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search notes..."
            value={filters.search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      <div className="filter-group">
        <select 
          value={filters.jobId} 
          onChange={handleJobFilter}
          className="filter-select"
        >
          <option value="">All Jobs</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title} - {job.company}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default NoteFilters
