import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../../redux/slices/themeSlice'
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'
import './ThemeToggle.css'

const ThemeToggle = () => {
  const dispatch = useDispatch()
  const { mode } = useSelector((state) => state.theme)

  return (
    <button
      className="theme-toggle"
      onClick={() => dispatch(toggleTheme())}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {mode === 'dark'
        ? <IoSunnyOutline size={17} />
        : <IoMoonOutline size={17} />
      }
    </button>
  )
}

export default ThemeToggle
