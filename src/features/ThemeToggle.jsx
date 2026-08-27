import { useTheme } from '../lib/useTheme'

const styles = `
  .theme-toggle-btn {
    position: fixed;
    top: 14px;
    right: 14px;
    z-index: 30;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(10,12,28,0.7);
    backdrop-filter: blur(12px);
    color: #f2f3f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
    display:none;
  }
  .theme-toggle-btn:hover { transform: scale(1.06); background: rgba(10,12,28,0.9); }
  [data-theme='light'] .theme-toggle-btn {
    border-color: rgba(20,22,27,0.12);
    background: rgba(255,255,255,0.85);
    color: #14161b;
  }
`

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <style>{styles}</style>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </>
  )
}