import { useSettings } from '../context/SettingsContext'
import AuraBackground from './AuraBackground'
import ThemeToggle from './ThemeToggle'

// Wraps a page in the Aurora Beams background + gives it a theme toggle
// in the top-right corner. `children` renders above the background.
export default function PageBackground({ children, showToggle = false }) {
    const { settings, updateSettings } = useSettings()
    const isDark = settings.darkMode

    return (
        <div
            style={{
                position: 'relative',
                minHeight: '100vh',
                backgroundColor: isDark ? '#100e0b' : '#f3f1ec',
                transition: 'background-color 0.3s ease',
            }}
        >
            <AuraBackground isDark={isDark} />

            {showToggle && (
                <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 2 }}>
                    <ThemeToggle isDark={isDark} onToggle={() => updateSettings({ darkMode: !isDark })} />
                </div>
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
    )
}