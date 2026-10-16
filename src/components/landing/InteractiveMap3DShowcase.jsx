import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SparklesIcon, MapPinIcon, ArrowRightIcon, StarIcon } from '../Icons'

/**
 * InteractiveMap3DShowcase
 * A breathtaking 3D perspective interactive showcase featuring:
 * - Dynamic 3D isometric tilt with scroll and hover leveling
 * - Real-time multimodal route switcher (Driving, Walking, Cycling)
 * - Animated laser road curves with glowing pulses
 * - Elevated 3D coordinate pins with radar wave ripples
 * - Floating glassmorphic telemetry cards with stereoscopic Z-depth
 */
export default function InteractiveMap3DShowcase({ user, isDark = true }) {
  const [activeMode, setActiveMode] = useState('drive') // 'drive' | 'walk' | 'cycle'
  const [hoveredPin, setHoveredPin] = useState(null)

  const MODES = {
    drive: {
      label: 'Driving',
      time: '7 mins',
      dist: '3.2 km',
      speed: '34 km/h avg',
      color: '#e8a33d',
      bgGlow: 'rgba(232, 163, 61, 0.25)',
      badgeBg: 'rgba(232, 163, 61, 0.15)',
      textColor: 'text-amber-400',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      ),
      pathD: 'M 170,330 Q 280,310 390,240 T 630,170',
    },
    walk: {
      label: 'Walking',
      time: '22 mins',
      dist: '2.1 km',
      speed: '4.8 km/h',
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.25)',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      textColor: 'text-sky-400',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M13 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M7 21l3-6 2 3 4-1" />
          <path d="M11 12l2-3 3 2 2-4" />
          <path d="M9 12l-3 4-3-1" />
        </svg>
      ),
      pathD: 'M 170,330 C 230,280 290,290 390,240 S 550,220 630,170',
    },
    cycle: {
      label: 'Cycling',
      time: '11 mins',
      dist: '2.8 km',
      speed: '16.5 km/h',
      color: '#2dd4bf',
      bgGlow: 'rgba(45, 212, 191, 0.25)',
      badgeBg: 'rgba(45, 212, 191, 0.15)',
      textColor: 'text-teal-400',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
          <path d="M12 17.5V14l-3-3 4-3 2 3h3" />
        </svg>
      ),
      pathD: 'M 170,330 Q 310,340 430,220 T 630,170',
    },
  }

  const current = MODES[activeMode]

  return (
    <div className="relative mx-auto w-full max-w-5xl [perspective:1400px]">
      {/* Dynamic 3D tilt stage */}
      <motion.div
        initial={{ rotateX: 14, rotateY: -3, scale: 0.96 }}
        whileHover={{ rotateX: 2, rotateY: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 120 }}
        className="relative overflow-hidden rounded-[2.5rem] border shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-3xl [transform-style:preserve-3d] transition-all"
        style={{
          backgroundColor: isDark ? 'rgba(15, 13, 11, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(232, 163, 61, 0.28)',
          minHeight: '520px',
        }}
      >
        {/* Holographic grid and depth aura */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 bg-[radial-gradient(#e8a33d_1.2px,transparent_1.2px)] [background-size:28px_28px]"
        />

        {/* Ambient radial lighting focused on route */}
        <motion.div
          animate={{
            background: `radial-gradient(circle at 50% 45%, ${current.bgGlow} 0%, transparent 65%)`,
          }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* ── Top Floating HUD: Multi-modal Route Switcher ── */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 border-b border-white/10 [transform:translateZ(35px)]">
          {/* Active Route Summary */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg border"
              style={{
                backgroundColor: current.badgeBg,
                borderColor: current.color + '66',
                color: current.color,
              }}
            >
              {current.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Live Route Preview
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">LIVE</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-extrabold text-white">Bole Atlas</span>
                <ArrowRightIcon size={12} color="#e8a33d" />
                <span className="text-base font-extrabold text-white">Tomoca Roastery</span>
              </div>
            </div>
          </div>

          {/* Interactive Mode Pills */}
          <div className="flex items-center gap-1.5 rounded-full bg-black/50 p-1.5 border border-white/10 backdrop-blur-xl">
            {Object.entries(MODES).map(([key, mode]) => {
              const isSelected = activeMode === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveMode(key)}
                  className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${
                    isSelected ? 'text-black shadow-lg scale-105' : 'text-white/60 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isSelected ? mode.color : 'transparent',
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeModeIndicator"
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: mode.color }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                  )}
                  <span className="relative z-10">{mode.icon}</span>
                  <span className="relative z-10">{mode.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Main 3D Cartographic Stage & SVG Routes ── */}
        <div className="relative h-[380px] w-full [transform-style:preserve-3d]">
          {/* Cartographic SVG Street Network */}
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 800 400"
          >
            <defs>
              <filter id="neon-glow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="8" result="blur1" />
                <feGaussianBlur stdDeviation="3" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background street cartography grid */}
            <path d="M 0,160 L 800,190" stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" />
            <path d="M 0,280 L 800,250" stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
            <path d="M 280,0 L 320,400" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
            <path d="M 540,0 L 490,400" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
            <path d="M 100,400 Q 300,240 750,80" stroke="rgba(255,255,255,0.04)" strokeWidth="6" fill="none" />

            {/* Glowing active route baseline */}
            <motion.path
              d={current.pathD}
              stroke={current.color}
              strokeWidth="9"
              strokeOpacity="0.4"
              fill="none"
              filter="url(#neon-glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* Pulsing Dash Vector Overlay */}
            <motion.path
              d={current.pathD}
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="12 12"
              fill="none"
              animate={{
                strokeDashoffset: [0, -48],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>

          {/* ── 3D Floating Pin: Origin (Bole Atlas) ── */}
          <div
            className="absolute top-[68%] left-[21%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer [transform:translateZ(45px)]"
            onMouseEnter={() => setHoveredPin('origin')}
            onMouseLeave={() => setHoveredPin(null)}
          >
            <motion.div
              whileHover={{ scale: 1.1, y: -4 }}
              className="rounded-2xl px-3 py-1.5 shadow-xl text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 mb-2 bg-[#12100d]/90"
              style={{ borderColor: '#e8a33d', color: '#e8a33d' }}
            >
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>Origin · Bole</span>
            </motion.div>

            {/* Radar Wave Marker */}
            <div className="relative flex items-center justify-center">
              <span className="absolute h-10 w-10 rounded-full bg-amber-500/20 border border-amber-400/50 animate-ping" />
              <div className="h-5 w-5 rounded-full border-2 border-white shadow-2xl flex items-center justify-center bg-amber-500">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* ── 3D Floating Pin: Destination (Tomoca Roastery) ── */}
          <div
            className="absolute top-[32%] right-[18%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer [transform:translateZ(50px)]"
            onMouseEnter={() => setHoveredPin('dest')}
            onMouseLeave={() => setHoveredPin(null)}
          >
            <motion.div
              whileHover={{ scale: 1.1, y: -4 }}
              className="rounded-2xl px-3 py-1.5 shadow-xl text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 mb-2 bg-[#12100d]/90"
              style={{ borderColor: current.color, color: current.color }}
            >
              <SparklesIcon size={12} color={current.color} />
              <span>Tomoca Specialty Roastery</span>
            </motion.div>

            {/* Radar Wave Marker */}
            <div className="relative flex items-center justify-center">
              <span
                className="absolute h-10 w-10 rounded-full border animate-ping"
                style={{ backgroundColor: current.bgGlow, borderColor: current.color }}
              />
              <div
                className="h-5 w-5 rounded-full border-2 border-white shadow-2xl flex items-center justify-center"
                style={{ backgroundColor: current.color }}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* ── Holographic Floating Telemetry Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-7 sm:w-96 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl border [transform:translateZ(60px)] transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'rgba(18, 15, 12, 0.88)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${current.bgGlow}`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 mb-1">
                  <SparklesIcon size={12} color="#e8a33d" />
                  <span>Verified — Real Place, Real Reviews</span>
                </div>
                <h4 className="text-base font-extrabold text-white">
                  Tomoca Specialty Roastery
                </h4>
                <p className="text-xs text-white/60 mt-0.5">
                  Wabi Shebelle Zone · Artisan Espresso, Outdoor Patio & Fast Wi-Fi
                </p>
              </div>
              <div
                className="flex items-center gap-1 px-2.5 py-1.5 shrink-0 rounded-2xl text-xs font-bold border"
                style={{
                  backgroundColor: 'rgba(232, 163, 61, 0.16)',
                  color: '#e8a33d',
                  borderColor: 'rgba(232, 163, 61, 0.4)',
                }}
              >
                <StarIcon size={12} color="#e8a33d" fill="#e8a33d" />
                <span>4.9</span>
              </div>
            </div>

            {/* Real-time Telemetry Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
              <div
                className="rounded-2xl p-2.5 text-center transition-all border"
                style={{
                  backgroundColor: activeMode === 'drive' ? 'rgba(232, 163, 61, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: activeMode === 'drive' ? '#e8a33d' : 'transparent',
                }}
              >
                <div className="text-[10px] uppercase font-bold text-amber-400">Drive</div>
                <div className="text-sm font-extrabold text-white mt-0.5">7 mins</div>
                <div className="text-[10px] text-white/50">3.2 km</div>
              </div>

              <div
                className="rounded-2xl p-2.5 text-center transition-all border"
                style={{
                  backgroundColor: activeMode === 'walk' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: activeMode === 'walk' ? '#38bdf8' : 'transparent',
                }}
              >
                <div className="text-[10px] uppercase font-bold text-sky-400">Walk</div>
                <div className="text-sm font-extrabold text-white mt-0.5">22 mins</div>
                <div className="text-[10px] text-white/50">2.1 km</div>
              </div>

              <div
                className="rounded-2xl p-2.5 text-center transition-all border"
                style={{
                  backgroundColor: activeMode === 'cycle' ? 'rgba(45, 212, 191, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: activeMode === 'cycle' ? '#2dd4bf' : 'transparent',
                }}
              >
                <div className="text-[10px] uppercase font-bold text-teal-400">Cycle</div>
                <div className="text-sm font-extrabold text-white mt-0.5">11 mins</div>
                <div className="text-[10px] text-white/50">2.8 km</div>
              </div>
            </div>

            {/* Bottom Status & CTA */}
            <div className="mt-3.5 flex items-center justify-between text-[11px] text-white/50 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-semibold">Open Now</span> · Closes 10:00 PM
              </span>
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
              >
                <span>Launch Live Route</span>
                <span>→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
