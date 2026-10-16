import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

const SettingsContext = createContext(undefined)

const DEFAULTS = {
    darkMode: true,
    units: 'km', // 'km' | 'mi'
    searchMode: 'auto', // 'auto' (live GPS) | 'custom' (fixed point below)
    mapStyle: 'default', // 'default' | 'satellite'
    defaultLat: 9.03,
    defaultLng: 38.74,
    defaultLocationLabel: 'Addis Ababa',
}

function loadSettings() {
    try {
        const raw = localStorage.getItem('placeTrackerSettings')
        const explicitDark = localStorage.getItem('placeTrackerDarkMode')
        let parsed = raw ? JSON.parse(raw) : {}
        
        let darkMode = DEFAULTS.darkMode
        if (explicitDark !== null) {
            darkMode = explicitDark === 'true'
        } else if (typeof parsed.darkMode === 'boolean') {
            darkMode = parsed.darkMode
        }

        return { ...DEFAULTS, ...parsed, darkMode }
    } catch {
        return DEFAULTS
    }
}

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(loadSettings)
    const isFirstMount = useRef(true)

    // Smoothly apply theme to DOM with anti-flash transition
    useEffect(() => {
        const isDark = settings.darkMode

        // Apply transition class to prevent harsh snap (skip on initial load to prevent boot lag)
        if (!isFirstMount.current) {
            document.documentElement.classList.add('theme-transition')
            const timer = setTimeout(() => {
                document.documentElement.classList.remove('theme-transition')
            }, 350)
            return () => clearTimeout(timer)
        } else {
            isFirstMount.current = false
        }

        if (isDark) {
            document.documentElement.classList.add('dark')
            document.body.style.backgroundColor = '#0e0d0b'
            document.body.style.color = '#f3f1ec'
        } else {
            document.documentElement.classList.remove('dark')
            document.body.style.backgroundColor = '#faf9f6'
            document.body.style.color = '#100e0b'
        }

        try {
            localStorage.setItem('placeTrackerSettings', JSON.stringify(settings))
            localStorage.setItem('placeTrackerDarkMode', String(isDark))
        } catch {
            // LocalStorage write error fallback
        }
    }, [settings])

    const updateSettings = useCallback((partial) => {
        setSettings((prev) => {
            const next = { ...prev, ...partial }
            if (typeof partial.darkMode === 'boolean') {
                try {
                    localStorage.setItem('placeTrackerDarkMode', String(partial.darkMode))
                } catch {}
            }
            return next
        })
    }, [])

    const toggleDarkMode = useCallback(() => {
        setSettings((prev) => {
            const nextDark = !prev.darkMode
            try {
                localStorage.setItem('placeTrackerDarkMode', String(nextDark))
            } catch {}
            return { ...prev, darkMode: nextDark }
        })
    }, [])

    return (
        <SettingsContext.Provider
            value={{
                settings,
                updateSettings,
                toggleDarkMode,
                isDark: settings.darkMode,
            }}
        >
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const ctx = useContext(SettingsContext)
    if (ctx === undefined) throw new Error('useSettings must be used within SettingsProvider')
    return ctx
}