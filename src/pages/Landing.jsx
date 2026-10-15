import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import KeyadiLogo from '../components/KeyadiLogo'
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
} from '../components/Icons'

const QUERY_CHIPS = [
  { label: 'Quiet Cafes', icon: 'cafe', query: 'Quiet specialty cafe with outdoor seating' },
  { label: 'Best Restaurants', icon: 'food', query: 'Authentic local cuisine and dinner' },
  { label: '24/7 Pharmacies', icon: 'pharmacy', query: 'Emergency medical pharmacy open now' },
  { label: 'EV & Fuel', icon: 'gas', query: 'EV charging and gas station nearby' },
  { label: 'Shopping', icon: 'shop', query: 'Supermarket and grocery stores' },
]

const FAQ_ITEMS = [
  {
    q: 'What is Keyadi and how does its Geospatial AI work?',
    a: 'Keyadi translates natural conversational requests (e.g. "quiet cafes with fast wifi" or "24/7 pharmacies open now") into structured, deterministic Overpass QL queries. It fetches verified live geographic data from OpenStreetMap without AI hallucinations or stale directory data.',
    cat: 'Product',
  },
  {
    q: 'Is Keyadi free to use or does it require a paid subscription?',
    a: 'Keyadi is completely free to use. You can search verified venues, compute multimodal travel routes across driving, walking, and cycling, and create an account to save persistent radius trackers with no credit card required.',
    cat: 'Pricing',
  },
  {
    q: 'How does Keyadi calculate routes and travel times?',
    a: 'When you select any place or request directions, Keyadi queries routing profiles in parallel across 3 travel modes (Driving, Walking, and Cycling), displaying real-time distance and estimated minutes with illuminated route lines directly on the map.',
    cat: 'Directions',
  },
  {
    q: 'Can I monitor specific neighborhoods or keywords continuously?',
    a: 'Yes! With Keyadi Live Trackers, you can define a geographic radius around any coordinate or your live GPS position, paired with keyword tags (like artisan bakeries or EV charging). Keyadi monitors the area and alerts you whenever matching establishments update.',
    cat: 'Features',
  },
  {
    q: 'How does Keyadi protect my privacy and GPS location?',
    a: 'Your GPS coordinates are processed exclusively on the client side in your browser to calculate proximity queries. Keyadi does not sell your location history to advertisers, and your saved trackers are securely stored under your authenticated account.',
    cat: 'Security',
  },
  {
    q: 'Can I customize map visuals and coordinate origins?',
    a: 'Yes, inside Settings you can toggle between high-contrast dark vector street cartography and high-resolution satellite imagery, switch between metric (km) and imperial (miles) distance units, and specify a custom fixed pinpoint origin.',
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
  const { settings } = useSettings()
  const isDark = true
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
  const hairline = 'rgba(243,241,236,0.12)'
  const cardBg = 'rgba(18, 16, 13, 0.78)'
  const inputBg = 'rgba(255, 255, 255, 0.04)'
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
      className="relative min-h-screen overflow-x-hidden selection:bg-amber-500/25 selection:text-amber-300"
      style={{
        backgroundColor: '#0a0908',
        color: ink,
        fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── 3D Reactive Three.js Geospatial Environment ── */}
      <Landing3DBackground />

      {/* Subtle radial vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,9,8,0.75)_100%)]"
      />

      {/* Main Foreground Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* ── Top Floating Navigation Island ── */}
        <header className="sticky top-0 z-40 mx-auto w-full max-w-6xl px-4 py-3 sm:px-10 sm:py-5">
          <div
            className="flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6 sm:py-3.5 shadow-2xl backdrop-blur-3xl transition-all"
            style={{
              backgroundColor: 'rgba(14, 12, 10, 0.85)',
              border: `1px solid ${hairline}`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {/* Logo with 3D hover scale */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <KeyadiLogo size={32} />
              </div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight" style={{ color: ink }}>
                Keyadi
              </span>
            </Link>

            {/* Nav links with animated bottom indicator */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-semibold" style={{ color: inkMuted }}>
              <a href="#directions" className="transition-colors hover:text-amber-400">Directions</a>
              <a href="#features" className="transition-colors hover:text-amber-400">Features</a>
              <a href="#demo" className="transition-colors hover:text-amber-400">Live Terminal</a>
              <a href="#faq" className="transition-colors hover:text-amber-400">FAQ</a>
              <a href="#contact" className="transition-colors hover:text-amber-400">Contact</a>
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

              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden h-8 w-8 items-center justify-center rounded-full text-sm hover:bg-white/10 transition shrink-0"
                style={{ color: ink }}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
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
                  backgroundColor: 'rgba(16, 14, 11, 0.96)',
                  borderColor: hairline,
                }}
              >
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
              className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.08] text-[#f3f1ec]"
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
            Translate natural conversational intent into verified OpenStreetMap vectors.
            Compare real-time side-by-side drive, walk, and cycle routes with illuminated 3D road telemetry.
          </motion.p>

          {/* Dynamic Suggestion Chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
          >
            <span className="text-xs font-bold tracking-wide mr-1 uppercase text-[#e8a33d]/70">
              Try searching:
            </span>
            {QUERY_CHIPS.map((chip, idx) => (
              <button
                key={chip.label}
                onClick={() => setActiveChip(idx)}
                className="group flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-xl transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: activeChip === idx ? 'rgba(232, 163, 61, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${activeChip === idx ? amber : 'rgba(255, 255, 255, 0.1)'}`,
                  color: activeChip === idx ? '#ffd166' : inkMuted,
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
              <span>{user ? 'Open Live Map Console' : 'Start Exploring Free'}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>

            <Link
              to={user ? '/dashboard' : '/login'}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold backdrop-blur-2xl border transition-all hover:scale-105 hover:bg-white/10"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: hairline,
                color: ink,
              }}
            >
              <SearchIcon size={15} color={amber} />
              <span>{user ? 'Explore Live Cartography' : 'Sign In To Explore'}</span>
            </Link>
          </motion.div>
        </section>

        {/* ── 3D Interactive Hero Map Showcase ── */}
        <section id="directions" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-10">
          <InteractiveMap3DShowcase user={user} isDark={isDark} />
        </section>

        {/* ── 3D Features Pillars Grid (TiltCard3D) ── */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-20 sm:px-10 border-t border-white/10">
          <ScrollRevealHeading
            tag="Architected For Local Intelligence"
            title="Everything You Need To Navigate With Precision"
            subtitle="Engineered with deterministic GIS Overpass algorithms, multimodal routing engines, and privacy-first client execution."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <SparklesIcon size={22} color={amber} />,
                title: 'Natural Conversational Search',
                desc: 'Describe what you need in plain speech. Keyadi synthesizes natural queries into verified Overpass queries without AI hallucinated coordinates.',
                badge: 'Verified Overpass QL',
                color: '#e8a33d',
              },
              {
                icon: <ClockIcon size={22} color="#38bdf8" />,
                title: 'Multimodal Live Routing',
                desc: 'Instant side-by-side computation of driving, walking, and cycling routes with illuminated vectors and real-time travel durations.',
                badge: 'OSRM Multimodal',
                color: '#38bdf8',
              },
              {
                icon: <PinIcon size={22} color="#2dd4bf" />,
                title: 'Real-Time Radar Trackers',
                desc: 'Set continuous geographic radius buffers around any coordinate or live GPS location with custom alerts for new venue updates.',
                badge: 'Geo-Radius Alerting',
                color: '#2dd4bf',
              },
              {
                icon: <GlobeIcon size={22} color="#a78bfa" />,
                title: 'High-Res 3D & Vector Maps',
                desc: 'Seamlessly switch between high-contrast dark vector street cartography and high-resolution satellite imagery in any quadrant.',
                badge: 'Vector & Satellite',
                color: '#a78bfa',
              },
              {
                icon: <NavigationIcon size={22} color="#f43f5e" />,
                title: 'Custom Origin Telemetry',
                desc: 'Designate any custom coordinate origin or track your dynamic mobile location with millimeter GPS telemetry and proximity filters.',
                badge: 'Live GPS Pinpoint',
                color: '#f43f5e',
              },
              {
                icon: <CheckCircleIcon size={22} color="#34d399" />,
                title: 'Zero Tracking Privacy Guarantee',
                desc: 'Your GPS calculations run exclusively in client-side memory. Your routes and location history are never sold, recorded, or profiled.',
                badge: '100% Client-Side',
                color: '#34d399',
              },
            ].map((feat, i) => (
              <TiltCard3D key={i} maxTilt={10}>
                <div
                  className="group relative h-full rounded-3xl p-7 shadow-xl backdrop-blur-2xl border transition-all duration-300 [transform-style:preserve-3d]"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: 'rgba(255, 255, 255, 0.09)',
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
                    className="text-lg font-extrabold mb-2 text-white group-hover:text-amber-400 transition-colors [transform:translateZ(30px)]"
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
              tag="Live Geospatial Console"
              title="Experience The Query Engine"
              subtitle="Watch plain-English search terms compile instantly into deterministic OpenStreetMap Overpass queries."
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
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Powered By Leading Map & Cloud Technologies
            </h4>
          </div>

          {/* Marquee Ticker Track with Gradient Edge Masks */}
          <div
            className="relative overflow-hidden rounded-3xl border py-5 backdrop-blur-2xl shadow-2xl"
            style={{
              backgroundColor: 'rgba(18, 16, 13, 0.75)',
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
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: hairline,
                  }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {comp.icon}
                  </div>
                  <span className="text-sm font-bold tracking-tight whitespace-nowrap text-white">
                    {comp.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Frequently Asked Questions (FAQ) Section ── */}
        <section id="faq" className="mx-auto max-w-6xl px-6 py-20 sm:px-10 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <ScrollRevealHeading
              tag="Documentation & FAQ"
              title="Frequently Asked Questions"
              subtitle="Everything you need to know about Keyadi's geospatial AI, multi-modal routing, and privacy."
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
        <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:px-10 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <ScrollRevealHeading
              tag="Get in Touch"
              title="Contact the Keyadi Team"
              subtitle="Have questions, feedback, bug reports, or partnership opportunities? Reach out directly to our engineering team."
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Column: Workable Contact Form */}
            <div
              className="lg:col-span-7 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-2xl border"
              style={{ backgroundColor: cardBg, borderColor: hairline }}
            >
              {contactSubmitted ? (
                <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      color: '#22c55e',
                    }}
                  >
                    <CheckCircleIcon size={28} />
                  </div>
                  <h4 className="text-xl font-bold mb-1.5 text-white">
                    Message Prepared & Logged!
                  </h4>
                  <p className="text-xs sm:text-sm max-w-md mx-auto mb-4" style={{ color: inkMuted }}>
                    Thank you <span className="font-semibold text-amber-400">{contactForm.name}</span>. Your ticket has been logged and opened to send to <span className="font-semibold text-amber-400">biruk5868@gmail.com</span>.
                  </p>
                  <div
                    className="inline-block px-4 py-2 rounded-xl text-xs font-mono font-bold mb-6"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${hairline}`,
                      color: amber,
                    }}
                  >
                    Ticket ID: {ticketId}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`mailto:biruk5868@gmail.com?subject=${encodeURIComponent(`[Keyadi - ${contactForm.topic}] from ${contactForm.name}`)}&body=${encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\nTopic: ${contactForm.topic}\nTicket ID: ${ticketId}\n\nMessage:\n${contactForm.message}`)}`}
                      className="rounded-full px-6 py-2.5 text-xs font-bold transition hover:opacity-90 shadow-md flex items-center gap-1.5"
                      style={{ backgroundColor: amber, color: '#100e0b' }}
                    >
                      <MailIcon size={14} />
                      <span>Send to biruk5868@gmail.com</span>
                    </a>
                    <button
                      onClick={resetContactForm}
                      className="rounded-full px-5 py-2.5 text-xs font-semibold transition hover:bg-white/10 border"
                      style={{ borderColor: hairline, color: ink }}
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {contactError && (
                    <div
                      className="p-3 rounded-xl text-xs flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                      }}
                    >
                      <span>⚠</span>
                      <span>{contactError}</span>
                    </div>
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
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition border focus:border-amber-400"
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
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition border focus:border-amber-400"
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
                      Subject / Topic
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['General Inquiry', 'Feature Idea', 'Bug Report', 'Partnership'].map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setContactForm({ ...contactForm, topic })}
                          className="px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all text-center"
                          style={{
                            backgroundColor: contactForm.topic === topic ? 'rgba(232, 163, 61, 0.22)' : inputBg,
                            borderColor: contactForm.topic === topic ? amber : hairline,
                            color: contactForm.topic === topic ? amber : inkMuted,
                          }}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: inkMuted }}>
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Describe what you need or how we can help..."
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition border resize-none focus:border-amber-400"
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
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-xs font-bold transition-all hover:scale-105 shadow-xl disabled:opacity-60"
                    style={{ backgroundColor: amber, color: '#100e0b' }}
                  >
                    {contactSubmitting ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Sending message...</span>
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

            {/* Right Column: Direct Info Cards */}
            <div className="lg:col-span-5 space-y-4">
              {/* Direct Email Card */}
              <div
                className="rounded-3xl p-6 shadow-xl backdrop-blur-2xl border transition-all hover:border-amber-500/40"
                style={{ backgroundColor: cardBg, borderColor: hairline }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'rgba(232, 163, 61, 0.15)',
                      color: amber,
                      border: `1px solid ${amber}33`,
                    }}
                  >
                    <MailIcon size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Direct Email</h5>
                    <p className="text-[11px]" style={{ color: inkFaint }}>Direct inbox for inquiries & feedback</p>
                  </div>
                </div>

                <a
                  href="mailto:biruk5868@gmail.com"
                  className="flex items-center justify-between gap-2 p-3.5 rounded-2xl border transition-all hover:scale-[1.02] hover:border-amber-500/50 group"
                  style={{ backgroundColor: inputBg, borderColor: hairline }}
                  title="Click to email biruk5868@gmail.com"
                >
                  <span className="text-sm font-mono font-medium text-amber-400 truncate">
                    biruk5868@gmail.com
                  </span>
                  <span
                    className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition group-hover:opacity-90 flex items-center gap-1"
                    style={{ backgroundColor: amber, color: '#100e0b', borderColor: amber }}
                  >
                    <span>Email</span>
                    <span>↗</span>
                  </span>
                </a>
              </div>

              {/* Direct Phone & WhatsApp Card */}
              <div
                className="rounded-3xl p-6 shadow-xl backdrop-blur-2xl border transition-all hover:border-emerald-500/40"
                style={{ backgroundColor: cardBg, borderColor: hairline }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'rgba(52, 211, 153, 0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(52, 211, 153, 0.33)',
                    }}
                  >
                    <PhoneIcon size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Direct Phone & WhatsApp</h5>
                    <p className="text-[11px]" style={{ color: inkFaint }}>Direct voice calls & messaging</p>
                  </div>
                </div>

                <a
                  href="tel:+251909005450"
                  className="flex items-center justify-between gap-2 p-3.5 rounded-2xl border transition-all hover:scale-[1.02] hover:border-emerald-500/50 group"
                  style={{ backgroundColor: inputBg, borderColor: hairline }}
                  title="Click to call +251 909005450"
                >
                  <span className="text-sm font-mono font-medium text-emerald-400 truncate">
                    +251 909005450
                  </span>
                  <span
                    className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition group-hover:opacity-90 flex items-center gap-1"
                    style={{ backgroundColor: '#10b981', color: '#100e0b', borderColor: '#10b981' }}
                  >
                    <span>Call / SMS</span>
                    <span>↗</span>
                  </span>
                </a>
              </div>

              {/* Direct Operator Badge */}
              <div
                className="rounded-2xl p-5 border backdrop-blur-xl text-xs leading-relaxed"
                style={{ backgroundColor: cardBg, borderColor: hairline, color: inkMuted }}
              >
                <div className="flex items-center gap-2 mb-2 font-bold text-amber-400">
                  <SparklesIcon size={14} color={amber} />
                  <span>Support & Inquiries — Hawaz Technologies</span>
                </div>
                <p>
                  For questions, feedback, partnerships, or technical support, reach out to the Keyadi team via phone at{' '}
                  <a href="tel:+251909005450" className="text-emerald-400 font-semibold underline decoration-emerald-400/40">
                    +251 909005450
                  </a>{' '}
                  or via email at{' '}
                  <a href="mailto:biruk5868@gmail.com" className="text-amber-400 font-semibold underline decoration-amber-400/40">
                    biruk5868@gmail.com
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Modern Minimalist Footer ── */}
        <footer className="mt-auto border-t py-10 px-6 sm:px-10 border-white/10">
          <div className="mx-auto max-w-6xl flex flex-col gap-6 text-xs" style={{ color: inkFaint }}>
            {/* Top row: Brand + Nav links */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                <div className="flex items-center gap-2.5">
                  <KeyadiLogo size={24} />
                  <span className="font-extrabold text-white text-sm">Keyadi</span>
                  <span>·</span>
                  <span>© {new Date().getFullYear()}</span>
                </div>
                <span className="hidden sm:inline" style={{ color: hairline }}>•</span>
                <span className="font-bold tracking-wide text-amber-400">
                  Built by HAWAZ TECHNOLOGIES
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
                <a href="#directions" className="hover:text-amber-400 transition">Directions</a>
                <a href="#features" className="hover:text-amber-400 transition">Features</a>
                <a href="#demo" className="hover:text-amber-400 transition">Live Terminal</a>
                <a href="#faq" className="hover:text-amber-400 transition">FAQ</a>
                <a href="#contact" className="hover:text-amber-400 transition">Contact</a>
                {user ? (
                  <Link to="/dashboard" className="hover:text-amber-400 transition font-bold text-amber-400">Live Map</Link>
                ) : (
                  <>
                    <Link to="/login" className="hover:text-amber-400 transition">Sign in</Link>
                    <Link to="/signup" className="hover:text-amber-400 transition font-bold text-amber-400">Create account</Link>
                  </>
                )}
              </div>
            </div>

            {/* Legal links row */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-white/5">
              <Link to="/privacy" className="hover:text-amber-400 transition">Privacy Policy</Link>
              <span style={{ color: hairline }}>·</span>
              <Link to="/terms" className="hover:text-amber-400 transition">Terms of Service</Link>
              <span style={{ color: hairline }}>·</span>
              <Link to="/cookies" className="hover:text-amber-400 transition">Cookie Policy</Link>
              <span style={{ color: hairline }}>·</span>
              <Link to="/refund" className="hover:text-amber-400 transition">Refund Policy</Link>
            </div>

            {/* Business details */}
            <div className="text-center text-[10px] leading-relaxed" style={{ color: inkFaint }}>
              <p>
                Hawaz Technologies · Addis Ababa, Ethiopia ·{' '}
                <a href="mailto:biruk5868@gmail.com" className="text-amber-400/80 hover:text-amber-400 transition">biruk5868@gmail.com</a>
                {' '}·{' '}
                <a href="tel:+251909005450" className="text-amber-400/80 hover:text-amber-400 transition">+251 909 005 450</a>
              </p>
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