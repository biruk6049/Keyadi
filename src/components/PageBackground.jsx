import { useSettings } from '../context/SettingsContext'
import AuraBackground from './AuraBackground'
import ThemeToggle from './ThemeToggle'

// Wraps a page in the Aurora Beams background + gives it a theme toggle
// in the top-right corner. `children` renders above the background.
export default function PageBackground({ children, showToggle = false }) {
    const isDark = true

    return (
        <div
            style={{
                position: 'relative',
                minHeight: '100vh',
                backgroundColor: '#0e0d0b',
                transition: 'background-color 0.3s ease',
            }}
        >
            <AuraBackground isDark={true} />

            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
    )
}