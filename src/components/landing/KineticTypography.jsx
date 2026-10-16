import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * KineticTitle
 * Staggers characters or words with 3D perspective flips, dynamic skew,
 * and kinetic spring physics.
 */
export function KineticTitle({ text, className = '', highlightText = '', highlightGradient = '' }) {
  const words = text.split(' ')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: -60,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 14,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.h1
      className={`relative [perspective:1000px] ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => {
        const isHighlight = highlightText && word.toLowerCase().includes(highlightText.toLowerCase())
        return (
          <motion.span
            key={i}
            variants={wordVariants}
            className={`inline-block mr-[0.28em] [transform-style:preserve-3d] transition-transform hover:scale-105 ${
              isHighlight
                ? highlightGradient || 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent'
                : ''
            }`}
          >
            {word}
          </motion.span>
        )
      })}
    </motion.h1>
  )
}

/**
 * KineticWordRotator
 * 3D cylindrical flip animation that smoothly cycles phrases with
 * kinetic motion, glowing metallic gradient, and dynamic depth.
 */
export function KineticWordRotator({
  words = ['Smart Directions', 'Hyperlocal Precision', 'Multimodal Routing', 'Zero Hallucinations'],
  interval = 2800,
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, interval)
    return () => clearInterval(timer)
  }, [words.length, interval])

  return (
    <span className="relative inline-flex items-center overflow-visible [perspective:800px] h-[1.25em] align-middle">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{
            opacity: 0,
            y: 35,
            rotateX: -85,
            scale: 0.9,
            filter: 'blur(6px)',
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            filter: 'blur(0px)',
          }}
          exit={{
            opacity: 0,
            y: -35,
            rotateX: 85,
            scale: 0.9,
            filter: 'blur(6px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 140,
            damping: 16,
            mass: 0.8,
          }}
          className="inline-block [transform-style:preserve-3d] bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-extrabold"
          style={{
            textShadow: '0 0 35px rgba(232, 163, 61, 0.45)',
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/**
 * KineticBadge
 * Floating spatial badge with pulsing radar border, glowing micro-flare,
 * and kinetic entrance.
 */
export function KineticBadge({ children, icon: Icon, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: -15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 15, stiffness: 120 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-2xl cursor-default select-none border shadow-lg"
      style={{
        backgroundColor: 'rgba(232, 163, 61, 0.12)',
        borderColor: 'rgba(232, 163, 61, 0.35)',
        color: '#e8a33d',
        boxShadow: '0 0 25px rgba(232, 163, 61, 0.18)',
      }}
    >
      {/* Ambient glowing beam */}
      <span
        className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-600/20 opacity-75 blur-sm transition-opacity group-hover:opacity-100 animate-pulse"
        aria-hidden="true"
      />
      
      {/* Icon with spin/bounce on hover */}
      {Icon && (
        <span className="relative z-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
          <Icon size={14} color="#e8a33d" />
        </span>
      )}
      
      <span className="relative z-10 tracking-wider uppercase text-[11px] font-bold">
        {children}
      </span>
      
      {/* Floating active dot */}
      <span className="relative z-10 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
    </motion.div>
  )
}

/**
 * ScrollRevealHeading
 * Section header that dynamically expands letter-spacing and sweeps an illuminated
 * specular light sheen when entering view.
 */
export function ScrollRevealHeading({ tag, title, subtitle, align = 'center' }) {
  const isCenter = align === 'center'
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-2xl ${isCenter ? 'mx-auto text-center' : ''}`}
    >
      {tag && (
        <motion.span
          initial={{ opacity: 0, letterSpacing: '0.1em' }}
          whileInView={{ opacity: 1, letterSpacing: '0.22em' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="inline-block text-xs font-extrabold uppercase mb-2.5 text-amber-500 dark:text-amber-400 tracking-widest"
        >
          {tag}
        </motion.span>
      )}

      <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-[#f3f1ec] leading-tight transition-colors">
        {title}
      </h3>

      {subtitle && (
        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-[#f3f1ec]/65 leading-relaxed transition-colors">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
