import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import KeyadiLogo from '../components/KeyadiLogo'
import KeyadiWordmark from '../components/KeyadiWordmark'
import GetAppModal from '../components/GetAppModal'
import Landing3DBackground from '../components/landing/Landing3DBackground'
import {
  KineticTitle,
  KineticWordRotator,
  KineticBadge,
  ScrollRevealHeading,
} from '../components/landing/KineticTypography'
import TiltCard3D from '../components/landing/TiltCard3D'
import InteractiveMap3DShowcase from '../components/landing/InteractiveMap3DShowcase'
import InteractiveDemoTerminal from '../components/landing/InteractiveDemoTerminal'
import {
  SparklesIcon,
  SearchIcon,
  MapPinIcon,
  ClockIcon,
  PinIcon,
  GridIcon,
  CategoryIcon,
  ChevronDownIcon,
  MailIcon,
  CheckCircleIcon,
  SendIcon,
  PhoneIcon,
  GlobeIcon,
  NavigationIcon,
  XIcon,
  MenuIcon,
  AlertTriangleIcon,
} from '../components/Icons'
import ThemeToggle from '../components/ThemeToggle'

const QUERY_CHIPS = [
  { label: 'Quiet Cafes', icon: 'cafe', query: 'Quiet specialty cafe with outdoor seating' },
  { label: 'Best Restaurants', icon: 'food', query: 'Authentic local cuisine and dinner' },
  { label: '24/7 Pharmacies', icon: 'pharmacy', query: 'Emergency medical pharmacy open now' },
  { label: 'EV & Fuel', icon: 'gas', query: 'EV charging and gas station nearby' },
  { label: 'Shopping', icon: 'shop', query: 'Supermarket and grocery stores' },
]

const FAQ_ITEMS = [
  {
    q: 'How does Keyadi find places near me?',
    a: 'Just describe what you need in plain words — like "quiet cafe with fast wifi" or "24/7 pharmacy open now" — and Keyadi turns that into a live search using real map data from OpenStreetMap. You get accurate, up-to-date results, not guesses.',
    cat: 'Product',
  },
  {
    q: 'Is Keyadi free? Do I need a credit card?',
    a: 'Keyadi is completely free to use. Search for places, get driving and walking directions, and create an account to save your favourite areas — all without ever entering a credit card.',
    cat: 'Pricing',
  },
  {
    q: 'How does Keyadi calculate routes?',
    a: 'When you tap on a place or ask for directions, Keyadi instantly shows you three options side-by-side — driving, walking, and cycling — with real-time distance and estimated travel time.',
    cat: 'Directions',
  },
  {
    q: 'Can I keep an eye on a specific area continuously?',
    a: 'Yes! With Keyadi Live Trackers, you can draw a circle around any spot on the map and add keywords you care about — like "artisan bakery" or "EV charging". Keyadi watches the area and lets you know when something new shows up.',
    cat: 'Features',
  },
  {
    q: 'Is my location kept private?',
    a: 'Absolutely. Your GPS position is only ever used inside your own browser — it never gets sent to our servers. We don\'t sell your data, track your movements, or build profiles. Your privacy is non-negotiable.',
    cat: 'Security',
  },
  {
    q: 'Can I change how the map looks?',
    a: 'Definitely. Head into Settings to switch between a sleek dark street map and high-resolution satellite view, choose between kilometres and miles, or set a custom home location as your starting point.',
    cat: 'Product',
  },
]

const TRUSTED_COMPANIES = [
  {
    name: 'Google Maps',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z" fill="#4285F4" />
        <path d="M12 2C9.79 2 7.8 2.89 6.34 4.34L12 10V2z" fill="#EA4335" />
        <path d="M17.66 4.34C16.2 2.89 14.21 2 12 2v8l5.66-5.66z" fill="#FBBC04" />
        <path d="M12 10l-5.66-5.66C4.89 5.8 4 7.79 4 10c0 5.25 7 12 8 12V10z" fill="#34A853" />
        <circle cx="12" cy="10" r="3.2" fill="#FFFFFF" />
        <circle cx="12" cy="10" r="1.8" fill="#1A73E8" />
      </svg>
    ),
  },
  {
    name: 'Mapbox',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#4264FB" />
        <path d="M12 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zm-2.4 3.75v6.5h1.6v-3.7l1.7 3.7h1.4l1.7-3.7v3.7h1.6v-6.5h-1.8l-1.8 3.9-1.8-3.9H9.6z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: 'OpenStreetMap',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#7EBC6F">
        <path d="M17.915 2.502a1.86 1.86 0 0 0-.82.203L10.51 5.92 4.975 2.527a1.86 1.86 0 0 0-1.92.053 1.86 1.86 0 0 0-.895 1.58v14.414a1.86 1.86 0 0 0 .95 1.625l6.586 3.593c.3.16.635.244.97.244a1.86 1.86 0 0 0 .822-.203l6.586-3.215 5.534 3.393a1.86 1.86 0 0 0 1.92-.053 1.86 1.86 0 0 0 .895-1.58V5.978a1.86 1.86 0 0 0-.95-1.625L18.887 2.76a1.86 1.86 0 0 0-.972-.258zm-.62 3.033l3.35 1.634v11.385l-3.35-2.054V5.535zm-6.685 1.705l3.965-1.937v11.375l-3.965 1.937V7.24zm-6.685-1.7l3.35 2.054v11.385l-3.35-1.83V5.54z" />
      </svg>
    ),
  },
  {
    name: 'Supabase',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M13.35.53a1.5 1.5 0 0 0-2.3.24L.6 15.35a1.5 1.5 0 0 0 1.23 2.25h8.82L9.3 23.47a1.5 1.5 0 0 0 2.3-.24l10.45-14.58a1.5 1.5 0 0 0-1.23-2.25h-8.82L13.35.53z" fill="#3ECF8E" />
      </svg>
    ),
  },
  {
    name: 'Vercel',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L24 22H0L12 1Z" />
      </svg>
    ),
  },
  {
    name: 'React',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.8" fill="#61DAFB" />
      </svg>
    ),
  },
  {
    name: 'Vite',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M22 4L12 22 2 4l9.5 2.5L12 2l.5 4.5L22 4z" fill="#BD34FE" />
        <path d="M12 2l-1 4.5-9.5-2.5 10 18 2-9 4.5-.5L12 2z" fill="#FFDD35" />
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#38BDF8">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-.8 2.6-1.1 4.2-.9 1.8.3 3.1 1.6 4.5 3.1 2.3 2.3 5 5 10.5 5 3.2 0 5.2-1.6 6-4.8-1.2.8-2.6 1.1-4.2.9-1.8-.3-3.1-1.6-4.5-3.1-2.3-2.3-5-5-10.5-5zm-9.6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-.8 2.6-1.1 4.2-.9 1.8.3 3.1 1.6 4.5 3.1 2.3 2.3 5 5 10.5 5 3.2 0 5.2-1.6 6-4.8-1.2.8-2.6 1.1-4.2.9-1.8-.3-3.1-1.6-4.5-3.1-2.3-2.3-5-5-10.5-5z" />
      </svg>
    ),
  },
]

export default function Landing() {
  const { user } = useAuth()
  const { isDark, toggleDarkMode } = useSettings()
  const [activeChip, setActiveChip] = useState(0)

  // Navigation & Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [getAppOpen, setGetAppOpen] = useState(false)

  // FAQ state
  const [openFaq, setOpenFaq] = useState(0)
  const [faqFilter, setFaqFilter] = useState('All')

  // Workable Contact Form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    topic: 'General Inquiry',
    message: '',
  })
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [contactError, setContactError] = useState('')
  const [ticketId, setTicketId] = useState('')

  const ink = isDark ? '#f3f1ec' : '#100e0b'
  const inkMuted = isDark ? 'rgba(243,241,236,0.65)' : 'rgba(16,14,11,0.65)'
  const inkFaint = isDark ? 'rgba(243,241,236,0.40)' : 'rgba(16,14,11,0.45)'
  const hairline = isDark ? 'rgba(243,241,236,0.12)' : 'rgba(16,14,11,0.10)'
  const cardBg = isDark ? 'rgba(18, 16, 13, 0.78)' : 'rgba(255, 255, 255, 0.88)'
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'
  const amber = '#e8a33d'

  const handleContactSubmit = (e) => {
    e.preventDefault()
    setContactError('')

    if (!contactForm.name.trim()) {
      setContactError('Please provide your name.')
      return
    }
    if (!contactForm.email.trim() || !contactForm.email.includes('@')) {
      setContactError('Please enter a valid email address.')
      return
    }
    if (!contactForm.message.trim() || contactForm.message.trim().length < 8) {
      setContactError('Please enter a message of at least 8 characters.')
      return
    }

    setContactSubmitting(true)

    const generatedTicket = 'KYD-' + Math.floor(1000 + Math.random() * 9000)
    setTicketId(generatedTicket)

    try {
      const existing = JSON.parse(localStorage.getItem('keyadi_contact_messages') || '[]')
      existing.push({
        id: generatedTicket,
        recipient: 'biruk5868@gmail.com',
        phone: '+251 909005450',
        ...contactForm,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('keyadi_contact_messages', JSON.stringify(existing))
    } catch (err) {
      console.error('Failed saving message to localStorage', err)
    }

    // Trigger direct mail client to biruk5868@gmail.com
    const subject = encodeURIComponent(`[Keyadi - ${contactForm.topic}] Message from ${contactForm.name}`)
    const body = encodeURIComponent(
      `Name: ${contactForm.name}\nSender Email: ${contactForm.email}\nTopic: ${contactForm.topic}\nTicket ID: ${generatedTicket}\n\nMessage:\n${contactForm.message}`
    )
    window.location.href = `mailto:biruk5868@gmail.com?subject=${subject}&body=${body}`

    setTimeout(() => {
      setContactSubmitting(false)
      setContactSubmitted(true)
    }, 600)
  }

  const resetContactForm = () => {
    setContactForm({
      name: '',
      email: '',
      topic: 'General Inquiry',
      message: '',
    })
    setContactSubmitted(false)
    setContactError('')
  }

  const filteredFaqs =
    faqFilter === 'All'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.cat.toLowerCase() === faqFilter.toLowerCase())

  return (
    <div
      className="relative min-h-screen overflow-x-hidden selection:bg-amber-500/25 selection:text-amber-300 transition-colors duration-300"
      style={{
        backgroundColor: isDark ? '#0a0908' : '#faf9f6',
        color: ink,
        fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── 3D Reactive Three.js Geospatial Environment ── */}
      <Landing3DBackground isDark={isDark} />

      {/* Subtle radial vignette */}
      <div
        aria-hidden="true"
        className={
          isDark
            ? "pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,9,8,0.75)_100%)]"
            : "pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(240,238,233,0.35)_100%)]"
        }
      />

      {/* Main Foreground Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* ── Top Floating Navigation Island ── */}
        <header className="sticky top-0 z-40 mx-auto w-full max-w-6xl px-4 py-3 sm:px-10 sm:py-5">
          <div
            className="flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6 sm:py-3.5 shadow-2xl backdrop-blur-3xl transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(14, 12, 10, 0.85)' : 'rgba(255, 255, 255, 0.88)',
              border: `1px solid ${hairline}`,
              boxShadow: isDark
                ? '0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)'
                : '0 10px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            {/* Logo with 3D hover scale */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Keyadi Home">
              <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <KeyadiLogo size={32} />
              </div>
              <KeyadiWordmark height={23} />
            </Link>

            {/* Nav links with animated bottom indicator */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-semibold" style={{ color: inkMuted }}>
              <a href="#directions" className="transition-colors hover:text-amber-500 dark:hover:text-amber-400">Directions</a>
              <a href="#features" className="transition-colors hover:text-amber-500 dark:hover:text-amber-400">Features</a>
              <a href="#demo" className="transition-colors hover:text-amber-500 dark:hover:text-amber-400">Live Terminal</a>
              <a href="#faq" className="transition-colors hover:text-amber-500 dark:hover:text-amber-400">FAQ</a>
              <a href="#contact" className="transition-colors hover:text-amber-500 dark:hover:text-amber-400">Contact</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setGetAppOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-bold transition-all hover:scale-105 border shadow-sm whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(232, 163, 61, 0.15)',
                  color: amber,
                  borderColor: 'rgba(232, 163, 61, 0.38)',
                }}
                title="Download mobile app"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <span className="whitespace-nowrap">Get App</span>
              </button>

              {user ? (
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-transform hover:scale-105 shadow-md whitespace-nowrap"
                  style={{ backgroundColor: amber, color: '#100e0b' }}
                >
                  <SearchIcon size={12} color="#100e0b" />
                  <span className="whitespace-nowrap">Open Live Map</span>
                  <span>→</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-block rounded-full px-3.5 py-2 text-xs font-semibold transition hover:text-amber-300 whitespace-nowrap"
                    style={{ color: ink }}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden sm:flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-transform hover:scale-105 shadow-md whitespace-nowrap"
                    style={{
                      backgroundColor: amber,
                      color: '#100e0b',
                      boxShadow: '0 4px 16px rgba(232, 163, 61, 0.35)',
                    }}
                  >
                    <SparklesIcon size={12} color="#100e0b" />
                    <span className="whitespace-nowrap">Create Account</span>
                  </Link>
                </>
              )}

              {/* Interactive Theme Toggle Switch (Strictly No-Emoji) */}
              <div className="hidden sm:flex items-center">
                <ThemeToggle isDark={isDark} onToggle={toggleDarkMode} size="sm" />
              </div>

              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden h-8 w-8 items-center justify-center rounded-full text-sm hover:bg-white/10 transition shrink-0"
                style={{ color: ink }}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <XIcon size={18} color={ink} /> : <MenuIcon size={18} color={ink} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown Drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="mt-3 rounded-2xl p-4 md:hidden shadow-2xl backdrop-blur-3xl border flex flex-col gap-2.5 text-sm"
                style={{
                  backgroundColor: isDark ? 'rgba(16, 14, 11, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                  borderColor: hairline,
                }}
              >
                <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-1 border" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: hairline }}>
                  <span className="text-xs font-semibold" style={{ color: inkMuted }}>Appearance</span>
                  <ThemeToggle isDark={isDark} onToggle={toggleDarkMode} size="sm" />
                </div>
                <a
                  href="#directions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:text-amber-400 hover:bg-white/5 transition"
                  style={{ color: ink }}
                >
                  Directions
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:text-amber-400 hover:bg-white/5 transition"
                  style={{ color: ink }}
                >
                  Features
                </a>
                <a
                  href="#demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:text-amber-400 hover:bg-white/5 transition"
                  style={{ color: ink }}
                >
                  Live Terminal
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:text-amber-400 hover:bg-white/5 transition"
                  style={{ color: ink }}
                >
                  FAQ
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:text-amber-400 hover:bg-white/5 transition"
                  style={{ color: ink }}
                >
                  Contact
                </a>
                <div className="pt-2 border-t flex flex-col gap-2" style={{ borderColor: hairline }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setGetAppOpen(true)
                    }}
                    className="px-4 py-2.5 rounded-xl text-center text-xs font-bold border shadow-md transition hover:scale-[1.02] flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'rgba(232, 163, 61, 0.16)',
                      color: amber,
                      borderColor: 'rgba(232, 163, 61, 0.4)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    <span>Get the App</span>
                  </button>
                  {user ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-center text-xs font-bold shadow-md transition hover:opacity-90 flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: amber, color: '#100e0b' }}
                    >
                      <SearchIcon size={12} color="#100e0b" />
                      <span>Open Live Map</span>
                      <span>→</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2 rounded-xl text-center text-xs font-semibold hover:bg-white/5 transition"
                        style={{ color: ink }}
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-center text-xs font-bold shadow-md transition hover:opacity-90 flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: amber, color: '#100e0b' }}
                      >
                        <SparklesIcon size={12} color="#100e0b" />
                        <span>Create Account</span>
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ── Hero Section with Kinetic Motion Typography ── */}
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-16 text-center sm:px-10 sm:pt-20">
          {/* Dynamic 3D Floating Badge */}
          <div className="mb-6 flex justify-center">
            <KineticBadge icon={SparklesIcon}>
              Next-Gen Geospatial Intelligence · 3D Routing
            </KineticBadge>
          </div>

          {/* Kinetic Hero Headline */}
          <div className="mx-auto max-w-4xl">
            <KineticTitle
              text="Explore Any City With"
              className={`text-4xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.08] ${
                isDark ? 'text-[#f3f1ec]' : 'text-[#100e0b]'
              }`}
            />
            <div className="mt-2 text-4xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.08]">
              <KineticWordRotator
                words={[
                  'Smart Directions.',
                  'Zero Hallucinations.',
                  'Multimodal Routes.',
                  'Hyperlocal Precision.',
                ]}
              />
            </div>
          </div>

          {/* Kinetic Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed"
            style={{ color: inkMuted }}
          >
            Just tell Keyadi what you're looking for — in your own words. It finds real, verified places nearby
            and shows you exactly how to get there by car, foot, or bike.
          </motion.p>

          {/* Dynamic Suggestion Chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
          >
            <span
              className={`text-xs font-bold tracking-wide mr-1 uppercase ${
                isDark ? 'text-[#e8a33d]/70' : 'text-amber-600'
              }`}
            >
              Try searching:
            </span>
            {QUERY_CHIPS.map((chip, idx) => (
              <button
                key={chip.label}
                onClick={() => setActiveChip(idx)}
                className="group flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-xl transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor:
                    activeChip === idx
                      ? isDark
                        ? 'rgba(232, 163, 61, 0.22)'
                        : 'rgba(232, 163, 61, 0.16)'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                  border: `1px solid ${
                    activeChip === idx
                      ? amber
                      : hairline
                  }`,
                  color: activeChip === idx ? (isDark ? '#ffd166' : '#b45309') : inkMuted,
                  boxShadow: activeChip === idx ? '0 0 18px rgba(232, 163, 61, 0.3)' : 'none',
                }}
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full px-9 py-4 text-sm font-extrabold shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: amber,
                color: '#100e0b',
                boxShadow: '0 8px 30px rgba(232, 163, 61, 0.45)',
              }}
            >
              <span>{user ? 'Take Me To The Map' : 'Start Exploring — It\'s Free'}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>

            <Link
              to={user ? '/dashboard' : '/login'}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold backdrop-blur-2xl border transition-all hover:scale-105 hover:bg-white/10"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                borderColor: hairline,
                color: ink,
              }}
            >
              <SearchIcon size={15} color={amber} />
              <span>{user ? 'Open the Live Map' : 'Sign In To Explore'}</span>
            </Link>
          </motion.div>
        </section>

        {/* ── 3D Interactive Hero Map Showcase ── */}
        <section id="directions" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-10">
          <InteractiveMap3DShowcase user={user} isDark={isDark} />
        </section>

        {/* ── 3D Features Pillars Grid (TiltCard3D) ── */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-20 sm:px-10 border-t" style={{ borderColor: hairline }}>
          <ScrollRevealHeading
            tag="Built for Real Explorers"
            title="Everything You Need To Move Around Smarter"
            subtitle="Powerful under the hood, simple to use. Keyadi handles the complex stuff so you can focus on finding what matters."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <SparklesIcon size={22} color={amber} />,
                title: 'Search in Plain English',
                desc: 'No special syntax, no guesswork. Just describe what you want — “quiet cafe with outdoor seating” or “24/7 pharmacy nearby” — and Keyadi handles the rest.',
                badge: 'Natural Language Search',
                color: '#e8a33d',
              },
              {
                icon: <ClockIcon size={22} color="#38bdf8" />,
                title: 'Drive, Walk, or Cycle Routes',
                desc: 'See all three travel options side-by-side in seconds. Choose what works best for you today — whether you\'re in a rush or just enjoying a walk.',
                badge: 'Multimodal Routing',
                color: '#38bdf8',
              },
              {
                icon: <PinIcon size={22} color="#2dd4bf" />,
                title: 'Watch Your Neighborhood Live',
                desc: 'Pin a radius around any location and get notified whenever something new pops up — a new restaurant, a pharmacy, whatever you care about.',
                badge: 'Live Area Monitoring',
                color: '#2dd4bf',
              },
              {
                icon: <GlobeIcon size={22} color="#a78bfa" />,
                title: 'Stunning Maps, Day or Night',
                desc: 'Switch between sleek dark street maps and vivid satellite imagery. Your city, your way — beautifully rendered at every zoom level.',
                badge: 'Vector & Satellite',
                color: '#a78bfa',
              },
              {
                icon: <NavigationIcon size={22} color="#f43f5e" />,
                title: 'Your Location, Your Call',
                desc: 'Use your live GPS or pin any address as your starting point. Keyadi adapts to wherever you are and shows you what\'s close.',
                badge: 'Flexible Origin Point',
                color: '#f43f5e',
              },
              {
                icon: <CheckCircleIcon size={22} color="#34d399" />,
                title: 'Your Data Stays Yours',
                desc: 'Your location never leaves your device. We don\'t track you, profile you, or sell your data. Period. You explore in total privacy.',
                badge: '100% Private',
                color: '#34d399',
              },
            ].map((feat, i) => (
              <TiltCard3D key={i} maxTilt={10}>
                <div
                  className="group relative h-full rounded-3xl p-7 shadow-xl backdrop-blur-2xl border transition-all duration-300 [transform-style:preserve-3d]"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: hairline,
                  }}
                >
                  {/* Top row with icon & badge */}
                  <div className="flex items-center justify-between mb-5 [transform:translateZ(25px)]">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 shadow-lg border"
                      style={{
                        backgroundColor: feat.color + '18',
                        borderColor: feat.color + '44',
                      }}
                    >
                      {feat.icon}
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: feat.color + '15',
                        borderColor: feat.color + '33',
                        color: feat.color,
                      }}
                    >
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Description with 3D Z-depth */}
                  <h4
                    className="text-lg font-extrabold mb-2 transition-colors [transform:translateZ(30px)]"
                    style={{ color: ink }}
                  >
                    {feat.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed [transform:translateZ(20px)]"
                    style={{ color: inkMuted }}
                  >
                    {feat.desc}
                  </p>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </section>

        {/* ── Interactive Live Terminal Section ── */}
        <section id="demo" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-10">
          <div className="mb-10 text-center">
            <ScrollRevealHeading
              tag="See It In Action"
              title="Try a Real Search, Right Now"
              subtitle="Type what you're looking for, the way you'd say it to a friend. Keyadi finds real nearby places instantly."
            />
          </div>
          <InteractiveDemoTerminal isDark={isDark} user={user} />
        </section>

        {/* ── Technology Stack Marquee ── */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10">
          <div className="text-center mb-7">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-sm"
              style={{
                backgroundColor: 'rgba(232, 163, 61, 0.12)',
                color: amber,
                border: `1px solid ${amber}33`,
              }}
            >
              <SparklesIcon size={12} color={amber} />
              <span>Technology Stack</span>
            </span>
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: ink }}>
              Powered By Leading Map & Cloud Technologies
            </h4>
          </div>

          {/* Marquee Ticker Track with Gradient Edge Masks */}
          <div
            className="relative overflow-hidden rounded-3xl border py-5 backdrop-blur-2xl shadow-2xl"
            style={{
              backgroundColor: isDark ? 'rgba(18, 16, 13, 0.75)' : 'rgba(255, 255, 255, 0.88)',
              borderColor: hairline,
              maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            }}
          >
            <div className="animate-keyadi-marquee flex items-center gap-4">
              {[...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES].map((comp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl px-5 py-3 border transition-all duration-200 hover:scale-105 hover:border-amber-500/40 group cursor-default shrink-0 shadow-sm"
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    borderColor: hairline,
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border group-hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      borderColor: hairline,
                    }}
                  >
                    {comp.icon}
                  </div>
                  <span className="text-sm font-bold tracking-tight whitespace-nowrap" style={{ color: ink }}>
                    {comp.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Frequently Asked Questions (FAQ) Section ── */}
        <section id="faq" className="mx-auto max-w-6xl px-6 py-20 sm:px-10 border-t" style={{ borderColor: hairline }}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <ScrollRevealHeading
              tag="Got Questions?"
              title="We've Got Answers"
              subtitle="Wondering how Keyadi works, what it costs, or how we protect your privacy? Here's everything you need to know."
            />

            {/* Filter Category Pills */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              {['All', 'Product', 'Directions', 'Features', 'Pricing', 'Security'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqFilter(cat)}
                  className="rounded-full px-4 py-1.5 text-xs font-bold transition-all hover:scale-105"
                  style={{
                    backgroundColor: faqFilter === cat ? amber : 'rgba(255,255,255,0.05)',
                    color: faqFilter === cat ? '#100e0b' : inkMuted,
                    border: `1px solid ${faqFilter === cat ? amber : hairline}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Accordion */}
          <div className="mx-auto max-w-3xl space-y-3.5">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border backdrop-blur-2xl transition-all overflow-hidden"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: isOpen ? amber + '66' : hairline,
                    boxShadow: isOpen ? '0 8px 30px rgba(232, 163, 61, 0.15)' : 'none',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base transition-colors hover:text-amber-400"
                    style={{ color: isOpen ? amber : ink }}
                  >
                    <span>{faq.q}</span>
                    <span
                      className="shrink-0 transition-transform duration-200"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: isOpen ? amber : inkMuted,
                      }}
                    >
                      <ChevronDownIcon size={18} />
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t"
                        style={{ borderColor: hairline, color: inkMuted }}
                      >
                        <p>{faq.a}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: amber }}
                          >
                            {faq.cat}
                          </span>
                          <span className="text-[11px]" style={{ color: inkFaint }}>
                            · Verified Documentation
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Workable Contact & Support Section ── */}
        <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:px-10 border-t" style={{ borderColor: hairline }}>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <ScrollRevealHeading
              tag="We'd Love to Hear From You"
              title="Say Hello to the Keyadi Team"
              subtitle="Have a question, a feature idea, spotted a bug, or just want to chat? We read every message and we'll get back to you."
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Column: Contact Form */}
            <div
              className="lg:col-span-7 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-2xl border transition-all duration-300"
              style={{ backgroundColor: cardBg, borderColor: hairline }}
            >
              {contactSubmitted ? (
                /* ── Premium Success Animation State ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                  className="py-10 text-center relative overflow-hidden"
                >
                  {/* Confetti burst particles */}
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full pointer-events-none"
                      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [1, 1, 0],
                        scale: [0, 1, 0.8],
                        x: Math.cos((i / 16) * Math.PI * 2) * (60 + Math.random() * 60),
                        y: Math.sin((i / 16) * Math.PI * 2) * (60 + Math.random() * 60),
                      }}
                      transition={{ duration: 0.9, delay: i * 0.04, ease: 'easeOut' }}
                      style={{
                        width: `${5 + (i % 3) * 4}px`,
                        height: `${5 + (i % 3) * 4}px`,
                        backgroundColor: ['#e8a33d','#ffd166','#34d399','#38bdf8','#a78bfa','#f43f5e'][i % 6],
                        top: '50%',
                        left: '50%',
                        marginLeft: '-4px',
                        marginTop: '-4px',
                      }}
                    />
                  ))}

                  {/* Success Checkmark with ring pulse */}
                  <div className="relative inline-flex items-center justify-center mb-5">
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 260, delay: 0.1 }}
                      className="relative flex h-20 w-20 items-center justify-center rounded-full shadow-2xl"
                      style={{
                        background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, rgba(34,197,94,0.08) 100%)',
                        border: '2px solid rgba(34, 197, 94, 0.5)',
                        boxShadow: '0 0 40px rgba(34,197,94,0.3)',
                      }}
                    >
                      {/* Outer pulse ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                      />
                      <motion.svg
                        width="36" height="36" viewBox="0 0 24 24" fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
                      >
                        <motion.path
                          d="M5 13l4 4L19 7"
                          stroke="#22c55e"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.25 }}
                        />
                      </motion.svg>
                    </motion.div>
                  </div>

                  <motion.h4
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-extrabold mb-2"
                    style={{ color: ink }}
                  >
                    You're all set!
                  </motion.h4>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm max-w-md mx-auto mb-5"
                    style={{ color: inkMuted }}
                  >
                    Thanks <span className="font-semibold text-amber-500 dark:text-amber-400">{contactForm.name}</span>! Your message is on its way. We’ll get back to you soon.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="inline-block px-4 py-2 rounded-xl text-xs font-mono font-bold mb-7 border"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      borderColor: hairline,
                      color: amber,
                    }}
                  >
                    Reference: {ticketId}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3"
                  >
                    <a
                      href={`mailto:biruk5868@gmail.com?subject=${encodeURIComponent(`[Keyadi - ${contactForm.topic}] from ${contactForm.name}`)}&body=${encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\nTopic: ${contactForm.topic}\nReference: ${ticketId}\n\nMessage:\n${contactForm.message}`)}`}
                      className="rounded-full px-6 py-2.5 text-xs font-bold transition-all hover:opacity-90 hover:scale-105 shadow-md flex items-center gap-1.5"
                      style={{ backgroundColor: amber, color: '#100e0b', boxShadow: '0 4px 16px rgba(232,163,61,0.35)' }}
                    >
                      <MailIcon size={14} />
                      <span>Open in Email App</span>
                    </a>
                    <button
                      onClick={resetContactForm}
                      className="rounded-full px-5 py-2.5 text-xs font-semibold transition hover:bg-black/5 dark:hover:bg-white/10 border"
                      style={{ borderColor: hairline, color: ink }}
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {contactError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl text-xs flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                      }}
                    >
                      <AlertTriangleIcon size={14} color="#f87171" className="shrink-0" />
                      <span>{contactError}</span>
                    </motion.div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: inkMuted }}>
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Alex Morgan"
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all border focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(232,163,61,0.15)] hover:border-amber-500/40"
                        style={{
                          backgroundColor: inputBg,
                          borderColor: hairline,
                          color: ink,
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: inkMuted }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="alex@example.com"
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all border focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(232,163,61,0.15)] hover:border-amber-500/40"
                        style={{
                          backgroundColor: inputBg,
                          borderColor: hairline,
                          color: ink,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: inkMuted }}>
                      What's this about?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['General Inquiry', 'Feature Idea', 'Bug Report', 'Partnership'].map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setContactForm({ ...contactForm, topic })}
                          className="px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all text-center hover:scale-[1.03] active:scale-95"
                          style={{
                            backgroundColor: contactForm.topic === topic ? 'rgba(232, 163, 61, 0.22)' : inputBg,
                            borderColor: contactForm.topic === topic ? amber : hairline,
                            color: contactForm.topic === topic ? (isDark ? amber : '#b45309') : inkMuted,
                            boxShadow: contactForm.topic === topic ? '0 0 12px rgba(232,163,61,0.2)' : 'none',
                          }}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: inkMuted }}>
                      Your Message
                    </label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Tell us what's on your mind..."
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all border resize-none focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(232,163,61,0.15)] hover:border-amber-500/40"
                      style={{
                        backgroundColor: inputBg,
                        borderColor: hairline,
                        color: ink,
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-60"
                    style={{ backgroundColor: amber, color: '#100e0b', boxShadow: '0 4px 20px rgba(232,163,61,0.35)' }}
                  >
                    {contactSubmitting ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <SendIcon size={14} color="#100e0b" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Contact Info Cards with Micro-interactions */}
            <div className="lg:col-span-5 space-y-4">
              {/* Email Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="rounded-3xl p-6 shadow-xl backdrop-blur-2xl border cursor-pointer"
                style={{ backgroundColor: cardBg, borderColor: hairline }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'rgba(232, 163, 61, 0.15)',
                      color: amber,
                      border: `1px solid ${amber}33`,
                    }}
                  >
                    <MailIcon size={18} />
                  </motion.div>
                  <div>
                    <h5 className="text-sm font-bold" style={{ color: ink }}>Email Us</h5>
                    <p className="text-[11px]" style={{ color: inkFaint }}>We typically reply within a few hours</p>
                  </div>
                </div>

                <a
                  href="mailto:biruk5868@gmail.com"
                  className="group flex items-center justify-between gap-2 p-3.5 rounded-2xl border transition-all hover:scale-[1.02] hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(232,163,61,0.15)]"
                  style={{ backgroundColor: inputBg, borderColor: hairline }}
                  title="Click to email biruk5868@gmail.com"
                >
                  <span className="text-sm font-mono font-medium text-amber-500 dark:text-amber-400 truncate">
                    biruk5868@gmail.com
                  </span>
                  <span
                    className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all group-hover:scale-105 flex items-center gap-1"
                    style={{ backgroundColor: amber, color: '#100e0b', borderColor: amber }}
                  >
                    <span>Write</span>
                    <span>↗</span>
                  </span>
                </a>
              </motion.div>

              {/* Phone Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="rounded-3xl p-6 shadow-xl backdrop-blur-2xl border cursor-pointer"
                style={{ backgroundColor: cardBg, borderColor: hairline }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <motion.div
                    whileHover={{ y: [-1, 1, -1, 0] }}
                    transition={{ duration: 0.35 }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'rgba(52, 211, 153, 0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(52, 211, 153, 0.33)',
                    }}
                  >
                    <PhoneIcon size={18} />
                  </motion.div>
                  <div>
                    <h5 className="text-sm font-bold" style={{ color: ink }}>Call or WhatsApp</h5>
                    <p className="text-[11px]" style={{ color: inkFaint }}>Available for calls and quick messages</p>
                  </div>
                </div>

                <a
                  href="tel:+251909005450"
                  className="group flex items-center justify-between gap-2 p-3.5 rounded-2xl border transition-all hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                  style={{ backgroundColor: inputBg, borderColor: hairline }}
                  title="Click to call +251 909005450"
                >
                  <span className="text-sm font-mono font-medium text-emerald-500 dark:text-emerald-400 truncate">
                    +251 909 005 450
                  </span>
                  <span
                    className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all group-hover:scale-105 flex items-center gap-1"
                    style={{ backgroundColor: '#10b981', color: '#100e0b', borderColor: '#10b981' }}
                  >
                    <span>Call</span>
                    <span>↗</span>
                  </span>
                </a>
              </motion.div>

              {/* Note */}
              <div
                className="rounded-2xl p-5 border backdrop-blur-xl text-xs leading-relaxed"
                style={{ backgroundColor: cardBg, borderColor: hairline, color: inkMuted }}
              >
                <div className="flex items-center gap-2 mb-2 font-bold text-amber-500 dark:text-amber-400">
                  <SparklesIcon size={14} color={amber} />
                  <span>Hawaz Technologies — Addis Ababa</span>
                </div>
                <p>
                  We're a small team that genuinely cares about building something great. Reach out any time via{' '}
                  <a href="tel:+251909005450" className="text-emerald-500 dark:text-emerald-400 font-semibold underline decoration-emerald-400/40">
                    phone
                  </a>{' '}
                  or{' '}
                  <a href="mailto:biruk5868@gmail.com" className="text-amber-500 dark:text-amber-400 font-semibold underline decoration-amber-400/40">
                    email
                  </a>
                  {' '}— we'd love to hear from you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Premium Footer ── */}
        <footer
          className="mt-auto border-t transition-colors duration-300"
          style={{
            backgroundColor: isDark ? 'rgba(10,9,8,0.98)' : 'rgba(245, 243, 238, 0.98)',
            borderColor: hairline,
          }}
        >
          {/* Top section */}
          <div className="mx-auto max-w-6xl px-6 sm:px-10 pt-14 pb-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

              {/* Brand Column */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <Link to="/" className="flex items-center gap-2.5 group w-fit" aria-label="Keyadi Home">
                  <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <KeyadiLogo size={30} />
                  </div>
                  <KeyadiWordmark height={21} />
                </Link>
                <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: inkMuted }}>
                  Smart place search for real people. Find what you need, get there your way.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href="mailto:biruk5868@gmail.com"
                    className="flex h-8 w-8 items-center justify-center rounded-full border transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:scale-110"
                    style={{ borderColor: hairline, color: inkMuted }}
                    title="Email us"
                  >
                    <MailIcon size={13} />
                  </a>
                  <a
                    href="tel:+251909005450"
                    className="flex h-8 w-8 items-center justify-center rounded-full border transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:scale-110"
                    style={{ borderColor: hairline, color: inkMuted }}
                    title="Call us"
                  >
                    <PhoneIcon size={13} />
                  </a>
                  <a
                    href="#contact"
                    className="flex h-8 w-8 items-center justify-center rounded-full border transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:scale-110"
                    style={{ borderColor: hairline, color: inkMuted }}
                    title="Globe"
                  >
                    <GlobeIcon size={13} />
                  </a>
                </div>
              </div>

              {/* Explore Column */}
              <div className="flex flex-col gap-3">
                <h6 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: amber }}>Explore</h6>
                <nav className="flex flex-col gap-2.5">
                  {[
                    { label: 'How It Works', href: '#directions' },
                    { label: 'Features', href: '#features' },
                    { label: 'Live Demo', href: '#demo' },
                    { label: 'FAQ', href: '#faq' },
                    { label: 'Contact', href: '#contact' },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-xs font-medium transition-all hover:text-amber-500 dark:hover:text-amber-400 hover:translate-x-1 inline-block"
                      style={{ color: inkMuted }}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Account Column */}
              <div className="flex flex-col gap-3">
                <h6 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: amber }}>Account</h6>
                <nav className="flex flex-col gap-2.5">
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="text-xs font-bold transition-all hover:text-amber-500 dark:hover:text-amber-400 hover:translate-x-1 inline-block text-amber-500 dark:text-amber-400"
                    >
                      Open Live Map
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-xs font-medium transition-all hover:text-amber-500 dark:hover:text-amber-400 hover:translate-x-1 inline-block"
                        style={{ color: inkMuted }}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="text-xs font-bold transition-all hover:text-amber-500 dark:hover:text-amber-400 hover:translate-x-1 inline-block"
                        style={{ color: inkMuted }}
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setGetAppOpen(true)}
                    className="text-xs font-medium text-left transition-all hover:text-amber-500 dark:hover:text-amber-400 hover:translate-x-1 inline-block"
                    style={{ color: inkMuted }}
                  >
                    Get the Mobile App
                  </button>
                </nav>
              </div>

              {/* Legal Column */}
              <div className="flex flex-col gap-3">
                <h6 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: amber }}>Legal</h6>
                <nav className="flex flex-col gap-2.5">
                  {[
                    { label: 'Privacy Policy', to: '/privacy' },
                    { label: 'Terms of Service', to: '/terms' },
                    { label: 'Cookie Policy', to: '/cookies' },
                    { label: 'Refund Policy', to: '/refund' },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="text-xs font-medium transition-all hover:text-amber-500 dark:hover:text-amber-400 hover:translate-x-1 inline-block"
                      style={{ color: inkMuted }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="border-t"
            style={{ borderColor: hairline }}
          >
            <div className="mx-auto max-w-6xl px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[11px]" style={{ color: inkFaint }}>
                <span>© {new Date().getFullYear()} Keyadi</span>
                <span style={{ color: hairline }}>·</span>
                <span
                  className="font-semibold tracking-wide"
                  style={{ color: isDark ? 'rgba(232,163,61,0.65)' : 'rgba(180,83,9,0.85)' }}
                >
                  Hawaz Technologies · Addis Ababa, Ethiopia
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: inkFaint }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>All services operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Get The App Modal ── */}
      <GetAppModal
        isOpen={getAppOpen}
        onClose={() => setGetAppOpen(false)}
        isDark={isDark}
      />
    </div>
  )
}