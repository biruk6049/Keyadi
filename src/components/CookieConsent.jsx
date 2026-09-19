import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('keyadi_cookie_consent')
      if (!consent) {
        // Small delay so it doesn't flash immediately on page load
        const timer = setTimeout(() => {
          setVisible(true)
          requestAnimationFrame(() => setAnimateIn(true))
        }, 1200)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage unavailable — don't show banner
    }
  }, [])

  const handleAccept = (level) => {
    try {
      localStorage.setItem('keyadi_cookie_consent', JSON.stringify({
        level, // 'all' or 'essential'
        timestamp: new Date().toISOString(),
      }))
    } catch {
      // Silently fail if localStorage is unavailable
    }
    setAnimateIn(false)
    setTimeout(() => setVisible(false), 350)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[9999] px-3 pb-3 sm:px-6 sm:pb-6 transition-all duration-300 ease-out"
      style={{
        transform: animateIn ? 'translateY(0)' : 'translateY(100%)',
        opacity: animateIn ? 1 : 0,
      }}
    >
      <div
        className="mx-auto max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl border"
        style={{
          backgroundColor: 'rgba(14, 13, 11, 0.92)',
          borderColor: 'rgba(243,241,236,0.12)',
          fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-lg" role="img" aria-hidden="true">🍪</span>
          <h3 className="text-sm font-bold tracking-tight" style={{ color: '#f3f1ec' }}>
            Your Privacy Matters
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(243,241,236,0.65)' }}>
          Keyadi uses essential browser storage (localStorage) to save your preferences, authenticate your session, and remember your consent choice.
          We do not use tracking cookies, advertising pixels, or behavioral analytics.
          Read our{' '}
          <Link to="/cookies" className="text-amber-400 underline decoration-amber-400/40 hover:text-amber-300 transition">
            Cookie Policy
          </Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-amber-400 underline decoration-amber-400/40 hover:text-amber-300 transition">
            Privacy Policy
          </Link>
          {' '}for details.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleAccept('all')}
            className="flex-1 rounded-xl py-2.5 px-4 text-xs font-bold transition-all hover:scale-[1.02] hover:opacity-95 shadow-lg"
            style={{ backgroundColor: '#e8a33d', color: '#100e0b' }}
            aria-label="Accept all cookies and storage"
          >
            Accept All
          </button>
          <button
            onClick={() => handleAccept('essential')}
            className="flex-1 rounded-xl py-2.5 px-4 text-xs font-bold transition-all hover:scale-[1.02] border"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#f3f1ec',
              borderColor: 'rgba(243,241,236,0.2)',
            }}
            aria-label="Accept only essential cookies"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  )
}
