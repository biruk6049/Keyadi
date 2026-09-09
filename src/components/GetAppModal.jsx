import { useState, useEffect } from 'react'
import KeyadiLogo from './KeyadiLogo'
import { SparklesIcon, CheckCircleIcon } from './Icons'

function AndroidIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5902 8.4128 13.856 8.125 12 8.125s-3.5902.2878-5.1368.8247L4.8409 5.4467a.4161.4161 0 0 0-.5677-.1521.4157.4157 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.75h24c-.3432-4.0911-2.6889-7.5633-6.1185-9.4286"/>
    </svg>
  )
}

function AppleIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.41c.64-.78 1.08-1.86.96-2.95-1 .04-2.16.66-2.83 1.44-.59.68-1.11 1.77-.97 2.83 1.11.09 2.2-.54 2.84-1.32"/>
    </svg>
  )
}

function SmartphoneIcon({ size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.4" />
    </svg>
  )
}

export default function GetAppModal({ isOpen, onClose, isDark = true }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Listen for browser install prompt
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
      // If install prompt is not fired, copy link for easy browser installation
      handleCopyLink()
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
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all"
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

        {/* Header with Circular Logo */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-3">
            <KeyadiLogo size={70} />
            <div className="absolute -bottom-1 -right-1 rounded-full p-1 bg-amber-500 shadow-md">
              <SparklesIcon size={11} color="#100e0b" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: ink }}>
            Install Keyadi
          </h2>
          <p className="text-xs sm:text-sm mt-1.5 max-w-xs leading-relaxed" style={{ color: inkMuted }}>
            Add Keyadi to your device for instant 1-tap access to local places, live directions, and saved spots.
          </p>
        </div>

        {/* Install on Mobile Device Option Card */}
        <div
          className="rounded-2xl p-4 sm:p-5 border transition-all mb-4"
          style={{
            backgroundColor: cardBg,
            borderColor: amber,
            boxShadow: '0 0 20px rgba(232, 163, 61, 0.12)',
          }}
        >
          {/* Top row with device icons */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: hairline }}>
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(232, 163, 61, 0.18)', color: amber }}
              >
                <SmartphoneIcon size={22} color={amber} />
              </div>
              <div>
                <h4 className="text-sm font-bold" style={{ color: ink }}>
                  Mobile & Desktop App
                </h4>
                <p className="text-[11px]" style={{ color: inkMuted }}>
                  Fast, lightweight, and always up to date
                </p>
              </div>
            </div>

            {/* Platform Icons (Android & Apple) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ borderColor: hairline, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
              <span title="Android" style={{ color: '#3ddc84' }}>
                <AndroidIcon size={16} color="#3ddc84" />
              </span>
              <span className="text-white/20">•</span>
              <span title="Apple iOS" style={{ color: ink }}>
                <AppleIcon size={15} color={ink} />
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition hover:scale-[1.02] shadow-lg"
              style={{ backgroundColor: amber, color: '#100e0b' }}
            >
              <SmartphoneIcon size={16} color="#100e0b" />
              <span>{isInstalled ? '✓ App Installed' : deferredPrompt ? 'Install App' : 'Add to Home Screen'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3.5 text-xs font-semibold transition border hover:bg-white/5"
              style={{ borderColor: hairline, color: ink }}
            >
              <span>{copiedLink ? '✓ Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Real, Accurate Feature Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 text-[10px]" style={{ color: inkMuted }}>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircleIcon size={12} color="#34d399" />
              1-Tap Access
            </span>
            <span>•</span>
            <span>Live Routes</span>
            <span>•</span>
            <span>Saved Places</span>
            <span>•</span>
            <span>Real-time Weather</span>
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
