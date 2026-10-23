import React from 'react'

/**
 * KeyadiWordmark - Official custom typography wordmark
 * Renders the brand wordmark with high-resolution scaling and theme adaptation
 */
export default function KeyadiWordmark({
  height = 24,
  className = "",
  alt = "Keyadi",
}) {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/keyadi-wordmark.png"
        alt={alt}
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
        }}
        className="filter drop-shadow-[0_0_12px_rgba(232,163,61,0.22)] transition-transform duration-200"
        loading="eager"
        draggable="false"
      />
    </div>
  )
}
