import { createContext, useContext, useEffect, useState } from 'react'

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
        if (!raw) return DEFAULTS
        const parsed = JSON.parse(raw)
        // Ensure darkMode is always true, cleaning up any stale legacy cache
        const merged = { ...DEFAULTS, ...parsed, darkMode: true }
        localStorage.setItem('placeTrackerSettings', JSON.stringify(merged))
        return merged
    } catch {
        return DEFAULTS
    }
}

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        const initial = loadSettings()
        return { ...initial, darkMode: true }
    })

    useEffect(() => {
        const safeSettings = { ...settings, darkMode: true }
        localStorage.setItem('placeTrackerSettings', JSON.stringify(safeSettings))
        document.documentElement.classList.add('dark')
        document.body.style.backgroundColor = '#0e0d0b'
        document.body.style.color = '#f3f1ec'
    }, [settings])

    const updateSettings = (partial) => {
        setSettings((prev) => ({ ...prev, ...partial, darkMode: true }))
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const ctx = useContext(SettingsContext)
    if (ctx === undefined) throw new Error('useSettings must be used within SettingsProvider')
    return ctx
}