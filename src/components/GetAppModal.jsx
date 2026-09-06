import { useState, useEffect } from 'react'
import KeyadiLogo from './KeyadiLogo'
import { SparklesIcon, CheckCircleIcon } from './Icons'

export default function GetAppModal({ isOpen, onClose, isDark = true }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showAndroidGuide, setShowAndroidGuide] = useState(false)

  // Listen for Chrome / Android native PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  if (!isOpen) return null

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else {
      setShowAndroidGuide(true)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const amber = '#e8a33d'
  const ink = isDark ? '#f3f1ec' : '#100e0b'
  const inkMuted = isDark ? 'rgba(243,241,236,0.65)' : 'rgba(16,14,11,0.65)'
  const hairline = isDark ? 'rgba(243,241,236,0.12)' : 'rgba(16,14,11,0.10)'
  const cardBg = isDark ? 'rgba(18, 16, 13, 0.90)' : 'rgba(255, 255, 255, 0.95)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/70 animate-fadeIn">
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto keyadi-hide-scrollbar rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all"
        style={{
          backgroundColor: isDark ? '#12100d' : '#ffffff',
          borderColor: hairline,
          color: ink,
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-sm transition hover:scale-105"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            color: inkMuted,
          }}
          title="Close"
        >
          ✕
        </button>

        {/* Header with Circular High-Resolution Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <KeyadiLogo size={76} />
            <div className="absolute -bottom-1 -right-1 rounded-full p-1 bg-amber-500 shadow-md">
              <SparklesIcon size={12} color="#100e0b" />
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ backgroundColor: 'rgba(232, 163, 61, 0.15)', color: amber, border: `1px solid ${amber}44` }}
          >
            Official Mobile Application
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: ink }}>
            Install Keyadi App
          </h2>
          <p className="text-xs sm:text-sm mt-1.5 max-w-sm leading-relaxed" style={{ color: inkMuted }}>
            Full native experience with live GPS telemetry, hardware proximity radar, and offline map vectors.
          </p>
        </div>

        {/* Options Container */}
        <div className="space-y-4 mb-6">
          {/* Primary Recommended: Instant Native Installation (Android & iOS) */}
          <div
            className="rounded-2xl p-4 sm:p-5 border transition-all"
            style={{
              backgroundColor: cardBg,
              borderColor: amber,
              boxShadow: '0 0 20px rgba(232, 163, 61, 0.12)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'rgba(232, 163, 61, 0.18)', color: amber }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold" style={{ color: ink }}>
                      Install on Mobile Device
                    </h4>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: inkMuted }}>
                    {isInstalled
                      ? 'Keyadi is already installed on this device.'
                      : deferredPrompt
                      ? 'Tap below to install directly to your home screen with the official circular logo.'
                      : 'Add Keyadi to your phone home screen for full-screen view and instant GPS sync.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition hover:scale-[1.02] shadow-lg"
                style={{ backgroundColor: amber, color: '#100e0b' }}
              >
                <span>{deferredPrompt ? '⚡ 1-Tap Install Now' : '📱 View Install Instructions'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3.5 text-xs font-semibold transition border hover:bg-white/5"
                style={{ borderColor: hairline, color: ink }}
              >
                <span>{copiedLink ? '✓ Link Copied!' : 'Copy App Link'}</span>
              </button>
            </div>

            {/* Step by Step Mobile Guides */}
            <div className="mt-4 space-y-2.5 pt-3 border-t" style={{ borderColor: hairline }}>
              {/* Android Guide */}
              <div
                className="rounded-xl p-3 text-xs leading-relaxed border"
                style={{
                  backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.02)',
                  borderColor: hairline,
                }}
              >
                <div className="font-semibold text-xs mb-1.5 flex items-center gap-1.5" style={{ color: amber }}>
                  <span>🤖 Android (Google Chrome):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1" style={{ color: inkMuted }}>
                  <li>Tap the <strong>three dots menu (⋮)</strong> in Chrome’s top-right corner</li>
                  <li>Tap <strong>&quot;Install app&quot;</strong> (or <strong>&quot;Add to Home screen&quot;</strong>)</li>
                  <li>Chrome creates a native WebAPK with the official circular Keyadi logo</li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div
                className="rounded-xl p-3 text-xs leading-relaxed border"
                style={{
                  backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.02)',
                  borderColor: hairline,
                }}
              >
                <div className="font-semibold text-xs mb-1.5 flex items-center gap-1.5" style={{ color: amber }}>
                  <span>🍎 iPhone & iPad (Apple Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1" style={{ color: inkMuted }}>
                  <li>Open <strong>keyadi.vercel.app</strong> in Safari</li>
                  <li>Tap the <strong>Share button (􀈂)</strong> in the navigation toolbar</li>
                  <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
                </ol>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[10px]" style={{ color: inkMuted }}>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircleIcon size={12} color="#34d399" />
                Hardware GPS Sync
              </span>
              <span>•</span>
              <span>Full-Screen Standalone</span>
              <span>•</span>
              <span>No Corrupted APK Errors</span>
            </div>
          </div>

          {/* Option 2: Sideloading Standalone APK Build */}
          <div
            className="rounded-2xl p-4 border transition-all"
            style={{
              backgroundColor: cardBg,
              borderColor: hairline,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'rgba(62, 207, 142, 0.16)', color: '#3ecf8e' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5902 8.4128 13.856 8.125 12 8.125s-3.5902.2878-5.1368.8247L4.8409 5.4467a.4161.4161 0 0 0-.5677-.1521.4157.4157 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.75h24c-.3432-4.0911-2.6889-7.5633-6.1185-9.4286"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: ink }}>
                    Standalone Android APK Sideload
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: inkMuted }}>
                    Capacitor Android source code with Gradle build scripts is published on GitHub.
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/biruk6049/Keyadi/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition hover:scale-105 border"
                style={{
                  backgroundColor: 'rgba(62, 207, 142, 0.12)',
                  borderColor: 'rgba(62, 207, 142, 0.35)',
                  color: '#3ecf8e',
                }}
              >
                <span>GitHub Releases ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] pt-2 border-t" style={{ borderColor: hairline, color: inkMuted }}>
          <span className="font-semibold" style={{ color: amber }}>Built by HAWAZ TECHNOLOGIES</span>
          <button
            onClick={onClose}
            className="font-medium hover:underline text-xs"
            style={{ color: ink }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
