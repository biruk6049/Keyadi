export default function AuraBackground({ isDark }) {
    const beamBlend = isDark ? 'screen' : 'multiply'

    return (
        <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
        >
            {/* Layer 1 - radial teal glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(55.8% 55.49% at 50% 100%, rgb(38, 77, 76) 0%, rgba(25, 48, 47, 0) 100%)',
                    mixBlendMode: beamBlend,
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
                    opacity: 0.9,
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                }}
            />
            {/* Layer 3 - vignette */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at 100% 100%, #ffffff 20%, #0a0a0a 80%)',
                    mixBlendMode: 'multiply',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                }}
            />
            {/* Grain overlay */}
            <div
                style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.85 }}
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