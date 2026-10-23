export default function KeyadiLogo({ size = 36, className = "", alt = "Keyadi Logo" }) {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#0c0b09',
        border: '1px solid rgba(232, 163, 61, 0.35)',
        boxShadow: '0 0 14px rgba(232, 163, 61, 0.22)',
      }}
    >
      <img
        src="/keyadi-logo.png"
        alt={alt}
        className="h-full w-full rounded-full object-contain p-[1px] select-none"
        loading="eager"
        draggable="false"
      />
    </div>
  )
}
