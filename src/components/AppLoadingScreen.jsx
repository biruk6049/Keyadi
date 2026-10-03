import KeyadiLogo from './KeyadiLogo'

export default function AppLoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{
        backgroundColor: '#0e0d0b',
        fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Ambient Amber Glow behind Logo */}
        <div
          className="absolute -inset-4 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none"
          style={{ backgroundColor: '#e8a33d' }}
        />

        {/* Branded Logo */}
        <div className="relative z-10 transition-transform duration-500 hover:scale-105">
          <KeyadiLogo size={72} />
        </div>

        {/* Title */}
        <h1
          className="relative z-10 mt-5 text-2xl font-bold tracking-tight text-[#f3f1ec]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Keyadi
        </h1>

        <p className="relative z-10 mt-1 text-xs font-medium tracking-widest uppercase text-white/40">
          Geospatial Intelligence
        </p>

        {/* Premium glowing progress bar */}
        <div className="relative z-10 mt-8 w-44 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full animate-[keyadi-loader_1.4s_ease-in-out_infinite]"
            style={{
              backgroundColor: '#e8a33d',
              boxShadow: '0 0 12px #e8a33d',
              width: '45%',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes keyadi-loader {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(120%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  )
}
