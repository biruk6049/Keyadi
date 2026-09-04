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
        return { ...DEFAULTS, ...JSON.parse(raw) }
    } catch {
        return DEFAULTS
    }
}

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(loadSettings)

    useEffect(() => {
        localStorage.setItem('placeTrackerSettings', JSON.stringify(settings))
        document.documentElement.classList.toggle('dark', settings.darkMode)
        // Update the actual page background too, not just component-level styles -
        // otherwise you get flashes of the old color at page edges/overscroll.
        document.body.style.backgroundColor = settings.darkMode ? '#100e0b' : '#f3f1ec'
        document.body.style.transition = 'background-color 0.3s ease'
    }, [settings])

    const updateSettings = (partial) => {
        setSettings((prev) => ({ ...prev, ...partial }))
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