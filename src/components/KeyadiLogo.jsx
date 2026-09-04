export default function KeyadiLogo({ size = 36, className = "", alt = "Keyadi Logo" }) {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#0c0b09',
        border: '1.5px solid rgba(232, 163, 61, 0.45)',
        boxShadow: '0 0 16px rgba(232, 163, 61, 0.25)',
      }}
    >
      <img
        src="/keyadi-logo.png"
        alt={alt}
        className="h-full w-full rounded-full object-cover select-none"
        loading="eager"
        draggable="false"
      />
    </div>
  )
}
