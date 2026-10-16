import { motion } from 'framer-motion'
import { useSettings } from '../context/SettingsContext'
import { SunIcon, MoonIcon } from './Icons'

/**
 * Premium Interactive Theme Toggle Switch
 * 
 * - Smooth sliding pill animation with Framer Motion spring physics
 * - 360° rotational micro-interaction on icon change
 * - Strict No-Emoji policy: Uses clean, precision-crafted vector SVG icons
 * - Self-contained: reads and updates theme from SettingsContext automatically
 *   while also accepting explicit `isDark` and `onToggle` props if provided.
 */
export default function ThemeToggle({
  isDark: propIsDark,
  onToggle: propOnToggle,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabels = false,
}) {
  const context = useSettings()
  const isDark = propIsDark !== undefined ? propIsDark : context.isDark
  const onToggle = propOnToggle || context.toggleDarkMode

  const dimensions = {
    sm: { trackW: 'w-12', trackH: 'h-6', thumb: 'h-5 w-5', iconSize: 11, pad: 'p-0.5' },
    md: { trackW: 'w-14', trackH: 'h-7', thumb: 'h-6 w-6', iconSize: 13, pad: 'p-0.5' },
    lg: { trackW: 'w-16', trackH: 'h-8', thumb: 'h-7 w-7', iconSize: 15, pad: 'p-1' },
  }[size] || dimensions?.md

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={onToggle}
      className={`group relative flex items-center justify-between rounded-full border transition-all duration-300 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${dimensions.trackW} ${dimensions.trackH} ${dimensions.pad} ${className}`}
      style={{
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        borderColor: isDark ? 'rgba(243, 241, 236, 0.16)' : 'rgba(16, 14, 11, 0.14)',
        boxShadow: isDark
          ? 'inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 255, 255, 0.03)'
          : 'inset 0 1px 3px rgba(0, 0, 0, 0.08), 0 0 12px rgba(232, 163, 61, 0.08)',
      }}
    >
      {/* Background icon indicator: Sun (left) */}
      <div className="absolute left-1.5 flex items-center justify-center pointer-events-none transition-opacity duration-200" style={{ opacity: isDark ? 0.35 : 0 }}>
        <SunIcon size={dimensions.iconSize} color="#f59e0b" />
      </div>

      {/* Background icon indicator: Moon (right) */}
      <div className="absolute right-1.5 flex items-center justify-center pointer-events-none transition-opacity duration-200" style={{ opacity: isDark ? 0 : 0.35 }}>
        <MoonIcon size={dimensions.iconSize} color="#6366f1" />
      </div>

      {/* Animated Sliding Thumb */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 520,
          damping: 28,
          mass: 0.6,
        }}
        className={`relative flex items-center justify-center rounded-full shadow-md ${dimensions.thumb}`}
        style={{
          marginLeft: isDark ? 'auto' : '0',
          marginRight: isDark ? '0' : 'auto',
          backgroundColor: isDark ? '#1a1815' : '#ffffff',
          border: isDark ? '1px solid rgba(243, 241, 236, 0.2)' : '1px solid rgba(16, 14, 11, 0.12)',
          boxShadow: isDark
            ? '0 2px 6px rgba(0, 0, 0, 0.6), 0 0 10px rgba(99, 102, 241, 0.25)'
            : '0 2px 6px rgba(0, 0, 0, 0.12), 0 0 10px rgba(232, 163, 61, 0.25)',
        }}
      >
        {/* Rotating Vector Icon inside Thumb */}
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: isDark ? -140 : 140, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: isDark ? 140 : -140, scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <MoonIcon size={dimensions.iconSize} color="#a5b4fc" />
          ) : (
            <SunIcon size={dimensions.iconSize} color="#d97706" />
          )}
        </motion.div>
      </motion.div>

      {showLabels && (
        <span className="sr-only">
          {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
        </span>
      )}
    </button>
  )
}