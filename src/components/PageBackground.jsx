import { useSettings } from '../context/SettingsContext'
import AuraBackground from './AuraBackground'
import ThemeToggle from './ThemeToggle'

// Wraps a page in the Aurora Beams background + gives it a theme toggle
// in the top-right corner. `children` renders above the background.
export default function PageBackground({ children, showToggle = false }) {
    const { isDark, toggleDarkMode } = useSettings()

    return (
        <div
            style={{
                position: 'relative',
                minHeight: '100vh',
                backgroundColor: isDark ? '#0e0d0b' : '#faf9f6',
                color: isDark ? '#f3f1ec' : '#100e0b',
                transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
        >
            <AuraBackground isDark={isDark} />

            {showToggle && (
                <div className="fixed top-4 right-4 z-50">
                    <ThemeToggle isDark={isDark} onToggle={toggleDarkMode} />
                </div>
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
    )
}