import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import PageBackground from '../components/PageBackground'
import { MapIcon, SatelliteIcon, CrosshairIcon, SparklesIcon, UserIcon } from '../components/Icons'
import KeyadiLogo from '../components/KeyadiLogo'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const { user, signOut } = useAuth()
  const isDark = true

  const ink = '#f3f1ec'
  const inkMuted = 'rgba(243,241,236,0.65)'
  const inkFaint = 'rgba(243,241,236,0.40)'
  const hairline = 'rgba(243,241,236,0.12)'
  const cardBg = 'rgba(14, 13, 11, 0.86)'
  const inputBg = 'rgba(255, 255, 255, 0.04)'
  const amber = '#e8a33d'

  // Geocoding autocomplete state
  const [locationQuery, setLocationQuery] = useState(settings.defaultLocationLabel)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keep local query in sync when settings change externally
  useEffect(() => {
    setLocationQuery(settings.defaultLocationLabel)
  }, [settings.defaultLocationLabel])

  const handleLocationSearch = (value) => {
    setLocationQuery(value)
    updateSettings({ defaultLocationLabel: value })

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_TOKEN}&limit=5&types=place,locality,region,country`
        )
        const data = await res.json()
        if (data.features && data.features.length > 0) {
          setSuggestions(data.features)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 350)
  }

  const selectSuggestion = (feature) => {
    const [lng, lat] = feature.center
    setLocationQuery(feature.place_name)
    updateSettings({
      defaultLocationLabel: feature.place_name,
      defaultLat: parseFloat(lat.toFixed(6)),
      defaultLng: parseFloat(lng.toFixed(6)),
    })
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Data deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteComplete, setDeleteComplete] = useState(false)

  const handleDataDeletion = async () => {
    setDeleting(true)
    try {
      // 1. Delete all trackers from Supabase
      if (user?.id) {
        await supabase.from('trackers').delete().eq('user_id', user.id)
      }
      // 2. Clear all Keyadi localStorage keys
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('keyadi_') || key.startsWith('sb-'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
      // 3. Show completion, then sign out
      setDeleteComplete(true)
      setTimeout(async () => {
        await signOut()
      }, 2500)
    } catch (err) {
      console.error('Data deletion error:', err)
      setDeleting(false)
    }
  }

  return (
    <PageBackground showToggle={false}>
      <div
        className="min-h-screen px-4 py-8 sm:py-12 selection:bg-amber-500/20 selection:text-amber-400"
        style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", color: ink }}
      >
        <div className="mx-auto max-w-2xl">
          {/* Top Bar */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <KeyadiLogo size={36} />
                <span className="text-lg font-bold tracking-tight" style={{ color: ink }}>
                  Keyadi
                </span>
              </Link>
              <span className="text-xs" style={{ color: inkFaint }}>/</span>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-xl border transition-all hover:scale-105 shadow-md"
                style={{
                  backgroundColor: cardBg,
                  borderColor: hairline,
                  color: ink,
                }}
              >
                <span>←</span>
                <span>Back to Map</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: amber, border: `1px solid ${amber}33` }}
              >
                <SparklesIcon size={12} color={amber} />
                <span>Auto-saved</span>
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: ink }}>
              Settings
            </h1>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: inkMuted }}>
              Manage map styling, distance units, search origin, and navigation preferences.
            </p>
          </div>

          <div className="space-y-5">
            {/* Card 1: Map Visuals */}
            <div
              className="rounded-3xl p-6 shadow-2xl backdrop-blur-2xl border"
              style={{ backgroundColor: cardBg, borderColor: hairline }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold" style={{ color: ink }}>Map Appearance</h2>
                <span className="text-xs font-medium" style={{ color: amber }}>Tileset</span>
              </div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: inkMuted }}>
                Choose between high-contrast dark vector street cartography or high-resolution satellite imagery.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'default', label: 'Dark Street Map', icon: <MapIcon size={16} /> },
                  { key: 'satellite', label: 'Satellite Hybrid', icon: <SatelliteIcon size={16} /> },
                ].map((opt) => {
                  const isActive = settings.mapStyle === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => updateSettings({ mapStyle: opt.key })}
                      className="flex items-center justify-center gap-2.5 rounded-2xl p-3 text-xs font-semibold transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: isActive ? 'rgba(232, 163, 61, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? amber : ink,
                        border: `1px solid ${isActive ? amber : hairline}`,
                        boxShadow: isActive ? '0 0 16px rgba(232, 163, 61, 0.2)' : 'none',
                      }}
                    >
                      <span style={{ color: isActive ? amber : inkMuted }}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card 2: Distance Units */}
            <div
              className="rounded-3xl p-6 shadow-2xl backdrop-blur-2xl border"
              style={{ backgroundColor: cardBg, borderColor: hairline }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold" style={{ color: ink }}>Distance Units</h2>
                <span className="text-xs font-medium" style={{ color: '#2dd4bf' }}>Format</span>
              </div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: inkMuted }}>
                Select metric (kilometers) or imperial (miles) format for place distances and travel routes.
              </p>
              <div className="flex gap-3">
                {[
                  { key: 'km', label: 'Kilometers (km)' },
                  { key: 'mi', label: 'Miles (mi)' },
                ].map((unit) => {
                  const isActive = settings.units === unit.key
                  return (
                    <button
                      key={unit.key}
                      onClick={() => updateSettings({ units: unit.key })}
                      className="flex-1 rounded-2xl py-2.5 px-4 text-xs font-semibold transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: isActive ? 'rgba(232, 163, 61, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? amber : ink,
                        border: `1px solid ${isActive ? amber : hairline}`,
                        boxShadow: isActive ? '0 0 14px rgba(232, 163, 61, 0.2)' : 'none',
                      }}
                    >
                      {unit.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card 3: Search Location & Coordinate Mode */}
            <div
              className="rounded-3xl p-6 shadow-2xl backdrop-blur-2xl border"
              style={{ backgroundColor: cardBg, borderColor: hairline }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold" style={{ color: ink }}>Search Origin</h2>
                <span className="text-xs font-medium" style={{ color: amber }}>Geospatial</span>
              </div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: inkMuted }}>
                Choose whether Keyadi explores around your live GPS coordinates, or a custom pinpoint center.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { key: 'auto', label: 'Live GPS Location' },
                  { key: 'custom', label: 'Custom Location' },
                ].map((opt) => {
                  const isActive = settings.searchMode === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => updateSettings({ searchMode: opt.key })}
                      className="rounded-2xl py-2.5 px-4 text-xs font-semibold transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: isActive ? 'rgba(232, 163, 61, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? amber : ink,
                        border: `1px solid ${isActive ? amber : hairline}`,
                        boxShadow: isActive ? '0 0 14px rgba(232, 163, 61, 0.2)' : 'none',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {/* Custom Location Autocomplete */}
              <div ref={wrapperRef} className="relative mb-3">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: inkMuted }}>
                  Target City or Neighborhood
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <CrosshairIcon size={14} color={amber} />
                  </div>
                  <input
                    value={locationQuery}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search city, district, or landmark..."
                    style={{ backgroundColor: inputBg, borderColor: hairline, color: ink }}
                    className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl"
                    style={{ backgroundColor: isDark ? 'rgba(16,14,11,0.95)' : 'rgba(255,255,255,0.98)', borderColor: hairline }}
                  >
                    {suggestions.map((feature) => {
                      const parts = feature.place_name.split(', ')
                      const mainName = parts[0]
                      const subText = parts.slice(1).join(', ')
                      return (
                        <button
                          key={feature.id}
                          onClick={() => selectSuggestion(feature)}
                          className="flex w-full items-start gap-2.5 px-4 py-3 text-left text-sm transition hover:bg-amber-400/10"
                          style={{ borderBottom: `1px solid ${hairline}` }}
                        >
                          <CrosshairIcon size={14} color={amber} className="mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-xs" style={{ color: ink }}>{mainName}</p>
                            {subText && (
                              <p className="text-[11px]" style={{ color: inkMuted }}>{subText}</p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Coordinates Inputs */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="relative">
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: inkFaint }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settings.defaultLat}
                    onChange={(e) => updateSettings({ defaultLat: parseFloat(e.target.value) })}
                    style={{ backgroundColor: inputBg, borderColor: hairline, color: ink }}
                    className="w-full rounded-xl border px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: inkFaint }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settings.defaultLng}
                    onChange={(e) => updateSettings({ defaultLng: parseFloat(e.target.value) })}
                    style={{ backgroundColor: inputBg, borderColor: hairline, color: ink }}
                    className="w-full rounded-xl border px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              {settings.searchMode === 'custom' && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#2dd4bf' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf] animate-ping" />
                  <span>Active — Keyadi is configured to explore around this origin.</span>
                </p>
              )}
            </div>

            {/* Card 4: Account & Session */}
            <div
              className="rounded-3xl p-6 shadow-2xl backdrop-blur-2xl border flex items-center justify-between"
              style={{ backgroundColor: cardBg, borderColor: hairline }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${hairline}` }}
                >
                  <UserIcon size={18} color={amber} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: inkFaint }}>
                    Authenticated Account
                  </p>
                  <p className="text-sm font-bold" style={{ color: ink }}>
                    {user?.email || 'Active User'}
                  </p>
                </div>
              </div>

              <button
                onClick={signOut}
                className="rounded-2xl px-4 py-2 text-xs font-semibold transition hover:bg-red-500/10 text-red-400 border border-red-500/20"
              >
                Sign out
              </button>
            </div>

            {/* Card 5: Data Deletion Request */}
            <div
              className="rounded-3xl p-6 shadow-2xl backdrop-blur-2xl border"
              style={{ backgroundColor: cardBg, borderColor: hairline }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: ink }}>Request Data Deletion</p>
                  <p className="text-[11px]" style={{ color: inkFaint }}>Permanently erase your account data, trackers, and preferences</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: inkMuted }}>
                This action will delete all your saved trackers, clear local preferences, and sign you out. Your Supabase authentication record can be fully removed by contacting{' '}
                <a href="mailto:biruk5868@gmail.com" className="text-amber-400 underline decoration-amber-400/40">biruk5868@gmail.com</a>.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="rounded-2xl px-5 py-2.5 text-xs font-semibold transition hover:bg-red-500/15 text-red-400 border border-red-500/25"
              >
                Request Deletion
              </button>
            </div>

            {/* System Info & Hawaz Technologies Footer */}
            <div className="pt-6 pb-2 text-center text-xs space-y-1" style={{ color: inkFaint }}>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
                <Link to="/privacy" className="hover:text-amber-400 transition">Privacy</Link>
                <span style={{ color: hairline }}>·</span>
                <Link to="/terms" className="hover:text-amber-400 transition">Terms</Link>
                <span style={{ color: hairline }}>·</span>
                <Link to="/cookies" className="hover:text-amber-400 transition">Cookies</Link>
              </div>
              <p className="font-semibold tracking-wider text-[11px]" style={{ color: amber }}>
                Built by HAWAZ TECHNOLOGIES
              </p>
              <p className="text-[10px]">
                Keyadi · Local Places & Live Directions v1.2
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-8 shadow-2xl backdrop-blur-2xl border"
            style={{ backgroundColor: cardBg, borderColor: hairline }}
            onClick={(e) => e.stopPropagation()}
          >
            {deleteComplete ? (
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(45,212,191,0.15)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: ink }}>Data Deleted</h3>
                <p className="text-xs" style={{ color: inkMuted }}>All your data has been erased. You will be signed out momentarily.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: ink }}>Confirm Data Deletion</h3>
                    <p className="text-[11px]" style={{ color: inkFaint }}>This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-6" style={{ color: inkMuted }}>
                  This will permanently delete all your saved trackers, clear your local preferences and consent records, and sign you out of Keyadi.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 rounded-2xl py-2.5 text-xs font-semibold border transition hover:opacity-80"
                    style={{ borderColor: hairline, color: ink }}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDataDeletion}
                    disabled={deleting}
                    className="flex-1 rounded-2xl py-2.5 text-xs font-bold transition hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                  >
                    {deleting ? 'Deleting…' : 'Delete All My Data'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageBackground>
  )
}