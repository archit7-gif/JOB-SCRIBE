

import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../../redux/slices/themeSlice'
import { IoSunny, IoMoon } from 'react-icons/io5'
import './ThemeToggle.css'

const ThemeToggle = () => {
  const dispatch = useDispatch()
  const { mode } = useSelector((state) => state.theme)

  const handleToggle = () => {
    dispatch(toggleTheme())
  }

  return (
    <button 
      className="theme-toggle" 
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      {mode === 'dark' ? <IoSunny size={20} /> : <IoMoon size={20} />}
    </button>
  )
}

export default ThemeToggle
