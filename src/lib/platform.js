import { Capacitor } from '@capacitor/core'

/**
 * Platform and environment detection helper for Keyadi.
 * Accurately determines if the app is running in the native application shell
 * (Capacitor Android/iOS, installed standalone PWA, or native webview).
 */
export function isNativePlatform() {
  if (typeof window === 'undefined') return false

  // 1. Capacitor native shell check
  try {
    if (Capacitor && typeof Capacitor.isNativePlatform === 'function') {
      if (Capacitor.isNativePlatform()) return true
    }
  } catch (err) {
    // fallback
  }

  // 2. Window Capacitor global
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
    if (window.Capacitor.isNativePlatform()) return true
  }

  // 3. Custom Capacitor URL protocol or native origin (Android/iOS WebView)
  if (
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'ionic:' ||
    (window.location.hostname === 'localhost' && window.Capacitor)
  ) {
    return true
  }

  // 4. Standalone installed mode (Android APK TWA, PWA "Add to Home Screen", etc.)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true ||
    (document.referrer && document.referrer.includes('android-app://'))
  if (isStandalone) return true

  // 5. Explicit app-mode flag in storage or URL parameter (?app=true or ?mode=app)
  try {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('app') === 'true' || urlParams.get('mode') === 'app') {
      return true
    }
    if (localStorage.getItem('keyadi_app_mode') === 'true') {
      return true
    }
  } catch {
    // ignore
  }

  return false
}

export function getPlatformName() {
  try {
    if (Capacitor && typeof Capacitor.getPlatform === 'function') {
      const plat = Capacitor.getPlatform()
      if (plat && plat !== 'web') return plat
    }
  } catch {}

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
