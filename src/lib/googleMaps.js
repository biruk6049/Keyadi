/**
 * Google Maps JavaScript API & Google Places API Integration for Keyadi.
 *
 * Provides:
 * 1. Resilient Google Maps SDK Loader with dynamic API key support.
 * 2. Luxury Obsidian Dark Mode and Warm Parchment Light Mode styling.
 * 3. Custom HTMLOverlay class for 3D animated markers, pulsing GPS rings, and RPG badges.
 * 4. Google Places API search and reverse geocoding utilities.
 * 5. Google DirectionsService multimodal routing engine with fallback.
 */

let googleMapsPromise = null

export function getGoogleMapsKey() {
  try {
    const fromStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('keyadi_google_maps_key') : null
    if (fromStorage) return fromStorage.trim()
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY) {
      return import.meta.env.VITE_GOOGLE_MAPS_API_KEY.trim()
    }
  } catch {}
  return ''
}

export function saveGoogleMapsKey(key) {
  try {
    if (key) {
      localStorage.setItem('keyadi_google_maps_key', key.trim())
    } else {
      localStorage.removeItem('keyadi_google_maps_key')
    }
  } catch (err) {
    console.warn('Failed to persist Google Maps key:', err)
  }
}

/**
 * Dynamically loads the Google Maps JavaScript API with Places, Geometry, and Marker libraries.
 */
export function loadGoogleMaps(customKey = '') {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.google && window.google.maps) return Promise.resolve(window.google)

  if (googleMapsPromise) return googleMapsPromise

  const apiKey = customKey || getGoogleMapsKey()

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if already injected
    if (document.querySelector('script[data-keyadi-google-maps]')) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval)
          resolve(window.google)
        }
      }, 100)
      return
    }

    const script = document.createElement('script')
    script.setAttribute('data-keyadi-google-maps', 'true')
    script.async = true
    script.defer = true

    // Note: If no key is set yet, we load with loading=async; Google will display a development notice
    const keyParam = apiKey ? `key=${encodeURIComponent(apiKey)}&` : ''
    script.src = `https://maps.googleapis.com/maps/api/js?${keyParam}libraries=places,geometry,marker&v=weekly&loading=async`

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google)
      } else {
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(interval)
            resolve(window.google)
          }
        }, 50)
      }
    }

    script.onerror = (err) => {
      googleMapsPromise = null
      reject(new Error('Failed to load Google Maps JavaScript API: ' + (err?.message || 'Network error')))
    }

    document.head.appendChild(script)
  })

  return googleMapsPromise
}

// ── Keyadi Luxury Obsidian Dark Mode Style ──
export const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0e0d0b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0e0d0b' }, { weight: 3 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#c8bfab' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e8a33d' }, { weight: 'bold' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9d9482' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#131511' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6d7560' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a1815' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#12100d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8c8475' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#26221c' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1b1814' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e8a33d' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#171512' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c8bfab' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#080807' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#555148' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#080807' }],
  },
]

// ── Keyadi Clean Warm Light Mode Style ──
export const GOOGLE_MAPS_LIGHT_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#faf9f6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 3 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#2b2722' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b87314' }, { weight: 'bold' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5e564d' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e9ede4' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#eae5d9' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f5efe1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e0d5be' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#dde7ea' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#688691' }],
  },
]

/**
 * Creates a custom HTML overlay class attached to Google Maps.
 * Allows arbitrary DOM elements (such as animated pulsing GPS circles,
 * RPG badges, and rich 3D pins) to be anchored seamlessly on the map.
 */
export function createHTMLOverlayClass(google) {
  if (!google || !google.maps || !google.maps.OverlayView) return null

  return class HTMLOverlay extends google.maps.OverlayView {
    constructor(element, position, anchor = 'bottom') {
      super()
      this.element = element
      this.position = new google.maps.LatLng(position.lat, position.lng)
      this.anchor = anchor // 'bottom' | 'center'
    }

    onAdd() {
      const panes = this.getPanes()
      panes.overlayMouseTarget.appendChild(this.element)
    }

    draw() {
      const projection = this.getProjection()
      if (!projection || !this.element) return

      const point = projection.fromLatLngToDivPixel(this.position)
      if (!point) return

      this.element.style.position = 'absolute'
      if (this.anchor === 'center') {
        this.element.style.left = `${point.x}px`
        this.element.style.top = `${point.y}px`
        this.element.style.transform = 'translate(-50%, -50%)'
      } else {
        // anchor bottom
        this.element.style.left = `${point.x}px`
        this.element.style.top = `${point.y}px`
        this.element.style.transform = 'translate(-50%, -100%)'
      }
    }

    setPosition(latLng) {
      this.position = new google.maps.LatLng(latLng.lat, latLng.lng)
      this.draw()
    }

    onRemove() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element)
      }
    }
  }
}

/**
 * Query Google Places API directly via Google Maps PlacesService.
 * Returns normalized place objects matching Keyadi's schema.
 */
export async function queryGooglePlaces({
  term,
  center,
  radiusKm = 5,
  google,
  map,
  signal = null,
}) {
  if (!google || !google.maps || !google.maps.places) return []

  const radiusMeters = Math.min(50000, Math.round(radiusKm * 1000))
  const pyrmont = new google.maps.LatLng(center.lat, center.lng)
  const service = new google.maps.places.PlacesService(map || document.createElement('div'))

  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve([])
      return
    }

    // Try textSearch first for rich keyword & category matching
    service.textSearch(
      {
        query: term,
        location: pyrmont,
        radius: radiusMeters,
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && Array.isArray(results) && results.length > 0) {
          const places = results.map((p, idx) => {
            const pLat = typeof p.geometry?.location?.lat === 'function' ? p.geometry.location.lat() : p.geometry?.location?.lat
            const pLng = typeof p.geometry?.location?.lng === 'function' ? p.geometry.location.lng() : p.geometry?.location?.lng
            const dist = google.maps.geometry?.spherical
              ? google.maps.geometry.spherical.computeDistanceBetween(pyrmont, p.geometry.location) / 1000
              : 0

            return {
              id: `google-${p.place_id || idx}`,
              name: p.name || 'Unnamed Place',
              lat: pLat,
              lng: pLng,
              type: p.types?.[0]?.replace(/_/g, ' ') || 'Place',
              address: p.formatted_address || '',
              addressSnippet: p.formatted_address ? p.formatted_address.split(',')[0].trim() : '',
              rating: p.rating || 4.2,
              stars: p.rating ? `${p.rating}` : '',
              photos: p.photos ? p.photos.map((ph) => ph.getUrl({ maxWidth: 400, maxHeight: 300 })) : [],
              isOpen: p.opening_hours ? p.opening_hours.isOpen?.() : null,
              distanceKm: dist,
              source: 'google_places',
              verifiedGeo: true,
            }
          })
          resolve(places)
        } else {
          // If textSearch returned ZERO_RESULTS, attempt nearbySearch
          service.nearbySearch(
            {
              location: pyrmont,
              radius: radiusMeters,
              keyword: term,
            },
            (nearbyResults, nearbyStatus) => {
              if (nearbyStatus === google.maps.places.PlacesServiceStatus.OK && Array.isArray(nearbyResults)) {
                const places = nearbyResults.map((p, idx) => {
                  const pLat = typeof p.geometry?.location?.lat === 'function' ? p.geometry.location.lat() : p.geometry?.location?.lat
                  const pLng = typeof p.geometry?.location?.lng === 'function' ? p.geometry.location.lng() : p.geometry?.location?.lng
                  const dist = google.maps.geometry?.spherical
                    ? google.maps.geometry.spherical.computeDistanceBetween(pyrmont, p.geometry.location) / 1000
                    : 0

                  return {
                    id: `google-${p.place_id || idx}`,
                    name: p.name || 'Unnamed Place',
                    lat: pLat,
                    lng: pLng,
                    type: p.types?.[0]?.replace(/_/g, ' ') || 'Place',
                    address: p.vicinity || '',
                    addressSnippet: p.vicinity || '',
                    rating: p.rating || 4.2,
                    stars: p.rating ? `${p.rating}` : '',
                    distanceKm: dist,
                    source: 'google_places',
                    verifiedGeo: true,
                  }
                })
                resolve(places)
              } else {
                resolve([])
              }
            }
          )
        }
      }
    )
  })
}

/**
 * Reverse geocode a latitude & longitude into a human-readable street/locality name.
 */
export async function reverseGeocodeGoogle(lat, lng, google) {
  if (!google || !google.maps || !google.maps.Geocoder) return null

  const geocoder = new google.maps.Geocoder()
  return new Promise((resolve) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve({
          formattedAddress: results[0].formatted_address,
          name: results[0].address_components?.[0]?.long_name || results[0].formatted_address.split(',')[0],
          raw: results[0],
        })
      } else {
        resolve(null)
      }
    })
  })
}
