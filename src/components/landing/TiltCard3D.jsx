import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * TiltCard3D
 * Provides true 3D spatial tilt effect on mouse hover with spring physics,
 * dynamic specular reflection sheen, and depth layer support for nested elements.
 */
export default function TiltCard3D({
  children,
  className = '',
  style = {},
  maxTilt = 12,
  glare = true,
  onClick,
}) {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  // Motion values for normalized cursor coordinates (-0.5 to 0.5)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth springs for buttery tilt response
  const springConfig = { damping: 20, stiffness: 180, mass: 0.6 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  // Transform to 3D rotation degrees
  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTilt, -maxTilt])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTilt, maxTilt])

  // Specular sheen light coordinates (0% to 100%)
  const glareX = useTransform(springX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(springY, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top
    const normX = clientX / rect.width - 0.5
    const normY = clientY / rect.height - 0.5
    x.set(normX)
    y.set(normY)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={`relative [perspective:1200px] transition-shadow duration-300 ${className}`}
    >
      {/* Specular glare overlay */}
      {glare && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 rounded-3xl opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255, 255, 255, 0.45) 0%, rgba(232, 163, 61, 0.15) 30%, transparent 70%)`,
          }}
        />
      )}

      {/* Child elements rendered with 3D preservation */}
      <div className="h-full w-full [transform-style:preserve-3d]">
        {children}
      </div>
    </motion.div>
  )
}
