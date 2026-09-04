import { useState, useEffect } from 'react'
import KeyadiLogo from './KeyadiLogo'
import { SparklesIcon, CheckCircleIcon } from './Icons'

export default function GetAppModal({ isOpen, onClose, isDark = true }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Listen for Chrome/Android native install prompt
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
  const cardBg = isDark ? 'rgba(18, 16, 13, 0.85)' : 'rgba(255, 255, 255, 0.92)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all"
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

        {/* Header with circular 4K Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <KeyadiLogo size={76} />
            <div className="absolute -bottom-1 -right-1 rounded-full p-1 bg-amber-500 shadow-md">
              <SparklesIcon size={12} color="#100e0b" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ backgroundColor: 'rgba(232, 163, 61, 0.15)', color: amber, border: `1px solid ${amber}44` }}>
            Official Mobile Edition
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: ink }}>
            Get Keyadi for Mobile
          </h2>
          <p className="text-xs sm:text-sm mt-1.5 max-w-sm" style={{ color: inkMuted }}>
            Install Keyadi directly on your phone with zero store fees. Features our 4K circular logo on your home screen.
          </p>
        </div>

        {/* Download Options */}
        <div className="space-y-3.5 mb-6">
          {/* Option 1: Direct Android APK */}
          <div
            className="rounded-2xl p-4 border transition-all hover:border-amber-500/40"
            style={{
              backgroundColor: cardBg,
              borderColor: hairline,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(62, 207, 142, 0.16)', color: '#3ecf8e' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5902 8.4128 13.856 8.125 12 8.125s-3.5902.2878-5.1368.8247L4.8409 5.4467a.4161.4161 0 0 0-.5677-.1521.4157.4157 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.75h24c-.3432-4.0911-2.6889-7.5633-6.1185-9.4286"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: ink }}>
                    Android Direct APK
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: inkMuted }}>
                    Download and install the native Android APK package directly.
                  </p>
                </div>
              </div>
              <a
                href="/keyadi-app.apk"
                download="Keyadi.apk"
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition hover:scale-105 shadow-md"
                style={{ backgroundColor: amber, color: '#100e0b' }}
              >
                <span>Download .APK</span>
              </a>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-[10px]" style={{ color: inkMuted }}>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircleIcon size={12} color="#34d399" />
                100% Free
              </span>
              <span>•</span>
              <span>No Google Play Store account required</span>
              <span>•</span>
              <span>Native GPS Radar</span>
            </div>
          </div>

          {/* Option 2: Instant PWA / Home Screen */}
          <div
            className="rounded-2xl p-4 border transition-all hover:border-amber-500/40"
            style={{
              backgroundColor: cardBg,
              borderColor: hairline,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(56, 189, 248, 0.16)', color: '#38bdf8' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: ink }}>
                    iOS & Android Instant Install
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: inkMuted }}>
                    Install directly to your home screen via browser. Zero download delay.
                  </p>
                </div>
              </div>

              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition hover:scale-105 border shadow-sm"
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.18)',
                    color: '#38bdf8',
                    borderColor: 'rgba(56, 189, 248, 0.35)',
                  }}
                >
                  Install Now
                </button>
              ) : (
                <button
                  onClick={handleCopyLink}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition hover:scale-105 border shadow-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: ink,
                    borderColor: hairline,
                  }}
                >
                  {copiedLink ? 'Copied Link!' : 'Copy Link'}
                </button>
              )}
            </div>

            {/* iOS Helper Instructions */}
            <div className="mt-3 rounded-xl p-2.5 text-[11px] leading-relaxed border" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', borderColor: hairline }}>
              <div className="font-semibold text-xs mb-1" style={{ color: amber }}>
                📱 For iPhone (Safari) Users:
              </div>
              <ol className="list-decimal list-inside space-y-0.5" style={{ color: inkMuted }}>
                <li>Open this website in Safari on your iPhone</li>
                <li>Tap the <strong>Share button (􀈂)</strong> at the bottom</li>
                <li>Select <strong>Add to Home Screen</strong> (Keyadi circular logo will appear)</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-[11px]" style={{ color: inkMuted }}>
          <span>Ready for Google Play & App Store submissions</span>
          <button
            onClick={onClose}
            className="font-medium hover:underline"
            style={{ color: amber }}
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  )
}
