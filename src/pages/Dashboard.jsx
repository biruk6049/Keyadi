import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabaseClient'
import PageBackground from '../components/PageBackground'
import WeatherWidget from '../components/WeatherWidget'
import KeyadiLogo from '../components/KeyadiLogo'
import MobileBottomNav from '../components/MobileBottomNav'
import {
  SparklesIcon,
  SearchIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  GlobeIcon,
  PinIcon,
  GoogleMapsIcon,
  WazeIcon,
  CrosshairIcon,
  CategoryIcon,
  GridIcon,
  BookmarkIcon,
  UserIcon,
  InfoIcon,
  MapIcon,
} from '../components/Icons'
import {
  CATEGORY_PRESETS,
  interpretWithAI,
  synthesizeWithRAG,
  askPlaceRAG,
  buildAIOverpassQuery,
  buildTagOverpassQuery,
  buildRegexOverpassQuery,
} from '../lib/aiSearch'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const RADIUS_OPTIONS_KM = [1, 3, 5, 10, 20]
const PLACEHOLDER_TERMS = ['best coffee shops', 'where to buy cement', 'pharmacy near me', 'plumber', 'hotel with wifi']

// Mapbox Directions profiles we offer, with a friendly label + icon
const TRAVEL_MODES = [
  { key: 'driving', label: 'Car', icon: 'car' },
  { key: 'walking', label: 'Walk', icon: 'walk' },
  { key: 'cycling', label: 'Bike', icon: 'bike' },
]

function ModeIcon({ icon }) {
  if (icon === 'car') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="11" width="18" height="6" rx="1.5" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="16.5" cy="17.5" r="1.5" />
      </svg>
    )
  }
  if (icon === 'walk') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="13" cy="4" r="1.5" />
        <path d="M10 22l1.5-6-2-1.5.5-5 3-1 3 2 2 1v4M9 15l-3 2M11 16l4 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17l4-8h4l4 8M10 9h4M14 5l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconButton({ onClick, title, children, isDark }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
      style={{
        borderColor: isDark ? 'rgba(243,241,236,0.18)' : 'rgba(16,14,11,0.15)',
        color: isDark ? '#f3f1ec' : '#100e0b',
        backgroundColor: isDark ? 'rgba(243,241,236,0.04)' : 'rgba(16,14,11,0.03)',
      }}
    >
      {children}
    </button>
  )
}

function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) return '—'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

function getPlacePhoto(place) {
  const type = (place?.type || '').toLowerCase()
  const name = (place?.name || '').toLowerCase()
  if (name.includes('harbor') || name.includes('cafe') || type.includes('cafe') || type.includes('coffee')) {
    return 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80'
  }
  if (type.includes('restaurant') || type.includes('food') || name.includes('bistro') || name.includes('grill') || name.includes('pizza') || name.includes('burger')) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
  }
  if (type.includes('hotel') || type.includes('lodging')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
  }
  if (type.includes('fuel') || type.includes('gas')) {
    return 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80'
  }
  if (type.includes('pharmacy') || type.includes('hospital') || type.includes('doctor')) {
    return 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=600&q=80'
  }
  if (type.includes('park') || type.includes('leisure')) {
    return 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80'
  }
  if (type.includes('shop') || type.includes('store') || type.includes('supermarket') || type.includes('mall')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'
  }
  return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80'
}

function getPlaceRating(place) {
  let hash = 0
  const str = place?.name || 'Keyadi'
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i)
  return (4.3 + (Math.abs(hash) % 7) * 0.1).toFixed(1)
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 21) return 'Good evening'
  return 'Good night'
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { settings } = useSettings()
  const isDark = true

  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const trackerMarkersRef = useRef([])
  const userMarkerRef = useRef(null)
  const abortRef = useRef(null)
  const watchIdRef = useRef(null)
  const hasCenteredRef = useRef(false)
  const searchInputRef = useRef(null)

  const [keyword, setKeyword] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [radiusKm, setRadiusKm] = useState(5)
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('placeTrackerHistory') || '[]')
    } catch {
      return []
    }
  })
  const [trackers, setTrackers] = useState([])
  const [trackersLoading, setTrackersLoading] = useState(true)

  // `center` = search origin (respects the Settings "auto vs custom" choice).
  // `myLocation` = your real, live GPS position - always tracked, used for
  // the map dot and as the starting point for directions.
  const [center, setCenter] = useState({ lat: settings.defaultLat, lng: settings.defaultLng })
  const [myLocation, setMyLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveError, setSaveError] = useState(null)
  const [copiedIdx, setCopiedIdx] = useState(null)

  // Selected place + directions
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [routes, setRoutes] = useState({}) // { driving: {duration, distance} | 'loading' | 'error', ... }
  const [activeMode, setActiveMode] = useState('driving')
  const [activeNav, setActiveNav] = useState('map')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  // AI Search & Geospatial RAG state
  const [aiEnabled, setAiEnabled] = useState(true)
  const [aiDescription, setAiDescription] = useState('')
  const [aiEngine, setAiEngine] = useState('')
  const [aiRefinements, setAiRefinements] = useState([])
  const [aiThinking, setAiThinking] = useState(false)
  const [ragSummary, setRagSummary] = useState('')
  const [placeBadges, setPlaceBadges] = useState({})
  const [ragFollowUps, setRagFollowUps] = useState([])
  const [ragSynthesizing, setRagSynthesizing] = useState(false)
  const [placeAnswer, setPlaceAnswer] = useState('')
  const [askingPlace, setAskingPlace] = useState(false)

  // Place detail — reverse geocoded address
  const [placeAddress, setPlaceAddress] = useState('')
  const [placeAddressLoading, setPlaceAddressLoading] = useState(false)

  // Search stats
  const [searchCount, setSearchCount] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('keyadiSearchStats') || '{}')
      const today = new Date().toDateString()
      return stored.date === today ? stored.count : 0
    } catch { return 0 }
  })

  useEffect(() => {
    const interval = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_TERMS.length), 2400)
    return () => clearInterval(interval)
  }, [])

  const ink = isDark ? '#f3f1ec' : '#100e0b'
  const inkMuted = isDark ? 'rgba(243,241,236,0.62)' : 'rgba(16,14,11,0.6)'
  const inkFaint = isDark ? 'rgba(243,241,236,0.38)' : 'rgba(16,14,11,0.4)'
  const hairline = isDark ? 'rgba(243,241,236,0.14)' : 'rgba(16,14,11,0.12)'
  const cardBg = isDark ? 'rgba(16,14,11,0.5)' : 'rgba(255,255,255,0.6)'
  const panelBg = isDark ? 'rgba(16,14,11,0.6)' : 'rgba(255,255,255,0.55)'
  const inputBg = isDark ? 'rgba(243,241,236,0.06)' : 'rgba(255,255,255,0.8)'
  const amber = '#e8a33d'

  const incrementSearchCount = () => {
    setSearchCount(prev => {
      const next = prev + 1
      localStorage.setItem('keyadiSearchStats', JSON.stringify({ date: new Date().toDateString(), count: next }))
      return next
    })
  }

  // Initialize map once
  useEffect(() => {
    if (mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: settings.mapStyle === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/dark-v11',
      center: [center.lng, center.lat],
      zoom: 12,
      attributionControl: false,
    })

    mapRef.current.on('load', () => {
      ensureRouteLayer()
    })
    mapRef.current.on('style.load', () => {
      ensureRouteLayer()
    })
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const style = settings.mapStyle === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/dark-v11'
    mapRef.current.setStyle(style)
  }, [settings.mapStyle])

  // Apply Settings search-mode choice
  useEffect(() => {
    if (settings.searchMode === 'custom') {
      const custom = { lat: settings.defaultLat, lng: settings.defaultLng }
      setCenter(custom)
      mapRef.current?.flyTo({ center: [custom.lng, custom.lat], zoom: 12 })
    } else if (myLocation) {
      setCenter(myLocation)
      mapRef.current?.flyTo({ center: [myLocation.lng, myLocation.lat], zoom: 12 })
    }
  }, [settings.searchMode, settings.defaultLat, settings.defaultLng])

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Geolocation tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported')
      return
    }
    setLocationStatus('requesting')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLocationStatus('granted')
        setMyLocation({ lat: latitude, lng: longitude })
        updateUserMarker(latitude, longitude)

        if (!hasCenteredRef.current && settings.searchMode !== 'custom') {
          hasCenteredRef.current = true
          setCenter({ lat: latitude, lng: longitude })
          mapRef.current?.setCenter([longitude, latitude])
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setLocationStatus('denied')
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  const updateUserMarker = (lat, lng) => {
    if (!mapRef.current) return
    if (!userMarkerRef.current) {
      const el = document.createElement('div')
      el.className = 'keyadi-user-dot'
      userMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(mapRef.current)
    } else {
      userMarkerRef.current.setLngLat([lng, lat])
    }
  }

  const requestLocation = () => {
    setLocationStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLocationStatus('granted')
        setMyLocation({ lat: latitude, lng: longitude })
        hasCenteredRef.current = true
        if (settings.searchMode !== 'custom') {
          setCenter({ lat: latitude, lng: longitude })
          mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 14 })
        }
        updateUserMarker(latitude, longitude)
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true }
    )
  }

  const recenterOnMe = () => {
    if (locationStatus !== 'granted' || !myLocation) {
      requestLocation()
      return
    }
    mapRef.current?.flyTo({ center: [myLocation.lng, myLocation.lat], zoom: 14 })
  }

  useEffect(() => {
    loadTrackers()
  }, [])

  const loadTrackers = async () => {
    setTrackersLoading(true)
    const { data, error } = await supabase.from('trackers').select('*').order('created_at', { ascending: false })
    if (!error && data) setTrackers(data)
    setTrackersLoading(false)
  }

  // Plot saved tracker locations on the map
  const plotTrackerMarkers = () => {
    trackerMarkersRef.current.forEach((m) => m.remove())
    trackerMarkersRef.current = []
    if (!mapRef.current) return
    trackers.forEach((t) => {
      const el = document.createElement('div')
      el.style.cssText =
        'width:12px;height:12px;border-radius:50%;background:#2dd4bf;border:2px solid #fff;box-shadow:0 0 6px rgba(45,212,191,0.5);cursor:pointer;'
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([t.lng, t.lat])
        .setPopup(new mapboxgl.Popup({ offset: 10 }).setText(`Tracker: ${t.keyword} · ${(t.radius_m / 1000).toFixed(1)} km`))
        .addTo(mapRef.current)
      trackerMarkersRef.current.push(marker)
    })
  }

  useEffect(() => {
    plotTrackerMarkers()
  }, [trackers])

  const deleteTracker = async (id) => {
    await supabase.from('trackers').delete().eq('id', id)
    setTrackers((prev) => prev.filter((t) => t.id !== id))
  }

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
  }

  const plotResults = (places) => {
    clearMarkers()
    places.forEach((place) => {
      const el = document.createElement('div')
      el.className = 'cursor-pointer flex flex-col items-center group transition-transform hover:scale-110'
      el.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;'
      el.innerHTML = `
        <div style="background:rgba(18,16,13,0.92);color:#f3f1ec;border:1px solid rgba(232,163,61,0.6);padding:3px 9px;border-radius:20px;font-size:11px;font-family:'Outfit',sans-serif;font-weight:600;display:flex;align-items:center;gap:5px;box-shadow:0 4px 14px rgba(0,0,0,0.5);backdrop-filter:blur(8px);">
          <span style="width:7px;height:7px;border-radius:50%;background:#e8a33d;box-shadow:0 0 8px #e8a33d;"></span>
          <span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${place.name}</span>
        </div>
        <div style="width:6px;height:6px;background:#e8a33d;transform:rotate(45deg);margin-top:-3px;"></div>
      `
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        selectPlace(place)
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([place.lng, place.lat])
        .addTo(mapRef.current)
      markersRef.current.push(marker)
    })
  }

  const addToHistory = (term) => {
    setHistory((prev) => {
      const next = [term, ...prev.filter((h) => h !== term)].slice(0, 10)
      localStorage.setItem('placeTrackerHistory', JSON.stringify(next))
      return next
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('placeTrackerHistory')
  }

  const cancelSearch = () => {
    abortRef.current?.abort()
    setLoading(false)
    setSearchError('Search cancelled.')
  }

  // ── Overpass fetch with fallback endpoints ──
  const fetchOverpass = async (query, signal) => {
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass.private.coffee/api/interpreter',
    ]
    let lastError = null

    for (const endpoint of endpoints) {
      try {
        const timeoutId = setTimeout(() => signal?.abort?.(), 28000)
        const res = await fetch(endpoint, {
          method: 'POST',
          body: 'data=' + encodeURIComponent(query),
          signal,
        })
        clearTimeout(timeoutId)

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Server responded ${res.status}: ${text.slice(0, 200)}`)
        }

        const data = await res.json()
        return data.elements
          .map((el) => {
            const lat = el.lat ?? el.center?.lat
            const lng = el.lon ?? el.center?.lon
            const name = el.tags?.name
            const type = el.tags?.amenity || el.tags?.shop || el.tags?.tourism || el.tags?.leisure || el.tags?.craft || el.tags?.office || ''
            const phone = el.tags?.phone || el.tags?.['contact:phone'] || ''
            const website = el.tags?.website || el.tags?.['contact:website'] || ''
            const openingHours = el.tags?.opening_hours || ''
            if (!lat || !lng || !name) return null
            return { name, lat, lng, type, phone, website, openingHours }
          })
          .filter(Boolean)
      } catch (err) {
        lastError = err
      }
    }
    throw lastError || new Error('All endpoints failed')
  }

  // ── Main search ──
  const runSearch = async (term) => {
    if (!term.trim()) return
    setLoading(true)
    setSearchError(null)
    setSelectedPlace(null)
    setAiDescription('')
    setAiEngine('')
    setAiRefinements([])
    setPlaceAddress('')
    setRagSummary('')
    setPlaceBadges({})
    setRagFollowUps([])
    setPlaceAnswer('')
    clearRoute()

    const controller = new AbortController()
    abortRef.current = controller

    try {
      let query
      let aiResultObj = null

      if (aiEnabled) {
        setAiThinking(true)
        aiResultObj = await interpretWithAI(term.trim())
        setAiThinking(false)

        if (aiResultObj) {
          query = buildAIOverpassQuery(aiResultObj, center, radiusKm)
          setAiEngine(aiResultObj.engine)
          setAiRefinements(aiResultObj.refinements || [])
          setAiDescription(aiResultObj.description)
        } else {
          query = buildRegexOverpassQuery(term.trim(), center, radiusKm)
        }
      } else {
        query = buildRegexOverpassQuery(term.trim(), center, radiusKm)
      }

      const places = await fetchOverpass(query, controller.signal)

      // Sort by distance and attach distanceKm
      const origin = myLocation || center
      places.forEach((p) => {
        p.distanceKm = haversineDistance(origin.lat, origin.lng, p.lat, p.lng)
      })
      places.sort((a, b) => a.distanceKm - b.distanceKm)

      // Deduplicate by name + rough coordinates
      const seen = new Set()
      const unique = places.filter(p => {
        const key = `${p.name.toLowerCase()}-${p.lat.toFixed(3)}-${p.lng.toFixed(3)}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      setResults(unique)
      plotResults(unique)
      addToHistory(term.trim())
      incrementSearchCount()

      if (aiResultObj) {
        setAiDescription(`${aiResultObj.description} — found ${unique.length} place${unique.length !== 1 ? 's' : ''}`)
      }

      // ── Grounded RAG Synthesis Phase ──
      if (aiEnabled && unique.length > 0) {
        setRagSynthesizing(true)
        synthesizeWithRAG(term.trim(), unique, origin, settings.units)
          .then((ragRes) => {
            if (ragRes) {
              setRagSummary(ragRes.ragSummary || '')
              setPlaceBadges(ragRes.badges || {})
              setRagFollowUps(ragRes.followUps || [])
            }
          })
          .catch((err) => console.warn('RAG synthesis error:', err))
          .finally(() => setRagSynthesizing(false))
      }
    } catch (err) {
      setResults([])
      if (err?.name !== 'AbortError') {
        setSearchError(`Search failed: ${err?.message || 'unknown error'}`)
      }
    }

    setLoading(false)
    setAiThinking(false)
  }

  // ── Category quick search ──
  const runCategorySearch = (category) => {
    const query = buildTagOverpassQuery(category.tags, center, radiusKm)
    setKeyword(category.label)
    setLoading(true)
    setSearchError(null)
    setSelectedPlace(null)
    setAiEngine('Category Preset')
    setAiDescription(`Searching for ${category.label} nearby…`)
    setAiRefinements([])
    setPlaceAddress('')
    setRagSummary('')
    setPlaceBadges({})
    setRagFollowUps([])
    setPlaceAnswer('')
    clearRoute()

    const controller = new AbortController()
    abortRef.current = controller

    fetchOverpass(query, controller.signal)
      .then((places) => {
        const origin = myLocation || center
        places.forEach((p) => {
          p.distanceKm = haversineDistance(origin.lat, origin.lng, p.lat, p.lng)
        })
        places.sort((a, b) => a.distanceKm - b.distanceKm)
        const seen = new Set()
        const unique = places.filter(p => {
          const key = `${p.name.toLowerCase()}-${p.lat.toFixed(3)}-${p.lng.toFixed(3)}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setResults(unique)
        plotResults(unique)
        incrementSearchCount()
        setAiDescription(`${category.label} — found ${unique.length} place${unique.length !== 1 ? 's' : ''}`)

        if (unique.length > 0) {
          setRagSynthesizing(true)
          synthesizeWithRAG(category.label, unique, origin, settings.units)
            .then((ragRes) => {
              if (ragRes) {
                setRagSummary(ragRes.ragSummary || '')
                setPlaceBadges(ragRes.badges || {})
                setRagFollowUps(ragRes.followUps || [])
              }
            })
            .catch(() => {})
            .finally(() => setRagSynthesizing(false))
        }
      })
      .catch((err) => {
        setResults([])
        if (err?.name !== 'AbortError') {
          setSearchError(`Search failed: ${err?.message || 'unknown error'}`)
        }
      })
      .finally(() => setLoading(false))
  }

  const handleAskPlace = async (q) => {
    if (!selectedPlace || !q) return
    setAskingPlace(true)
    try {
      const origin = myLocation || center
      const ans = await askPlaceRAG(q, selectedPlace, origin, settings.units)
      setPlaceAnswer(ans)
    } catch {
      setPlaceAnswer('Unable to retrieve place answer at this time.')
    } finally {
      setAskingPlace(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    runSearch(keyword)
  }

  // --- Crash-proof Directions & Route Layers ---

  const ensureRouteLayer = () => {
    const map = mapRef.current
    if (!map) return
    try {
      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
      }
      if (!map.getLayer('route-glow')) {
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#e8a33d',
            'line-width': 10,
            'line-opacity': 0.35,
            'line-blur': 4,
          },
        })
      }
      if (!map.getLayer('route-line')) {
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#fbbf24',
            'line-width': 4,
            'line-opacity': 0.95,
          },
        })
      }
    } catch (e) {
      console.warn('ensureRouteLayer notice:', e.message)
    }
  }

  const clearRoute = () => {
    try {
      if (!mapRef.current) return
      ensureRouteLayer()
      const src = mapRef.current.getSource('route')
      if (src) {
        src.setData({ type: 'FeatureCollection', features: [] })
      }
    } catch (err) {
      console.warn('clearRoute error:', err)
    }
  }

  const drawRoute = (coordinates) => {
    try {
      if (!mapRef.current) return
      ensureRouteLayer()
      const src = mapRef.current.getSource('route')
      if (!src) return

      if (Array.isArray(coordinates) && coordinates.length >= 2) {
        src.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        })
        try {
          const bounds = coordinates.reduce(
            (b, coord) => b.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          )
          mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 16 })
        } catch (bErr) {
          console.warn('fitBounds notice:', bErr)
        }
      } else {
        src.setData({ type: 'FeatureCollection', features: [] })
      }
    } catch (err) {
      console.warn('drawRoute error:', err)
    }
  }

  const fetchRoutesFor = async (place) => {
    if (!place || typeof place.lat !== 'number' || typeof place.lng !== 'number') return
    const origin = myLocation || center
    if (!origin || typeof origin.lat !== 'number' || typeof origin.lng !== 'number') return

    setRoutes({ driving: 'loading', walking: 'loading', cycling: 'loading' })

    const results = {}
    await Promise.all(
      TRAVEL_MODES.map(async ({ key }) => {
        try {
          const url = `https://api.mapbox.com/directions/v5/mapbox/${key}/${origin.lng},${origin.lat};${place.lng},${place.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
          const res = await fetch(url)
          if (!res.ok) {
            results[key] = 'error'
            return
          }
          const data = await res.json()
          const route = data.routes?.[0]
          if (!route || !route.geometry || !Array.isArray(route.geometry.coordinates) || route.geometry.coordinates.length < 2) {
            results[key] = 'error'
            return
          }
          results[key] = { duration: route.duration, distance: route.distance, geometry: route.geometry }
        } catch (err) {
          console.error(`Directions failed for ${key}:`, err)
          results[key] = 'error'
        }
      })
    )
    setRoutes(results)

    // Draw active mode's route once loaded safely
    const active = results[activeMode]
    if (active && typeof active === 'object' && Array.isArray(active.geometry?.coordinates) && active.geometry.coordinates.length >= 2) {
      drawRoute(active.geometry.coordinates)
    }
  }

  // Reverse geocode place
  const reverseGeocode = async (lat, lng) => {
    setPlaceAddressLoading(true)
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&limit=1`
      )
      const data = await res.json()
      const addr = data.features?.[0]?.place_name || ''
      setPlaceAddress(addr)
    } catch {
      setPlaceAddress('')
    }
    setPlaceAddressLoading(false)
  }

  const selectPlace = (place) => {
    if (!place) return
    setSelectedPlace(place)
    setPlaceAnswer('')
    try {
      if (typeof place.lng === 'number' && typeof place.lat === 'number' && !isNaN(place.lng) && !isNaN(place.lat)) {
        mapRef.current?.flyTo({ center: [place.lng, place.lat], zoom: 15, essential: true })
      }
      fetchRoutesFor(place)
      reverseGeocode(place.lat, place.lng)
    } catch (err) {
      console.error('selectPlace error:', err)
    }
  }

  const switchMode = (modeKey) => {
    try {
      setActiveMode(modeKey)
      const route = routes[modeKey]
      if (route && typeof route === 'object' && Array.isArray(route.geometry?.coordinates) && route.geometry.coordinates.length >= 2) {
        drawRoute(route.geometry.coordinates)
      } else {
        clearRoute()
      }
    } catch (err) {
      console.error('switchMode error:', err)
    }
  }

  const closeDirections = () => {
    setSelectedPlace(null)
    setRoutes({})
    setPlaceAddress('')
    clearRoute()
  }

  // --- Save tracker ---
  const handleSaveTracker = async () => {
    if (!keyword.trim()) return

    setSaveStatus('saving')
    setSaveError(null)

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      setSaveStatus('error')
      setSaveError('Your session expired - please sign in again.')
      return
    }

    const { data, error } = await supabase
      .from('trackers')
      .insert({
        user_id: userData.user.id,
        keyword: keyword.trim(),
        lat: center.lat,
        lng: center.lng,
        radius_m: radiusKm * 1000,
      })
      .select()

    if (error) {
      console.error('Save tracker failed:', error)
      setSaveStatus('error')
      setSaveError(
        error.code === '42501'
          ? 'Permission denied by the database. Re-run supabase/fix_rls.sql in your Supabase SQL Editor.'
          : error.message || 'Could not save this tracker.'
      )
      return
    }

    setTrackers((prev) => [...data, ...prev])
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 1800)
  }

  // Type badge
  const typeBadge = (type) => {
    if (!type) return null
    const label = type.replace(/_/g, ' ')
    return (
      <span
        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize"
        style={{ backgroundColor: 'rgba(45,212,191,0.15)', color: '#2dd4bf' }}
      >
        {label}
      </span>
    )
  }

  return (
    <PageBackground showToggle={false}>
      <div
        className="relative h-screen w-screen overflow-hidden select-none"
        style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
      >
        {/* Fullscreen Interactive Map */}
        <main className="absolute inset-0 h-full w-full">
          <div ref={mapContainer} className="h-full w-full" />
        </main>

        {/* ── Top Centered Floating Search Bar ── */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-auto">
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-full p-1.5 shadow-2xl backdrop-blur-2xl transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(16, 14, 11, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${hairline}`,
            }}
          >
            <div className="flex items-center gap-2.5 flex-1 pl-4 pr-2">
              {aiEnabled ? (
                <SparklesIcon size={16} color={amber} className="keyadi-ai-pulse shrink-0" />
              ) : (
                <SearchIcon size={16} color={inkFaint} className="shrink-0" />
              )}
              <input
                ref={searchInputRef}
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  if (!sidebarExpanded && e.target.value) {
                    setActiveNav('places')
                    setSidebarExpanded(true)
                  }
                }}
                onFocus={() => {
                  if (results.length > 0 || history.length > 0) {
                    setActiveNav('places')
                    setSidebarExpanded(true)
                  }
                }}
                placeholder={aiEnabled ? PLACEHOLDER_TERMS[placeholderIdx] : 'Search places with Keyadi AI...'}
                className="w-full bg-transparent text-sm outline-none font-normal placeholder:opacity-50"
                style={{ color: ink }}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword('')
                    setResults([])
                    setAiDescription('')
                  }}
                  className="text-xs p-1 text-white/50 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 shrink-0"
              style={{ backgroundColor: amber, color: '#100e0b' }}
              title="Search"
            >
              {loading ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : (
                <SearchIcon size={15} color="#100e0b" />
              )}
            </button>
          </form>

          {/* Quick Category Chips */}
          <div className="mt-2 flex items-center justify-center gap-1.5 overflow-x-auto keyadi-hide-scrollbar py-0.5">
            {CATEGORY_PRESETS.slice(0, 5).map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  runCategorySearch(cat)
                  setActiveNav('places')
                  setSidebarExpanded(true)
                }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-xl transition hover:scale-105 shadow-md"
                style={{
                  backgroundColor: isDark ? 'rgba(16, 14, 11, 0.78)' : 'rgba(255, 255, 255, 0.85)',
                  color: ink,
                  border: `1px solid ${hairline}`,
                }}
              >
                <CategoryIcon iconKey={cat.icon} size={12} color={amber} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Top-Right Floating Controls ── */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-xl shadow-lg transition hover:scale-105"
            style={{
              backgroundColor: aiEnabled ? 'rgba(232,163,61,0.18)' : 'rgba(16,14,11,0.7)',
              color: aiEnabled ? amber : inkMuted,
              border: `1px solid ${aiEnabled ? amber + '55' : hairline}`,
            }}
            title={aiEnabled ? 'Keyadi Smart Search is active' : 'Switch to standard search'}
          >
            <SparklesIcon size={13} color={aiEnabled ? amber : inkMuted} />
            <span className="hidden sm:inline">{aiEnabled ? 'Keyadi AI' : 'Basic'}</span>
          </button>

          <Link to="/settings">
            <IconButton title="Settings" isDark={isDark}>
              <UserIcon size={16} />
            </IconButton>
          </Link>

          <IconButton title="Sign out" isDark={isDark} onClick={signOut}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
        </div>

        {/* ── Floating Left Glassmorphic Sidebar ── */}
        <aside
          className="absolute top-4 bottom-4 left-4 z-30 flex flex-col rounded-3xl shadow-2xl backdrop-blur-2xl transition-all duration-300 pointer-events-auto overflow-hidden"
          style={{
            width: sidebarExpanded ? '380px' : '230px',
            backgroundColor: isDark ? 'rgba(14, 13, 11, 0.86)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${hairline}`,
            color: ink,
          }}
        >
          {/* Brand Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              <KeyadiLogo size={34} />
              <span className="text-lg font-bold tracking-tight" style={{ color: ink, fontFamily: "'Outfit', sans-serif" }}>
                Keyadi
              </span>
            </div>

            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-white/10 transition"
              style={{ color: inkMuted }}
              title={sidebarExpanded ? 'Collapse panel' : 'Expand panel'}
            >
              {sidebarExpanded ? '◀' : '▶'}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 px-3 py-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <GridIcon size={16} /> },
              { id: 'map', label: 'Map', icon: <MapIcon size={16} /> },
              { id: 'places', label: 'Places', icon: <PinIcon size={16} />, badge: results.length > 0 ? results.length : null },
              { id: 'saved', label: 'Saved', icon: <BookmarkIcon size={16} />, badge: trackers.length > 0 ? trackers.length : null },
            ].map((item) => {
              const isActive = activeNav === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id)
                    if (item.id === 'map') setSidebarExpanded(false)
                    else setSidebarExpanded(true)
                  }}
                  className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(232, 163, 61, 0.16)' : 'transparent',
                    color: isActive ? amber : inkMuted,
                    border: isActive ? `1px solid rgba(232, 163, 61, 0.35)` : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: isActive ? amber : inkMuted }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: isActive ? amber : 'rgba(255,255,255,0.1)', color: isActive ? '#100e0b' : inkFaint }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Collapsible Content Drawer */}
          {sidebarExpanded && (
            <div className="flex-1 overflow-y-auto px-4 py-2 border-t mt-1" style={{ borderColor: hairline }}>
              {/* PLACES TAB */}
              {activeNav === 'places' && (
                <div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span style={{ color: inkMuted }}>Search Distance</span>
                      <span className="font-semibold" style={{ color: amber }}>{radiusKm} km</span>
                    </div>
                    <div className="flex gap-1">
                      {RADIUS_OPTIONS_KM.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRadiusKm(r)}
                          className="flex-1 py-1 rounded-lg text-xs font-medium transition"
                          style={{
                            backgroundColor: radiusKm === r ? 'rgba(232,163,61,0.2)' : 'transparent',
                            color: radiusKm === r ? amber : inkFaint,
                            border: `1px solid ${radiusKm === r ? amber + '55' : hairline}`,
                          }}
                        >
                          {r}k
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {aiThinking && (
                    <div className="mb-3 flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(232,163,61,0.08)', border: `1px solid ${amber}33` }}>
                      <SparklesIcon size={14} color={amber} className="keyadi-ai-pulse" />
                      <span className="text-xs font-medium" style={{ color: amber }}>Keyadi finding places…</span>
                    </div>
                  )}

                  {/* Grounded RAG Summary */}
                  {(ragSummary || ragSynthesizing) && (
                    <div
                      className="mb-3 rounded-2xl p-3 shadow-sm transition-all"
                      style={{
                        backgroundColor: isDark ? 'rgba(45,212,191,0.08)' : 'rgba(45,212,191,0.06)',
                        border: '1px solid rgba(45,212,191,0.25)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <SparklesIcon size={14} color="#2dd4bf" />
                          <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: '#2dd4bf' }}>
                            Keyadi Smart Insight
                          </span>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                          style={{ backgroundColor: 'rgba(45,212,191,0.15)', color: '#2dd4bf' }}
                        >
                          {ragSynthesizing ? 'Keyadi finding best matches…' : 'Verified Places'}
                        </span>
                      </div>

                      {ragSynthesizing ? (
                        <div className="flex items-center gap-2 py-1 text-xs" style={{ color: inkMuted }}>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf] animate-ping" />
                          <span>Keyadi finding best matches…</span>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed font-normal" style={{ color: ink }}>
                          {ragSummary}
                        </p>
                      )}

                      {ragFollowUps.length > 0 && !ragSynthesizing && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t" style={{ borderColor: hairline }}>
                          <span className="text-[10px]" style={{ color: inkFaint }}>Follow up:</span>
                          {ragFollowUps.map((ref, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => { setKeyword(ref); runSearch(ref) }}
                              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium transition hover:scale-[1.03]"
                              style={{ backgroundColor: cardBg, color: inkMuted, border: `1px solid ${hairline}` }}
                            >
                              {ref}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Results header & list */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: inkFaint }}>
                      Results ({results.length})
                    </span>
                    {loading && <button onClick={cancelSearch} className="text-xs text-red-400">Cancel</button>}
                  </div>

                  {results.length === 0 && !loading && (
                    <p className="text-xs text-center py-6" style={{ color: inkFaint }}>
                      No places to display. Search above to explore.
                    </p>
                  )}

                  <ul className="space-y-2 mb-4">
                    {results.map((place, i) => {
                      const origin = myLocation || center
                      const dist = haversineDistance(origin.lat, origin.lng, place.lat, place.lng)
                      const distLabel = settings.units === 'mi'
                        ? `${(dist * 0.621371).toFixed(1)} mi`
                        : `${dist.toFixed(1)} km`
                      const isSelected = selectedPlace?.name === place.name

                      return (
                        <li key={i}>
                          <div
                            onClick={() => selectPlace(place)}
                            className="rounded-2xl p-3 text-sm transition-all cursor-pointer hover:scale-[1.01]"
                            style={{
                              backgroundColor: isSelected ? 'rgba(232,163,61,0.14)' : cardBg,
                              border: `1px solid ${isSelected ? amber : hairline}`,
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-sm" style={{ color: ink }}>{place.name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {typeBadge(place.type)}
                                  {placeBadges && placeBadges[place.name] && (
                                    <span
                                      className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase"
                                      style={{ backgroundColor: 'rgba(232,163,61,0.18)', color: amber, border: `1px solid ${amber}44` }}
                                    >
                                      ★ {placeBadges[place.name]}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span
                                className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                                style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: amber }}
                              >
                                {distLabel}
                              </span>
                            </div>

                            <div className="mt-2.5 flex items-center justify-between pt-2 border-t" style={{ borderColor: hairline }}>
                              <span className="text-[10px]" style={{ color: inkFaint }}>
                                {place.lat.toFixed(3)}°, {place.lng.toFixed(3)}°
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectPlace(place)
                                }}
                                className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition hover:scale-105"
                                style={{ backgroundColor: amber, color: '#100e0b' }}
                              >
                                Directions →
                              </button>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* SAVED TRACKERS TAB */}
              {activeNav === 'saved' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: inkFaint }}>
                      Saved Trackers ({trackers.length})
                    </span>
                  </div>

                  <div className="mb-4 rounded-2xl p-3 border" style={{ backgroundColor: cardBg, borderColor: hairline }}>
                    <p className="text-xs font-medium mb-1.5" style={{ color: ink }}>Save Active Search</p>
                    <button
                      onClick={handleSaveTracker}
                      disabled={saveStatus === 'saving' || !keyword.trim()}
                      className="w-full py-2 rounded-xl text-xs font-semibold transition hover:opacity-90"
                      style={{ backgroundColor: amber, color: '#100e0b' }}
                    >
                      {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : `Save "${keyword || 'Current'}" Tracker`}
                    </button>
                    {saveError && <p className="text-[10px] text-red-400 mt-1">{saveError}</p>}
                  </div>

                  <ul className="space-y-2">
                    {trackers.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between rounded-2xl p-3 text-xs border"
                        style={{ backgroundColor: cardBg, borderColor: hairline }}
                      >
                        <div className="flex items-center gap-2">
                          <PinIcon size={14} color="#2dd4bf" />
                          <div>
                            <p className="font-semibold" style={{ color: ink }}>{t.keyword}</p>
                            <p style={{ color: inkFaint }}>{(t.radius_m / 1000).toFixed(1)} km radius</p>
                          </div>
                        </div>
                        <button onClick={() => deleteTracker(t.id)} className="text-xs text-red-400 hover:opacity-80">
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* DASHBOARD TAB */}
              {activeNav === 'dashboard' && (
                <div className="space-y-3 py-1">
                  <div className="rounded-2xl p-3 border" style={{ backgroundColor: cardBg, borderColor: hairline }}>
                    <p className="text-xs font-medium" style={{ color: inkMuted }}>Searches Today</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: amber, fontFamily: "'Outfit', sans-serif" }}>
                      {searchCount}
                    </p>
                  </div>
                  <div className="rounded-2xl p-3 border" style={{ backgroundColor: cardBg, borderColor: hairline }}>
                    <p className="text-xs font-medium" style={{ color: inkMuted }}>Saved Trackers</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#2dd4bf', fontFamily: "'Outfit', sans-serif" }}>
                      {trackers.length}
                    </p>
                  </div>
                  <div className="rounded-2xl p-3 border" style={{ backgroundColor: cardBg, borderColor: hairline }}>
                    <p className="text-xs font-medium" style={{ color: inkMuted }}>Current Center</p>
                    <p className="text-xs font-mono mt-1" style={{ color: ink }}>
                      {center.lat.toFixed(4)}°, {center.lng.toFixed(4)}°
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sidebar Footer */}
          <div className="border-t px-4 py-3 text-[11px] flex items-center justify-between mt-auto shrink-0" style={{ borderColor: hairline, color: inkFaint }}>
            <span className="flex items-center gap-1">
              <CrosshairIcon size={11} color={inkFaint} />
              <span>{center.lat.toFixed(2)}°, {center.lng.toFixed(2)}°</span>
            </span>
            <span>{searchCount} searches today</span>
          </div>
        </aside>

        {/* ── Floating Place Details Card ── */}
        {selectedPlace && (
          <div
            className="absolute top-16 md:top-20 right-3 sm:right-5 z-30 w-88 max-w-[calc(100vw-24px)] sm:max-w-[calc(100vw-40px)] max-h-[calc(100vh-230px)] md:max-h-[calc(100vh-200px)] overflow-y-auto keyadi-hide-scrollbar rounded-3xl p-4 shadow-2xl backdrop-blur-2xl transition-all pointer-events-auto"
            style={{
              backgroundColor: isDark ? 'rgba(14, 13, 11, 0.88)' : 'rgba(255, 255, 255, 0.92)',
              border: `1px solid ${hairline}`,
              color: ink,
            }}
          >
            {/* Header: Category Badge & Close Button (Images erased) */}
            <div className="flex items-center justify-between mb-3">
              <div>
                {typeBadge(selectedPlace.type)}
              </div>
              <button
                onClick={closeDirections}
                className="flex h-7 w-7 items-center justify-center rounded-full transition shadow-sm hover:scale-105"
                style={{
                  backgroundColor: isDark ? 'rgba(243,241,236,0.08)' : 'rgba(16,14,11,0.06)',
                  color: inkMuted,
                  border: `1px solid ${hairline}`,
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Title & Star Rating */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h3 className="text-base font-bold tracking-tight" style={{ color: ink, fontFamily: "'Outfit', sans-serif" }}>
                  {selectedPlace.name}
                </h3>
                {selectedPlace.openingHours && (
                  <div className="mt-0.5 flex items-center gap-1 text-[11px]" style={{ color: '#2dd4bf' }}>
                    <ClockIcon size={11} color="#2dd4bf" />
                    <span>{selectedPlace.openingHours}</span>
                  </div>
                )}
              </div>
              <div
                className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0"
                style={{ backgroundColor: 'rgba(232, 163, 61, 0.15)', color: amber, border: `1px solid ${amber}44` }}
              >
                <span>★</span>
                <span>{getPlaceRating(selectedPlace)}</span>
              </div>
            </div>

            {/* Address */}
            <div className="mb-3 flex items-start gap-1.5 text-xs leading-relaxed" style={{ color: inkMuted }}>
              <MapPinIcon size={13} color={amber} className="mt-0.5 shrink-0" />
              <span className="truncate">
                {placeAddressLoading ? 'Loading address…' : (placeAddress || `${selectedPlace.lat.toFixed(4)}, ${selectedPlace.lng.toFixed(4)}`)}
              </span>
            </div>

            {/* Three Travel Mode Pills (Car: Amber, Walk: Cyan, Bike: Teal) */}
            <div className="flex gap-2 mb-3">
              {TRAVEL_MODES.map((mode) => {
                const r = routes[mode.key]
                const isModeActive = activeMode === mode.key
                const isCar = mode.key === 'driving'
                const isWalk = mode.key === 'walking'
                const modeColor = isCar ? '#e8a33d' : isWalk ? '#38bdf8' : '#2dd4bf'
                const modeBg = isModeActive
                  ? (isCar ? 'rgba(232, 163, 61, 0.18)' : isWalk ? 'rgba(56, 189, 248, 0.18)' : 'rgba(45, 212, 191, 0.18)')
                  : 'rgba(255, 255, 255, 0.04)'

                return (
                  <button
                    key={mode.key}
                    onClick={() => switchMode(mode.key)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 px-1 transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: isModeActive ? modeColor : `${modeColor}44`,
                      backgroundColor: modeBg,
                      color: isModeActive ? modeColor : ink,
                      boxShadow: isModeActive ? `0 0 14px ${modeColor}33` : 'none',
                    }}
                  >
                    <ModeIcon icon={mode.icon} />
                    <span className="text-xs font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {mode.label}: {r === 'loading' ? '…' : r === 'error' || !r ? '—' : formatDuration(r.duration)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* External Navigation Buttons */}
            <div className="flex gap-2 mb-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition hover:opacity-90"
                style={{ backgroundColor: 'rgba(66,133,244,0.14)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.25)' }}
              >
                <GoogleMapsIcon size={13} />
                <span>Google Maps</span>
              </a>
              <a
                href={`https://waze.com/ul?ll=${selectedPlace.lat},${selectedPlace.lng}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition hover:opacity-90"
                style={{ backgroundColor: 'rgba(0,191,255,0.14)', color: '#00bfff', border: '1px solid rgba(0,191,255,0.25)' }}
              >
                <WazeIcon size={13} />
                <span>Waze</span>
              </a>
            </div>

            {/* Grounded Keyadi Place Assistant */}
            <div className="rounded-2xl border p-3 text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: hairline }}>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-bold text-xs" style={{ color: '#2dd4bf' }}>
                  <SparklesIcon size={13} color="#2dd4bf" />
                  Keyadi Assistant
                </span>
                {placeBadges && selectedPlace?.name && placeBadges[selectedPlace.name] && (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: amber }}>
                    ★ {placeBadges[selectedPlace.name]}
                  </span>
                )}
              </div>

              {/* Quick questions */}
              <div className="flex flex-wrap gap-1 mb-2">
                {['Is it walkable?', 'Opening hours?', 'Contact info?'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAskPlace(q)}
                    disabled={askingPlace}
                    className="rounded-full px-2.5 py-0.5 text-[10px] transition hover:opacity-80"
                    style={{ backgroundColor: isDark ? 'rgba(243,241,236,0.06)' : 'rgba(255,255,255,0.8)', color: inkMuted, border: `1px solid ${hairline}` }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {askingPlace ? (
                <div className="flex items-center gap-1.5 py-1 text-xs" style={{ color: inkMuted }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf] animate-ping" />
                  <span>Keyadi finding details…</span>
                </div>
              ) : placeAnswer ? (
                <div className="rounded-xl p-2.5 text-xs leading-relaxed" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)', border: `1px solid ${hairline}`, color: ink }}>
                  {placeAnswer}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ── Weather Widget (Floating Bottom-Left) ── */}
        <WeatherWidget
          lat={(myLocation || center).lat}
          lng={(myLocation || center).lng}
          isDark={isDark}
        />

        {/* ── Floating Bottom-Right Map Controls (Responsive for mobile bottom nav) ── */}
        <div className="absolute bottom-20 md:bottom-6 right-4 sm:right-6 z-30 flex flex-col gap-2 pointer-events-auto">
          {/* Zoom In */}
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition hover:scale-105"
            style={{ borderColor: hairline, backgroundColor: isDark ? 'rgba(18, 16, 13, 0.8)' : 'rgba(255,255,255,0.85)', color: ink }}
            title="Zoom in"
          >
            +
          </button>
          {/* Zoom Out */}
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition hover:scale-105"
            style={{ borderColor: hairline, backgroundColor: isDark ? 'rgba(18, 16, 13, 0.8)' : 'rgba(255,255,255,0.85)', color: ink }}
            title="Zoom out"
          >
            −
          </button>
          {/* Reset Bearing / Compass Arrow */}
          <button
            onClick={() => mapRef.current?.resetNorthPitch()}
            title="Reset north bearing"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition hover:scale-105"
            style={{ borderColor: hairline, backgroundColor: isDark ? 'rgba(18, 16, 13, 0.8)' : 'rgba(255,255,255,0.85)', color: ink }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 19 21 12 17 5 21 12 2" fill="currentColor" opacity="0.85" />
            </svg>
          </button>
          {/* Recenter location */}
          <button
            onClick={recenterOnMe}
            title="Center on my location"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition hover:scale-105"
            style={{ borderColor: hairline, backgroundColor: isDark ? 'rgba(18, 16, 13, 0.8)' : 'rgba(255,255,255,0.85)', color: ink }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Mobile Bottom Navigation Bar ── */}
        <MobileBottomNav
          activeTab={activeNav}
          onTabChange={(tab) => {
            setActiveNav(tab)
            if (tab === 'map') {
              setSidebarExpanded(false)
            } else {
              setSidebarExpanded(true)
            }
          }}
          trackerCount={trackers.length}
          isDark={isDark}
        />
      </div>
    </PageBackground>
  )
}