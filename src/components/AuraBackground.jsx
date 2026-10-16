export default function AuraBackground({ isDark = true }) {
    const beamBlend = isDark ? 'screen' : 'multiply'

    return (
        <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
        >
            {/* Layer 1 - radial teal/amber glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: isDark
                        ? 'radial-gradient(55.8% 55.49% at 50% 100%, rgb(38, 77, 76) 0%, rgba(25, 48, 47, 0) 100%)'
                        : 'radial-gradient(70% 60% at 50% 0%, rgba(232, 163, 61, 0.12) 0%, rgba(45, 212, 191, 0.06) 50%, rgba(250, 249, 246, 0) 100%)',
                    mixBlendMode: isDark ? 'screen' : 'normal',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                }}
            />
            {/* Layer 2 - blurred banded beams */}
            <div
                className="aura-layer-2"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `
            repeating-linear-gradient(
              100deg,
              #262626 0%,
              #262626 3%,
              rgba(38, 38, 38, 0.7) 5%,
              rgba(38, 38, 38, 0.7) 7%,
              transparent 10%,
              transparent 12%,
              rgba(38, 38, 38, 0.7) 14%,
              #262626 16%
            ),
            repeating-linear-gradient(
              100deg,
              #9ca3af 0%,
              #9ca3af 1.5%,
              rgba(156, 163, 175, 0.8) 2%,
              #6b7280 3%,
              #6b7280 4%,
              rgba(156, 163, 175, 0.8) 4.5%,
              #9ca3af 5%
            )
          `,
                    backgroundSize: '300% 200%',
                    mixBlendMode: beamBlend,
                    opacity: isDark ? 0.9 : 0.15,
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                }}
            />
            {/* Layer 3 - vignette */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: isDark
                        ? 'radial-gradient(ellipse at 100% 100%, #ffffff 20%, #0a0a0a 80%)'
                        : 'radial-gradient(ellipse at 100% 100%, #ffffff 60%, rgba(235, 230, 220, 0.45) 100%)',
                    mixBlendMode: isDark ? 'multiply' : 'normal',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                }}
            />
            {/* Grain overlay */}
            <div
                style={{ position: 'absolute', inset: 0, mixBlendMode: isDark ? 'overlay' : 'soft-light', opacity: isDark ? 0.85 : 0.25 }}
            >
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <filter id="keyadi-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
                        <feColorMatrix
                            type="matrix"
                            values="0.181 0.608 0.061 0 0.075
                      0.181 0.608 0.061 0 0.075
                      0.181 0.608 0.061 0 0.075
                      0     0     0     1 0"
                        />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#keyadi-grain)" />
                </svg>
            </div>
        </div>
    )
}