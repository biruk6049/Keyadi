import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import AuraBackground from '../components/AuraBackground'
import KeyadiLogo from '../components/KeyadiLogo'
import GetAppModal from '../components/GetAppModal'
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
} from '../components/Icons'

const SCAN_TERMS = [
  'Quiet cafe with fast wifi',
  'Pharmacy open right now',
  'Artisan bakery near Bole',
  'Hotel with mountain view',
  'Hardware store with cement',
]

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
    name: 'Supabase',
    role: 'Database & Realtime Auth',
    badge: 'PostgreSQL Core',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21.362 9.354H12V.304a.6.6 0 0 0-1.025-.424L.65 10.373a.6.6 0 0 0 .425 1.023H10.3v9.05a.6.6 0 0 0 1.025.424l10.325-10.493a.6.6 0 0 0-.288-1.023z" fill="#3ECF8E" />
      </svg>
    ),
  },
  {
    name: 'Mapbox',
    role: 'Vector Cartography & GL',
    badge: 'Mapbox GL JS',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4264FB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Google Maps',
    role: 'Satellite & Geocoding',
    badge: 'Global Coverage',
    icon: (
      <svg width="20" height="22" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z"/>
        <circle cx="12" cy="10" r="3.5" fill="#fff"/>
        <circle cx="12" cy="10" r="2" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    name: 'OpenStreetMap',
    role: 'Open Geospatial Core',
    badge: 'Verified POIs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#7EBC6F" strokeWidth="2"/>
        <path d="M7 15l4-6 3 4 3-5" stroke="#7EBC6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Overpass API',
    role: 'Geospatial QL Engine',
    badge: 'Live Overpass Turbo',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="#F59E0B" strokeWidth="2" fill="#F59E0B" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'React 18',
    role: 'Reactive Framework',
    badge: 'Concurrent Core',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(30 12 12)"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(90 12 12)"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(150 12 12)"/>
        <circle cx="12" cy="12" r="2" fill="#61DAFB"/>
      </svg>
    ),
  },
  {
    name: 'Vite',
    role: 'Lightning Bundler',
    badge: 'Next-Gen Build',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M22 4L12 22 2 4l9 2.5L12 2l1 4.5L22 4z" stroke="#BD34FE" strokeWidth="1.8" fill="#BD34FE" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    role: 'Modern Utility Styling',
    badge: 'Hardware Accelerated',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 6c-2.4 0-3.9 1.2-4.5 3.6 1-.6 2.1-.8 3.3-.6 1.4.2 2.4 1.2 3.5 2.3C16.1 13 18.2 15 22 15c2.4 0 3.9-1.2 4.5-3.6-1 .6-2.1.8-3.3.6-1.4-.2-2.4-1.2-3.5-2.3C17.9 8 15.8 6 12 6zM2 15c2.4 0 3.9-1.2 4.5-3.6-1 .6-2.1.8-3.3.6-1.4-.2-2.4-1.2-3.5-2.3C1.9 8-.2 6-4 6c-2.4 0-3.9 1.2-4.5 3.6 1-.6 2.1-.8 3.3-.6 1.4.2 2.4 1.2 3.5 2.3C-6.1 13-4 15-.2 15z" fill="#38BDF8"/>
      </svg>
    ),
  },
]

function useTypewriter(words, { typeSpeed = 65, deleteSpeed = 35, pause = 1600 } = {}) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[index % words.length]
    let timeout

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text === '') {
      setDeleting(false)
      setIndex((i) => i + 1)
    } else {
      timeout = setTimeout(
        () => {
          setText((t) =>
            deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)
          )
        },
        deleting ? deleteSpeed : typeSpeed
      )
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause])

  return text
}

export default function Landing() {
  const { settings } = useSettings()
  const isDark = true
  const scanText = useTypewriter(SCAN_TERMS)
  const [activeChip, setActiveChip] = useState(0)

  // Scroll reveal state for trusted partners
  const [partnersVisible, setPartnersVisible] = useState(false)
  const partnersRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPartnersVisible(true)
        }
      },
      { threshold: 0.15 }
    )
    if (partnersRef.current) {
      observer.observe(partnersRef.current)
    }
    return () => observer.disconnect()
  }, [])

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
  const cardBg = isDark ? 'rgba(18, 16, 13, 0.75)' : 'rgba(255, 255, 255, 0.85)'
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.90)'
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
      className="relative min-h-screen overflow-x-hidden selection:bg-amber-500/20 selection:text-amber-400"
      style={{
        backgroundColor: isDark ? '#0e0d0b' : '#f8f7f4',
        color: ink,
        fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <AuraBackground isDark={isDark} />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* ── Top Floating Navigation Bar ── */}
        <header className="sticky top-0 z-40 mx-auto w-full max-w-6xl px-3 py-3 sm:px-10 sm:py-5">
          <div
            className="flex items-center justify-between rounded-full px-3.5 py-2 sm:px-5 sm:py-3 shadow-2xl backdrop-blur-2xl transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(14, 13, 11, 0.82)' : 'rgba(255, 255, 255, 0.88)',
              border: `1px solid ${hairline}`,
            }}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <KeyadiLogo size={32} />
              <span className="text-base sm:text-lg font-bold tracking-tight" style={{ color: ink }}>
                Keyadi
              </span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: inkMuted }}>
              <a href="#features" className="transition-colors hover:text-amber-400">Features</a>
              <a href="#directions" className="transition-colors hover:text-amber-400">Directions</a>
              <a href="#demo" className="transition-colors hover:text-amber-400">Live Demo</a>
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

              <Link
                to="/login"
                className="hidden sm:inline-block rounded-full px-3.5 py-2 text-xs font-semibold transition hover:opacity-80 whitespace-nowrap"
                style={{ color: ink }}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="hidden sm:flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-transform hover:scale-105 shadow-md whitespace-nowrap"
                style={{ backgroundColor: amber, color: '#100e0b' }}
              >
                <SparklesIcon size={12} color="#100e0b" />
                <span className="whitespace-nowrap">Create Account</span>
              </Link>

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
          {mobileMenuOpen && (
            <div
              className="mt-3 rounded-2xl p-4 md:hidden shadow-2xl backdrop-blur-2xl border flex flex-col gap-2.5 text-sm animate-in fade-in duration-200"
              style={{
                backgroundColor: isDark ? 'rgba(18, 16, 13, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: hairline,
              }}
            >
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:text-amber-400 hover:bg-white/5 transition"
                style={{ color: ink }}
              >
                Features
              </a>
              <a
                href="#directions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:text-amber-400 hover:bg-white/5 transition"
                style={{ color: ink }}
              >
                Directions
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:text-amber-400 hover:bg-white/5 transition"
                style={{ color: ink }}
              >
                Live Demo
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
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-xl text-center text-xs font-semibold hover:bg-white/5 transition"
                  style={{ color: ink }}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2.5 rounded-xl text-center text-xs font-bold shadow-md transition hover:opacity-90 flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: amber, color: '#100e0b' }}
                >
                  <SparklesIcon size={12} color="#100e0b" />
                  <span>Create Account</span>
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* ── Hero Section ── */}
        <section className="mx-auto max-w-6xl px-6 pt-10 pb-16 text-center sm:px-10 sm:pt-16">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-xl mb-6 shadow-md"
            style={{
              backgroundColor: 'rgba(232, 163, 61, 0.12)',
              color: amber,
              border: `1px solid ${amber}44`,
            }}
          >
            <SparklesIcon size={13} color={amber} />
            <span className="tracking-wide uppercase text-[11px]">Smart Place Search & Live Directions</span>
          </div>

          {/* Main Title */}
          <h1
            className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.08]"
            style={{ color: ink }}
          >
            Explore Any City With{' '}
            <span
              className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent"
              style={{
                textShadow: '0 0 40px rgba(232, 163, 61, 0.25)',
              }}
            >
              Smart Directions.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed"
            style={{ color: inkMuted }}
          >
            Discover verified venues with natural language, compare side-by-side travel times for drive, walk, and cycle, and monitor places in real time.
          </p>

          {/* Dynamic Suggestion Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <span className="text-xs font-semibold mr-1" style={{ color: inkFaint }}>
              Try searching:
            </span>
            {QUERY_CHIPS.map((chip, idx) => (
              <button
                key={chip.label}
                onClick={() => setActiveChip(idx)}
                className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: activeChip === idx ? 'rgba(232, 163, 61, 0.18)' : isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                  border: `1px solid ${activeChip === idx ? amber : hairline}`,
                  color: activeChip === idx ? amber : inkMuted,
                  boxShadow: activeChip === idx ? '0 0 14px rgba(232, 163, 61, 0.2)' : 'none',
                }}
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold shadow-xl transition-all hover:scale-105"
              style={{
                backgroundColor: amber,
                color: '#100e0b',
                boxShadow: '0 4px 24px rgba(232, 163, 61, 0.35)',
              }}
            >
              <span>Create Account Free</span>
              <span>→</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold backdrop-blur-xl border transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: hairline,
                color: ink,
              }}
            >
              <SearchIcon size={15} color={amber} />
              <span>Explore Live Map</span>
            </Link>
          </div>
        </section>

        {/* ── 3D Perspective Hero Map Showcase ── */}
        <section id="directions" className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10">
          <div className="relative mx-auto max-w-5xl [perspective:1400px]">
            <div
              className="relative overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all duration-700 [transform:rotateX(10deg)_scale(0.98)] hover:[transform:rotateX(2deg)_scale(1)]"
              style={{
                backgroundColor: isDark ? 'rgba(14, 13, 11, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: hairline,
                minHeight: '480px',
              }}
            >
              {/* Fake Map Grid Texture & Ambient Glowing Elements */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e8a33d_1px,transparent_1px)] [background-size:24px_24px]" />
              
              {/* Glowing Roads SVG */}
              <svg className="absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="none" viewBox="0 0 800 480">
                <defs>
                  <filter id="hero-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path d="M0,240 Q300,200 800,260" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <path d="M400,0 Q360,200 450,480" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
                <path d="M100,480 Q250,300 700,100" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                <path
                  d="M180,360 Q340,320 420,240 T650,180"
                  stroke="#e8a33d"
                  strokeWidth="8"
                  strokeOpacity="0.4"
                  filter="url(#hero-glow)"
                />
                <path
                  d="M180,360 Q340,320 420,240 T650,180"
                  stroke="#fbbf24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  fill="none"
                />
              </svg>

              {/* Floating Realistic Marker Pins on Map */}
              <div className="absolute top-[38%] left-[22%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="rounded-2xl px-3 py-1.5 shadow-xl text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 mb-1.5 transition-transform group-hover:scale-110"
                     style={{ backgroundColor: cardBg, borderColor: amber, color: amber }}>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Origin (Bole)</span>
                </div>
                <div className="h-4 w-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center" style={{ backgroundColor: amber }}>
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              </div>

              <div className="absolute top-[37%] right-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="rounded-2xl px-3 py-1.5 shadow-xl text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 mb-1.5 transition-transform group-hover:scale-110"
                     style={{ backgroundColor: cardBg, borderColor: '#38bdf8', color: '#38bdf8' }}>
                  <span>Tomoca Specialty Coffee</span>
                </div>
                <div className="h-4 w-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center bg-sky-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              </div>

              {/* Glassmorphic Venue Preview Card Floating on Map */}
              <div
                className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-8 sm:w-96 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl border transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: cardBg,
                  borderColor: hairline,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 mb-1">
                      <SparklesIcon size={12} color={amber} />
                      <span>98% Semantic Match</span>
                    </div>
                    <h4 className="text-base font-bold" style={{ color: ink }}>
                      Tomoca Specialty Roastery
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: inkMuted }}>
                      Wabi Shebelle Zone · Artisan Espresso & Fast Wi-Fi
                    </p>
                  </div>
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: 'rgba(232, 163, 61, 0.15)', color: amber, border: `1px solid ${amber}44` }}
                  >
                    ★ 4.9
                  </div>
                </div>

                {/* Multimodal Travel Time Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3" style={{ borderColor: hairline }}>
                  <div className="rounded-xl p-2 text-center" style={{ backgroundColor: 'rgba(232, 163, 61, 0.08)' }}>
                    <div className="text-[10px] uppercase font-bold text-amber-400">Drive</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: ink }}>7 mins</div>
                    <div className="text-[10px]" style={{ color: inkFaint }}>3.2 km</div>
                  </div>
                  <div className="rounded-xl p-2 text-center" style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)' }}>
                    <div className="text-[10px] uppercase font-bold text-sky-400">Walk</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: ink }}>22 mins</div>
                    <div className="text-[10px]" style={{ color: inkFaint }}>2.1 km</div>
                  </div>
                  <div className="rounded-xl p-2 text-center" style={{ backgroundColor: 'rgba(45, 212, 191, 0.08)' }}>
                    <div className="text-[10px] uppercase font-bold text-teal-400">Cycle</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: ink }}>11 mins</div>
                    <div className="text-[10px]" style={{ color: inkFaint }}>2.8 km</div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="mt-3 flex items-center justify-between text-[11px]" style={{ color: inkFaint }}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 font-medium">Open Now</span> · Closes 10:00 PM
                  </span>
                  <Link to="/dashboard" className="font-semibold text-amber-400 hover:underline">
                    View Live Route →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Pillars Grid ── */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-20 sm:px-10 border-t" style={{ borderColor: hairline }}>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: amber }}>
              Architected For Local Intelligence
            </h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: ink }}>
              Everything you need to navigate and discover with confidence.
            </h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <SparklesIcon size={20} color={amber} />,
                title: 'Natural Place Search',
                desc: 'Search naturally in plain words. Keyadi understands what you need and queries map data to find verified local spots.',
              },
              {
                icon: <ClockIcon size={20} color="#38bdf8" />,
                title: 'Live Travel Times',
                desc: 'Real-time calculation of driving, walking, and cycling travel times with illuminated route lines rendered directly on the map.',
              },
              {
                icon: <PinIcon size={20} color="#2dd4bf" />,
                title: 'Saved Places & Spots',
                desc: 'Save custom locations and favorite spots to quickly pull up directions and details whenever you need them.',
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="group rounded-3xl p-6 transition-all hover:scale-[1.02] shadow-xl backdrop-blur-xl border"
                style={{ backgroundColor: cardBg, borderColor: hairline }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${hairline}` }}
                >
                  {feat.icon}
                </div>
                <h4 className="text-lg font-bold mb-2" style={{ color: ink }}>
                  {feat.title}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: inkMuted }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Interactive Scanning Section ── */}
        <section id="demo" className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
          <div
            className="rounded-3xl p-8 sm:p-12 text-center border shadow-2xl backdrop-blur-2xl"
            style={{ backgroundColor: cardBg, borderColor: hairline }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: ink }}>
              Ready to explore your surroundings?
            </h3>
            <p className="text-sm sm:text-base max-w-xl mx-auto mb-8" style={{ color: inkMuted }}>
              Keyadi is completely free to use. Test live local queries in seconds with instant geospatial synthesis.
            </p>

            {/* Live Typing Input Box */}
            <div className="mx-auto max-w-md mb-8">
              <div
                className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-lg backdrop-blur-xl"
                style={{ borderColor: amber + '55', backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)' }}
              >
                <SearchIcon size={16} color={amber} />
                <span className="text-sm font-medium" style={{ color: ink }}>
                  {scanText}
                  <span className="keyadi-cursor ml-0.5" style={{ color: amber }}>|</span>
                </span>
              </div>
            </div>

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold shadow-xl transition-all hover:scale-105"
              style={{ backgroundColor: amber, color: '#100e0b' }}
            >
              <span>Create Account Free</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* ── Motionary Trusted Companies & Infrastructure ── */}
        <section
          ref={partnersRef}
          className={`mx-auto w-full max-w-6xl px-6 pb-14 sm:px-10 transition-all duration-700 ease-out ${
            partnersVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          <div className="text-center mb-6">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-sm"
              style={{
                backgroundColor: 'rgba(232, 163, 61, 0.12)',
                color: amber,
                border: `1px solid ${amber}33`,
              }}
            >
              <SparklesIcon size={12} color={amber} />
              <span>Trusted Ecosystem & Cloud Partners</span>
            </span>
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: ink }}>
              Built With & Trusted Alongside Leading Technologies
            </h4>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: inkMuted }}>
              Engineered with world-class geospatial, database, cartography, and cloud platforms.
            </p>
          </div>

          {/* Marquee Ticker Track with Gradient Edge Masks */}
          <div
            className="relative overflow-hidden rounded-3xl border py-5 backdrop-blur-xl shadow-xl transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(18, 16, 13, 0.65)' : 'rgba(255, 255, 255, 0.75)',
              borderColor: hairline,
              maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            }}
          >
            <div className="animate-keyadi-marquee flex items-center gap-4">
              {/* Double array for infinite seamless looping */}
              {[...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES].map((comp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl px-5 py-3 border transition-all duration-200 hover:scale-105 hover:border-amber-500/50 group cursor-default shrink-0 shadow-md"
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                    borderColor: hairline,
                  }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {comp.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-tight" style={{ color: ink }}>
                        {comp.name}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'rgba(232, 163, 61, 0.12)',
                          color: amber,
                        }}
                      >
                        {comp.badge}
                      </span>
                    </div>
                    <div className="text-[11px]" style={{ color: inkMuted }}>
                      {comp.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Frequently Asked Questions (FAQ) Section ── */}
        <section id="faq" className="mx-auto max-w-6xl px-6 py-16 sm:px-10 border-t" style={{ borderColor: hairline }}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: 'rgba(232,163,61,0.12)', color: amber, border: `1px solid ${amber}33` }}
            >
              FAQ & Documentation
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: ink }}>
              Frequently Asked Questions
            </h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: inkMuted }}>
              Everything you need to know about Keyadi's geospatial AI, multi-modal routing, and privacy.
            </p>

            {/* Filter Category Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {['All', 'Product', 'Directions', 'Features', 'Pricing', 'Security'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqFilter(cat)}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: faqFilter === cat ? amber : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
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
                  className="rounded-2xl border backdrop-blur-xl transition-all overflow-hidden"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: isOpen ? amber + '66' : hairline,
                    boxShadow: isOpen ? '0 4px 20px rgba(232, 163, 61, 0.12)' : 'none',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base transition-colors hover:text-amber-400"
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
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t" style={{ borderColor: hairline, color: inkMuted }}>
                      <p>{faq.a}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(232,163,61,0.12)', color: amber }}>
                          {faq.cat}
                        </span>
                        <span className="text-[11px]" style={{ color: inkFaint }}>· Verified Documentation</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Workable Contact & Support Section ── */}
        <section id="contact" className="mx-auto max-w-6xl px-6 py-16 sm:px-10 border-t" style={{ borderColor: hairline }}>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: 'rgba(45,212,191,0.12)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.3)' }}
            >
              Get in Touch
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: ink }}>
              Contact the Keyadi Team
            </h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: inkMuted }}>
              Have questions, feedback, bug reports, or feature ideas? Send us a message and our team will get back to you promptly.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Column: Workable Contact Form */}
            <div
              className="lg:col-span-7 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl border"
              style={{ backgroundColor: cardBg, borderColor: hairline }}
            >
              {contactSubmitted ? (
                <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#22c55e' }}
                  >
                    <CheckCircleIcon size={28} />
                  </div>
                  <h4 className="text-xl font-bold mb-1.5" style={{ color: ink }}>
                    Message Prepared & Logged!
                  </h4>
                  <p className="text-xs sm:text-sm max-w-md mx-auto mb-4" style={{ color: inkMuted }}>
                    Thank you <span className="font-semibold text-amber-400">{contactForm.name}</span>. Your message has been logged and opened to send to <span className="font-semibold text-amber-400">biruk5868@gmail.com</span>.
                  </p>
                  <div
                    className="inline-block px-4 py-2 rounded-xl text-xs font-mono font-bold mb-6"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: `1px solid ${hairline}`, color: amber }}
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
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}
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
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition border focus:border-amber-500"
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
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition border focus:border-amber-500"
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
                          className="px-2.5 py-2 rounded-xl text-[11px] font-medium border transition-all text-center"
                          style={{
                            backgroundColor: contactForm.topic === topic ? 'rgba(232, 163, 61, 0.16)' : inputBg,
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
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition border focus:border-amber-500 resize-none"
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
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-bold transition-all hover:scale-105 shadow-xl disabled:opacity-60"
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
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(232, 163, 61, 0.15)', color: amber, border: `1px solid ${amber}33` }}
                  >
                    <MailIcon size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold" style={{ color: ink }}>Direct Email</h5>
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
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.33)' }}
                  >
                    <PhoneIcon size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold" style={{ color: ink }}>Direct Phone & WhatsApp</h5>
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
                className="rounded-2xl p-4 border backdrop-blur-xl text-xs leading-relaxed"
                style={{ backgroundColor: cardBg, borderColor: hairline, color: inkMuted }}
              >
                <div className="flex items-center gap-2 mb-1.5 font-semibold text-amber-400">
                  <SparklesIcon size={13} color={amber} />
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
        <footer className="mt-auto border-t py-8 px-6 sm:px-10" style={{ borderColor: hairline }}>
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ color: inkFaint }}>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <KeyadiLogo size={22} />
                <span className="font-semibold" style={{ color: ink }}>Keyadi</span>
                <span>·</span>
                <span>© {new Date().getFullYear()}</span>
              </div>
              <span className="hidden sm:inline" style={{ color: hairline }}>•</span>
              <span className="font-semibold tracking-wide" style={{ color: amber }}>
                Built by HAWAZ TECHNOLOGIES
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
              <a href="#features" className="hover:text-amber-400 transition">Features</a>
              <a href="#directions" className="hover:text-amber-400 transition">Directions</a>
              <a href="#faq" className="hover:text-amber-400 transition">FAQ</a>
              <a href="#contact" className="hover:text-amber-400 transition">Contact</a>
              <Link to="/login" className="hover:text-amber-400 transition">Sign in</Link>
              <Link to="/signup" className="hover:text-amber-400 transition font-medium text-amber-400">Create account</Link>
              <Link to="/dashboard" className="hover:text-amber-400 transition">Map</Link>
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