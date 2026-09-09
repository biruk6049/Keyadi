import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import PageBackground from '../components/PageBackground'
import { SparklesIcon } from '../components/Icons'
import KeyadiLogo from '../components/KeyadiLogo'

export default function Signup() {
  const { signUpWithEmail } = useAuth()
  const { settings } = useSettings()
  const isDark = true
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  const ink = '#f3f1ec'
  const inkMuted = 'rgba(243,241,236,0.65)'
  const hairline = 'rgba(243,241,236,0.12)'
  const cardBg = 'rgba(14, 13, 11, 0.86)'
  const inputBg = 'rgba(255, 255, 255, 0.04)'
  const amber = '#e8a33d'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { data, error } = await signUpWithEmail(email, password)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      navigate('/dashboard')
    } else {
      setConfirmSent(true)
    }
  }

  if (confirmSent) {
    return (
      <PageBackground showToggle={false}>
        <div
          className="flex flex-col min-h-screen items-center justify-center px-4 py-8 sm:py-12 selection:bg-amber-500/20 selection:text-amber-400"
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", color: ink }}
        >
          <div
            className="w-full max-w-md rounded-3xl p-8 sm:p-10 text-center shadow-2xl backdrop-blur-2xl transition-all"
            style={{ backgroundColor: cardBg, border: `1px solid ${hairline}` }}
          >
            {/* Glowing Email Icon */}
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl"
              style={{ backgroundColor: 'rgba(232,163,61,0.18)', border: `1px solid ${amber}66` }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: ink }}>
              Check your email
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: inkMuted }}>
              We sent an activation link to <span className="font-semibold text-amber-400">{email}</span>. Click the link to complete your verification and access your map.
            </p>

            <Link
              to="/login"
              style={{ backgroundColor: amber, color: '#100e0b' }}
              className="inline-block w-full rounded-2xl py-3.5 text-sm font-bold shadow-xl transition hover:opacity-95"
            >
              Return to Sign in →
            </Link>
          </div>
        </div>
      </PageBackground>
    )
  }

  return (
    <PageBackground showToggle={false}>
      <div
        className="flex flex-col min-h-screen items-center justify-center px-4 py-8 sm:py-12 selection:bg-amber-500/20 selection:text-amber-400"
        style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", color: ink }}
      >
        <div
          className="w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl transition-all"
          style={{ backgroundColor: cardBg, border: `1px solid ${hairline}` }}
        >
          {/* Brand Mark */}
          <div className="mb-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <KeyadiLogo size={40} />
              <span className="text-xl font-bold tracking-tight" style={{ color: ink }}>
                Keyadi
              </span>
            </Link>

            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(45,212,191,0.15)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.3)' }}
            >
              <SparklesIcon size={11} color="#2dd4bf" />
              <span>Free Account</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-1.5" style={{ color: ink }}>
            Create your account
          </h1>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: inkMuted }}>
            Start exploring places near you with smart search, live directions, and saved spots.
          </p>

          {error && (
            <div
              className="mb-5 flex items-start gap-2 rounded-2xl p-3.5 text-xs"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.10)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}
            >
              <span>✕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: inkMuted }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ backgroundColor: inputBg, borderColor: hairline, color: ink }}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: inkMuted }}>
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ backgroundColor: inputBg, borderColor: hairline, color: ink }}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: amber, color: '#100e0b' }}
              className="w-full rounded-2xl py-3.5 text-sm font-bold shadow-xl transition-all hover:scale-[1.02] hover:opacity-95 disabled:opacity-60 mt-2"
            >
              {submitting ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t text-center text-xs" style={{ borderColor: hairline, color: inkMuted }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-400 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] font-medium tracking-wide" style={{ color: inkMuted }}>
          <span style={{ color: amber }}>Built by HAWAZ TECHNOLOGIES</span>
        </div>
      </div>
    </PageBackground>
  )
}