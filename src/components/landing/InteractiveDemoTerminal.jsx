import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SearchIcon, SparklesIcon, MapPinIcon, StarIcon } from '../Icons'
import TiltCard3D from './TiltCard3D'

const SAMPLE_QUERIES = [
  {
    title: 'Quiet Cafes & Coffee',
    query: 'Quiet specialty roastery with fast wifi and outdoor patio',
    time: '180ms',
    count: 14,
    center: 'Addis Ababa · Bole',
    overpassTag: 'amenity=cafe, internet_access=wlan',
    matches: [
      { name: 'Tomoca Specialty Coffee', area: 'Bole Atlas', rating: '4.9', drive: '7m' },
      { name: 'Alem Bunna Roastery', area: 'Kazanchis', rating: '4.8', drive: '12m' },
      { name: 'Mokarico Artisan Lab', area: 'Old Airport', rating: '4.7', drive: '15m' },
    ],
  },
  {
    title: '24/7 Emergency Medical',
    query: 'Emergency pharmacy open right now with delivery',
    time: '210ms',
    count: 8,
    center: 'Addis Ababa · Central',
    overpassTag: 'amenity=pharmacy, opening_hours=24/7',
    matches: [
      { name: 'Lion International Pharmacy', area: 'Piazza', rating: '4.9', drive: '5m' },
      { name: 'Red Cross Emergency Clinic', area: 'Mexico Sq', rating: '4.8', drive: '9m' },
      { name: 'Bole Medhanealem Care', area: 'Bole Medhanealem', rating: '4.9', drive: '11m' },
    ],
  },
  {
    title: 'EV Charging & Fuel',
    query: 'Fast DC electric vehicle charging and fuel station nearby',
    time: '150ms',
    count: 11,
    center: 'Addis Ababa · Ring Road',
    overpassTag: 'amenity=charging_station, socket:type2=yes',
    matches: [
      { name: 'TotalEnergies HyperCharge DC', area: 'Gotera Interchange', rating: '4.8', drive: '6m' },
      { name: 'NOC Fast EV Hub', area: 'Bole Ring Rd', rating: '4.7', drive: '8m' },
      { name: 'OilLibya SuperStation', area: 'Gerji Imperial', rating: '4.6', drive: '14m' },
    ],
  },
]

export default function InteractiveDemoTerminal({ isDark = true, user }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [typedQuery, setTypedQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const current = SAMPLE_QUERIES[selectedIdx]
  const ink = isDark ? '#ffffff' : '#100e0b'
  const inkMuted = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(16,14,11,0.65)'
  const borderLine = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(16,14,11,0.08)'
  const terminalBg = isDark ? 'rgba(16, 14, 11, 0.90)' : 'rgba(255, 255, 255, 0.94)'
  const inputBarBg = isDark ? 'rgba(0, 0, 0, 0.60)' : 'rgba(245, 243, 238, 0.95)'
  const cardItemBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'

  useEffect(() => {
    setIsTyping(true)
    setTypedQuery('')
    let charIndex = 0
    const fullText = current.query
    const interval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setTypedQuery(fullText.slice(0, charIndex))
        charIndex++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 28)
    return () => clearInterval(interval)
  }, [selectedIdx, current.query])

  return (
    <div className="relative mx-auto w-full max-w-5xl [perspective:1200px]">
      <TiltCard3D maxTilt={7} className="rounded-3xl">
        <div
          className="relative overflow-hidden rounded-3xl border p-6 sm:p-10 shadow-2xl backdrop-blur-3xl [transform-style:preserve-3d]"
          style={{
            backgroundColor: terminalBg,
            borderColor: 'rgba(232, 163, 61, 0.28)',
          }}
        >
          {/* Ambient corner flares */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          {/* Terminal Header */}
          <div
            className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b pb-6 [transform:translateZ(25px)]"
            style={{ borderColor: borderLine }}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block shadow-sm" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block shadow-sm" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block shadow-sm" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: inkMuted }}>
                Keyadi · Smart Place Search
              </span>
            </div>

            {/* Query Preset Tabs */}
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((q, idx) => (
                <button
                  key={q.title}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border ${
                    selectedIdx === idx
                      ? 'bg-amber-400 text-black shadow-lg scale-105 border-amber-400'
                      : 'hover:border-amber-400/50'
                  }`}
                  style={{
                    backgroundColor: selectedIdx === idx ? '#e8a33d' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                    color: selectedIdx === idx ? '#100e0b' : inkMuted,
                    borderColor: selectedIdx === idx ? '#e8a33d' : borderLine,
                  }}
                >
                  {q.title}
                </button>
              ))}
            </div>
          </div>

          {/* Natural Query Input Bar */}
          <div className="relative z-10 mt-6 [transform:translateZ(30px)]">
            <div
              className="relative flex items-center rounded-2xl border border-amber-500/35 px-4 py-3.5 shadow-inner"
              style={{ backgroundColor: inputBarBg }}
            >
              <SearchIcon size={18} color="#e8a33d" className="mr-3 shrink-0" />
              <div className="text-sm sm:text-base font-mono font-medium flex-1 truncate" style={{ color: ink }}>
                {typedQuery}
                <span className="ml-1 inline-block h-4 w-2 bg-amber-400 animate-pulse align-middle" />
              </div>
              <span className="text-[11px] font-mono text-amber-500 dark:text-amber-400/80 shrink-0 hidden sm:inline-block font-semibold">
                SEARCH READY
              </span>
            </div>
          </div>

          {/* Quick stats — human-friendly, no technical jargon */}
          <div className="relative z-10 mt-5 flex flex-wrap items-center gap-3 text-xs [transform:translateZ(30px)]">
            <div className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 border border-emerald-500/25 bg-emerald-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-500 dark:text-emerald-400 font-semibold">Found {current.count} places nearby</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 border border-sky-500/25 bg-sky-500/10">
              <MapPinIcon size={12} color="#38bdf8" />
              <span className="text-sky-500 dark:text-sky-400 font-semibold">{current.center}</span>
            </div>
          </div>

          {/* Synthesized Live POI Results Cards */}
          <div className="relative z-10 mt-6 grid sm:grid-cols-3 gap-3 [transform:translateZ(40px)]">
            {current.matches.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl p-4 border transition-all hover:border-amber-500/50 hover:scale-[1.02]"
                style={{
                  backgroundColor: cardItemBg,
                  borderColor: borderLine,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-sm font-bold group-hover:text-amber-500 transition-colors" style={{ color: ink }}>
                    {item.name}
                  </h5>
                  <span className="text-xs font-bold text-amber-500 dark:text-amber-400 shrink-0 flex items-center gap-1">
                    <StarIcon size={11} color="#f59e0b" fill="#f59e0b" />
                    <span>{item.rating}</span>
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs" style={{ color: inkMuted }}>
                  <span className="flex items-center gap-1">
                    <MapPinIcon size={12} color="#e8a33d" />
                    <span>{item.area}</span>
                  </span>
                  <span className="font-semibold text-emerald-500 dark:text-emerald-400">{item.drive} drive</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Footer */}
          <div
            className="relative z-10 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6 [transform:translateZ(25px)]"
            style={{ borderColor: borderLine }}
          >
            <span className="text-xs text-center sm:text-left" style={{ color: inkMuted }}>
              Every result is sourced from real, community-verified map data — no guesses, no outdated listings.
            </span>
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold shadow-xl transition-all hover:scale-105"
              style={{
                backgroundColor: '#e8a33d',
                color: '#100e0b',
                boxShadow: '0 4px 20px rgba(232, 163, 61, 0.35)',
              }}
            >
              <span>{user ? 'Open Live Console' : 'Launch Full Interactive Map'}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </TiltCard3D>
    </div>
  )
}
