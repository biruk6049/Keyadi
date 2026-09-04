// Platform and environment detection helper
let capacitor = null

try {
  // Dynamic or conditional check to prevent errors if @capacitor/core is not yet loaded
  const mod = await import('@capacitor/core')
  capacitor = mod.Capacitor
} catch {
  // Running in standard web environment without capacitor bundle
  capacitor = null
}

export function isNativePlatform() {
  if (typeof window === 'undefined') return false
  if (capacitor && typeof capacitor.isNativePlatform === 'function') {
    return capacitor.isNativePlatform()
  }
  // Also check if running in standalone PWA mode (Add to Home Screen)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  return isStandalone
}

export function getPlatformName() {
  if (capacitor && typeof capacitor.getPlatform === 'function') {
    return capacitor.getPlatform()
  }
  if (typeof window !== 'undefined') {
    const ua = window.navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) return 'ios'
    if (/android/.test(ua)) return 'android'
  }
  return 'web'
}

export function isMobileViewport() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}
