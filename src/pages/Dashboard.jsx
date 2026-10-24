import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  loadGoogleMaps,
  GOOGLE_MAPS_DARK_STYLE,
  GOOGLE_MAPS_LIGHT_STYLE,
  createHTMLOverlayClass,
  reverseGeocodeGoogle,
} from '../lib/googleMaps.js'
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
  SettingsIcon,
  LogoutIcon,
  InfoIcon,
  MapIcon,
  StarIcon,
  XIcon,
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../components/Icons'
import ThemeToggle from '../components/ThemeToggle'
import {
  CATEGORY_PRESETS,
  interpretWithAI,
  askPlaceRAG,
  buildAIOverpassQuery,
  buildTagOverpassQuery,
  buildRegexOverpassQuery,
  searchPlacesReliable,
} from '../lib/aiSearch'
const escapeHtml = (str) => {
  if (str == null) return ''
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]))
}

function createCircleGeoJSON(centerPoint, radiusInKm, points = 64) {
  if (!centerPoint || typeof centerPoint.lat !== 'number' || typeof centerPoint.lng !== 'number') return null
  const coords = []
  const distanceX = radiusInKm / (111.32 * Math.cos((centerPoint.lat * Math.PI) / 180))
  const distanceY = radiusInKm / 111.32

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI)
    const x = distanceX * Math.cos(theta)
    const y = distanceY * Math.sin(theta)
    coords.push([centerPoint.lng + x, centerPoint.lat + y])
  }
  coords.push(coords[0])

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords],
        },
      },
    ],
  }
}

const RADIUS_OPTIONS_KM = [1, 3, 5, 10, 20]
const PLACEHOLDER_TERMS = ['best coffee shops', 'where to buy cement', 'pharmacy near me', 'plumber', 'hotel with wifi']

// Multi-modal travel direction profiles (Google Maps / OSRM fallback)
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
      className="flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 shadow-sm backdrop-blur-xl hover:scale-105 active:scale-95"
      style={{
        borderColor: isDark ? 'rgba(243,241,236,0.18)' : 'rgba(16,14,11,0.16)',
        color: isDark ? '#f3f1ec' : '#100e0b',
        backgroundColor: isDark ? 'rgba(18,16,13,0.85)' : 'rgba(255,255,255,0.92)',
        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.08)',
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

function formatDistance(meters, units = 'km') {
  if (typeof meters !== 'number' || isNaN(meters) || meters <= 0) return ''
  if (units === 'mi') {
    const mi = (meters * 0.000621371).toFixed(1)
    return `${mi} mi`
  }
  const km = (meters / 1000).toFixed(1)
  return `${km} km`
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
  const { settings, updateSettings, toggleDarkMode, isDark } = useSettings()

  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const googleRef = useRef(null)
  const HTMLOverlayRef = useRef(null)
  const markersRef = useRef([])
  const trackerMarkersRef = useRef([])
  const userMarkerRef = useRef(null)
  const radiusCircleRef = useRef(null)
  const routePolylineRef = useRef(null)
  const routeGlowPolylineRef = useRef(null)
  const directionsServiceRef = useRef(null)
  const abortRef = useRef(null)
  const watchIdRef = useRef(null)
  const hasCenteredRef = useRef(false)
  const searchInputRef = useRef(null)
  const mapCenterRef = useRef(null)

  const [keyword, setKeyword] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [searchNotice, setSearchNotice] = useState(null)
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
  const [locationErrorMsg, setLocationErrorMsg] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveError, setSaveError] = useState(null)
  const [copiedIdx, setCopiedIdx] = useState(null)

  // Selected place + directions
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [routes, setRoutes] = useState({}) // { driving: {duration, distance} | 'loading' | 'error', ... }
  const [activeMode, setActiveMode] = useState('driving')
  const [activeNav, setActiveNav] = useState('map')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false)
  const [placeSheetMinimized, setPlaceSheetMinimized] = useState(false)

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

  const getSearchOrigin = () => {
    if (settings.searchMode === 'custom') {
      return { lat: settings.defaultLat, lng: settings.defaultLng }
    }
    if (myLocation) {
      return myLocation
    }
    return center
  }

  const updateRadiusCircle = (originPoint = null, rKm = null) => {
    const map = mapRef.current
    const google = googleRef.current
    if (!map || !google) return
    try {
      const activeOrigin = originPoint || getSearchOrigin()
      const activeRadius = typeof rKm === 'number' ? rKm : radiusKm
      const centerLatLng = new google.maps.LatLng(activeOrigin.lat, activeOrigin.lng)
      const radiusMeters = activeRadius * 1000

      if (!radiusCircleRef.current) {
        radiusCircleRef.current = new google.maps.Circle({
          strokeColor: '#e8a33d',
          strokeOpacity: 0.85,
          strokeWeight: 2,
          fillColor: '#e8a33d',
          fillOpacity: isDark ? 0.08 : 0.12,
          map,
          center: centerLatLng,
          radius: radiusMeters,
          clickable: false,
        })
      } else {
        radiusCircleRef.current.setCenter(centerLatLng)
        radiusCircleRef.current.setRadius(radiusMeters)
        if (radiusCircleRef.current.getMap() !== map) {
          radiusCircleRef.current.setMap(map)
        }
      }
    } catch (err) {
      console.warn('updateRadiusCircle notice:', err?.message || err)
    }
  }

  // Initialize Google Maps once
  useEffect(() => {
    let isCancelled = false

    async function initMap() {
      if (mapRef.current) return
      try {
        const google = await loadGoogleMaps()
        if (isCancelled || !mapContainer.current) return
        googleRef.current = google
        HTMLOverlayRef.current = createHTMLOverlayClass(google)

        const isSatellite = settings.mapStyle === 'satellite'
        const initialCenter = new google.maps.LatLng(center.lat, center.lng)

        const map = new google.maps.Map(mapContainer.current, {
          center: initialCenter,
          zoom: 13,
          tilt: 45, // 3D oblique perspective
          heading: -17.6,
          mapTypeId: isSatellite ? 'hybrid' : 'roadmap',
          styles: isSatellite ? [] : (isDark ? GOOGLE_MAPS_DARK_STYLE : GOOGLE_MAPS_LIGHT_STYLE),
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          rotateControl: false,
        })
        mapRef.current = map

        map.addListener('idle', () => {
          const c = map.getCenter()
          if (c) {
            mapCenterRef.current = { lat: c.lat(), lng: c.lng() }
          }
        })

        // Reverse geocode on click
        map.addListener('click', async (e) => {
          if (!e.latLng) return
          const clickedLat = e.latLng.lat()
          const clickedLng = e.latLng.lng()
          try {
            const geo = await reverseGeocodeGoogle(clickedLat, clickedLng, google)
            if (geo) {
              setKeyword(geo.name || geo.formattedAddress)
            }
          } catch {}
        })

        setMapLoaded(true)
        updateRadiusCircle(getSearchOrigin(), radiusKm)

        if (myLocation) {
          updateUserMarker(myLocation.lat, myLocation.lng, myLocation.accuracy)
        }
      } catch (err) {
        console.error('Failed to initialize Google Maps:', err)
      }
    }

    initMap()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    updateRadiusCircle(getSearchOrigin(), radiusKm)
  }, [radiusKm, center, myLocation, settings.searchMode, settings.defaultLat, settings.defaultLng])

  useEffect(() => {
    if (!mapRef.current) return
    const isSatellite = settings.mapStyle === 'satellite'
    mapRef.current.setOptions({
      styles: isSatellite ? [] : (isDark ? GOOGLE_MAPS_DARK_STYLE : GOOGLE_MAPS_LIGHT_STYLE),
      mapTypeId: isSatellite ? 'hybrid' : 'roadmap',
    })
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setOptions({
        fillOpacity: isDark ? 0.08 : 0.12,
      })
    }
  }, [settings.mapStyle, isDark])

  // Apply Settings search-mode choice
  useEffect(() => {
    if (!mapRef.current || !googleRef.current) return
    const google = googleRef.current
    if (settings.searchMode === 'custom') {
      const custom = { lat: settings.defaultLat, lng: settings.defaultLng }
      setCenter(custom)
      mapRef.current.panTo(new google.maps.LatLng(custom.lat, custom.lng))
      mapRef.current.setZoom(13)
    } else if (myLocation) {
      setCenter(myLocation)
      mapRef.current.panTo(new google.maps.LatLng(myLocation.lat, myLocation.lng))
      mapRef.current.setZoom(13)
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

  // ── High-Precision Geolocation System ──────────────────────────────

  const updateUserMarker = (lat, lng, accuracy = null) => {
    const map = mapRef.current
    const google = googleRef.current
    const HTMLOverlay = HTMLOverlayRef.current
    if (!map || !google || !HTMLOverlay) return

    if (!userMarkerRef.current) {
      const container = document.createElement('div')
      container.className = 'keyadi-user-location-marker'
      container.setAttribute('role', 'img')
      container.setAttribute('aria-label', 'Your Live Location')
      container.innerHTML = `
        <div class="keyadi-user-radar-ring"></div>
        <div class="keyadi-user-radar-ring-delayed"></div>
        <div class="keyadi-user-core-dot">
          <div class="keyadi-user-inner-white"></div>
        </div>
      `
      const overlay = new HTMLOverlay(container, { lat, lng }, 'center')
      overlay.setMap(map)
      userMarkerRef.current = overlay
    } else {
      userMarkerRef.current.setPosition({ lat, lng })
    }
  }

  // Reactive marker synchronization: ensures marker is mounted once map is ready and location is known
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !myLocation) return
    updateUserMarker(myLocation.lat, myLocation.lng, myLocation.accuracy)
  }, [mapLoaded, myLocation])

  const handleLocationSuccess = (pos) => {
    const { latitude, longitude, accuracy } = pos.coords
    setLocationStatus('granted')
    setLocationErrorMsg(null)
    setMyLocation({ lat: latitude, lng: longitude, accuracy })

    if (mapRef.current) {
      updateUserMarker(latitude, longitude, accuracy)
    }

    if (!hasCenteredRef.current && settings.searchMode !== 'custom') {
      hasCenteredRef.current = true
      setCenter({ lat: latitude, lng: longitude })
      if (mapRef.current && googleRef.current) {
        mapRef.current.panTo(new googleRef.current.maps.LatLng(latitude, longitude))
        mapRef.current.setZoom(14)
      }
    }
  }

  const handleLocationError = (err) => {
    console.warn('Geolocation error:', err)
    if (err.code === 1) { // PERMISSION_DENIED
      setLocationStatus('denied')
      setLocationErrorMsg('Location access is denied in your browser settings. Please allow location access in your browser to display your current position on the map.')
    } else if (err.code === 2) { // POSITION_UNAVAILABLE
      setLocationStatus('unavailable')
      setLocationErrorMsg('Current geographic position is unavailable. Please check your device location settings or network.')
    } else if (err.code === 3) { // TIMEOUT
      setLocationStatus('timeout')
      setLocationErrorMsg('Location detection timed out. Click below to retry.')
    } else {
      setLocationStatus('error')
      setLocationErrorMsg(err.message || 'Unable to retrieve your current location.')
    }
  }

  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported')
      setLocationErrorMsg('Geolocation is not supported by your browser.')
      return
    }

    setLocationStatus('requesting')
    setLocationErrorMsg(null)

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    let resolved = false

    // Two-tier strategy: fallback to low accuracy (Wi-Fi/IP network positioning) if GPS hardware times out
    const fallbackLowAccuracy = () => {
      if (resolved) return
      console.warn('Geolocation: High accuracy unavailable or timed out. Falling back to network positioning.')
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolved = true
          handleLocationSuccess(pos)
        },
        (err) => {
          handleLocationError(err)
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 }
      )
    }

    const timer = setTimeout(() => {
      if (!resolved) {
        fallbackLowAccuracy()
      }
    }, 6500)

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          clearTimeout(timer)
          resolved = true
          handleLocationSuccess(pos)
        },
        (err) => {
          clearTimeout(timer)
          if (err.code === 1) {
            // Explicit denial from user
            handleLocationError(err)
          } else {
            // Hardware timeout / unavailable -> fallback
            fallbackLowAccuracy()
          }
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
      )
    } catch {
      clearTimeout(timer)
      fallbackLowAccuracy()
    }
  }

  useEffect(() => {
    startWatchingLocation()
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const recenterOnMe = () => {
    if (locationStatus === 'granted' && myLocation) {
      if (mapRef.current && googleRef.current) {
        mapRef.current.panTo(new googleRef.current.maps.LatLng(myLocation.lat, myLocation.lng))
        mapRef.current.setZoom(15)
      }
    } else {
      startWatchingLocation()
    }
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

  // Plot saved tracker locations on the map (only when on Saved tab to prevent duplicate dot confusion)
  const plotTrackerMarkers = () => {
    trackerMarkersRef.current.forEach((m) => {
      if (typeof m.setMap === 'function') m.setMap(null)
      else if (typeof m.remove === 'function') m.remove()
    })
    trackerMarkersRef.current = []
    const map = mapRef.current
    const google = googleRef.current
    const HTMLOverlay = HTMLOverlayRef.current
    if (!map || !google || !HTMLOverlay) return
    // Only plot saved tracker markers when viewing the Saved places tab!
    if (activeNav !== 'saved') return

    trackers.forEach((t) => {
      if (!t.lat || !t.lng) return
      const el = document.createElement('div')
      el.className = 'cursor-pointer flex flex-col items-center group transition-transform hover:scale-110'
      const safeKeyword = escapeHtml(t.keyword)
      const safeRadius = (Number(t.radius_m || 0) / 1000).toFixed(1)
      const labelBg = isDark ? 'rgba(18,16,13,0.92)' : 'rgba(255,255,255,0.95)'
      const labelColor = isDark ? '#2dd4bf' : '#0f766e'
      const labelBorder = isDark ? 'rgba(45,212,191,0.6)' : 'rgba(13,148,136,0.45)'
      const labelShadow = isDark ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.12)'
      el.innerHTML = `
        <div style="background:${labelBg};color:${labelColor};border:1px solid ${labelBorder};padding:3px 9px;border-radius:20px;font-size:11px;font-family:'Outfit',sans-serif;font-weight:600;display:flex;align-items:center;gap:5px;box-shadow:${labelShadow};backdrop-filter:blur(8px);">
          <span style="width:7px;height:7px;border-radius:50%;background:#2dd4bf;box-shadow:0 0 8px #2dd4bf;"></span>
          <span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${safeKeyword} (${safeRadius}km)</span>
        </div>
        <div style="width:6px;height:6px;background:#2dd4bf;transform:rotate(45deg);margin-top:-3px;"></div>
      `
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        map.panTo(new google.maps.LatLng(t.lat, t.lng))
        map.setZoom(13)
      })
      const marker = new HTMLOverlay(el, { lat: t.lat, lng: t.lng }, 'bottom')
      marker.setMap(map)
      trackerMarkersRef.current.push(marker)
    })
  }

  useEffect(() => {
    plotTrackerMarkers()
  }, [trackers, activeNav, isDark])

  useEffect(() => {
    if (results && results.length > 0) {
      plotResults(results)
    }
  }, [isDark])

  const deleteTracker = async (id) => {
    await supabase.from('trackers').delete().eq('id', id)
    setTrackers((prev) => prev.filter((t) => t.id !== id))
  }

  const clearMarkers = () => {
    markersRef.current.forEach((m) => {
      if (typeof m.setMap === 'function') m.setMap(null)
      else if (typeof m.remove === 'function') m.remove()
    })
    markersRef.current = []
  }

  const plotResults = (places) => {
    clearMarkers()
    const map = mapRef.current
    const google = googleRef.current
    const HTMLOverlay = HTMLOverlayRef.current
    if (!map || !google || !HTMLOverlay || !Array.isArray(places) || places.length === 0) return

    const bounds = new google.maps.LatLngBounds()

    places.forEach((place) => {
      const el = document.createElement('div')
      el.className = 'cursor-pointer flex flex-col items-center group transition-transform hover:scale-110'
      el.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;'
      const safeName = escapeHtml(place.name)
      const labelBg = isDark ? 'rgba(18,16,13,0.92)' : 'rgba(255,255,255,0.95)'
      const labelColor = isDark ? '#f3f1ec' : '#100e0b'
      const labelBorder = isDark ? 'rgba(232,163,61,0.6)' : 'rgba(232,163,61,0.7)'
      const labelShadow = isDark ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.12)'
      el.innerHTML = `
        <div style="background:${labelBg};color:${labelColor};border:1px solid ${labelBorder};padding:3px 9px;border-radius:20px;font-size:11px;font-family:'Outfit',sans-serif;font-weight:600;display:flex;align-items:center;gap:5px;box-shadow:${labelShadow};backdrop-filter:blur(8px);">
          <span style="width:7px;height:7px;border-radius:50%;background:#e8a33d;box-shadow:0 0 8px #e8a33d;"></span>
          <span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${safeName}</span>
        </div>
        <div style="width:6px;height:6px;background:#e8a33d;transform:rotate(45deg);margin-top:-3px;"></div>
      `
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        selectPlace(place)
      })

      const marker = new HTMLOverlay(el, { lat: place.lat, lng: place.lng }, 'bottom')
      marker.setMap(map)
      markersRef.current.push(marker)

      bounds.extend(new google.maps.LatLng(place.lat, place.lng))
    })

    const origin = getSearchOrigin()
    if (origin && typeof origin.lng === 'number' && typeof origin.lat === 'number') {
      bounds.extend(new google.maps.LatLng(origin.lat, origin.lng))
    }

    try {
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { top: 70, right: 70, bottom: 70, left: 70 })
      }
    } catch (bErr) {
      console.warn('fitBounds error:', bErr)
    }
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

  // ── High-Reliability Geospatial Search Engine ──
  const runSearch = async (term, targetRadius = null) => {
    if (!term || !term.trim()) return
    const effectiveRadius = typeof targetRadius === 'number' ? targetRadius : radiusKm
    setLoading(true)
    setSearchError(null)
    setSearchNotice(null)
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
      const origin = getSearchOrigin()
      updateRadiusCircle(origin, effectiveRadius)
      setAiThinking(true)

      const searchRes = await searchPlacesReliable({
        term: term.trim(),
        center: origin,
        radiusKm: effectiveRadius,
        signal: controller.signal,
      })
      setAiThinking(false)

      const found = searchRes.places || []
      setResults(found)
      plotResults(found)
      addToHistory(term.trim())
      incrementSearchCount()

      if (searchRes.aiInterpretation) {
        setAiEngine(searchRes.aiInterpretation.engine || 'Keyadi AI')
        setAiRefinements(searchRes.aiInterpretation.refinements || [])
        setAiDescription(searchRes.aiInterpretation.description)
      }

      if (found.length === 0) {
        if (searchRes.nearestOutside) {
          setSearchError(`No places found within ${effectiveRadius} km. The closest matching place is "${searchRes.nearestOutside.name}" (${searchRes.nearestOutside.distanceKm.toFixed(1)} km away).`)
        } else {
          setSearchError(`No places found matching "${term.trim()}" within ${effectiveRadius} km. Try expanding your search distance or exploring another category.`)
        }
        setSearchNotice(null)
      } else if (searchRes.isExpanded) {
        setSearchNotice(`Showing ${found.length} verified places nearby (expanded beyond ${effectiveRadius} km)`)
        setSearchError(null)
      } else {
        setSearchNotice(`Showing ${found.length} verified place${found.length !== 1 ? 's' : ''} strictly within ${effectiveRadius} km`)
        setSearchError(null)
      }

      if (searchRes.aiInterpretation && found.length > 0) {
        const cat = searchRes.aiInterpretation.categoryLabel ? ` (${searchRes.aiInterpretation.categoryLabel})` : ''
        setAiDescription(`${searchRes.aiInterpretation.description}${cat} — retrieved ${found.length} verified place${found.length !== 1 ? 's' : ''} strictly within ${effectiveRadius} km`)
      }

      // Google Gemini Place Intelligence Insights
      if (searchRes.aiInterpretation?.description) {
        setRagSummary(searchRes.aiInterpretation.description)
      }
      if (Array.isArray(searchRes.aiInterpretation?.refinements)) {
        setRagFollowUps(searchRes.aiInterpretation.refinements)
      }
      const badges = {}
      found.forEach((p) => {
        if (p.badge) badges[p.name] = p.badge
      })
      setPlaceBadges(badges)
    } catch (err) {
      setResults([])
      if (err?.name !== 'AbortError') {
        setSearchError(`Search notice: ${err?.message || 'Unable to load places'}`)
      }
    } finally {
      setLoading(false)
      setAiThinking(false)
    }
  }

  // ── Category quick search ──
  const runCategorySearch = async (category, targetRadius = null) => {
    const effectiveRadius = typeof targetRadius === 'number' ? targetRadius : radiusKm
    const origin = getSearchOrigin()
    updateRadiusCircle(origin, effectiveRadius)
    setKeyword(category.label)
    setLoading(true)
    setSearchError(null)
    setSearchNotice(null)
    setSelectedPlace(null)
    setAiEngine('Keyadi AI Insight')
    setAiDescription(`Searching for ${category.label} within ${effectiveRadius} km…`)
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
      const searchRes = await searchPlacesReliable({
        term: category.label,
        center: origin,
        radiusKm: effectiveRadius,
        signal: controller.signal,
      })

      const found = searchRes.places || []
      setResults(found)
      plotResults(found)
      incrementSearchCount()

      if (found.length === 0) {
        if (searchRes.nearestOutside) {
          setSearchError(`No ${category.label} found within ${effectiveRadius} km. Nearest match is "${searchRes.nearestOutside.name}" (${searchRes.nearestOutside.distanceKm.toFixed(1)} km away).`)
        } else {
          setSearchError(`No ${category.label} found within ${effectiveRadius} km. Try increasing the search radius.`)
        }
        setSearchNotice(null)
      } else if (searchRes.isExpanded) {
        setSearchNotice(`Showing ${found.length} verified ${category.label} nearby (expanded beyond ${effectiveRadius} km)`)
        setSearchError(null)
      } else {
        setSearchNotice(`Showing ${found.length} verified ${category.label} strictly within ${effectiveRadius} km`)
        setSearchError(null)
      }
      setAiDescription(`${category.label} — found ${found.length} place${found.length !== 1 ? 's' : ''} within ${effectiveRadius} km`)

      // Google Gemini Place Intelligence Insights
      if (searchRes.aiInterpretation?.description) {
        setRagSummary(searchRes.aiInterpretation.description)
      }
      if (Array.isArray(searchRes.aiInterpretation?.refinements)) {
        setRagFollowUps(searchRes.aiInterpretation.refinements)
      }
      const badges = {}
      found.forEach((p) => {
        if (p.badge) badges[p.name] = p.badge
      })
      setPlaceBadges(badges)
    } catch (err) {
      setResults([])
      if (err?.name !== 'AbortError') {
        setSearchError(`Search notice: ${err?.message || 'Unable to load places'}`)
      }
    } finally {
      setLoading(false)
    }
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
    if (!keyword.trim()) return
    setActiveNav('places')
    setSidebarExpanded(true)
    runSearch(keyword)
  }

  // --- High-Performance Google Directions & Routing Engine ---

  const clearRoute = () => {
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null)
      routePolylineRef.current = null
    }
    if (routeGlowPolylineRef.current) {
      routeGlowPolylineRef.current.setMap(null)
      routeGlowPolylineRef.current = null
    }
  }

  const drawRoute = (path) => {
    const map = mapRef.current
    const google = googleRef.current
    if (!map || !google || !Array.isArray(path) || path.length < 2) {
      clearRoute()
      return
    }

    clearRoute()

    try {
      const gPath = path.map((pt) =>
        pt instanceof google.maps.LatLng ? pt : new google.maps.LatLng(pt.lat, pt.lng)
      )

      // 1. Glowing outer amber polyline
      routeGlowPolylineRef.current = new google.maps.Polyline({
        path: gPath,
        geodesic: true,
        strokeColor: '#e8a33d',
        strokeOpacity: 0.35,
        strokeWeight: 10,
        map,
      })

      // 2. Crisp core gold polyline
      routePolylineRef.current = new google.maps.Polyline({
        path: gPath,
        geodesic: true,
        strokeColor: '#fbbf24',
        strokeOpacity: 0.95,
        strokeWeight: 4,
        map,
      })

      // Zoom to fit full route
      const bounds = new google.maps.LatLngBounds()
      gPath.forEach((pt) => bounds.extend(pt))
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 })
    } catch (err) {
      console.warn('drawRoute notice:', err)
    }
  }

  const fetchRoutesFor = async (place) => {
    if (!place || typeof place.lat !== 'number' || typeof place.lng !== 'number') return
    const origin = myLocation || center
    if (!origin || typeof origin.lat !== 'number' || typeof origin.lng !== 'number') return

    setRoutes({ driving: 'loading', walking: 'loading', cycling: 'loading' })

    const google = googleRef.current
    const results = {}

    await Promise.all(
      TRAVEL_MODES.map(async ({ key }) => {
        // 1. Google DirectionsService
        if (google && google.maps && google.maps.DirectionsService) {
          try {
            const service = directionsServiceRef.current || new google.maps.DirectionsService()
            const gMode =
              key === 'walking'
                ? google.maps.TravelMode.WALKING
                : key === 'cycling'
                ? google.maps.TravelMode.BICYCLING
                : google.maps.TravelMode.DRIVING

            const response = await new Promise((resolve, reject) => {
              service.route(
                {
                  origin: new google.maps.LatLng(origin.lat, origin.lng),
                  destination: new google.maps.LatLng(place.lat, place.lng),
                  travelMode: gMode,
                },
                (result, status) => {
                  if (status === 'OK' && result?.routes?.[0]?.legs?.[0]) {
                    resolve(result)
                  } else {
                    reject(new Error(status))
                  }
                }
              )
            })

            const leg = response.routes[0].legs[0]
            const path = response.routes[0].overview_path.map((latLng) => ({
              lat: latLng.lat(),
              lng: latLng.lng(),
            }))

            results[key] = {
              duration: leg.duration.value,
              distance: leg.distance.value,
              path,
            }
            return
          } catch {
            // Graceful fallback to OSRM below
          }
        }

        // 2. Resilient Open Source Routing (OSRM) Fallback
        try {
          const profile = key === 'walking' ? 'foot' : key === 'cycling' ? 'bicycle' : 'car'
          const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${place.lng},${place.lat}?overview=full&geometries=geojson`
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
          if (res.ok) {
            const data = await res.json()
            const route = data.routes?.[0]
            if (route?.geometry?.coordinates) {
              const path = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
              results[key] = {
                duration: route.duration,
                distance: route.distance,
                path,
              }
              return
            }
          }
        } catch {}

        // 3. Direct Great-Circle Geodesic Fallback
        const distKm = haversineDistance(origin.lat, origin.lng, place.lat, place.lng)
        const speedKmh = key === 'walking' ? 5 : key === 'cycling' ? 15 : 40
        results[key] = {
          duration: (distKm / speedKmh) * 3600,
          distance: distKm * 1000,
          path: [
            { lat: origin.lat, lng: origin.lng },
            { lat: place.lat, lng: place.lng },
          ],
        }
      })
    )

    setRoutes(results)

    const active = results[activeMode]
    if (active && Array.isArray(active.path) && active.path.length >= 2) {
      drawRoute(active.path)
    }
  }

  // Reverse geocode place with Google Geocoder
  const reverseGeocode = async (lat, lng) => {
    setPlaceAddressLoading(true)
    try {
      const geo = await reverseGeocodeGoogle(lat, lng, googleRef.current)
      if (geo && geo.formattedAddress) {
        setPlaceAddress(geo.formattedAddress)
      } else {
        // Fallback to OSM
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(3000) })
        if (res.ok) {
          const d = await res.json()
          setPlaceAddress(d.display_name || '')
        }
      }
    } catch {
      setPlaceAddress('')
    }
    setPlaceAddressLoading(false)
  }

  const selectPlace = (place) => {
    if (!place) return
    setSelectedPlace(place)
    setPlaceSheetMinimized(false)
    setPlaceAnswer('')
    if (place.address || place.addressSnippet) {
      setPlaceAddress(place.address || place.addressSnippet)
    }
    try {
      if (typeof place.lng === 'number' && typeof place.lat === 'number' && !isNaN(place.lng) && !isNaN(place.lat)) {
        if (mapRef.current && googleRef.current) {
          mapRef.current.panTo(new googleRef.current.maps.LatLng(place.lat, place.lng))
          mapRef.current.setZoom(16)
        }
      }
      fetchRoutesFor(place)
      if (!place.address) {
        reverseGeocode(place.lat, place.lng)
      }
    } catch (err) {
      console.error('selectPlace error:', err)
    }
  }

  const switchMode = (modeKey) => {
    try {
      setActiveMode(modeKey)
      const route = routes[modeKey]
      if (route && typeof route === 'object' && Array.isArray(route.path) && route.path.length >= 2) {
        drawRoute(route.path)
      } else {
        clearRoute()
      }
    } catch (err) {
      console.error('switchMode error:', err)
    }
  }

  const closeDirections = () => {
    setSelectedPlace(null)
    setPlaceSheetMinimized(false)
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
      setSaveError('Please sign in or create an account to save trackers.')
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
        <div className="absolute top-4 left-3 right-16 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-30 w-auto sm:w-full sm:max-w-xl pointer-events-auto">
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-full p-1.5 shadow-2xl backdrop-blur-2xl transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(16, 14, 11, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${hairline}`,
            }}
          >
            <div className="relative flex items-center gap-2.5 flex-1 pl-4 pr-2">
              {aiEnabled ? (
                <SparklesIcon size={16} color={amber} className="keyadi-ai-pulse shrink-0" />
              ) : (
                <SearchIcon size={16} color={inkFaint} className="shrink-0" />
              )}

              {/* Animated Gold Placeholder Text (Vibrant Gold Animation in Dark Mode / Soft Slate in Light Mode) */}
              {!keyword && (
                <div className="pointer-events-none absolute left-10 sm:left-11 right-12 flex items-center overflow-hidden h-6 z-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={placeholderIdx}
                      initial={{ opacity: 0, y: 7, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -7, filter: 'blur(3px)' }}
                      transition={{ duration: 0.32, ease: 'easeOut' }}
                      className="flex items-center gap-1.5 text-xs sm:text-sm font-medium truncate select-none"
                    >
                      {aiEnabled && (
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0 animate-ping"
                          style={{ backgroundColor: isDark ? '#fbbf24' : '#d97706' }}
                        />
                      )}
                      <span
                        className="truncate"
                        style={{
                          color: isDark ? '#fbbf24' : 'rgba(16, 14, 11, 0.55)',
                          textShadow: isDark ? '0 0 14px rgba(245, 158, 11, 0.65)' : 'none',
                          letterSpacing: isDark ? '0.01em' : 'normal',
                        }}
                      >
                        {aiEnabled ? PLACEHOLDER_TERMS[placeholderIdx] : 'Search places with Keyadi AI...'}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
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
                className="w-full bg-transparent text-sm outline-none font-normal relative z-10"
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
                  className="p-1 hover:opacity-100 transition"
                  style={{ color: inkMuted }}
                >
                  <XIcon size={12} color={inkMuted} />
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
          <div className="mt-2 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto keyadi-hide-scrollbar px-1 py-0.5">
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

          {/* ── Geolocation Status & Permission Alert Banner ── */}
          {locationStatus === 'requesting' && (
            <div
              className="mt-2.5 mx-auto w-fit flex items-center gap-2 rounded-full px-4 py-1.5 shadow-2xl backdrop-blur-2xl border text-xs animate-in fade-in duration-300"
              style={{
                backgroundColor: isDark ? 'rgba(18, 16, 13, 0.90)' : 'rgba(255, 255, 255, 0.94)',
                borderColor: 'rgba(232, 163, 61, 0.4)',
                color: ink,
              }}
            >
              <span className="h-3 w-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
              <span style={{ color: amber }} className="font-semibold">Acquiring your geographic location…</span>
            </div>
          )}

          {(locationStatus === 'denied' || locationStatus === 'unavailable' || locationStatus === 'timeout') && locationErrorMsg && (
            <div
              className="mt-2.5 mx-auto max-w-lg flex items-center justify-between gap-3 rounded-2xl p-2.5 px-3.5 shadow-2xl backdrop-blur-2xl border text-xs animate-in slide-in-from-top-2 duration-300"
              style={{
                backgroundColor: isDark ? 'rgba(28, 16, 16, 0.94)' : 'rgba(255, 245, 245, 0.97)',
                borderColor: 'rgba(239, 68, 68, 0.45)',
                color: ink,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangleIcon size={14} color="#fca5a5" className="shrink-0" />
                <p className="text-[11px] leading-tight font-medium" style={{ color: isDark ? '#fca5a5' : '#b91c1c' }}>
                  {locationErrorMsg}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={startWatchingLocation}
                  className="rounded-full px-3 py-1 text-[11px] font-bold shadow-md transition hover:scale-105"
                  style={{ backgroundColor: amber, color: '#100e0b' }}
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => setLocationErrorMsg(null)}
                  className="h-6 w-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition"
                  style={{ color: ink }}
                  title="Dismiss alert"
                >
                  <XIcon size={12} color={ink} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Top-Right Floating Controls ── */}
        <div className="absolute top-4 right-3 sm:right-4 z-30 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Interactive Light/Dark Mode Switch (Strictly No-Emoji) */}
          <ThemeToggle isDark={isDark} onToggle={toggleDarkMode} size="sm" />

          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className="flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1.5 sm:px-3 text-xs font-medium backdrop-blur-xl shadow-lg transition hover:scale-105"
            style={{
              backgroundColor: aiEnabled ? 'rgba(232,163,61,0.18)' : (isDark ? 'rgba(16,14,11,0.7)' : 'rgba(255,255,255,0.85)'),
              color: aiEnabled ? amber : inkMuted,
              border: `1px solid ${aiEnabled ? amber + '55' : hairline}`,
            }}
            title={aiEnabled ? 'Keyadi Smart Search is active' : 'Switch to standard search'}
          >
            <SparklesIcon size={13} color={aiEnabled ? amber : inkMuted} />
            <span className="hidden sm:inline">{aiEnabled ? 'Keyadi AI' : 'Basic'}</span>
          </button>

          <Link to="/settings" className="hidden sm:inline-flex">
            <IconButton title="Settings" isDark={isDark}>
              <SettingsIcon size={16} color={isDark ? '#f3f1ec' : '#100e0b'} />
            </IconButton>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-2">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full border truncate max-w-[130px] shadow-sm backdrop-blur-xl"
              style={{
                backgroundColor: isDark ? 'rgba(18, 16, 13, 0.85)' : 'rgba(255, 255, 255, 0.92)',
                borderColor: isDark ? 'rgba(243,241,236,0.18)' : 'rgba(16,14,11,0.16)',
                color: isDark ? '#f3f1ec' : '#100e0b',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.08)',
              }}
              title={user?.email || 'Authenticated User'}
            >
              {user?.email ? user.email.split('@')[0] : 'Member'}
            </span>
            <IconButton title="Sign out" isDark={isDark} onClick={signOut}>
              <LogoutIcon size={15} color={isDark ? '#f3f1ec' : '#100e0b'} />
            </IconButton>
          </div>
        </div>

        {/* ── Floating Left Glassmorphic Sidebar (Desktop) / Interactive Bottom Sheet (Mobile) ── */}
        <aside
          className={`
            ${activeNav === 'map' || selectedPlace ? 'hidden md:flex' : 'flex'}
            fixed inset-x-0 bottom-16 z-30 flex-col rounded-t-3xl shadow-2xl backdrop-blur-2xl transition-all duration-300 pointer-events-auto overflow-hidden
            ${mobileSheetExpanded ? 'h-[80vh]' : 'h-[46vh]'}
            md:h-auto md:absolute md:top-4 md:bottom-4 md:left-4 md:inset-x-auto md:z-30 md:rounded-3xl
          `}
          style={{
            width: typeof window !== 'undefined' && window.innerWidth >= 768 ? (sidebarExpanded ? '380px' : '230px') : '100%',
            backgroundColor: isDark ? 'rgba(14, 13, 11, 0.90)' : 'rgba(255, 255, 255, 0.92)',
            border: `1px solid ${hairline}`,
            color: ink,
          }}
        >
          {/* Mobile Sheet Drag Handle */}
          <div
            className="flex md:hidden flex-col items-center pt-2 pb-1 cursor-pointer select-none"
            onClick={() => setMobileSheetExpanded(!mobileSheetExpanded)}
          >
            <div className="w-12 h-1.5 rounded-full bg-white/20 transition hover:bg-white/40" />
          </div>

          {/* Brand Header */}
          <div className="flex items-center justify-between px-4 pt-1.5 md:pt-4 pb-2 md:pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <KeyadiLogo size={30} className="md:w-[34px] md:h-[34px]" />
              <span className="text-base md:text-lg font-bold tracking-tight" style={{ color: ink, fontFamily: "'Outfit', sans-serif" }}>
                {activeNav === 'places' ? `Places (${results.length})` : activeNav === 'saved' ? `Saved Places (${trackers.length})` : 'Keyadi Places'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Mobile Expand / Minimize button */}
              <button
                onClick={() => setMobileSheetExpanded(!mobileSheetExpanded)}
                className="flex md:hidden h-7 px-2.5 items-center justify-center rounded-full text-[11px] font-semibold border transition"
                style={{ borderColor: hairline, color: amber }}
                title={mobileSheetExpanded ? 'Minimize sheet' : 'Expand sheet'}
              >
                {mobileSheetExpanded ? 'Minimize ↓' : 'Expand ↑'}
              </button>

              {/* Mobile Close Button to return directly to map */}
              <button
                onClick={() => {
                  setActiveNav('map')
                  setSidebarExpanded(false)
                }}
                className="flex md:hidden h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 transition border"
                style={{ borderColor: hairline, color: inkMuted }}
                title="Return to map"
              >
                <XIcon size={12} color={inkMuted} />
              </button>
            </div>

            {/* Desktop Expand/Collapse toggle */}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 transition"
              style={{ color: inkMuted }}
              title={sidebarExpanded ? 'Collapse panel' : 'Expand panel'}
            >
              {sidebarExpanded ? <ChevronLeftIcon size={13} color={inkMuted} /> : <ChevronRightIcon size={13} color={inkMuted} />}
            </button>
          </div>

          {/* Navigation Items (Desktop Only - Mobile uses bottom nav) */}
          <nav className="hidden md:flex flex-col gap-1 px-3 py-1 shrink-0">
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
                          onClick={() => {
                            setRadiusKm(r)
                            if (keyword.trim()) {
                              runSearch(keyword.trim(), r)
                            }
                          }}
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
                    <p className="text-[10px] mt-1.5 truncate flex items-center gap-1" style={{ color: inkFaint }}>
                      <MapPinIcon size={11} color={amber} className="shrink-0" />
                      <span>Strict {radiusKm} km standard from {settings.searchMode === 'custom' ? (settings.defaultLocationLabel || 'Saved Point') : (myLocation ? 'Your Location' : 'Map View')}</span>
                    </p>
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
                            Keyadi AI Insight
                          </span>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                          style={{ backgroundColor: 'rgba(45,212,191,0.15)', color: '#2dd4bf' }}
                        >
                          {ragSynthesizing ? 'Finding best matches…' : 'Keyadi AI Verified'}
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

                  {/* Results header & notice */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: inkFaint }}>
                      Results ({results.length})
                    </span>
                    {loading && (
                      <button onClick={cancelSearch} className="text-xs text-red-400 hover:opacity-80">
                        Cancel
                      </button>
                    )}
                  </div>

                  {searchNotice && results.length > 0 && (
                    <div
                      className="mb-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5"
                      style={{ backgroundColor: 'rgba(232,163,61,0.12)', color: amber, border: `1px solid ${amber}33` }}
                    >
                      <MapPinIcon size={12} color={amber} className="shrink-0" />
                      <span>{searchNotice}</span>
                    </div>
                  )}

                  {loading && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <span className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      <p className="text-xs font-medium" style={{ color: amber }}>Finding verified places nearby…</p>
                    </div>
                  )}

                  {results.length === 0 && !loading && (
                    <div className="text-center py-7 px-4 rounded-2xl border mb-3" style={{ backgroundColor: cardBg, borderColor: hairline }}>
                      <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(232,163,61,0.1)' }}>
                        <SearchIcon size={18} color={amber} />
                      </div>
                      <p className="text-xs font-semibold mb-1" style={{ color: ink }}>
                        {keyword.trim() ? `No places found for "${keyword}"` : 'No places to display'}
                      </p>
                      <p className="text-[11px] mb-3 leading-relaxed" style={{ color: inkMuted }}>
                        {searchError || 'Try searching for a category above, a brand name, or expanding your search distance.'}
                      </p>
                      {keyword.trim() && radiusKm < 20 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {radiusKm < 10 && (
                            <button
                              type="button"
                              onClick={() => {
                                setRadiusKm(10)
                                runSearch(keyword.trim(), 10)
                              }}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition hover:scale-105"
                              style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: amber, border: `1px solid ${amber}55` }}
                            >
                              Expand to 10 km
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setRadiusKm(20)
                              runSearch(keyword.trim(), 20)
                            }}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition hover:scale-105"
                            style={{ backgroundColor: amber, color: '#100e0b' }}
                          >
                            Expand to 20 km
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <ul className="space-y-2 mb-4">
                    {results.map((place, i) => {
                      const dist = place.distanceKm
                      const distLabel = typeof dist === 'number'
                        ? (settings.units === 'mi' ? `${(dist * 0.621371).toFixed(1)} mi` : `${dist.toFixed(1)} km`)
                        : ''
                      const isSelected = selectedPlace?.name === place.name

                      return (
                        <li key={place.id || i}>
                          <div
                            onClick={() => selectPlace(place)}
                            className="rounded-2xl p-3 text-sm transition-all cursor-pointer hover:scale-[1.01]"
                            style={{
                              backgroundColor: isSelected ? 'rgba(232,163,61,0.14)' : cardBg,
                              border: `1px solid ${isSelected ? amber : hairline}`,
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: ink }}>{place.name}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {typeBadge(place.type)}
                                  {typeof place.semanticScore === 'number' && (
                                    <span
                                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                                      style={{
                                        backgroundColor: place.semanticScore >= 80 ? 'rgba(45,212,191,0.15)' : 'rgba(232,163,61,0.15)',
                                        color: place.semanticScore >= 80 ? '#2dd4bf' : amber,
                                        border: `1px solid ${place.semanticScore >= 80 ? 'rgba(45,212,191,0.35)' : amber + '35'}`,
                                      }}
                                      title={place.ragReason || 'RAG Semantic Match'}
                                    >
                                      <StarIcon size={9} color={place.semanticScore >= 80 ? '#2dd4bf' : amber} />
                                      <span>{place.semanticScore}% Match</span>
                                    </span>
                                  )}
                                  {placeBadges && placeBadges[place.name] && (
                                    <span
                                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase"
                                      style={{ backgroundColor: 'rgba(232,163,61,0.18)', color: amber, border: `1px solid ${amber}44` }}
                                    >
                                      <StarIcon size={9} color={amber} />
                                      <span>{placeBadges[place.name]}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              {distLabel && (
                                <span
                                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                                  style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: amber }}
                                >
                                  {distLabel}
                                </span>
                              )}
                            </div>

                            {place.addressSnippet && (
                              <p className="text-[11px] mt-1.5 truncate flex items-center gap-1" style={{ color: inkMuted }}>
                                <MapPinIcon size={11} color={amber} className="shrink-0" />
                                <span className="truncate">{place.addressSnippet}</span>
                              </p>
                            )}

                            {(place.phone || place.openingHours) && (
                              <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: inkFaint }}>
                                {place.phone && (
                                  <span className="inline-flex items-center gap-1">
                                    <PhoneIcon size={10} color={inkFaint} />
                                    <span>{place.phone}</span>
                                  </span>
                                )}
                                {place.openingHours && (
                                  <span className="inline-flex items-center gap-1">
                                    <ClockIcon size={10} color={inkFaint} />
                                    <span>{place.openingHours}</span>
                                  </span>
                                )}
                              </div>
                            )}

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

          {/* Sidebar Navigation Actions & Footer */}
          <div className="border-t px-3.5 py-2.5 flex items-center justify-between mt-auto shrink-0 gap-2" style={{ borderColor: hairline }}>
            <Link
              to="/settings"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                color: isDark ? '#f3f1ec' : '#100e0b',
                border: `1px solid ${hairline}`,
              }}
              title="Settings"
            >
              <SettingsIcon size={13} color={isDark ? '#f3f1ec' : '#100e0b'} />
              <span>Settings</span>
            </Link>

            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 text-red-500 hover:bg-red-500/10"
              style={{
                border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.2)'}`,
              }}
              title="Sign out of Keyadi"
            >
              <LogoutIcon size={13} color="#ef4444" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* ── Floating Place Details & Directions Bottom Sheet (Mobile) / Side Card (PC) ── */}
        {selectedPlace && (
          <div
            className={`
              fixed inset-x-0 bottom-16 z-30 transition-all duration-300 pointer-events-auto
              ${placeSheetMinimized ? 'max-h-20' : 'max-h-[50vh]'}
              overflow-y-auto keyadi-hide-scrollbar rounded-t-3xl md:rounded-3xl p-3.5 sm:p-4 md:p-5
              shadow-2xl backdrop-blur-2xl
              md:absolute md:top-20 md:right-6 md:left-auto md:inset-x-auto md:bottom-auto md:w-[390px] md:max-w-md md:max-h-[calc(100vh-140px)]
            `}
            style={{
              backgroundColor: isDark ? 'rgba(14, 13, 11, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              border: `1px solid ${hairline}`,
              color: ink,
            }}
          >
            {/* Mobile Sheet Drag Handle */}
            <div
              className="flex md:hidden flex-col items-center pt-0 pb-2 cursor-pointer select-none"
              onClick={() => setPlaceSheetMinimized(!placeSheetMinimized)}
            >
              <div className="w-12 h-1 rounded-full bg-white/30" />
            </div>

            {placeSheetMinimized ? (
              /* Minimized Mobile Route Pill - lets user view full map & route */
              <div className="flex md:hidden items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 shrink-0">
                    <ModeIcon icon={TRAVEL_MODES.find(m => m.key === activeMode)?.icon || 'car'} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: ink }}>
                      {selectedPlace.name}
                    </div>
                    <div className="text-[11px] font-semibold" style={{ color: amber }}>
                      {routes[activeMode] && routes[activeMode] !== 'loading' && routes[activeMode] !== 'error'
                        ? `${formatDuration(routes[activeMode].duration)} • ${formatDistance(routes[activeMode].distance, settings.units)}`
                        : 'Calculating route…'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPlaceSheetMinimized(false)}
                    className="flex h-7 px-2.5 items-center justify-center rounded-full text-[11px] font-bold border transition shadow-sm"
                    style={{ borderColor: amber, color: amber, backgroundColor: 'rgba(232, 163, 61, 0.12)' }}
                  >
                    Details ↑
                  </button>
                  <button
                    onClick={closeDirections}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-white/10 transition border"
                    style={{ borderColor: hairline, color: inkMuted }}
                    title="Close"
                  >
                    <XIcon size={12} color={inkMuted} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header: Category Badge & Close Button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={closeDirections}
                      className="flex md:hidden items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition hover:bg-white/10"
                      style={{ borderColor: hairline, color: amber }}
                    >
                      ← Results
                    </button>
                    {typeBadge(selectedPlace.type)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Minimize to full map button for mobile */}
                    <button
                      onClick={() => setPlaceSheetMinimized(true)}
                      className="flex md:hidden h-7 px-2.5 items-center justify-center rounded-full text-[11px] font-medium border transition"
                      style={{ borderColor: hairline, color: inkMuted }}
                      title="See full map"
                    >
                      Map View ↓
                    </button>
                    <button
                      onClick={closeDirections}
                      className="flex h-7 w-7 items-center justify-center rounded-full transition shadow-sm hover:scale-105"
                      style={{
                        backgroundColor: isDark ? 'rgba(243,241,236,0.08)' : 'rgba(16,14,11,0.06)',
                        color: inkMuted,
                        border: `1px solid ${hairline}`,
                      }}
                      title="Close directions"
                    >
                      <XIcon size={13} color={inkMuted} />
                    </button>
                  </div>
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
                <StarIcon size={11} color={amber} />
                <span>{getPlaceRating(selectedPlace)}</span>
              </div>
            </div>

            {/* Address */}
            <div className="mb-2.5 flex items-start gap-1.5 text-xs leading-relaxed" style={{ color: inkMuted }}>
              <MapPinIcon size={13} color={amber} className="mt-0.5 shrink-0" />
              <span className="truncate">
                {placeAddressLoading ? 'Loading address…' : (placeAddress || `${selectedPlace.lat.toFixed(4)}, ${selectedPlace.lng.toFixed(4)}`)}
              </span>
            </div>

            {/* Keyadi AI Categorized Insight */}
            <div
              className="mb-3 rounded-2xl p-2.5 text-xs flex flex-col gap-1 border"
              style={{
                backgroundColor: isDark ? 'rgba(45,212,191,0.06)' : 'rgba(45,212,191,0.04)',
                borderColor: 'rgba(45,212,191,0.25)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-[11px]" style={{ color: '#2dd4bf' }}>
                  <SparklesIcon size={12} color="#2dd4bf" />
                  <span>Keyadi AI Insight</span>
                </span>
                {typeof selectedPlace.semanticScore === 'number' && (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: 'rgba(45,212,191,0.15)', color: '#2dd4bf' }}>
                    {selectedPlace.semanticScore}% Match
                  </span>
                )}
              </div>
              <div className="text-[11px] leading-relaxed" style={{ color: inkMuted }}>
                <span className="font-medium" style={{ color: ink }}>Categorized as: </span>
                <span className="font-semibold" style={{ color: amber }}>{selectedPlace.matchedCategory || selectedPlace.type || 'Verified Place'}</span>
                {selectedPlace.rawOsmType && <span className="opacity-75"> ({selectedPlace.rawOsmClass || 'osm'}:{selectedPlace.rawOsmType})</span>}
              </div>
              {selectedPlace.ragReason && (
                <p className="text-[10px] leading-relaxed" style={{ color: inkFaint }}>
                  {selectedPlace.ragReason}
                </p>
              )}
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
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: amber }}>
                    <StarIcon size={9} color={amber} />
                    <span>{placeBadges[selectedPlace.name]}</span>
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
          </>
        )}
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
            onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 13) + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition hover:scale-105"
            style={{ borderColor: hairline, backgroundColor: isDark ? 'rgba(18, 16, 13, 0.8)' : 'rgba(255,255,255,0.85)', color: ink }}
            title="Zoom in"
          >
            +
          </button>
          {/* Zoom Out */}
          <button
            onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 13) - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition hover:scale-105"
            style={{ borderColor: hairline, backgroundColor: isDark ? 'rgba(18, 16, 13, 0.8)' : 'rgba(255,255,255,0.85)', color: ink }}
            title="Zoom out"
          >
            −
          </button>
          {/* 3D Oblique Perspective Toggle */}
          <button
            onClick={() => mapRef.current?.setTilt(mapRef.current?.getTilt() ? 0 : 45)}
            title="Toggle 3D perspective"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition hover:scale-105 font-bold text-xs"
            style={{ borderColor: hairline, backgroundColor: isDark ? 'rgba(18, 16, 13, 0.8)' : 'rgba(255,255,255,0.85)', color: amber }}
          >
            3D
          </button>
          {/* Reset Bearing / Compass Arrow */}
          <button
            onClick={() => {
              mapRef.current?.setHeading(0)
              mapRef.current?.setTilt(0)
            }}
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
            title={locationStatus === 'granted' ? 'Center on my live location' : 'Request live geographic location'}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition hover:scale-105"
            style={{
              borderColor: locationStatus === 'granted' ? 'rgba(232, 163, 61, 0.45)' : hairline,
              backgroundColor: isDark ? 'rgba(18, 16, 13, 0.85)' : 'rgba(255,255,255,0.85)',
              color: locationStatus === 'granted' ? amber : ink,
            }}
          >
            {locationStatus === 'requesting' ? (
              <span className="h-4 w-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
              </svg>
            )}
            {locationStatus === 'granted' && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400" style={{ border: `2px solid ${isDark ? '#0e0d0b' : '#faf9f6'}` }} />
            )}
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